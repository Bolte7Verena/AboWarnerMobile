/**
 * region.test.js | Land, Anzeigeformat, Wochenbeginn, Papierformat (src/region.js).
 * Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { geraeteRegion, anzeigeRegion, wochenbeginn, papierformat } from '../src/region.js';
import { formatiereDatum, setzeSprache } from '../src/i18n.js';
import { erzeugeUebersichtPdf } from '../src/uebersicht-pdf.js';

test('geraeteRegion(): Land aus der bevorzugten Gerätesprache', () => {
    assert.equal(geraeteRegion(['de-DE', 'en-US']), 'DE');
    assert.equal(geraeteRegion(['pt-BR']), 'BR');
    assert.equal(geraeteRegion(['zh-Hans-CN']), 'CN');
    assert.equal(geraeteRegion(['es_MX']), 'MX');
    assert.equal(geraeteRegion(['es-419', 'es-AR']), 'AR', 'Region 419 ist kein Land');
    assert.equal(geraeteRegion(['pt']), 'BR');
    assert.equal(geraeteRegion(['en']), 'US');
    assert.equal(geraeteRegion([]), '');
    assert.equal(geraeteRegion([undefined]), '');
});

test('anzeigeRegion(): App-Sprache entscheidet, das Land nur, wenn es dazu passt', () => {
    assert.equal(anzeigeRegion('en', ['en-US']), 'en-US');
    assert.equal(anzeigeRegion('en', ['en-GB']), 'en-GB');
    assert.equal(anzeigeRegion('en', ['de-DE']), 'en-GB');
    assert.equal(anzeigeRegion('en', ['de-DE', 'en-US']), 'en-US', 'Nutzer hat selbst US-Englisch eingestellt');
    assert.equal(anzeigeRegion('fr', ['en-US']), 'fr-FR');
    assert.equal(anzeigeRegion('fr', ['en-CA']), 'fr-CA');
    assert.equal(anzeigeRegion('es', ['en-US']), 'es-US');
    assert.equal(anzeigeRegion('es', ['es']), 'es-ES');
    assert.equal(anzeigeRegion('pt', ['en-US']), 'pt-BR');
    assert.equal(anzeigeRegion('pt', ['pt-PT']), 'pt-PT');
    assert.equal(anzeigeRegion('en', ['en']), 'en-US');
    assert.equal(anzeigeRegion('de', ['de-CH']), 'de-CH');
    assert.equal(anzeigeRegion('en', ['ja-JP']), 'en-GB');
    assert.equal(anzeigeRegion('en', []), 'en-GB');
});

test('Datum: nie in der Schreibweise einer fremden Gerätesprache', () => {
    const faelle = [['fr', ['en-US'], '03/12/2026'], ['pt', ['en-US'], '03/12/2026'], ['en', ['de-DE'], '03/12/2026'], ['en', ['en-US'], '12/03/2026'], ['es', ['en-US'], '03/12/2026']];
    for (const [sprache, geraet, erwartet] of faelle) {
        setzeSprache(sprache);
        assert.equal(formatiereDatum('2026-12-03', anzeigeRegion(sprache, geraet)), erwartet, `${sprache} auf ${geraet}`);
    }
    setzeSprache('de');
});

test('es-419 (Lateinamerika ohne Land): Land aus der Zeitzone', () => {
    assert.equal(geraeteRegion(['es-419'], 'America/Mexico_City'), 'MX');
    assert.equal(geraeteRegion(['es-419', 'en-US'], 'America/Bogota'), 'CO');
    assert.equal(geraeteRegion(['es-419'], 'Europe/Berlin'), 'US', 'unbekannt: Dollar statt Euro');
    assert.equal(anzeigeRegion('es', ['es-419'], 'America/Lima'), 'es-PE');
    assert.equal(anzeigeRegion('es', ['es-419'], 'Europe/Berlin'), 'es-US');
    assert.equal(geraeteRegion(['es-ES'], 'America/Mexico_City'), 'ES', 'ausdrückliches Land geht vor');
});

test('wochenbeginn(): USA, Kanada, Brasilien, Mexiko Sonntag; Europa Montag; Ägypten Samstag', () => {
    for (const land of ['US', 'CA', 'BR', 'MX', 'JP', 'IN']) assert.equal(wochenbeginn(land), 0, land);
    for (const land of ['DE', 'AT', 'CH', 'GB', 'FR', 'ES', 'AR', 'AU', '']) assert.equal(wochenbeginn(land), 1, land);
    assert.equal(wochenbeginn('EG'), 6);
});

test('papierformat(): US-Letter in den USA, sonst A4 (quer)', () => {
    assert.deepEqual(papierformat('US'), { name: 'Letter', breite: 792, hoehe: 612 });
    assert.equal(papierformat('CA').name, 'Letter');
    assert.equal(papierformat('DE').name, 'A4');
    assert.equal(papierformat('BR').name, 'A4');
    assert.equal(papierformat('').name, 'A4');
});

test('PDF: Seitengröße folgt dem Papierformat, nichts liegt außerhalb der Seite', () => {
    const abos = [{ id: '1', name: 'Ein ziemlich langer Name für ein Abo mit Zusatz', kosten: 12345.67, waehrung: 'EUR', turnus: 'Vierteljährlich', kategorie: 'Sport', naechsteZahlung: '2099-01-15', kuendigungsfristTage: 30 }];
    for (const [land, box] of [['US', '[0 0 792 612]'], ['DE', '[0 0 842 595]']]) {
        const papier = papierformat(land);
        const text = String.fromCharCode(...erzeugeUebersichtPdf(abos, new Date(), papier));
        assert.ok(text.includes(`/MediaBox ${box}`), land);
        for (const m of text.matchAll(/ ([\d.]+) ([\d.]+) Td /g)) {
            assert.ok(Number(m[1]) >= 0 && Number(m[1]) < papier.breite - 30, `x ${m[1]} (${land})`);
            assert.ok(Number(m[2]) > 0 && Number(m[2]) < papier.hoehe, `y ${m[2]} (${land})`);
        }
        for (const m of text.matchAll(/([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+) re f/g)) assert.ok(Number(m[1]) + Number(m[3]) <= papier.breite - 39, land);
    }
});
