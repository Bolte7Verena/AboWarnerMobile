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
import { t } from './i18n.js';

export const MAX_DATEIGROESSE_BYTES = 5 * 1024 * 1024;

function fehler(text) {
    return { ok: false, meldung: `${text} ${t('sicherung.nichtsGeaendert')}` };
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
    // Frist in Wochen/Monaten (ab 2.0.2). Unstimmige Angaben fallen weg,
    // dann gilt wie bisher die Frist in Tagen.
    const anzahl = Number(roh.kuendigungsfristAnzahl);
    if ((roh.kuendigungsfristEinheit === 'wochen' || roh.kuendigungsfristEinheit === 'monate') && Number.isInteger(anzahl) && anzahl >= 0) {
        abo.kuendigungsfristEinheit = roh.kuendigungsfristEinheit;
        abo.kuendigungsfristAnzahl = anzahl;
    }
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
        return fehler(t('sicherung.leer'));
    }
    if (text.length > MAX_DATEIGROESSE_BYTES) {
        return fehler(t('sicherung.zuGross'));
    }

    let daten;
    try {
        daten = JSON.parse(text.replace(/^﻿/, ''));
    } catch (error) {
        return fehler(t('sicherung.unlesbar'));
    }

    const liste = Array.isArray(daten) ? daten : (daten && Array.isArray(daten.abos) ? daten.abos : null);
    if (!liste) {
        return fehler(t('sicherung.fremd'));
    }
    if (liste.length === 0) {
        return fehler(t('sicherung.keineAbos'));
    }

    const abos = liste.map(normalisiereAbo);
    const ungueltig = abos.filter((abo) => abo === null).length;
    if (ungueltig > 0) {
        return fehler(ungueltig === liste.length
            ? t('sicherung.fremd')
            : t('sicherung.beschaedigt', { ungueltig, gesamt: liste.length }));
    }

    const ids = new Set(abos.map((abo) => abo.id));
    if (ids.size !== abos.length) {
        return fehler(t('sicherung.doppelt'));
    }

    return { ok: true, abos };
}
