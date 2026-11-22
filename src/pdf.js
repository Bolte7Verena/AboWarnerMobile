/**
 * pdf.js | Sehr kleiner, eigener PDF-Erzeuger (PDF 1.4) — komplett lokal,
 * ohne Bibliothek, ohne Netzwerk.
 *
 * Kann genau das, was die Abo-Übersicht braucht: mehrere Seiten, Text in
 * Helvetica / Helvetica-Bold (zwei der 14 Standardschriften, die jeder
 * PDF-Betrachter eingebaut hat — es wird keine Schriftdatei eingebettet),
 * Linien und gefüllte Rechtecke. Zeichen werden als WinAnsi (Windows-1252)
 * kodiert: deckt Deutsch inkl. ä ö ü ß € „ “ – … ab. Andere Zeichen
 * (z.B. Emojis) erscheinen als "?".
 *
 * Koordinaten in Punkt (1/72 Zoll), Ursprung OBEN links (wird intern auf das
 * PDF-System mit Ursprung unten links umgerechnet).
 */

// --- Zeichenkodierung (WinAnsi) ---

const WINANSI_SONDERZEICHEN = {
    '€': 0x80, '‚': 0x82, '„': 0x84, '…': 0x85, '‘': 0x91, '’': 0x92,
    '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97,
    'ƒ': 0x83, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e,
    '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f
};

// Liefert den WinAnsi-Code eines Zeichens oder den Code von "?".
function zuWinAnsi(zeichen) {
    const code = zeichen.codePointAt(0);
    if (code >= 0x20 && code <= 0x7e) return code;
    if (code >= 0xa0 && code <= 0xff) return code;
    if (WINANSI_SONDERZEICHEN[zeichen] !== undefined) return WINANSI_SONDERZEICHEN[zeichen];
    if (zeichen === ' ' || zeichen === ' ') return 0x20; // schmale Leerzeichen
    return 0x3f; // "?"
}

// Lässt sich der Text in der PDF-Schrift darstellen (sonst stünde "?" da, z.B. bei ₹ oder zł)?
export function istDarstellbar(text) {
    return [...String(text)].every((z) => z === '?' || zuWinAnsi(z) !== 0x3f);
}

function zuCodes(text) {
    return [...String(text).replace(/[\r\n\t]+/g, ' ')].map(zuWinAnsi);
}

// PDF-String-Literal: ( ) \ maskieren, alles außerhalb ASCII als Oktal.
function pdfString(codes) {
    let s = '(';
    for (const c of codes) {
        if (c === 0x28 || c === 0x29 || c === 0x5c) s += '\\' + String.fromCharCode(c);
        else if (c < 0x20 || c > 0x7e) s += '\\' + c.toString(8).padStart(3, '0');
        else s += String.fromCharCode(c);
    }
    return s + ')';
}

// --- Zeichenbreiten (Adobe-Standardwerte, Einheit 1/1000 der Schriftgröße) ---

const ASCII_REGULAR = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
    1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
    333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
    556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const ASCII_BOLD = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
    556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
    975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
    333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
    611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];

function baueBreiten(ascii, extra) {
    const breiten = new Array(256).fill(556);
    ascii.forEach((b, i) => { breiten[0x20 + i] = b; });
    // Akzentbuchstaben (z.B. é, ç, ñ, ã) sind in Helvetica so breit wie ihr
    // Grundbuchstabe — wichtig für Spanisch, Französisch, Portugiesisch.
    for (let code = 0xc0; code <= 0xff; code++) {
        const grund = String.fromCharCode(code).normalize('NFD')[0];
        if (/[A-Za-z]/.test(grund)) breiten[code] = ascii[grund.charCodeAt(0) - 0x20];
    }
    for (const [code, b] of Object.entries(extra)) breiten[Number(code)] = b;
    return breiten;
}

const BREITEN = {
    regular: baueBreiten(ASCII_REGULAR, {
        0x89: 1000, 0x8a: 667, 0x8b: 333, 0x8c: 1000, 0x8e: 611, 0x99: 1000, 0x9a: 500, 0x9b: 333, 0x9c: 944, 0x9e: 500, 0x9f: 667,
        0x80: 556, 0x84: 333, 0x85: 1000, 0x93: 333, 0x94: 333, 0x96: 556, 0x97: 1000, 0xa0: 278,
        0xb7: 278, 0xb0: 400, 0xa7: 556, 0xc4: 667, 0xd6: 778, 0xdc: 722, 0xdf: 611, 0xe4: 556, 0xf6: 556, 0xfc: 556
    }),
    bold: baueBreiten(ASCII_BOLD, {
        0x89: 1000, 0x8a: 667, 0x8b: 333, 0x8c: 1000, 0x8e: 611, 0x99: 1000, 0x9a: 556, 0x9b: 333, 0x9c: 944, 0x9e: 500, 0x9f: 667,
        0x80: 556, 0x84: 500, 0x85: 1000, 0x93: 500, 0x94: 500, 0x96: 556, 0x97: 1000, 0xa0: 278,
        0xb7: 278, 0xb0: 400, 0xa7: 556, 0xc4: 722, 0xd6: 778, 0xdc: 722, 0xdf: 611, 0xe4: 556, 0xf6: 611, 0xfc: 611
    })
};

function zahl(n) {
    return Number(n.toFixed(2)).toString();
}

function farbe([r, g, b]) {
    return `${zahl(r)} ${zahl(g)} ${zahl(b)}`;
}

