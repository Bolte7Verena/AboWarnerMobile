/**
 * sonderfaelle.test.js | Fehler aus der gezielten Fehlersuche (Paket 9):
 * Grenzwerte, sehr lange Texte, fremde Angaben aus Sicherungsdateien.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Calculator, MAX_BETRAG, MAX_FRIST, istFristZuLang, ermittleFristStatus, ermittleKuendigungsfrist, erzeugeFristFelder, TURNUS_MONATE, naechsteZahlungAb, parseBetrag, parseFristAnzahl } from '../src/calculator.js';
import { normalisiereWaehrung, rechneUm } from '../src/waehrungen.js';
import { pruefeSicherung } from '../src/sicherung.js';
import { zuDateiSicheremNamen } from '../src/kuendigungsschreiben.js';
import { PdfDokument, istDarstellbar } from '../src/pdf.js';

const abo = { id: 'a', name: 'X', kosten: 5, waehrung: 'EUR', turnus: 'Monatlich', naechsteZahlung: '2026-12-01', kuendigungsfristTage: 30 };
const summe = (liste) => Calculator.berechneSummen(liste.map((x) => ({ ...abo, ...x })), 'EUR');

test('Unendlicher oder zu großer Betrag wird abgelehnt', () => {
    assert.equal(Calculator.istGueltig({ ...abo, kosten: parseBetrag('9'.repeat(400)) }), false);
    assert.equal(Calculator.istGueltig({ ...abo, kosten: MAX_BETRAG * 10 }), false);
    assert.equal(Calculator.istGueltig({ ...abo, kosten: 999999999.99 }), true);
    assert.equal(Calculator.istGueltig({ ...abo, kosten: 0 }), true);
    assert.equal(pruefeSicherung(JSON.stringify([abo]).replace('"kosten":5', '"kosten":1e999')).ok, false);
});

test('Ein unbrauchbarer Betrag macht die Summe nicht kaputt', () => {
    for (const kosten of [null, NaN, Infinity, undefined, 'abc']) assert.equal(summe([{ kosten }, { kosten: 5 }]).monat, 5, String(kosten));
});

test('Geerbte Namen aus einer Datei gelten nicht als Turnus oder Währung', () => {
    for (const name of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
        assert.equal(TURNUS_MONATE[name], undefined, name);
        assert.equal(pruefeSicherung(JSON.stringify([{ ...abo, turnus: name }])).ok, false, name);
        assert.equal(normalisiereWaehrung(name), name);
        assert.equal(rechneUm(5, name, 'EUR'), null, name);
    }
    assert.deepEqual(summe([{ waehrung: 'constructor' }, {}]), { monat: 5, jahr: 60, umgerechnet: false, nichtEnthalten: ['constructor'] });
});

test('Frist-Eingabe: 1e3 ist 1000, leer und Text sind ungültig', () => {
    assert.equal(parseFristAnzahl('30'), 30);
    assert.equal(parseFristAnzahl('1e3'), 1000);
    assert.equal(parseFristAnzahl('2.5'), 2);
    assert.equal(parseFristAnzahl('0'), 0);
    for (const wert of ['', '  ', 'abc', null, undefined]) assert.ok(isNaN(parseFristAnzahl(wert)), String(wert));
});

test('Frist: höchstens 10 Jahre, genau am Höchstwert noch erlaubt und berechenbar', () => {
    for (const [einheit, max] of Object.entries(MAX_FRIST)) {
        assert.equal(istFristZuLang(max, einheit), false, einheit);
        assert.equal(istFristZuLang(max + 1, einheit), true, einheit);
        for (const turnus of Object.keys(TURNUS_MONATE)) assert.ok(ermittleKuendigungsfrist({ ...abo, turnus, ...erzeugeFristFelder(max, einheit) }), `${einheit} ${turnus}`);
    }
    assert.equal(istFristZuLang(999999999, 'tage'), true);
    assert.equal(istFristZuLang(Infinity, 'monate'), true);
    assert.equal(istFristZuLang(NaN, 'tage'), false, 'leer meldet istGueltig');
});

test('Alte Daten mit unsinniger Frist: nicht grün, Sicherung bleibt einlesbar', () => {
    const alt = { ...abo, kuendigungsfristTage: 999999999 };
    assert.equal(ermittleFristStatus(alt), 'warnung');
    assert.equal(pruefeSicherung(JSON.stringify([alt])).ok, true);
});

test('Mehrdeutige Beträge werden nicht geraten', () => {
    for (const wert of ['1.2.3', '1,2,3', '1..5', '12.34.56', '1.250.5000']) assert.ok(isNaN(parseBetrag(wert)), wert);
    assert.equal(parseBetrag('1.234.567'), 1234567);
    assert.equal(parseBetrag('5,-'), 5);
});

test('Sehr altes Datum: nächste Zahlung liegt trotzdem nicht in der Vergangenheit', () => {
    assert.equal(naechsteZahlungAb('1899-08-31', 'Monatlich', new Date(2028, 1, 1)), '2028-02-29');
});

test('Dateiname des Schreibens: höchstens 60 Zeichen, nie leer', () => {
    assert.equal(zuDateiSicheremNamen('ä'.repeat(300)).length, 60);
    assert.equal(zuDateiSicheremNamen('日本語 😀'), 'Abo');
    assert.equal(zuDateiSicheremNamen('A/B:C*?'), 'A_B_C');
    assert.equal(zuDateiSicheremNamen('Netflix'), 'Netflix');
});

test('PDF: Beträge werden kleiner statt gekürzt, langer Text bricht um, œ und ™ sind darstellbar', () => {
    const pdf = new PdfDokument();
    const text = '123.456.789.012,34 US$';
    const g = pdf.passendeGroesse(text, 82, 9.5);
    assert.ok(g < 9.5 && g > 5 && pdf.textBreite(text, g) <= 82);
    assert.equal(pdf.passendeGroesse('5,00 €', 82, 9.5), 9.5);
    const zeilen = pdf.umbruch('Wort '.repeat(200), 300, 8.5);
    assert.ok(zeilen.length > 5 && zeilen.every((z) => pdf.textBreite(z, 8.5) <= 300));
    assert.ok(istDarstellbar('Œuvre œ ™ Š š Ž ž'));
});
