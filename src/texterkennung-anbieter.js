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

import { istEigeneAnschrift } from './absender.js';

const wort = (muster) => `(?<![\\p{L}\\p{N}])(?:${muster})(?![\\p{L}])`;

// Text ohne Akzente, gleiche Länge (für Fehllesungen wie "Gescháftsfúhrer").
const ohneAkzente = (text) => [...text].map((z) => z.normalize('NFD')[0]).join('');

// --- Wörter, ab denen eine Zeile nicht mehr zur Anschrift gehört ---
// Registerangaben stehen nur bei der Firma selbst (Fußzeile, Briefkopf).
const REGISTER_WOERTER = wort('geschaftsfuhr\\p{L}*|vertretungsberechtigt\\p{L}*|vorstand|aufsichtsrat\\p{L}*|amtsgericht|registergericht|handelsregister|sitz der gesellschaft|hr[ab](?:\\s?-?\\s?nr\\.?)?|ust\\s?-?\\s?id\\p{L}*|ustid\\p{L}*|iban|bic|blz|bankverbindung|glaubiger\\p{L}*|swift|registered|company\\s+(?:no|number)|rcs|siret|siren|au\\s+capital|nif|cif|registro\\s+mercantil|inscrita|cnpj|nipc|contribuinte');
// Angaben aus dem Kundenblock rechts neben der Empfängeranschrift.
const KUNDEN_WOERTER = wort('ihre?[nmrs]?|unsere?|your|our|(?:kunden|rechnungs?|vertrags?|auftrags?|bestell|beleg|vorgangs?|mandats?)\\s?-?\\s?(?:referenz|nummer|nr|kennung|id|konto|datum|betrag|zeichen)\\p{L}*|referenz|reference|ref|zeichen|kd|datum|rechnung|seite|page|customer|invoice|account|date|client|facture|factura|fecha|cliente|fatura|data|zeitraum|leistungszeitraum|period|sachbearbeiter\\p{L}*|ansprechpartner\\p{L}*');
const REGISTER = new RegExp(REGISTER_WOERTER, 'iu');
const KUNDENBLOCK = new RegExp(KUNDEN_WOERTER, 'iu');
const FREMD = new RegExp([
    REGISTER_WOERTER,
    KUNDEN_WOERTER,
    wort('ust|(?:umsatz|mehrwert)?steuer(?:\\s?-?\\s?(?:nummer|nr|id\\p{L}*))?|finanzamt|konto(?:nummer|nr|inhaber\\p{L}*)?|kto|vat|ape|tva|capital|n\\.?i\\.?f\\.?|cpf|reg\\.?\\s?no'),
    wort('tel|tele(?:fon(?:nummer|nr)?|fone|fono|phone|fax|kopie|copie)|(?:mobile|cell)?phone|fax|mobile?|hotline|e-?mail|mail|web|internet(?=\\s*:)'),
    '[^ ]*@|www\\.|https?:'
].join('|'), 'iu');
const KONTAKT_AM_ANFANG = /^\W*(?:tel|fax|t[eé]l|phone|mobil|e-?mail|mail|web|www|https?:|\S+@|internet\s*:|hotline|ust|iban|bic|vat)/iu;

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

const kern = (name) => ohneAkzente(name).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

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
// Ort: ein Wort, dazu nur typische Zusätze (Bad Homburg, Frankfurt am Main). Hängt die
// Texterkennung den Empfänger an die Zeile, gehört er nicht zum Ort.
const ORT = '(?:(?:Bad|Sankt|St\\.|Markt|Neu|Alt|Groß|Klein|Burg|Schloß|Hann\\.|San|Santa|Los|Las|La|Le|El|Saint)\\s)?\\p{Lu}[\\p{L}.-]{2,}(?:\\s(?:am|an\\sder|a\\.\\s?d\\.|im|in|bei|ob\\sder|v\\.\\s?d\\.|vor\\sder)\\s\\p{Lu}[\\p{L}.-]+|\\s\\(\\p{L}+\\))?';
const PLZ_IN_ZEILE = new RegExp(`(?<![\\p{L}\\d])(?:[A-Z]{1,2}-)?\\d{4,5}\\s?(?=\\p{Lu}\\p{L}{2}|St\\.)${ORT}`, 'u');

