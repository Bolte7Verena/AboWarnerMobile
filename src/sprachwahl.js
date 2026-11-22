/**
 * sprachwahl.js | Sprache und Hauptwährung über das Weltkugel-Symbol oben rechts:
 * Automatisch (Sprache des Geräts) / Deutsch / English / Español /
 * Français / Português; darunter die Währung, in der die Summen stehen.
 *
 * Die Wahl wird gespeichert (i18n.js, localStorage). Nach einer Änderung
 * lädt die App einmal neu — so stehen garantiert alle Texte (auch bereits
 * gerenderte Karten, Fenster und geplante Mitteilungen) in der neuen Sprache.
 * An den gespeicherten Abos ändert das nichts.
 */

import { ladeSpracheinstellung, speichereSpracheinstellung } from './i18n.js';
import { ladeWaehrungseinstellung, speichereWaehrungseinstellung, ermittleHauptwaehrung } from './waehrungen.js';
import { hauptwaehrungsOptionen } from './waehrungsauswahl.js';

export function initSprachwahl({ neuLaden = () => window.location.reload() } = {}) {
    const overlay = document.getElementById('sprache-modal-overlay');
    const optionen = () => [...overlay.querySelectorAll('input[name="sprache"]')];

    const waehrungEl = document.getElementById('input-hauptwaehrung');

    async function fuelleWaehrung() {
        const abos = await window.api.loadAbos();
        waehrungEl.innerHTML = hauptwaehrungsOptionen(ladeWaehrungseinstellung(), ermittleHauptwaehrung(abos, 'auto'));
    }

    function oeffne() {
        fuelleWaehrung();
        const aktuell = ladeSpracheinstellung();
        optionen().forEach((radio) => { radio.checked = radio.value === aktuell; });
        overlay.hidden = false;
        (optionen().find((radio) => radio.checked) || optionen()[0]).focus();
    }

    function schliesse() {
        overlay.hidden = true;
        document.getElementById('btn-sprache').focus();
    }

    function uebernehme() {
        const gewaehlt = (optionen().find((radio) => radio.checked) || {}).value || 'auto';
        const waehrung = waehrungEl.value || ladeWaehrungseinstellung();
        if (gewaehlt === ladeSpracheinstellung() && waehrung === ladeWaehrungseinstellung()) {
            schliesse();
            return;
        }
        speichereSpracheinstellung(gewaehlt);
        speichereWaehrungseinstellung(waehrung);
        neuLaden();
    }

    document.getElementById('btn-sprache').addEventListener('click', oeffne);
    document.getElementById('btn-sprache-schliessen').addEventListener('click', schliesse);
    document.getElementById('btn-sprache-abbrechen').addEventListener('click', schliesse);
    document.getElementById('btn-sprache-uebernehmen').addEventListener('click', uebernehme);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) schliesse();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) schliesse();
    });
}
