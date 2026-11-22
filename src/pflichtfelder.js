/**
 * pflichtfelder.js | Prüft die Eingaben für ein Abo und sagt genau, welches Feld
 * fehlt oder nicht stimmt (ab 2.0.2): Text direkt am Feld, rote Markierung,
 * Scrollen zum ersten betroffenen Feld. Gilt für "Neues Abo" und "Bearbeiten".
 */

import { MAX_BETRAG, MAX_FRIST, istFristZuLang, parseBetrag, parseDatumISO } from './calculator.js';
import { t, tAnzahl, aufzaehlung, formatiereZahlEingabe } from './i18n.js';

// eingabe: die Texte aus dem Formular { name, kosten, kategorie, naechsteZahlung,
// frist, fristEinheit, probe (Schalter), probeEnde }.
// Rückgabe in Formular-Reihenfolge: [{ feld, text }], leer = alles in Ordnung.
export function pruefeEingabe(eingabe) {
    const text = (wert) => String(wert ?? '').trim();
    const fehler = [];
    const melde = (feld, meldung) => fehler.push({ feld, text: meldung });

    if (!text(eingabe.name)) melde('name', t('fehlt.name'));

    const betrag = parseBetrag(text(eingabe.kosten));
    if (!text(eingabe.kosten)) melde('kosten', t('fehlt.kosten', { betrag: formatiereZahlEingabe(29.99) }));
    else if (!(betrag >= 0 && betrag <= MAX_BETRAG)) melde('kosten', t('feld.fehlerBetrag', { betrag: formatiereZahlEingabe(29.99) }));

    if (!text(eingabe.kategorie)) melde('kategorie', t('feld.fehlerKategorie'));
    if (!parseDatumISO(text(eingabe.naechsteZahlung))) melde('naechsteZahlung', t('fehlt.naechsteZahlung'));

    const frist = text(eingabe.frist) === '' ? NaN : Number(text(eingabe.frist));
    if (eingabe.fristEinheit === 'jederzeit') { /* keine Frist nötig */ } else if (text(eingabe.frist) === '') melde('frist', t('fehlt.frist'));
    else if (!Number.isInteger(frist) || frist < 0) melde('frist', t('feld.fehlerFristZahl'));
    else if (istFristZuLang(frist, eingabe.fristEinheit)) melde('frist', t('feld.fehlerFrist', { max: tAnzahl(`frist.${eingabe.fristEinheit}`, MAX_FRIST[eingabe.fristEinheit]) }));

    if (eingabe.probe && !parseDatumISO(text(eingabe.probeEnde))) melde('probeEnde', t('fehlt.probeEnde'));
    return fehler;
}

const FELD_NAME = { name: 'feld.name', kosten: 'feld.kosten', kategorie: 'feld.kategorie', naechsteZahlung: 'feld.naechsteZahlung', frist: 'feld.frist', probeEnde: 'fehlt.probeFeld' };

// Text unter dem Knopf: bei einem Fehler dessen Text, bei mehreren die Feldnamen.
export function fehlerZusammenfassung(fehler) {
    if (fehler.length === 0) return '';
    if (fehler.length === 1) return fehler[0].text;
    return t('fehlt.mehrere', { liste: aufzaehlung(fehler.map((f) => t(FELD_NAME[f.feld]))) });
}

export function loescheFeldFehler(formular) {
    formular.querySelectorAll('.feld-fehlt').forEach((el) => {
        el.classList.remove('feld-fehlt');
        el.removeAttribute('aria-invalid');
        el.removeAttribute('aria-describedby');
    });
    formular.querySelectorAll('.feld-hinweis').forEach((el) => el.remove());
}

// "Jederzeit kündbar" gewählt: Zahlenfeld ausblenden. Liefert die Funktion, die
// nach einem Formular-Reset den Zustand angleicht.
export function initFristAuswahl(einheitEl, anzahlEl) {
    const gleicheAn = () => { anzahlEl.hidden = einheitEl.value === 'jederzeit'; };
    einheitEl.addEventListener('change', gleicheAn);
    gleicheAn();
    return gleicheAn;
}

let laufendeNummer = 0;

// Markiert die Felder, zeigt den Text direkt darunter und in zusammenfassungEl.
// finde(feld) liefert das sichtbare Eingabeelement. Das erste Feld wird in die
// Bildmitte geholt. Ändert der Nutzer ein Feld, verschwindet dessen Markierung.
export function zeigeFeldFehler(formular, fehler, finde, zusammenfassungEl) {
    loescheFeldFehler(formular);
    let offen = [...fehler];
    const fasseZusammen = () => { if (zusammenfassungEl) zusammenfassungEl.textContent = fehlerZusammenfassung(offen); };
    fehler.forEach((eintrag) => {
        const el = finde(eintrag.feld);
        const gruppe = el && el.closest('.form-group');
        if (!gruppe) return;
        const hinweis = document.createElement('p');
        hinweis.className = 'feld-hinweis';
        hinweis.id = `feld-hinweis-${++laufendeNummer}`;
        hinweis.textContent = eintrag.text;
        gruppe.appendChild(hinweis);
        el.classList.add('feld-fehlt');
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby', hinweis.id);
        // 'wertgesetzt': vom Foto oder Kalender eingetragen. Beim Probezeit-Datum zählt
        // auch der Schalter darüber, bei der Frist auch die Einheit daneben.
        const bereich = el.closest('.probe-bereich') || gruppe;
        const arten = ['input', 'change', 'wertgesetzt'];
        const weg = () => {
            arten.forEach((art) => bereich.removeEventListener(art, weg));
            if (!hinweis.isConnected) return; // schon neu geprüft oder Formular geleert
            el.classList.remove('feld-fehlt');
            el.removeAttribute('aria-invalid');
            el.removeAttribute('aria-describedby');
            hinweis.remove();
            offen = offen.filter((f) => f !== eintrag);
            fasseZusammen();
        };
        arten.forEach((art) => bereich.addEventListener(art, weg));
    });
    fasseZusammen();
    const erstes = fehler.map(({ feld }) => finde(feld)).find(Boolean);
    if (!erstes) return;
    // Datumsfelder nicht fokussieren (das öffnete den Kalender).
    if (!erstes.readOnly) erstes.focus({ preventScroll: true });
    erstes.closest('.form-group').scrollIntoView({ block: 'center', behavior: 'auto' });
}
