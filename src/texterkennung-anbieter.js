/**
 * texterkennung-anbieter.js | Findet im erkannten Text den Anbieter (Firma mit
 * Anschrift) und schlägt eine Kategorie vor. Reine Funktionen ohne DOM.
 *
 * Echte Rechnungen nennen die Firma selten allein in einer Zeile:
 *   Absenderzeile  "easybell GmbH · Brückenstraße 5A · 10179 Berlin"
 *                  (die Trennpunkte liest die Texterkennung als - | + , .)
 *   Fußzeile       "easybell GmbH Geschäftsführer: … Musterbank AG" (Spalten
 *                  stehen hintereinander in einer Zeile)
 * Gesucht werden deshalb alle Firmennennungen im Text; die mit den meisten
 * Hinweisen (Anschrift daneben, mehrfach genannt, passende Internetadresse)
 * gilt als Anbieter. Banken und der Empfänger der Rechnung zählen nicht.
 */

const wort = (muster) => `(?<![\\p{L}\\p{N}])(?:${muster})(?![\\p{L}])`;

// Text ohne Akzente, gleiche Länge (für Fehllesungen wie "Gescháftsfúhrer").
const ohneAkzente = (text) => [...text].map((z) => z.normalize('NFD')[0]).join('');

// --- Wörter, ab denen eine Zeile nicht mehr zur Anschrift gehört ---
const FREMD = new RegExp([
    wort('geschaftsfuhr\\p{L}*|vertretungsberechtigt\\p{L}*|vorstand|aufsichtsrat\\p{L}*|amtsgericht|registergericht|handelsregister|sitz der gesellschaft|hr[ab](?:\\s?-?\\s?nr\\.?)?|ust|ust\\s?-?\\s?id\\p{L}*|ustid\\p{L}*|(?:umsatz|mehrwert)?steuer(?:\\s?-?\\s?(?:nummer|nr|id\\p{L}*))?|finanzamt'),
    wort('iban|bic|blz|konto(?:nummer|nr|inhaber\\p{L}*)?|kto|bankverbindung|glaubiger\\p{L}*|swift'),
    wort('tel|tele(?:fon(?:nummer|nr)?|fone|fono|phone|fax|kopie|copie)|(?:mobile|cell)?phone|fax|mobile?|hotline|e-?mail|mail|web|internet(?=\\s*:)'),
    wort('kunden\\s?-?\\s?(?:nummer|nr|kennung|id)|kd\\.?|vertrags(?:nummer|nr|konto)\\p{L}*|rechnung(?:s\\s?-?\\s?(?:nummer|nr|datum|betrag))?|datum|seite|page|customer|invoice|account|date|vat|registered|company\\s+(?:no|number)|reg\\.?\\s?no'),
    wort('rcs|siret|siren|ape|tva|au\\s+capital|capital|client|facture'),
    wort('nif|cif|n\\.?i\\.?f\\.?|factura|fecha|cliente|registro\\s+mercantil|inscrita'),
    wort('cnpj|cpf|nipc|fatura|data|contribuinte'),
    '[^ ]*@|www\\.|https?:'
].join('|'), 'iu');

