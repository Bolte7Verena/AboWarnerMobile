/**
 * waehrungen.test.js | Hauptwährung, Umrechnung, Schreibweisen, Auswahlliste.
 * Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { KURSE_JE_EURO, WAEHRUNGEN, waehrungFuerLand, dollarWaehrung, normalisiereWaehrung, istBekannteWaehrung, rechneUm, ermittleHauptwaehrung, waehrungsListe } from '../src/waehrungen.js';
import { Calculator } from '../src/calculator.js';
import { formatiereBetrag, setzeSprache, SPRACHEN } from '../src/i18n.js';
import { waehrungsOptionen, hauptwaehrungsOptionen } from '../src/waehrungsauswahl.js';
import { werteTextAus } from '../src/texterkennung-auswertung.js';
import { erzeugeZeile, erzeugeUebersichtPdf } from '../src/uebersicht-pdf.js';
import { istDarstellbar } from '../src/pdf.js';
import { pruefeSicherung } from '../src/sicherung.js';

const NBSP = '\u00a0';
const ohneNbsp = (text) => text.replaceAll(NBSP, ' ');
const abo = (kosten, waehrung, extra = {}) => ({ id: waehrung + kosten, name: 'A', kosten, waehrung, turnus: 'Monatlich', kategorie: 'Sport', naechsteZahlung: '2099-01-15', kuendigungsfristTage: 30, ...extra });

test('Kurse: alle positiv, Euro ist 1, alle früheren Währungen noch dabei', () => {
    assert.equal(KURSE_JE_EURO.EUR, 1);
    for (const [c, k] of Object.entries(KURSE_JE_EURO)) assert.ok(/^[A-Z]{3}$/.test(c) && k > 0, c);
    for (const c of 'EUR USD GBP JPY CHF AUD CAD CNY SEK NZD MXN SGD HKD NOK KRW TRY INR RUB BRL ZAR DKK PLN TWD THB AED COP CLP MYR PHP ILS'.split(' ')) assert.ok(WAEHRUNGEN.includes(c), c);
});

test('Land -> Währung (u. a. Brasilien, Schweiz, Mexiko), unbekannt = Euro', () => {
    const faelle = { DE: 'EUR', AT: 'EUR', BG: 'EUR', PT: 'EUR', US: 'USD', GB: 'GBP', CH: 'CHF', BR: 'BRL', MX: 'MXN', AR: 'ARS', CO: 'COP', CL: 'CLP', PE: 'PEN', CA: 'CAD', AU: 'AUD', JP: 'JPY', PL: 'PLN', EC: 'USD', br: 'BRL', XX: 'EUR', '': 'EUR' };
    for (const [land, code] of Object.entries(faelle)) assert.equal(waehrungFuerLand(land), code, land);
});

test('"$" je nach Land', () => {
    assert.equal(dollarWaehrung('US'), 'USD');
    assert.equal(dollarWaehrung('MX'), 'MXN');
    assert.equal(dollarWaehrung('CA'), 'CAD');
    assert.equal(dollarWaehrung('AR'), 'ARS');
    assert.equal(dollarWaehrung('DE'), 'USD');
    assert.equal(dollarWaehrung('BR'), 'USD', 'in Brasilien steht für Real immer R$');
});

test('Schreibweisen aus alten Daten werden erkannt, Unbekanntes bleibt unverändert', () => {
    for (const [roh, code] of [['usd', 'USD'], [' eur ', 'EUR'], ['€', 'EUR'], ['Euro', 'EUR'], ['R$', 'BRL'], ['£', 'GBP'], ['Fr.', 'CHF'], ['zł', 'PLN']]) assert.equal(normalisiereWaehrung(roh), code, roh);
    assert.equal(normalisiereWaehrung('$', 'MX'), 'MXN');
    assert.equal(normalisiereWaehrung('Bitcoin'), 'Bitcoin');
    assert.equal(normalisiereWaehrung(''), '');
    assert.equal(istBekannteWaehrung('Bitcoin'), false);
});

test('Umrechnung zwischen beliebigen Währungen', () => {
    assert.equal(rechneUm(10, 'eur', '€'), 10);
    assert.ok(Math.abs(rechneUm(rechneUm(100, 'BRL', 'USD'), 'USD', 'BRL') - 100) < 1e-9);
    assert.equal(rechneUm(10, 'XYZ', 'EUR'), null);
    assert.equal(rechneUm(10, 'XYZ', 'XYZ'), 10);
});

test('Hauptwährung: Einstellung > gemeinsame Währung der Abos > Land', () => {
    assert.equal(ermittleHauptwaehrung([abo(1, 'EUR')], 'USD', 'DE'), 'USD');
    assert.equal(ermittleHauptwaehrung([], 'auto', 'BR'), 'BRL');
    assert.equal(ermittleHauptwaehrung([abo(1, 'EUR'), abo(2, '€')], 'auto', 'CH'), 'EUR', 'nur Euro-Abos: Summen bleiben genau');
    assert.equal(ermittleHauptwaehrung([abo(1, 'EUR'), abo(2, 'USD')], 'auto', 'CH'), 'CHF');
    assert.equal(ermittleHauptwaehrung([abo(1, 'XYZ')], 'auto', 'DE'), 'EUR');
    assert.equal(ermittleHauptwaehrung([], 'quatsch', 'DE'), 'EUR');
});

test('Summen: nur eine Währung = genau, gemischt = umgerechnet, unbekannt = nicht enthalten', () => {
    assert.deepEqual(Calculator.berechneSummen([abo(10, 'BRL'), abo(120, 'BRL', { turnus: 'Jährlich' })], 'BRL'), { monat: 20, jahr: 240, umgerechnet: false, nichtEnthalten: [] });
    const gemischt = Calculator.berechneSummen([abo(10, 'EUR'), abo(10, 'USD')], 'EUR');
    assert.equal(gemischt.umgerechnet, true);
    assert.ok(gemischt.monat > 10 && gemischt.monat < 30);
    const fremd = Calculator.berechneSummen([abo(10, 'EUR'), abo(5, 'XYZ')], 'EUR');
    assert.deepEqual(fremd, { monat: 10, jahr: 120, umgerechnet: false, nichtEnthalten: ['XYZ'] });
    assert.equal(Calculator.berechneSummen([abo(10, 'eur')], 'EUR').umgerechnet, false);
});

test('Jahressumme wird nicht aus dem gerundeten Monat gerechnet (100 im Jahr bleiben 100)', () => {
    assert.equal(Calculator.berechneSummen([abo(100, 'EUR', { turnus: 'Jährlich' })], 'EUR').jahr, 100);
});

test('Beträge mit Symbol, landesüblich', () => {
    const faelle = [[29.9, 'EUR', 'de-DE', '29,90 €'], [29.9, 'EUR', 'en-IE', '€29.90'], [29.9, 'EUR', 'es-ES', '29,90 €'], [29.9, 'EUR', 'fr-FR', '29,90 €'], [205.5, 'BRL', 'pt-BR', 'R$ 205,50'], [2466, 'USD', 'en-US', '$2,466.00'], [2466, 'GBP', 'en-GB', '£2,466.00'], [1200, 'MXN', 'es-MX', '$1,200.00'], [1200, 'JPY', 'en-GB', 'JP¥1,200'], [10, 'usd', 'en-US', '$10.00'], [2466, 'EUR', 'es-ES', '2.466,00 €']];
    for (const [b, c, l, erwartet] of faelle) assert.equal(ohneNbsp(formatiereBetrag(b, c, l)), erwartet, `${c} ${l}`);
    assert.match(ohneNbsp(formatiereBetrag(2466, 'CHF', 'de-CH')), /^CHF 2['’]466\.00$/);
    assert.equal(formatiereBetrag(5, 'Bitcoin', 'de-DE'), '5,00 Bitcoin');
    assert.equal(ohneNbsp(formatiereBetrag(5, 'EUR', 'de-DE', { nurCode: true })), '5,00 EUR');
});

test('Auswahlliste: gespeicherte Währung vorgewählt, unbekannte geht nicht verloren', () => {
    const gewaehlt = (html) => /<option value="([^"]*)" selected>/.exec(html)[1];
    assert.equal(gewaehlt(waehrungsOptionen('usd')), 'USD');
    assert.equal(gewaehlt(waehrungsOptionen('€')), 'EUR');
    assert.equal(gewaehlt(waehrungsOptionen('Bitcoin')), 'Bitcoin');
    assert.equal(gewaehlt(waehrungsOptionen('<b>')), '&lt;b&gt;');
    const alle = [...waehrungsOptionen('EUR').matchAll(/value="([^"]*)"/g)].map((m) => m[1]);
    assert.equal(new Set(alle).size, WAEHRUNGEN.length);
    assert.equal(waehrungsListe(['BRL'])[0], 'BRL');
    assert.equal(gewaehlt(hauptwaehrungsOptionen('auto', 'EUR')), 'auto');
    assert.equal(gewaehlt(hauptwaehrungsOptionen('BRL', 'EUR')), 'BRL');
});

test('Foto: "$" nach Region, weitere Symbole und Codes', () => {
    const zeilen = ['Total $24.99', 'Monthly'];
    assert.equal(werteTextAus(zeilen).waehrung, 'USD');
    assert.equal(werteTextAus(zeilen, { dollar: 'MXN' }).waehrung, 'MXN');
    assert.equal(werteTextAus(['Total a pagar US$ 24.99'], { dollar: 'MXN' }).waehrung, 'USD');
    assert.equal(werteTextAus(['Valor total R$ 24,99'], { dollar: 'USD' }).waehrung, 'BRL');
    assert.equal(werteTextAus(['Total 24,99 PLN']).waehrung, 'PLN');
    assert.equal(werteTextAus(['Total 24,99 €']).waehrung, 'EUR');
    assert.equal(werteTextAus(['Total CA$24.99']).waehrung, 'CAD');
});

test('PDF: Symbole ohne Entsprechung in der PDF-Schrift erscheinen als Code statt "?"', () => {
    setzeSprache('en');
    for (const c of WAEHRUNGEN) assert.ok(istDarstellbar(erzeugeZeile(abo(12.5, c))[1]), c);
    const text = String.fromCharCode(...erzeugeUebersichtPdf([abo(10, 'EUR'), abo(10, 'USD'), abo(3, 'XYZ')]));
    assert.ok(text.includes('approx.'), 'umgerechnete Summe gekennzeichnet');
    assert.ok(text.includes('Not included: XYZ'));
    setzeSprache('de');
});

test('Alte Sicherungen: Währung bleibt genau so erhalten, wie sie gespeichert war', () => {
    const r = pruefeSicherung(JSON.stringify([abo(1, 'usd'), abo(2, '€'), abo(3, 'Bitcoin')]));
    assert.equal(r.ok, true);
    assert.deepEqual(r.abos.map((a) => a.waehrung), ['usd', '€', 'Bitcoin']);
});

test('Alle fünf Sprachen haben die Texte zur Währung', () => {
    for (const [s, w] of Object.entries(SPRACHEN)) for (const k of ['summe.ca', 'summe.nichtEnthalten', 'waehrung.titel', 'waehrung.hinweis', 'waehrung.auto', 'pdf.fremdwaehrung']) assert.ok(w[k], `${s} ${k}`);
});
