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
