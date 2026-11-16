/**
 * texterkennung.js | "Per Foto einlesen" im Formular "Neues Abo" (ab 2.0.2).
 *
 * Ablauf, vollständig auf dem Gerät:
 * 1. Nutzer tippt "Per Foto einlesen" und dann "Foto aufnehmen" oder
 *    "Bild auswählen". Erst dadurch öffnet das System Kamera bzw. Bildauswahl
 *    (iOS fragt beim ersten Mal nach der Erlaubnis, Android braucht keine,
 *    weil die System-Kamera bzw. die System-Bildauswahl genutzt wird).
 * 2. Das Bild wird nur im Arbeitsspeicher verkleinert und an die
 *    Texterkennung des Geräts übergeben (iOS: Apple Vision, Android:
 *    Tesseract mit fest eingebauten Sprachdaten). Kein Internet, kein Server.
 * 3. Aus dem erkannten Text werden Werte VORGESCHLAGEN
 *    (texterkennung-auswertung.js). Nur leere Felder werden befüllt, Unsicheres
 *    bleibt leer. Der Nutzer prüft und speichert selbst.
 * 4. Das Bild wird nicht gespeichert: Verweise werden verworfen, das
 *    Dateifeld geleert, Zwischendateien der Kamera löscht die native Seite.
 */

import { t, tAnzahl, aktuelleSprache, formatiereDatum } from './i18n.js';
import { formatiereZahlDE, naechsteZahlungAb } from './calculator.js';
import { werteTextAus, vorschlagNaechsteZahlung } from './texterkennung-auswertung.js';

const MAX_KANTE = 2400; // Pixel, genügt für gut lesbaren Text

// Bild aus der Datei -> verkleinertes JPEG als Base64 (nur im Speicher).
async function bildAlsJpegBase64(datei) {
    let quelle;
    let breite;
    let hoehe;
    try {
        quelle = await createImageBitmap(datei, { imageOrientation: 'from-image' });
        breite = quelle.width;
        hoehe = quelle.height;
    } catch (error) {
        // Ersatzweg: über ein data:-URL (blob: ist per CSP nicht erlaubt).
        const dataUrl = await new Promise((resolve, reject) => {
            const leser = new FileReader();
            leser.onload = () => resolve(leser.result);
            leser.onerror = () => reject(leser.error);
            leser.readAsDataURL(datei);
        });
        quelle = await new Promise((resolve, reject) => {
            const bild = new Image();
            bild.onload = () => resolve(bild);
            bild.onerror = reject;
            bild.src = dataUrl;
        });
        breite = quelle.naturalWidth;
        hoehe = quelle.naturalHeight;
    }
    const faktor = Math.min(1, MAX_KANTE / Math.max(breite, hoehe));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(breite * faktor));
    canvas.height = Math.max(1, Math.round(hoehe * faktor));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(quelle, 0, 0, canvas.width, canvas.height);
    if (quelle.close) quelle.close();
    const jpeg = canvas.toDataURL('image/jpeg', 0.92);
    canvas.width = 0;
    canvas.height = 0;
    return jpeg.slice(jpeg.indexOf(',') + 1);
}

// Schreibt die Region Daten als MM/TT (z.B. USA)?
function monatZuerst() {
    try {
        const teile = new Intl.DateTimeFormat(navigator.language || 'de-DE').formatToParts(new Date(2026, 10, 25));
        return teile.findIndex((teil) => teil.type === 'month') < teile.findIndex((teil) => teil.type === 'day');
    } catch (error) {
        return false;
    }
}

// Reihenfolge der Erkennungssprachen: App-Sprache zuerst.
function erkennungsSprachen() {
    const alle = ['de', 'en', 'es', 'fr', 'pt'];
    const erste = aktuelleSprache();
    return [erste, ...alle.filter((code) => code !== erste)];
}

function markiere(el) {
    el.classList.add('vom-foto');
    el.addEventListener('input', () => el.classList.remove('vom-foto'), { once: true });
    el.addEventListener('change', () => el.classList.remove('vom-foto'), { once: true });
}

// Setzt das Feld "Nächste Zahlung" (über den Kalender, falls vorhanden).
function setzeZahlungsdatum(iso, datumsauswahl) {
    const feld = (id) => document.getElementById(id);
    if (datumsauswahl && datumsauswahl.setzeDatum) {
        datumsauswahl.setzeDatum(iso);
    } else {
        feld('input-datum-iso').value = iso;
        feld('input-datum').value = formatiereDatum(iso);
    }
}

