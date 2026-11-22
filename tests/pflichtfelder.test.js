/**
 * pflichtfelder.test.js | Meldung nennt genau das fehlende Feld (5 Sprachen).
 * Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { pruefeEingabe, fehlerZusammenfassung } from '../src/pflichtfelder.js';
import { Calculator, erzeugeFristFelder, parseBetrag, parseFristAnzahl } from '../src/calculator.js';
import { setzeSprache, t, SPRACHEN } from '../src/i18n.js';

const GUT = { name: 'Netflix', kosten: '6,99', kategorie: 'Streaming', naechsteZahlung: '2027-02-28', frist: '30', fristEinheit: 'tage', probe: false, probeEnde: '' };
const felder = (x) => pruefeEingabe({ ...GUT, ...x }).map((f) => f.feld);

test('Alles ausgefüllt: keine Meldung', () => {
    assert.deepEqual(felder({}), []);
    for (const x of [{ frist: '0' }, { frist: '3650' }, { frist: '120', fristEinheit: 'monate' }, { kosten: '0' }, { kosten: '0,01' }, { kosten: '999.999.999,99' }, { name: 'x'.repeat(300) }, { naechsteZahlung: '2028-02-29' }, { probe: true, probeEnde: '2027-01-31' }]) assert.deepEqual(felder(x), [], JSON.stringify(x).slice(0, 60));
});

test('Genau das fehlende Feld wird genannt', () => {
    for (const [feld, x] of [['name', { name: '' }], ['name', { name: '   ' }], ['kosten', { kosten: '' }], ['kosten', { kosten: 'abc' }], ['kosten', { kosten: '-5' }], ['kosten', { kosten: '6 99' }], ['kosten', { kosten: '9'.repeat(400) }], ['kategorie', { kategorie: '' }], ['naechsteZahlung', { naechsteZahlung: '' }], ['naechsteZahlung', { naechsteZahlung: 'morgen' }], ['frist', { frist: '' }], ['frist', { frist: '-1' }], ['frist', { frist: '2.5' }], ['frist', { frist: 'abc' }], ['frist', { frist: '3651' }], ['frist', { frist: '121', fristEinheit: 'monate' }], ['frist', { frist: '999999999' }], ['probeEnde', { probe: true }]]) {
        assert.deepEqual(felder(x), [feld], JSON.stringify(x).slice(0, 50));
    }
    assert.deepEqual(felder({ name: undefined, kosten: null, kategorie: undefined, naechsteZahlung: null, frist: undefined, probe: true, probeEnde: undefined }), ['name', 'kosten', 'kategorie', 'naechsteZahlung', 'frist', 'probeEnde']);
});

test('Texte in allen Sprachen: eigener Text je Feld, nie der alte Sammeltext', () => {
    for (const s of Object.keys(SPRACHEN)) {
        setzeSprache(s);
        const alle = pruefeEingabe({ probe: true });
        assert.equal(new Set(alle.map((f) => f.text)).size, 6, s);
        for (const f of alle) {
            assert.ok(f.text.length > 10 && !/[{}]|undefined|fehlt\./.test(f.text) && f.text !== t('feld.fehler'), `${s} ${f.text}`);
            assert.equal(fehlerZusammenfassung([f]), f.text);
        }
        const zusammen = fehlerZusammenfassung(alle);
        for (const k of ['feld.name', 'feld.kosten', 'feld.kategorie', 'feld.naechsteZahlung', 'feld.frist', 'fehlt.probeFeld']) assert.ok(zusammen.includes(t(k)), `${s} ${zusammen}`);
        assert.equal(fehlerZusammenfassung([]), '');
    }
    setzeSprache('de');
    assert.equal(pruefeEingabe({ ...GUT, frist: '' })[0].text, 'Bitte die Kündigungsfrist eintragen.');
    assert.equal(fehlerZusammenfassung(pruefeEingabe({ ...GUT, frist: '', kategorie: '' })), 'Bitte noch ausfüllen: Kategorie und Kündigungsfrist.');
});

test('Wer hier durchkommt, lässt sich immer speichern (kein Sammeltext mehr nötig)', () => {
    const werte = { name: ['Netflix', 'x'], kosten: ['0', '6,99', '6.99', '1.250,50', '€5'], naechsteZahlung: ['2024-02-29', '2027-01-31', '2026-12-31'], frist: ['0', '1', '30', '120'], fristEinheit: ['tage', 'wochen', 'monate'], probe: [false, true] };
    for (const name of werte.name) for (const kosten of werte.kosten) for (const naechsteZahlung of werte.naechsteZahlung) for (const frist of werte.frist) for (const fristEinheit of werte.fristEinheit) for (const probe of werte.probe) {
        const x = { ...GUT, name, kosten, naechsteZahlung, frist, fristEinheit, probe, probeEnde: probe ? '2027-01-01' : '' };
        assert.deepEqual(pruefeEingabe(x), []);
        assert.equal(Calculator.istGueltig({ name, kosten: parseBetrag(kosten), waehrung: 'EUR', turnus: 'Monatlich', naechsteZahlung, ...erzeugeFristFelder(parseFristAnzahl(frist), fristEinheit), ...(probe ? { probeabo: true, probeEndeAm: x.probeEnde } : {}) }), true, JSON.stringify(x));
    }
});
