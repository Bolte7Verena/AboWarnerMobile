/**
 * texterkennung-auswertung.js | Wertet den Text aus, den die Texterkennung
 * auf dem Gerät (iOS: Apple Vision, Android: Tesseract) aus einem Foto
 * gelesen hat, und schlägt daraus Werte für "Neues Abo" vor.
 *
 * Reine Funktion ohne DOM/Capacitor (per Unit-Test prüfbar), läuft
 * vollständig auf dem Gerät. Grundsatz: lieber nichts vorschlagen als etwas
 * Falsches. Ein Wert wird nur gesetzt, wenn er eindeutig ist (z.B. steht
 * hinter einer klaren Beschriftung wie "Kundennummer"). Alles andere bleibt
 * leer. Der Nutzer prüft die Vorschläge und speichert selbst.
 *
 * Unterstützte Sprachen der Beschriftungen: Deutsch, Englisch, Spanisch,
 * Französisch, Portugiesisch.
 */

import { naechsteZahlungAb } from './calculator.js';
import { findeAnbieter, findeKategorie } from './texterkennung-anbieter.js';
import { KURSE_JE_EURO, normalisiereWaehrung } from './waehrungen.js';

/**
 * Datum für "Nächste Zahlung" aus den Foto-Vorschlägen. Bevorzugt die genannte
 * nächste Zahlung, sonst das Rechnungs-/Zahlungsdatum. Liegt das Datum in der
 * Vergangenheit, wird es anhand des Turnus auf die nächste Zahlung vorgerückt.
 * Rückgabe: { datum, original, vorgerueckt } oder null.
 */
export function vorschlagNaechsteZahlung(vorschlag, turnus, heute = new Date()) {
    const original = (vorschlag && (vorschlag.naechsteZahlung || vorschlag.letzteZahlung)) || '';
    if (!original) return null;
    const datum = naechsteZahlungAb(original, turnus, heute);
    if (!datum) return null;
    return { datum, original, vorgerueckt: datum !== original };
}

// Ganzes Wort (Buchstaben vorher/nachher nicht erlaubt), Unicode-fähig.
const wort = (muster) => `(?<![\\p{L}\\p{N}])(?:${muster})(?![\\p{L}])`;
const regex = (muster, flags = 'iu') => new RegExp(muster, flags);

// --- Beschriftungen für Kunden- und Vertragsnummer ---

const LABEL_KUNDE = regex(wort([
    'kunden\\s?-?\\s?(?:nummer|nr\\.?|number|kennung|id)', 'kd\\.?\\s?-?\\s?nr\\.?',
    'customer\\s+(?:number|no\\.?|id|ref(?:erence)?)', 'customer\\s?#', 'account\\s+(?:number|no\\.?|id)',
    'n(?:ú|u)mero\\s+de\\s+cliente', 'n\\.?\\s?[ºo°]\\s?(?:de\\s+)?cliente', 'c(?:ó|o)digo\\s+de\\s+cliente', 'id\\s+de\\s+cliente',
    'num(?:é|e)ro\\s+(?:de\\s+)?client', 'n\\s?[°o]\\s?(?:de\\s+)?client', 'r(?:é|e)f(?:é|e)rence\\s+client', 'identifiant\\s+client',
    'n(?:ú|u)mero\\s+do\\s+cliente', 'c(?:ó|o)digo\\s+do\\s+cliente'
].join('|')));

const LABEL_VERTRAG = regex(wort([
    'vertrags\\s?-?\\s?(?:nummer|nr\\.?|konto(?:nummer)?)', 'versicherungs(?:schein)?\\s?-?\\s?(?:nummer|nr\\.?)', 'police(?:n)?\\s?-?\\s?(?:nummer|nr\\.?)',
    'mitglieds\\s?-?\\s?(?:nummer|nr\\.?)', 'abo\\s?-?\\s?(?:nummer|nr\\.?)',
    'contract\\s+(?:number|no\\.?|id)', 'agreement\\s+(?:number|no\\.?)', 'policy\\s+(?:number|no\\.?)', 'membership\\s+(?:number|no\\.?|id)', 'subscription\\s+(?:number|no\\.?|id)',
    'n(?:ú|u)mero\\s+de\\s+(?:contrato|p(?:ó|o)liza|socio|suscripci(?:ó|o)n)', 'n\\.?\\s?[ºo°]\\s?(?:de\\s+)?(?:contrato|p(?:ó|o)liza|socio)',
    'num(?:é|e)ro\\s+(?:de\\s+)?(?:contrat|police|adh(?:é|e)rent|abonnement)', 'n\\s?[°o]\\s?(?:de\\s+)?(?:contrat|police|adh(?:é|e)rent)',
    'n(?:ú|u)mero\\s+(?:do\\s+contrato|da\\s+ap(?:ó|o)lice|de\\s+s(?:ó|o)cio|da\\s+assinatura)'
].join('|')));

