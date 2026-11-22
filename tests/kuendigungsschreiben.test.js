/**
 * kuendigungsschreiben.test.js | Unit-Tests für den reinen Text des
 * Kündigungsschreibens (ohne DOM). Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { erzeugeSchreibenText } from '../src/kuendigungsschreiben.js';
import { setzeSprache, t } from '../src/i18n.js';
import { briefFassung, ortAus, BRIEF_FASSUNGEN } from '../src/briefe.js';

const HEUTE = new Date(2026, 10, 13); // 13.11.2026, nur für die Datumszeile

const ABSENDER = { name: 'Max Mustermann', strasse: 'Musterstraße 1', plzOrt: '12345 Musterstadt', email: 'max@example.org' };

test('Schreiben übernimmt Vertragspartner, Vertragsnummer und Kundennummer aus dem Abo', () => {
    const abo = {
        name: 'FitLife',
        vertragspartner: 'FitLife GmbH\nKündigungsabteilung\nSportweg 5\n54321 Fitstadt',
        vertragsnummer: 'V-123',
        kundennummer: 'K-987'
    };
    const text = erzeugeSchreibenText(abo, ABSENDER, HEUTE);
    assert.ok(text.includes('FitLife GmbH\nKündigungsabteilung\nSportweg 5\n54321 Fitstadt'));
    assert.ok(text.includes('Kündigung: FitLife\nVertragsnummer: V-123\nKundennummer: K-987'));
    assert.ok(text.includes('13.11.2026'));
    assert.ok(text.includes('per E-Mail an max@example.org'));
    assert.ok(text.startsWith('Max Mustermann\nMusterstraße 1\n12345 Musterstadt\nmax@example.org'));
});

test('Altes Abo ohne neue Felder: kein "undefined", keine leeren Bezugszeilen, Empfänger = Abo-Name', () => {
    const abo = { name: 'Netflix', naechsteZahlung: '2027-01-01', turnus: 'Monatlich', kuendigungsfristTage: 0 };
    const text = erzeugeSchreibenText(abo, ABSENDER, HEUTE);
    assert.ok(!text.includes('undefined'));
    assert.ok(!text.includes('Vertragsnummer'));
    assert.ok(!text.includes('Kundennummer'));
    assert.ok(text.includes('\n\nNetflix\n\n'));
});

test('Ohne E-Mail: Bestätigung "schriftlich", keine leere E-Mail-Zeile im Absender', () => {
    const text = erzeugeSchreibenText({ name: 'X' }, { ...ABSENDER, email: '' }, HEUTE);
    assert.ok(text.includes('schriftlich.'));
    assert.ok(text.startsWith('Max Mustermann\nMusterstraße 1\n12345 Musterstadt\n\n'));
});

test('Fehlende Absenderdaten werden als Platzhalter markiert', () => {
    const text = erzeugeSchreibenText({ name: 'X' }, {}, HEUTE);
    assert.ok(text.includes('[Dein Name]'));
    assert.ok(text.includes('[Straße und Hausnummer]'));
    assert.ok(text.includes('[PLZ und Ort]'));
});

test('Kündigung zum nächstmöglichen Zeitpunkt (kein falsches Vertragsende-Datum)', () => {
    const text = erzeugeSchreibenText({ name: 'X' }, ABSENDER, HEUTE);
    assert.ok(text.includes('fristgerecht zum nächstmöglichen Zeitpunkt'));
});

// --- Fassungen je Land (briefe.js, ab 2.0.2) ---

const ABO = { name: 'FitLife', vertragspartner: 'FitLife Ltd\n5 Gym Road\nSample City', vertragsnummer: 'V-123', kundennummer: 'K-987' };
const PERSON = { name: 'Ana Silva', strasse: 'Rua 1', plzOrt: '12345 Sample City', email: 'ana@example.org' };
const brief = (fassung, abo = ABO, person = PERSON, heute = HEUTE) => {
    setzeSprache(fassung.slice(0, 2));
    const text = erzeugeSchreibenText(abo, person, heute, fassung);
    setzeSprache('de');
    return text;
};

test('Fassung folgt App-Sprache und Land', () => {
    for (const [sprache, region, erwartet] of [['de', 'de-AT', 'de'], ['en', 'en-GB', 'en-GB'], ['en', 'en-IE', 'en-GB'], ['en', 'en-US', 'en-US'], ['en', 'en-CA', 'en-US'], ['es', 'es-ES', 'es-ES'], ['es', 'es-MX', 'es-LA'], ['es', 'es-US', 'es-LA'], ['fr', 'fr-FR', 'fr-FR'], ['fr', 'fr-CH', 'fr-CH'], ['fr', 'fr-CA', 'fr-CA'], ['fr', 'fr-LU', 'fr-FR'], ['pt', 'pt-BR', 'pt-BR'], ['pt', 'pt-PT', 'pt-PT']]) {
        assert.equal(briefFassung(sprache, region), erwartet, `${sprache} ${region}`);
    }
});

test('Deutsch: Brief unverändert wie bisher', () => {
    setzeSprache('de');
    assert.equal(erzeugeSchreibenText({ ...ABO, vertragspartner: 'FitLife GmbH' }, ABSENDER, HEUTE, 'de'), [
        'Max Mustermann\nMusterstraße 1\n12345 Musterstadt\nmax@example.org', 'FitLife GmbH', '13.11.2026',
        'Kündigung: FitLife\nVertragsnummer: V-123\nKundennummer: K-987', 'Sehr geehrte Damen und Herren,',
        'hiermit kündige ich den oben genannten Vertrag fristgerecht zum nächstmöglichen Zeitpunkt.',
        'Bitte bestätigen Sie mir die Kündigung und das Vertragsende per E-Mail an max@example.org.',
        'Mit freundlichen Grüßen', 'Max Mustermann'
    ].join('\n\n'));
});

test('Englisch (GB): Datum ausgeschrieben, Betreff nach der Anrede, "Yours faithfully"', () => {
    assert.equal(brief('en-GB'), [
        'Ana Silva\nRua 1\n12345 Sample City\nana@example.org', ABO.vertragspartner, '13 November 2026', 'Dear Sir or Madam,',
        'Cancellation of my contract: FitLife\nContract number: V-123\nCustomer number: K-987',
        'I am writing to give notice that I wish to cancel the above contract with effect from the earliest possible date.',
        'Please confirm the cancellation and the end date of the contract in writing by email to ana@example.org.',
        'Yours faithfully,', '_______________________\nAna Silva'
    ].join('\n\n'));
});

test('Englisch (US): Datum vor Empfänger, "To Whom It May Concern", "Sincerely"', () => {
    const teile = brief('en-US').split('\n\n');
    assert.equal(teile[1], 'November 13, 2026');
    assert.equal(teile[2], ABO.vertragspartner);
    assert.ok(teile[3].startsWith('Re: Cancellation of FitLife'));
    assert.equal(teile[4], 'To Whom It May Concern:');
    assert.equal(teile[7], 'Sincerely,');
});

test('Französisch: Einschreiben-Hinweis, Ort und Datum, Objet, Schlussformel', () => {
    const teile = brief('fr-FR').split('\n\n');
    assert.equal(teile[2], 'Lettre recommandée avec accusé de réception');
    assert.equal(teile[3], 'Sample City, le 13 novembre 2026');
    assert.ok(teile[4].startsWith('Objet\u00a0: résiliation du contrat – FitLife'));
    assert.equal(teile[5], 'Madame, Monsieur,');
    assert.ok(teile[8].startsWith('Je vous prie d’agréer'));
    assert.ok(brief('fr-FR', ABO, PERSON, new Date(2026, 11, 1)).includes('le 1er décembre 2026'));
    assert.ok(brief('fr-CH').includes('Lettre recommandée\n'));
    assert.ok(brief('fr-CA').includes('Par courrier recommandé'));
});

test('Spanisch: Spanien und Lateinamerika', () => {
    const es = brief('es-ES');
    assert.ok(es.includes('En Sample City, a 13 de noviembre de 2026') && es.includes('Asunto: solicitud de baja – FitLife') && es.includes('dar de baja el contrato'));
    const la = brief('es-LA');
    assert.ok(la.includes('Sample City, 13 de noviembre de 2026') && la.includes('A quien corresponda:') && la.includes('solicito la cancelación'));
});

test('Portugiesisch: Brasilien und Portugal', () => {
    const br = brief('pt-BR');
    assert.ok(br.includes('Sample City, 13 de novembro de 2026') && br.includes('Assunto: solicitação de cancelamento – FitLife') && br.includes('Solicito, por meio desta, o cancelamento') && br.includes('Atenciosamente,'));
    const pt = brief('pt-PT');
    assert.ok(pt.includes('Exmos. Senhores,') && pt.includes('denúncia do contrato') && pt.includes('Com os melhores cumprimentos,'));
});

test('Alle Fassungen: vollständig, ohne deutsches Recht, ohne leere Teile', () => {
    for (const f of BRIEF_FASSUNGEN) {
        for (const [abo, person] of [[ABO, PERSON], [{ name: 'X' }, { ...PERSON, email: '' }], [{ name: 'X' }, {}]]) {
            const text = brief(f, abo, person);
            assert.ok(!/undefined|null|\n\n\n|, ,|\.\.|\s,/.test(text), `${f}: ${text}`);
            assert.ok(text.includes('2026'), f);
            if (f !== 'de') assert.ok(!/§|BGB|fristgerecht|Kündigung|Sehr geehrte|Grüßen/.test(text), f);
        }
        const voll = brief(f);
        for (const w of ['Ana Silva', 'Rua 1', 'ana@example.org', 'FitLife Ltd', 'V-123', 'K-987']) assert.ok(voll.includes(w), `${f}: ${w}`);
        assert.ok(voll.endsWith('Ana Silva'), f);
        const ohne = brief(f, { name: 'X' }, { ...PERSON, email: '' });
        assert.ok(!ohne.includes('@'), f);
    }
});

test('Ort aus der Adresszeile, Unsicheres bleibt leer', () => {
    for (const [zeile, ort] of [['12345 Musterstadt', 'Musterstadt'], ['75001 Paris', 'Paris'], ['01000-000 São Paulo', 'São Paulo'], ['São Paulo - SP, 01000-000', 'São Paulo - SP'], ['1234-567 Vila Nova', 'Vila Nova'], ['CH-8000 Zürich', 'Zürich'], ['Ciudad de México', 'Ciudad de México'], ['London SW1A 1AA', ''], ['', ''], [undefined, ''], ['12345', '']]) {
        assert.equal(ortAus(zeile), ort, String(zeile));
    }
    assert.ok(brief('es-ES', ABO, { ...PERSON, plzOrt: '' }).includes('\n\n13 de noviembre de 2026\n\n'));
    assert.ok(brief('fr-FR', ABO, { ...PERSON, plzOrt: '' }).includes('\n\nLe 13 novembre 2026\n\n'));
});

test('Französisch: "bis zum" statt "vor dem" (jusqu’au) auf Karte, Hinweis und PDF', () => {
    setzeSprache('fr');
    assert.equal(t('karte.moeglichBis', { datum: '27/11/2026' }), 'Résilier jusqu’au 27/11/2026');
    assert.ok(!/avant le/.test(t('hinweis.zeile') + t('pdf.spalteKuendigung')));
    setzeSprache('de');
});
