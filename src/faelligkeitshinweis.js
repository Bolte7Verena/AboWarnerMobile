/**
 * faelligkeitshinweis.js | Hinweis auf Abos, die in GENAU 3 Tagen fällig
 * werden (turnusgerecht vorgerücktes Zahlungsdatum, siehe
 * ermittleEffektivesZahlungsdatum in calculator.js).
 *
 * Zwei sich ergänzende Mechanismen, mobil-typisch erweitert gegenüber der
 * Desktop-Version:
 * 1. zeigeFaelligkeitshinweisFallsNoetig() — derselbe In-App-Toast wie auf
 *    dem Desktop, für sofortiges Feedback, falls die App gerade offen ist.
 * 2. planeFaelligkeitsBenachrichtigungen() — NEU für Mobile: plant echte
 *    native Local Notifications, die auch dann erscheinen, wenn die App
 *    geschlossen ist (auf dem Desktop gibt es dafür keine Entsprechung, da
 *    Electron-Apps nicht im Hintergrund laufen).
 */

import { ermittleEffektivesZahlungsdatum, formatiereBetrag } from './calculator.js';
import { LocalNotifications } from '@capacitor/local-notifications';
import { berechneBenachrichtigungsPlan } from './benachrichtigungsplan.js';

const TAGE_SCHWELLE = 3;

const ICON_ALARM_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function berechneTageBisZahlung(datum) {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    return Math.round((datum - heute) / (1000 * 60 * 60 * 24));
}

function ermittleFaelligeAbos(alleAbos) {
    return alleAbos.filter((abo) => {
        if (abo.gekuendigt) return false;
        const effektivesDatum = ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus);
        return berechneTageBisZahlung(effektivesDatum) === TAGE_SCHWELLE;
    });
}

export function zeigeFaelligkeitshinweisFallsNoetig(alleAbos) {
    const faelligeAbos = ermittleFaelligeAbos(alleAbos);
    if (faelligeAbos.length === 0) return;

    const toast = document.createElement('div');
    toast.className = 'glass-strong faelligkeit-toast';
    toast.innerHTML = `
        <div class="faelligkeit-toast-header">
            <div class="faelligkeit-toast-icon">${ICON_ALARM_CLOCK}</div>
            <p class="faelligkeit-toast-title">In 3 Tagen fällig</p>
            <button type="button" class="faelligkeit-toast-close-btn" aria-label="Schließen">${ICON_X}</button>
        </div>
        <ul class="faelligkeit-toast-liste">
            ${faelligeAbos.map((abo) => `
                <li class="faelligkeit-toast-item"><strong>${escapeHtml(abo.name)}</strong> — ${escapeHtml(formatiereBetrag(abo.kosten, abo.waehrung))}</li>
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
