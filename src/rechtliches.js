/**
 * rechtliches.js | Steuerung für das Datenschutz-/Impressum-Modal im Footer.
 * Rein statischer Inhalt (siehe index.html) — dieses Modul schaltet nur um,
 * welcher der beiden Abschnitte sichtbar ist, und öffnet/schließt das Modal.
 */

export function initRechtliches() {
    const overlay = document.getElementById('rechtliches-modal-overlay');
    const titel = document.getElementById('rechtliches-titel');
    const datenschutzPanel = document.getElementById('rechtliches-datenschutz');
    const impressumPanel = document.getElementById('rechtliches-impressum');

    function oeffne(abschnitt) {
        const istDatenschutz = abschnitt === 'datenschutz';
        titel.textContent = istDatenschutz ? 'Datenschutzerklärung' : 'Impressum';
        datenschutzPanel.hidden = !istDatenschutz;
        impressumPanel.hidden = istDatenschutz;
        overlay.hidden = false;
    }

    function schliesse() {
        overlay.hidden = true;
    }

    document.getElementById('btn-footer-datenschutz').addEventListener('click', () => oeffne('datenschutz'));
    document.getElementById('btn-footer-impressum').addEventListener('click', () => oeffne('impressum'));
    document.getElementById('btn-rechtliches-schliessen').addEventListener('click', schliesse);

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) schliesse();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) schliesse();
    });
}