// Alle bekannten Beschriftungen (zum Abschneiden, wenn zwei auf einer Zeile stehen).
const IRGENDEIN_LABEL = regex(`${LABEL_KUNDE.source}|${LABEL_VERTRAG.source}|${wort('rechnungs\\s?-?\\s?(?:nummer|nr\\.?|datum)|invoice\\s+(?:number|no\\.?|date)|datum|date|fecha|data|iban|bic|tel(?:efon|éfono|efone|\\.)?|phone')}`);

// Wert hinter einer Beschriftung: Buchstaben/Ziffern mit - / . und
// Leerzeichen zwischen Zifferngruppen. Muss mindestens eine Ziffer enthalten.
function nummerAus(text) {
    let rest = text.replace(/^[\s:.#\-–—=]+/u, '').replace(/^(?:is|ist|es|est|é)\s+/iu, '').replace(/^[\s:.#\-–—=]+/u, '');
    const naechstesLabel = rest.search(IRGENDEIN_LABEL);
    if (naechstesLabel > 0) rest = rest.slice(0, naechstesLabel);
    rest = rest.split(/\s{3,}|\t|\|/u)[0];
    const treffer = /^([A-Z0-9][A-Z0-9\-/.]*(?:\s\d[A-Z0-9\-/.]*)*)/iu.exec(rest.trim());
    if (!treffer) return '';
    const wert = treffer[1].replace(/[.\-/]+$/u, '').trim();
    if (!/\d/u.test(wert) || wert.length < 3 || wert.length > 30) return '';
    if (/^\d{1,2}[./-]\d{1,2}[./-]\d{2,4}$/u.test(wert)) return ''; // ein Datum, keine Nummer
    return wert;
}

function findeNummer(zeilen, label) {
    const gefunden = new Set();
    zeilen.forEach((zeile, i) => {
        const m = label.exec(zeile);
        if (!m) return;
        let wert = nummerAus(zeile.slice(m.index + m[0].length));
        // Beschriftung allein auf der Zeile: Wert steht in der nächsten Zeile.
        if (!wert && i + 1 < zeilen.length && !IRGENDEIN_LABEL.test(zeilen[i + 1])) wert = nummerAus(zeilen[i + 1]);
        if (wert) gefunden.add(wert);
    });
    // Nur eindeutige Ergebnisse vorschlagen.
    return gefunden.size === 1 ? [...gefunden][0] : '';
}

// --- Beträge und Währung ---

// Symbole und ISO-Codes. Längere zuerst ("R$" vor "$"). Ein einfaches "$" wird
// je Land gedeutet (optionen.dollar: USA USD, Mexiko MXN ...), siehe werteTextAus.
const WAEHRUNG = `(R\\$|US\\$|CA\\$|AU\\$|NZ\\$|MX\\$|HK\\$|NT\\$|€|\\$|£|₹|₩|₺|${Object.keys(KURSE_JE_EURO).join('|')})`;
const ZAHL = '(\\d{1,3}(?:[.,\\s ]\\d{3})+(?:[.,]\\d{2})?|\\d+[.,]\\d{2}|\\d+)';
const BETRAG_VOR = regex(`${WAEHRUNG}\\s?${ZAHL}(?![\\d])`, 'gu');
const BETRAG_NACH = regex(`(?<![\\d.,])${ZAHL}\\s?${WAEHRUNG}(?![\\p{L}])`, 'gu');
const BETRAG_OHNE = regex(`(?<![\\d.,])(\\d{1,3}(?:[.\\s ]\\d{3})*,\\d{2}|\\d{1,3}(?:,\\d{3})*\\.\\d{2})(?![\\d%])`, 'gu');

const STICHWORT_SUMME = regex(wort('gesamt(?:betrag|summe)?|summe|endbetrag|rechnungsbetrag|zu\\s+zahlen|zahlbetrag|total(?:\\s+a\\s+pagar|\\s+(?:due|amount))?|amount\\s+due|grand\\s+total|à\\s+payer|montant\\s+total|net\\s+à\\s+payer|valor\\s+total|total\\s+a\\s+pagar|importe\\s+total'));
const STICHWORT_PREIS = regex(wort('betrag|beitrag|monatsbeitrag|jahresbeitrag|preis|kosten|price|amount|fee|importe|precio|cuota|mensualidad|montant|prix|tarif|cotisation|valor|pre(?:ç|c)o|mensalidade|assinatura|abonnement|abo'));

export function parseZahl(text) {
    let s = String(text).replace(/[\s ]/gu, '');
    const punkt = s.lastIndexOf('.');
    const komma = s.lastIndexOf(',');
    if (punkt >= 0 && komma >= 0) {
        const dezimal = punkt > komma ? '.' : ',';
        s = s.split(dezimal === '.' ? ',' : '.').join('').replace(dezimal, '.');
    } else if (komma >= 0 || punkt >= 0) {
        const zeichen = komma >= 0 ? ',' : '.';
        const nachkomma = s.length - s.lastIndexOf(zeichen) - 1;
        const anzahl = s.split(zeichen).length - 1;
        s = nachkomma === 2 && anzahl === 1 ? s.replace(zeichen, '.') : s.split(zeichen).join('');
    }
    const wert = Number(s);
    return Number.isFinite(wert) ? wert : NaN;
}

function betraegeInZeile(zeile, dollar) {
    const liste = [];
    const code = (zeichen) => (zeichen === '$' ? dollar : normalisiereWaehrung(zeichen));
    const ganz = (zahl) => !/[.,]\d{2}$/u.test(zahl.trim());
    for (const m of zeile.matchAll(BETRAG_VOR)) liste.push({ wert: parseZahl(m[2]), waehrung: code(m[1]), ganz: ganz(m[2]) });
    for (const m of zeile.matchAll(BETRAG_NACH)) liste.push({ wert: parseZahl(m[1]), waehrung: code(m[2]), ganz: ganz(m[1]) });
    return liste.filter((b) => Number.isFinite(b.wert) && b.wert > 0 && b.wert < 100000);
}

const NETTO = regex(wort('netto\\p{L}*|net(?:\\s+amount)?|subtotal|zwischensumme|base\\s+imponible|montant\\s+ht|total\\s+ht|valor\\s+l(?:í|i)quido'));
const STEUER = regex(wort('umsatzsteuer|mehrwertsteuer|mwst\\.?|ust\\.?|vat|sales\\s+tax|tax|iva|tva'));

function findeBetrag(zeilen, dollar) {
    let kandidaten = [];
    zeilen.forEach((zeile) => {
        const summe = STICHWORT_SUMME.test(zeile);
        const preis = STICHWORT_PREIS.test(zeile);
        let betraege = betraegeInZeile(zeile, dollar);
        // Ohne Währungszeichen nur auf beschrifteten Zeilen und nur mit Nachkommastellen.
        if (betraege.length === 0 && (summe || preis)) {
            betraege = [...zeile.matchAll(BETRAG_OHNE)].map((m) => ({ wert: parseZahl(m[1]), waehrung: '' })).filter((b) => b.wert > 0 && b.wert < 100000);
        }
        betraege.forEach((b) => kandidaten.push({ ...b, summe: summe && !NETTO.test(zeile), preis, netto: NETTO.test(zeile), steuer: STEUER.test(zeile) && !NETTO.test(zeile) }));
    });
    // Die Texterkennung verliert gern das Komma ("29,99 €" -> "299€"). Haben die anderen
    // Beträge Nachkommastellen, ist eine ganze Zahl verdächtig: nicht vorschlagen.
    // Stehen Nettobetrag und Steuer da, ergibt sich die Summe daraus.
    const genau = kandidaten.filter((b) => !b.ganz);
    if (genau.length > 0 && kandidaten.some((b) => b.ganz && (b.summe || b.preis))) {
        const einzig = (liste) => (new Set(liste.map((b) => b.wert)).size === 1 ? liste[0] : null);
        const netto = einzig(genau.filter((b) => b.netto));
        const steuer = einzig(genau.filter((b) => b.steuer));
        const andere = genau.filter((b) => b.summe);
        if (andere.length === 0) {
            if (!netto || !steuer || steuer.wert >= netto.wert) return null;
            return { wert: Math.round((netto.wert + steuer.wert) * 100) / 100, waehrung: netto.waehrung };
        }
        kandidaten = genau;
    }
    const eindeutig = (liste) => {
        const werte = new Set(liste.map((b) => b.wert));
        return werte.size === 1 ? liste[0] : null;
    };
    const summen = kandidaten.filter((b) => b.summe);
    if (summen.length > 0) {
        // Mehrere Summenzeilen (z.B. netto/brutto): der höchste Betrag ist die Gesamtsumme.
        return summen.reduce((a, b) => (b.wert > a.wert ? b : a));
    }
    const preise = kandidaten.filter((b) => b.preis);
    if (preise.length > 0) return eindeutig(preise);
    return eindeutig(kandidaten.filter((b) => b.waehrung));
}

// --- Turnus ---

const TURNUS_MUSTER = [
    ['Vierteljährlich', wort('viertelj(?:ä|a)hrlich|quartalsweise|pro\\s+quartal|je\\s+quartal|quarterly|per\\s+quarter|every\\s+3\\s+months|trimestral(?:mente)?|trimestriel(?:le)?|par\\s+trimestre|por\\s+trimestre')],
    ['Halbjährlich', wort('halbj(?:ä|a)hrlich|semi-?annual(?:ly)?|half-?yearly|every\\s+6\\s+months|semestral(?:mente)?|semestriel(?:le)?|par\\s+semestre|por\\s+semestre')],
    ['Jährlich', wort('j(?:ä|a)hrlich|pro\\s+jahr|je\\s+jahr|im\\s+jahr|/\\s?jahr|jahresbeitrag|jahrespreis|jahresabo|annual(?:ly)?|yearly|per\\s+year|a\\s+year|/\\s?year|/\\s?yr|anual(?:mente)?|al\\s+a(?:ñ|n)o|por\\s+a(?:ñ|n)o|/\\s?a(?:ñ|n)o|annuel(?:le)?|par\\s+an|/\\s?an|por\\s+ano|/\\s?ano')],
    ['Monatlich', wort('monatlich|pro\\s+monat|je\\s+monat|im\\s+monat|/\\s?monat|/\\s?mon\\.?|mtl\\.?|monatsbeitrag|monatspreis|monatsabo|monthly|per\\s+month|a\\s+month|/\\s?month|/\\s?mo|mensual(?:mente)?|al\\s+mes|por\\s+mes|/\\s?mes|mensuel(?:le)?|par\\s+mois|/\\s?mois|mensal(?:mente)?|por\\s+m(?:ê|e)s|/\\s?m(?:ê|e)s')]
];

function findeTurnus(text) {
    const gefunden = TURNUS_MUSTER.filter(([, muster]) => regex(muster).test(text)).map(([turnus]) => turnus);
    return gefunden.length === 1 ? gefunden[0] : '';
}

// Abrechnungszeitraum "01.11.2026 - 30.11.2026" -> Monatlich usw. Nur wenn alle
// Zeiträume im Text dasselbe ergeben.
function findeTurnusAusZeitraum(zeilen, optionen) {
    const gefunden = new Set();
    const re = /(\d{1,4}[./-]\d{1,2}[./-]\d{2,4})\s*(?:-|–|—|bis|to|until|al|au|a|até|hasta)\s*(\d{1,4}[./-]\d{1,2}[./-]\d{2,4})/giu;
    for (const zeile of zeilen) for (const m of zeile.matchAll(re)) {
        const a = findeDatum(m[1], optionen);
        const b = findeDatum(m[2], optionen);
        if (!a || !b) continue;
        const tage = Math.round((b - a) / 86400000) + 1;
        const turnus = tage >= 28 && tage <= 32 ? 'Monatlich' : tage >= 89 && tage <= 93 ? 'Vierteljährlich' : tage >= 181 && tage <= 185 ? 'Halbjährlich' : tage >= 365 && tage <= 367 ? 'Jährlich' : '?';
        gefunden.add(turnus);
    }
    const [turnus] = gefunden;
    return gefunden.size === 1 && turnus !== '?' ? turnus : '';
}

// --- Datum der nächsten Zahlung ---

const MONATE = {
    1: 'januar|jan|jänner|january|enero|ene|janvier|janv|janeiro',
    2: 'februar|feb|febr|february|febrero|février|fevrier|févr|fevereiro|fev',
    3: 'märz|maerz|mär|mar|march|marzo|mars|março|marco',
    4: 'april|apr|abril|abr|avril|avr',
    5: 'mai|may|mayo|maio',
    6: 'juni|jun|june|junio|juin|junho',
    7: 'juli|jul|july|julio|juillet|juil|julho',
    8: 'august|aug|agosto|ago|août|aout',
    9: 'september|sep|sept|septiembre|setiembre|septembre|setembro|set',
    10: 'oktober|okt|october|oct|octubre|octobre|outubro|out',
    11: 'november|nov|noviembre|novembre|novembro',
    12: 'dezember|dez|december|dec|diciembre|dic|décembre|decembre|déc|dezembro'
};
const MONATSNAME = Object.values(MONATE).join('|');
function monatAusName(name) {
    const n = name.toLowerCase().replace(/\.$/u, '');
    for (const [nr, namen] of Object.entries(MONATE)) if (namen.split('|').includes(n)) return Number(nr);
    return 0;
}

const DATUM_ISO = /(?<!\d)(\d{4})-(\d{2})-(\d{2})(?!\d)/u;
const DATUM_ZAHLEN = /(?<!\d)(\d{1,2})([./-])(\d{1,2})\2(\d{4}|\d{2})(?!\d)/u;
const DATUM_TAG_MONAT = regex(`(?<!\\d)(\\d{1,2})\\.?\\s*(?:de\\s+)?(${MONATSNAME})\\.?\\s*(?:de\\s+)?(\\d{4})(?!\\d)`);
const DATUM_MONAT_TAG = regex(`(?<![\\p{L}])(${MONATSNAME})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})(?!\\d)`);

function gueltig(jahr, monat, tag) {
    const d = new Date(jahr, monat - 1, tag);
    return d.getFullYear() === jahr && d.getMonth() === monat - 1 && d.getDate() === tag ? d : null;
}

// Liefert das erste Datum in einem Text (als Date) oder null.
export function findeDatum(text, { monatZuerst = false } = {}) {
    let m = DATUM_ISO.exec(text);
    if (m) return gueltig(Number(m[1]), Number(m[2]), Number(m[3]));
    m = DATUM_ZAHLEN.exec(text);
    if (m) {
        let a = Number(m[1]);
        let b = Number(m[3]);
        let jahr = Number(m[4]);
        if (jahr < 100) jahr += 2000;
        // Schrägstrich-Daten: Reihenfolge je nach Region (USA: Monat zuerst).
        // Ist ein Teil größer als 12, ist die Reihenfolge eindeutig.
        let tag = a;
        let monat = b;
        if (m[2] === '/' && ((monatZuerst && a <= 12) || b > 12)) { tag = b; monat = a; }
        if (a > 12 && b <= 12) { tag = a; monat = b; }
        return gueltig(jahr, monat, tag);
    }
    m = DATUM_TAG_MONAT.exec(text);
    if (m) return gueltig(Number(m[3]), monatAusName(m[2]), Number(m[1]));
    m = DATUM_MONAT_TAG.exec(text);
    if (m) return gueltig(Number(m[3]), monatAusName(m[1]), Number(m[2]));
    return null;
}

const STICHWORT_NAECHSTE = regex(wort([
    'n(?:ä|a)chste\\s+(?:zahlung|abbuchung|abrechnung|belastung|f(?:ä|a)lligkeit|rate|lastschrift)', 'f(?:ä|a)llig\\s+(?:am|zum|ab)', 'f(?:ä|a)lligkeit(?:sdatum)?', 'zahlbar\\s+(?:bis|am)',
    'abbuchung\\s+(?:am|ab)', 'wird\\s+am', 'verl(?:ä|a)ngert\\s+sich\\s+am', 'verl(?:ä|a)ngerung\\s+am', 'abgebucht\\s+am',
    'next\\s+(?:payment|billing(?:\\s+date)?|charge|renewal|invoice)', 'renews\\s+on', 'renewal\\s+date', 'due\\s+(?:date|on)', 'billing\\s+date', 'payment\\s+date', 'will\\s+be\\s+charged\\s+on', 'charged\\s+on',
    'pr(?:ó|o)ximo\\s+(?:pago|cobro|cargo|recibo)', 'fecha\\s+de\\s+(?:vencimiento|cobro|renovaci(?:ó|o)n|cargo)', 'se\\s+renueva\\s+el', 'vencimiento', 'se\\s+cobrar(?:á|a)\\s+el',
    'prochain\\s+(?:paiement|pr(?:é|e)l(?:è|e)vement|renouvellement)', 'date\\s+d[\'’]\\s?(?:é|e)ch(?:é|e)ance', '(?:é|e)ch(?:é|e)ance', 'renouvel(?:é|e)\\s+le', 'pr(?:é|e)lev(?:é|e)\\s+le', 'renouvellement\\s+le',
    'pr(?:ó|o)ximo\\s+(?:pagamento|d(?:é|e)bito|vencimento)', 'vencimento', 'renova(?:r(?:á|a))?\\s+em', 'data\\s+de\\s+(?:cobran(?:ç|c)a|vencimento|renova(?:ç|c)(?:ã|a)o)', 'ser(?:á|a)\\s+cobrado\\s+em'
].join('|')));

// Datum einer bereits erfolgten Zahlung (Rechnung, Beleg, Kauf). Wird nur genutzt,
// wenn keine "nächste Zahlung" im Text steht; das Formular rückt es dann
// turnusgerecht auf die nächste Zahlung vor (calculator.js naechsteZahlungAb).
const STICHWORT_LETZTE = regex(wort([
    'rechnungsdatum', 'rechnung\\s+vom', 'datum\\s+der\\s+rechnung', 'belegdatum', 'kaufdatum', 'bestelldatum', '(?:bezahlt|gezahlt|belastet|gebucht)\\s+am',
    'invoice\\s+date', 'date\\s+of\\s+invoice', 'invoice\\s+issued(?:\\s+on)?', 'receipt\\s+date', 'purchase\\s+date', 'order\\s+date', 'paid\\s+on', 'date\\s+paid',
    'fecha\\s+de\\s+(?:la\\s+)?(?:factura|emisi(?:ó|o)n|compra|pedido)', 'pagado\\s+el', 'factura\\s+del',
    'date\\s+de\\s+(?:la\\s+)?(?:facture|commande)', 'date\\s+d[\'’]\\s?(?:achat|(?:é|e)mission)', 'factur(?:é|e)e?\\s+le', 'pay(?:é|e)e?\\s+le', 'facture\\s+du',
    'data\\s+d[ae]\\s+(?:fatura|emiss(?:ã|a)o|compra|pedido)', 'pago\\s+em', 'fatura\\s+de'
].join('|')));

// "Datum: 10.11.2026" direkt vor einem Datum, nur auf Rechnungen.
const RECHNUNG = regex(wort('rechnung\\p{L}*|invoice|factura|facture|fatura'));
const STICHWORT_DATUM = regex(`${wort('datum|date|fecha|data')}\\s*[:.]?\\s*(?=\\d|le\\s)`);

function findeDatumNachStichwort(zeilen, stichwort, optionen) {
    for (let i = 0; i < zeilen.length; i++) {
        const m = stichwort.exec(zeilen[i]);
        if (!m) continue;
        const datum = findeDatum(zeilen[i].slice(m.index), optionen) || (i + 1 < zeilen.length ? findeDatum(zeilen[i + 1], optionen) : null);
        if (datum) return datum;
    }
    return null;
}

function findeNaechsteZahlung(zeilen, optionen) {
    return findeDatumNachStichwort(zeilen, STICHWORT_NAECHSTE, optionen);
}

// --- Anbieter: Name und Anschrift ---

// Bekannte Marken: steht eine davon im Text, ist das ein sicherer Name.
// Zahlungsdienste (PayPal, Visa, ...) bewusst nicht, die stehen oft nur als Zahlart da.
const MARKEN = [
    'Netflix', 'Spotify', 'Disney+', 'Amazon Prime', 'Prime Video', 'Apple Music', 'Apple TV+', 'iCloud+', 'YouTube Premium', 'YouTube Music',
    'DAZN', 'Sky', 'WOW', 'RTL+', 'Joyn', 'Paramount+', 'Max', 'Crunchyroll', 'Audible', 'Deezer', 'Tidal', 'Kindle Unlimited',
    'Microsoft 365', 'Office 365', 'Adobe', 'Dropbox', 'Google One', 'ChatGPT Plus', 'Xbox Game Pass', 'PlayStation Plus', 'Nintendo Switch Online',
    'Telekom', 'Vodafone', 'O2', '1&1', 'congstar', 'Movistar', 'Orange', 'SFR', 'Bouygues', 'Free', 'MEO', 'NOS', 'Claro', 'Vivo', 'TIM',
    'McFit', 'FitX', 'Clever Fit', 'Urban Sports Club', 'Basic-Fit', 'Gymshark',
    'HelloFresh', 'Blinkist', 'Duolingo', 'Babbel', 'Headspace', 'Calm', 'Zeit Online', 'Spiegel+', 'BILDplus', 'Le Monde', 'El País', 'Folha'
];
// Auch normale Wörter oder Vornamen ("Max Mustermann"): nur, wenn die Zeile nur
// aus der Marke besteht oder die Firma so heißt.
const MEHRDEUTIG = ['Max', 'Free', 'Orange', 'Vivo', 'TIM', 'Sky', 'WOW', 'Calm', 'NOS', 'MEO', 'Claro', 'Tidal', 'Folha'];
function findeMarke(text, firma) {
    const gefunden = MARKEN.filter((marke) => {
        const muster = marke.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
        if (MEHRDEUTIG.includes(marke)) return new RegExp(`^${muster}[®™]?$`, 'mu').test(text) || new RegExp(`^${muster}(?![\\p{L}\\p{N}])`, 'u').test(firma);
        return new RegExp(`(?<![\\p{L}\\p{N}])${muster}(?![\\p{L}\\p{N}])`, 'u').test(text);
    });
    // Mehrere Marken ("Telekom … inklusive Netflix"): die des Anbieters zählt.
    return gefunden.find((marke) => firma.toLowerCase().includes(marke.toLowerCase())) || gefunden[0] || '';
}

function zuISO(datum) {
    return `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, '0')}-${String(datum.getDate()).padStart(2, '0')}`;
}

/**
 * zeilen: erkannter Text, eine Zeile je Eintrag (Reihenfolge wie auf dem Bild).
 * optionen.monatZuerst: true, wenn die Geräte-Region Daten als MM/TT schreibt (USA).
 * optionen.dollar: Bedeutung eines einfachen "$" (Standard USD, in Mexiko MXN ...).
 * Rückgabe: nur die sicher erkannten Felder, z.B.
 *   { name, kosten, waehrung, turnus, kategorie, naechsteZahlung (ISO), kundennummer, vertragsnummer, vertragspartner }
 */
export function werteTextAus(zeilen, optionen = {}) {
    const saubere = (Array.isArray(zeilen) ? zeilen : String(zeilen || '').split('\n'))
        .map((z) => String(z).replace(/[​-‏﻿]/gu, '').replace(/[ \t]+/gu, ' ').trim())
        .filter(Boolean);
    const text = saubere.join('\n');
    const ergebnis = {};

    const anbieter = findeAnbieter(saubere);
    const marke = findeMarke(text, anbieter.name);
    const name = marke || anbieter.name;
    if (name) ergebnis.name = name;
    if (anbieter.anschrift) ergebnis.vertragspartner = anbieter.anschrift;

    const betrag = findeBetrag(saubere, optionen.dollar || 'USD');
    if (betrag) {
        ergebnis.kosten = betrag.wert;
        if (betrag.waehrung) ergebnis.waehrung = betrag.waehrung;
    }

    const turnus = findeTurnus(text) || findeTurnusAusZeitraum(saubere, optionen);
    if (turnus) ergebnis.turnus = turnus;

    const kategorie = findeKategorie(text, name);
    if (kategorie) ergebnis.kategorie = kategorie;

    const datum = findeNaechsteZahlung(saubere, optionen);
    if (datum) {
        ergebnis.naechsteZahlung = zuISO(datum);
    } else {
        // Keine "nächste Zahlung" genannt: Rechnungs-/Zahlungsdatum merken,
        // das Formular schlägt daraus die nächste Zahlung vor.
        // Auf Rechnungen steht es oft nur als "Datum: …".
        const letzte = findeDatumNachStichwort(saubere, STICHWORT_LETZTE, optionen)
            || (RECHNUNG.test(text) ? findeDatumNachStichwort(saubere, STICHWORT_DATUM, optionen) : null);
        if (letzte) ergebnis.letzteZahlung = zuISO(letzte);
    }

    const kundennummer = findeNummer(saubere, LABEL_KUNDE);
    if (kundennummer) ergebnis.kundennummer = kundennummer;
    const vertragsnummer = findeNummer(saubere, LABEL_VERTRAG);
    if (vertragsnummer && vertragsnummer !== kundennummer) ergebnis.vertragsnummer = vertragsnummer;

    return ergebnis;
}
