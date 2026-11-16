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

// --- Kündigungsfrist in Tagen, Wochen oder Monaten (ab 2.0.2) ---
// Gespeichert wird wie bisher immer abo.kuendigungsfristTage (bei Wochen x7,
// bei Monaten x30 als Näherung). So bleiben alte Abos unverändert gültig und
// eine Sicherung lässt sich auch in einer älteren App-Version einlesen.
// Neu und optional: abo.kuendigungsfristEinheit ('wochen' | 'monate') und
// abo.kuendigungsfristAnzahl. Fehlen sie, gilt die Frist in Tagen.
export const FRIST_EINHEITEN = ['tage', 'wochen', 'monate'];

// Liefert die Frist so, wie der Nutzer sie eingetragen hat: { anzahl, einheit }.
export function ermittleFristAngabe(abo) {
    const einheit = abo.kuendigungsfristEinheit;
    const anzahl = Number(abo.kuendigungsfristAnzahl);
    if ((einheit === 'wochen' || einheit === 'monate') && Number.isInteger(anzahl) && anzahl >= 0) {
        return { anzahl, einheit };
    }
    return { anzahl: Number(abo.kuendigungsfristTage), einheit: 'tage' };
}

// Felder zum Speichern aus einer Eingabe (Zahl + Einheit).
export function erzeugeFristFelder(anzahl, einheit) {
    const n = Number(anzahl);
    if (einheit === 'wochen') return { kuendigungsfristTage: n * 7, kuendigungsfristEinheit: 'wochen', kuendigungsfristAnzahl: n };
    if (einheit === 'monate') return { kuendigungsfristTage: n * 30, kuendigungsfristEinheit: 'monate', kuendigungsfristAnzahl: n };
    return { kuendigungsfristTage: n, kuendigungsfristEinheit: undefined, kuendigungsfristAnzahl: undefined };
}

// Datum minus ganze Kalendermonate. Gibt es den Tag im Zielmonat nicht,
// gilt der letzte Tag des Monats (31.05. minus 3 Monate = 28./29.02.).
export function minusMonate(datum, monate) {
    const jahr = datum.getFullYear();
    const monat = datum.getMonth() - monate;
    const letzterTag = new Date(jahr, monat + 1, 0).getDate();
    return new Date(jahr, monat, Math.min(datum.getDate(), letzterTag));
}

// Nächster Zahlungstermin ab heute (ab 2.0.2, für "Per Foto einlesen"):
// Liegt das Datum in der Vergangenheit (z. B. Rechnungsdatum), wird es um ganze
// Turnus-Schritte vorgerückt, bis es heute oder später ist. Jeder Schritt wird
// vom Ausgangsdatum aus gerechnet und aufs Monatsende geklemmt, damit der Tag
// nicht abwandert (31.01. -> 28.02. -> 31.03., nicht 28.03.).
// Rückgabe: ISO-Datum ("2026-12-01") oder '' bei ungültigem Datum.
export function naechsteZahlungAb(datum, turnus, heute = new Date()) {
    const start = parseDatumISO(datum);
    if (!start) return '';
    const stichtag = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate());
    const monate = TURNUS_MONATE[turnus] || 1;
    let kandidat = start;
    for (let schritt = 1; kandidat < stichtag && schritt <= 1200; schritt++) {
        kandidat = minusMonate(start, -schritt * monate);
    }
    return formatiereDatumISO(kandidat);
}

// Zahlungsdatum minus Frist (Tage, Wochen oder Kalendermonate).
function fristVorZahlung(zahlung, angabe) {
    if (angabe.einheit === 'monate') return minusMonate(zahlung, angabe.anzahl);
    const frist = new Date(zahlung);
    frist.setDate(frist.getDate() - (angabe.einheit === 'wochen' ? angabe.anzahl * 7 : angabe.anzahl));
    return frist;
}

// Letzter Tag, an dem die Kündigung noch rechtzeitig vor einer Zahlung beim
// Anbieter sein muss: Zahlungsdatum minus Kündigungsfrist (Tage, Wochen oder
// Kalendermonate).
// Liegt dieser Tag für die nächste Zahlung bereits in der Vergangenheit, ist
// diese Zahlung nicht mehr abwendbar — dann zählt die Frist vor der darauf
// folgenden Zahlung (turnusgerecht weitergerückt). So wird nie ein bereits
// verstrichenes Datum als "möglich bis" angezeigt.
// Rückgabe: { fristDatum, zahlungsDatum } (beide Date, lokale Mitternacht)
// oder null bei ungültigen Daten. `heute` nur für Tests überschreibbar.
export function ermittleKuendigungsfrist(abo, heute = new Date()) {
    const stichtag = parseDatumISO(heute);
    const angabe = ermittleFristAngabe(abo);
    const start = parseDatumISO(ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus));
    if (!stichtag || !start || !Number.isFinite(angabe.anzahl) || angabe.anzahl < 0) return null;

    const monate = TURNUS_MONATE[abo.turnus] || 1;
    const zahlung = new Date(start);
    for (let i = 0; i < 1000; i++) {
        const frist = fristVorZahlung(zahlung, angabe);
        if (frist >= stichtag) return { fristDatum: frist, zahlungsDatum: new Date(zahlung) };
        zahlung.setMonth(zahlung.getMonth() + monate);
    }
    return null;
}

