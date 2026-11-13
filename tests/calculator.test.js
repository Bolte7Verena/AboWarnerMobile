/**
 * calculator.test.js | Echte, ausführbare Unit-Tests für die reine
 * Geschäftslogik — bewusst mit relativen Datumsangaben (aus new Date()
 * berechnet), NIEMALS mit hart einprogrammierten Kalenderdaten: eine lange
 * Session/ein späterer Testlauf lässt reale Zeit vergehen, wodurch ein hart
 * codiertes "heute" zu falschen Testergebnissen führt (siehe die Lektion
 * aus der Windows-App-Session, PROJECT_STATUS.md/feedback_electron_testing).
 *
 * Lauf: npm test (node --test tests/)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { Calculator, TURNUS_MONATE, ermittleEffektivesZahlungsdatum, parseBetrag, formatiereZahlDE, formatiereBetrag, formatiereDatumDE, formatiereDatumISO, parseDatumISO, ermittleKuendigungsfrist, istGekuendigtLaufend, istVertragBeendet, schlageVertragsendeVor } from '../src/calculator.js';

function heutePlusTage(tage) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + tage);
    return d;
}

function zuISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

test('TURNUS_MONATE enthält alle vier Turnusse mit korrekten Monatszahlen', () => {
    assert.equal(TURNUS_MONATE['Monatlich'], 1);
    assert.equal(TURNUS_MONATE['Vierteljährlich'], 3);
    assert.equal(TURNUS_MONATE['Halbjährlich'], 6);
    assert.equal(TURNUS_MONATE['Jährlich'], 12);
});

test('konvertiereZuEUR: EUR bleibt unverändert, unbekannte Währung fällt auf Kurs 1.0 zurück', () => {
    assert.equal(Calculator.konvertiereZuEUR(10, 'EUR'), 10);
    assert.equal(Calculator.konvertiereZuEUR(10, 'XYZ'), 10);
});

test('konvertiereZuEUR: USD wird mit dem hinterlegten Kurs umgerechnet', () => {
    const ergebnis = Calculator.konvertiereZuEUR(100, 'USD');
    assert.ok(ergebnis > 0 && ergebnis < 100, `USD->EUR sollte < 100 sein, war ${ergebnis}`);
});

test('berechneMonatsSumme: monatliches und jährliches Abo korrekt anteilig summiert', () => {
    const abos = [
        { kosten: 10, waehrung: 'EUR', turnus: 'Monatlich' },
        { kosten: 24, waehrung: 'EUR', turnus: 'Jährlich' } // 24/12 = 2 pro Monat
    ];
    assert.equal(Calculator.berechneMonatsSumme(abos), 12);
});

test('berechneJahresSumme: exakt das 12-fache der Monatssumme', () => {
    const abos = [{ kosten: 10, waehrung: 'EUR', turnus: 'Monatlich' }];
    assert.equal(Calculator.berechneJahresSumme(abos), 120);
});

test('istGueltig: vollständiges, korrektes Abo wird akzeptiert', () => {
    const abo = {
        name: 'Netflix',
        kosten: 14.99,
        waehrung: 'EUR',
        turnus: 'Monatlich',
        naechsteZahlung: zuISO(heutePlusTage(10)),
        kuendigungsfristTage: 30
    };
    assert.equal(Calculator.istGueltig(abo), true);
});

test('istGueltig: leerer Name wird abgelehnt', () => {
    const abo = { name: '   ', kosten: 5, waehrung: 'EUR', turnus: 'Monatlich', naechsteZahlung: zuISO(heutePlusTage(1)), kuendigungsfristTage: 1 };
    assert.equal(Calculator.istGueltig(abo), false);
});

test('istGueltig: negative Kosten werden abgelehnt', () => {
    const abo = { name: 'Test', kosten: -1, waehrung: 'EUR', turnus: 'Monatlich', naechsteZahlung: zuISO(heutePlusTage(1)), kuendigungsfristTage: 1 };
    assert.equal(Calculator.istGueltig(abo), false);
});

test('istGueltig: unbekannter Turnus wird abgelehnt', () => {
    const abo = { name: 'Test', kosten: 5, waehrung: 'EUR', turnus: 'Wöchentlich', naechsteZahlung: zuISO(heutePlusTage(1)), kuendigungsfristTage: 1 };
    assert.equal(Calculator.istGueltig(abo), false);
});

test('istGueltig: ungültiges Datum wird abgelehnt', () => {
    const abo = { name: 'Test', kosten: 5, waehrung: 'EUR', turnus: 'Monatlich', naechsteZahlung: 'kein-datum', kuendigungsfristTage: 1 };
    assert.equal(Calculator.istGueltig(abo), false);
});

// --- ermittleEffektivesZahlungsdatum: der "-22 Tage"-Bugfix aus der Windows-App ---

test('ermittleEffektivesZahlungsdatum: zukünftiges Datum bleibt unverändert', () => {
    const zukunft = heutePlusTage(15);
    const ergebnis = ermittleEffektivesZahlungsdatum(zuISO(zukunft), 'Monatlich');
    assert.equal(zuISO(ergebnis), zuISO(zukunft));
});

test('ermittleEffektivesZahlungsdatum: verstrichenes monatliches Datum wird auf die Zukunft vorgerückt (nie negativ)', () => {
    const vergangenheit = heutePlusTage(-40); // eindeutig überfällig
    const ergebnis = ermittleEffektivesZahlungsdatum(zuISO(vergangenheit), 'Monatlich');
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    assert.ok(ergebnis >= heute, `Vorgerücktes Datum (${zuISO(ergebnis)}) muss >= heute sein`);
});

test('ermittleEffektivesZahlungsdatum: vorgerücktes Datum liegt exakt auf einem Turnus-Vielfachen des Ursprungsdatums', () => {
    const ursprung = heutePlusTage(-100);
    const ergebnis = ermittleEffektivesZahlungsdatum(zuISO(ursprung), 'Monatlich');
    const differenzTage = Math.round((ergebnis - ursprung) / (1000 * 60 * 60 * 24));
    // Differenz muss ein ganzzahliges Vielfaches von ~1 Monat sein (28-31 Tage je nach Monat) —
    // wir prüfen stattdessen robust über Monatsdifferenz statt Tage, da Monate ungleich lang sind.
    const monatsDifferenz = (ergebnis.getFullYear() - ursprung.getFullYear()) * 12 + (ergebnis.getMonth() - ursprung.getMonth());
    assert.ok(monatsDifferenz >= 0 && Number.isInteger(monatsDifferenz), `Monatsdifferenz sollte ganzzahlig sein, war ${monatsDifferenz}`);
    assert.equal(ergebnis.getDate(), ursprung.getDate(), 'Der Tag im Monat muss beim Vorrücken erhalten bleiben');
});

test('ermittleEffektivesZahlungsdatum: heutiges Datum bleibt unverändert (Grenzfall)', () => {
    const heute = heutePlusTage(0);
    const ergebnis = ermittleEffektivesZahlungsdatum(zuISO(heute), 'Jährlich');
    assert.equal(zuISO(ergebnis), zuISO(heute));
});

test('ermittleEffektivesZahlungsdatum: unbekannter Turnus fällt auf monatliches Vorrücken zurück (kein Absturz)', () => {
    const vergangenheit = heutePlusTage(-5);
    assert.doesNotThrow(() => ermittleEffektivesZahlungsdatum(zuISO(vergangenheit), 'Unbekannt'));
});

// --- parseBetrag/formatiereZahlDE/formatiereBetrag: deutsches Komma als Dezimaltrennzeichen ---

test('parseBetrag: deutsches Komma wird korrekt als Dezimaltrennzeichen interpretiert', () => {
    assert.equal(parseBetrag('29,99'), 29.99);
});

test('parseBetrag: Punkt als Dezimaltrennzeichen funktioniert weiterhin', () => {
    assert.equal(parseBetrag('29.99'), 29.99);
});

test('parseBetrag: Tausenderpunkt + Komma-Dezimalstelle ("1.234,56")', () => {
    assert.equal(parseBetrag('1.234,56'), 1234.56);
});

test('parseBetrag: ganzzahlige Eingabe ohne Trennzeichen', () => {
    assert.equal(parseBetrag('30'), 30);
});

test('parseBetrag: bereits numerischer Wert wird unverändert durchgereicht', () => {
    assert.equal(parseBetrag(14.99), 14.99);
});

test('parseBetrag: nicht-numerischer Text ergibt NaN (für Validierung)', () => {
    assert.ok(isNaN(parseBetrag('abc')));
});

test('formatiereZahlDE: formatiert mit Komma und immer 2 Nachkommastellen', () => {
    assert.equal(formatiereZahlDE(29.9), '29,90');
    assert.equal(formatiereZahlDE(5), '5,00');
});

test('formatiereBetrag: hängt die Währung an, Komma statt Punkt', () => {
    assert.equal(formatiereBetrag(14.99, 'EUR'), '14,99 EUR');
});

test('formatiereBetrag: fehlende Währung fällt auf EUR zurück', () => {
    assert.equal(formatiereBetrag(5, undefined), '5,00 EUR');
});

test('Round-Trip: parseBetrag(formatiereZahlDE(x)) liefert wieder x', () => {
    const wert = 1234.56;
    assert.equal(parseBetrag(formatiereZahlDE(wert)), wert);
});

// --- Datumsformat: Anzeige überall deutsch (TT.MM.JJJJ), Speicherung weiter ISO ---

test('formatiereDatumDE: ISO-String wird als TT.MM.JJJJ angezeigt', () => {
    assert.equal(formatiereDatumDE('2026-11-15'), '15.11.2026');
    assert.equal(formatiereDatumDE('2027-01-05'), '05.01.2027');
});

test('formatiereDatumDE: Date-Objekt wird als TT.MM.JJJJ angezeigt', () => {
    assert.equal(formatiereDatumDE(new Date(2026, 1, 3)), '03.02.2026');
});

test('formatiereDatumDE: ungültige Eingabe liefert leeren Text statt "NaN"', () => {
    assert.equal(formatiereDatumDE('kein-datum'), '');
    assert.equal(formatiereDatumDE(undefined), '');
});

test('parseDatumISO: liefert lokales Datum ohne Zeitzonen-Verschiebung auf den Vortag', () => {
    const d = parseDatumISO('2026-03-01');
    assert.equal(d.getFullYear(), 2026);
    assert.equal(d.getMonth(), 2);
    assert.equal(d.getDate(), 1);
});

test('formatiereDatumISO: Round-Trip mit parseDatumISO', () => {
    assert.equal(formatiereDatumISO(parseDatumISO('2026-12-31')), '2026-12-31');
});

// --- ermittleKuendigungsfrist: "Kündigung möglich bis [Datum]" ---

test('ermittleKuendigungsfrist: Frist = nächste Zahlung minus Kündigungsfrist', () => {
    const abo = { naechsteZahlung: zuISO(heutePlusTage(40)), turnus: 'Monatlich', kuendigungsfristTage: 30 };
    const ergebnis = ermittleKuendigungsfrist(abo);
    assert.equal(zuISO(ergebnis.fristDatum), zuISO(heutePlusTage(10)));
    assert.equal(zuISO(ergebnis.zahlungsDatum), zuISO(heutePlusTage(40)));
});

test('ermittleKuendigungsfrist: Frist heute zählt noch als möglich', () => {
    const abo = { naechsteZahlung: zuISO(heutePlusTage(14)), turnus: 'Monatlich', kuendigungsfristTage: 14 };
    assert.equal(zuISO(ermittleKuendigungsfrist(abo).fristDatum), zuISO(heutePlusTage(0)));
});

test('ermittleKuendigungsfrist: verpasste Frist rückt auf die Frist vor der übernächsten Zahlung (nie Vergangenheit)', () => {
    const naechste = heutePlusTage(20);
    const abo = { naechsteZahlung: zuISO(naechste), turnus: 'Monatlich', kuendigungsfristTage: 30 };
    const ergebnis = ermittleKuendigungsfrist(abo);
    const erwarteteZahlung = new Date(naechste);
    erwarteteZahlung.setMonth(erwarteteZahlung.getMonth() + 1);
    const erwarteteFrist = new Date(erwarteteZahlung);
    erwarteteFrist.setDate(erwarteteFrist.getDate() - 30);
    assert.equal(zuISO(ergebnis.zahlungsDatum), zuISO(erwarteteZahlung));
    assert.equal(zuISO(ergebnis.fristDatum), zuISO(erwarteteFrist));
    assert.ok(ergebnis.fristDatum >= heutePlusTage(0));
});

test('ermittleKuendigungsfrist: lange Frist bei jährlichem Turnus', () => {
    const abo = { naechsteZahlung: zuISO(heutePlusTage(200)), turnus: 'Jährlich', kuendigungsfristTage: 90 };
    assert.equal(zuISO(ermittleKuendigungsfrist(abo).fristDatum), zuISO(heutePlusTage(110)));
});

test('ermittleKuendigungsfrist: ungültige Daten liefern null statt Absturz', () => {
    assert.equal(ermittleKuendigungsfrist({ naechsteZahlung: 'kein-datum', turnus: 'Monatlich', kuendigungsfristTage: 30 }), null);
    assert.equal(ermittleKuendigungsfrist({ naechsteZahlung: zuISO(heutePlusTage(5)), turnus: 'Monatlich', kuendigungsfristTage: NaN }), null);
});

// --- Gekündigte Verträge: laufen bis zum Vertragsende weiter ---

test('istGekuendigtLaufend: gekündigt mit Vertragsende in der Zukunft läuft noch', () => {
    const abo = { gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(20)) };
    assert.equal(istGekuendigtLaufend(abo), true);
    assert.equal(istVertragBeendet(abo), false);
});

test('istGekuendigtLaufend: am Tag des Vertragsendes läuft es noch, am Tag danach ist es beendet', () => {
    assert.equal(istGekuendigtLaufend({ gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(0)) }), true);
    assert.equal(istVertragBeendet({ gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(-1)) }), true);
});

test('istVertragBeendet: altes gekündigtes Abo ohne Datum (vor 2.0.2) gilt wie bisher als beendet', () => {
    assert.equal(istVertragBeendet({ gekuendigt: true }), true);
    assert.equal(istGekuendigtLaufend({ gekuendigt: true }), false);
});

test('istVertragBeendet: nicht gekündigtes Abo ist nie beendet', () => {
    assert.equal(istVertragBeendet({ gekuendigt: false, gekuendigtZum: zuISO(heutePlusTage(-5)) }), false);
    assert.equal(istVertragBeendet({}), false);
});

test('schlageVertragsendeVor: Tag vor der ersten Zahlung, die durch rechtzeitige Kündigung wegfällt', () => {
    const abo = { naechsteZahlung: zuISO(heutePlusTage(40)), turnus: 'Monatlich', kuendigungsfristTage: 30 };
    assert.equal(zuISO(schlageVertragsendeVor(abo)), zuISO(heutePlusTage(39)));
});
