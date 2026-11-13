/**
 * kuendigungsschreiben.test.js | Unit-Tests für den reinen Text des
 * Kündigungsschreibens (ohne DOM). Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { erzeugeSchreibenText } from '../src/kuendigungsschreiben.js';
import { setzeSprache } from '../src/i18n.js';

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

// --- Englische Fassung ---

test('Englisch: neutrale Fassung mit Vertragsdaten, Kernsatz, Bestätigung und Unterschriftszeile', () => {
    setzeSprache('en');
    const abo = { name: 'FitLife', vertragspartner: 'FitLife Ltd\n5 Gym Road\nLondon SW1A 1AA', vertragsnummer: 'V-123', kundennummer: 'K-987' };
    const text = erzeugeSchreibenText(abo, { name: 'Jane Doe', strasse: '1 High Street', plzOrt: 'Oxford OX1 1AA', email: '' }, HEUTE);
    assert.equal(text, [
        'Jane Doe\n1 High Street\nOxford OX1 1AA',
        'FitLife Ltd\n5 Gym Road\nLondon SW1A 1AA',
        text.split('\n\n')[2], // Datum im Format der Geräte-Region
        'Cancellation: FitLife\nContract number: V-123\nCustomer number: K-987',
        'Dear Sir or Madam,',
        'I hereby cancel my contract referred to above at the earliest possible date.',
        'Please confirm the cancellation in writing.',
        'Kind regards,',
        '_______________________\nJane Doe'
    ].join('\n\n'));
    assert.match(text.split('\n\n')[2], /2026/);
    setzeSprache('de');
});

test('Englisch: kein deutsches Recht, keine Paragraphen, keine deutschen Wörter', () => {
    setzeSprache('en');
    const text = erzeugeSchreibenText({ name: 'X' }, { email: 'a@b.c' }, HEUTE);
    assert.ok(!/§|BGB|fristgerecht|Kündigung|Sehr geehrte|Grüßen/.test(text), text);
    assert.ok(text.includes('[Your name]') && text.includes('[Street and house number]') && text.includes('[Postcode and city]'));
    assert.ok(text.includes('Please confirm the cancellation in writing by email to a@b.c.'));
    setzeSprache('de');
});

test('Deutsch bleibt ohne Unterschriftszeile (unverändert)', () => {
    setzeSprache('de');
    const text = erzeugeSchreibenText({ name: 'X' }, ABSENDER, HEUTE);
    assert.ok(text.endsWith('Mit freundlichen Grüßen\n\nMax Mustermann'));
    assert.ok(!text.includes('____'));
});
