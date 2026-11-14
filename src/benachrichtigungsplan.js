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
 * - Probeabos (ab 2.0.2), solange die Probezeit läuft: Erinnerung 3 Tage
 *   vor dem Ende der Probezeit, 9:00 Uhr: "[Name]: Probezeit endet am
 *   [Datum] – jetzt kündigen, sonst wird es kostenpflichtig."
 *   Fristerinnerungen gibt es dann erst für Fristen nach der Probezeit.
 * - Gekündigte Abos: keine Fristerinnerungen, sondern genau eine
 *   Benachrichtigung am Vertragsende (abo.gekuendigtZum), 9:00 Uhr:
 *   "[Name] endet heute." Alte gekündigte Abos ohne Datum bekommen nichts.
 * - Nur Termine in der Zukunft. Insgesamt höchstens MAX_BENACHRICHTIGUNGEN
 *   (iOS erlaubt maximal 64 geplante Mitteilungen je App), die frühesten zuerst.
 * - IDs sind je Abo und Termin eindeutig und stabil — erneutes Planen
 *   ersetzt statt zu verdoppeln.
 */

import { ermittleKuendigungsfrist, ermittleFristStatus, ermittleHandlungsDatum, istProbezeitLaufend, formatiereDatumISO, parseDatumISO, KRITISCH_SCHWELLE_TAGE } from './calculator.js';
import { t, formatiereDatum } from './i18n.js';

// Titel der Einblendung beim App-Start: Schlüssel 'hinweis.titel' in der
// Sprachdatei. Der automatische Screenshot-Test (ios/App/AboWarnerProUITests,
// läuft auf Deutsch) sucht exakt den deutschen Text — bei Änderung dort mit
// anpassen.

// Für die Einblendung beim App-Start: alle laufenden, nicht gekündigten Abos
// im roten Bereich (Kündigung nur noch höchstens 7 Tage möglich — gleiche
// Regel wie die rote Karte), früheste Frist zuerst.
// Bei laufender Probezeit zählt deren Ende (art: 'probe').
// Rückgabe: [{ abo, fristDatum, art }]
export function ermittleAbosImRotenBereich(alleAbos, heute = new Date()) {
    return alleAbos
        .filter((abo) => !abo.gekuendigt && ermittleFristStatus(abo, heute) === 'kritisch')
        .map((abo) => {
            const handlung = ermittleHandlungsDatum(abo, heute);
            return { abo, fristDatum: handlung.datum, art: handlung.art };
        })
        .sort((a, b) => a.fristDatum - b.fristDatum);
}

export const TAGE_VOR_FRISTENDE = KRITISCH_SCHWELLE_TAGE; // 7 — passend zu "rot"
export const FRISTEN_JE_ABO = 3;
export const TAGE_VOR_PROBEENDE = 3;
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
        title: t('mitteilung.endeTitel'),
        body: t('mitteilung.endeText', { name: abo.name }),
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
    // Laufende Probezeit: Fristen erst ab dem Tag nach ihrem Ende.
    if (istProbezeitLaufend(abo, jetzt)) {
        stichtag = parseDatumISO(abo.probeEndeAm);
        stichtag.setDate(stichtag.getDate() + 1);
    }
    for (let i = 0; i < FRISTEN_JE_ABO && stichtag; i++) {
        const frist = ermittleKuendigungsfrist(abo, stichtag);
        if (!frist) break;
        const termin = umNeunUhr(frist.fristDatum);
        termin.setDate(termin.getDate() - TAGE_VOR_FRISTENDE);
        if (termin > jetzt) {
            ergebnis.push({
                id: hasheZuId(`${abo.id}#frist#${formatiereDatumISO(frist.fristDatum)}`),
                title: t('mitteilung.fristTitel'),
                body: t('mitteilung.fristText', { name: abo.name, datum: formatiereDatum(frist.fristDatum) }),
                at: termin
            });
        }
        // Nächste Frist: ab dem Tag nach dieser Frist suchen.
        stichtag = new Date(frist.fristDatum);
        stichtag.setDate(stichtag.getDate() + 1);
    }
    return ergebnis;
}

// Probeabo: eine Erinnerung 3 Tage vor dem Ende der Probezeit. Liegt dieser
// Zeitpunkt schon in der Vergangenheit, entfällt sie (die Karte ist dann rot).
function probeErinnerung(abo, jetzt) {
    if (!istProbezeitLaufend(abo, jetzt)) return [];
    const ende = parseDatumISO(abo.probeEndeAm);
    const termin = umNeunUhr(ende);
    termin.setDate(termin.getDate() - TAGE_VOR_PROBEENDE);
    if (termin <= jetzt) return [];
    return [{
        id: hasheZuId(`${abo.id}#probe#${formatiereDatumISO(ende)}`),
        title: t('mitteilung.probeTitel'),
        body: t('mitteilung.probeText', { name: abo.name, datum: formatiereDatum(ende) }),
        at: termin
    }];
}

// Liefert [{ id, title, body, at: Date }], nach Zeitpunkt sortiert.
export function berechneBenachrichtigungsPlan(alleAbos, jetzt = new Date()) {
    const plan = [];
    for (const abo of alleAbos) {
        if (abo.gekuendigt) plan.push(...vertragsendeMeldung(abo, jetzt));
        else plan.push(...probeErinnerung(abo, jetzt), ...fristErinnerungen(abo, jetzt));
    }
    plan.sort((a, b) => a.at - b.at);
    // Doppelte IDs (theoretisch möglich) nur einmal einplanen.
    const gesehen = new Set();
    return plan.filter((n) => !gesehen.has(n.id) && gesehen.add(n.id)).slice(0, MAX_BENACHRICHTIGUNGEN);
}
