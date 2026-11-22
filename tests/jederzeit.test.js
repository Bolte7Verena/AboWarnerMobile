/**
 * jederzeit.test.js | Auswahl "Jederzeit kündbar" und Vertragsende-Vorschlag am
 * Zahlungstag (nie in der Vergangenheit). Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Calculator, FRIST_EINHEITEN, TURNUS_MONATE, ermittleFristAngabe, ermittleFristStatus, ermittleHandlungsDatum, ermittleKuendigungsfrist, ersteZahlungNach, erzeugeFristFelder, formatiereDatumISO as iso, schlageVertragsendeVor } from '../src/calculator.js';
import { ermittleAbosImRotenBereich, berechneBenachrichtigungsPlan } from '../src/benachrichtigungsplan.js';
import { pruefeSicherung } from '../src/sicherung.js';
import { pruefeEingabe } from '../src/pflichtfelder.js';
import { erzeugeZeile } from '../src/uebersicht-pdf.js';
import { PdfDokument } from '../src/pdf.js';
import { SPRACHEN, setzeSprache, t } from '../src/i18n.js';

const stelle = (x, jahr, monat, tag) => { x.mock.timers.reset(); x.mock.timers.enable({ apis: ['Date'], now: new Date(jahr, monat - 1, tag, 12) }); };
const netflix = (naechsteZahlung, mehr = {}) => ({ id: 'n', name: 'Netflix', kosten: 17.99, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Streaming', naechsteZahlung, ...erzeugeFristFelder(NaN, 'jederzeit'), ...mehr });

test('Felder: gültig, Frist 0, Angabe "jederzeit"; zurück auf Tage entfernt die Auswahl', () => {
    const abo = netflix('2027-01-15');
    assert.equal(Calculator.istGueltig(abo), true);
    assert.deepEqual(JSON.parse(JSON.stringify(erzeugeFristFelder(5, 'jederzeit'))), { kuendigungsfristTage: 0, jederzeitKuendbar: true });
    assert.deepEqual(ermittleFristAngabe(abo), { anzahl: 0, einheit: 'jederzeit' });
    for (const einheit of ['tage', 'wochen', 'monate']) {
        const zurueck = JSON.parse(JSON.stringify({ ...abo, ...erzeugeFristFelder(2, einheit) }));
        assert.equal('jederzeitKuendbar' in zurueck, false, einheit);
        assert.deepEqual(ermittleFristAngabe(zurueck), { anzahl: 2, einheit });
    }
    assert.ok(FRIST_EINHEITEN.includes('jederzeit'));
});

test('Nie rot oder gelb, keine Frist, keine Erinnerungen, auch direkt vor und am Zahlungstag', (x) => {
    stelle(x, 2026, 11, 22);
    for (const tag of ['2026-11-22', '2026-11-23', '2026-11-28', '2026-12-31', '2020-01-31', '2024-02-29']) for (const turnus of Object.keys(TURNUS_MONATE)) {
        const abo = netflix(tag, { turnus });
        assert.equal(ermittleFristStatus(abo), 'sicher', tag);
        assert.equal(ermittleKuendigungsfrist(abo), null);
        assert.equal(ermittleHandlungsDatum(abo), null);
        assert.deepEqual(berechneBenachrichtigungsPlan([abo]), []);
        assert.deepEqual(ermittleAbosImRotenBereich([abo]), []);
    }
});

test('Probezeit erinnert weiter und färbt die Karte', (x) => {
    stelle(x, 2026, 11, 22);
    const abo = netflix('2026-12-15', { probeabo: true, probeEndeAm: '2026-11-28' });
    assert.equal(ermittleFristStatus(abo), 'kritisch');
    assert.equal(ermittleHandlungsDatum(abo).art, 'probe');
    const plan = berechneBenachrichtigungsPlan([abo]);
    assert.deepEqual(plan.map((p) => iso(p.at)), ['2026-11-25']);
    assert.equal(iso(schlageVertragsendeVor(abo)), '2026-11-28');
    // nach der Probezeit: keine Fristen
    assert.equal(ermittleFristStatus({ ...abo, probeEndeAm: '2026-11-20' }), 'sicher');
    assert.deepEqual(berechneBenachrichtigungsPlan([{ ...abo, probeEndeAm: '2026-11-20' }]), []);
});

test('Gekündigt: Mitteilung am Vertragsende wie bisher', (x) => {
    stelle(x, 2026, 11, 22);
    assert.deepEqual(berechneBenachrichtigungsPlan([netflix('2026-12-15', { gekuendigt: true, gekuendigtZum: '2026-12-14' })]).map((p) => iso(p.at)), ['2026-12-14']);
});

test('Vertragsende-Vorschlag: Tag vor der ersten Zahlung nach heute, nie in der Vergangenheit', (x) => {
    for (const [heute, zahlung, turnus, soll] of [
        [[2026, 11, 22], '2026-12-15', 'Monatlich', '2026-12-14'], [[2026, 11, 22], '2026-11-23', 'Monatlich', '2026-11-22'], [[2026, 11, 22], '2026-11-22', 'Monatlich', '2026-12-21'],
        [[2026, 11, 22], '2026-11-22', 'Jährlich', '2027-11-21'], [[2026, 12, 31], '2026-12-31', 'Monatlich', '2027-01-30'], [[2027, 1, 31], '2027-01-31', 'Monatlich', '2027-02-27'], [[2028, 1, 31], '2027-01-31', 'Monatlich', '2028-02-28'], [[2028, 2, 29], '2024-02-29', 'Jährlich', '2029-02-27'], [[2026, 10, 25], '2026-10-25', 'Vierteljährlich', '2027-01-24']
    ]) {
        stelle(x, ...heute);
        assert.equal(iso(schlageVertragsendeVor(netflix(zahlung, { turnus }))), soll, `jederzeit ${heute} ${zahlung}`);
    }
});

test('Fehler behoben: Frist 0 und heute Zahlungstag schlug gestern vor', (x) => {
    stelle(x, 2026, 11, 22);
    const abo = { ...netflix('2026-11-22'), ...erzeugeFristFelder(0, 'tage') };
    assert.equal(iso(ermittleKuendigungsfrist(abo).fristDatum), '2026-11-22', 'Frist unverändert');
    assert.equal(iso(schlageVertragsendeVor(abo)), '2026-12-21');
    for (const einheit of ['tage', 'wochen', 'monate']) assert.equal(iso(schlageVertragsendeVor({ ...abo, ...erzeugeFristFelder(0, einheit) })), '2026-12-21', einheit);
    // sonst unverändert
    assert.equal(iso(schlageVertragsendeVor({ ...abo, naechsteZahlung: '2026-11-23' })), '2026-11-22');
    assert.equal(iso(schlageVertragsendeVor({ ...abo, ...erzeugeFristFelder(30, 'tage') })), '2026-12-21');
});

test('Durchlauf über vier Jahre: Vorschlag nie vor heute, nie auf oder nach einer Zahlung, jede Frist und jeder Turnus', (x) => {
    let n = 0;
    for (let d = new Date(2026, 0, 1); d < new Date(2030, 0, 1); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 5)) {
        stelle(x, d.getFullYear(), d.getMonth() + 1, d.getDate());
        for (const start of ['2024-02-29', '2025-01-31', '2025-12-31', iso(d)]) for (const turnus of Object.keys(TURNUS_MONATE)) for (const felder of [erzeugeFristFelder(0, 'jederzeit'), erzeugeFristFelder(0, 'tage'), erzeugeFristFelder(1, 'tage'), erzeugeFristFelder(1, 'monate')]) {
            const abo = { ...netflix(start, { turnus }), ...felder };
            const ende = schlageVertragsendeVor(abo);
            assert.ok(iso(ende) >= iso(d), `${iso(d)} ${start} ${turnus} ${JSON.stringify(felder)} -> ${iso(ende)}`);
            if (felder.jederzeitKuendbar) {
                const zahlung = ersteZahlungNach(abo);
                assert.ok(iso(zahlung) > iso(d) && iso(ende) < iso(zahlung));
            }
            n++;
        }
    }
    assert.ok(n > 15000);
});

test('Sicherung: Auswahl bleibt erhalten, alte Sicherungen unverändert', () => {
    const zurueck = (abo) => pruefeSicherung(JSON.stringify([abo])).abos[0];
    const abo = zurueck(netflix('2027-01-15'));
    assert.equal(abo.jederzeitKuendbar, true);
    assert.equal(abo.kuendigungsfristTage, 0);
    assert.equal('jederzeitKuendbar' in zurueck({ ...netflix('2027-01-15'), jederzeitKuendbar: undefined }), false);
    for (const wert of ['true', 1, 'ja', null, false]) assert.equal('jederzeitKuendbar' in zurueck({ ...netflix('2027-01-15'), jederzeitKuendbar: wert }), false, String(wert));
    const widerspruch = zurueck({ ...netflix('2027-01-15'), kuendigungsfristTage: 90, kuendigungsfristEinheit: 'monate', kuendigungsfristAnzahl: 3 });
    assert.deepEqual([widerspruch.kuendigungsfristTage, widerspruch.kuendigungsfristEinheit], [0, undefined]);
});

test('Eingabe: bei "Jederzeit kündbar" ist keine Zahl nötig, sonst weiterhin', () => {
    const gut = { name: 'N', kosten: '5', kategorie: 'Streaming', naechsteZahlung: '2027-01-15', frist: '', probe: false };
    assert.deepEqual(pruefeEingabe({ ...gut, fristEinheit: 'jederzeit' }), []);
    assert.deepEqual(pruefeEingabe({ ...gut, frist: '999999999', fristEinheit: 'jederzeit' }), []);
    for (const fristEinheit of ['tage', 'wochen', 'monate']) assert.deepEqual(pruefeEingabe({ ...gut, fristEinheit }).map((f) => f.feld), ['frist']);
    assert.deepEqual(pruefeEingabe({ ...gut, fristEinheit: 'jederzeit', probe: true, probeEnde: '' }).map((f) => f.feld), ['probeEnde']);
});

test('PDF und Texte: in allen Sprachen vorhanden, PDF-Spalte wird nicht abgeschnitten', () => {
    const pdf = new PdfDokument();
    for (const s of Object.keys(SPRACHEN)) {
        setzeSprache(s);
        for (const k of ['einheit.jederzeit', 'karte.jederzeit', 'karte.vorZahlung', 'karte.heuteZahlung', 'brief.jederzeitHinweis', 'pdf.jederzeit']) assert.ok(SPRACHEN[s][k], `${s} ${k}`);
        assert.equal(erzeugeZeile(netflix('2027-01-15'))[4], t('pdf.jederzeit'));
        assert.ok(pdf.textBreite(t('pdf.jederzeit'), 9.5) < 98, s);
        assert.ok(SPRACHEN[s]['hilfe.inhalt'].includes(t('einheit.jederzeit')), s);
    }
    setzeSprache('de');
});
