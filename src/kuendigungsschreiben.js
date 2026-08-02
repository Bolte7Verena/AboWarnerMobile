/**
 * kuendigungsschreiben.js | Modal mit fertigem Kündigungsschreiben.
 * Öffnet sich beim Klick auf "Kündigen" einer Abo-Karte. Die Absenderdaten
 * (Name/Adresse/Kundennummer/E-Mail) werden lokal gemerkt (localStorage),
 * damit spätere Kündigungen ohne erneutes Ausfüllen startklar sind.
 */

import { ermittleEffektivesZahlungsdatum } from './calculator.js';

const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
const ICON_DOWNLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>';

const ABSENDER_STORAGE_KEY = 'abo-warner:absender-daten';

function ladeAbsenderDaten() {
    try {
        return JSON.parse(localStorage.getItem(ABSENDER_STORAGE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

function speichereAbsenderDaten(absender) {
    localStorage.setItem(ABSENDER_STORAGE_KEY, JSON.stringify(absender));
}

function heuteFormatiert() {
    const heute = new Date();
    const tag = String(heute.getDate()).padStart(2, '0');
    const monat = String(heute.getMonth() + 1).padStart(2, '0');
    return `${tag}.${monat}.${heute.getFullYear()}`;
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
    const bereinigt = text.replace(/[^A-Za-z0-9äöüÄÖÜß _-]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
    return bereinigt || 'Abo';
}

// Letzter Tag, an dem eine fristgerechte Kündigung noch ankommen muss
// (nächste Zahlung minus Kündigungsfrist). Liegt dieser Tag bereits in der
// Vergangenheit, ist "zum nächstmöglichen Termin" die einzig ehrliche Aussage.
function berechneFristDatum(abo) {
    // Erst turnusgerecht auf das tatsächlich nächste Zahlungsdatum vorrücken —
    // sonst würde ein längst überfälliges, aber weiterhin laufendes Abo hier
    // einen Fristtermin liefern, der noch weiter in der Vergangenheit liegt.
    const effektivesZahlungsdatum = ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus);
    const zielDatum = new Date(effektivesZahlungsdatum);
    zielDatum.setDate(zielDatum.getDate() - abo.kuendigungsfristTage);
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    if (isNaN(zielDatum) || zielDatum < heute) return null;

    const tag = String(zielDatum.getDate()).padStart(2, '0');
    const monat = String(zielDatum.getMonth() + 1).padStart(2, '0');
    return `${tag}.${monat}.${zielDatum.getFullYear()}`;
}

function erzeugeSchreibenText(abo, absender) {
    const name = absender.name || '[Ihr Name]';
    const strasse = absender.strasse || '[Ihre Straße und Hausnummer]';
    const plzOrt = absender.plzOrt || '[PLZ und Ort]';
    const email = absender.email || '[Ihre E-Mail-Adresse]';
    const kundennummer = absender.kundennummer || '[Ihre Kundennummer, falls vorhanden]';

    const fristDatum = berechneFristDatum(abo);
    const fristZeile = fristDatum ? `fristgerecht zum ${fristDatum}` : 'zum nächstmöglichen Termin';

    return `${name}
${strasse}
${plzOrt}
${email}

${abo.name}
[Adresse des Anbieters, falls bekannt]

${heuteFormatiert()}

Kündigung meines Vertrags – Kundennummer: ${kundennummer}

Sehr geehrte Damen und Herren,

hiermit kündige ich meinen Vertrag über „${abo.name}" ${fristZeile}.

Bitte bestätigen Sie mir den Erhalt dieser Kündigung sowie das Vertragsende schriftlich per E-Mail an ${email}.

Mit freundlichen Grüßen

_______________________
${name}`;
}

export function oeffneKuendigungsschreibenModal(abo) {
    const gespeicherterAbsender = ladeAbsenderDaten();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="glass-strong modal-dialog">
            <div class="modal-header">
                <h2 class="modal-title">Kündigungsschreiben — ${abo.name}</h2>
                <button type="button" class="modal-close-btn" aria-label="Schließen">${ICON_X}</button>
            </div>
            <p class="modal-subline">Felder ausfüllen aktualisiert das Schreiben automatisch. Danach kopieren und versenden.</p>
            <div class="form-row">
                <div class="form-group">
                    <label>Ihr Name</label>
                    <input type="text" class="input-control" data-absender-feld="name" placeholder="Max Mustermann">
                </div>
                <div class="form-group">
                    <label>Kundennummer</label>
                    <input type="text" class="input-control" data-absender-feld="kundennummer" placeholder="optional">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Straße und Hausnummer</label>
                    <input type="text" class="input-control" data-absender-feld="strasse" placeholder="Musterstraße 1">
                </div>
                <div class="form-group">
                    <label>PLZ und Ort</label>
                    <input type="text" class="input-control" data-absender-feld="plzOrt" placeholder="12345 Musterstadt">
                </div>
            </div>
            <div class="form-group">
                <label>Ihre E-Mail-Adresse</label>
                <input type="email" class="input-control" data-absender-feld="email" placeholder="optional">
            </div>
            <div class="form-group">
                <label>Schreiben</label>
                <textarea class="input-control modal-letter-textarea" rows="14"></textarea>
            </div>
            <div class="modal-aktionen">
                <button type="button" class="btn btn-primary btn-sm copy-btn">In Zwischenablage kopieren</button>
                <button type="button" class="btn btn-outline btn-sm export-schreiben-btn">${ICON_DOWNLOAD} Als Datei exportieren</button>
                <button type="button" class="btn btn-outline btn-sm mark-cancelled-btn">Abo als gekündigt markieren</button>
                <button type="button" class="btn btn-outline btn-sm close-btn">Schließen</button>
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

    function aktualisiereSchreiben() {
        const aktuellerAbsender = {};
        absenderFelder.forEach((feld) => {
            aktuellerAbsender[feld.dataset.absenderFeld] = feld.value.trim();
        });
        speichereAbsenderDaten(aktuellerAbsender);
        textarea.value = erzeugeSchreibenText(abo, aktuellerAbsender);
    }

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
    overlay.querySelector('.close-btn').addEventListener('click', schliessen);

    overlay.querySelector('.copy-btn').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(textarea.value);
            copyStatus.textContent = 'In die Zwischenablage kopiert.';
        } catch (error) {
            copyStatus.textContent = 'Kopieren fehlgeschlagen — bitte Text manuell markieren und kopieren.';
        }
    });

    overlay.querySelector('.export-schreiben-btn').addEventListener('click', async () => {
        const dateiname = `Kuendigung-${zuDateiSicheremNamen(abo.name)}-${heuteIsoKompakt()}.txt`;
        try {
            const ergebnis = await window.api.exportSchreiben(textarea.value, dateiname);
            if (ergebnis.abgebrochen) {
                copyStatus.textContent = '';
                return;
            }
            copyStatus.textContent = `Gespeichert unter: ${ergebnis.pfad}`;
        } catch (error) {
            copyStatus.textContent = 'Speichern fehlgeschlagen — bitte erneut versuchen.';
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
