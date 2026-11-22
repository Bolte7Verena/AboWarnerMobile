/**
 * waehrungsauswahl.js | Auswahlliste für Währungen (ab 2.0.2 statt Freitext):
 * im Formular "Neues Abo", im Bearbeiten-Formular und für die Hauptwährung.
 */

import { normalisiereWaehrung, waehrungsListe, istBekannteWaehrung, waehrungFuerLand } from './waehrungen.js';
import { geraeteRegion } from './region.js';
import { t, waehrungsName, waehrungsSymbol } from './i18n.js';

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function kurz(code) {
    const symbol = waehrungsSymbol(code);
    return symbol === code ? code : `${code} (${symbol})`;
}

// Optionen für ein Abo. Eine unbekannte gespeicherte Währung (alte Daten,
// fremde Sicherung) bleibt als eigener Eintrag wählbar — sie geht nie verloren.
export function waehrungsOptionen(aktuell) {
    const gewaehlt = normalisiereWaehrung(aktuell);
    const liste = waehrungsListe([istBekannteWaehrung(gewaehlt) ? gewaehlt : '', waehrungFuerLand(geraeteRegion())]);
    const fremd = gewaehlt && !istBekannteWaehrung(gewaehlt) ? [gewaehlt] : [];
    return [...fremd, ...liste].map((code) => `<option value="${escapeHtml(code)}" ${code === gewaehlt ? 'selected' : ''}>${escapeHtml(fremd.includes(code) ? code : kurz(code))}</option>`).join('');
}

export function fuelleWaehrungsAuswahl(select, aktuell) {
    select.innerHTML = waehrungsOptionen(aktuell);
}

// Optionen für die Hauptwährung: "Automatisch" zuerst, danach mit vollem Namen.
export function hauptwaehrungsOptionen(einstellung, automatisch) {
    const liste = waehrungsListe([automatisch, waehrungFuerLand(geraeteRegion())]);
    return [`<option value="auto" ${einstellung === 'auto' ? 'selected' : ''}>${escapeHtml(t('waehrung.auto', { code: automatisch }))}</option>`]
        .concat(liste.map((code) => `<option value="${code}" ${code === einstellung ? 'selected' : ''}>${escapeHtml(`${code} – ${waehrungsName(code)}`)}</option>`))
        .join('');
}