// Erste Spalte einer Zeile: alles vor dem ersten fremden Wort.
export function ersteSpalte(zeile) {
    const treffer = FREMD.exec(ohneAkzente(zeile));
    const teil = treffer ? zeile.slice(0, treffer.index) : zeile;
    return teil.replace(/(?:[\s|·•,;:‚'"+*»«_~=\-–—]|\s\.)+$/u, '').replace(/^[\s.|·•,;:‚'"+*»«_~=\-–—]+/u, '').trim();
}

// --- Firmennennungen ---
// Eindeutige Rechtsformen gelten überall in der Zeile, kurze Kürzel (SE, SA, AB …)
// nur am Zeilenende oder vor einem Trennzeichen: sonst wären es oft Wörter.
const FORM_STARK = '(?:g?[G6][mn]b[HN](?:\\s*&\\s*Co\\.?\\s*KG(?:aA)?)?|mbH|AG\\s*&\\s*Co\\.?\\s*(?:KG(?:aA)?|OHG)|UG\\s*\\(haftungsbeschränkt\\)|KGaA|Ltd\\.?|LTD\\.?|Limited|LLC|Inc\\.?|plc|PLC|Corporation|Corp\\.?|SARL|S\\.\\s?[aàAÀ]\\.?\\s?[rR]\\.\\s?[lL]\\.?|S\\.A\\.S\\.?|S\\.A\\.U\\.?|S\\.A\\.|S\\.L\\.U\\.?|S\\.L\\.|Ltda\\.?|LTDA\\.?|Lda\\.?|EIRELI|S/A|B\\.\\s?V\\.|N\\.\\s?V\\.|e\\.\\s?V\\.|Sociedad\\s+An[oó]nima)';
const FORM_KURZ = '(?:AG|SE|KG|OHG|UG|eG|SAS|SA|SLU|SL|BV|NV|AB|INC|Oy|ApS)';
const TRENNER = '[|·•,;:‚+*»«_~=\\-–—]';
const FIRMA = new RegExp(`(?<=[\\p{L}\\p{N}.&+'’)]),?\\s+(?:(?<stark>${FORM_STARK})(?![\\p{L}\\p{N}])|(?<kurz>${FORM_KURZ})(?=\\.?\\s*(?:$|${TRENNER})))`, 'gu');

const KEIN_NAMENSTEIL = new RegExp(`^(?:der|die|das|den|dem|des|mit|von|vom|bei|beim|an|am|für|durch|und|ihr|ihre|ihrem|ihren|unser|unsere|wir|the|by|from|with|of|your|our|to|de|del|la|el|los|las|le|les|du|des|chez|par|do|da|dos|das|com|por|con|sa|seu|sua|su|firma|fa|rechnung|angebot|vertrag|absender|empfänger|zahlungsempfänger|kontoinhaber|gläubiger|rechnungssteller|anbieter|herr|herrn|frau|familie|invoice|contract|facture|factura|fatura|copyright|©)$`, 'iu');

function namensteil(davor, ganzeZeile) {
    const woerter = davor.replace(/,\s*$/, '').split(/\s+/u).filter(Boolean);
    // Steht nur der Name in der Zeile ("Fitness für alle e.V."), gehört alles dazu.
    if (ganzeZeile && woerter.length <= 5 && /^[\p{Lu}\d]/u.test(woerter[0] || '') && !KEIN_NAMENSTEIL.test(woerter[0]) && !/[,:;|·•]/u.test(davor)) return woerter.join(' ');
    const name = [];
    for (let i = woerter.length - 1; i >= 0 && name.length < 5; i--) {
        const w = woerter[i];
        const nackt = w.replace(/^[("'„“»«]+|[)"'“”»«,.]+$/gu, '');
        if (!nackt || KEIN_NAMENSTEIL.test(nackt)) break;
        if (new RegExp(`^${TRENNER}+$`, 'u').test(w) || /[:;|·•]$/u.test(w)) break;
        // Kleingeschriebenes nur direkt vor der Rechtsform ("easybell GmbH") oder als & / und.
        if (name.length > 0 && /^\p{Ll}/u.test(nackt)) break;
        if (/^\d+$/.test(nackt) && name.length > 0) break;
        name.unshift(w.replace(/^[("'„“»«]+/u, ''));
    }
    return name.join(' ').replace(/[,\s]+$/u, '');
}

const BANK = /bank|sparkasse|volksbank|raiffeisen|paypal|klarna|adyen|stripe|mollie/iu;

function firmenIn(zeile, nr) {
    const liste = [];
    for (const m of zeile.matchAll(FIRMA)) {
        const form = m.groups.stark || m.groups.kurz;
        const name = namensteil(zeile.slice(0, m.index), /^\.?\s*$/.test(zeile.slice(m.index + m[0].length)));
        if (name.length < 2 || name.length > 60 || !/\p{L}{2}/u.test(name)) continue;
        const ende = m.index + m[0].length;
        liste.push({ zeile: nr, name, form, voll: `${name} ${form}`, rest: zeile.slice(ende).replace(/^\./, '') });
    }
    return liste;
}

// --- Anschrift ---
const PLZ_ORT = [
    /^(?:[A-Z]{1,2}[-\s])?\d{4,5}\s+\p{L}/u,       // 10115 Berlin, F-75001 Paris, 28001 Madrid, 1010 Wien
    /(?<!\d)\d{5}-\d{3}(?!\d)/u,                    // CEP Brasilien
    /(?<!\d)\d{4}-\d{3}(?!\d)/u,                    // Portugal
    /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/u,       // Großbritannien
    /\p{L}+,?\s+[A-Z]{2}\s+\d{5}(?:-\d{4})?\b/u,    // USA
    /\p{L}[\p{L}\s.-]*\s\d{4,5}$/u                  // Ort vor PLZ (Sample City 12345)
];
export const istPlzOrt = (zeile) => PLZ_ORT.some((m) => m.test(zeile));

// "· Brückenstraße 5A · 10179 Berlin" hinter dem Firmennamen in derselben Zeile.
const PLZ_IN_ZEILE = /(?<![\p{L}\d])(?:[A-Z]{1,2}-)?\d{4,5}\s+\p{Lu}[\p{L}.-]{2,}(?:\s+(?:am|an\s+der|im|in|bei|ob\s+der|\(?\p{Lu}[\p{L}.)-]+))*/u;

function anschriftInZeile(rest) {
    const m = PLZ_IN_ZEILE.exec(rest);
    if (!m) return null;
    const strasse = ersteSpalte(rest.slice(0, m.index));
    const ort = ersteSpalte(m[0]);
    if (strasse.length < 4 || strasse.length > 60 || !/\p{L}{3}/u.test(strasse) || ort.length < 6) return null;
    // Zwischen Firma und PLZ darf nichts Fremdes stehen ("… HRB 12345 Berlin").
    if (FREMD.test(ohneAkzente(rest.slice(0, m.index)))) return null;
    return [strasse, ort];
}

// Beginn einer Empfängeranschrift: ab hier gehört der Text dem Kunden.
const EMPFAENGER = /^(?:herrn?|frau|familie|an|z\.?\s?hd\.?|zu händen|mr|mrs|ms|miss|attn|mme|mlle|m|monsieur|madame|sr|sra|d|dña|dona)\.?(?:\s|$)/iu;

function anschriftDarunter(zeilen, nr) {
    const block = [];
    for (let j = nr + 1; j < Math.min(zeilen.length, nr + 5); j++) {
        if (EMPFAENGER.test(zeilen[j])) return null;
        const teil = ersteSpalte(zeilen[j]);
        if (!teil || teil.length > 70) return null;
        block.push(teil);
        if (istPlzOrt(teil)) return block;
        // Höchstens zwei Zeilen ohne Ziffer (Abteilung, Gebäude) vor dem Ort.
        if (block.length === 3 && !block.some((z) => /\d/.test(z))) return null;
    }
    return null;
}

const kern = (name) => ohneAkzente(name).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

// Liefert { name (ohne Rechtsform), anschrift (Firma, Straße, Ort) } oder leere Texte.
export function findeAnbieter(zeilen) {
    const text = zeilen.join('\n');
    const adressen = ohneAkzente(text).toLowerCase();
    let nennungen = zeilen.flatMap((z, i) => firmenIn(z, i));
    const keineBank = nennungen.filter((f) => !BANK.test(f.name));
    if (keineBank.length > 0) nennungen = keineBank;
    else nennungen = nennungen.filter((f) => !/iban|bic|blz/iu.test([zeilen[f.zeile], zeilen[f.zeile + 1]].join(' ')));
    if (nennungen.length === 0) return { name: '', anschrift: '' };

    const firmen = new Map();
    for (const f of nennungen) {
        const k = kern(f.name);
        if (!firmen.has(k)) firmen.set(k, { name: f.name, voll: f.voll, punkte: 0, anschrift: null });
        const firma = firmen.get(k);
        firma.punkte += 1;
        const inZeile = anschriftInZeile(f.rest);
        const darunter = inZeile ? null : anschriftDarunter(zeilen, f.zeile);
        if (inZeile) firma.punkte += 3;
        else if (darunter) firma.punkte += 1;
        if (FREMD.test(ohneAkzente(f.rest))) firma.punkte += 1; // Geschäftsführer, HRB … daneben
        if (EMPFAENGER.test(zeilen[f.zeile + 1] || '') && !inZeile) firma.punkte -= 2; // "Muster GmbH / z. Hd. …"
        if (!firma.anschrift || (inZeile && !firma.inZeile)) {
            firma.anschrift = inZeile || darunter || firma.anschrift;
            firma.inZeile = !!inZeile;
        }
    }
    for (const [k, firma] of firmen) {
        const erstes = kern(firma.name.split(/\s+/u)[0]);
        const re = (x) => new RegExp(`(?:www\\.|@|https?://)[^\\s]*${x}`, 'u');
        if (re(k).test(adressen) || (erstes.length >= 4 && re(erstes).test(adressen))) firma.punkte += 2;
    }
    const beste = [...firmen.values()].reduce((a, b) => (b.punkte > a.punkte ? b : a));
    return { name: beste.name, anschrift: beste.anschrift ? [beste.voll, ...beste.anschrift].join('\n') : '' };
}

// --- Kategorie ---
// Nur ein Vorschlag, wenn genau eine Kategorie vorn liegt; sonst bleibt die Auswahl leer.
const KATEGORIE_MARKEN = {
    Streaming: ['Netflix', 'Disney+', 'Amazon Prime', 'Prime Video', 'Apple TV+', 'YouTube Premium', 'DAZN', 'Sky', 'WOW', 'RTL+', 'Joyn', 'Paramount+', 'Max', 'Crunchyroll'],
    Musik: ['Spotify', 'Apple Music', 'YouTube Music', 'Deezer', 'Tidal'],
    Software: ['Microsoft 365', 'Office 365', 'Adobe', 'Dropbox', 'Google One', 'iCloud+', 'ChatGPT Plus'],
    Sport: ['McFit', 'FitX', 'Clever Fit', 'Urban Sports Club', 'Basic-Fit'],
    Telekommunikation: ['Telekom', 'Vodafone', 'O2', '1&1', 'congstar', 'Movistar', 'Orange', 'SFR', 'Bouygues', 'Free', 'MEO', 'NOS', 'Claro', 'Vivo', 'TIM']
};
const KATEGORIE_WOERTER = {
    Telekommunikation: 'internet(?:anschluss|tarif|zugang|flat)?|telefon(?:ie|anschluss|tarif|flat)?|festnetz\\p{L}*|mobilfunk\\p{L}*|handy(?:tarif|vertrag)|dsl|vdsl|glasfaser\\p{L}*|breitband\\p{L}*|voip|sim|broadband|fib(?:re|er)|landline|mobile\\s+plan|phone\\s+plan|line\\s+rental|telecom\\p{L}*|fibra|telefon[ií]a|l[ií]nea\\s+m[oó]vil|banda\\s+(?:ancha|larga)|t[eé]l[eé]phonie|forfait\\s+mobile|celular',
    Energie: 'strom\\p{L}*|(?:erd)?gas(?:tarif|lieferung|verbrauch|rechnung)?|kwh|z[aä]hlerstand|z[aä]hlernummer|netzentgelt\\p{L}*|grundversorgung|stadtwerke|fernw[aä]rme|energie\\p{L}*|electricity|energy|meter\\s+(?:reading|number)|electricidad|energ[ií]a|[eé]lectricit[eé]|[eé]nergie|compteur|eletricidade',
    Versicherung: '\\p{L}*versicherung\\p{L}*|haftpflicht\\p{L}*|versicherungsschein|police|insurance|insured|policy\\s+(?:number|holder)|seguros?|p[oó]liza|assurances?|assur[eé]|ap[oó]lice|segurado',
    Sport: 'fitness\\p{L}*|sportstudio|sportverein|mitgliedsbeitrag\\s+sport|gym|gimnasio|salle\\s+de\\s+sport|academia|crossfit|yoga',
    Streaming: 'streaming|video[\\s-]on[\\s-]demand|filme\\s+und\\s+serien|movies|pel[ií]culas|series',
    Musik: 'musik(?:streaming|abo)?|music|m[uú]sica|musique',
    Software: 'software|lizenz\\p{L}*|licen[cs]e|licencia|licence|licen[cç]a|cloud\\p{L}*|webhosting|hosting|domain|saas',
    Wohnen: 'miete|kaltmiete|warmmiete|nebenkosten\\p{L}*|hausgeld|mietvertrag|rent|tenancy|alquiler|loyer|aluguel|condom[ií]nio|renda'
};

export function findeKategorie(text, name = '') {
    for (const [kategorie, marken] of Object.entries(KATEGORIE_MARKEN)) if (marken.includes(name)) return kategorie;
    // Internet-Adresszeilen ("Internet: www…") sagen nichts über den Vertrag.
    const zeilen = text.split('\n').map((z) => z.replace(/internet\s*:\s*\S*/giu, ' ').replace(/(?:www\.|https?:)\S*/giu, ' ').replace(/(?:tel(?:efon)?|phone|t[eé]l[eé]fono|t[eé]l[eé]phone|telefone)\.?\s*(?:nr\.?|nummer)?\s*[:.]?\s*[+(\d][\d\s()/+-]*/giu, ' '));
    const punkte = Object.entries(KATEGORIE_WOERTER).map(([kategorie, woerter]) => {
        const re = new RegExp(wort(woerter), 'giu');
        const treffer = new Set();
        for (const z of zeilen) for (const m of z.matchAll(re)) treffer.add(ohneAkzente(m[0]).toLowerCase());
        return [kategorie, treffer.size];
    }).sort((a, b) => b[1] - a[1]);
    return punkte[0][1] > 0 && punkte[0][1] > punkte[1][1] ? punkte[0][0] : '';
}
