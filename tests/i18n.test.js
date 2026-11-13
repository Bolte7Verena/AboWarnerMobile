/**
 * i18n.test.js | Übersetzungs-Baustein (src/i18n.js, src/i18n/*.js).
 * Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { t, tAnzahl, tWert, setzeSprache, ermittleSprache, formatiereDatum, SPRACHEN } from '../src/i18n.js';

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

// --- Englisch ---

const platzhalter = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');

test('Englisch: nur Schlüssel, die es auch auf Deutsch gibt, mit gleichen Platzhaltern', () => {
    for (const [k, v] of Object.entries(SPRACHEN.en)) {
        assert.ok(k in SPRACHEN.de, `unbekannter Schlüssel in en.js: ${k}`);
        assert.equal(platzhalter(v), platzhalter(SPRACHEN.de[k]), `Platzhalter in ${k}`);
    }
});

test('Englisch: Texte und Einzahl', () => {
    setzeSprache('en');
    assert.equal(t('karte.moeglichBis', { datum: '11/15/2026' }), 'Cancel by 11/15/2026');
    assert.equal(tAnzahl('anzahl.abos', 1), '1 subscription');
    assert.equal(tAnzahl('anzahl.abos', 4), '4 subscriptions');
    assert.equal(tAnzahl('karte.laeuftNoch', 1), 'Ends in 1 day');
    assert.equal(tWert('turnus', 'Vierteljährlich'), 'Quarterly');
    assert.equal(tWert('kategorie', 'Versicherung'), 'Insurance');
    assert.equal(tWert('kategorie', 'Eigene Kategorie'), 'Eigene Kategorie');
    assert.equal(SPRACHEN.en['kalender.wochentage'].split(',').length, 7);
    assert.equal(SPRACHEN.en['kalender.monate'].split(',').length, 12);
    setzeSprache('de');
});

// --- Datumsformat je Sprache/Region ---

test('Datum Deutsch: immer TT.MM.JJJJ, unabhängig von der Region', () => {
    setzeSprache('de');
    assert.equal(formatiereDatum('2026-11-15', 'en-US'), '15.11.2026');
    assert.equal(formatiereDatum('2026-11-15', 'fr-FR'), '15.11.2026');
});

test('Datum Englisch: Format der Geräte-Region', () => {
    setzeSprache('en');
    assert.equal(formatiereDatum('2026-11-05', 'en-US'), '11/05/2026');
    assert.equal(formatiereDatum('2026-11-05', 'en-GB'), '05/11/2026');
    assert.equal(formatiereDatum('2026-11-05', 'fr-FR'), '05/11/2026');
    assert.equal(formatiereDatum('2026-11-05', 'de-DE'), '05.11.2026');
    assert.equal(formatiereDatum('2026-11-05', 'ja-JP'), '2026/11/05');
    setzeSprache('de');
});

test('Datum Englisch: nur lateinische Ziffern, keine Steuerzeichen (auch für die PDF)', () => {
    setzeSprache('en');
    for (const region of ['ar-EG', 'fa-IR', 'hi-IN', 'he-IL', 'th-TH', 'ja-JP-u-ca-japanese', 'ar-SA']) {
        const text = formatiereDatum('2026-11-05', region);
        assert.match(text, /^[0-9./\- ]+$/, `${region}: ${JSON.stringify(text)}`);
        assert.ok(text.includes('2026'), `${region}: gregorianisches Jahr erwartet, war ${text}`);
    }
    setzeSprache('de');
});

test('Datum: ungültige Eingabe liefert leeren Text, ungültige Region fällt zurück', () => {
    setzeSprache('en');
    assert.equal(formatiereDatum('kaputt', 'en-US'), '');
    assert.equal(formatiereDatum('2026-11-05', 'xx-INVALID-###'), '05.11.2026');
    setzeSprache('de');
});

// --- Rechtstexte und Hilfe auf Englisch ---

test('Englisch: Datenschutz und Impressum beginnen mit dem Hinweis auf die deutsche Fassung', () => {
    const ersterText = (html) => html.replace(/<[^>]+>/g, '\n').split('\n').map((z) => z.trim()).find(Boolean);
    assert.equal(ersterText(SPRACHEN.en['datenschutz.inhalt']), 'In case of doubt, the German version applies.');
    assert.equal(ersterText(SPRACHEN.en['impressum.inhalt']), 'In case of doubt, the German version applies.');
    assert.ok(!SPRACHEN.de['datenschutz.inhalt'].includes('In case of doubt'), 'nicht in der deutschen Fassung');
});

test('Englisch: Hilfe hat dieselbe Gliederung wie Deutsch', () => {
    const anzahl = (html, tag) => (html.match(new RegExp(`<${tag}[ >]`, 'g')) || []).length;
    for (const tag of ['h3', 'li', 'ol', 'ul']) {
        assert.equal(anzahl(SPRACHEN.en['hilfe.inhalt'], tag), anzahl(SPRACHEN.de['hilfe.inhalt'], tag), tag);
    }
});
