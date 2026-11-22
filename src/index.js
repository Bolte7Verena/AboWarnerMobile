/**
 * index.js | Zentrale Startrampe (mobile Version).
 * Struktur identisch zur Windows-App — einziger Unterschied: api.js wird
 * zuerst importiert (Seiteneffekt: setzt window.api), da es dort per
 * Electron-Preload/contextBridge bereits vor Skriptausführung bereitstand.
 */

import './api.js';
import { initSprache, wendeAufDokumentAn } from './i18n.js';
import { zeigeAbos, neuesAboSpeichern, initDatenSichern } from './app.js';
import { initDatePicker } from './datepicker.js';
import { zeigeFaelligkeitshinweisFallsNoetig, planeFaelligkeitsBenachrichtigungen } from './faelligkeitshinweis.js';
import { initRechtliches } from './rechtliches.js';
import { initHilfe } from './hilfe.js';
import { initSprachwahl } from './sprachwahl.js';
import { initFotoEinlesen } from './texterkennung.js';
import { seedDemoDatenFallsNoetig } from './demo-seed.js';

// Globales Binding für UI-Elemente
window.zeigeAbos = zeigeAbos;
window.neuesAboSpeichern = neuesAboSpeichern;

// iOS: Nach dem Auf- und Zugehen der Tastatur kann die WebView seitlich bzw. nach
// unten verschoben bleiben. Die Seite selbst scrollt nie (body overflow: hidden,
// gescrollt wird nur .main) – darum die Fensterposition immer auf 0/0 zurücksetzen,
// sobald kein Eingabefeld mehr aktiv ist, und seitlich sofort.
function setzeAnsichtZurueck() {
    const aktiv = document.activeElement;
    const tipptGerade = aktiv && aktiv.matches && aktiv.matches('input, select, textarea');
    if (window.scrollX !== 0 || document.documentElement.scrollLeft !== 0 || document.body.scrollLeft !== 0) {
        window.scrollTo(0, tipptGerade ? window.scrollY : 0);
        document.documentElement.scrollLeft = 0;
        document.body.scrollLeft = 0;
    }
    if (!tipptGerade && window.scrollY !== 0) {
        window.scrollTo(0, 0);
    }
}
document.addEventListener('focusout', () => setTimeout(setzeAnsichtZurueck, 120));
window.addEventListener('scroll', setzeAnsichtZurueck, { passive: true });
window.addEventListener('resize', setzeAnsichtZurueck);
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', setzeAnsichtZurueck);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 0. Sprache bestimmen (Einstellung bzw. Handysprache) und alle
        // statischen Texte aus der Sprachdatei einsetzen — vor allem anderen,
        // damit nie eine leere Oberfläche zu sehen ist.
        initSprache();
        wendeAufDokumentAn();

        // 1. Lokalisierung über den Capacitor-Adapter abrufen
        const config = await window.api.getLocaleConfig();
        window.appConfig = config;

        // 2. Währungsauswahl: Vorbelegt wird sie in zeigeAbos() mit der Hauptwährung.

        // 3. UI-Ereignisse verdrahten
        const modalOverlay = document.getElementById('abo-modal-overlay');
        const aboForm = document.getElementById('abo-form');

        function oeffneAboModal() {
            modalOverlay.hidden = false;
            document.getElementById('input-name').focus();
        }

        function schliesseAboModal() {
            modalOverlay.hidden = true;
            aboForm.reset();
        }

        // "Weitere Angaben (optional)" beim nächsten Öffnen wieder zugeklappt,
        // damit das Formular einfach bleibt (Felder leert reset() selbst).
        aboForm.addEventListener('reset', () => {
            document.getElementById('weitere-angaben').open = false;
            document.getElementById('probe-datum-gruppe').hidden = true;
        });

        // Probeabo: Datum nur zeigen, wenn der Schalter an ist.
        const probeSchalter = document.getElementById('input-probe');
        probeSchalter.addEventListener('change', () => {
            document.getElementById('probe-datum-gruppe').hidden = !probeSchalter.checked;
        });

        document.getElementById('btn-neues-abo').addEventListener('click', oeffneAboModal);
        document.getElementById('btn-modal-schliessen').addEventListener('click', schliesseAboModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) schliesseAboModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modalOverlay.hidden) schliesseAboModal();
        });

        document.getElementById('btn-speichern').addEventListener('click', async (e) => {
            e.preventDefault();
            await neuesAboSpeichern();
            if (!document.getElementById('form-fehler').textContent) {
                schliesseAboModal();
            }
        });
        document.getElementById('input-suche').addEventListener('input', () => zeigeAbos());
        initRechtliches();
        initDatenSichern();
        initHilfe();
        initSprachwahl();

        const zahlungsDatum = initDatePicker({
            inputEl: document.getElementById('input-datum'),
            hiddenEl: document.getElementById('input-datum-iso'),
            wrapEl: document.querySelector('.date-input-wrap'),
            popoverEl: document.getElementById('date-picker-popover'),
            formEl: document.getElementById('abo-form')
        });
        initDatePicker({
            inputEl: document.getElementById('input-probe-datum'),
            hiddenEl: document.getElementById('input-probe-datum-iso'),
            wrapEl: document.getElementById('input-probe-datum').closest('.date-input-wrap'),
            popoverEl: document.getElementById('probe-date-picker-popover'),
            formEl: document.getElementById('abo-form')
        });
        initFotoEinlesen({ datumsauswahl: zahlungsDatum });

        // 4. Nur für automatisierte Store-Screenshots (siehe demo-seed.js):
        // feste Demo-Abos anlegen, bevor die Liste gerendert wird. Das Flag
        // wird ausschließlich von SceneDelegate.swift für Fastlane-Snapshot-
        // Läufe gesetzt, für echte Nutzer bleibt dieser Zweig inaktiv.
        if (window.__UITEST_SEED_DEMO_DATA__) {
            await seedDemoDatenFallsNoetig();
        }

        // 5. Erst jetzt: App-UI rendern
        const alleAbos = await zeigeAbos();

        // 6. Fälligkeitshinweis: bewusst in einem EIGENEN try/catch, getrennt
        // vom restlichen Start-Ablauf. So kann ein Fehler an anderer Stelle
        // (z.B. bei der weiter unten folgenden nativen Benachrichtigungs-
        // Berechtigungsabfrage) den Hinweis niemals stillschweigend
        // unterdrücken — beide Plattformen sollen sich hier identisch
        // verhalten, unabhängig davon, was sonst noch im Start-Ablauf passiert.
        try {
            zeigeFaelligkeitshinweisFallsNoetig(alleAbos);
        } catch (hinweisFehler) {
            console.error('Fälligkeitshinweis konnte nicht angezeigt werden:', hinweisFehler);
        }

        // 7. Native Benachrichtigungen (nur mobil) — läuft unabhängig vom
        // Toast oben und darf dessen Anzeige nicht beeinflussen können.
        planeFaelligkeitsBenachrichtigungen(alleAbos);
    } catch (error) {
        console.error('Fataler Startfehler:', error);
    }
});
