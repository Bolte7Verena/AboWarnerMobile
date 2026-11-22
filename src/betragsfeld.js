/**
 * betragsfeld.js | Eingabefeld für Beträge (ab 2.0.2).
 *
 * Während des Tippens steht das Dezimalzeichen des Landes im Feld, egal ob die
 * Tastatur Punkt oder Komma liefert (Deutschland: "6.99" -> "6,99"). Leerzeichen
 * um das Zeichen verschwinden (manche Tastaturen fügen nach einem Punkt eines
 * ein: "6. 99"). Beim Verlassen des Feldes steht genau der Betrag da, der
 * gespeichert wird ("6" -> "6,00", "1.250" -> "1250,00").
 */

import { normalisiereZiffern, parseBetrag } from './calculator.js';
import { formatiereZahlEingabe } from './i18n.js';

// Dezimalzeichen der Anzeige: "," oder "."
export function dezimalzeichen(locale) {
    return formatiereZahlEingabe(1.5, locale).includes(',') ? ',' : '.';
}

// Text während des Tippens. Mehrere Trennzeichen: alle bis auf das letzte sind
// Tausendertrennzeichen, das letzte bleibt wie getippt (es kann noch beides werden).
export function ordneTrennzeichen(text, dezimal) {
    const tausender = dezimal === ',' ? '.' : ',';
    const t = normalisiereZiffern(text).replace(/^\s+/, '').replace(/\s*([.,])\s*/g, '$1');
    const stellen = [...t.matchAll(/[.,]/g)].map((m) => m.index);
    if (stellen.length === 0) return t;
    const zeichen = [...t];
    if (stellen.length === 1) {
        // "1.250": genau drei Ziffern dahinter = Tausender (siehe parseBetrag).
        const istTausender = /^[+-]?[1-9]\d{0,2}[.,]\d{3}$/.test(t);
        zeichen[stellen[0]] = istTausender ? tausender : dezimal;
    } else {
        stellen.slice(0, -1).forEach((i) => { zeichen[i] = tausender; });
    }
    return zeichen.join('');
}

export function initBetragsfeld(feld) {
    feld.setAttribute('autocomplete', 'off');
    feld.setAttribute('autocorrect', 'off');
    feld.setAttribute('spellcheck', 'false');

    function ordne() {
        const neu = ordneTrennzeichen(feld.value, dezimalzeichen());
        if (neu === feld.value) return;
        // Schreibmarke an derselben Ziffer lassen.
        const ende = feld.selectionEnd ?? feld.value.length;
        const dahinter = feld.value.slice(ende).replace(/\s/g, '').length;
        feld.value = neu;
        const p = Math.max(0, neu.length - dahinter);
        try { feld.setSelectionRange(p, p); } catch (error) { /* Feld nicht aktiv */ }
    }

    // Nicht mitten in einer Eingabehilfe umschreiben (sonst doppelte Zeichen).
    feld.addEventListener('input', (e) => { if (!e.isComposing) ordne(); });
    feld.addEventListener('compositionend', ordne);
    feld.addEventListener('blur', () => {
        ordne();
        const wert = parseBetrag(feld.value);
        if (Number.isFinite(wert)) feld.value = formatiereZahlEingabe(wert);
    });
}