// Trägt die Vorschläge in leere Felder ein.
// Rückgabe: { anzahl, datum } – datum ist gesetzt, wenn ein vergangenes Datum
// (z. B. Rechnungsdatum) auf die nächste Zahlung vorgerückt wurde.
export function uebernehmeVorschlaege(vorschlag, { datumsauswahl } = {}) {
    let anzahl = 0;
    let vorgerueckt = null;
    const feld = (id) => document.getElementById(id);
    const setzeText = (id, wert) => {
        const el = feld(id);
        if (!el || wert === undefined || wert === '' || el.value.trim() !== '') return false;
        el.value = wert;
        markiere(el);
        anzahl++;
        return true;
    };

    setzeText('input-name', vorschlag.name);
    const kostenGesetzt = vorschlag.kosten !== undefined && setzeText('input-kosten', formatiereZahlDE(vorschlag.kosten));
    // Währung: vorbelegt ist nur die Landeswährung des Geräts. Sie wird
    // ersetzt, wenn der Betrag aus dem Foto stammt und eine Währung dabeistand.
    if (kostenGesetzt && vorschlag.waehrung) {
        const el = feld('input-waehrung');
        if (el.value !== vorschlag.waehrung) {
            el.value = vorschlag.waehrung;
            markiere(el);
        }
    }
    if (vorschlag.turnus) {
        const el = feld('input-turnus');
        el.value = vorschlag.turnus;
        markiere(el);
        anzahl++;
    }
    // Datum: liegt es in der Vergangenheit (z. B. Rechnungsdatum), wird anhand des
    // Turnus die NÄCHSTE Zahlung vorgeschlagen. Der Nutzer kann es vor dem Speichern ändern.
    const datumVorschlag = vorschlagNaechsteZahlung(vorschlag, feld('input-turnus').value);
    if (datumVorschlag && !feld('input-datum-iso').value) {
        setzeZahlungsdatum(datumVorschlag.datum, datumsauswahl);
        const datumFeld = feld('input-datum');
        markiere(datumFeld);
        // Ändert der Nutzer danach den Turnus, wird neu vorgerückt – solange er das Datum nicht selbst geändert hat.
        datumFeld.dataset.fotoOriginal = datumVorschlag.vorgerueckt ? datumVorschlag.original : '';
        datumFeld.dataset.fotoGesetzt = datumVorschlag.datum;
        anzahl++;
        if (datumVorschlag.vorgerueckt) vorgerueckt = datumVorschlag;
    }
    const weitere = [
        setzeText('input-vertragsnummer', vorschlag.vertragsnummer),
        setzeText('input-kundennummer', vorschlag.kundennummer),
        setzeText('input-vertragspartner', vorschlag.vertragspartner)
    ];
    if (weitere.some(Boolean)) feld('weitere-angaben').open = true;
    return { anzahl, datum: vorgerueckt };
}

function zeigeStatus(text, art = '') {
    const el = document.getElementById('foto-status');
    el.textContent = text;
    el.className = `foto-status ${art}`.trim();
    el.hidden = !text;
}

async function verarbeiteDatei(datei, optionen) {
    if (!datei) return;
    const knoepfe = document.querySelectorAll('#foto-bereich button');
    knoepfe.forEach((k) => { k.disabled = true; });
    zeigeStatus(t('foto.laeuft'), 'laeuft');
    try {
        let bild = await bildAlsJpegBase64(datei);
        let zeilen;
        try {
            zeilen = await window.api.erkenneText(bild, erkennungsSprachen());
        } finally {
            bild = null; // Bilddaten sofort verwerfen
        }
        const { anzahl, datum } = uebernehmeVorschlaege(werteTextAus(zeilen, { monatZuerst: monatZuerst() }), optionen);
        let meldung = anzahl > 0 ? tAnzahl('foto.erkannt', anzahl) : t('foto.nichts');
        if (datum) meldung += ` ${t('foto.datumVorgerueckt', { original: formatiereDatum(datum.original), datum: formatiereDatum(datum.datum) })}`;
        zeigeStatus(meldung, anzahl > 0 ? 'erfolg' : '');
    } catch (error) {
        zeigeStatus(error && error.code === 'NICHT_VERFUEGBAR' ? t('foto.nurApp') : t('foto.fehler'), 'fehler');
    } finally {
        knoepfe.forEach((k) => { k.disabled = false; });
        // Zwischendateien der Kamera entfernen (auch nach Fehlern).
        window.api.raeumeFotoAuf().catch(() => {});
    }
}

export function initFotoEinlesen(optionen = {}) {
    // Vom Foto vorgerücktes Datum folgt einem späteren Turnus-Wechsel, solange der
    // Nutzer das Datum nicht selbst geändert hat.
    const turnusFeld = document.getElementById('input-turnus');
    turnusFeld.addEventListener('change', () => {
        const datumFeld = document.getElementById('input-datum');
        const iso = document.getElementById('input-datum-iso');
        const original = datumFeld.dataset.fotoOriginal;
        if (!original || iso.value !== datumFeld.dataset.fotoGesetzt) return;
        const neu = naechsteZahlungAb(original, turnusFeld.value);
        if (!neu) return;
        setzeZahlungsdatum(neu, optionen.datumsauswahl);
        datumFeld.dataset.fotoGesetzt = neu;
    });
    // Nach dem Speichern/Schließen (Formular-Reset) nichts vom letzten Foto behalten.
    const formular = document.getElementById('abo-form');
    if (formular) {
        formular.addEventListener('reset', () => {
            const datumFeld = document.getElementById('input-datum');
            delete datumFeld.dataset.fotoOriginal;
            delete datumFeld.dataset.fotoGesetzt;
        });
    }

    const aufnehmen = document.getElementById('input-foto-kamera');
    const auswaehlen = document.getElementById('input-foto-datei');
    const auswahl = document.getElementById('foto-auswahl');

    document.getElementById('btn-foto-einlesen').addEventListener('click', () => {
        auswahl.hidden = !auswahl.hidden;
    });
    // Kamera bzw. Bildauswahl öffnen sich ausschließlich durch diese Knöpfe.
    document.getElementById('btn-foto-aufnehmen').addEventListener('click', () => aufnehmen.click());
    document.getElementById('btn-foto-auswaehlen').addEventListener('click', () => auswaehlen.click());

    for (const input of [aufnehmen, auswaehlen]) {
        input.addEventListener('change', async () => {
            const datei = input.files && input.files[0];
            input.value = ''; // Datei-Verweis sofort lösen
            auswahl.hidden = true;
            await verarbeiteDatei(datei, optionen);
        });
    }

    document.getElementById('abo-form').addEventListener('reset', () => {
        auswahl.hidden = true;
        zeigeStatus('');
        document.querySelectorAll('#abo-form .vom-foto').forEach((el) => el.classList.remove('vom-foto'));
    });
}
