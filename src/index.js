/**
 * index.js | Zentrale Startrampe (mobile Version).
 * Struktur identisch zur Windows-App — einziger Unterschied: api.js wird
 * zuerst importiert (Seiteneffekt: setzt window.api), da es dort per
 * Electron-Preload/contextBridge bereits vor Skriptausführung bereitstand.
 */

import './api.js';
import { zeigeAbos, neuesAboSpeichern } from './app.js';
import { initDatePicker } from './datepicker.js';
import { zeigeFaelligkeitshinweisFallsNoetig, planeFaelligkeitsBenachrichtigungen } from './faelligkeitshinweis.js';
import { initRechtliches } from './rechtliches.js';
import { seedDemoDatenFallsNoetig } from './demo-seed.js';

// Globales Binding für UI-Elemente
window.zeigeAbos = zeigeAbos;
window.neuesAboSpeichern = neuesAboSpeichern;

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Lokalisierung über den Capacitor-Adapter abrufen
        const config = await window.api.getLocaleConfig();
        window.appConfig = config;

        // 2. Regionale Landeswährung als editierbaren Startwert vorschlagen
        if (config.waehrung) {
            const waehrungInput = document.getElementById('input-waehrung');
            waehrungInput.value = config.waehrung;
            waehrungInput.setAttribute('value', config.waehrung);
        }

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

        initDatePicker({
            inputEl: document.getElementById('input-datum'),
            hiddenEl: document.getElementById('input-datum-iso'),
            wrapEl: document.querySelector('.date-input-wrap'),
            popoverEl: document.getElementById('date-picker-popover'),
            formEl: document.getElementById('abo-form')
        });

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
