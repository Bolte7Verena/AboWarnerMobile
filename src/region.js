/**
 * region.js | Was sich je Land unterscheidet (ab 2.0.2): Region des Geräts,
 * passendes Anzeigeformat, Wochenbeginn, Papierformat.
 *
 * Reine Funktionen ohne DOM; die Gerätesprachen lassen sich zum Testen
 * übergeben. Alles läuft auf dem Gerät, nichts wird übertragen.
 */

export function geraeteSprachen() {
    if (typeof navigator === 'undefined') return [];
    return navigator.languages && navigator.languages.length ? [...navigator.languages] : [navigator.language];
}

function teile(tag) {
    const stuecke = String(tag || '').split(/[-_]/);
    return {
        sprache: (stuecke[0] || '').toLowerCase(),
        region: (stuecke.slice(1).find((s) => /^[A-Za-z]{2}$/.test(s)) || '').toUpperCase()
    };
}

// Land, wenn das Gerät nur eine Sprache ohne Land meldet ("pt" -> Brasilien).
const LAND_ZUR_SPRACHE = { de: 'DE', en: 'US', es: 'ES', fr: 'FR', pt: 'BR', it: 'IT', nl: 'NL', pl: 'PL', ja: 'JP', ko: 'KR', sv: 'SE', da: 'DK', nb: 'NO', no: 'NO', tr: 'TR', ru: 'RU', cs: 'CZ', hu: 'HU', ro: 'RO', uk: 'UA' };

// Land des Geräts, z.B. "DE", "US", "BR". Es zählt die bevorzugte Sprache.
export function geraeteRegion(sprachen = geraeteSprachen()) {
    const erste = teile(sprachen.find(Boolean));
    if (erste.region) return erste.region;
    // "pt" ohne Land: steht weiter hinten dieselbe Sprache mit Land, gilt dieses.
    const gleiche = sprachen.map(teile).find((x) => x.sprache === erste.sprache && x.region);
    return (gleiche && gleiche.region) || LAND_ZUR_SPRACHE[erste.sprache] || '';
}

// --- Anzeigeformat (Datum, Zahlen, Beträge) ---
// Grundregel: Es gilt das Format der APP-Sprache. Das Land des Geräts bestimmt
// nur die Variante (en-US 11/15/2026, en-GB 15/11/2026), wenn diese Sprache dort
// gesprochen wird. Sonst sähe man z.B. auf einem US-Handy in der französischen
// App 12/03/2026 für den 3. Dezember.
const GRUND = { de: 'de-DE', en: 'en-GB', es: 'es-ES', fr: 'fr-FR', pt: 'pt-BR' };
const LAENDER = {
    de: ['DE', 'AT', 'CH', 'LI', 'LU'],
    en: ['US', 'GB', 'IE', 'CA', 'AU', 'NZ', 'IN', 'SG', 'ZA', 'PH', 'NG', 'KE', 'MT'],
    es: ['ES', 'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'US'],
    fr: ['FR', 'BE', 'CH', 'CA', 'LU'],
    pt: ['BR', 'PT', 'AO', 'MZ']
};

export function anzeigeRegion(appSprache, sprachen = geraeteSprachen()) {
    const passend = sprachen.find((tag) => teile(tag).sprache === appSprache && teile(tag).region);
    if (passend) return `${appSprache}-${teile(passend).region}`;
    const land = geraeteRegion(sprachen);
    // Nur die Sprache selbst ("en") oder eine andere Sprache: das Land zählt nur,
    // wenn die App-Sprache dort üblich ist.
    if ((LAENDER[appSprache] || []).includes(land)) return `${appSprache}-${land}`;
    return GRUND[appSprache] || 'en-GB';
}

// --- Wochenbeginn im Kalender (0 = Sonntag, 1 = Montag, 6 = Samstag) ---
// Quelle: Unicode CLDR (weekData, firstDay).
const SONNTAG = 'AG AS BD BR BS BT BW BZ CA CO DM DO ET GT GU HK HN ID IL IN JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY SA SG SV TH TT TW UM US VE VI WS YE ZA ZW'.split(' ');
const SAMSTAG = 'AE AF BH DJ DZ EG IQ IR JO KW LY OM QA SD SY'.split(' ');

export function wochenbeginn(land = geraeteRegion()) {
    if (SONNTAG.includes(land)) return 0;
    if (SAMSTAG.includes(land)) return 6;
    return 1;
}

// --- Papierformat der PDF (Querformat, in Punkt = 1/72 Zoll) ---
// Länder mit US-Letter laut Unicode CLDR (paperSize), sonst A4.
const LETTER = 'BZ CA CL CO CR GT MX NI PA PH PR SV US VE'.split(' ');

export function papierformat(land = geraeteRegion()) {
    return LETTER.includes(land) ? { name: 'Letter', breite: 792, hoehe: 612 } : { name: 'A4', breite: 842, hoehe: 595 };
}
