/**
 * benachrichtigungsplan.test.js | Welche nativen Benachrichtigungen geplant
 * werden (reine Berechnung, ohne Capacitor). Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { berechneBenachrichtigungsPlan, hasheZuId } from '../src/benachrichtigungsplan.js';

function heutePlusTage(tage) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + tage);
    return d;
}

function zuISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const BASIS = { kosten: 10, waehrung: 'EUR', turnus: 'Monatlich', kategorie: 'Sport', kuendigungsfristTage: 14 };

test('Laufendes Abo: genau eine Zahlungserinnerung 3 Tage vorher um 9:00', () => {
    const abo = { ...BASIS, id: 'a', name: 'Gym', naechsteZahlung: zuISO(heutePlusTage(20)) };
    const plan = berechneBenachrichtigungsPlan([abo]);
    assert.equal(plan.length, 1);
    assert.equal(plan[0].title, 'In 3 Tagen fällig');
    assert.equal(plan[0].id, hasheZuId('a'));
    const erwartet = heutePlusTage(17);
    erwartet.setHours(9, 0, 0, 0);
    assert.equal(plan[0].at.getTime(), erwartet.getTime());
});

test('Gekündigtes Abo: KEINE Zahlungs-/Fristerinnerung, sondern genau eine "endet heute" am Vertragsende um 9:00', () => {
    const abo = { ...BASIS, id: 'm', name: 'Miete', naechsteZahlung: zuISO(heutePlusTage(5)), gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(40)) };
    const plan = berechneBenachrichtigungsPlan([abo]);
    assert.equal(plan.length, 1);
    assert.equal(plan[0].title, 'Vertragsende');
    assert.equal(plan[0].body, 'Miete endet heute.');
    const erwartet = heutePlusTage(40);
    erwartet.setHours(9, 0, 0, 0);
    assert.equal(plan[0].at.getTime(), erwartet.getTime());
    assert.notEqual(plan[0].id, hasheZuId('m'), 'eigene ID, keine Kollision mit Zahlungserinnerung');
});

test('Gekündigtes Abo, Vertragsende vorbei: keine Benachrichtigung', () => {
    const abo = { ...BASIS, id: 'x', name: 'Alt', naechsteZahlung: zuISO(heutePlusTage(5)), gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(-1)) };
    assert.equal(berechneBenachrichtigungsPlan([abo]).length, 0);
});

test('Altes gekündigtes Abo ohne Datum (vor 2.0.2): keine Benachrichtigung', () => {
    const abo = { ...BASIS, id: 'y', name: 'Alt', naechsteZahlung: zuISO(heutePlusTage(10)), gekuendigt: true };
    assert.equal(berechneBenachrichtigungsPlan([abo]).length, 0);
});

test('Vertragsende heute: wird nur geplant, solange 9:00 Uhr noch bevorsteht', () => {
    const abo = { ...BASIS, id: 'z', name: 'Heute', naechsteZahlung: zuISO(heutePlusTage(10)), gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(0)) };
    const frueh = heutePlusTage(0); frueh.setHours(8, 0, 0, 0);
    const spaet = heutePlusTage(0); spaet.setHours(10, 0, 0, 0);
    assert.equal(berechneBenachrichtigungsPlan([abo], frueh).length, 1);
    assert.equal(berechneBenachrichtigungsPlan([abo], spaet).length, 0);
});

test('Gemischte Liste: laufend + gekündigt ergibt je die passende Art', () => {
    const plan = berechneBenachrichtigungsPlan([
        { ...BASIS, id: 'l', name: 'Laufend', naechsteZahlung: zuISO(heutePlusTage(30)) },
        { ...BASIS, id: 'g', name: 'Gekündigt', naechsteZahlung: zuISO(heutePlusTage(30)), gekuendigt: true, gekuendigtZum: zuISO(heutePlusTage(60)) }
    ]);
    assert.deepEqual(plan.map((p) => p.title), ['In 3 Tagen fällig', 'Vertragsende']);
});
