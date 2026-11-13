/**
 * sprachwahl.js | Sprachwahl über das Weltkugel-Symbol oben rechts:
 * Automatisch (Sprache des Geräts) / Deutsch / English.
 *
 * Die Wahl wird gespeichert (i18n.js, localStorage). Nach einer Änderung
 * lädt die App einmal neu — so stehen garantiert alle Texte (auch bereits
 * gerenderte Karten, Fenster und geplante Mitteilungen) in der neuen Sprache.
 * An den gespeicherten Abos ändert das nichts.
 */

import { ladeSpracheinstellung, speichereSpracheinstellung } from './i18n.js';

export function initSprachwahl({ neuLaden = () => window.location.reload() } = {}) {
    const overlay = document.getElementById('sprache-modal-overlay');
    const optionen = () => [...overlay.querySelectorAll('input[name="sprache"]')];

    function oeffne() {
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
        if (gewaehlt === ladeSpracheinstellung()) {
            schliesse();
            return;
        }
        speichereSpracheinstellung(gewaehlt);
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
