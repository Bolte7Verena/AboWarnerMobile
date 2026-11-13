/**
 * hilfe.js | Öffnet/schließt die Hilfe-Seite ("?" oben rechts).
 * Der Inhalt ist rein statisch (siehe index.html, #hilfe-modal-overlay).
 */

export function initHilfe() {
    const overlay = document.getElementById('hilfe-modal-overlay');
    const dialog = overlay.querySelector('.modal-dialog');

    function oeffne() {
        overlay.hidden = false;
        dialog.scrollTop = 0;
        document.getElementById('btn-hilfe-schliessen').focus();
    }

    function schliesse() {
        overlay.hidden = true;
        document.getElementById('btn-hilfe').focus();
    }

    document.getElementById('btn-hilfe').addEventListener('click', oeffne);
    document.getElementById('btn-hilfe-schliessen').addEventListener('click', schliesse);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) schliesse();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !overlay.hidden) schliesse();
    });
}
