/**
 * kuendigungsschreiben.test.js | Unit-Tests für den reinen Text des
 * Kündigungsschreibens (ohne DOM). Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { erzeugeSchreibenText } from '../src/kuendigungsschreiben.js';

const HEUTE = new Date(2026, 10, 13); // 13.11.2026, nur für die Datumszeile

const ABSENDER = { name: 'Max Mustermann', strasse: 'Musterstraße 1', plzOrt: '12345 Musterstadt', email: 'max@example.org' };

test('Schreiben übernimmt Vertragspartner, Vertragsnummer und Kundennummer aus dem Abo', () => {
    const abo = {
        name: 'FitLife',
        vertragspartner: 'FitLife GmbH\nKündigungsabteilung\nSportweg 5\n54321 Fitstadt',
        vertragsnummer: 'V-123',
        kundennummer: 'K-987'
    };
    const text = erzeugeSchreibenText(abo, ABSENDER, HEUTE);
    assert.ok(text.includes('FitLife GmbH\nKündigungsabteilung\nSportweg 5\n54321 Fitstadt'));
    assert.ok(text.includes('Kündigung: FitLife\nVertragsnummer: V-123\nKundennummer: K-987'));
    assert.ok(text.includes('13.11.2026'));
    assert.ok(text.includes('per E-Mail an max@example.org'));
    assert.ok(text.startsWith('Max Mustermann\nMusterstraße 1\n12345 Musterstadt\nmax@example.org'));
});

test('Altes Abo ohne neue Felder: kein "undefined", keine leeren Bezugszeilen, Empfänger = Abo-Name', () => {
    const abo = { name: 'Netflix', naechsteZahlung: '2027-01-01', turnus: 'Monatlich', kuendigungsfristTage: 0 };
    const text = erzeugeSchreibenText(abo, ABSENDER, HEUTE);
    assert.ok(!text.includes('undefined'));
    assert.ok(!text.includes('Vertragsnummer'));
    assert.ok(!text.includes('Kundennummer'));
    assert.ok(text.includes('\n\nNetflix\n\n'));
});

test('Ohne E-Mail: Bestätigung "schriftlich", keine leere E-Mail-Zeile im Absender', () => {
    const text = erzeugeSchreibenText({ name: 'X' }, { ...ABSENDER, email: '' }, HEUTE);
    assert.ok(text.includes('schriftlich.'));
    assert.ok(text.startsWith('Max Mustermann\nMusterstraße 1\n12345 Musterstadt\n\n'));
});

test('Fehlende Absenderdaten werden als Platzhalter markiert', () => {
    const text = erzeugeSchreibenText({ name: 'X' }, {}, HEUTE);
    assert.ok(text.includes('[Dein Name]'));
    assert.ok(text.includes('[Straße und Hausnummer]'));
    assert.ok(text.includes('[PLZ und Ort]'));
});

test('Kündigung zum nächstmöglichen Zeitpunkt (kein falsches Vertragsende-Datum)', () => {
    const text = erzeugeSchreibenText({ name: 'X' }, ABSENDER, HEUTE);
    assert.ok(text.includes('fristgerecht zum nächstmöglichen Zeitpunkt'));
});
