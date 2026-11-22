/**
 * bestaetigung.js | Eigener Bestätigungsdialog (z.B. "Wirklich löschen?").
 *
 * Bewusst kein natives window.confirm(): Das wäre auf dem Desktop (Electron)
 * ein blockierendes OS-Fenster (siehe Kommentar zu alert() in app.js) und
 * sieht in iOS-/Android-WebViews je nach System unterschiedlich und
 * stilfremd aus. Dieser Dialog nutzt dieselben Modal-Bausteine wie das
 * Kündigungsschreiben und liefert ein Promise<boolean>.
 */

import { initDatePicker } from './datepicker.js';
import { t } from './i18n.js';

const ICON_KALENDER = '<svg class="date-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>';

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function frageBestaetigung({ titel, text, bestaetigenText = t('knopf.ok'), abbrechenText = t('knopf.abbrechen'), gefaehrlich = false }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay bestaetigung-overlay';
        overlay.innerHTML = `
            <div class="glass-strong modal-dialog bestaetigung-dialog" role="alertdialog" aria-modal="true" aria-labelledby="bestaetigung-titel" aria-describedby="bestaetigung-text">
                <h2 class="modal-title" id="bestaetigung-titel">${escapeHtml(titel)}</h2>
                <p class="bestaetigung-text" id="bestaetigung-text">${escapeHtml(text)}</p>
                <div class="modal-aktionen bestaetigung-aktionen">
                    <button type="button" class="btn btn-outline btn-sm bestaetigung-abbrechen-btn">${escapeHtml(abbrechenText)}</button>
                    <button type="button" class="btn btn-sm ${gefaehrlich ? 'btn-danger' : 'btn-primary'} bestaetigung-ok-btn">${escapeHtml(bestaetigenText)}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        function beenden(ergebnis) {
            document.removeEventListener('keydown', escHandler);
            overlay.remove();
            resolve(ergebnis);
        }

        function escHandler(e) {
            if (e.key === 'Escape') beenden(false);
        }
        document.addEventListener('keydown', escHandler);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) beenden(false);
        });
        overlay.querySelector('.bestaetigung-abbrechen-btn').addEventListener('click', () => beenden(false));
        overlay.querySelector('.bestaetigung-ok-btn').addEventListener('click', () => beenden(true));

        // Fokus auf "Abbrechen": ein versehentliches Enter/Tippen löscht nichts.
        overlay.querySelector('.bestaetigung-abbrechen-btn').focus();
    });
}

// Wichtige Nachricht mit nur einem Knopf (z.B. "Nicht gespeichert"). Bleibt
// stehen, bis sie bestätigt wird — ein Tippen daneben schließt sie nicht.
export function zeigeMeldung({ titel, text }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay bestaetigung-overlay meldung-overlay';
        overlay.innerHTML = `
            <div class="glass-strong modal-dialog bestaetigung-dialog" role="alertdialog" aria-modal="true" aria-labelledby="meldung-titel" aria-describedby="meldung-text">
                <h2 class="modal-title" id="meldung-titel">${escapeHtml(titel)}</h2>
                <p class="bestaetigung-text" id="meldung-text">${escapeHtml(text)}</p>
                <div class="modal-aktionen bestaetigung-aktionen">
                    <button type="button" class="btn btn-primary btn-sm meldung-ok-btn">${escapeHtml(t('knopf.ok'))}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        const knopf = overlay.querySelector('.meldung-ok-btn');
        knopf.addEventListener('click', () => {
            overlay.remove();
            resolve();
        });
        knopf.focus();
    });
}

// Dialog mit einem Datumsfeld (deutscher Kalender), z.B. "Gekündigt zum".
// Liefert das gewählte Datum als ISO-String ("2026-12-31") oder null bei Abbruch.
export function frageDatum({ titel, text, label, vorschlagISO = '', bestaetigenText = t('knopf.speichern'), abbrechenText = t('knopf.abbrechen') }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay bestaetigung-overlay';
        overlay.innerHTML = `
            <div class="glass-strong modal-dialog bestaetigung-dialog" role="dialog" aria-modal="true" aria-labelledby="datum-dialog-titel">
                <h2 class="modal-title" id="datum-dialog-titel">${escapeHtml(titel)}</h2>
                ${text ? `<p class="bestaetigung-text">${escapeHtml(text)}</p>` : ''}
                <div class="form-group date-field">
                    <label>${escapeHtml(label)}</label>
                    <div class="date-input-wrap">
                        <input type="text" class="input-control date-input" placeholder="${escapeHtml(t('feld.datumPlatzhalter'))}" readonly autocomplete="off">
                        ${ICON_KALENDER}
                        <div class="date-picker-popover" hidden></div>
                    </div>
                    <input type="hidden" class="datum-dialog-iso" value="${escapeHtml(vorschlagISO)}">
                </div>
                <p class="edit-fehler datum-dialog-fehler" aria-live="polite"></p>
                <div class="modal-aktionen bestaetigung-aktionen">
                    <button type="button" class="btn btn-outline btn-sm bestaetigung-abbrechen-btn">${escapeHtml(abbrechenText)}</button>
                    <button type="button" class="btn btn-primary btn-sm bestaetigung-ok-btn">${escapeHtml(bestaetigenText)}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        const wrapEl = overlay.querySelector('.date-input-wrap');
        const hiddenEl = overlay.querySelector('.datum-dialog-iso');
        const popoverEl = wrapEl.querySelector('.date-picker-popover');
        const kalender = initDatePicker({
            inputEl: wrapEl.querySelector('.date-input'),
            hiddenEl,
            wrapEl,
            popoverEl
        });

        function beenden(ergebnis) {
            document.removeEventListener('keydown', escHandler, true);
            kalender.zerstoeren();
            overlay.remove();
            resolve(ergebnis);
        }

        function escHandler(e) {
            // Escape schließt zuerst nur einen offenen Kalender (das erledigt der
            // Datepicker selbst), erst beim nächsten Escape den ganzen Dialog.
            // Capture-Phase: läuft VOR dem Handler des Datepickers, sieht also
            // noch, ob der Kalender gerade offen ist.
            if (e.key !== 'Escape' || !popoverEl.hidden) return;
            beenden(null);
        }
        document.addEventListener('keydown', escHandler, true);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) beenden(null);
        });
        overlay.querySelector('.bestaetigung-abbrechen-btn').addEventListener('click', () => beenden(null));
        overlay.querySelector('.bestaetigung-ok-btn').addEventListener('click', () => {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(hiddenEl.value)) {
                overlay.querySelector('.datum-dialog-fehler').textContent = t('datum.fehlt');
                return;
            }
            beenden(hiddenEl.value);
        });
    });
}