// Trennstriche werden als I l ! / [ ] gelesen, Ziffern der PLZ als O, o, I, l.
function glaette(rest) {
    return rest
        .replace(/\s[Il!/[\]{}()]\s/gu, ' | ')
        .replace(/(?<![\p{L}\d])(?=[\dOoIl]{5}\s?\p{Lu}\p{Ll})(?=(?:[OoIl]*\d){3})[\dOoIl]{5}/u, (z) => z.replace(/[Oo]/g, '0').replace(/[Il]/g, '1'));
}

function anschriftInZeile(rohRest) {
    const rest = glaette(rohRest);
    const m = PLZ_IN_ZEILE.exec(rest);
    if (!m) return null;
    // "10179 Musterholzer Str. 19": Der Ort fehlt, es folgt schon die nächste Straße.
    if (/^[.\s]*(?:str|stra(?:ß|ss)e|weg|platz|allee|gasse|ring|\d)/iu.test(rest.slice(m.index + m[0].length))) return null;
    // Zwischen Firma und PLZ darf nichts Fremdes stehen ("… HRB 12345 Berlin").
    if (FREMD.test(ohneAkzente(rest.slice(0, m.index)))) return null;
    const strasse = ersteSpalte(rest.slice(0, m.index));
    const ort = ersteSpalte(m[0]).replace(/^((?:[A-Z]{1,2}-)?\d{4,5})(?=\p{Lu})/u, '$1 ');
    if (strasse.length < 4 || strasse.length > 60 || !/\p{L}{3}/u.test(strasse) || ort.length < 6) return null;
    return [strasse, ort];
}

// Beginn einer Empfängeranschrift: ab hier gehört der Text dem Kunden.
const EMPFAENGER = /^(?:herrn?|frau|familie|an|z\.?\s?hd\.?|zu händen|mr|mrs|ms|miss|attn|mme|mlle|m|monsieur|madame|sr|sra|d|dña|dona)\.?(?:\s|$)/iu;
// Abteilung zwischen Firma und Straße ("Kundenservice", "Postfach 12 34").
const ABTEILUNG = /service|abteilung|buchhaltung|verwaltung|zentrale|niederlassung|postfach|p\.?\s?o\.?\s?box|department|atenci[oó]n|servicio|clientes|bo[iî]te\s+postale|cs\s\d|atendimento|departamento/iu;
const FIRMA_TEST = new RegExp(FIRMA.source, 'u');
const istPerson = (zeile) => /^\p{Lu}[\p{L}'’.-]+(?:\s+\p{Lu}[\p{L}'’.-]*){1,3}$/u.test(zeile) && !FIRMA_TEST.test(zeile);

// Nachname aus der Anrede ("Sehr geehrter Herr Mustermann,").
function nameAusAnrede(zeilen) {
    for (const z of zeilen) {
        const m = /^(?:sehr\s+geehrter?|guten\s+tag|hallo|lieber?|dear|estimad[oa]|hola|ch[eè]re?|bonjour|prezad[oa]|ol[aá]|car[oa])\s+(.+?)\s*[,!:.]?$/iu.exec(z);
        if (!m || /damen|herren|sir|madam|señores|clientes?$|kunde|messieurs/iu.test(m[1])) continue;
        const letzter = m[1].split(/\s+/u).pop();
        if (/^\p{Lu}\p{L}{2,}/u.test(letzter)) return kern(letzter);
    }
    return '';
}

// Folgt weiter unten eine Anschrift mit Personennamen (der Empfänger)?
function hatEmpfaengerDanach(zeilen, ab) {
    for (let j = ab; j + 2 < zeilen.length; j++) {
        const [name, strasse, ort] = [zeilen[j], zeilen[j + 1], zeilen[j + 2]].map(ersteSpalte);
        if ((istPerson(name) || EMPFAENGER.test(name)) && /\d/.test(strasse) && istPlzOrt(ort)) return true;
    }
    return false;
}

