/**
 * uebersicht-pdf.js | "Übersicht als PDF": lesbare Liste aller Abos zum
 * Ausdrucken oder Weitergeben. Reine Funktion (ohne DOM/Capacitor) — liefert
 * die PDF-Datei als Uint8Array. Alles wird auf dem Gerät erzeugt (pdf.js),
 * nichts wird übertragen.
 *
 * Inhalt: Name, Kosten, Turnus, nächste Zahlung, Kündigung möglich bis,
 * Status (läuft / gekündigt zum ... / beendet), dazu die Summe der laufenden
 * Kosten pro Monat und pro Jahr (gleiche Berechnung wie die Übersichtskacheln
 * der App). Datumsangaben deutsch (TT.MM.JJJJ). A4 quer.
 */

import { PdfDokument } from './pdf.js';
import {
    Calculator, ermittleEffektivesZahlungsdatum, ermittleKuendigungsfrist, formatiereBetrag,
    formatiereDatumDE, formatiereDatumISO, formatiereZahlDE, istGekuendigtLaufend, istVertragBeendet,
    parseDatumISO, sortiereAbos
} from './calculator.js';

const BREITE = 842; // A4 quer
const HOEHE = 595;
const RAND = 40;
const ZEILENHOEHE = 20;
const SCHRIFT = 9.5;
const GRAU = [0.42, 0.45, 0.5];
const DUNKEL = [0.1, 0.12, 0.18];

// x = linke Kante (bzw. rechte Kante bei ausrichtung 'rechts'), w = Breite
const SPALTEN = [
    { titel: 'Abo', x: RAND, w: 190 },
    { titel: 'Kosten', x: 330, w: 90, ausrichtung: 'rechts' },
    { titel: 'Turnus', x: 345, w: 90 },
    { titel: 'Nächste Zahlung', x: 440, w: 95 },
    { titel: 'Kündigung möglich bis', x: 540, w: 115 },
    { titel: 'Status', x: 665, w: BREITE - RAND - 665 }
];

// Eine Tabellenzeile als Texte je Spalte.
export function erzeugeZeile(abo, heute = new Date()) {
    const beendet = istVertragBeendet(abo, heute);
    const ende = parseDatumISO(abo.gekuendigtZum);
    const zahlung = parseDatumISO(ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus));

    let naechsteZahlung = zahlung ? formatiereDatumDE(zahlung) : '–';
    if (beendet || (abo.gekuendigt && ende && zahlung && zahlung > ende)) naechsteZahlung = '–';

    let kuendigungBis = '–';
    if (!abo.gekuendigt) {
        const frist = ermittleKuendigungsfrist(abo, heute);
        if (frist) kuendigungBis = formatiereDatumDE(frist.fristDatum);
    }

    let status = 'läuft';
    if (abo.gekuendigt) {
        if (istGekuendigtLaufend(abo, heute)) status = `gekündigt zum ${formatiereDatumDE(ende)}`;
        else if (ende) status = `beendet (zum ${formatiereDatumDE(ende)})`;
        else status = 'gekündigt';
    }

    return [abo.name, formatiereBetrag(abo.kosten, abo.waehrung), abo.turnus, naechsteZahlung, kuendigungBis, status];
}

export function dateinameUebersicht(heute = new Date()) {
    return `Abo-Uebersicht-${formatiereDatumISO(heute)}.pdf`;
}

