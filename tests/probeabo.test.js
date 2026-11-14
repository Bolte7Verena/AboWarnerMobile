/**
 * probeabo.test.js | Probeabo / Testzeitraum (ab 2.0.2).
 * Lauf: npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Calculator, istProbezeitLaufend, ermittleHandlungsDatum, ermittleFristStatus, schlageVertragsendeVor, formatiereDatumISO } from '../src/calculator.js';
import { berechneBenachrichtigungsPlan, ermittleAbosImRotenBereich } from '../src/benachrichtigungsplan.js';
import { normalisiereAbo } from '../src/sicherung.js';
import { erzeugeZeile } from '../src/uebersicht-pdf.js';
import { setzeSprache } from '../src/i18n.js';

const ISO = formatiereDatumISO;
function plusTage(n) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + n);
    return d;
}
const BASIS = { id: 'p', name: 'StreamPlus', kosten: 9.99, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Streaming', kuendigungsfristTage: 0 };

test('Probezeit läuft bis einschließlich Enddatum, nicht bei gekündigten Abos', () => {
    assert.equal(istProbezeitLaufend({ ...BASIS, probeabo: true, probeEndeAm: ISO(plusTage(0)) }), true);
    assert.equal(istProbezeitLaufend({ ...BASIS, probeabo: true, probeEndeAm: ISO(plusTage(-1)) }), false);
    assert.equal(istProbezeitLaufend({ ...BASIS, probeabo: true, probeEndeAm: ISO(plusTage(5)), gekuendigt: true }), false);
    assert.equal(istProbezeitLaufend({ ...BASIS, probeEndeAm: ISO(plusTage(5)) }), false, 'ohne Schalter');
});

test('Handlungsdatum: Ende der Probezeit, danach wieder die Kündigungsfrist', () => {
    const abo = { ...BASIS, probeabo: true, probeEndeAm: ISO(plusTage(10)), naechsteZahlung: ISO(plusTage(11)) };
    assert.deepEqual(ermittleHandlungsDatum(abo), { art: 'probe', datum: plusTage(10) });
    const vorbei = { ...abo, probeEndeAm: ISO(plusTage(-2)), naechsteZahlung: ISO(plusTage(28)) };
    assert.equal(ermittleHandlungsDatum(vorbei).art, 'frist');
});

test('Farbe richtet sich nach dem Ende der Probezeit', () => {
    const abo = (tage) => ({ ...BASIS, probeabo: true, probeEndeAm: ISO(plusTage(tage)), naechsteZahlung: ISO(plusTage(tage + 1)), kuendigungsfristTage: 0 });
    assert.equal(ermittleFristStatus(abo(3)), 'kritisch');
    assert.equal(ermittleFristStatus(abo(20)), 'warnung');
    assert.equal(ermittleFristStatus(abo(45)), 'sicher');
});

test('Mitteilung 3 Tage vor Ende der Probezeit, 9:00 Uhr, mit Text', () => {
    setzeSprache('de');
    const ende = plusTage(14);
    const abo = { ...BASIS, probeabo: true, probeEndeAm: ISO(ende), naechsteZahlung: ISO(plusTage(15)) };
    const plan = berechneBenachrichtigungsPlan([abo]);
    const probe = plan.find((n) => n.title === 'Probezeit endet bald');
    assert.ok(probe, JSON.stringify(plan));
    const erwartet = new Date(ende);
    erwartet.setDate(erwartet.getDate() - 3);
    erwartet.setHours(9, 0, 0, 0);
    assert.equal(probe.at.getTime(), erwartet.getTime());
    const datum = `${String(ende.getDate()).padStart(2, '0')}.${String(ende.getMonth() + 1).padStart(2, '0')}.${ende.getFullYear()}`;
    assert.equal(probe.body, `StreamPlus: Probezeit endet am ${datum} – jetzt kündigen, sonst wird es kostenpflichtig.`);
    // Fristerinnerungen erst für Fristen nach der Probezeit
    for (const n of plan.filter((x) => x !== probe)) {
        const fristDatum = new Date(n.at);
        fristDatum.setDate(fristDatum.getDate() + 7);
        assert.ok(fristDatum > ende, `Frist vor Probeende: ${n.body}`);
    }
});

test('Mitteilung auf Englisch', () => {
    setzeSprache('en');
    const abo = { ...BASIS, probeabo: true, probeEndeAm: '2099-03-10', naechsteZahlung: '2099-03-11' };
    const probe = berechneBenachrichtigungsPlan([abo]).find((n) => n.title === 'Trial ending soon');
    assert.match(probe.body, /^StreamPlus: your trial ends on .*2099.* – cancel now, otherwise you will be charged\.$/);
    setzeSprache('de');
});

test('Keine Probe-Mitteilung, wenn sie schon vorbei wäre oder das Abo gekündigt ist', () => {
    const knapp = { ...BASIS, probeabo: true, probeEndeAm: ISO(plusTage(1)), naechsteZahlung: ISO(plusTage(2)) };
    assert.equal(berechneBenachrichtigungsPlan([knapp]).filter((n) => n.title === 'Probezeit endet bald').length, 0);
    const gekuendigt = { ...knapp, probeEndeAm: ISO(plusTage(20)), gekuendigt: true, gekuendigtZum: ISO(plusTage(20)) };
    assert.equal(berechneBenachrichtigungsPlan([gekuendigt]).filter((n) => n.title === 'Probezeit endet bald').length, 0);
});

test('Hinweis beim Start: Probeabo im roten Bereich mit art "probe"', () => {
    const abo = { ...BASIS, probeabo: true, probeEndeAm: ISO(plusTage(2)), naechsteZahlung: ISO(plusTage(60)), kuendigungsfristTage: 0 };
    const rot = ermittleAbosImRotenBereich([abo]);
    assert.equal(rot.length, 1);
    assert.equal(rot[0].art, 'probe');
    assert.equal(ISO(rot[0].fristDatum), ISO(plusTage(2)));
});

test('Vorschlag Vertragsende während der Probezeit = Ende der Probezeit', () => {
    const abo = { ...BASIS, probeabo: true, probeEndeAm: ISO(plusTage(9)), naechsteZahlung: ISO(plusTage(10)) };
    assert.equal(ISO(schlageVertragsendeVor(abo)), ISO(plusTage(9)));
});

test('Gültigkeit und Sicherung', () => {
    const abo = { ...BASIS, naechsteZahlung: '2027-01-01' };
    assert.equal(Calculator.istGueltig({ ...abo, probeabo: true, probeEndeAm: '2026-12-31' }), true);
    assert.equal(Calculator.istGueltig({ ...abo, probeabo: true, probeEndeAm: '' }), false, 'Schalter an ohne Datum');
    assert.equal(Calculator.istGueltig({ ...abo, probeabo: undefined, probeEndeAm: undefined }), true);
    const n = normalisiereAbo({ ...abo, probeabo: true, probeEndeAm: '2026-12-31' });
    assert.equal(n.probeabo, true);
    assert.equal(n.probeEndeAm, '2026-12-31');
    const ohne = normalisiereAbo({ ...abo, probeabo: true, probeEndeAm: 'kaputt' });
    assert.equal(ohne.probeabo, undefined);
});

test('PDF-Zeile: Status "Probezeit bis", Spalte "Kündigung bis" = Ende der Probezeit', () => {
    setzeSprache('de');
    const heute = new Date(2026, 10, 14);
    const zeile = erzeugeZeile({ ...BASIS, probeabo: true, probeEndeAm: '2026-11-30', naechsteZahlung: '2026-12-01' }, heute);
    assert.ok(zeile.includes('Probezeit bis 30.11.2026'), JSON.stringify(zeile));
    assert.ok(zeile.includes('30.11.2026'));
});
