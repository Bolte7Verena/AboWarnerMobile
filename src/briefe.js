/**
 * briefe.js | Kündigungsschreiben je Land (ab 2.0.2): Aufbau, Anrede und
 * Formulierungen, wie sie dort üblich sind — keine Übersetzung des deutschen
 * Briefs. Bewusst ohne Paragrafen und ohne Rechtsberatung.
 *
 * Die Fassung richtet sich nach App-Sprache und Land des Geräts:
 *   de · en-GB (Grundform) · en-US · es-ES · es-LA (Lateinamerika) ·
 *   fr-FR / fr-BE / fr-CH / fr-CA · pt-BR · pt-PT
 * Reine Funktionen ohne DOM (per Unit-Test prüfbar).
 */

import { anzeigeRegion } from './region.js';
import { aktuelleSprache, formatiereDatum } from './i18n.js';

const UNTERSCHRIFTSLINIE = '_______________________';

const EN_US = ['US', 'CA', 'PH', 'PR'];
const ES_LATEINAMERIKA = ['MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'EC', 'GT', 'CU', 'BO', 'DO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'US', '419'];
const PT_PORTUGAL = ['PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'];
const FR_EIGEN = ['BE', 'CH', 'CA'];

// Welche Fassung gilt? sprache = App-Sprache, region = z.B. "en-US".
export function briefFassung(sprache = aktuelleSprache(), region = anzeigeRegion(sprache)) {
    const land = region.split('-')[1] || '';
    if (sprache === 'en') return EN_US.includes(land) ? 'en-US' : 'en-GB';
    if (sprache === 'es') return ES_LATEINAMERIKA.includes(land) ? 'es-LA' : 'es-ES';
    if (sprache === 'pt') return PT_PORTUGAL.includes(land) ? 'pt-PT' : 'pt-BR';
    if (sprache === 'fr') return FR_EIGEN.includes(land) ? `fr-${land}` : 'fr-FR';
    return 'de';
}

// Ort aus "12345 Musterstadt", "01000-000 São Paulo", "São Paulo - SP, 01000-000".
// Nicht sicher erkennbar: leer (dann steht im Brief nur das Datum).
export function ortAus(plzOrt) {
    const ort = String(plzOrt || '')
        .replace(/^\s*(?:[A-Z]{1,2}[-\s])?\d[\d\s-]*\s+/u, '')
        .replace(/[\s,–-]+\d[\d\s-]*$/u, '')
        .replace(/[\s,–-]+$/u, '')
        .trim();
    return /\p{L}/u.test(ort) && !/\d/.test(ort) ? ort : '';
}

// Ausgeschriebenes Datum: "22 November 2026", "November 22, 2026",
// "22 de noviembre de 2026", "1er décembre 2026".
export function langesDatum(datum, locale) {
    try {
        const text = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', numberingSystem: 'latn', calendar: 'gregory' }).format(datum);
        return locale.startsWith('fr') ? text.replace(/^1 /, '1er ') : text;
    } catch (error) {
        return formatiereDatum(datum);
    }
}

// Bausteine je Fassung. versandart = Vermerk bei Einschreiben. a = { name, email, ort, vertrag, kunde, abo } (Text, ggf. leer).
const zeilen = (...teile) => teile.filter(Boolean).join('\n');

const FRANZOESISCH = (versandart, locale) => ({
    locale,
    // Französisch: Versandvermerk unter dem Empfänger.
    reihenfolge: ['absender', 'empfaenger', 'versandart', 'datum', 'betreff', 'anrede', 'kern', 'bestaetigung', 'gruss'],
    datum: (d, ort) => (ort ? `${ort}, le ${d}` : `Le ${d}`),
    versandart,
    betreff: (a) => zeilen(`Objet : résiliation du contrat – ${a.abo}`, a.vertrag && `Numéro de contrat : ${a.vertrag}`, a.kunde && `Numéro de client : ${a.kunde}`),
    anrede: 'Madame, Monsieur,',
    kern: 'Par la présente, je vous informe de ma décision de résilier le contrat mentionné en objet à la prochaine échéance possible.',
    bestaetigung: (email) => `Je vous remercie de me confirmer par écrit${email ? `, à l’adresse ${email},` : ''} la bonne réception de ce courrier ainsi que la date de fin du contrat.`,
    gruss: 'Je vous prie d’agréer, Madame, Monsieur, l’expression de mes salutations distinguées.',
    linie: UNTERSCHRIFTSLINIE
});

