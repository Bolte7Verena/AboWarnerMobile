/**
 * uebersicht-pdf.js | "Übersicht als PDF": lesbare Liste aller Abos zum
 * Ausdrucken oder Weitergeben. Reine Funktion (ohne DOM/Capacitor) — liefert
 * die PDF-Datei als Uint8Array. Alles wird auf dem Gerät erzeugt (pdf.js),
 * nichts wird übertragen.
 *
 * Inhalt: Name, Kosten, Turnus, nächste Zahlung, Kündigung möglich bis,
 * Status (läuft / gekündigt zum ... / beendet), dazu die Summe der laufenden
 * Kosten pro Monat und pro Jahr (gleiche Berechnung wie die Übersichtskacheln
 * der App). Datum und Beträge landesüblich. Querformat: A4, in den USA und
 * anderen Letter-Ländern US-Letter (siehe papierformat in region.js).
 */

import { PdfDokument, istDarstellbar } from './pdf.js';
import { BildDokument } from './pdf-bild.js';
import { ermittleHauptwaehrung, normalisiereWaehrung } from './waehrungen.js';
import {
    Calculator, ermittleEffektivesZahlungsdatum, ermittleHandlungsDatum, istProbezeitLaufend,
    formatiereDatumISO, istGekuendigtLaufend, istVertragBeendet,
    parseDatumISO, sortiereAbos
} from './calculator.js';
import { t, tAnzahl, tWert, formatiereDatum, formatiereBetrag } from './i18n.js';
import { papierformat } from './region.js';

const RAND = 40;
const A4_BREITE = 842; // für dieses Maß sind die Spalten unten angegeben
const ZEILENHOEHE = 20;
const SCHRIFT = 9.5;
const GRAU = [0.42, 0.45, 0.5];
const DUNKEL = [0.1, 0.12, 0.18];

// x = linke Kante (bzw. rechte Kante bei ausrichtung 'rechts'), w = Breite.
// Spaltentitel aus der Sprachdatei (erst beim Erzeugen, nicht beim Laden).
const SPALTEN_A4 = [
    { titel: 'pdf.spalteAbo', x: RAND, w: 190 },
    { titel: 'pdf.spalteKosten', x: 330, w: 90, ausrichtung: 'rechts' },
    { titel: 'pdf.spalteTurnus', x: 345, w: 90 },
    { titel: 'pdf.spalteZahlung', x: 440, w: 95 },
    { titel: 'pdf.spalteKuendigung', x: 540, w: 115 },
    { titel: 'pdf.spalteStatus', x: 665, w: A4_BREITE - RAND - 665 }
];

// Spalten auf die Papierbreite umgerechnet (US-Letter ist schmaler).
function spaltenFuer(breite) {
    const faktor = (breite - 2 * RAND) / (A4_BREITE - 2 * RAND);
    return SPALTEN_A4.map((s) => ({ ...s, x: RAND + (s.x - RAND) * faktor, w: s.w * faktor }));
}

// Betrag für die PDF: mit Symbol, oder mit ISO-Code, wenn die PDF-Schrift das
// Symbol nicht kennt (₹, ₺, zł ...).
function betragPdf(betrag, waehrung) {
    const text = formatiereBetrag(betrag, waehrung);
    return istDarstellbar(text) ? text : formatiereBetrag(betrag, waehrung, undefined, { nurCode: true });
}

// Eine Tabellenzeile als Texte je Spalte.
export function erzeugeZeile(abo, heute = new Date()) {
    const beendet = istVertragBeendet(abo, heute);
    const ende = parseDatumISO(abo.gekuendigtZum);
    const zahlung = parseDatumISO(ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus));

    let naechsteZahlung = zahlung ? formatiereDatum(zahlung) : '–';
    if (beendet || (abo.gekuendigt && ende && zahlung && zahlung > ende)) naechsteZahlung = '–';

    let kuendigungBis = '–';
    if (!abo.gekuendigt) {
        const handlung = ermittleHandlungsDatum(abo, heute);
        if (handlung) kuendigungBis = formatiereDatum(handlung.datum);
        else if (abo.jederzeitKuendbar === true) kuendigungBis = t('pdf.jederzeit');
    }

    let status = istProbezeitLaufend(abo, heute) ? t('pdf.probe', { datum: formatiereDatum(abo.probeEndeAm) }) : t('pdf.laeuft');
    if (abo.gekuendigt) {
        if (istGekuendigtLaufend(abo, heute)) status = t('pdf.gekuendigtZum', { datum: formatiereDatum(ende) });
        else if (ende) status = t('pdf.beendet', { datum: formatiereDatum(ende) });
        else status = t('pdf.gekuendigt');
    }

    return [abo.name, betragPdf(abo.kosten, abo.waehrung), tWert('turnus', abo.turnus), naechsteZahlung, kuendigungBis, status];
}

export function dateinameUebersicht(heute = new Date()) {
    return `${t('datei.pdf')}-${formatiereDatumISO(heute)}.pdf`;
}

// Enthält ein Name Zeichen, die die PDF-Schrift nicht kennt (Ł, Кино, Emoji), wird
// mit den Schriften des Geräts gezeichnet (pdf-bild.js), sonst stünde dort "?".
export function brauchtGeraeteschrift(alleAbos) {
    return alleAbos.some((abo) => !istDarstellbar(`${abo.name} ${normalisiereWaehrung(abo.waehrung)}`));
}

