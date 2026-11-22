/**
 * speicher.test.js | Sicherheitskopie der Abo-Datei: Bei keinem Fehler (Datei
 * beschädigt, Speicher voll, Absturz mitten im Schreiben) darf etwas still
 * verloren gehen. Die Dateien sind hier ein einfaches Objekt. Lauf: npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { erzeugeSpeicher, HAUPTDATEI, KOPIE } from '../src/speicher.js';

const A = { id: 'a', name: 'Alpha' };
const B = { id: 'b', name: 'Beta' };
const C = { id: 'c', name: 'Gamma' };
const json = (...abos) => JSON.stringify(abos, null, 2);

// Einfaches Dateisystem mit einstellbaren Fehlern.
function dateisystem(inhalt = {}, fehler = {}) {
    const d = { ...inhalt };
    return {
        d,
        fehler,
        schreibvorgaenge: 0,
        async lies(name) {
            if (fehler.lies?.(name)) throw new Error('Lesefehler');
            return name in d ? d[name] : null;
        },
        async schreibe(name, text) {
            this.schreibvorgaenge++;
            const art = fehler.schreibe?.(name, this.schreibvorgaenge);
            if (art === 'abbruch') { d[name] = text.slice(0, Math.floor(text.length / 2)); throw new Error('Speicher voll'); }
            if (art === 'still') { d[name] = text.slice(0, Math.floor(text.length / 2)); return; }
            if (art === 'leer') { d[name] = ''; throw new Error('Speicher voll'); }
            if (art) throw new Error('Schreibfehler');
            d[name] = text;
        },
        async benenneUm(von, nach) {
            if (fehler.benenneUm?.(von)) throw new Error('Umbenennen');
            d[nach] = d[von] ?? '(unlesbar)';
            delete d[von];
            fehler.lies = undefined;
        }
    };
}
const aufgehoben = (fs) => Object.keys(fs.d).filter((n) => n.startsWith('abos-beschaedigt-'));

test('Erster Start: leere Liste, keine Meldung, keine Datei angelegt', async () => {
    const fs = dateisystem();
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), []);
    assert.equal(s.holeMeldung(), null);
    assert.deepEqual(Object.keys(fs.d), []);
});

test('Update von 2.0.1: vorhandene Datei bleibt unverändert, Kopie entsteht beim ersten Lesen', async () => {
    const alt = JSON.stringify([A, B], null, 2);
    const fs = dateisystem({ [HAUPTDATEI]: alt });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), [A, B]);
    assert.equal(fs.d[HAUPTDATEI], alt);
    assert.equal(fs.d[KOPIE], alt);
    assert.equal(s.holeMeldung(), null);
});

test('Speichern schreibt beide Dateien gleich', async () => {
    const fs = dateisystem();
    const s = erzeugeSpeicher(fs);
    await s.aendere((x) => [...x, A]);
    await s.aendere((x) => [...x, B]);
    assert.equal(fs.d[HAUPTDATEI], json(A, B));
    assert.equal(fs.d[KOPIE], json(A, B));
});

for (const [was, kaputt] of [['abgeschnitten', json(A, B).slice(0, 30)], ['leer (0 Byte)', ''], ['Nullbytes', '\0\0\0\0'], ['kein Array', '{"a":1}'], ['Text', 'hallo'], ['null', 'null']]) {
    test(`Hauptdatei beschädigt (${was}): aus der Kopie wiederhergestellt, Original aufgehoben, Meldung genau einmal`, async () => {
        const fs = dateisystem({ [HAUPTDATEI]: kaputt, [KOPIE]: json(A, B) });
        const s = erzeugeSpeicher(fs);
        assert.deepEqual(await s.lade(), [A, B]);
        assert.equal(fs.d[HAUPTDATEI], json(A, B));
        assert.equal(aufgehoben(fs).length, 1);
        assert.equal(fs.d[aufgehoben(fs)[0]], kaputt);
        assert.deepEqual(s.holeMeldung(), { art: 'wiederhergestellt', anzahl: 2 });
        assert.equal(s.holeMeldung(), null);
        await s.lade();
        assert.equal(s.holeMeldung(), null);
        assert.equal(aufgehoben(fs).length, 1);
    });
}

test('Hauptdatei verschwunden: aus der Kopie wiederhergestellt', async () => {
    const fs = dateisystem({ [KOPIE]: json(A) });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), [A]);
    assert.equal(fs.d[HAUPTDATEI], json(A));
    assert.deepEqual(s.holeMeldung(), { art: 'wiederhergestellt', anzahl: 1 });
});

test('Alle Abos gelöscht ist kein Schaden: leere Hauptdatei gewinnt gegen alte Kopie', async () => {
    const fs = dateisystem({ [HAUPTDATEI]: '[]', [KOPIE]: json(A, B) });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), []);
    assert.equal(s.holeMeldung(), null);
    assert.equal(fs.d[KOPIE], '[]');
});

test('Beide beschädigt: leer mit Meldung, beide Dateien aufgehoben, danach normal nutzbar', async () => {
    const fs = dateisystem({ [HAUPTDATEI]: 'kaputt1', [KOPIE]: 'kaputt2' });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), []);
    assert.deepEqual(s.holeMeldung(), { art: 'verloren', anzahl: 0 });
    assert.deepEqual(aufgehoben(fs).map((n) => fs.d[n]).sort(), ['kaputt1', 'kaputt2']);
    await s.aendere((x) => [...x, C]);
    assert.deepEqual(await s.lade(), [C]);
    assert.equal(aufgehoben(fs).length, 2);
});

test('Einzelne Einträge beschädigt: die lesbaren bleiben, Meldung, Original aufgehoben', async () => {
    const fs = dateisystem({ [HAUPTDATEI]: JSON.stringify([A, null, 5, 'x', [], B]) });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), [A, B]);
    assert.deepEqual(s.holeMeldung(), { art: 'teilweise', anzahl: 2 });
    assert.equal(aufgehoben(fs).length, 1);
    const mitKopie = dateisystem({ [HAUPTDATEI]: JSON.stringify([A, null]), [KOPIE]: json(A, B) });
    assert.deepEqual(await erzeugeSpeicher(mitKopie).lade(), [A, B]);
});

test('Eintrag ohne Namen bringt die Liste nicht zum Absturz', async () => {
    const s = erzeugeSpeicher(dateisystem({ [HAUPTDATEI]: JSON.stringify([{ id: 'x' }, { id: 'y', name: 7 }]) }));
    assert.deepEqual((await s.lade()).map((a) => a.name), ['', '7']);
});

test('Lesefehler der Hauptdatei: Kopie wird gezeigt, unlesbare Datei umbenannt statt überschrieben', async () => {
    const fs = dateisystem({ [HAUPTDATEI]: 'geheim', [KOPIE]: json(A) }, { lies: (n) => n === HAUPTDATEI });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), [A]);
    assert.equal(fs.d[aufgehoben(fs)[0]], 'geheim');
    assert.deepEqual(s.holeMeldung(), { art: 'wiederhergestellt', anzahl: 1 });
});

test('Lässt sich die beschädigte Datei nicht aufheben: Speichern gesperrt, nichts überschrieben, später wieder frei', async () => {
    const fehler = { lies: (n) => n === HAUPTDATEI, benenneUm: () => true };
    const fs = dateisystem({ [HAUPTDATEI]: json(A, B) }, fehler);
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), []);
    assert.equal(s.istGesperrt(), true);
    assert.deepEqual(s.holeMeldung(), { art: 'gesperrt', anzahl: 0 });
    await assert.rejects(s.aendere((x) => [...x, C]));
    assert.equal(fs.d[HAUPTDATEI], json(A, B));
    fehler.lies = undefined;
    assert.deepEqual(await s.lade(), [A, B]);
    assert.equal(s.istGesperrt(), false);
    await s.aendere((x) => [...x, C]);
    assert.equal(fs.d[HAUPTDATEI], json(A, B, C));
});

test('Hauptdatei nicht lesbar und keine Kopie: Datei bleibt unangetastet, Speichern gesperrt, Sicherung einspielen möglich', async () => {
    const fs = dateisystem({ [HAUPTDATEI]: json(A, B) }, { lies: (n) => n === HAUPTDATEI });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), []);
    assert.equal(s.istGesperrt(), true);
    assert.deepEqual(Object.keys(fs.d), [HAUPTDATEI]);
    await s.ersetze([C]);
    assert.deepEqual(await s.lade(), [C]);
    assert.equal(fs.d[aufgehoben(fs)[0]], json(A, B));
});

test('Kurze Lesestörung: zweiter Versuch gelingt, keine Meldung', async () => {
    let n = 0;
    const fs = dateisystem({ [HAUPTDATEI]: json(A) }, { lies: () => ++n === 1 });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), [A]);
    assert.equal(s.holeMeldung(), null);
});

test('Sicherung einspielen: bisherige Liste wird vorher übergeben; scheitert das, bleibt alles beim Alten', async () => {
    const fs = dateisystem({ [HAUPTDATEI]: json(A) });
    const s = erzeugeSpeicher(fs);
    let vorher;
    await s.ersetze([B], async (x) => { vorher = x; });
    assert.deepEqual(vorher, [A]);
    await assert.rejects(s.ersetze([C], async () => { throw new Error('voll'); }));
    assert.deepEqual(await s.lade(), [B]);
});

for (const art of ['fehler', 'abbruch', 'leer', 'still']) {
    test(`Speicher voll beim Schreiben der Kopie (${art}): Fehler gemeldet, Hauptdatei unangetastet`, async () => {
        const fs = dateisystem({ [HAUPTDATEI]: json(A), [KOPIE]: json(A) });
        const s = erzeugeSpeicher(fs);
        await s.lade();
        fs.fehler.schreibe = (n) => n === KOPIE && art;
        await assert.rejects(s.aendere((x) => [...x, B]));
        assert.equal(fs.d[HAUPTDATEI], json(A));
        fs.fehler.schreibe = undefined;
        assert.deepEqual(await s.lade(), [A]);
        assert.equal(fs.d[KOPIE], json(A), 'Kopie beim nächsten Lesen wieder in Ordnung');
        await s.aendere((x) => [...x, B]);
        assert.deepEqual(await s.lade(), [A, B]);
    });
}

test('Schreiben der Hauptdatei schlägt fehl, alte Datei noch da: Fehler gemeldet, alter Stand in beiden Dateien', async () => {
    const fs = dateisystem({ [HAUPTDATEI]: json(A), [KOPIE]: json(A) });
    const s = erzeugeSpeicher(fs);
    await s.lade();
    fs.fehler.schreibe = (n) => n === HAUPTDATEI && 'fehler';
    await assert.rejects(s.aendere((x) => [...x, B]));
    assert.equal(fs.d[HAUPTDATEI], json(A));
    assert.equal(fs.d[KOPIE], json(A));
});

for (const art of ['abbruch', 'leer', 'still']) {
    test(`Schreiben der Hauptdatei bricht ab und zerstört sie (${art}): neuer Stand kommt aus der Kopie`, async () => {
        const fs = dateisystem({ [HAUPTDATEI]: json(A), [KOPIE]: json(A) });
        const s = erzeugeSpeicher(fs);
        await s.lade();
        fs.fehler.schreibe = (n) => n === HAUPTDATEI && art;
        await s.aendere((x) => [...x, B]);
        fs.fehler.schreibe = undefined;
        assert.deepEqual(await erzeugeSpeicher(fs).lade(), [A, B]);
        assert.equal(fs.d[HAUPTDATEI], json(A, B));
    });
}

test('Absturz an jeder Stelle eines Schreibvorgangs: nach dem Neustart alter oder neuer Stand, nie weniger', async () => {
    const neu = json(A, B);
    for (const ziel of [KOPIE, HAUPTDATEI]) {
        for (let n = 0; n <= neu.length; n++) {
            // Zustand der Dateien, wenn die App genau hier abstürzt
            const d = ziel === KOPIE
                ? { [HAUPTDATEI]: json(A), [KOPIE]: neu.slice(0, n) }
                : { [HAUPTDATEI]: neu.slice(0, n), [KOPIE]: neu };
            const abos = await erzeugeSpeicher(dateisystem(d)).lade();
            assert.deepEqual(abos, ziel === KOPIE ? [A] : [A, B], `${ziel} nach ${n} Zeichen`);
        }
    }
});

test('Viele Änderungen gleichzeitig: keine geht verloren', async () => {
    const fs = dateisystem();
    const s = erzeugeSpeicher(fs);
    await Promise.all(Array.from({ length: 50 }, (_, i) => s.aendere((x) => [...x, { id: String(i), name: 'n' + i }])));
    assert.equal((await s.lade()).length, 50);
    assert.equal(fs.d[HAUPTDATEI], fs.d[KOPIE]);
});

test('Gerät ergänzt BOM oder Zeilenumbruch: Speichern und Lesen klappen trotzdem', async () => {
    for (const [vorn, hinten] of [['\uFEFF', ''], ['', '\n'], ['\uFEFF', '\r\n']]) {
        const fs = dateisystem();
        const lies = fs.lies;
        fs.lies = async (n) => { const x = await lies(n); return x === null ? null : vorn + x + hinten; };
        const s = erzeugeSpeicher(fs);
        await s.aendere((x) => [...x, { id: 'ü', name: 'Zoë 😀 日本語 \uD800' }]);
        assert.equal((await s.lade()).length, 1);
        assert.equal(s.holeMeldung(), null);
    }
});

test('Nach einem Fehler laufen weitere Änderungen normal', async () => {
    const fs = dateisystem();
    const s = erzeugeSpeicher(fs);
    await assert.rejects(s.aendere(() => { throw new Error('x'); }));
    await s.aendere((x) => [...x, A]);
    assert.deepEqual(await s.lade(), [A]);
});

test('Wiederherstellen selbst scheitert (Speicher voll): Abos werden gezeigt, Speichern gesperrt, Kopie bleibt', async () => {
    const fs = dateisystem({ [HAUPTDATEI]: 'kaputt', [KOPIE]: json(A, B) }, { schreibe: () => 'fehler' });
    const s = erzeugeSpeicher(fs);
    assert.deepEqual(await s.lade(), [A, B]);
    assert.equal(s.istGesperrt(), true);
    assert.equal(s.holeMeldung().art, 'gesperrt');
    await assert.rejects(s.aendere((x) => x));
    assert.equal(fs.d[KOPIE], json(A, B));
    assert.equal(fs.d[HAUPTDATEI], 'kaputt');
});
