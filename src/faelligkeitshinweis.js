/**
 * faelligkeitshinweis.js | Hinweise auf ablaufende Kündigungsfristen.
 *
 * Zwei sich ergänzende Mechanismen (ab 2.0.2 beide an der Kündigungsfrist
 * ausgerichtet, nicht mehr am Zahlungstermin):
 * 1. zeigeFaelligkeitshinweisFallsNoetig() — Einblendung beim App-Start
 *    "Kündigungsfrist endet bald" für alle Abos im roten Bereich
 *    (Kündigung nur noch höchstens 7 Tage möglich), je Abo
 *    "Kündigung nur noch bis [Datum]".
 * 2. planeFaelligkeitsBenachrichtigungen() — native Mitteilungen, die auch
 *    bei geschlossener App erscheinen (Regeln: benachrichtigungsplan.js).
 */

import { t, formatiereDatum } from './i18n.js';
import { LocalNotifications } from '@capacitor/local-notifications';
import { berechneBenachrichtigungsPlan, ermittleAbosImRotenBereich } from './benachrichtigungsplan.js';

const ICON_ALARM_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function zeigeFaelligkeitshinweisFallsNoetig(alleAbos) {
    const roteAbos = ermittleAbosImRotenBereich(alleAbos);
    if (roteAbos.length === 0) return;

    const toast = document.createElement('div');
    toast.className = 'glass-strong faelligkeit-toast';
    toast.innerHTML = `
        <div class="faelligkeit-toast-header">
            <div class="faelligkeit-toast-icon">${ICON_ALARM_CLOCK}</div>
            <p class="faelligkeit-toast-title">${escapeHtml(t('hinweis.titel'))}</p>
            <button type="button" class="faelligkeit-toast-close-btn" aria-label="${escapeHtml(t('knopf.schliessen'))}">${ICON_X}</button>
        </div>
        <ul class="faelligkeit-toast-liste">
            ${roteAbos.map(({ abo, fristDatum }) => `
                <li class="faelligkeit-toast-item"><strong>${escapeHtml(abo.name)}</strong> — ${escapeHtml(t('hinweis.zeile', { datum: formatiereDatum(fristDatum) }))}</li>
            `).join('')}
        </ul>
    `;

    document.body.appendChild(toast);

    toast.querySelector('.faelligkeit-toast-close-btn').addEventListener('click', () => {
        toast.remove();
    });
}

// Was geplant wird, entscheidet berechneBenachrichtigungsPlan() (siehe
// benachrichtigungsplan.js); hier nur Berechtigung + Capacitor-Aufrufe.
// Wird beim App-Start UND nach jeder Datenänderung aufgerufen (app.js).
//
// Läufe werden hintereinander ausgeführt (nie zwei gleichzeitig), damit sich
// "alles verwerfen" und "neu planen" zweier Läufe nicht überkreuzen. Jeder
// Lauf verwirft ALLE ausstehenden Mitteilungen — beim ersten Start nach dem
// Update also auch die alten "In 3 Tagen fällig"-Erinnerungen aus 2.0.1.
let letzterLauf = Promise.resolve();

export function planeFaelligkeitsBenachrichtigungen(alleAbos) {
    letzterLauf = letzterLauf.then(() => planeJetzt(alleAbos));
    return letzterLauf;
}

async function planeJetzt(alleAbos) {
    try {
        const berechtigung = await LocalNotifications.requestPermissions();
        if (berechtigung.display !== 'granted') return;

        // Vorherige geplante Benachrichtigungen verwerfen und komplett neu
        // planen — einfacher und robuster als einzelne Einträge nach
        // Hinzufügen/Bearbeiten/Löschen/Kündigen abzugleichen.
        const ausstehende = await LocalNotifications.getPending();
        if (ausstehende.notifications.length > 0) {
            await LocalNotifications.cancel({ notifications: ausstehende.notifications });
        }

        const benachrichtigungen = berechneBenachrichtigungsPlan(alleAbos).map(({ id, title, body, at }) => ({
            id,
            title,
            body,
            schedule: { at }
        }));

        if (benachrichtigungen.length > 0) {
            await LocalNotifications.schedule({ notifications: benachrichtigungen });
        }
    } catch (error) {
        // Benachrichtigungen sind eine Zusatzfunktion — ein Fehler hier (z.B.
        // Berechtigung verweigert) darf weder den App-Start blockieren noch
        // die restliche App beeinträchtigen.
        console.warn('Fälligkeits-Benachrichtigungen konnten nicht geplant werden:', error);
    }
}
