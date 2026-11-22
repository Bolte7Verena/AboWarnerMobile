/**
 * waehrungen.js | Währungen: Richtkurse, Schreibweisen, Land -> Währung,
 * gewählte Hauptwährung (ab 2.0.2).
 *
 * Die App hat kein Internet, die Kurse sind deshalb fest eingebaut und nur
 * Richtwerte. Summen, in denen umgerechnet wurde, tragen immer ein "ca.".
 */

import { geraeteRegion } from './region.js';

// Wie viel einer Währung bekommt man für 1 Euro?
// Quelle: Europäische Kommission, InforEuro, Monatskurse November 2026.
export const KURSE_STAND = '2026-11';
export const KURSE_JE_EURO = {
    EUR: 1, USD: 1.113, GBP: 0.83578, CHF: 0.9222, BRL: 5.9563, AED: 4.0968,
    AOA: 1025.8, ARS: 1716, AUD: 1.5842, BDT: 138.23, BOB: 13.35, CAD: 1.5577,
    CLP: 1099.5, CNY: 7.4144, COP: 3518.7, CRC: 506.12, CZK: 24.336, DKK: 7.4736,
    DOP: 67.281, EGP: 62.485, GHS: 12.983, GTQ: 8.5089, HKD: 8.733, HUF: 365.95,
    IDR: 20193, ILS: 3.468, INR: 106.03, ISK: 135.8, JPY: 175.92, KES: 145,
    KRW: 1488.4, KWD: 0.34319, LKR: 370.87, MAD: 10.984, MXN: 20.866, MYR: 4.5182,
    MZN: 70.94, NGN: 1528.5, NOK: 10.332, NZD: 1.9817, PEN: 3.8378, PHP: 71.052,
    PKR: 308.51, PLN: 4.3938, PYG: 6520.5, QAR: 4.0513, RON: 5.3441, RSD: 117.52,
    RUB: 90.166, SAR: 4.1767, SEK: 10.999, SGD: 1.4265, THB: 37.569, TND: 3.3641,
    TRY: 55.469, TWD: 36.126, UAH: 50.696, UYU: 44.77, VND: 28778, XAF: 655.96,
    XOF: 655.96, ZAR: 18.522
};

// Ohne geerbte Namen wie "constructor" (Währungstexte können aus einer Datei stammen).
Object.setPrototypeOf(KURSE_JE_EURO, null);
export const WAEHRUNGEN = Object.keys(KURSE_JE_EURO);

// --- Land -> Währung ---
const LAENDER = {
    EUR: 'AD AT BE BG CY DE EE ES FI FR GF GP GR HR IE IT LT LU LV MC ME MQ MT NL PT RE SI SK SM VA XK YT',
    USD: 'US PR EC SV PA GU VI AS MP TL ZW',
    GBP: 'GB GG IM JE',
    CHF: 'CH LI',
    BRL: 'BR',
    AED: 'AE',
    AOA: 'AO',
    ARS: 'AR',
    AUD: 'AU KI NR TV',
    BDT: 'BD',
    BOB: 'BO',
    CAD: 'CA',
    CLP: 'CL',
    CNY: 'CN',
    COP: 'CO',
    CRC: 'CR',
    CZK: 'CZ',
    DKK: 'DK FO GL',
    DOP: 'DO',
    EGP: 'EG',
    GHS: 'GH',
    GTQ: 'GT',
    HKD: 'HK',
    HUF: 'HU',
    IDR: 'ID',
    ILS: 'IL PS',
    INR: 'IN',
    ISK: 'IS',
    JPY: 'JP',
    KES: 'KE',
    KRW: 'KR',
    KWD: 'KW',
    LKR: 'LK',
    MAD: 'MA EH',
    MXN: 'MX',
    MYR: 'MY',
    MZN: 'MZ',
    NGN: 'NG',
    NOK: 'NO SJ',
    NZD: 'NZ CK NU',
    PEN: 'PE',
    PHP: 'PH',
    PKR: 'PK',
    PLN: 'PL',
    PYG: 'PY',
    QAR: 'QA',
    RON: 'RO',
    RSD: 'RS',
    RUB: 'RU',
    SAR: 'SA',
    SEK: 'SE',
    SGD: 'SG',
    THB: 'TH',
    TND: 'TN',
    TRY: 'TR',
    TWD: 'TW',
    UAH: 'UA',
    UYU: 'UY',
    VND: 'VN',
    XAF: 'CM CF CG GA GQ TD',
    XOF: 'BF BJ CI GW ML NE SN TG',
    ZAR: 'ZA LS NA SZ'
};
const WAEHRUNG_ZUM_LAND = {};
for (const [code, laender] of Object.entries(LAENDER)) for (const land of laender.split(' ')) WAEHRUNG_ZUM_LAND[land] = code;

