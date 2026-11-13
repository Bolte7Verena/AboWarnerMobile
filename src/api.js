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

import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { WaehrungsHelper } from './waehrungen.js';

const DATEI_NAME = 'abos.json';

function pad(zahl) {
    return String(zahl).padStart(2, '0');
}

// Persistenz im app-eigenen, dauerhaften Datenverzeichnis — das mobile
// Gegenstück zu app.getPath('userData') auf dem Desktop.
async function ladeAbosVonDisk() {
    try {
        const ergebnis = await Filesystem.readFile({ path: DATEI_NAME, directory: Directory.Data, encoding: Encoding.UTF8 });
        return JSON.parse(ergebnis.data);
    } catch (error) {
        // Datei existiert beim allerersten Start noch nicht — wie beim
        // Desktop-Pendant (main.js, ENOENT) startet die App dann einfach leer.
        return [];
    }
}

async function schreibeAbosAufDisk(abos) {
    await Filesystem.writeFile({
        path: DATEI_NAME,
        directory: Directory.Data,
        data: JSON.stringify(abos, null, 2),
        encoding: Encoding.UTF8
    });
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
        // Share-Sheet vom Nutzer geschlossen/abgebrochen oder auf diesem Gerät
        // nicht verfügbar — bewusst wie ein normaler Abbruch behandelt (kein
        // Fehlertext), da ein geschlossenes Share-Sheet der Normalfall ist,
        // kein tatsächlicher Fehler.
        return { erfolgreich: false, abgebrochen: true };
    }
}

window.api = {
    loadAbos: () => ladeAbosVonDisk(),

    saveAbo: async (neuesAbo) => {
        const abos = await ladeAbosVonDisk();
        abos.push(neuesAbo);
        await schreibeAbosAufDisk(abos);
        return abos;
    },

    deleteAbo: async (id) => {
        const abos = await ladeAbosVonDisk();
        const gefiltert = abos.filter((abo) => abo.id !== id);
        await schreibeAbosAufDisk(gefiltert);
        return gefiltert;
    },

    updateAbo: async (aktualisiertesAbo) => {
        const abos = await ladeAbosVonDisk();
        const index = abos.findIndex((abo) => abo.id === aktualisiertesAbo.id);
        if (index === -1) return abos;
        abos[index] = aktualisiertesAbo;
        await schreibeAbosAufDisk(abos);
        return abos;
    },

    exportAbos: async () => {
        const abos = await ladeAbosVonDisk();
        const heute = new Date();
        const dateiname = `abo-warner-export-${heute.getFullYear()}-${pad(heute.getMonth() + 1)}-${pad(heute.getDate())}.json`;
        await Filesystem.writeFile({
            path: dateiname,
            directory: Directory.Cache,
            data: JSON.stringify(abos, null, 2),
            encoding: Encoding.UTF8
        });
        return teileDatei(dateiname, 'Abo-Warner Export');
    },

    // "Sicherung wiederherstellen": ersetzt den kompletten Bestand. Die
    // Prüfung der Datei (sicherung.js) ist vorher bereits erfolgt. Als
    // zusätzliches Sicherheitsnetz wird der bisherige Bestand vorher in
    // einer eigenen Datei im App-Datenverzeichnis abgelegt (überschreibt nur
    // die vorherige dieser Art, wird nirgendwohin übertragen).
    ersetzeAlleAbos: async (neueAbos) => {
        const bisherige = await ladeAbosVonDisk();
        await Filesystem.writeFile({
            path: 'abos-vor-wiederherstellung.json',
            directory: Directory.Data,
            data: JSON.stringify(bisherige, null, 2),
            encoding: Encoding.UTF8
        });
        await schreibeAbosAufDisk(neueAbos);
        return neueAbos;
    },

    // "Übersicht als PDF": bytes ist die lokal erzeugte PDF-Datei (Uint8Array).
    // Binärdaten erwartet Capacitor Filesystem als Base64 (ohne encoding).
    exportPdf: async (bytes, dateiname) => {
        let binaer = '';
        const BLOCK = 0x8000;
        for (let i = 0; i < bytes.length; i += BLOCK) {
            binaer += String.fromCharCode.apply(null, bytes.subarray(i, i + BLOCK));
        }
        await Filesystem.writeFile({ path: dateiname, directory: Directory.Cache, data: btoa(binaer) });
        return teileDatei(dateiname, 'Abo-Übersicht');
    },

    exportSchreiben: async (text, dateiname) => {
        await Filesystem.writeFile({ path: dateiname, directory: Directory.Cache, data: text, encoding: Encoding.UTF8 });
        return teileDatei(dateiname, 'Kündigungsschreiben');
    },

    // Mobiles Gegenstück zu app.getLocale()/app.getLocaleCountryCode() im
    // Electron-Main-Prozess: navigator.language liefert im WebView die
    // Geräte-/System-Spracheinstellung (z.B. "de-DE").
    getLocaleConfig: async () => {
        const locale = navigator.language || 'de-DE';
        const [sprachCode, countryCode] = locale.split('-');
        const waehrung = WaehrungsHelper.holeWaehrungFuerRegion(countryCode || 'DE');
        return { sprache: sprachCode || 'de', waehrung, daten: {} };
    }
};