// --- Probeabo / Testzeitraum (ab 2.0.2) ---
// abo.probeabo = true und abo.probeEndeAm (ISO). Solange die Probezeit läuft
// (bis einschließlich probeEndeAm) und das Abo nicht gekündigt ist, ist das
// Ende der Probezeit das Datum, bis zu dem gehandelt werden muss. Danach
// gilt wieder ganz normal die Kündigungsfrist.
export function istProbezeitLaufend(abo, heute = new Date()) {
    if (abo.probeabo !== true || abo.gekuendigt) return false;
    const ende = parseDatumISO(abo.probeEndeAm);
    const stichtag = parseDatumISO(heute);
    return !!ende && !!stichtag && ende >= stichtag;
}

// Das Datum, das die Karte zeigt und nach dem sich die Farbe richtet:
//   { art: 'probe', datum }  = "Probezeit endet am ..."
//   { art: 'frist', datum }  = "Kündigung möglich bis ..."
// oder null bei ungültigen Daten.
export function ermittleHandlungsDatum(abo, heute = new Date()) {
    if (istProbezeitLaufend(abo, heute)) return { art: 'probe', datum: parseDatumISO(abo.probeEndeAm) };
    const frist = ermittleKuendigungsfrist(abo, heute);
    return frist ? { art: 'frist', datum: frist.fristDatum } : null;
}

// Vorlauf (in Tagen) vor dem Ende der angezeigten Kündigungsfrist:
// ab KRITISCH_SCHWELLE_TAGE rot, ab WARNSCHWELLE_TAGE gelb (jeweils inklusive).
export const KRITISCH_SCHWELLE_TAGE = 7;
export const WARNSCHWELLE_TAGE = 30;

// Dringlichkeit (Farbe) eines laufenden Abos — gemessen an GENAU der Frist,
// die die Karte als "Kündigung möglich bis ..." anzeigt (ermittleKuendigungsfrist),
// nicht an einer bereits verpassten. Bei laufender Probezeit zählt deren Ende:
//   'kritisch' (rot)  = Frist endet in höchstens 7 Tagen (inkl. letzter Tag = heute)
//   'warnung'  (gelb) = Frist endet in höchstens 30 Tagen
//   'sicher'   (grün) = sonst
// Bei ungültigen Daten 'sicher' (kein Fehlalarm, kein Absturz).
export function ermittleFristStatus(abo, heute = new Date()) {
    const handlung = ermittleHandlungsDatum(abo, heute);
    if (!handlung) return 'sicher';
    const stichtag = parseDatumISO(heute);
    const tageBisFrist = Math.round((handlung.datum - stichtag) / (1000 * 60 * 60 * 24));
    if (tageBisFrist <= KRITISCH_SCHWELLE_TAGE) return 'kritisch';
    if (tageBisFrist <= WARNSCHWELLE_TAGE) return 'warnung';
    return 'sicher';
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
    // Während der Probezeit: Ende der Probezeit.
    if (istProbezeitLaufend(abo, heute)) return parseDatumISO(abo.probeEndeAm);
    const frist = ermittleKuendigungsfrist(abo, heute);
    if (!frist) return null;
    const ende = new Date(frist.zahlungsDatum);
    ende.setDate(ende.getDate() - 1);
    return ende;
}

// Reihenfolge der Abos in Liste und PDF-Übersicht: beendete Verträge ans
// Ende; alle anderen (auch gekündigte, die noch laufen) nach dem Datum der
// nächsten Zahlung. Liefert eine neue, sortierte Liste.
export function sortiereAbos(abos, heute = new Date()) {
    return [...abos].sort((a, b) => {
        const aBeendet = istVertragBeendet(a, heute);
        const bBeendet = istVertragBeendet(b, heute);
        if (aBeendet !== bBeendet) return aBeendet ? 1 : -1;
        return ermittleEffektivesZahlungsdatum(a.naechsteZahlung, a.turnus) - ermittleEffektivesZahlungsdatum(b.naechsteZahlung, b.turnus);
    });
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
            Number.isFinite(abo.kuendigungsfristTage) && abo.kuendigungsfristTage >= 0 &&
            // Optional: Frist in Wochen/Monaten (ab 2.0.2)
            (abo.kuendigungsfristEinheit === undefined ||
                (['wochen', 'monate'].includes(abo.kuendigungsfristEinheit) &&
                    Number.isInteger(abo.kuendigungsfristAnzahl) && abo.kuendigungsfristAnzahl >= 0)) &&
            // Optional: Probeabo braucht ein gültiges Enddatum (ab 2.0.2)
            (abo.probeabo !== true || !!parseDatumISO(abo.probeEndeAm))
        );
    }
};