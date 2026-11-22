/**
 * api.js | Capacitor-Adapter — mobiles Gegenstück zu src/core/preload.js
 * der Windows-Electron-App.
 *
 * Bildet exakt dieselbe window.api-Schnittstelle nach (loadAbos/saveAbo/
 * deleteAbo/updateAbo/exportAbos/exportSchreiben/getLocaleConfig), damit
 * app.js, kuendigungsschreiben.js und index.js unverändert aus der
 * Desktop-Version übernommen werden können — nur die Implementierung
 * dahinter ist mobil-typisch (Capacitor Filesystem/Share statt Node fs/IPC).
 */

import { Capacitor, registerPlugin } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { waehrungFuerLand } from './waehrungen.js';
import { geraeteRegion } from './region.js';
import { erzeugeSpeicher } from './speicher.js';
import { t } from './i18n.js';

// Eigenes, in der App enthaltenes Plugin (kein Fremdpaket): Texterkennung auf
// dem Gerät. iOS: ios/App/App/TextErkennungPlugin.swift (Apple Vision),
// Android: android/app/src/main/java/com/abowarner/pro/TextErkennungPlugin.java
// (Tesseract, Sprachdaten fest in der App). Kein Internet, kein Server.
const TextErkennung = registerPlugin('TextErkennung');

function pad(zahl) {
    return String(zahl).padStart(2, '0');
}

// Dateizugriff für speicher.js: app-eigenes, dauerhaftes Datenverzeichnis.
const dateien = {
    // null nur, wenn es die Datei wirklich nicht gibt (erster Start). Jeder
    // andere Lesefehler wird weitergereicht, damit nichts überschrieben wird.
    async lies(name) {
        try {
            return String((await Filesystem.readFile({ path: name, directory: Directory.Data, encoding: Encoding.UTF8 })).data);
        } catch (error) {
            if (error?.code === 'OS-PLUG-FILE-0008' || /does not exist/i.test(error?.message || '')) return null;
            const { files } = await Filesystem.readdir({ path: '', directory: Directory.Data });
            if (!files.some((datei) => datei.name === name)) return null;
            throw error;
        }
    },
    schreibe: (name, text) => Filesystem.writeFile({ path: name, directory: Directory.Data, data: text, encoding: Encoding.UTF8 }),
    benenneUm: (von, nach) => Filesystem.rename({ from: von, to: nach, directory: Directory.Data, toDirectory: Directory.Data })
};

const speicher = erzeugeSpeicher(dateien);

// Für Sicherung und PDF: nie eine leere Datei erzeugen, nur weil die Abos
// gerade nicht lesbar sind.
async function ladeFuerAusgabe() {
    const abos = await speicher.lade();
    if (speicher.istGesperrt() && abos.length === 0) throw new Error('Abo-Datei nicht lesbar');
    return abos;
}

// Mobile Geräte kennen keinen "Speichern unter"-Dialog mit Zielpfad — das
// dortige Äquivalent ist das native Share-Sheet (Datei per Mail/Dateien-App/
// Messenger etc. weiterreichen). Eine Datei wird zuerst ins Cache-Verzeichnis
// geschrieben, danach übers Share-Sheet angeboten.
async function teileDatei(dateiname, titel) {
    try {
        const { uri } = await Filesystem.getUri({ path: dateiname, directory: Directory.Cache });
        await Share.share({ title: titel, url: uri });
        return { erfolgreich: true, pfad: dateiname };
    } catch (error) {
        // Vom Nutzer geschlossen: Normalfall, kein Fehlertext. Alles andere wird
        // gemeldet — sonst glaubt man, die Sicherung sei erstellt.
        if (/cancel/i.test(error?.message || '')) return { erfolgreich: false, abgebrochen: true };
        throw error;
    }
}

