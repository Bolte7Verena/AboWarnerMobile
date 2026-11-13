/**
 * i18n.test.js | Übersetzungs-Baustein (src/i18n.js, src/i18n/*.js).
 * Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { t, tAnzahl, tWert, setzeSprache, ermittleSprache, SPRACHEN } from '../src/i18n.js';

test('t(): Platzhalter werden ersetzt', () => {
    setzeSprache('de');
    assert.equal(t('karte.moeglichBis', { datum: '15.11.2026' }), 'Kündigung möglich bis 15.11.2026');
});

test('t(): unbekannter Schlüssel liefert den Schlüssel selbst (nie leer)', () => {
    setzeSprache('de');
    assert.equal(t('gibt.es.nicht'), 'gibt.es.nicht');
});

test('tAnzahl(): Einzahl-Variante nur bei 1', () => {
    setzeSprache('de');
    assert.equal(tAnzahl('anzahl.abos', 1), '1 Abo');
    assert.equal(tAnzahl('anzahl.abos', 3), '3 Abos');
    assert.equal(tAnzahl('karte.laeuftNoch', 1), 'Läuft noch 1 Tag');
    assert.equal(tAnzahl('karte.laeuftNoch', 5), 'Läuft noch 5 Tage');
});

test('tWert(): gespeicherte deutsche Werte werden angezeigt, unbekannte unverändert', () => {
    setzeSprache('de');
    assert.equal(tWert('turnus', 'Vierteljährlich'), 'Vierteljährlich');
    assert.equal(tWert('kategorie', 'Eigene Kategorie'), 'Eigene Kategorie');
});

test('ermittleSprache(): automatisch nach Gerätesprache', () => {
    assert.equal(ermittleSprache('auto', ['de-DE']), 'de');
    assert.equal(ermittleSprache('auto', ['de']), 'de');
    assert.equal(ermittleSprache('auto', ['de-AT', 'en-US']), 'de');
    assert.equal(ermittleSprache('auto', ['en-US']), 'en');
    assert.equal(ermittleSprache('auto', ['fr-FR']), 'en');
    assert.equal(ermittleSprache('auto', ['es-ES', 'de-DE']), 'en', 'nur die erste (bevorzugte) Sprache zählt');
    assert.equal(ermittleSprache('auto', []), 'en');
    assert.equal(ermittleSprache('auto', 'dev'), 'en', '"dev" ist kein Deutsch');
});

test('ermittleSprache(): feste Einstellung schlägt Gerätesprache', () => {
    assert.equal(ermittleSprache('de', ['en-US']), 'de');
    assert.equal(ermittleSprache('en', ['de-DE']), 'en');
    assert.equal(ermittleSprache('quatsch', ['de-DE']), 'de', 'ungültige Einstellung = automatisch');
});

test('Deutsche Sprachdatei: keine leeren Texte, Kalender vollständig', () => {
    for (const [k, v] of Object.entries(SPRACHEN.de)) {
        if (k === 'brief.unterschriftslinie') continue; // absichtlich leer
        assert.ok(typeof v === 'string' && v.trim().length > 0, k);
    }
    assert.equal(SPRACHEN.de['kalender.wochentage'].split(',').length, 7);
    assert.equal(SPRACHEN.de['kalender.monate'].split(',').length, 12);
});
