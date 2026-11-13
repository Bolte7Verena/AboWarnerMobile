/**
 * uebersicht-pdf.test.js | PDF-Übersicht (pdf.js + uebersicht-pdf.js).
 * Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { PdfDokument } from '../src/pdf.js';
import { erzeugeUebersichtPdf, erzeugeZeile, dateinameUebersicht } from '../src/uebersicht-pdf.js';

function heutePlusTage(tage) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + tage);
    return d;
}
function zuISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function zuDE(d) {
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}
const alsText = (bytes) => String.fromCharCode(...bytes);

// Prüft, dass jeder xref-Eintrag exakt auf "n 0 obj" zeigt und startxref stimmt.
function pruefeStruktur(text) {
    assert.ok(text.startsWith('%PDF-1.4\n'));
    assert.ok(text.endsWith('%%EOF\n'));
    const startxref = Number(/startxref\n(\d+)\n%%EOF/.exec(text)[1]);
    assert.equal(text.slice(startxref, startxref + 4), 'xref');
    const eintraege = text.slice(startxref).split('\n').slice(3).filter((z) => / 00000 n $/.test(z));
    eintraege.forEach((z, i) => {
        const offset = Number(z.slice(0, 10));
        assert.equal(text.slice(offset, offset + `${i + 1} 0 obj`.length), `${i + 1} 0 obj`, `Objekt ${i + 1}`);
    });
    for (const m of text.matchAll(/<< \/Length (\d+) >>\nstream\n/g)) {
        const start = m.index + m[0].length;
        assert.equal(text.slice(start + Number(m[1]), start + Number(m[1]) + 10), '\nendstream');
    }
}

const BASIS = { kosten: 17.99, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Streaming', kuendigungsfristTage: 14 };

test('PdfDokument: gültige Struktur, nur ASCII-Bytes, Umlaute/€ als WinAnsi kodiert', () => {
    const pdf = new PdfDokument({ titel: 'Test' });
    pdf.text(40, 40, 'Grüße Äpfel Öl Übung ß 9,99 € „Zitat“ – Ende…');
    const bytes = pdf.erzeuge();
    const text = alsText(bytes);
    pruefeStruktur(text);
    assert.ok([...bytes].every((b) => b < 128), 'nur ASCII');
    assert.ok(text.includes('Gr\\374\\337e \\304pfel \\326l \\334bung \\337 9,99 \\200 \\204Zitat\\223 \\226 Ende\\205'));
});

test('PdfDokument: Klammern und Backslash werden maskiert, Emojis zu "?"', () => {
    const pdf = new PdfDokument();
    pdf.text(40, 40, 'a(b)c\\d 😀');
    const text = alsText(pdf.erzeuge());
    assert.ok(text.includes('(a\\(b\\)c\\\\d ?)'));
});

test('PdfDokument: kuerze() kürzt lange Texte mit …', () => {
    const pdf = new PdfDokument();
    const lang = 'Ein sehr langer Abo-Name, der niemals in eine schmale Spalte passt';
    const kurz = pdf.kuerze(lang, 100, 10);
    assert.ok(kurz.endsWith('…'));
    assert.ok(pdf.textBreite(kurz, 10) <= 100);
    assert.equal(pdf.kuerze('Kurz', 100, 10), 'Kurz');
});

test('Übersicht: Zeile eines laufenden Abos mit deutschem Datum', () => {
    const abo = { ...BASIS, id: 'n', name: 'Netflix', naechsteZahlung: zuISO(heutePlusTage(40)) };
    assert.deepEqual(erzeugeZeile(abo), ['Netflix', '17,99 EUR', 'Monatlich', zuDE(heutePlusTage(40)), zuDE(heutePlusTage(26)), 'läuft']);
});

test('Übersicht: gekündigt (laufend), beendet und altes gekündigtes Abo', () => {
    const laufend = { ...BASIS, id: 'a', name: 'Miete', naechsteZahlung: zuISO(heutePlusTage(10)), gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(30)) };
    assert.equal(erzeugeZeile(laufend)[5], `gekündigt zum ${zuDE(heutePlusTage(30))}`);
    assert.equal(erzeugeZeile(laufend)[4], '–');
    const beendet = { ...BASIS, id: 'b', name: 'Alt', naechsteZahlung: zuISO(heutePlusTage(10)), gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(-2)) };
    assert.equal(erzeugeZeile(beendet)[5], `beendet (zum ${zuDE(heutePlusTage(-2))})`);
    assert.equal(erzeugeZeile(beendet)[3], '–');
    const alt = { ...BASIS, id: 'c', name: 'Ganz alt', naechsteZahlung: zuISO(heutePlusTage(10)), gekuendigt: true };
    assert.equal(erzeugeZeile(alt)[5], 'gekündigt');
});

test('Übersicht: enthält Spaltenköpfe, Abos und Summen; keine Webadresse', () => {
    const abos = [
        { ...BASIS, id: '1', name: 'Netflix', naechsteZahlung: zuISO(heutePlusTage(20)) },
        { ...BASIS, id: '2', name: 'Versicherung', kosten: 120, turnus: 'Jährlich', naechsteZahlung: zuISO(heutePlusTage(200)) }
    ];
    const text = alsText(erzeugeUebersichtPdf(abos));
    pruefeStruktur(text);
    for (const t of ['(Abo)', '(Kosten)', '(Turnus)', '(N\\344chste Zahlung)', '(K\\374ndigung m\\366glich bis)', '(Status)', '(Netflix)', '(Versicherung)']) {
        assert.ok(text.includes(t), t);
    }
    // 17,99 + 120/12 = 27,99 pro Monat; *12 = 335,88 pro Jahr
    assert.ok(text.includes('(pro Monat: 27,99 \\200)'));
    assert.ok(text.includes('(pro Jahr: 335,88 \\200)'));
    assert.ok(!/https?:|www\./i.test(text), 'keine URL in der PDF');
});

test('Übersicht: viele Abos ergeben mehrere Seiten mit "Seite x von y"', () => {
    const abos = Array.from({ length: 60 }, (_, i) => ({ ...BASIS, id: `a${i}`, name: `Abo ${i + 1}`, naechsteZahlung: zuISO(heutePlusTage(i + 1)) }));
    const text = alsText(erzeugeUebersichtPdf(abos));
    pruefeStruktur(text);
    const seiten = Number(/\/Count (\d+)/.exec(text)[1]);
    assert.ok(seiten >= 3, `Seiten: ${seiten}`);
    assert.ok(text.includes(`(Seite ${seiten} von ${seiten})`));
    for (let i = 1; i <= 60; i++) assert.ok(text.includes(`(Abo ${i})`), `Abo ${i}`);
});

test('Übersicht: leere Liste erzeugt trotzdem eine gültige PDF', () => {
    const text = alsText(erzeugeUebersichtPdf([]));
    pruefeStruktur(text);
    assert.ok(text.includes('(Keine Abos gespeichert.)'));
});

test('Dateiname mit Datum', () => {
    assert.match(dateinameUebersicht(new Date(2026, 10, 13)), /^Abo-Uebersicht-2026-11-13\.pdf$/);
});
