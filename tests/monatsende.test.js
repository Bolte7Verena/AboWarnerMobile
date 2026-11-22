/**
 * monatsende.test.js | Zahlungen am 29., 30. oder 31. dürfen in kurzen Monaten
 * nicht in den Folgemonat rutschen (Fehler bis 2.0.1: 31.10. -> 01.12.).
 * "Heute" wird über Nodes Test-Uhr festgelegt. Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { ermittleEffektivesZahlungsdatum, ermittleKuendigungsfrist, schlageVertragsendeVor, formatiereDatumISO as iso, naechsteZahlungAb } from '../src/calculator.js';
import { berechneBenachrichtigungsPlan } from '../src/benachrichtigungsplan.js';

const stelle = (t, jahr, monat, tag) => t.mock.timers.enable({ apis: ['Date'], now: new Date(jahr, monat - 1, tag, 12) });
const zahlung = (datum, turnus = 'Monatlich') => iso(ermittleEffektivesZahlungsdatum(datum, turnus));

test('Zahlung am 31.: in kurzen Monaten am Monatsletzten', (t) => {
    stelle(t, 2026, 11, 22);
    assert.equal(zahlung('2026-10-31'), '2026-11-30');
    assert.equal(zahlung('2026-08-31'), '2026-11-30');
    assert.equal(zahlung('2026-01-31'), '2026-11-30', 'über den Februar hinweg');
    assert.equal(zahlung('2020-01-31'), '2026-11-30', 'über viele Jahre hinweg');
});

test('Nach einem kurzen Monat gilt wieder der 31.', (t) => {
    stelle(t, 2026, 12, 1);
    assert.equal(zahlung('2026-10-31'), '2026-12-31');
});

test('Februar: 29., 30. und 31. werden zum 28. (Schaltjahr 29.)', (t) => {
    stelle(t, 2027, 2, 10);
    for (const tag of ['29', '30', '31']) assert.equal(zahlung(`2027-01-${tag}`), '2027-02-28', tag);
    t.mock.timers.reset();
    stelle(t, 2028, 2, 10);
    for (const tag of ['29', '30', '31']) assert.equal(zahlung(`2028-01-${tag}`), '2028-02-29', tag);
});

test('Danach wieder der ursprüngliche Tag (30. bleibt 30.)', (t) => {
    stelle(t, 2027, 3, 5);
    assert.equal(zahlung('2027-01-30'), '2027-03-30');
    assert.equal(zahlung('2027-01-31'), '2027-03-31');
});

test('Vierteljährlich, halbjährlich, jährlich', (t) => {
    stelle(t, 2026, 11, 22);
    assert.equal(zahlung('2026-08-31', 'Vierteljährlich'), '2026-11-30');
    assert.equal(zahlung('2026-05-31', 'Halbjährlich'), '2026-11-30');
    assert.equal(zahlung('2024-02-29', 'Jährlich'), '2027-02-28');
    t.mock.timers.reset();
    stelle(t, 2028, 1, 5);
    assert.equal(zahlung('2024-02-29', 'Jährlich'), '2028-02-29', 'im Schaltjahr wieder der 29.');
});

test('Normale Tage bleiben unverändert', (t) => {
    stelle(t, 2026, 11, 22);
    assert.equal(zahlung('2026-10-15'), '2026-12-15');
    assert.equal(zahlung('2026-11-22'), '2026-11-22', 'heute');
    assert.equal(zahlung('2027-06-30'), '2027-06-30', 'Zukunft');
});

test('Kündigungsfrist und Vertragsende rechnen mit dem richtigen Monatsende', (t) => {
    stelle(t, 2026, 11, 22);
    const abo = { naechsteZahlung: '2026-10-31', turnus: 'Monatlich', kuendigungsfristTage: 5 };
    const frist = ermittleKuendigungsfrist(abo);
    assert.equal(iso(frist.zahlungsDatum), '2026-11-30');
    assert.equal(iso(frist.fristDatum), '2026-11-25');
    assert.equal(iso(schlageVertragsendeVor(abo)), '2026-11-29');
    // Frist verpasst: übernächste Zahlung wieder am 31.
    const danach = ermittleKuendigungsfrist(abo, new Date(2026, 10, 26));
    assert.equal(iso(danach.zahlungsDatum), '2026-12-31');
    assert.equal(iso(danach.fristDatum), '2026-12-26');
});

test('Frist in Monaten am Monatsende', (t) => {
    stelle(t, 2026, 11, 22);
    const frist = ermittleKuendigungsfrist({ naechsteZahlung: '2027-05-31', turnus: 'Jährlich', kuendigungsfristTage: 90, kuendigungsfristEinheit: 'monate', kuendigungsfristAnzahl: 3 });
    assert.equal(iso(frist.fristDatum), '2027-02-28');
});

test('Erinnerungen: die nächsten drei Fristen wandern nicht', (t) => {
    stelle(t, 2026, 11, 1);
    const plan = berechneBenachrichtigungsPlan([{ id: 'a', name: 'A', kosten: 1, waehrung: 'EUR', kategorie: 'Sport', naechsteZahlung: '2026-12-31', turnus: 'Monatlich', kuendigungsfristTage: 0 }]);
    assert.deepEqual(plan.map((n) => iso(n.at)), ['2026-12-24', '2027-01-24', '2027-02-21']);
});

test('Übersicht und "Per Foto einlesen" kommen auf denselben Termin', (t) => {
    stelle(t, 2026, 11, 22);
    for (const tag of ['2026-01-28', '2026-01-29', '2026-01-30', '2026-01-31', '2026-10-31', '2024-02-29']) {
        for (const turnus of ['Monatlich', 'Vierteljährlich', 'Halbjährlich', 'Jährlich']) assert.equal(zahlung(tag, turnus), naechsteZahlungAb(tag, turnus), `${tag} ${turnus}`);
    }
});

test('Ungültiges Datum: kein Absturz, keine Endlosschleife', () => {
    assert.ok(isNaN(ermittleEffektivesZahlungsdatum('kaputt', 'Monatlich')));
    assert.equal(ermittleKuendigungsfrist({ naechsteZahlung: 'kaputt', turnus: 'Monatlich', kuendigungsfristTage: 1 }), null);
});
