/**
 * speicher.js | Sicheres Lesen und Schreiben der Abo-Datei (ab 2.0.2).
 *
 * Zwei Dateien mit demselben Inhalt:
 *   abos.json        Hauptdatei (Format wie in 2.0.1: JSON-Array)
 *   abos-kopie.json  automatische Sicherheitskopie
 *
 * Schreiben: zuerst die Kopie, zurücklesen und vergleichen, erst dann die
 * Hauptdatei (ebenso). Bricht das Schreiben irgendwo ab (Absturz, Speicher voll),
 * ist immer mindestens eine der beiden Dateien vollständig.
 *
 * Lesen: Ist die Hauptdatei beschädigt oder verschwunden, wird sie aus der Kopie
 * wiederhergestellt. Eine beschädigte Datei wird vorher unter eigenem Namen
 * aufgehoben (abos-beschaedigt-….json) und nie überschrieben. Lässt sie sich nicht
 * aufheben, ist Speichern gesperrt: lieber eine Meldung als verlorene Daten.
 *
 * Ohne DOM und Capacitor; der Dateizugriff wird übergeben (per Unit-Test prüfbar):
 *   dateien.lies(name)            -> Text, oder null wenn es die Datei nicht gibt; wirft bei Lesefehler
 *   dateien.schreibe(name, text)  -> wirft bei Fehler
 *   dateien.benenneUm(von, nach)  -> wirft bei Fehler
 */

export const HAUPTDATEI = 'abos.json';
export const KOPIE = 'abos-kopie.json';

const istAbo = (wert) => !!wert && typeof wert === 'object' && !Array.isArray(wert);

// Text -> { abos, vollstaendig } oder null, wenn unbrauchbar.
function deute(text) {
    let daten;
    try {
        daten = JSON.parse(text);
    } catch (error) {
        return null;
    }
    if (!Array.isArray(daten)) return null;
    const abos = daten.filter(istAbo).map((abo) => (typeof abo.name === 'string' ? abo : { ...abo, name: String(abo.name ?? '') }));
    return { abos, vollstaendig: abos.length === daten.length };
}