export function erzeugeUebersichtPdf(alleAbos, heute = new Date()) {
    const pdf = new PdfDokument({ breite: BREITE, hoehe: HOEHE, titel: 'Abo-Übersicht' });
    const abos = sortiereAbos(alleAbos, heute);
    const laufende = alleAbos.filter((abo) => !istVertragBeendet(abo, heute));

    let y = 0;

    function kopfzeileTabelle() {
        pdf.rechteck(RAND, y, BREITE - 2 * RAND, ZEILENHOEHE, { fuellfarbe: [0.9, 0.91, 0.95] });
        for (const s of SPALTEN) {
            const x = s.ausrichtung === 'rechts' ? s.x : s.x + 4;
            pdf.text(s.ausrichtung === 'rechts' ? x - 4 : x, y + 13.5, s.titel, { groesse: 8.5, fett: true, farbe: DUNKEL, ausrichtung: s.ausrichtung });
        }
        y += ZEILENHOEHE;
    }

    function neueSeite(erste) {
        pdf.neueSeite();
        y = RAND;
        if (erste) {
            pdf.text(RAND, y + 14, 'Abo-Übersicht', { groesse: 18, fett: true, farbe: DUNKEL });
            pdf.text(RAND, y + 32, `Abo-Warner Pro · erstellt am ${formatiereDatumDE(heute)} · ${abos.length === 1 ? '1 Abo' : `${abos.length} Abos`}`, { groesse: 9, farbe: GRAU });
            y += 48;
        }
        kopfzeileTabelle();
    }

    neueSeite(true);

    if (abos.length === 0) {
        pdf.text(RAND + 4, y + 16, 'Keine Abos gespeichert.', { groesse: SCHRIFT, farbe: GRAU });
        y += ZEILENHOEHE + 4;
    }

    abos.forEach((abo, index) => {
        if (y + ZEILENHOEHE > HOEHE - RAND - 20) neueSeite(false);
        const beendet = istVertragBeendet(abo, heute);
        if (index % 2 === 1) pdf.rechteck(RAND, y, BREITE - 2 * RAND, ZEILENHOEHE, { fuellfarbe: [0.97, 0.97, 0.98] });
        const textFarbe = beendet ? GRAU : DUNKEL;
        erzeugeZeile(abo, heute).forEach((wert, i) => {
            const s = SPALTEN[i];
            const inhalt = pdf.kuerze(wert, s.w - 8, SCHRIFT, i === 0);
            if (s.ausrichtung === 'rechts') pdf.text(s.x - 4, y + 13.5, inhalt, { groesse: SCHRIFT, farbe: textFarbe, ausrichtung: 'rechts' });
            else pdf.text(s.x + 4, y + 13.5, inhalt, { groesse: SCHRIFT, fett: i === 0, farbe: textFarbe });
        });
        pdf.linie(RAND, y + ZEILENHOEHE, BREITE - RAND, y + ZEILENHOEHE, { staerke: 0.4, farbe: [0.85, 0.86, 0.9] });
        y += ZEILENHOEHE;
    });

    // Summenblock
    const summenHoehe = 62;
    if (y + summenHoehe > HOEHE - RAND - 20) {
        pdf.neueSeite();
        y = RAND;
    }
    y += 18;
    const monat = Calculator.berechneMonatsSumme(laufende);
    const jahr = Calculator.berechneJahresSumme(laufende);
    pdf.text(RAND, y + 10, `Summe der laufenden Abos (${laufende.length === 1 ? '1 Abo' : `${laufende.length} Abos`}):`, { groesse: 10, fett: true, farbe: DUNKEL });
    pdf.text(RAND, y + 27, `pro Monat: ${formatiereZahlDE(monat)} €`, { groesse: 10, farbe: DUNKEL });
    pdf.text(RAND + 170, y + 27, `pro Jahr: ${formatiereZahlDE(jahr)} €`, { groesse: 10, farbe: DUNKEL });
    const fremdwaehrung = laufende.some((abo) => (abo.waehrung || 'EUR').toUpperCase() !== 'EUR');
    const hinweis = 'Gekündigte Abos zählen bis zu ihrem Vertragsende mit.'
        + (fremdwaehrung ? ' Andere Währungen sind mit einem Richtkurs in Euro umgerechnet.' : '');
    pdf.text(RAND, y + 43, hinweis, { groesse: 8.5, farbe: GRAU });

    // Fußzeile mit Seitenzahlen (erst jetzt ist die Gesamtzahl bekannt)
    const anzahl = pdf.seiten.length;
    for (let seite = 1; seite <= anzahl; seite++) {
        pdf.text(BREITE - RAND, HOEHE - 22, `Seite ${seite} von ${anzahl}`, { groesse: 8, farbe: GRAU, ausrichtung: 'rechts', seite });
        pdf.text(RAND, HOEHE - 22, 'Erstellt mit Abo-Warner Pro – alle Angaben ohne Gewähr, Grundlage sind deine eigenen Eingaben.', { groesse: 8, farbe: GRAU, seite });
    }

    return pdf.erzeuge();
}
