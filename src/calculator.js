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

// Wandelt ein ISO-Datum ("2026-11-15") in ein Date um — als LOKALES Datum
// (Mitternacht Ortszeit). new Date("2026-11-15") würde dagegen UTC-Mitternacht
// liefern, was in Zeitzonen westlich von UTC auf den Vortag fallen kann.
// Akzeptiert auch bereits fertige Date-Objekte (Kopie). Ungültig -> null.
export function parseDatumISO(wert) {
    if (wert instanceof Date) return isNaN(wert) ? null : new Date(wert.getFullYear(), wert.getMonth(), wert.getDate());
    if (typeof wert !== 'string') return null;
    const treffer = /^(\d{4})-(\d{2})-(\d{2})/.exec(wert.trim());
    if (!treffer) return null;
    const datum = new Date(Number(treffer[1]), Number(treffer[2]) - 1, Number(treffer[3]));
    return isNaN(datum) ? null : datum;
}

// Date -> "2026-11-15" (Speicherformat, lokale Ortszeit).
export function formatiereDatumISO(datum) {
    const d = parseDatumISO(datum);
    if (!d) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Anzeigeformat überall in der App: "15.11.2026". Nimmt Date oder ISO-String.
export function formatiereDatumDE(datum) {
    const d = parseDatumISO(datum);
    if (!d) return '';
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}

// Letzter Tag, an dem die Kündigung noch rechtzeitig vor einer Zahlung beim
// Anbieter sein muss: Zahlungsdatum minus Kündigungsfrist (in Tagen).
// Liegt dieser Tag für die nächste Zahlung bereits in der Vergangenheit, ist
// diese Zahlung nicht mehr abwendbar — dann zählt die Frist vor der darauf
// folgenden Zahlung (turnusgerecht weitergerückt). So wird nie ein bereits
// verstrichenes Datum als "möglich bis" angezeigt.
// Rückgabe: { fristDatum, zahlungsDatum } (beide Date, lokale Mitternacht)
// oder null bei ungültigen Daten. `heute` nur für Tests überschreibbar.
export function ermittleKuendigungsfrist(abo, heute = new Date()) {
    const stichtag = parseDatumISO(heute);
    const fristTage = Number(abo.kuendigungsfristTage);
    const start = parseDatumISO(ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus));
    if (!stichtag || !start || !Number.isFinite(fristTage) || fristTage < 0) return null;

    const monate = TURNUS_MONATE[abo.turnus] || 1;
    const zahlung = new Date(start);
    for (let i = 0; i < 1000; i++) {
        const frist = new Date(zahlung);
        frist.setDate(frist.getDate() - fristTage);
        if (frist >= stichtag) return { fristDatum: frist, zahlungsDatum: new Date(zahlung) };
        zahlung.setMonth(zahlung.getMonth() + monate);
    }
    return null;
}

// --- Gekündigte Verträge (ab 2.0.2) ---
// Ein gekündigtes Abo kann noch bis zu seinem Vertragsende laufen (z.B. Miete:
// bis dahin wird weiter gezahlt). Gespeichert wird das Vertragsende als
// abo.gekuendigtZum (ISO). Abos, die vor 2.0.2 gekündigt wurden, haben kein
// Datum und gelten — wie bisher — als beendet.

// true, solange ein gekündigtes Abo noch läuft (bis einschließlich Vertragsende).
export function istGekuendigtLaufend(abo, heute = new Date()) {
    if (!abo.gekuendigt) return false;
    const ende = parseDatumISO(abo.gekuendigtZum);
    const stichtag = parseDatumISO(heute);
    return !!ende && !!stichtag && ende >= stichtag;
}

// true, wenn das Abo gekündigt ist und das Vertragsende hinter uns liegt
// (oder kein Vertragsende hinterlegt ist, z.B. bei alten Daten).
export function istVertragBeendet(abo, heute = new Date()) {
    return !!abo.gekuendigt && !istGekuendigtLaufend(abo, heute);
}

// Vorschlag für das Vertragsende, wenn heute gekündigt wird: der Tag vor der
// ersten Zahlung, die durch eine heute rechtzeitig ankommende Kündigung
// wegfällt (siehe ermittleKuendigungsfrist). Nur ein Vorschlag — der Nutzer
// kann ihn ändern (z.B. laut Bestätigung des Anbieters).
export function schlageVertragsendeVor(abo, heute = new Date()) {
    const frist = ermittleKuendigungsfrist(abo, heute);
    if (!frist) return null;
    const ende = new Date(frist.zahlungsDatum);
    ende.setDate(ende.getDate() - 1);
    return ende;
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