window.api = {
    loadAbos: () => speicher.lade(),

    // Zustand des Speichers (siehe speicher.js): einmalige Meldung für den
    // Nutzer bzw. true, solange die Abos nicht sicher gelesen werden können.
    speicherMeldung: () => speicher.holeMeldung(),
    speicherGesperrt: () => speicher.istGesperrt(),

    // saveAbo/deleteAbo/updateAbo werfen einen Fehler, wenn nicht gespeichert
    // werden konnte. Die Oberfläche muss ihn anzeigen.
    saveAbo: (neuesAbo) => speicher.aendere((abos) => [...abos, neuesAbo]),

    deleteAbo: (id) => speicher.aendere((abos) => abos.filter((abo) => abo.id !== id)),

    updateAbo: (aktualisiertesAbo) => speicher.aendere((abos) => {
        if (!abos.some((abo) => abo.id === aktualisiertesAbo.id)) throw new Error('Abo nicht gefunden');
        return abos.map((abo) => (abo.id === aktualisiertesAbo.id ? aktualisiertesAbo : abo));
    }),

    exportAbos: async () => {
        const abos = await ladeFuerAusgabe();
        const heute = new Date();
        const dateiname = `abo-warner-export-${heute.getFullYear()}-${pad(heute.getMonth() + 1)}-${pad(heute.getDate())}.json`;
        await Filesystem.writeFile({
            path: dateiname,
            directory: Directory.Cache,
            data: JSON.stringify(abos, null, 2),
            encoding: Encoding.UTF8
        });
        return teileDatei(dateiname, t('teilen.export'));
    },

    // "Sicherung wiederherstellen": ersetzt den kompletten Bestand. Die
    // Prüfung der Datei (sicherung.js) ist vorher bereits erfolgt. Als
    // zusätzliches Sicherheitsnetz wird der bisherige Bestand vorher in
    // einer eigenen Datei im App-Datenverzeichnis abgelegt (überschreibt nur
    // die vorherige dieser Art, wird nirgendwohin übertragen).
    ersetzeAlleAbos: (neueAbos) => speicher.ersetze(neueAbos, (bisherige) =>
        dateien.schreibe('abos-vor-wiederherstellung.json', JSON.stringify(bisherige, null, 2))),

    // "Übersicht als PDF": bytes ist die lokal erzeugte PDF-Datei (Uint8Array).
    // Binärdaten erwartet Capacitor Filesystem als Base64 (ohne encoding).
    loadAbosFuerPdf: () => ladeFuerAusgabe(),

    exportPdf: async (bytes, dateiname) => {
        let binaer = '';
        const BLOCK = 0x8000;
        for (let i = 0; i < bytes.length; i += BLOCK) {
            binaer += String.fromCharCode.apply(null, bytes.subarray(i, i + BLOCK));
        }
        await Filesystem.writeFile({ path: dateiname, directory: Directory.Cache, data: btoa(binaer) });
        return teileDatei(dateiname, t('teilen.pdf'));
    },

    exportSchreiben: async (text, dateiname) => {
        await Filesystem.writeFile({ path: dateiname, directory: Directory.Cache, data: text, encoding: Encoding.UTF8 });
        return teileDatei(dateiname, t('teilen.schreiben'));
    },

    // "Per Foto einlesen": bildBase64 = verkleinertes JPEG (nur im Speicher),
    // sprachen = z.B. ['de', 'en', 'es', 'fr', 'pt'] (App-Sprache zuerst).
    // Rückgabe: erkannte Textzeilen. Im Browser gibt es keine Texterkennung.
    erkenneText: async (bildBase64, sprachen) => {
        if (!Capacitor.isNativePlatform()) {
            const fehler = new Error('Texterkennung nur in der App');
            fehler.code = 'NICHT_VERFUEGBAR';
            throw fehler;
        }
        const ergebnis = await TextErkennung.erkenne({ bild: bildBase64, sprachen });
        return Array.isArray(ergebnis.zeilen) ? ergebnis.zeilen : [];
    },

    // Zwischendateien der Kamera löschen (z.B. wenn das Bild nicht lesbar war).
    raeumeFotoAuf: async () => {
        if (Capacitor.isNativePlatform()) await TextErkennung.aufraeumen();
    },

    // Mobiles Gegenstück zu app.getLocale()/app.getLocaleCountryCode() im
    // Electron-Main-Prozess: navigator.language liefert im WebView die
    // Geräte-/System-Spracheinstellung (z.B. "de-DE").
    getLocaleConfig: async () => {
        const locale = navigator.language || 'de-DE';
        const [sprachCode] = locale.split('-');
        const waehrung = waehrungFuerLand(geraeteRegion());
        return { sprache: sprachCode || 'de', waehrung, daten: {} };
    }
};
