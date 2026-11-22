/**
 * betragsfeld.test.js | Beträge sicher verstehen: Punkt und Komma, Leerzeichen
 * der Tastatur, fremde Ziffern. Es dürfen nie still Cent verloren gehen
 * (Fehler auf dem Samsung S20 FE: "6. 99" wurde 6,00). Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBetrag } from '../src/calculator.js';
import { dezimalzeichen, ordneTrennzeichen } from '../src/betragsfeld.js';
import { formatiereZahlEingabe, setzeSprache } from '../src/i18n.js';

test('6,99 in jeder Schreibweise ist 6,99', () => {
    for (const x of ['6.99', '6,99', '6. 99', '6, 99', '6 .99', '6 , 99', ' 6.99 ', '6.99 €', '€6.99', '€ 6,99', '6,99€', 'EUR 6,99', '6.99 EUR', '6\u00a0,\u00a099', '6\u202f.99', '６．９９', '6\u202499', '6\u00b799', '6\u300299', '٦٫٩٩', '۶٫۹۹', '६.९९', '+6.99', 'R$ 6,99', 'US$6.99', 'CHF 6.99', 'Fr. 6.99']) {
        assert.equal(parseBetrag(x), 6.99, JSON.stringify(x));
    }
});

test('Nicht sicher Verstandenes wird abgelehnt, nie gekürzt', () => {
    for (const x of ['6 99', '6.99.1', '6,99,1', '6;99', '6:99', '6/99', '6-99', '6..99', '6,,99', '6.,99', '1.250,50,3', '1e5', '12a34', '6x99', '€', '', ' ', 'abc', '1.25.000', '--5']) {
        const wert = parseBetrag(x);
        assert.ok(isNaN(wert), `${JSON.stringify(x)} -> ${wert}`);
    }
});

test('Tausender mit Punkt, Komma, Leerzeichen, Apostroph; Tastatur mit nur einem Trennzeichen', () => {
    for (const [x, w] of [['1.250', 1250], ['1,250', 1250], ['1 250', 1250], ["1'250", 1250], ['1.250,50', 1250.5], ['1,250.50', 1250.5], ['1 250,50', 1250.5], ['1.250.000', 1250000], ['1,250,000', 1250000], ['1.250.50', 1250.5], ['1,250,5', 1250.5], ['12 345 678,90', 12345678.9], ['0.5', 0.5], ['0,999', 0.999], ['.5', 0.5], ['5,-', 5], ['5.', 5], ['-5', -5]]) assert.equal(parseBetrag(x), w, x);
});

test('Während des Tippens steht das Zeichen des Landes im Feld', () => {
    const tippe = (folge, dezimal) => { let t = ''; for (const z of folge) t = ordneTrennzeichen(t + z, dezimal); return t; };
    assert.equal(tippe('6.99', ','), '6,99');
    assert.equal(tippe('6. 99', ','), '6,99');
    assert.equal(tippe('6,99', ','), '6,99');
    assert.equal(tippe('6,99', '.'), '6.99');
    assert.equal(tippe('6. 99', '.'), '6.99');
    assert.equal(tippe('.5', ','), ',5');
    assert.equal(tippe('1.250', ','), '1.250');
    assert.equal(tippe('1,250', '.'), '1,250');
    assert.equal(tippe('1.250,50', ','), '1.250,50');
    assert.equal(tippe('1.250.50', ','), '1.250.50');
    assert.equal(tippe('1.250.000', ','), '1.250.000');
    assert.equal(tippe('1,250,000', '.'), '1,250,000');
    assert.equal(tippe('1,250.50', '.'), '1,250.50');
    assert.equal(tippe('29', ','), '29');
    assert.equal(ordneTrennzeichen('abc', ','), 'abc');
});

test('Zeichen für Zeichen getippt: gespeichert wird immer der gemeinte Betrag, in jedem Land', () => {
    const laender = ['de-DE', 'de-AT', 'de-CH', 'en-US', 'en-GB', 'en-IN', 'en-ZA', 'es-ES', 'es-MX', 'es-CO', 'fr-FR', 'fr-CH', 'fr-CA', 'pt-BR', 'pt-PT'];
    for (const land of laender) {
        const d = dezimalzeichen(land);
        for (const cent of [0, 1, 5, 10, 49, 99]) for (const euro of [0, 6, 29, 100, 999, 1000, 1250, 12345, 999999, 1250000]) {
            const wert = euro + cent / 100;
            for (const zeichen of ['.', ',', '. ', ', ']) {
                let t = '';
                for (const z of `${euro}${zeichen}${String(cent).padStart(2, '0')}`) t = ordneTrennzeichen(t + z, d);
                assert.equal(parseBetrag(t), wert, `${land} ${euro}${zeichen}${cent}: ${t}`);
            }
            // was nach dem Verlassen im Feld steht, ergibt wieder denselben Betrag
            const anzeige = formatiereZahlEingabe(wert, land);
            assert.equal(ordneTrennzeichen(anzeige, d), anzeige, `${land} ${anzeige}`);
            assert.equal(parseBetrag(anzeige), wert, land);
            assert.ok(!/\s/.test(anzeige), land);
        }
    }
});

test('Deutschland: Komma, egal welche Sprache das Handy sonst hat', () => {
    setzeSprache('de');
    for (const land of ['de-DE', 'de-AT', 'es-ES', 'fr-FR', 'pt-BR']) assert.equal(dezimalzeichen(land), ',', land);
    for (const land of ['en-US', 'en-GB', 'es-MX', 'de-CH']) assert.equal(dezimalzeichen(land), '.', land);
});
