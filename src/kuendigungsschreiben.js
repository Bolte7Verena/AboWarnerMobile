/**
 * kuendigungsschreiben.js | Modal mit fertigem Kündigungsschreiben.
 * Öffnet sich beim Klick auf "Kündigen" einer Abo-Karte.
 *
 * Ab 2.0.2 bewusst kurz gehalten:
 * - Absenderdaten (Name/Anschrift/E-Mail) werden lokal gemerkt
 *   (localStorage) und sind beim nächsten Mal schon ausgefüllt — sind sie
 *   vollständig, werden sie zu einer Zeile eingeklappt.
 * - Vertragsdaten (Vertragspartner, Vertragsnummer, Kundennummer) kommen
 *   automatisch aus dem Abo (Bearbeiten-Formular), nichts doppelt eintippen.
 * - Leere optionale Angaben fallen im Schreiben weg, statt als
 *   [Platzhalter] stehen zu bleiben.
 */

import { ermittleKuendigungsfrist, istProbezeitLaufend } from './calculator.js';
import { t, formatiereDatum } from './i18n.js';

const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const ICON_DOWNLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>';

const ABSENDER_STORAGE_KEY = 'abo-warner:absender-daten';
// Pflichtangaben für einen versandfertigen Brief (E-Mail ist optional).
const ABSENDER_PFLICHTFELDER = ['name', 'strasse', 'plzOrt'];

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function ladeAbsenderDaten() {
    try {
        return JSON.parse(localStorage.getItem(ABSENDER_STORAGE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function speichereAbsenderDaten(absender) {
    try {
        localStorage.setItem(ABSENDER_STORAGE_KEY, JSON.stringify(absender));
    } catch (error) {
        // Speichern ist Komfort — ohne localStorage funktioniert das Schreiben trotzdem.
    }
}

function absenderVollstaendig(absender) {
    return ABSENDER_PFLICHTFELDER.every((feld) => String(absender[feld] || '').trim().length > 0);
}

function heuteIsoKompakt() {
    const heute = new Date();
    const monat = String(heute.getMonth() + 1).padStart(2, '0');
    const tag = String(heute.getDate()).padStart(2, '0');
    return `${heute.getFullYear()}-${monat}-${tag}`;
}

// Macht den Abo-Namen dateisystemsicher (entfernt u.a. \ / : * ? " < > |, die auf
// Windows in Dateinamen verboten sind) und liefert einen sinnvollen Fallback,
// falls davon nichts Verwertbares übrig bleibt.
function zuDateiSicheremNamen(text) {
    const bereinigt = text.replace(/[^A-Za-z0-9À-ÖØ-öø-ÿ _-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    return bereinigt || 'Abo';
}

// Reiner Text ohne DOM-Zugriff — exportiert, damit er per Unit-Test
// prüfbar ist.
export function erzeugeSchreibenText(abo, absender, heute = new Date()) {
    const text = (wert) => String(wert || '').trim();
    const name = text(absender.name) || t('brief.platzhalterName');
    const strasse = text(absender.strasse) || t('brief.platzhalterStrasse');
    const plzOrt = text(absender.plzOrt) || t('brief.platzhalterPlzOrt');
    const email = text(absender.email);

    const empfaenger = text(abo.vertragspartner) || abo.name;
    const vertragsnummer = text(abo.vertragsnummer);
    const kundennummer = text(abo.kundennummer);

    const absenderBlock = [name, strasse, plzOrt, email].filter(Boolean).join('\n');
    const bezugBlock = [
        t('brief.betreff', { name: abo.name }),
        vertragsnummer && t('brief.vertragsnummer', { nummer: vertragsnummer }),
        kundennummer && t('brief.kundennummer', { nummer: kundennummer })
    ].filter(Boolean).join('\n');
    const bestaetigung = email
        ? t('brief.bestaetigungMail', { email })
        : t('brief.bestaetigung');
    // Optionale Unterschriftslinie (je Sprache; Deutsch: keine).
    const linie = t('brief.unterschriftslinie');
    const unterschrift = linie ? `${linie}\n${name}` : name;

    return [
        absenderBlock,
        empfaenger,
        formatiereDatum(heute),
        bezugBlock,
        t('brief.anrede'),
        t('brief.kern'),
        bestaetigung,
        t('brief.gruss'),
        unterschrift
    ].join('\n\n');
}

function erzeugeFristHinweis(abo) {
    if (istProbezeitLaufend(abo)) return t('brief.probeHinweis', { datum: formatiereDatum(abo.probeEndeAm) });
    const frist = ermittleKuendigungsfrist(abo);
    if (!frist) return '';
    return t('brief.fristHinweis', { datum: formatiereDatum(frist.fristDatum) });
}

function erzeugeVertragsdatenHinweis(abo) {
    const fehlend = [];
    if (!String(abo.vertragspartner || '').trim()) fehlend.push(t('brief.tippAnschrift'));
    if (!String(abo.vertragsnummer || '').trim()) fehlend.push(t('brief.tippVertragsnummer'));
    if (!String(abo.kundennummer || '').trim()) fehlend.push(t('brief.tippKundennummer'));
    if (fehlend.length === 0) return '';
    return t('brief.tipp', { liste: fehlend.join(', ') });
}

export function oeffneKuendigungsschreibenModal(abo) {
    const gespeicherterAbsender = ladeAbsenderDaten();
    const fristHinweis = erzeugeFristHinweis(abo);
    const vertragsdatenHinweis = erzeugeVertragsdatenHinweis(abo);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="glass-strong modal-dialog">
            <div class="modal-header">
                <h2 class="modal-title">${escapeHtml(t('brief.titel', { name: abo.name }))}</h2>
                <button type="button" class="modal-close-btn" aria-label="${escapeHtml(t('knopf.schliessen'))}">${ICON_X}</button>
            </div>
            ${fristHinweis ? `<p class="modal-subline">${fristHinweis}</p>` : ''}
            <details class="absender-details" ${absenderVollstaendig(gespeicherterAbsender) ? '' : 'open'}>
                <summary class="absender-summary">
                    <span class="absender-summary-label">${t('brief.absender')}</span>
                    <span class="absender-summary-text"></span>
                </summary>
                <div class="absender-felder">
                    <div class="form-group">
                        <label>${t('brief.feldName')}</label>
                        <input type="text" class="input-control" data-absender-feld="name" placeholder="${escapeHtml(t('brief.feldNamePlatzhalter'))}" autocomplete="name">
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>${t('brief.feldStrasse')}</label>
                            <input type="text" class="input-control" data-absender-feld="strasse" placeholder="${escapeHtml(t('brief.feldStrassePlatzhalter'))}" autocomplete="street-address">
                        </div>
                        <div class="form-group">
                            <label>${t('brief.feldPlzOrt')}</label>
                            <input type="text" class="input-control" data-absender-feld="plzOrt" placeholder="${escapeHtml(t('brief.feldPlzOrtPlatzhalter'))}">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>${t('brief.feldEmail')} <span class="label-hinweis">${t('brief.feldEmailHinweis')}</span></label>
                        <input type="email" class="input-control" data-absender-feld="email" placeholder="${escapeHtml(t('brief.optional'))}" autocomplete="email">
                    </div>
                    <p class="absender-merk-hinweis">${t('brief.merkHinweis')}</p>
                </div>
            </details>
            ${vertragsdatenHinweis ? `<p class="vertragsdaten-hinweis">${escapeHtml(vertragsdatenHinweis)}</p>` : ''}
            <div class="form-group brief-gruppe">
                <label>${t('brief.schreiben')} <span class="label-hinweis">${t('brief.schreibenHinweis')}</span></label>
                <textarea class="input-control modal-letter-textarea" rows="1"></textarea>
            </div>
            <div class="modal-aktionen">
                <button type="button" class="btn btn-primary btn-sm copy-btn">${t('brief.kopieren')}</button>
                <button type="button" class="btn btn-outline btn-sm export-schreiben-btn">${ICON_DOWNLOAD} ${t('brief.teilen')}</button>
                <button type="button" class="btn btn-outline btn-sm mark-cancelled-btn">${t('brief.markieren')}</button>
            </div>
            <p class="modal-copy-status" aria-live="polite"></p>
        </div>
    `;
    document.body.appendChild(overlay);

    const absenderFelder = overlay.querySelectorAll('[data-absender-feld]');
    absenderFelder.forEach((feld) => {
        feld.value = gespeicherterAbsender[feld.dataset.absenderFeld] || '';
    });

    const textarea = overlay.querySelector('.modal-letter-textarea');
    const copyStatus = overlay.querySelector('.modal-copy-status');
    const summaryText = overlay.querySelector('.absender-summary-text');

    function aktualisiereSchreiben() {
        const aktuellerAbsender = {};
        absenderFelder.forEach((feld) => {
            aktuellerAbsender[feld.dataset.absenderFeld] = feld.value.trim();
        });
        speichereAbsenderDaten(aktuellerAbsender);
        summaryText.textContent = absenderVollstaendig(aktuellerAbsender)
            ? t('brief.absenderKurz', { name: aktuellerAbsender.name, ort: aktuellerAbsender.plzOrt })
            : t('brief.bitteAusfuellen');
        textarea.value = erzeugeSchreibenText(abo, aktuellerAbsender);
        passeHoeheAn();
    }

    // Feld so hoch wie der Brief; reicht der Bildschirm nicht, schrumpft es per
    // CSS (.brief-gruppe) auf den freien Platz und der Brief scrollt darin.
    function passeHoeheAn() {
        const scroll = textarea.scrollTop;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight + 2}px`;
        textarea.scrollTop = scroll;
    }
    textarea.addEventListener('input', passeHoeheAn);

    absenderFelder.forEach((feld) => feld.addEventListener('input', aktualisiereSchreiben));
    aktualisiereSchreiben();

    function schliessen() {
        overlay.remove();
        document.removeEventListener('keydown', escHandler);
    }

    function escHandler(e) {
        if (e.key === 'Escape') schliessen();
    }
    document.addEventListener('keydown', escHandler);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) schliessen();
    });
    overlay.querySelector('.modal-close-btn').addEventListener('click', schliessen);

    overlay.querySelector('.copy-btn').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textarea.value);
            copyStatus.textContent = t('brief.kopiert');
        } catch (error) {
            copyStatus.textContent = t('brief.kopierenFehler');
        }
    });

    overlay.querySelector('.export-schreiben-btn').addEventListener('click', async () => {
        const dateiname = `${t('datei.schreiben')}-${zuDateiSicheremNamen(abo.name)}-${heuteIsoKompakt()}.txt`;
        try {
            const ergebnis = await window.api.exportSchreiben(textarea.value, dateiname);
            if (ergebnis.abgebrochen) {
                copyStatus.textContent = '';
                return;
            }
            copyStatus.textContent = t('brief.gespeichert', { pfad: ergebnis.pfad });
        } catch (error) {
            copyStatus.textContent = t('brief.speichernFehler');
        }
    });

    // Bewusster, separater Schritt: das Abo wird NICHT allein durchs Öffnen
    // dieses Schreibens als gekündigt markiert, sondern erst hier auf
    // explizite Bestätigung hin (window.aboKuendigen ist in app.js definiert).
    overlay.querySelector('.mark-cancelled-btn').addEventListener('click', () => {
        window.aboKuendigen(abo.id);
        schliessen();
    });
}
