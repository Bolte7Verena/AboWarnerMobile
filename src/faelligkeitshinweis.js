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

const TAGE_SCHWELLE = 3;
const BENACHRICHTIGUNGS_UHRZEIT = { stunde: 9, minute: 0 };

const ICON_ALARM_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>';
const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

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
                <li class="faelligkeit-toast-item"><strong>${abo.name}</strong> — ${formatiereBetrag(abo.kosten, abo.waehrung)}</li>
            `).join('')}
        </ul>
    `;

    document.body.appendChild(toast);

    toast.querySelector('.faelligkeit-toast-close-btn').addEventListener('click', () => {
        toast.remove();
    });
}

// Deterministische, positive 32-Bit-Ganzzahl aus der (String-)Abo-ID —
// Capacitor-Notification-IDs müssen Ganzzahlen sein, abo.id ist ein String.
function hasheZuId(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = (hash * 31 + text.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) || 1;
}

export async function planeFaelligkeitsBenachrichtigungen(alleAbos) {
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

        const jetzt = new Date();

        const benachrichtigungen = alleAbos
            .filter((abo) => !abo.gekuendigt)
            .map((abo) => {
                const effektivesDatum = ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus);
                const termin = new Date(effektivesDatum);
                termin.setDate(termin.getDate() - TAGE_SCHWELLE);
                termin.setHours(BENACHRICHTIGUNGS_UHRZEIT.stunde, BENACHRICHTIGUNGS_UHRZEIT.minute, 0, 0);
                return { abo, termin };
            })
            // Nur Termine in der Zukunft lassen sich planen.
            .filter(({ termin }) => termin > jetzt)
            .map(({ abo, termin }) => ({
                id: hasheZuId(abo.id),
                title: 'In 3 Tagen fällig',
                body: `${abo.name} wird in 3 Tagen abgebucht (${formatiereBetrag(abo.kosten, abo.waehrung)}).`,
                schedule: { at: termin }
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