// Anschrift in den Zeilen unter dem Firmennamen. In Briefen steht genau dort aber
// meist der EMPFÄNGER (unter der Absenderzeile). Deshalb nur mit Beleg, dass es
// die Firma ist; sonst bleibt das Feld leer:
//   - Registerangaben daneben (Fußzeile: Geschäftsführer, HRB, USt-IdNr., IBAN …), oder
//   - Telefon/Internet/USt beginnt direkt darunter (Briefkopf), oder
//   - weiter unten folgt noch eine Anschrift mit Personennamen (= der Empfänger).
function anschriftDarunter(zeilen, firma, anrede) {
    const restFirma = ersteSpalte(firma.rest);
    if (/[\p{L}\d]/u.test(restFirma)) return null; // hinter der Firma steht noch etwas: Absenderzeile
    let register = REGISTER.test(ohneAkzente(firma.rest));
    if (KUNDENBLOCK.test(ohneAkzente(firma.rest))) return null;
    const block = [];
    for (let j = firma.zeile + 1; j < Math.min(zeilen.length, firma.zeile + 5); j++) {
        const zeile = zeilen[j];
        const flach = ohneAkzente(zeile);
        // Infoblock daneben (Ihre Kundenreferenz …) oder Empfänger: nicht die Firma.
        if (EMPFAENGER.test(zeile) || KUNDENBLOCK.test(flach)) return null;
        if (REGISTER.test(flach)) register = true;
        const teil = ersteSpalte(zeile);
        if (!teil || teil.length > 70) return null;
        if (anrede && kern(teil).includes(anrede)) return null;
        // Direkt unter der Firma muss Straße/Postfach/Abteilung stehen, kein Name.
        if (block.length === 0 && !/\d/.test(teil) && !ABTEILUNG.test(teil)) return null;
        block.push(teil);
        if (istPlzOrt(teil)) {
            if (block.length < 2 && !/^\d+[a-z]?\s.+,/iu.test(block[0])) return null; // Ort ohne Straße (nur "12 Sample Street, London …" steht in einer Zeile)
            const belegt = register || KONTAKT_AM_ANFANG.test(zeilen[j + 1] || '') || hatEmpfaengerDanach(zeilen, j + 1);
            return belegt ? { block, register } : null;
        }
        if (block.length === 3) return null;
    }
    return null;
}


// eigene = gemerkte Absenderdaten des Nutzers: diese Anschrift nie übernehmen.
// Liefert { name (ohne Rechtsform), anschrift (Firma, Straße, Ort) } oder leere Texte.
export function findeAnbieter(zeilen, eigene = {}) {
    const text = zeilen.join('\n');
    const adressen = ohneAkzente(text).toLowerCase();
    let nennungen = zeilen.flatMap((z, i) => firmenIn(z, i));
    const keineBank = nennungen.filter((f) => !BANK.test(f.name));
    if (keineBank.length > 0) nennungen = keineBank;
    else nennungen = nennungen.filter((f) => !/iban|bic|blz/iu.test([zeilen[f.zeile], zeilen[f.zeile + 1]].join(' ')));
    if (nennungen.length === 0) return { name: '', anschrift: '' };

    const anrede = nameAusAnrede(zeilen);
    const firmen = new Map();
    for (const f of nennungen) {
        const k = kern(f.name);
        if (!firmen.has(k)) firmen.set(k, { name: f.name, voll: f.voll, punkte: 0, anschrift: null, guete: 0 });
        const firma = firmen.get(k);
        firma.punkte += 1;
        const inZeile = anschriftInZeile(f.rest);
        const darunter = inZeile ? null : anschriftDarunter(zeilen, f, anrede);
        if (inZeile) firma.punkte += 3;
        else if (darunter) firma.punkte += 1;
        if (REGISTER.test(ohneAkzente(f.rest))) firma.punkte += 1; // Geschäftsführer, HRB … daneben
        if (EMPFAENGER.test(zeilen[f.zeile + 1] || '') && !inZeile) firma.punkte -= 2; // "Muster GmbH / z. Hd. …"
        // Mehrere Fundstellen: die verlässlichste. Straße ohne Hausnummer ist oft verlesen.
        const block = inZeile || (darunter && darunter.block);
        if (!block) continue;
        const guete = (inZeile ? 3 : darunter.register ? 2.5 : 1) - (/[0-9]/.test(block[0]) ? 0 : 2);
        if (guete > firma.guete && !istEigeneAnschrift(block.join('\n'), eigene) && !(anrede && kern(block.join(' ')).includes(anrede))) {
            firma.anschrift = block;
            firma.guete = guete;
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
