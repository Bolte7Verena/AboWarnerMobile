/**
 * zeitzonen.test.js | Termine dürfen in keiner Zeitzone um einen Tag verrutschen
 * (Fehler bis 2.0.1: in Amerika wurde alles einen Tag zu früh angezeigt).
 * Jede Zeitzone läuft in einem eigenen Node-Prozess. Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const PROGRAMM = `
const c = await import(process.env.BASIS + 'calculator.js');
const b = await import(process.env.BASIS + 'benachrichtigungsplan.js');
const iso = (d) => c.formatiereDatumISO(d);
const heute = new Date(); heute.setHours(0, 0, 0, 0);
const plus = (n) => { const d = new Date(heute); d.setDate(d.getDate() + n); return iso(d); };
const abo = { id: 'a', name: 'A', kosten: 1, waehrung: 'EUR', turnus: 'Jährlich', kategorie: 'Sport', naechsteZahlung: plus(60), kuendigungsfristTage: 30 };
const monat = { ...abo, turnus: 'Monatlich', naechsteZahlung: '2020-01-15' };
console.log(JSON.stringify({
    versatz: new Date(2027, 0, 15).getTimezoneOffset(),
    zahlung: iso(c.ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus)) === plus(60),
    heute: iso(c.ermittleEffektivesZahlungsdatum(plus(0), 'Monatlich')) === plus(0),
    frist: iso(c.ermittleKuendigungsfrist(abo).fristDatum) === plus(30),
    fristMonat: iso(c.ermittleKuendigungsfrist({ ...abo, naechsteZahlung: '2099-06-15', kuendigungsfristTage: 90, kuendigungsfristEinheit: 'monate', kuendigungsfristAnzahl: 3 }).fristDatum),
    vertragsende: iso(c.schlageVertragsendeVor(abo)) === plus(59),
    tagImMonat: c.ermittleEffektivesZahlungsdatum(monat.naechsteZahlung, monat.turnus).getDate(),
    mitternacht: c.ermittleEffektivesZahlungsdatum(monat.naechsteZahlung, monat.turnus).getHours(),
    erinnerung: (() => { const p = b.berechneBenachrichtigungsPlan([abo])[0]; return iso(p.at) === plus(23) && p.at.getHours() === 9; })(),
    rot: c.ermittleFristStatus({ ...abo, naechsteZahlung: plus(37) }),
    gelb: c.ermittleFristStatus({ ...abo, naechsteZahlung: plus(38) })
}));
`;

const ZONEN = { 'America/New_York': 300, 'America/Los_Angeles': 480, 'America/Sao_Paulo': 180, 'America/Mexico_City': 360, 'Pacific/Honolulu': 600, 'Europe/London': 0, 'Europe/Berlin': -60, 'Asia/Tokyo': -540, 'Pacific/Auckland': -780 };

for (const [zone, versatz] of Object.entries(ZONEN)) {
    test(`Zeitzone ${zone}: Zahlung, Frist, Vertragsende, Farbe und Erinnerung am richtigen Tag`, () => {
        const lauf = spawnSync(process.execPath, ['--input-type=module', '-e', PROGRAMM], {
            encoding: 'utf8',
            env: { ...process.env, TZ: zone, BASIS: new URL('../src/', import.meta.url).href }
        });
        assert.equal(lauf.status, 0, lauf.stderr);
        assert.deepEqual(JSON.parse(lauf.stdout), {
            versatz, zahlung: true, heute: true, frist: true, fristMonat: '2099-03-15', vertragsende: true,
            tagImMonat: 15, mitternacht: 0, erinnerung: true, rot: 'kritisch', gelb: 'warnung'
        });
    });
}
