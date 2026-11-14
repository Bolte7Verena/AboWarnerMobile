/**
 * frist-einheit.test.js | Kündigungsfrist in Tagen, Wochen oder Monaten (ab 2.0.2).
 * Lauf: npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { Calculator, ermittleKuendigungsfrist, ermittleFristAngabe, erzeugeFristFelder, minusMonate, formatiereDatumISO } from '../src/calculator.js';
import { normalisiereAbo } from '../src/sicherung.js';
import { setzeSprache, tAnzahl } from '../src/i18n.js';

const ISO = formatiereDatumISO;
const d = (s) => new Date(Number(s.slice(0, 4)), Number(s.slice(5, 7)) - 1, Number(s.slice(8, 10)));
const HEUTE = d('2026-11-14');

test('minusMonate: echte Kalendermonate, Monatsende wird abgefangen', () => {
    assert.equal(ISO(minusMonate(d('2027-03-01'), 3)), '2026-12-01');
    assert.equal(ISO(minusMonate(d('2027-05-31'), 3)), '2027-02-28');
    assert.equal(ISO(minusMonate(d('2028-05-31'), 3)), '2028-02-29', 'Schaltjahr');
    assert.equal(ISO(minusMonate(d('2027-03-31'), 1)), '2027-02-28');
    assert.equal(ISO(minusMonate(d('2027-01-15'), 13)), '2025-12-15');
    assert.equal(ISO(minusMonate(d('2027-01-15'), 0)), '2027-01-15');
});

test('Frist 3 Monate: Kalendermonate, nicht 90 Tage', () => {
    const abo = { naechsteZahlung: '2027-06-01', turnus: 'Jährlich', ...erzeugeFristFelder(3, 'monate') };
    const frist = ermittleKuendigungsfrist(abo, HEUTE);
    assert.equal(ISO(frist.fristDatum), '2027-03-01');
    // 90 Tage wären der 03.03.2027
    const alt = ermittleKuendigungsfrist({ ...abo, kuendigungsfristEinheit: undefined, kuendigungsfristAnzahl: undefined, kuendigungsfristTage: 90 }, HEUTE);
    assert.equal(ISO(alt.fristDatum), '2027-03-03');
});

test('Frist 1 Monat zum 31.: letzter Tag des Vormonats', () => {
    const abo = { naechsteZahlung: '2027-03-31', turnus: 'Jährlich', ...erzeugeFristFelder(1, 'monate') };
    assert.equal(ISO(ermittleKuendigungsfrist(abo, HEUTE).fristDatum), '2027-02-28');
});

test('Frist in Wochen = Wochen x 7 Tage', () => {
    const abo = { naechsteZahlung: '2026-12-31', turnus: 'Monatlich', ...erzeugeFristFelder(2, 'wochen') };
    assert.equal(ISO(ermittleKuendigungsfrist(abo, HEUTE).fristDatum), '2026-12-17');
    assert.equal(abo.kuendigungsfristTage, 14);
});

test('Monatsfrist: verpasste Frist rückt auf die nächste Zahlung vor', () => {
    // Zahlung 01.12.2026, 1 Monat -> 01.11.2026 (vorbei) -> nächste Zahlung 01.01.2027 -> 01.12.2026
    const abo = { naechsteZahlung: '2026-12-01', turnus: 'Monatlich', ...erzeugeFristFelder(1, 'monate') };
    const frist = ermittleKuendigungsfrist(abo, HEUTE);
    assert.equal(ISO(frist.fristDatum), '2026-12-01');
    assert.equal(ISO(frist.zahlungsDatum), '2027-01-01');
});

test('Alte Abos (nur Tage) funktionieren unverändert', () => {
    const alt = { naechsteZahlung: '2026-12-31', turnus: 'Monatlich', kuendigungsfristTage: 30 };
    assert.deepEqual(ermittleFristAngabe(alt), { anzahl: 30, einheit: 'tage' });
    assert.equal(ISO(ermittleKuendigungsfrist(alt, HEUTE).fristDatum), '2026-12-01');
});

test('Speicherfelder: Tage-Näherung bleibt für ältere App-Versionen erhalten', () => {
    assert.deepEqual(JSON.parse(JSON.stringify(erzeugeFristFelder(3, 'monate'))), { kuendigungsfristTage: 90, kuendigungsfristEinheit: 'monate', kuendigungsfristAnzahl: 3 });
    assert.deepEqual(JSON.parse(JSON.stringify(erzeugeFristFelder(30, 'tage'))), { kuendigungsfristTage: 30 });
});

test('Gültigkeit: Einheit nur wochen/monate mit ganzer Zahl', () => {
    const basis = { name: 'A', kosten: 1, waehrung: 'EUR', turnus: 'Monatlich', naechsteZahlung: '2027-01-01' };
    assert.equal(Calculator.istGueltig({ ...basis, ...erzeugeFristFelder(3, 'monate') }), true);
    assert.equal(Calculator.istGueltig({ ...basis, ...erzeugeFristFelder(2, 'wochen') }), true);
    assert.equal(Calculator.istGueltig({ ...basis, ...erzeugeFristFelder(NaN, 'monate') }), false);
    assert.equal(Calculator.istGueltig({ ...basis, kuendigungsfristTage: 30, kuendigungsfristEinheit: 'jahre', kuendigungsfristAnzahl: 1 }), false);
});

test('Sicherung: Einheit wird übernommen, Unsinn fällt auf Tage zurück', () => {
    const roh = { id: 'x', name: 'A', kosten: 1, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Sport', naechsteZahlung: '2027-01-01', kuendigungsfristTage: 90, kuendigungsfristEinheit: 'monate', kuendigungsfristAnzahl: 3 };
    const abo = normalisiereAbo(roh);
    assert.equal(abo.kuendigungsfristEinheit, 'monate');
    assert.equal(abo.kuendigungsfristAnzahl, 3);
    const kaputt = normalisiereAbo({ ...roh, kuendigungsfristEinheit: 'jahre' });
    assert.equal(kaputt.kuendigungsfristEinheit, undefined);
    assert.deepEqual(ermittleFristAngabe(kaputt), { anzahl: 90, einheit: 'tage' });
});

test('Anzeige der Frist mit Einzahl', () => {
    setzeSprache('de');
    assert.equal(tAnzahl('frist.monate', 3), '3 Monate');
    assert.equal(tAnzahl('frist.monate', 1), '1 Monat');
    assert.equal(tAnzahl('frist.wochen', 1), '1 Woche');
    assert.equal(tAnzahl('frist.tage', 30), '30 Tage');
    setzeSprache('en');
    assert.equal(tAnzahl('frist.monate', 3), '3 months');
    assert.equal(tAnzahl('frist.tage', 1), '1 day');
    setzeSprache('de');
});
