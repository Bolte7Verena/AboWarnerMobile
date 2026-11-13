/**
 * sicherung.js | Prüfen und Einlesen einer Sicherungsdatei ("Sicherung
 * wiederherstellen"). Reine Funktionen ohne DOM/Capacitor — per Unit-Test
 * prüfbar.
 *
 * Format einer Sicherung = genau das, was "Sicherung erstellen" (bzw. der
 * frühere Knopf "Exportieren") schreibt: ein JSON-Array von Abos.
 * Zusätzlich akzeptiert: ein Objekt mit Feld "abos" (Array), falls das
 * Format später einmal erweitert wird.
 *
 * Grundsatz: Eine Datei wird nur übernommen, wenn JEDER Eintrag gültig ist.
 * Sonst wird sie mit verständlicher Meldung abgelehnt und es ändert sich
 * nichts. Übernommen werden nur bekannte Felder (fremde Zusatzfelder fallen weg).
 */

import { Calculator, TURNUS_MONATE, parseBetrag, parseDatumISO, formatiereDatumISO } from './calculator.js';

export const MAX_DATEIGROESSE_BYTES = 5 * 1024 * 1024;

const NICHTS_GEAENDERT = 'Deine vorhandenen Abos bleiben unverändert.';

function fehler(text) {
    return { ok: false, meldung: `${text} ${NICHTS_GEAENDERT}` };
}

function optionalerText(wert) {
    return typeof wert === 'string' ? wert.trim() : '';
}

// Wandelt einen Rohdatensatz in ein sauberes Abo um — oder null, wenn er
// unbrauchbar ist.
export function normalisiereAbo(roh) {
    if (!roh || typeof roh !== 'object' || Array.isArray(roh)) return null;

    const id = typeof roh.id === 'string' || typeof roh.id === 'number' ? String(roh.id).trim() : '';
    const naechsteZahlung = parseDatumISO(roh.naechsteZahlung);
    const kosten = parseBetrag(typeof roh.kosten === 'number' ? roh.kosten : String(roh.kosten ?? ''));
    const frist = Number(roh.kuendigungsfristTage);
    if (!id || !naechsteZahlung || !Number.isFinite(frist)) return null;

    const abo = {
        id,
        name: optionalerText(roh.name),
        kosten,
        waehrung: optionalerText(roh.waehrung),
        turnus: typeof roh.turnus === 'string' ? roh.turnus : '',
        kategorie: optionalerText(roh.kategorie) || 'Sonstiges',
        naechsteZahlung: formatiereDatumISO(naechsteZahlung),
        kuendigungsfristTage: Math.round(frist)
    };
    if (!Calculator.istGueltig(abo) || !TURNUS_MONATE[abo.turnus]) return null;

    const vertragsnummer = optionalerText(roh.vertragsnummer);
    const kundennummer = optionalerText(roh.kundennummer);
    const vertragspartner = optionalerText(roh.vertragspartner);
    if (vertragsnummer) abo.vertragsnummer = vertragsnummer;
    if (kundennummer) abo.kundennummer = kundennummer;
    if (vertragspartner) abo.vertragspartner = vertragspartner;

    if (roh.gekuendigt === true) {
        abo.gekuendigt = true;
        const ende = parseDatumISO(roh.gekuendigtZum);
        if (ende) abo.gekuendigtZum = formatiereDatumISO(ende);
    }
    return abo;
}

// text: Dateiinhalt als String. Rückgabe:
//   { ok: true, abos }            — alles gültig, bereit zum Übernehmen
//   { ok: false, meldung }        — verständliche Ablehnung, nichts geändert
export function pruefeSicherung(text) {
    if (typeof text !== 'string' || text.trim() === '') {
        return fehler('Die Datei ist leer.');
    }
    if (text.length > MAX_DATEIGROESSE_BYTES) {
        return fehler('Die Datei ist zu groß für eine Abo-Warner-Sicherung.');
    }

    let daten;
    try {
        daten = JSON.parse(text.replace(/^﻿/, ''));
    } catch (error) {
        return fehler('Diese Datei ist keine Abo-Warner-Sicherung (Inhalt nicht lesbar).');
    }

    const liste = Array.isArray(daten) ? daten : (daten && Array.isArray(daten.abos) ? daten.abos : null);
    if (!liste) {
        return fehler('Diese Datei ist keine Abo-Warner-Sicherung.');
    }
    if (liste.length === 0) {
        return fehler('Die Sicherung enthält keine Abos.');
    }

    const abos = liste.map(normalisiereAbo);
    const ungueltig = abos.filter((abo) => abo === null).length;
    if (ungueltig > 0) {
        return fehler(ungueltig === liste.length
            ? 'Diese Datei ist keine Abo-Warner-Sicherung.'
            : `Die Sicherung ist beschädigt: ${ungueltig} von ${liste.length} Einträgen sind unvollständig.`);
    }

    const ids = new Set(abos.map((abo) => abo.id));
    if (ids.size !== abos.length) {
        return fehler('Die Sicherung ist beschädigt (doppelte Einträge).');
    }

    return { ok: true, abos };
}
