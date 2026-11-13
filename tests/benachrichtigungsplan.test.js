/**
 * benachrichtigungsplan.test.js | Welche nativen Benachrichtigungen geplant
 * werden (reine Berechnung, ohne Capacitor). Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { berechneBenachrichtigungsPlan, hasheZuId, MAX_BENACHRICHTIGUNGEN, ermittleAbosImRotenBereich } from '../src/benachrichtigungsplan.js';
import { t } from '../src/i18n.js';

function heutePlusTage(tage) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + tage);
    return d;
}
function zuISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function zuDE(d) {
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
}
function umNeun(d) {
    const t = new Date(d);
    t.setHours(9, 0, 0, 0);
    return t;
}

const BASIS = { kosten: 10, waehrung: 'EUR', turnus: 'Jährlich', kategorie: 'Sport' };

test('Laufendes Abo: Erinnerung 7 Tage vor "Kündigung möglich bis", 9:00, mit Name und Datum', () => {
    // Zahlung in 60 Tagen, Frist 30 -> "möglich bis" heute+30 -> Erinnerung heute+23
    const abo = { ...BASIS, id: 'a', name: 'Gym', naechsteZahlung: zuISO(heutePlusTage(60)), kuendigungsfristTage: 30 };
    const plan = berechneBenachrichtigungsPlan([abo]);
    assert.equal(plan[0].title, 'Kündigungsfrist');
    assert.equal(plan[0].body, `Gym: Kündigung nur noch bis ${zuDE(heutePlusTage(30))} möglich.`);
    assert.equal(plan[0].at.getTime(), umNeun(heutePlusTage(23)).getTime());
});

test('Keine Zahlungserinnerung "In 3 Tagen fällig" mehr', () => {
    const abo = { ...BASIS, turnus: 'Monatlich', id: 'm', name: 'Netflix', naechsteZahlung: zuISO(heutePlusTage(20)), kuendigungsfristTage: 7 };
    const plan = berechneBenachrichtigungsPlan([abo]);
    assert.ok(plan.length > 0);
    assert.ok(plan.every((n) => n.title === 'Kündigungsfrist' && !/In 3 Tagen/.test(n.title + n.body)));
});

test('Monatsabo: die nächsten 3 Fristen werden geplant, je mit eigener ID', () => {
    const abo = { ...BASIS, turnus: 'Monatlich', id: 'm', name: 'Netflix', naechsteZahlung: zuISO(heutePlusTage(40)), kuendigungsfristTage: 10 };
    const plan = berechneBenachrichtigungsPlan([abo]);
    assert.equal(plan.length, 3);
    assert.equal(new Set(plan.map((n) => n.id)).size, 3);
    assert.ok(plan[0].at < plan[1].at && plan[1].at < plan[2].at);
    // erste Frist: heute+30 -> Erinnerung heute+23
    assert.equal(plan[0].at.getTime(), umNeun(heutePlusTage(23)).getTime());
});

test('Frist in weniger als 7 Tagen: diese Erinnerung entfällt (Karte ist rot), die folgenden bleiben', () => {
    const abo = { ...BASIS, turnus: 'Monatlich', id: 'k', name: 'Knapp', naechsteZahlung: zuISO(heutePlusTage(13)), kuendigungsfristTage: 10 };
    const plan = berechneBenachrichtigungsPlan([abo]);
    // "möglich bis" = heute+3 -> Erinnerung wäre heute-4 -> entfällt
    assert.ok(!plan.some((n) => n.body.includes(zuDE(heutePlusTage(3)))));
    assert.ok(plan.length >= 1);
    assert.ok(plan.every((n) => n.at > new Date()));
});

test('Erneutes Planen liefert dieselben IDs (nichts doppelt)', () => {
    const abos = [
        { ...BASIS, turnus: 'Monatlich', id: 'a', name: 'A', naechsteZahlung: zuISO(heutePlusTage(40)), kuendigungsfristTage: 10 },
        { ...BASIS, id: 'g', name: 'G', naechsteZahlung: zuISO(heutePlusTage(30)), kuendigungsfristTage: 7, gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(29)) }
    ];
    const ids1 = berechneBenachrichtigungsPlan(abos).map((n) => n.id);
    const ids2 = berechneBenachrichtigungsPlan(abos).map((n) => n.id);
    assert.deepEqual(ids1, ids2);
    assert.equal(new Set(ids1).size, ids1.length);
});

test('Gekündigtes Abo: KEINE Fristerinnerung, sondern genau eine "endet heute" am Vertragsende um 9:00', () => {
    const abo = { ...BASIS, id: 'm', name: 'Miete', turnus: 'Monatlich', naechsteZahlung: zuISO(heutePlusTage(40)), kuendigungsfristTage: 10, gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(60)) };
    const plan = berechneBenachrichtigungsPlan([abo]);
    assert.equal(plan.length, 1);
    assert.equal(plan[0].title, 'Vertragsende');
    assert.equal(plan[0].body, 'Miete endet heute.');
    assert.equal(plan[0].at.getTime(), umNeun(heutePlusTage(60)).getTime());
    assert.equal(plan[0].id, hasheZuId('m#vertragsende'));
});

test('Gekündigt: Vertragsende vorbei oder ohne Datum (vor 2.0.2) -> keine Benachrichtigung', () => {
    assert.equal(berechneBenachrichtigungsPlan([{ ...BASIS, id: 'x', name: 'Alt', naechsteZahlung: zuISO(heutePlusTage(5)), kuendigungsfristTage: 3, gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(-1)) }]).length, 0);
    assert.equal(berechneBenachrichtigungsPlan([{ ...BASIS, id: 'y', name: 'Alt', naechsteZahlung: zuISO(heutePlusTage(10)), kuendigungsfristTage: 3, gekuendigt: true }]).length, 0);
});

test('Vertragsende heute: nur geplant, solange 9:00 Uhr noch bevorsteht', () => {
    const abo = { ...BASIS, id: 'z', name: 'Heute', naechsteZahlung: zuISO(heutePlusTage(10)), kuendigungsfristTage: 3, gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(0)) };
    const frueh = heutePlusTage(0); frueh.setHours(8, 0, 0, 0);
    const spaet = heutePlusTage(0); spaet.setHours(10, 0, 0, 0);
    assert.equal(berechneBenachrichtigungsPlan([abo], frueh).length, 1);
    assert.equal(berechneBenachrichtigungsPlan([abo], spaet).length, 0);
});

test(`Höchstens ${MAX_BENACHRICHTIGUNGEN} Benachrichtigungen (iOS-Grenze 64), die frühesten zuerst`, () => {
    const abos = Array.from({ length: 40 }, (_, i) => ({ ...BASIS, turnus: 'Monatlich', id: `a${i}`, name: `A${i}`, naechsteZahlung: zuISO(heutePlusTage(20 + i)), kuendigungsfristTage: 5 }));
    const plan = berechneBenachrichtigungsPlan(abos);
    assert.equal(plan.length, MAX_BENACHRICHTIGUNGEN);
    for (let i = 1; i < plan.length; i++) assert.ok(plan[i - 1].at <= plan[i].at);
});

test('Ungültige Daten: keine Benachrichtigung, kein Absturz', () => {
    assert.deepEqual(berechneBenachrichtigungsPlan([{ ...BASIS, id: 'b', name: 'B', naechsteZahlung: 'kaputt', kuendigungsfristTage: 3 }]), []);
});

// --- Einblendung beim App-Start: Abos im roten Bereich ---

test('Hinweis beim Start: nur nicht gekündigte Abos im roten Bereich (≤ 7 Tage), früheste Frist zuerst', () => {
    const abos = [
        { ...BASIS, id: 'r7', name: 'Rot7', naechsteZahlung: zuISO(heutePlusTage(14)), kuendigungsfristTage: 7 },   // möglich bis +7
        { ...BASIS, id: 'r2', name: 'Rot2', naechsteZahlung: zuISO(heutePlusTage(9)), kuendigungsfristTage: 7 },    // +2
        { ...BASIS, id: 'g8', name: 'Gelb8', naechsteZahlung: zuISO(heutePlusTage(15)), kuendigungsfristTage: 7 },  // +8 -> gelb
        { ...BASIS, id: 'gk', name: 'Gekündigt', naechsteZahlung: zuISO(heutePlusTage(9)), kuendigungsfristTage: 7, gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(30)) }
    ];
    const rot = ermittleAbosImRotenBereich(abos);
    assert.deepEqual(rot.map((r) => r.abo.name), ['Rot2', 'Rot7']);
    assert.equal(zuDE(rot[0].fristDatum), zuDE(heutePlusTage(2)));
});

test('Hinweis beim Start: Titel für den Screenshot-Test unverändert', () => {
    assert.equal(t('hinweis.titel'), 'Kündigungsfrist endet bald');
});
