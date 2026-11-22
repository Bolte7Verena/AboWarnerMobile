/**
 * brief-pdf.js | Kündigungsschreiben als PDF (ab 2.0.2), komplett auf dem Gerät.
 *
 * Hochformat A4, in den USA und anderen Letter-Ländern US-Letter. Der Text ist
 * in der PDF markier- und kopierbar. Enthält er Zeichen, die die PDF-Schrift
 * nicht kennt (z.B. Ł, ş, Kyrillisch, Emoji), wird die Seite stattdessen mit den
 * Schriften des Geräts gezeichnet und als Bild eingesetzt: In einem Brief darf
 * nie "?" statt eines Namens stehen.
 */

import { PdfDokument, istDarstellbar } from './pdf.js';
import { papierformat } from './region.js';
import { t } from './i18n.js';

const RAND = { links: 71, rechts: 57, oben: 71, unten: 71 };
const SCHRIFT = 11;
const ZEILE = 15;
const PLATZ_UNTERSCHRIFT = 30;
const BILD_FAKTOR = 2.5; // 180 dpi

const istUnterschriftslinie = (zeile) => /^_{5,}$/.test(zeile.trim());

// Bricht den Text um. messe(text, fett) liefert die Breite in Punkt.
export function brecheUm(text, messe, maxBreite, fett = new Set()) {
    const ergebnis = [];
    for (const roh of String(text).replace(/\r\n?/g, '\n').replace(/\t/g, '    ').split('\n')) {
        const istFett = fett.has(roh.trim()) && roh.trim() !== '';
        if (istUnterschriftslinie(roh) || roh.trim() === '') {
            ergebnis.push({ text: roh.trim(), fett: false });
            continue;
        }
        let zeile = '';
        for (let wort of roh.split(/ +/)) {
            const versuch = zeile ? `${zeile} ${wort}` : wort;
            if (messe(versuch, istFett) <= maxBreite) { zeile = versuch; continue; }
            if (zeile) ergebnis.push({ text: zeile, fett: istFett });
            // Ein einzelnes Wort, das nicht in die Zeile passt, wird geteilt (nichts geht verloren).
            while (messe(wort, istFett) > maxBreite) {
                const zeichen = [...wort];
                let n = zeichen.length;
                while (n > 1 && messe(zeichen.slice(0, n).join(''), istFett) > maxBreite) n--;
                ergebnis.push({ text: zeichen.slice(0, n).join(''), fett: istFett });
                wort = zeichen.slice(n).join('');
            }
            zeile = wort;
        }
        ergebnis.push({ text: zeile, fett: istFett });
    }
    return ergebnis;
}

// Verteilt die Zeilen auf Seiten: [[{ text, fett, y }]]. Unterschriftslinie und
// Name bleiben zusammen und bekommen Platz zum Unterschreiben.
export function verteileAufSeiten(zeilen, hoehe) {
    const ende = hoehe - RAND.unten;
    const seiten = [[]];
    let y = RAND.oben;
    for (const zeile of zeilen) {
        const linie = istUnterschriftslinie(zeile.text);
        const noetig = linie ? PLATZ_UNTERSCHRIFT + 2 * ZEILE : ZEILE;
        if (y + noetig > ende) {
            seiten.push([]);
            y = RAND.oben;
            if (zeile.text === '') continue; // neue Seite nicht mit Leerzeile beginnen
        }
        if (linie) y += PLATZ_UNTERSCHRIFT;
        if (zeile.text !== '') seiten[seiten.length - 1].push({ ...zeile, y: y + SCHRIFT });
        y += ZEILE;
    }
    return seiten.filter((seite, i) => i === 0 || seite.length > 0);
}

function alsText(pdf, text, fett, masse) {
    const zeilen = brecheUm(text, (x, f) => pdf.textBreite(x, SCHRIFT, f), masse.textBreite, fett);
    const seiten = verteileAufSeiten(zeilen, masse.hoehe);
    seiten.forEach((seite, i) => {
        pdf.neueSeite();
        for (const z of seite) pdf.text(RAND.links, z.y, z.text, { groesse: SCHRIFT, fett: z.fett });
        if (seiten.length > 1) pdf.text(masse.breite - RAND.rechts, masse.hoehe - 36, t('pdf.seite', { seite: i + 1, anzahl: seiten.length }), { groesse: 8, farbe: [0.42, 0.45, 0.5], ausrichtung: 'rechts' });
    });
}

function alsBild(pdf, text, fett, masse) {
    const leinwand = document.createElement('canvas');
    leinwand.width = Math.round(masse.breite * BILD_FAKTOR);
    leinwand.height = Math.round(masse.hoehe * BILD_FAKTOR);
    const ctx = leinwand.getContext('2d');
    const schrift = (istFett, groesse = SCHRIFT) => { ctx.font = `${istFett ? 'bold ' : ''}${groesse * BILD_FAKTOR}px Arial, Helvetica, sans-serif`; };
    const messe = (x, f) => { schrift(f); return ctx.measureText(x).width / BILD_FAKTOR; };
    const seiten = verteileAufSeiten(brecheUm(text, messe, masse.textBreite, fett), masse.hoehe);
    seiten.forEach((seite, i) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, leinwand.width, leinwand.height);
        ctx.fillStyle = '#000000';
        for (const z of seite) {
            schrift(z.fett);
            ctx.fillText(z.text, RAND.links * BILD_FAKTOR, z.y * BILD_FAKTOR);
        }
        if (seiten.length > 1) {
            schrift(false, 8);
            ctx.fillStyle = '#6b7380';
            ctx.textAlign = 'right';
            ctx.fillText(t('pdf.seite', { seite: i + 1, anzahl: seiten.length }), (masse.breite - RAND.rechts) * BILD_FAKTOR, (masse.hoehe - 36) * BILD_FAKTOR);
            ctx.textAlign = 'left';
        }
        const base64 = leinwand.toDataURL('image/jpeg', 0.9).split(',')[1];
        pdf.neueSeite();
        pdf.bild(atob(base64), 0, 0, masse.breite, masse.hoehe, leinwand.width, leinwand.height);
    });
    leinwand.width = 0;
    leinwand.height = 0;
}

// text: der Brief, wie er im Feld steht. fettZeilen: z.B. die Betreffzeile.
export function erzeugeBriefPdf(text, { titel = '', fettZeilen = [], papier = papierformat() } = {}) {
    // papierformat liefert Querformat, der Brief ist hochkant.
    const masse = { breite: papier.hoehe, hoehe: papier.breite, textBreite: papier.hoehe - RAND.links - RAND.rechts };
    const pdf = new PdfDokument({ breite: masse.breite, hoehe: masse.hoehe, titel });
    const fett = new Set(fettZeilen.map((z) => z.trim()));
    const sauber = String(text).replace(/[​-‏﻿]/g, '').trimEnd();
    if (istDarstellbar(sauber.replace(/\s/g, ' '))) alsText(pdf, sauber, fett, masse);
    else alsBild(pdf, sauber, fett, masse);
    return pdf.erzeuge();
}
