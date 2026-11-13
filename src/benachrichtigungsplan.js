/**
 * benachrichtigungsplan.js | Reine Berechnung, WELCHE nativen
 * Benachrichtigungen geplant werden (ohne Capacitor-Aufrufe, daher per
 * Unit-Test prüfbar). Das eigentliche Planen erledigt
 * planeFaelligkeitsBenachrichtigungen() in faelligkeitshinweis.js.
 *
 * Regeln (ab 2.0.2):
 * - Laufende, NICHT gekündigte Abos: Erinnerung 7 Tage vor dem Datum
 *   "Kündigung möglich bis" (= ab da ist die Karte rot), 9:00 Uhr:
 *   "[Name]: Kündigung nur noch bis [Datum] möglich."
 *   Geplant werden die nächsten FRISTEN_JE_ABO Fristen je Abo, damit auch
 *   dann erinnert wird, wenn die App länger nicht geöffnet wird (Planen ist
 *   nur möglich, während die App läuft).
 * - Gekündigte Abos: keine Fristerinnerungen, sondern genau eine
 *   Benachrichtigung am Vertragsende (abo.gekuendigtZum), 9:00 Uhr:
 *   "[Name] endet heute." Alte gekündigte Abos ohne Datum bekommen nichts.
 * - Nur Termine in der Zukunft. Insgesamt höchstens MAX_BENACHRICHTIGUNGEN
 *   (iOS erlaubt maximal 64 geplante Mitteilungen je App), die frühesten zuerst.
 * - IDs sind je Abo und Termin eindeutig und stabil — erneutes Planen
 *   ersetzt statt zu verdoppeln.
 */

import { ermittleKuendigungsfrist, formatiereDatumDE, formatiereDatumISO, parseDatumISO, KRITISCH_SCHWELLE_TAGE } from './calculator.js';

export const TAGE_VOR_FRISTENDE = KRITISCH_SCHWELLE_TAGE; // 7 — passend zu "rot"
export const FRISTEN_JE_ABO = 3;
export const MAX_BENACHRICHTIGUNGEN = 60;
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

function vertragsendeMeldung(abo, jetzt) {
    const ende = parseDatumISO(abo.gekuendigtZum);
    if (!ende) return [];
    const termin = umNeunUhr(ende);
    if (termin <= jetzt) return [];
    return [{
        id: hasheZuId(`${abo.id}#vertragsende`),
        title: 'Vertragsende',
        body: `${abo.name} endet heute.`,
        at: termin
    }];
}

// Die nächsten Fristen eines laufenden Abos, jeweils mit Erinnerung 7 Tage
// vorher. Liegt die Erinnerung zur nächsten Frist schon in der Vergangenheit
// (Frist ist in weniger als 7 Tagen), entfällt nur diese eine — die Karte ist
// dann ohnehin rot.
function fristErinnerungen(abo, jetzt) {
    const ergebnis = [];
    let stichtag = parseDatumISO(jetzt);
    for (let i = 0; i < FRISTEN_JE_ABO && stichtag; i++) {
        const frist = ermittleKuendigungsfrist(abo, stichtag);
        if (!frist) break;
        const termin = umNeunUhr(frist.fristDatum);
        termin.setDate(termin.getDate() - TAGE_VOR_FRISTENDE);
        if (termin > jetzt) {
            ergebnis.push({
                id: hasheZuId(`${abo.id}#frist#${formatiereDatumISO(frist.fristDatum)}`),
                title: 'Kündigungsfrist',
                body: `${abo.name}: Kündigung nur noch bis ${formatiereDatumDE(frist.fristDatum)} möglich.`,
                at: termin
            });
        }
        // Nächste Frist: ab dem Tag nach dieser Frist suchen.
        stichtag = new Date(frist.fristDatum);
        stichtag.setDate(stichtag.getDate() + 1);
    }
    return ergebnis;
}

// Liefert [{ id, title, body, at: Date }], nach Zeitpunkt sortiert.
export function berechneBenachrichtigungsPlan(alleAbos, jetzt = new Date()) {
    const plan = [];
    for (const abo of alleAbos) {
        if (abo.gekuendigt) plan.push(...vertragsendeMeldung(abo, jetzt));
        else plan.push(...fristErinnerungen(abo, jetzt));
    }
    plan.sort((a, b) => a.at - b.at);
    // Doppelte IDs (theoretisch möglich) nur einmal einplanen.
    const gesehen = new Set();
    return plan.filter((n) => !gesehen.has(n.id) && gesehen.add(n.id)).slice(0, MAX_BENACHRICHTIGUNGEN);
}
