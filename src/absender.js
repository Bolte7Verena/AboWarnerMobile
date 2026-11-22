/**
 * absender.js | Gemerkte Absenderdaten des Nutzers (localStorage) und die
 * Prüfung, ob ein Text die eigene Anschrift enthält. Die eigene Anschrift darf
 * nie Vertragspartner sein: Das Kündigungsschreiben ginge sonst an den Nutzer selbst.
 */

const ABSENDER_STORAGE_KEY = 'abo-warner:absender-daten';

export function ladeAbsenderDaten() {
    try {
        return JSON.parse(localStorage.getItem(ABSENDER_STORAGE_KEY)) || {};
    } catch (error) {
        return {};
    }
}

// true, wenn gemerkt.
export function speichereAbsenderDaten(absender) {
    try {
        localStorage.setItem(ABSENDER_STORAGE_KEY, JSON.stringify(absender));
        return true;
    } catch (error) {
        return false; // Das Schreiben funktioniert trotzdem, es wird nur nichts gemerkt.
    }
}

// Nur Buchstaben und Ziffern, ohne Akzente; "Straße" = "Strasse" = "Str."
function kern(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/ß/g, 'ss')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/stra(?:ss|s)e\b|str\.?(?=\s|\d|$)/g, 'str')
        .replace(/[^\p{L}\p{N}]/gu, '');
}

// Enthält der Text die eigene Anschrift? Straße mit Hausnummer, oder der volle
// Name zusammen mit der Postleitzahl. Ein gleicher Ort allein genügt nicht.
export function istEigeneAnschrift(text, absender = {}) {
    const ganz = kern(text);
    if (!ganz) return false;
    const strasse = kern(absender.strasse);
    const plz = (/\d{4,}/.exec(String(absender.plzOrt || '').replace(/[\s-]/g, '')) || [''])[0];
    const name = kern(absender.name);
    const zeilen = String(text).split(/\r?\n/).map(kern);
    if (strasse.length >= 5 && /\d/.test(strasse) && zeilen.includes(strasse)) {
        // Dieselbe Straße gibt es in vielen Orten: ist eine andere PLZ genannt, ist es nicht die eigene.
        return !plz || ganz.includes(plz) || !/\d{4,}/.test(ganz.replace(strasse, ''));
    }
    return name.length >= 5 && ganz.includes(name) && plz.length >= 4 && ganz.includes(plz);
}