export function erzeugeSpeicher(dateien, jetzt = () => new Date(), warte = (ms) => new Promise((r) => { setTimeout(r, ms); })) {
    let gesperrt = false;
    let kopieAktuell = false;
    let meldung = null; // { art: 'wiederhergestellt' | 'teilweise' | 'verloren' | 'gesperrt', anzahl }
    let kette = Promise.resolve();

    // Alles hintereinander: Zwei Änderungen kurz nacheinander überschreiben sich
    // nicht gegenseitig, und niemand liest eine halb geschriebene Datei.
    function nacheinander(aufgabe) {
        const ergebnis = kette.then(aufgabe, aufgabe);
        kette = ergebnis.catch(() => {});
        return ergebnis;
    }

    async function pruefe(name) {
        let text;
        for (let versuch = 1; ; versuch++) {
            try {
                text = await dateien.lies(name);
                break;
            } catch (error) {
                // Vielleicht nur kurz gestört.
                if (versuch === 3) return { art: 'lesefehler' };
                await warte(100);
            }
        }
        if (text === null) return { art: 'fehlt' };
        const inhalt = deute(text);
        if (!inhalt) return { art: 'kaputt', text };
        return { art: inhalt.vollstaendig ? 'ok' : 'teilweise', text, abos: inhalt.abos };
    }

    async function schreibeGeprueft(name, text) {
        await dateien.schreibe(name, text);
        if (await dateien.lies(name) !== text) throw new Error(`${name} wurde nicht vollständig geschrieben`);
    }

    // Beschädigte Datei unter eigenem Namen aufheben.
    async function hebeAuf(name, stand) {
        const zeit = jetzt().toISOString().replace(/[^0-9]/g, '').slice(0, 17);
        const ziel = `abos-beschaedigt-${zeit}${name === KOPIE ? '-kopie' : ''}.json`;
        if (stand.art === 'lesefehler') await dateien.benenneUm(name, ziel);
        else await schreibeGeprueft(ziel, stand.text);
    }

    async function frischeKopieAuf(text) {
        if (kopieAktuell) return;
        try {
            await schreibeGeprueft(KOPIE, text);
            kopieAktuell = true;
        } catch (error) {
            // Nächster Versuch beim nächsten Lesen.
        }
    }

    async function lade() {
        const warGesperrt = gesperrt;
        gesperrt = false;
        const haupt = await pruefe(HAUPTDATEI);
        if (haupt.art === 'ok') {
            await frischeKopieAuf(haupt.text);
            return haupt.abos;
        }

        const kopie = await pruefe(KOPIE);
        // Allererster Start: noch keine Datei.
        if (haupt.art === 'fehlt' && kopie.art === 'fehlt') return [];

        let abos;
        let art;
        if (kopie.art === 'ok' && kopie.abos.length >= (haupt.abos || []).length) {
            abos = kopie.abos;
            art = 'wiederhergestellt';
        } else {
            abos = haupt.abos || kopie.abos || [];
            art = abos.length > 0 ? 'teilweise' : 'verloren';
        }

        try {
            // Nur nicht lesbar (vielleicht ist sie heil) und keine gute Kopie: nicht anfassen.
            if (haupt.art === 'lesefehler' && kopie.art !== 'ok') throw new Error('Abo-Datei nicht lesbar');
            if (haupt.art !== 'fehlt') await hebeAuf(HAUPTDATEI, haupt);
            if (kopie.art !== 'fehlt' && kopie.art !== 'ok') await hebeAuf(KOPIE, kopie);
            const text = JSON.stringify(abos, null, 2);
            await schreibeGeprueft(HAUPTDATEI, text);
            kopieAktuell = false;
            await frischeKopieAuf(text);
        } catch (error) {
            gesperrt = true;
            if (!warGesperrt) meldung = { art: 'gesperrt', anzahl: abos.length };
            return abos;
        }
        // Eine leere Liste aus der Kopie ist keine Nachricht wert.
        if (art !== 'wiederhergestellt' || abos.length > 0) meldung = { art, anzahl: abos.length };
        return abos;
    }

    async function schreibe(abos) {
        if (gesperrt) throw new Error('Speichern gesperrt: Abo-Datei nicht sicher lesbar');
        const text = JSON.stringify(abos, null, 2);
        kopieAktuell = false;
        await schreibeGeprueft(KOPIE, text);
        try {
            await schreibeGeprueft(HAUPTDATEI, text);
        } catch (error) {
            // Hauptdatei noch die alte? Dann gilt die Änderung als nicht gespeichert.
            const haupt = await pruefe(HAUPTDATEI);
            if (haupt.art === 'ok') {
                if (haupt.text === text) return;
                await frischeKopieAuf(haupt.text);
                throw error;
            }
            // Hauptdatei beim Schreiben zerstört: Die Änderung steht geprüft in der
            // Kopie, das nächste Lesen stellt die Hauptdatei daraus wieder her.
            return;
        }
        kopieAktuell = true;
    }

    return {
        lade: () => nacheinander(lade),
        // aendere(abos) liefert die neue Liste. Wirft, wenn nicht gespeichert wurde.
        aendere: (aenderung) => nacheinander(async () => {
            const neu = await aenderung(await lade());
            await schreibe(neu);
            return neu;
        }),
        // Ausdrücklicher Wunsch des Nutzers ("Sicherung wiederherstellen"): ersetzt alles,
        // auch wenn die Abo-Datei nicht lesbar ist; diese wird vorher umbenannt.
        ersetze: (neu, vorher = async () => {}) => nacheinander(async () => {
            const bisherige = await lade();
            if (gesperrt) {
                const haupt = await pruefe(HAUPTDATEI);
                if (haupt.art !== 'fehlt' && haupt.art !== 'ok') await hebeAuf(HAUPTDATEI, haupt);
                gesperrt = false;
            }
            await vorher(bisherige);
            await schreibe(neu);
            meldung = null;
            return neu;
        }),
        istGesperrt: () => gesperrt,
        // Meldung für den Nutzer, genau einmal.
        holeMeldung: () => {
            const aktuell = meldung;
            meldung = null;
            return aktuell;
        }
    };
}
