/**
 * i18n.js | Übersetzungen (ab 2.0.2).
 *
 * - Eine Datei pro Sprache unter src/i18n/ (de.js = Ausgangssprache).
 *   Neue Sprache = neue Datei + Eintrag in SPRACHEN (+ ggf. Regel in
 *   ermittleSprache). Fehlt in einer Sprache ein Schlüssel, wird der
 *   deutsche Text verwendet (nie ein leerer Text).
 * - t('schluessel', { name: 'X' }) ersetzt Platzhalter der Form {name}.
 * - Statische Texte in index.html tragen data-i18n-Attribute und werden
 *   beim Start von wendeAufDokumentAn() gefüllt.
 * - Spracheinstellung: 'auto' (Handysprache) | 'de' | 'en' | 'es' | 'fr' | 'pt',
 *   gespeichert in localStorage. Automatisch: Handysprache Deutsch, Spanisch,
 *   Französisch oder Portugiesisch -> diese Sprache, sonst Englisch.
 */

import de from './i18n/de.js';
import en from './i18n/en.js';
import es from './i18n/es.js';
import fr from './i18n/fr.js';
import pt from './i18n/pt.js';
import { formatiereDatumDE, parseDatumISO } from './calculator.js';

export const SPRACHEN = { de, en, es, fr, pt };
export const SPRACH_EINSTELLUNG_KEY = 'abo-warner:sprache';
export const EINSTELLUNGEN = ['auto', 'de', 'en', 'es', 'fr', 'pt'];

let aktiv = 'de';

export function setzeSprache(code) {
    aktiv = SPRACHEN[code] ? code : 'de';
}

export function aktuelleSprache() {
    return aktiv;
}

// Einstellung ('auto'|'de'|'en'|'es'|'fr'|'pt') + Gerätesprache(n) ->
// tatsächliche Sprache. Es zählt nur die erste (bevorzugte) Gerätesprache.
export function ermittleSprache(einstellung, geraeteSprachen) {
    if (einstellung !== 'auto' && SPRACHEN[einstellung]) return einstellung;
    const liste = Array.isArray(geraeteSprachen) ? geraeteSprachen : [geraeteSprachen];
    const erste = String(liste.find(Boolean) || '').toLowerCase();
    const basis = erste.split(/[-_]/)[0];
    return SPRACHEN[basis] ? basis : 'en';
}

export function ladeSpracheinstellung() {
    try {
        const wert = localStorage.getItem(SPRACH_EINSTELLUNG_KEY);
        return EINSTELLUNGEN.includes(wert) ? wert : 'auto';
    } catch (error) {
        return 'auto';
    }
}

export function speichereSpracheinstellung(wert) {
    try {
        localStorage.setItem(SPRACH_EINSTELLUNG_KEY, EINSTELLUNGEN.includes(wert) ? wert : 'auto');
    } catch (error) {
        // Ohne localStorage gilt weiterhin "automatisch".
    }
}

function geraeteSprachen() {
    if (typeof navigator === 'undefined') return [];
    return navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
}

// Beim App-Start: Sprache aus Einstellung + Gerät bestimmen und aktivieren.
export function initSprache() {
    setzeSprache(ermittleSprache(ladeSpracheinstellung(), geraeteSprachen()));
    return aktiv;
}

function ersetze(text, params) {
    return String(text).replace(/\{(\w+)\}/g, (ganz, name) => (params[name] !== undefined ? String(params[name]) : ganz));
}

export function t(schluessel, params = {}) {
    const text = SPRACHEN[aktiv][schluessel] ?? de[schluessel] ?? schluessel;
    return ersetze(text, params);
}

// Anzeige eines gespeicherten Werts (z.B. Turnus "Monatlich", Kategorie
// "Versicherung"). Gespeichert wird immer der deutsche Wert — so bleiben alle
// vorhandenen Daten gültig. Unbekannte Werte (z.B. eigene Kategorie aus einer
// Sicherung) werden unverändert angezeigt.
export function tWert(bereich, wert) {
    const schluessel = `${bereich}.${wert}`;
    return de[schluessel] !== undefined ? t(schluessel) : String(wert ?? '');
}

// Mit Einzahl-Variante: nutzt "<schluessel>.eins", falls vorhanden und anzahl === 1.
export function tAnzahl(schluessel, anzahl, params = {}) {
    const woerterbuch = SPRACHEN[aktiv];
    const eins = `${schluessel}.eins`;
    const key = anzahl === 1 && (woerterbuch[eins] !== undefined || (aktiv === 'de' && de[eins] !== undefined)) ? eins : schluessel;
    return t(key, { anzahl, ...params });
}

// Anzeige eines Datums. Deutsch: immer TT.MM.JJJJ. Andere Sprachen: Format
// der Geräte-Region (z.B. en-US 11/15/2026, en-GB 15/11/2026), immer mit
// lateinischen Ziffern, gregorianischem Kalender (sonst z.B. Iran: Jahr 1405,
// Thailand: 2569) und ohne Steuerzeichen (wichtig auch für die PDF).
export function formatiereDatum(datum, locale) {
    if (aktiv === 'de') return formatiereDatumDE(datum);
    const d = parseDatumISO(datum);
    if (!d) return '';
    const ziel = locale || geraeteSprachen().find(Boolean) || 'en-US';
    try {
        return new Intl.DateTimeFormat(ziel, { year: 'numeric', month: '2-digit', day: '2-digit', numberingSystem: 'latn', calendar: 'gregory' })
            .format(d)
            .replace(/[‎‏؜]/g, '');
    } catch (error) {
        return formatiereDatumDE(d);
    }
}

// Füllt alle markierten Texte in index.html:
//   data-i18n="schluessel"              -> textContent
//   data-i18n-html="schluessel"         -> innerHTML (nur eigene, statische Texte)
//   data-i18n-placeholder / -aria-label / -alt -> jeweiliges Attribut
export function wendeAufDokumentAn(wurzel = document) {
    if (wurzel === document) document.documentElement.lang = aktiv;
    wurzel.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    wurzel.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    wurzel.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)); });
    wurzel.querySelectorAll('[data-i18n-aria-label]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel)); });
}
