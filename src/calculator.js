import { WECHSELKURSE } from './waehrungen.js';

/**
 * Kern-Logik für Währungsumrechnungen und Abo-Berechnungen.
 * Optimiert für finanzmathematische Stabilität.
 */

// Anzahl Monate zwischen zwei Zahlungen je Turnus
export const TURNUS_MONATE = {
    'Monatlich': 1,
    'Vierteljährlich': 3,
    'Halbjährlich': 6,
    'Jährlich': 12
};

// Rollt ein wiederkehrendes Zahlungsdatum turnusgerecht in die Zukunft vor,
// falls das gespeicherte Datum bereits verstrichen ist (z.B. weil die App seit
// der letzten Zahlung nicht mehr geöffnet wurde). Ohne dieses Vorrücken zeigt
// "Tage bis Zahlung" für längst überfällige, aber weiterhin laufende Abos
// dauerhaft wachsende negative Werte (z.B. "-22 Tage") statt des tatsächlich
// nächsten Fälligkeitstermins — kein Fehler in der Differenzberechnung selbst,
// sondern eine fehlende Wiederkehr-Logik. Reine Berechnung für Anzeige-/Status-/
// Fristzwecke; verändert nie den gespeicherten abo.naechsteZahlung-Wert.
export function ermittleEffektivesZahlungsdatum(naechsteZahlung, turnus) {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const datum = new Date(naechsteZahlung);
    const monate = TURNUS_MONATE[turnus] || 1;

    while (datum < heute) {
        datum.setMonth(datum.getMonth() + monate);
    }
    return datum;
}

// Parst einen Betrag aus einer Nutzereingabe — akzeptiert sowohl deutsches
// Format (Komma als Dezimaltrennzeichen, "29,99", optional mit Punkt als
// Tausendertrennzeichen wie "1.299,99") als auch englisches Format mit Punkt
// ("29.99"). Nötig, weil <input type="number"> in vielen Browsern/WebViews
// ein eingetipptes Komma stur ablehnt oder wegfiltert — die Eingabefelder
// nutzen daher type="text" und übergeben die Interpretation hierher.
export function parseBetrag(eingabe) {
    if (typeof eingabe === 'number') return eingabe;
    if (typeof eingabe !== 'string') return NaN;

    const bereinigt = eingabe.trim();
    if (bereinigt.includes(',')) {
        return parseFloat(bereinigt.replace(/\./g, '').replace(',', '.'));
    }
    return parseFloat(bereinigt);
}

// Formatiert einen Betrag als reine Zahl im deutschen Format (Komma statt
// Punkt, immer 2 Nachkommastellen) — ohne Währungssuffix, z.B. für das
// value-Attribut von Bearbeiten-Formularfeldern.
export function formatiereZahlDE(betrag) {
    const wert = parseBetrag(betrag);
    return (isNaN(wert) ? 0 : wert).toFixed(2).replace('.', ',');
}

// Formatiert einen Betrag inkl. Währung im deutschen Format, z.B. "14,99 EUR".
export function formatiereBetrag(betrag, waehrung) {
    return `${formatiereZahlDE(betrag)} ${waehrung || 'EUR'}`;
}

export const Calculator = {

    // Konvertiert einen Betrag zu EUR mit Sicherung gegen Gleitkommafehler
    konvertiereZuEUR(betrag, vonWaehrung) {
        const kurs = WECHSELKURSE[vonWaehrung] || 1.0;
        const wert = parseBetrag(betrag) * kurs;
        return Math.round(wert * 100) / 100; // Rundung auf 2 Dezimalstellen
    },

    // Berechnet monatliche Gesamtkosten in EUR
    berechneMonatsSumme(abos) {
        const summe = abos.reduce((acc, abo) => {
            const kostenEUR = this.konvertiereZuEUR(abo.kosten, abo.waehrung);
            const monate = TURNUS_MONATE[abo.turnus] || 1;
            return acc + (kostenEUR / monate);
        }, 0);
        return Math.round(summe * 100) / 100;
    },

    // Berechnet jährliche Gesamtkosten in EUR
    berechneJahresSumme(abos) {
        return Math.round(this.berechneMonatsSumme(abos) * 12 * 100) / 100;
    },

    // Validiert Abo-Daten vor der Speicherung
    istGueltig(abo) {
        return (
            typeof abo.name === 'string' && abo.name.trim().length > 0 &&
            !isNaN(parseBetrag(abo.kosten)) && parseBetrag(abo.kosten) >= 0 &&
            !!abo.waehrung &&
            !!TURNUS_MONATE[abo.turnus] &&
            !isNaN(Date.parse(abo.naechsteZahlung)) &&
            Number.isFinite(abo.kuendigungsfristTage) && abo.kuendigungsfristTage >= 0
        );
    }
};