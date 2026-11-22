/**
 * texterkennung-auswertung.test.js | Vorschläge aus erkanntem Text (Foto einlesen).
 * Lauf: npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { werteTextAus, findeDatum, parseZahl } from '../src/texterkennung-auswertung.js';

const z = (text) => text.trim().split('\n').map((s) => s.trim());

test('Deutsch: Rechnung eines Fitnessstudios', () => {
    const e = werteTextAus(z(`
        FitLife Studios GmbH
        Hauptstraße 12
        10115 Berlin
        Tel. 030 123456
        Rechnung Nr. 2026-1188
        Rechnungsdatum: 01.11.2026
        Kundennummer: KD-448812
        Vertragsnummer 77-1203-55
        Monatsbeitrag Premium 29,90 €
        Gesamtbetrag 29,90 €
        Nächste Abbuchung am 01.12.2026
    `));
    assert.deepEqual(e, {
        name: 'FitLife Studios',
        vertragspartner: 'FitLife Studios GmbH\nHauptstraße 12\n10115 Berlin',
        kosten: 29.9,
        waehrung: 'EUR',
        turnus: 'Monatlich',
        naechsteZahlung: '2026-12-01',
        kundennummer: 'KD-448812',
        vertragsnummer: '77-1203-55'
    });
});

test('Englisch (UK): Bestätigung mit Marke, Jahrespreis und Datum in Worten', () => {
    const e = werteTextAus(z(`
        Welcome to Spotify Premium
        Your plan: Premium Family
        £179.88 per year
        Your subscription renews on 15 March 2027
        Customer number: 55 1290 77
    `));
    assert.equal(e.name, 'Spotify');
    assert.equal(e.kosten, 179.88);
    assert.equal(e.waehrung, 'GBP');
    assert.equal(e.turnus, 'Jährlich');
    assert.equal(e.naechsteZahlung, '2027-03-15');
    assert.equal(e.kundennummer, '55 1290 77');
    assert.equal(e.vertragspartner, undefined);
});

test('Englisch (USA): Datum MM/TT nur mit Region USA', () => {
    const zeilen = z(`
        Adobe Inc.
        345 Park Avenue
        San Jose, CA 95110
        Total due: $22.99
        Billed monthly
        Next billing date: 03/04/2027
    `);
    assert.equal(werteTextAus(zeilen, { monatZuerst: true }).naechsteZahlung, '2027-03-04');
    assert.equal(werteTextAus(zeilen).naechsteZahlung, '2027-04-03');
    const e = werteTextAus(zeilen, { monatZuerst: true });
    assert.equal(e.name, 'Adobe');
    assert.equal(e.vertragspartner, 'Adobe Inc.\n345 Park Avenue\nSan Jose, CA 95110');
    assert.equal(e.kosten, 22.99);
    assert.equal(e.waehrung, 'USD');
    assert.equal(e.turnus, 'Monatlich');
});

test('Spanisch: Factura de seguro', () => {
    const e = werteTextAus(z(`
        Seguros Ejemplo S.A.
        Calle de Alcalá 45
        28014 Madrid
        Número de póliza: POL-2026-8831
        Número de cliente: 0098812
        Importe total: 84,00 €
        Pago anual
        Fecha de vencimiento: 15 de marzo de 2027
    `));
    assert.deepEqual(e, {
        name: 'Seguros Ejemplo',
        vertragspartner: 'Seguros Ejemplo S.A.\nCalle de Alcalá 45\n28014 Madrid',
        kosten: 84,
        waehrung: 'EUR',
        turnus: 'Jährlich',
        naechsteZahlung: '2027-03-15',
        kundennummer: '0098812',
        vertragsnummer: 'POL-2026-8831'
    });
});

test('Französisch: Facture d’abonnement', () => {
    const e = werteTextAus(z(`
        Presse Exemple SARL
        12 rue de la Paix
        75002 Paris
        N° client : C-77812
        Numéro de contrat : AB 4410
        Abonnement mensuel
        Montant total : 1 299,00 €
        Prochain prélèvement le 05/12/2026
    `));
    assert.equal(e.name, 'Presse Exemple');
    assert.equal(e.vertragspartner, 'Presse Exemple SARL\n12 rue de la Paix\n75002 Paris');
    assert.equal(e.kundennummer, 'C-77812');
    assert.equal(e.vertragsnummer, 'AB 4410');
    assert.equal(e.turnus, 'Monatlich');
    assert.equal(e.kosten, 1299);
    assert.equal(e.naechsteZahlung, '2026-12-05');
});

test('Portugiesisch (Brasil): Fatura com CEP e R$', () => {
    const e = werteTextAus(z(`
        Academia Exemplo Ltda.
        Rua das Flores, 100
        01310-100 São Paulo - SP
        Número do contrato: 556677
        Código do cliente: 8812
        Mensalidade: R$ 119,90
        Valor total: R$ 119,90
        Próximo pagamento: 10/12/2026
    `));
    assert.equal(e.name, 'Academia Exemplo');
    assert.equal(e.vertragspartner, 'Academia Exemplo Ltda.\nRua das Flores, 100\n01310-100 São Paulo - SP');
    assert.equal(e.vertragsnummer, '556677');
    assert.equal(e.kundennummer, '8812');
    assert.equal(e.kosten, 119.9);
    assert.equal(e.waehrung, 'BRL');
    assert.equal(e.naechsteZahlung, '2026-12-10');
});

test('Unsicheres bleibt leer: mehrere Beträge ohne Summe, mehrere Turnusse, Datum ohne Beschriftung', () => {
    const e = werteTextAus(z(`
        Angebot
        Paket S 9,99 € monatlich
        Paket L 99,00 € jährlich
        Stand: 01.11.2026
    `));
    assert.deepEqual(e, {});
});

test('Nichts erkannt: leerer oder unleserlicher Text', () => {
    assert.deepEqual(werteTextAus([]), {});
    assert.deepEqual(werteTextAus(['', '  ', '~~ ## ..']), {});
    assert.deepEqual(werteTextAus('xx yy zz'), {});
});

test('Zwei verschiedene Kundennummern: keine Auswahl', () => {
    const e = werteTextAus(z(`
        Kundennummer: 111222
        Kundennummer: 333444
    `));
    assert.equal(e.kundennummer, undefined);
});

test('Beschriftung allein, Wert in der nächsten Zeile', () => {
    const e = werteTextAus(z(`
        Vertragsnummer
        VN-55-8812
    `));
    assert.equal(e.vertragsnummer, 'VN-55-8812');
});

test('Zahlart PayPal ist kein Anbietername, Rechnungsdatum ist keine nächste Zahlung', () => {
    const e = werteTextAus(z(`
        Bezahlt mit PayPal
        Rechnungsdatum 01.11.2026
        Betrag 4,99 €
    `));
    assert.equal(e.name, undefined);
    assert.equal(e.naechsteZahlung, undefined);
    assert.equal(e.kosten, 4.99);
});

test('"vierteljährlich" wird nicht als "jährlich" erkannt', () => {
    assert.equal(werteTextAus(['Zahlweise: vierteljährlich']).turnus, 'Vierteljährlich');
    assert.equal(werteTextAus(['Zahlweise: halbjährlich']).turnus, 'Halbjährlich');
    assert.equal(werteTextAus(['Kündigungsfrist 3 Monate']).turnus, undefined);
});

test('parseZahl: deutsche, englische und Tausender-Schreibweisen', () => {
    assert.equal(parseZahl('29,90'), 29.9);
    assert.equal(parseZahl('29.90'), 29.9);
    assert.equal(parseZahl('1.299,00'), 1299);
    assert.equal(parseZahl('1,299.00'), 1299);
    assert.equal(parseZahl('1 299,00'), 1299);
    assert.equal(parseZahl('1.299'), 1299);
    assert.equal(parseZahl('84'), 84);
});

test('findeDatum: Formate in allen Sprachen, ungültige Daten nie', () => {
    const iso = (d) => d && `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    assert.equal(iso(findeDatum('am 1. Dezember 2026')), '2026-12-01');
    assert.equal(iso(findeDatum('15. März 2027')), '2027-03-15');
    assert.equal(iso(findeDatum('March 15, 2027')), '2027-03-15');
    assert.equal(iso(findeDatum('15 de marzo de 2027')), '2027-03-15');
    assert.equal(iso(findeDatum('le 15 mars 2027')), '2027-03-15');
    assert.equal(iso(findeDatum('15 de março de 2027')), '2027-03-15');
    assert.equal(iso(findeDatum('2027-03-15')), '2027-03-15');
    assert.equal(iso(findeDatum('15.03.27')), '2027-03-15');
    assert.equal(iso(findeDatum('25/03/2027', { monatZuerst: true })), '2027-03-25', 'Tag > 12 ist eindeutig');
    assert.equal(findeDatum('31.02.2027'), null);
    assert.equal(findeDatum('kein Datum'), null);
});

// --- Ab 2.0.2: vergangenes Datum (Rechnung) -> nächste Zahlung nach Turnus ---
import { vorschlagNaechsteZahlung } from '../src/texterkennung-auswertung.js';
import { naechsteZahlungAb } from '../src/calculator.js';

const HEUTE = new Date(2026, 10, 16); // 16.11.2026

test('Rechnungsdatum wird als letzte Zahlung erkannt (nicht als nächste)', () => {
    const e = werteTextAus(z(`
        Rechnungsdatum 01.11.2026
        Betrag 9,99 €
        monatlich
    `));
    assert.equal(e.naechsteZahlung, undefined);
    assert.equal(e.letzteZahlung, '2026-11-01');
});

test('Rechnungsdatum in EN/ES/FR/PT', () => {
    assert.equal(werteTextAus(['Invoice date: 05/10/2026']).letzteZahlung, '2026-10-05');
    assert.equal(werteTextAus(['Fecha de factura: 03/09/2026']).letzteZahlung, '2026-09-03');
    assert.equal(werteTextAus(['Date de facture : 12/08/2026']).letzteZahlung, '2026-08-12');
    assert.equal(werteTextAus(['Data da fatura: 20/10/2026']).letzteZahlung, '2026-10-20');
});

test('Nennt der Text die nächste Zahlung, wird kein Rechnungsdatum genommen', () => {
    const e = werteTextAus(['Rechnungsdatum 01.11.2026', 'Nächste Zahlung 01.12.2026']);
    assert.equal(e.naechsteZahlung, '2026-12-01');
    assert.equal(e.letzteZahlung, undefined);
});

test('Vergangene Zahlung wird je Turnus auf die nächste vorgerückt', () => {
    assert.deepEqual(vorschlagNaechsteZahlung({ letzteZahlung: '2026-11-01' }, 'Monatlich', HEUTE), { datum: '2026-12-01', original: '2026-11-01', vorgerueckt: true });
    assert.equal(vorschlagNaechsteZahlung({ letzteZahlung: '2026-10-01' }, 'Vierteljährlich', HEUTE).datum, '2027-01-01');
    assert.equal(vorschlagNaechsteZahlung({ letzteZahlung: '2026-03-20' }, 'Halbjährlich', HEUTE).datum, '2027-03-20');
    assert.equal(vorschlagNaechsteZahlung({ letzteZahlung: '2025-12-02' }, 'Jährlich', HEUTE).datum, '2026-12-02');
    // Mehrere Schritte (Rechnung von vor Monaten)
    assert.equal(vorschlagNaechsteZahlung({ letzteZahlung: '2026-06-10' }, 'Monatlich', HEUTE).datum, '2026-12-10');
});

test('Monatsende wandert nicht ab (31.01. -> 28.02. -> 31.03.)', () => {
    assert.equal(naechsteZahlungAb('2026-01-31', 'Monatlich', new Date(2026, 1, 10)), '2026-02-28');
    assert.equal(naechsteZahlungAb('2026-01-31', 'Monatlich', new Date(2026, 2, 5)), '2026-03-31');
    assert.equal(naechsteZahlungAb('2024-02-29', 'Jährlich', new Date(2025, 0, 1)), '2025-02-28');
});

test('Heutiges oder künftiges Datum bleibt unverändert', () => {
    assert.deepEqual(vorschlagNaechsteZahlung({ naechsteZahlung: '2026-11-16' }, 'Monatlich', HEUTE), { datum: '2026-11-16', original: '2026-11-16', vorgerueckt: false });
    assert.equal(vorschlagNaechsteZahlung({ naechsteZahlung: '2027-01-05' }, 'Jährlich', HEUTE).vorgerueckt, false);
    assert.equal(vorschlagNaechsteZahlung({}, 'Monatlich', HEUTE), null);
    assert.equal(naechsteZahlungAb('kein Datum', 'Monatlich', HEUTE), '');
});

test('Vergangene "nächste Zahlung" (z. B. "Payment date") wird ebenfalls vorgerückt', () => {
    assert.equal(vorschlagNaechsteZahlung({ naechsteZahlung: '2026-11-03' }, 'Monatlich', HEUTE).datum, '2026-12-03');
});

test('Anschrift: Straßen und Orte mit "ust", "vat", "fax", "bic" werden erkannt', () => {
    for (const [strasse, ort] of [
        ['Industriestraße 5', '12345 Berlin'], ['Auguststraße 12', '12345 Musterstadt'], ['Augustinerplatz 1', '79098 Freiburg'],
        ['Privatweg 3', '10115 Berlin'], ['Halifaxstraße 2', '52078 Aachen'], ['Bickenbacher Weg 4', '64404 Bickenbach'],
        ['Steuerwaldstraße 9', '31137 Hildesheim'], ['Hotel am Markt 2', '10115 Berlin'], ['Rue Auguste Comte 7', '69002 Lyon']
    ]) {
        const e = werteTextAus(['Testfirma GmbH', strasse, ort, 'Kundennummer: K-45678']);
        assert.equal(e.vertragspartner, `Testfirma GmbH\n${strasse}\n${ort}`, strasse);
    }
});

test('Firmenname mit "bic"/"iban" im Wort bleibt ein Firmenname', () => {
    assert.equal(werteTextAus(['Arabica Kaffee GmbH', 'Hauptstraße 1', '10115 Berlin']).name, 'Arabica Kaffee');
});

test('Echte Kontakt-, Bank- und Steuerzeilen beenden die Anschrift weiterhin', () => {
    for (const zeile of [
        'Tel. 030 123456', 'Tel 030 123456', 'Telefon: 030 1', 'Telefax 030 1', 'Teléfono: 91', 'Téléphone : 01', 'Tél. 01', 'Télécopie 01', 'Telefone: 11', 'Phone 020', 'Telephone 020', 'Mobile phone 07',
        'Fax: 030 2', 'IBAN DE00 0000', 'BIC ABCDEF', 'USt-IdNr. DE1', 'UStIdNr: DE1', 'USt-ID DE1', 'Steuernummer 12/3', 'Steuer-Nr. 12/3', 'Umsatzsteuer-ID DE1', 'VAT No. GB1',
        'info@example.com', 'www.example.com'
    ]) {
        const e = werteTextAus(['Testfirma GmbH', zeile, '10115 Berlin', 'Kundennummer: K-45678']);
        assert.equal(e.vertragspartner, undefined, zeile);
        assert.equal(e.name, 'Testfirma', zeile);
    }
});
