/**
 * brief-pdf.test.js | Kündigungsschreiben als PDF. Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { brecheUm, erzeugeBriefPdf, verteileAufSeiten } from '../src/brief-pdf.js';
import { erzeugeSchreibenText } from '../src/kuendigungsschreiben.js';
import { BRIEF_FASSUNGEN } from '../src/briefe.js';
import { setzeSprache } from '../src/i18n.js';
import { PdfDokument } from '../src/pdf.js';
import { pruefeSicherung } from '../src/sicherung.js';

const A4 = { breite: 842, hoehe: 595 };
const LETTER = { breite: 792, hoehe: 612 };
const alsText = (bytes) => Buffer.from(bytes).toString('latin1');
// Sichtbarer Text aus den Textbefehlen (Oktal zurück, WinAnsi-Sonderzeichen grob).
const inhalt = (bytes) => [...alsText(bytes).matchAll(/\(((?:\\.|[^()\\])*)\) Tj/g)].map((m) => m[1].replace(/\\(\d{3})/g, (_, o) => new TextDecoder('windows-1252').decode(Uint8Array.of(parseInt(o, 8)))).replace(/\\([()\\])/g, '$1'));
const ABSENDER = { name: 'Jörg Müßig', strasse: 'Straße 1', plzOrt: '12345 Köln', email: 'j@example.org' };
const ABO = { name: 'Fitneßstudio „Œuvre“', vertragspartner: 'Muster GmbH (Nord)\nWeg 2\n12345 Ort', vertragsnummer: 'V-1', kundennummer: 'K\\2' };

test('Jede Fassung: gültige PDF im Hochformat, eine Seite, kompletter Text, fetter Betreff', () => {
    for (const f of BRIEF_FASSUNGEN) for (const papier of [A4, LETTER]) for (const einschreiben of [false, true]) {
        setzeSprache(f.slice(0, 2));
        const text = erzeugeSchreibenText(ABO, ABSENDER, new Date(2026, 10, 23), f, einschreiben);
        const betreff = text.split('\n').find((z) => /[–:] Fitneß/.test(z));
        const pdf = erzeugeBriefPdf(text, { titel: 'Test', fettZeilen: [betreff], papier });
        const roh = alsText(pdf);
        assert.ok(roh.startsWith('%PDF-1.4\n') && roh.endsWith('%%EOF\n'), f);
        assert.ok(roh.includes(`/MediaBox [0 0 ${papier.hoehe} ${papier.breite}]`), f);
        assert.equal((roh.match(/\/Type \/Page /g) || []).length, 1, f);
        const gedruckt = inhalt(pdf).join(' ').replace(/\s+/g, ' ');
        assert.equal(gedruckt, text.replace(/\s+/g, ' ').replace(/\u202f/g, ' '), f);
        assert.ok(!gedruckt.includes('?'), f);
        assert.ok(/\/F2 11 Tf/.test(roh), f + ' Betreff fett');
        // kein Text rechts über den Rand
        for (const m of roh.matchAll(/BT \/F(\d) 11 Tf .*? rg ([\d.]+) ([\d.]+) Td \(((?:\\.|[^()\\])*)\) Tj/g)) {
            assert.ok(Number(m[3]) >= 60 && Number(m[3]) <= papier.breite - 60, f);
        }
    }
    setzeSprache('de');
});

test('Umbruch: nichts geht verloren, nichts ragt über den Rand, auch bei 300 Zeichen ohne Leerzeichen', () => {
    const pdf = new PdfDokument();
    const messe = (x, f) => pdf.textBreite(x, 11, f);
    for (const text of ['W'.repeat(300), 'kurz', 'Wort '.repeat(300).trim(), 'a\tb', 'x'.repeat(90) + ' ' + 'y'.repeat(200), '', 'Zeile1\r\nZeile2', '€'.repeat(120)]) {
        const zeilen = brecheUm(text, messe, 467);
        assert.ok(zeilen.every((z) => messe(z.text, z.fett) <= 467), text.slice(0, 10));
        assert.equal(zeilen.map((z) => z.text).join('').replace(/\s/g, ''), text.replace(/\s/g, ''));
    }
});

test('Langer Brief: mehrere Seiten mit Seitenzahl, Unterschriftslinie und Name bleiben zusammen', () => {
    setzeSprache('de');
    for (let n = 30; n < 110; n++) {
        const text = [...Array(n).fill('Zeile'), '', '_______________________', 'Max'].join('\n');
        const seiten = verteileAufSeiten(brecheUm(text, (x) => x.length * 5, 467), 842);
        const mitLinie = seiten.findIndex((s) => s.some((z) => z.text.startsWith('___')));
        assert.ok(seiten[mitLinie].some((z) => z.text === 'Max'), String(n));
        assert.ok(seiten.flat().every((z) => z.y <= 842 - 60), String(n));
        assert.equal(seiten.flat().length, n + 2, String(n));
        if (seiten.length > 1) assert.ok(inhalt(erzeugeBriefPdf(text, { papier: A4 })).includes(`Seite 1 von ${seiten.length}`), String(n));
    }
    assert.equal(alsText(erzeugeBriefPdf('', { papier: A4 })).slice(0, 5), '%PDF-');
});

test('Bild in der PDF: Struktur stimmt', () => {
    const pdf = new PdfDokument({ breite: 595, hoehe: 842 });
    pdf.neueSeite();
    pdf.bild(String.fromCharCode(0xff, 0xd8, 0x00, 0xff, 0xd9), 0, 0, 595, 842, 10, 10);
    const roh = alsText(pdf.erzeuge());
    assert.ok(roh.includes('/Filter [/ASCIIHexDecode /DCTDecode]') && roh.includes('ffd800ffd9>') && /\/XObject << \/B1 \d+ 0 R >>/.test(roh) && roh.includes('/B1 Do'));
    const startxref = Number(/startxref\n(\d+)/.exec(roh)[1]);
    assert.equal(roh.slice(startxref, startxref + 4), 'xref');
});

test('PDF statt Sicherung gewählt: klare Meldung in allen Sprachen', () => {
    for (const s of ['de', 'en', 'es', 'fr', 'pt']) {
        setzeSprache(s);
        const r = pruefeSicherung('%PDF-1.4\n1 0 obj');
        assert.equal(r.ok, false);
        assert.ok(r.meldung.includes('PDF') && r.meldung.includes('.json'), s);
    }
    setzeSprache('de');
});
