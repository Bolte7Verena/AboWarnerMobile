/**
 * rechtliches.js | Steuerung für das Datenschutz-/Impressum-/Kontakt-Modal im Footer.
 * Rein statischer Inhalt (siehe index.html) — dieses Modul schaltet nur um,
 * welcher der Abschnitte sichtbar ist, und öffnet/schließt das Modal.
 */

import { t } from './i18n.js';

const KONTAKT_MAIL = 'kontakt@appvektor.com';

export function initRechtliches() {
    const overlay = document.getElementById('rechtliches-modal-overlay');
    const titel = document.getElementById('rechtliches-titel');
    const panels = {
        datenschutz: document.getElementById('rechtliches-datenschutz'),
        impressum: document.getElementById('rechtliches-impressum'),
        kontakt: document.getElementById('rechtliches-kontakt'),
    };
    const titel_je_abschnitt = {
        datenschutz: t('rechtlich.datenschutz'),
        impressum: t('rechtlich.impressum'),
        kontakt: t('rechtlich.kontakt'),
    };
    const kontaktHinweis = document.getElementById('kontakt-hinweis');

    function oeffne(abschnitt) {
        titel.textContent = titel_je_abschnitt[abschnitt];
        for (const [name, panel] of Object.entries(panels)) panel.hidden = name !== abschnitt;
        kontaktHinweis.hidden = true;
        overlay.hidden = false;
    }

    function schliesse() {
        overlay.hidden = true;
    }

    async function kopiereAdresse() {
        try {
            await navigator.clipboard.writeText(KONTAKT_MAIL);
            kontaktHinweis.textContent = t('kontakt.kopiert');
        } catch {
            kontaktHinweis.textContent = t('kontakt.kopierenFehler');
        }
        kontaktHinweis.hidden = false;
    }

    document.getElementById('btn-footer-datenschutz').addEventListener('click', () => oeffne('datenschutz'));
    document.getElementById('btn-footer-impressum').addEventListener('click', () => oeffne('impressum'));
    document.getElementById('btn-footer-kontakt').addEventListener('click', () => oeffne('kontakt'));
    document.getElementById('btn-kontakt-kopieren').addEventListener('click', kopiereAdresse);
    document.getElementById('btn-rechtliches-schliessen').addEventListener('click', schliesse);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) schliesse();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) schliesse();
    });
}
