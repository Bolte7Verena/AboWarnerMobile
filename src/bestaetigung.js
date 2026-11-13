/**
 * bestaetigung.js | Eigener Bestätigungsdialog (z.B. "Wirklich löschen?").
 *
 * Bewusst kein natives window.confirm(): Das wäre auf dem Desktop (Electron)
 * ein blockierendes OS-Fenster (siehe Kommentar zu alert() in app.js) und
 * sieht in iOS-/Android-WebViews je nach System unterschiedlich und
 * stilfremd aus. Dieser Dialog nutzt dieselben Modal-Bausteine wie das
 * Kündigungsschreiben und liefert ein Promise<boolean>.
 */

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function frageBestaetigung({ titel, text, bestaetigenText = 'OK', abbrechenText = 'Abbrechen', gefaehrlich = false }) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay bestaetigung-overlay';
        overlay.innerHTML = `
            <div class="glass-strong modal-dialog bestaetigung-dialog" role="alertdialog" aria-modal="true" aria-labelledby="bestaetigung-titel" aria-describedby="bestaetigung-text">
                <h2 class="modal-title" id="bestaetigung-titel">${escapeHtml(titel)}</h2>
                <p class="bestaetigung-text" id="bestaetigung-text">${escapeHtml(text)}</p>
                <div class="modal-aktionen bestaetigung-aktionen">
                    <button type="button" class="btn btn-outline btn-sm bestaetigung-abbrechen-btn">${escapeHtml(abbrechenText)}</button>
                    <button type="button" class="btn btn-sm ${gefaehrlich ? 'btn-danger' : 'btn-primary'} bestaetigung-ok-btn">${escapeHtml(bestaetigenText)}</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        function beenden(ergebnis) {
            document.removeEventListener('keydown', escHandler);
            overlay.remove();
            resolve(ergebnis);
        }

        function escHandler(e) {
            if (e.key === 'Escape') beenden(false);
        }
        document.addEventListener('keydown', escHandler);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) beenden(false);
        });
        overlay.querySelector('.bestaetigung-abbrechen-btn').addEventListener('click', () => beenden(false));
        overlay.querySelector('.bestaetigung-ok-btn').addEventListener('click', () => beenden(true));

        // Fokus auf "Abbrechen": ein versehentliches Enter/Tippen löscht nichts.
        overlay.querySelector('.bestaetigung-abbrechen-btn').focus();
    });
}