const FASSUNGEN = {
    de: {
        locale: 'de-DE',
        versandart: 'Einschreiben',
        datum: (d) => d,
        betreff: (a) => zeilen(`Kündigung: ${a.abo}`, a.vertrag && `Vertragsnummer: ${a.vertrag}`, a.kunde && `Kundennummer: ${a.kunde}`),
        anrede: 'Sehr geehrte Damen und Herren,',
        kern: 'hiermit kündige ich den oben genannten Vertrag fristgerecht zum nächstmöglichen Zeitpunkt.',
        bestaetigung: (email) => `Bitte bestätigen Sie mir die Kündigung und das Vertragsende ${email ? `per E-Mail an ${email}` : 'schriftlich'}.`,
        gruss: 'Mit freundlichen Grüßen',
        linie: UNTERSCHRIFTSLINIE
    },
    'en-GB': {
        locale: 'en-GB',
        versandart: 'By recorded delivery',
        datum: (d) => d,
        // Britisch: Betreff steht nach der Anrede.
        reihenfolge: ['absender', 'versandart', 'empfaenger', 'datum', 'anrede', 'betreff', 'kern', 'bestaetigung', 'gruss'],
        betreff: (a) => zeilen(`Cancellation – ${a.abo}`, a.vertrag && `Contract number: ${a.vertrag}`, a.kunde && `Customer number: ${a.kunde}`),
        anrede: 'Dear Sir or Madam,',
        kern: 'I am writing to give notice that I wish to cancel the above contract with effect from the earliest possible date.',
        bestaetigung: (email) => `Please confirm the cancellation and the end date of the contract in writing${email ? ` by email to ${email}` : ''}.`,
        gruss: 'Yours faithfully,',
        linie: UNTERSCHRIFTSLINIE
    },
    'en-US': {
        locale: 'en-US',
        versandart: 'Via certified mail',
        datum: (d) => d,
        // Amerikanisch: Datum vor dem Empfänger.
        reihenfolge: ['absender', 'datum', 'versandart', 'empfaenger', 'betreff', 'anrede', 'kern', 'bestaetigung', 'gruss'],
        betreff: (a) => zeilen(`Re: Cancellation – ${a.abo}`, a.vertrag && `Contract number: ${a.vertrag}`, a.kunde && `Customer number: ${a.kunde}`),
        anrede: 'To Whom It May Concern:',
        kern: 'I am writing to cancel the contract listed above, effective on the earliest possible date.',
        bestaetigung: (email) => `Please send me written confirmation of the cancellation and the end date of the contract${email ? ` by email at ${email}` : ''}.`,
        gruss: 'Sincerely,',
        linie: UNTERSCHRIFTSLINIE
    },
    'es-ES': {
        locale: 'es-ES',
        versandart: 'Por correo certificado con acuse de recibo',
        datum: (d, ort) => (ort ? `En ${ort}, a ${d}` : d),
        betreff: (a) => zeilen(`Asunto: solicitud de baja – ${a.abo}`, a.vertrag && `Número de contrato: ${a.vertrag}`, a.kunde && `Número de cliente: ${a.kunde}`),
        anrede: 'Estimados señores:',
        kern: 'Por la presente les comunico mi decisión de dar de baja el contrato arriba indicado, con efecto en la fecha más próxima posible.',
        bestaetigung: (email) => `Les ruego que me confirmen por escrito${email ? `, en la dirección de correo electrónico ${email},` : ''} la baja y la fecha de finalización del contrato.`,
        gruss: 'Atentamente,',
        linie: UNTERSCHRIFTSLINIE
    },
    'es-LA': {
        locale: 'es-MX',
        versandart: 'Por correo certificado con acuse de recibo',
        datum: (d, ort) => (ort ? `${ort}, ${d}` : d),
        betreff: (a) => zeilen(`Asunto: cancelación de contrato – ${a.abo}`, a.vertrag && `Número de contrato: ${a.vertrag}`, a.kunde && `Número de cliente: ${a.kunde}`),
        anrede: 'A quien corresponda:',
        kern: 'Por medio de la presente solicito la cancelación del contrato arriba indicado, con efecto en la fecha más próxima posible.',
        bestaetigung: (email) => `Les agradeceré que me confirmen por escrito${email ? `, al correo electrónico ${email},` : ''} la cancelación y la fecha de terminación del contrato.`,
        gruss: 'Atentamente,',
        linie: UNTERSCHRIFTSLINIE
    },
    'fr-FR': FRANZOESISCH('Lettre recommandée avec accusé de réception', 'fr-FR'),
    'fr-BE': FRANZOESISCH('Lettre recommandée avec accusé de réception', 'fr-BE'),
    'fr-CH': FRANZOESISCH('Lettre recommandée', 'fr-CH'),
    'fr-CA': FRANZOESISCH('Par courrier recommandé', 'fr-CA'),
    'pt-BR': {
        locale: 'pt-BR',
        versandart: 'Carta registrada com aviso de recebimento (AR)',
        datum: (d, ort) => (ort ? `${ort}, ${d}` : d),
        betreff: (a) => zeilen(`Assunto: solicitação de cancelamento – ${a.abo}`, a.vertrag && `Número do contrato: ${a.vertrag}`, a.kunde && `Número de cliente: ${a.kunde}`),
        anrede: 'Prezados(as) senhores(as),',
        kern: 'Solicito, por meio desta, o cancelamento do contrato acima indicado, com efeito na data mais próxima possível.',
        bestaetigung: (email) => `Peço que confirmem por escrito${email ? `, pelo e-mail ${email},` : ''} o cancelamento e a data de encerramento do contrato.`,
        gruss: 'Atenciosamente,',
        linie: UNTERSCHRIFTSLINIE
    },
    'pt-PT': {
        locale: 'pt-PT',
        versandart: 'Carta registada com aviso de receção',
        datum: (d, ort) => (ort ? `${ort}, ${d}` : d),
        betreff: (a) => zeilen(`Assunto: denúncia do contrato – ${a.abo}`, a.vertrag && `Número do contrato: ${a.vertrag}`, a.kunde && `Número de cliente: ${a.kunde}`),
        anrede: 'Exmos. Senhores,',
        kern: 'Venho por este meio comunicar a denúncia do contrato acima identificado, com efeitos na data mais próxima possível.',
        bestaetigung: (email) => `Agradeço que me confirmem por escrito${email ? `, para o endereço ${email},` : ''} a cessação do contrato e a respetiva data.`,
        gruss: 'Com os melhores cumprimentos,',
        linie: UNTERSCHRIFTSLINIE
    }
};