export function erzeugeUebersichtPdf(alleAbos, heute = new Date(), papier = papierformat(), { leinwand } = {}) {
    const { breite: BREITE, hoehe: HOEHE } = papier;
    const SPALTEN = spaltenFuer(BREITE);
    const optionen = { breite: BREITE, hoehe: HOEHE, titel: t('pdf.titel'), ...(leinwand ? { leinwand } : {}) };
    const mitLeinwand = leinwand || typeof document !== 'undefined';
    const pdf = mitLeinwand && brauchtGeraeteschrift(alleAbos) ? new BildDokument(optionen) : new PdfDokument(optionen);
    const abos = sortiereAbos(alleAbos, heute);
    const laufende = alleAbos.filter((abo) => !istVertragBeendet(abo, heute));

    let y = 0;

    function kopfzeileTabelle() {
        pdf.rechteck(RAND, y, BREITE - 2 * RAND, ZEILENHOEHE, { fuellfarbe: [0.9, 0.91, 0.95] });
        for (const s of SPALTEN) {
            const x = s.ausrichtung === 'rechts' ? s.x : s.x + 4;
            pdf.text(s.ausrichtung === 'rechts' ? x - 4 : x, y + 13.5, t(s.titel), { groesse: 8.5, fett: true, farbe: DUNKEL, ausrichtung: s.ausrichtung });
        }
        y += ZEILENHOEHE;
    }

    function neueSeite(erste) {
        pdf.neueSeite();
        y = RAND;
        if (erste) {
            pdf.text(RAND, y + 14, t('pdf.titel'), { groesse: 18, fett: true, farbe: DUNKEL });
            pdf.text(RAND, y + 32, t('pdf.untertitel', { datum: formatiereDatum(heute), anzahl: tAnzahl('anzahl.abos', abos.length) }), { groesse: 9, farbe: GRAU });
            y += 48;
        }
        kopfzeileTabelle();
    }

    neueSeite(true);

    if (abos.length === 0) {
        pdf.text(RAND + 4, y + 16, t('pdf.leer'), { groesse: SCHRIFT, farbe: GRAU });
        y += ZEILENHOEHE + 4;
    }

    abos.forEach((abo, index) => {
        if (y + ZEILENHOEHE > HOEHE - RAND - 20) neueSeite(false);
        const beendet = istVertragBeendet(abo, heute);
        if (index % 2 === 1) pdf.rechteck(RAND, y, BREITE - 2 * RAND, ZEILENHOEHE, { fuellfarbe: [0.97, 0.97, 0.98] });
        const textFarbe = beendet ? GRAU : DUNKEL;
        erzeugeZeile(abo, heute).forEach((wert, i) => {
            const s = SPALTEN[i];
            // Beträge nie kürzen (fehlende Ziffern wären falsch), sondern kleiner schreiben.
            if (s.ausrichtung === 'rechts') {
                pdf.text(s.x - 4, y + 13.5, wert, { groesse: pdf.passendeGroesse(wert, s.w - 8, SCHRIFT), farbe: textFarbe, ausrichtung: 'rechts' });
                return;
            }
            const inhalt = pdf.kuerze(wert, s.w - 8, SCHRIFT, i === 0);
            pdf.text(s.x + 4, y + 13.5, inhalt, { groesse: SCHRIFT, fett: i === 0, farbe: textFarbe });
        });
        pdf.linie(RAND, y + ZEILENHOEHE, BREITE - RAND, y + ZEILENHOEHE, { staerke: 0.4, farbe: [0.85, 0.86, 0.9] });
        y += ZEILENHOEHE;
    });

    // Summenblock
    const hauptwaehrung = ermittleHauptwaehrung(alleAbos);
    const summen = Calculator.berechneSummen(laufende, hauptwaehrung);
    const hinweis = t('pdf.hinweis')
        + (summen.umgerechnet ? t('pdf.fremdwaehrung', { waehrung: hauptwaehrung }) : '')
        + (summen.nichtEnthalten.length > 0 ? ` ${t('summe.nichtEnthalten', { liste: summen.nichtEnthalten.join(', ') })}` : '');
    const hinweisZeilen = pdf.umbruch(hinweis, BREITE - 2 * RAND, 8.5).slice(0, 12);
    const summenHoehe = 62 + (hinweisZeilen.length - 1) * 12;
    if (y + summenHoehe > HOEHE - RAND - 20) {
        pdf.neueSeite();
        y = RAND;
    }
    y += 18;
    const summe = (wert) => `${summen.umgerechnet ? `${t('summe.ca')} ` : ''}${betragPdf(wert, hauptwaehrung)}`;
    const proMonat = t('pdf.proMonat', { betrag: summe(summen.monat) });
    const proJahr = t('pdf.proJahr', { betrag: summe(summen.jahr) });
    pdf.text(RAND, y + 10, t('pdf.summe', { anzahl: tAnzahl('anzahl.abos', laufende.length) }), { groesse: 10, fett: true, farbe: DUNKEL });
    pdf.text(RAND, y + 27, proMonat, { groesse: 10, farbe: DUNKEL });
    pdf.text(RAND + Math.max(170, pdf.textBreite(proMonat, 10) + 24), y + 27, proJahr, { groesse: 10, farbe: DUNKEL });
    hinweisZeilen.forEach((zeile, i) => pdf.text(RAND, y + 43 + i * 12, zeile, { groesse: 8.5, farbe: GRAU }));

    // Fußzeile mit Seitenzahlen (erst jetzt ist die Gesamtzahl bekannt)
    const anzahl = pdf.seiten.length;
    for (let seite = 1; seite <= anzahl; seite++) {
        pdf.text(BREITE - RAND, HOEHE - 22, t('pdf.seite', { seite, anzahl }), { groesse: 8, farbe: GRAU, ausrichtung: 'rechts', seite });
        pdf.text(RAND, HOEHE - 22, t('pdf.fusszeile'), { groesse: 8, farbe: GRAU, seite });
    }

    return pdf.erzeuge();
}
