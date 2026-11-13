/**
 * benachrichtigungsplan.js | Reine Berechnung, WELCHE nativen
 * Benachrichtigungen geplant werden (ohne Capacitor-Aufrufe, daher per
 * Unit-Test prüfbar). Das eigentliche Planen erledigt
 * planeFaelligkeitsBenachrichtigungen() in faelligkeitshinweis.js.
 *
 * Regeln (ab 2.0.2):
 * - Laufende, NICHT gekündigte Abos: Erinnerung 3 Tage vor der nächsten
 *   Zahlung, 9:00 Uhr ("In 3 Tagen fällig").
 * - Gekündigte Abos: keine Zahlungs-/Fristerinnerungen mehr, stattdessen
 *   genau eine Benachrichtigung am Vertragsende (abo.gekuendigtZum), 9:00 Uhr:
 *   "[Name] endet heute." Alte gekündigte Abos ohne Datum bekommen nichts.
 * - Nur Termine in der Zukunft lassen sich planen.
 */

import { ermittleEffektivesZahlungsdatum, formatiereBetrag, parseDatumISO } from './calculator.js';

export const TAGE_VOR_ZAHLUNG = 3;
export const BENACHRICHTIGUNGS_UHRZEIT = { stunde: 9, minute: 0 };

// Deterministische, positive 32-Bit-Ganzzahl aus einem Text —
// Capacitor-Notification-IDs müssen Ganzzahlen sein, abo.id ist ein String.
export function hasheZuId(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = (hash * 31 + text.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) || 1;
}

function umNeunUhr(datum) {
    const termin = new Date(datum);
    termin.setHours(BENACHRICHTIGUNGS_UHRZEIT.stunde, BENACHRICHTIGUNGS_UHRZEIT.minute, 0, 0);
    return termin;
}

// Liefert [{ id, title, body, at: Date }] — Reihenfolge wie alleAbos.
export function berechneBenachrichtigungsPlan(alleAbos, jetzt = new Date()) {
    const plan = [];
    for (const abo of alleAbos) {
        if (abo.gekuendigt) {
            const ende = parseDatumISO(abo.gekuendigtZum);
            if (!ende) continue;
            const termin = umNeunUhr(ende);
            if (termin > jetzt) {
                plan.push({
                    // Eigene ID-Variante, damit sie nie mit der Zahlungserinnerung
                    // desselben Abos kollidiert.
                    id: hasheZuId(`${abo.id}#vertragsende`),
                    title: 'Vertragsende',
                    body: `${abo.name} endet heute.`,
                    at: termin
                });
            }
            continue;
        }

        const zahlung = ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus);
        if (isNaN(zahlung)) continue;
        const termin = umNeunUhr(zahlung);
        termin.setDate(termin.getDate() - TAGE_VOR_ZAHLUNG);
        if (termin > jetzt) {
            plan.push({
                id: hasheZuId(abo.id),
                title: 'In 3 Tagen fällig',
                body: `${abo.name} wird in 3 Tagen abgebucht (${formatiereBetrag(abo.kosten, abo.waehrung)}).`,
                at: termin
            });
        }
    }
    return plan;
}
