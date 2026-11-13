/**
 * sicherung.test.js | Prüfen von Sicherungsdateien ("Sicherung
 * wiederherstellen"). Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { pruefeSicherung } from '../src/sicherung.js';

// Genau so, wie 2.0.1 ("Exportieren") eine Datei geschrieben hat.
const ALT_EXPORT = JSON.stringify([
    { id: 'abo_1', name: 'Netflix', kosten: 17.99, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Streaming', naechsteZahlung: '2026-12-01', kuendigungsfristTage: 30 },
    { id: 'abo_2', name: 'Spotify', kosten: 9.99, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Musik', naechsteZahlung: '2026-12-05', kuendigungsfristTage: 30, gekuendigt: true }
], null, 2);

test('Export aus Version 2.0.1 wird akzeptiert', () => {
    const r = pruefeSicherung(ALT_EXPORT);
    assert.equal(r.ok, true);
    assert.equal(r.abos.length, 2);
    assert.equal(r.abos[1].gekuendigt, true);
    assert.equal(r.abos[1].gekuendigtZum, undefined);
});

test('Neue Felder (2.0.2) bleiben erhalten', () => {
    const r = pruefeSicherung(JSON.stringify([{ id: 'x', name: 'Miete', kosten: 800, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Wohnen', naechsteZahlung: '2027-01-01', kuendigungsfristTage: 90,
        vertragsnummer: 'V1', kundennummer: 'K1', vertragspartner: 'Vermieter\nWeg 1', gekuendigt: true, gekuendigtZum: '2027-03-31' }]));
    assert.equal(r.ok, true);
    assert.deepEqual(
        [r.abos[0].vertragsnummer, r.abos[0].kundennummer, r.abos[0].vertragspartner, r.abos[0].gekuendigtZum],
        ['V1', 'K1', 'Vermieter\nWeg 1', '2027-03-31']
    );
});

test('Fremde Zusatzfelder werden nicht übernommen', () => {
    const r = pruefeSicherung(JSON.stringify([{ id: 'x', name: 'A', kosten: 1, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Sport', naechsteZahlung: '2027-01-01', kuendigungsfristTage: 1, boese: '<script>' }]));
    assert.equal(r.ok, true);
    assert.equal('boese' in r.abos[0], false);
});

test('Objekt mit Feld "abos" wird ebenfalls akzeptiert', () => {
    const r = pruefeSicherung(JSON.stringify({ app: 'abo-warner', abos: JSON.parse(ALT_EXPORT) }));
    assert.equal(r.ok, true);
    assert.equal(r.abos.length, 2);
});

test('UTF-8-BOM am Dateianfang stört nicht', () => {
    assert.equal(pruefeSicherung('﻿' + ALT_EXPORT).ok, true);
});

test('Kein JSON (z.B. Foto/Text) wird verständlich abgelehnt', () => {
    const r = pruefeSicherung('Hallo, das ist eine Einkaufsliste.');
    assert.equal(r.ok, false);
    assert.match(r.meldung, /keine Abo-Warner-Sicherung/);
    assert.match(r.meldung, /bleiben unverändert/);
});

test('Fremdes JSON (anderes Programm) wird abgelehnt', () => {
    assert.equal(pruefeSicherung(JSON.stringify({ name: 'package', version: '1.0.0' })).ok, false);
    assert.equal(pruefeSicherung(JSON.stringify([{ foo: 1 }, { bar: 2 }])).ok, false);
});

test('Leere Datei / leere Liste wird abgelehnt (nichts wird gelöscht)', () => {
    assert.equal(pruefeSicherung('').ok, false);
    const r = pruefeSicherung('[]');
    assert.equal(r.ok, false);
    assert.match(r.meldung, /keine Abos/);
});

test('Teilweise kaputte Datei wird komplett abgelehnt, mit Anzahl', () => {
    const daten = JSON.parse(ALT_EXPORT);
    daten.push({ id: 'abo_3', name: 'Kaputt', kosten: 'abc', waehrung: 'EUR', turnus: 'Monatlich', naechsteZahlung: '2026-12-01', kuendigungsfristTage: 3 });
    const r = pruefeSicherung(JSON.stringify(daten));
    assert.equal(r.ok, false);
    assert.match(r.meldung, /1 von 3 Einträgen/);
});

test('Abgeschnittene Datei (unvollständiges JSON) wird abgelehnt', () => {
    assert.equal(pruefeSicherung(ALT_EXPORT.slice(0, ALT_EXPORT.length / 2)).ok, false);
});

test('Doppelte IDs werden abgelehnt', () => {
    const daten = JSON.parse(ALT_EXPORT);
    daten[1].id = daten[0].id;
    const r = pruefeSicherung(JSON.stringify(daten));
    assert.equal(r.ok, false);
    assert.match(r.meldung, /doppelte/);
});

test('Ungültiger Turnus / Datum / negative Frist werden abgelehnt', () => {
    const basis = { id: 'x', name: 'A', kosten: 1, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Sport', naechsteZahlung: '2027-01-01', kuendigungsfristTage: 1 };
    assert.equal(pruefeSicherung(JSON.stringify([{ ...basis, turnus: 'Wöchentlich' }])).ok, false);
    assert.equal(pruefeSicherung(JSON.stringify([{ ...basis, naechsteZahlung: '01.01.2027' }])).ok, false);
    assert.equal(pruefeSicherung(JSON.stringify([{ ...basis, kuendigungsfristTage: -5 }])).ok, false);
});