export const BRIEF_FASSUNGEN = Object.keys(FASSUNGEN);

const STANDARD_REIHENFOLGE = ['absender', 'versandart', 'empfaenger', 'datum', 'betreff', 'anrede', 'kern', 'bestaetigung', 'gruss'];

// Bausteine des Briefs in Reihenfolge: [{ art, text }]. Leere Angaben entfallen.
//   angaben: { absender: [Zeilen], empfaenger, name, email, plzOrt, vertrag, kunde, abo }
//   einschreiben: nur dann steht der Versandvermerk im Brief.
export function briefBloecke(fassung, angaben, heute, einschreiben = false) {
    const f = FASSUNGEN[fassung] || FASSUNGEN['en-GB'];
    // Deutsch: Datum wie bisher TT.MM.JJJJ, sonst ausgeschrieben.
    const datum = fassung === 'de' ? formatiereDatum(heute) : langesDatum(heute, f.locale);
    const bloecke = {
        absender: angaben.absender.filter(Boolean).join('\n'),
        empfaenger: angaben.empfaenger,
        versandart: einschreiben ? f.versandart : '',
        datum: f.datum(datum, ortAus(angaben.plzOrt)),
        betreff: f.betreff(angaben),
        anrede: f.anrede,
        kern: f.kern,
        bestaetigung: f.bestaetigung(angaben.email),
        gruss: f.gruss
    };
    return [
        ...(f.reihenfolge || STANDARD_REIHENFOLGE).map((art) => ({ art, text: bloecke[art] })),
        { art: 'unterschrift', text: `${f.linie}\n${angaben.name}` }
    ].filter((b) => b.text);
}

export const briefText = (bloecke) => bloecke.map((b) => b.text).join('\n\n');

// Der Nutzer hat den Brief von Hand geändert und danach z.B. den Absender oder
// "Einschreiben" umgestellt: nur die betroffenen Bausteine tauschen, eigene
// Änderungen bleiben stehen. alt/neu = Bausteine vorher/nachher.
export function aktualisiereBrief(text, alt, neu) {
    if (text === briefText(alt)) return briefText(neu);
    const finde = (liste, art) => (liste.find((b) => b.art === art) || { text: '' }).text;
    let ergebnis = text;
    for (const { art, text: vorher } of alt) {
        const nachher = finde(neu, art);
        if (vorher === nachher) continue;
        const absaetze = ergebnis.split('\n\n');
        const stelle = absaetze.indexOf(vorher);
        if (stelle >= 0) {
            absaetze.splice(stelle, 1, ...(nachher ? [nachher] : []));
            ergebnis = absaetze.join('\n\n');
        } else if (nachher && vorher.length > 12 && ergebnis.includes(vorher)) {
            ergebnis = ergebnis.replace(vorher, () => nachher);
        }
    }
    neu.forEach(({ art, text: nachher }, i) => {
        if (finde(alt, art)) return;
        // Neuer Baustein: vor den nächsten Baustein, der noch im Brief steht.
        const danach = neu.slice(i + 1).map((b) => ergebnis.indexOf(b.text)).find((p) => p >= 0);
        const p = danach === undefined ? 0 : danach;
        ergebnis = `${ergebnis.slice(0, p)}${nachher}\n\n${ergebnis.slice(p)}`;
    });
    return ergebnis;
}

// Beschriftung der Adressfelder, wo sie vom Grundtext der Sprache abweicht.
const FELDER = {
    // Grundtext Englisch ist amerikanisch (src/i18n/en.js)
    'en-GB': { einschreiben: 'Send by recorded delivery', feldPlzOrt: 'Town and postcode', feldPlzOrtPlatzhalter: 'Sample Town AB1 2CD', platzhalterPlzOrt: '[Town and postcode]' },
    'pt-PT': { einschreiben: 'Por carta registada', feldPlzOrt: 'Código postal e localidade', feldPlzOrtPlatzhalter: '1234-567 Localidade', platzhalterPlzOrt: '[Código postal e localidade]' }
};

export function briefFeld(schluessel, standard, fassung = briefFassung()) {
    return (FELDER[fassung] && FELDER[fassung][schluessel]) || standard;
}
