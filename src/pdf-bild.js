/**
 * pdf-bild.js | Wie PdfDokument (pdf.js), zeichnet die Seiten aber mit den
 * Schriften des Geräts auf eine Leinwand und setzt sie als Bild in die PDF.
 * Wird nur genommen, wenn ein Text Zeichen enthält, die die eingebaute
 * PDF-Schrift nicht kennt (Ł, ş, Kyrillisch, Japanisch, Emoji …): Auf dem Papier
 * darf nie "?" statt eines Namens stehen. Nachteil: Text nicht markierbar.
 *
 * Die Befehle werden je Seite gesammelt und erst in erzeuge() gezeichnet, damit
 * nur eine Leinwand im Speicher liegt. leinwand = Funktion, die ein Canvas liefert.
 */

import { PdfDokument } from './pdf.js';

const FAKTOR = 2.5; // 180 dpi
const SCHRIFTEN = 'Arial, Helvetica, sans-serif';

const css = ([r, g, b]) => `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
const einzeilig = (text) => String(text).replace(/[\r\n\t]+/g, ' ');

export class BildDokument {
    constructor({ breite = 842, hoehe = 595, titel = '', leinwand = () => document.createElement('canvas') } = {}) {
        this.breite = breite;
        this.hoehe = hoehe;
        this.titel = titel;
        this.seiten = [];
        this.leinwand = leinwand();
        this.leinwand.width = Math.round(breite * FAKTOR);
        this.leinwand.height = Math.round(hoehe * FAKTOR);
        this.ctx = this.leinwand.getContext('2d');
    }

    neueSeite() {
        this.seiten.push([]);
        return this.seiten.length;
    }

    aktuelleSeite() {
        if (this.seiten.length === 0) this.neueSeite();
        return this.seiten[this.seiten.length - 1];
    }

    setzeSchrift(groesse, fett) {
        this.ctx.font = `${fett ? 'bold ' : ''}${groesse * FAKTOR}px ${SCHRIFTEN}`;
    }

    textBreite(text, groesse, fett = false) {
        this.setzeSchrift(groesse, fett);
        return this.ctx.measureText(einzeilig(text)).width / FAKTOR;
    }

    text(x, y, text, { groesse = 10, fett = false, farbe = [0, 0, 0], ausrichtung = 'links', seite } = {}) {
        const inhalt = einzeilig(text);
        (seite ? this.seiten[seite - 1] : this.aktuelleSeite()).push((ctx) => {
            this.setzeSchrift(groesse, fett);
            ctx.fillStyle = css(farbe);
            const start = ausrichtung === 'rechts' ? x - this.textBreite(inhalt, groesse, fett) : x;
            ctx.fillText(inhalt, start * FAKTOR, y * FAKTOR);
        });
    }

    linie(x1, y1, x2, y2, { staerke = 0.5, farbe = [0.8, 0.8, 0.8] } = {}) {
        this.aktuelleSeite().push((ctx) => {
            ctx.strokeStyle = css(farbe);
            ctx.lineWidth = staerke * FAKTOR;
            ctx.beginPath();
            ctx.moveTo(x1 * FAKTOR, y1 * FAKTOR);
            ctx.lineTo(x2 * FAKTOR, y2 * FAKTOR);
            ctx.stroke();
        });
    }

    rechteck(x, y, w, h, { fuellfarbe = [0.95, 0.95, 0.95] } = {}) {
        this.aktuelleSeite().push((ctx) => {
            ctx.fillStyle = css(fuellfarbe);
            ctx.fillRect(x * FAKTOR, y * FAKTOR, w * FAKTOR, h * FAKTOR);
        });
    }

    erzeuge() {
        const pdf = new PdfDokument({ breite: this.breite, hoehe: this.hoehe, titel: this.titel });
        if (this.seiten.length === 0) this.neueSeite();
        for (const befehle of this.seiten) {
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, this.leinwand.width, this.leinwand.height);
            befehle.forEach((zeichne) => zeichne(this.ctx));
            pdf.neueSeite();
            pdf.bild(atob(this.leinwand.toDataURL('image/jpeg', 0.9).split(',')[1]), 0, 0, this.breite, this.hoehe, this.leinwand.width, this.leinwand.height);
        }
        this.leinwand.width = 0;
        this.leinwand.height = 0;
        return pdf.erzeuge();
    }
}

// Kürzen, Umbrechen und Schriftgröße rechnen nur mit textBreite: dieselben Funktionen.
for (const name of ['kuerze', 'umbruch', 'passendeGroesse']) BildDokument.prototype[name] = PdfDokument.prototype[name];