export class PdfDokument {
    constructor({ breite = 842, hoehe = 595, titel = '' } = {}) {
        this.breite = breite;
        this.hoehe = hoehe;
        this.titel = titel;
        this.seiten = [];
    }

    neueSeite() {
        this.seiten.push([]);
        return this.seiten.length;
    }

    aktuelleSeite() {
        if (this.seiten.length === 0) this.neueSeite();
        return this.seiten[this.seiten.length - 1];
    }

    textBreite(text, groesse, fett = false) {
        const tabelle = fett ? BREITEN.bold : BREITEN.regular;
        return zuCodes(text).reduce((summe, c) => summe + tabelle[c], 0) * groesse / 1000;
    }

    // Kürzt einen Text mit "…", bis er in maxBreite passt.
    kuerze(text, maxBreite, groesse, fett = false) {
        let t = String(text);
        if (this.textBreite(t, groesse, fett) <= maxBreite) return t;
        while (t.length > 0 && this.textBreite(t + '…', groesse, fett) > maxBreite) t = t.slice(0, -1);
        return t.trimEnd() + '…';
    }

    // Schriftgröße, mit der ein Text ungekürzt in maxBreite passt (höchstens `groesse`).
    passendeGroesse(text, maxBreite, groesse, fett = false) {
        const breite = this.textBreite(text, groesse, fett);
        return breite <= maxBreite ? groesse : Math.floor(groesse * maxBreite / breite * 100) / 100;
    }

    // Bricht einen Text an Leerzeichen in Zeilen um; zu lange Wörter werden gekürzt.
    umbruch(text, maxBreite, groesse, fett = false) {
        const zeilen = [];
        for (const wort of String(text).split(/\s+/).filter(Boolean)) {
            const versuch = zeilen.length ? `${zeilen[zeilen.length - 1]} ${wort}` : wort;
            if (zeilen.length && this.textBreite(versuch, groesse, fett) <= maxBreite) zeilen[zeilen.length - 1] = versuch;
            else zeilen.push(this.kuerze(wort, maxBreite, groesse, fett));
        }
        return zeilen;
    }

    // ausrichtung: 'links' | 'rechts' (x ist dann die rechte Kante)
    text(x, y, text, { groesse = 10, fett = false, farbe: f = [0, 0, 0], ausrichtung = 'links', seite } = {}) {
        const ziel = seite ? this.seiten[seite - 1] : this.aktuelleSeite();
        const startX = ausrichtung === 'rechts' ? x - this.textBreite(text, groesse, fett) : x;
        ziel.push(`BT /${fett ? 'F2' : 'F1'} ${zahl(groesse)} Tf ${farbe(f)} rg ${zahl(startX)} ${zahl(this.hoehe - y)} Td ${pdfString(zuCodes(text))} Tj ET`);
    }

    linie(x1, y1, x2, y2, { staerke = 0.5, farbe: f = [0.8, 0.8, 0.8] } = {}) {
        this.aktuelleSeite().push(`${zahl(staerke)} w ${farbe(f)} RG ${zahl(x1)} ${zahl(this.hoehe - y1)} m ${zahl(x2)} ${zahl(this.hoehe - y2)} l S`);
    }

    rechteck(x, y, w, h, { fuellfarbe = [0.95, 0.95, 0.95] } = {}) {
        this.aktuelleSeite().push(`${farbe(fuellfarbe)} rg ${zahl(x)} ${zahl(this.hoehe - y - h)} ${zahl(w)} ${zahl(h)} re f`);
    }

    // Erzeugt die fertige PDF-Datei als Uint8Array (reines ASCII).
    erzeuge() {
        if (this.seiten.length === 0) this.neueSeite();
        const objekte = [];
        const neu = (inhalt) => { objekte.push(inhalt); return objekte.length; };

        const katalogNr = neu(null);
        const seitenNr = neu(null);
        const f1 = neu('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
        const f2 = neu('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');

        const seitenRefs = this.seiten.map((befehle) => {
            const stream = befehle.join('\n');
            const inhaltNr = neu(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
            return neu(`<< /Type /Page /Parent ${seitenNr} 0 R /MediaBox [0 0 ${this.breite} ${this.hoehe}] `
                + `/Resources << /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >> /Contents ${inhaltNr} 0 R >>`);
        });

        objekte[katalogNr - 1] = `<< /Type /Catalog /Pages ${seitenNr} 0 R >>`;
        objekte[seitenNr - 1] = `<< /Type /Pages /Kids [${seitenRefs.map((n) => `${n} 0 R`).join(' ')}] /Count ${seitenRefs.length} >>`;
        const infoNr = neu(`<< /Title ${pdfString(zuCodes(this.titel))} /Producer (Abo-Warner Pro) >>`);

        let pdf = '%PDF-1.4\n';
        const offsets = [];
        objekte.forEach((inhalt, i) => {
            offsets.push(pdf.length);
            pdf += `${i + 1} 0 obj\n${inhalt}\nendobj\n`;
        });
        const xrefStart = pdf.length;
        pdf += `xref\n0 ${objekte.length + 1}\n0000000000 65535 f \n`;
        pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
        pdf += `trailer\n<< /Size ${objekte.length + 1} /Root ${katalogNr} 0 R /Info ${infoNr} 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

        const bytes = new Uint8Array(pdf.length);
        for (let i = 0; i < pdf.length; i++) bytes[i] = pdf.charCodeAt(i);
        return bytes;
    }
}