// Vorschlag für ein Land; unbekanntes Land: Euro.
export function waehrungFuerLand(land) {
    return WAEHRUNG_ZUM_LAND[String(land || '').toUpperCase()] || 'EUR';
}

// Was bedeutet ein einfaches "$"? Richtet sich nach dem Land (Mexiko: MXN).
const DOLLAR = ['USD', 'CAD', 'AUD', 'NZD', 'MXN', 'ARS', 'CLP', 'COP', 'UYU', 'DOP', 'SGD', 'HKD', 'TWD'];
export function dollarWaehrung(land = geraeteRegion()) {
    const code = waehrungFuerLand(land);
    return DOLLAR.includes(code) ? code : 'USD';
}

// --- Schreibweisen ---
const SCHREIBWEISEN = {
    '€': 'EUR', EURO: 'EUR', EUROS: 'EUR', '£': 'GBP', 'R$': 'BRL', REAL: 'BRL', REAIS: 'BRL', 'US$': 'USD', DOLLAR: 'USD',
    FR: 'CHF', 'FR.': 'CHF', SFR: 'CHF', FRANKEN: 'CHF', '¥': 'JPY', 'CA$': 'CAD', 'C$': 'CAD', 'A$': 'AUD', 'AU$': 'AUD', 'NZ$': 'NZD', 'MX$': 'MXN',
    'S$': 'SGD', 'HK$': 'HKD', 'NT$': 'TWD', '₹': 'INR', '₩': 'KRW', '₺': 'TRY', '₽': 'RUB', '₪': 'ILS', '₱': 'PHP', '฿': 'THB', 'ZŁ': 'PLN', '₴': 'UAH', '₦': 'NGN', '₫': 'VND'
};
Object.setPrototypeOf(SCHREIBWEISEN, null);

// Gespeicherter oder eingetippter Wert -> ISO-Code ("usd" -> "USD", "€" -> "EUR").
// Unbekanntes bleibt unverändert (nur getrimmt): Es geht nie etwas verloren.
export function normalisiereWaehrung(wert, land) {
    const text = String(wert ?? '').trim();
    const gross = text.toUpperCase();
    if (KURSE_JE_EURO[gross]) return gross;
    if (gross === '$') return dollarWaehrung(land);
    return SCHREIBWEISEN[gross] || text;
}

export function istBekannteWaehrung(wert) {
    return KURSE_JE_EURO[normalisiereWaehrung(wert)] !== undefined;
}

// Rechnet mit dem Richtkurs um. Unbekannte Währung: null (nicht umrechenbar).
export function rechneUm(betrag, von, nach) {
    const a = normalisiereWaehrung(von);
    const b = normalisiereWaehrung(nach);
    if (a === b) return betrag;
    if (!KURSE_JE_EURO[a] || !KURSE_JE_EURO[b]) return null;
    return (betrag / KURSE_JE_EURO[a]) * KURSE_JE_EURO[b];
}

// --- Hauptwährung (für die Summen) ---
// Einstellung: 'auto' oder ein ISO-Code, gespeichert in localStorage. Die Abos
// selbst werden dadurch nie verändert.
export const HAUPTWAEHRUNG_KEY = 'abo-warner:hauptwaehrung';

export function ladeWaehrungseinstellung() {
    try {
        const wert = localStorage.getItem(HAUPTWAEHRUNG_KEY);
        return KURSE_JE_EURO[wert] ? wert : 'auto';
    } catch (error) {
        return 'auto';
    }
}

export function speichereWaehrungseinstellung(wert) {
    try {
        localStorage.setItem(HAUPTWAEHRUNG_KEY, KURSE_JE_EURO[wert] ? wert : 'auto');
        return true;
    } catch (error) {
        return false; // es gilt weiterhin die bisherige Einstellung
    }
}

// 'auto': Haben alle Abos dieselbe (bekannte) Währung, dann diese — so bleiben
// die Summen beim Update genau. Sonst die Währung des Landes.
export function ermittleHauptwaehrung(abos = [], einstellung = ladeWaehrungseinstellung(), land = geraeteRegion()) {
    if (einstellung !== 'auto' && KURSE_JE_EURO[einstellung]) return einstellung;
    const benutzt = new Set(abos.map((abo) => normalisiereWaehrung(abo.waehrung)));
    if (benutzt.size === 1 && KURSE_JE_EURO[[...benutzt][0]]) return [...benutzt][0];
    return waehrungFuerLand(land);
}

// Reihenfolge der Auswahlliste: zuerst die passende, dann die häufigsten, dann alphabetisch.
export function waehrungsListe(zuerst = []) {
    const haeufig = ['EUR', 'USD', 'GBP', 'CHF', 'BRL'];
    const rest = WAEHRUNGEN.filter((c) => !haeufig.includes(c)).sort();
    return [...new Set([...zuerst.filter(Boolean), ...haeufig, ...rest])];
}
