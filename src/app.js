/**
 * app.js | Goldstandard-UI-Logik
 * Fokus: Trennung von Daten (via API) und Darstellung.
 * Visuelle Bausteine (Karten, Badges, Icons) folgen 1:1 dem Design-System
 * aus C:\minimalist-landing-gen-main (Farben, Radien, Typografie, Lucide-Icons).
 */
import { Calculator, ermittleEffektivesZahlungsdatum, parseBetrag, formatiereBetrag, formatiereZahlDE } from './calculator.js';
import { oeffneKuendigungsschreibenModal } from './kuendigungsschreiben.js';

const ICON_WALLET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>';
const ICON_LAYERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>';
const ICON_CALENDAR_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 14v2.2l1.6 1"/><path d="M16 2v4"/><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M3 10h5"/><path d="M8 2v4"/><circle cx="16" cy="16" r="6"/></svg>';
const ICON_ALARM_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>';
const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
const ICON_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.986L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>';
const ICON_X_CIRCLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
const ICON_DOWNLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>';

// Kategorie-Farbzuordnung 1:1 aus AboActionView.tsx (CATEGORY_STYLES)
const KATEGORIE_BADGE_KLASSE = {
    Streaming: 'badge-cat-violet',
    Musik: 'badge-cat-sky',
    Software: 'badge-cat-teal',
    Sport: 'badge-cat-lime',
    Versicherung: 'badge-cat-amber',
    Energie: 'badge-cat-rose',
    Telekommunikation: 'badge-cat-sky',
    Wohnen: 'badge-cat-violet',
    Sonstiges: 'badge-cat-muted'
};

let aktiverKategorieFilter = 'Alle';

// Zusätzlicher Vorlauf vor der eigentlichen Kündigungsfrist, ab dem ein Abo
// als "Bald fällig" (gelb) statt "Sicher" (grün) angezeigt wird. Erst wenn
// die Frist selbst erreicht ist, gilt ein Abo als "Kritisch" (rot).
const WARNSCHWELLE_TAGE = 14;

const STATUS_LABEL = {
    kritisch: 'Kritisch',
    warnung: 'Bald fällig',
    sicher: 'Sicher',
    gekuendigt: 'Gekündigt'
};

const STATUS_BADGE_KLASSE = {
    kritisch: 'badge-status-critical',
    warnung: 'badge-status-warnung',
    sicher: 'badge-status-safe',
    gekuendigt: 'badge-status-gekuendigt'
};

// Verhindert, dass Anführungszeichen im Namen das value-Attribut der
// Bearbeiten-Inputs vorzeitig schließen und das Formular kaputt rendern.
function escapeAttr(text) {
    return String(text).replace(/"/g, '&quot;');
}

function berechneTageBisZahlung(datum) {
    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const ziel = new Date(datum);
    return Math.round((ziel - heute) / (1000 * 60 * 60 * 24));
}

// Tage bis zur tatsächlich nächsten (turnusgerecht vorgerückten) Zahlung eines
// Abos — nie negativ für ein weiterhin laufendes Abo, siehe
// ermittleEffektivesZahlungsdatum in calculator.js.
function tageBisNaechsterZahlung(abo) {
    return berechneTageBisZahlung(ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus));
}

function formatiereDatumISO(datum) {
    const jahr = datum.getFullYear();
    const monat = String(datum.getMonth() + 1).padStart(2, '0');
    const tag = String(datum.getDate()).padStart(2, '0');
    return `${jahr}-${monat}-${tag}`;
}

function erzeugeFilterChips(alleAbos) {
    const kategorien = ['Alle', ...new Set(alleAbos.map((abo) => abo.kategorie))];

    const chipsDiv = document.createElement('div');
    chipsDiv.className = 'filter-chips';
    chipsDiv.innerHTML = kategorien.map((kat) => `
        <button type="button" class="filter-chip ${kat === aktiverKategorieFilter ? 'active' : ''}" data-kategorie="${kat}">${kat}</button>
    `).join('');

    chipsDiv.querySelectorAll('.filter-chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            aktiverKategorieFilter = chip.dataset.kategorie;
            zeigeAbos();
        });
    });

    return chipsDiv;
}

function erzeugeStatTile(icon, label, value, tone) {
    return `
        <div class="glass stat-tile">
            <div class="stat-icon tone-${tone}">${icon}</div>
            <div class="stat-body">
                <p class="stat-label">${label}</p>
                <p class="stat-value tone-${tone}">${value}</p>
            </div>
        </div>
    `;
}

// Reine Berechnung, unabhängig vom DOM — einzige Quelle der Wahrheit für die
// vier Übersichtskacheln. Wird bei JEDER Datenänderung (Hinzufügen, Bearbeiten,
// Kündigen-Markierung, Löschen) über zeigeAbos() neu aus den frisch von der
// API geladenen Daten berechnet, nie aus lokal fortgeschriebenem UI-Zustand —
// so kann die Anzeige nie von der tatsächlichen Datenlage abweichen.
function berechneStatistiken(alleAbos) {
    const aktiveAbos = alleAbos.filter((abo) => !abo.gekuendigt);
    const kritischeAnzahl = aktiveAbos.filter(
        (abo) => tageBisNaechsterZahlung(abo) <= abo.kuendigungsfristTage
    ).length;

    return {
        aktiveAnzahl: aktiveAbos.length,
        kostenProMonat: Calculator.berechneMonatsSumme(aktiveAbos),
        kostenProJahr: Calculator.berechneJahresSumme(aktiveAbos),
        kritischeAnzahl
    };
}

function renderStatistiken(statsGrid, statistiken) {
    statsGrid.innerHTML = [
        erzeugeStatTile(ICON_LAYERS, 'Aktive Abos', String(statistiken.aktiveAnzahl), 'primary'),
        erzeugeStatTile(ICON_WALLET, 'Kosten / Monat', `${formatiereZahlDE(statistiken.kostenProMonat)} €`, 'neutral'),
        erzeugeStatTile(ICON_CALENDAR_CLOCK, 'Kosten / Jahr', `${formatiereZahlDE(statistiken.kostenProJahr)} €`, 'primary'),
        erzeugeStatTile(ICON_ALARM_CLOCK, 'Fristen fällig', String(statistiken.kritischeAnzahl), statistiken.kritischeAnzahl > 0 ? 'warning' : 'neutral')
    ].join('');
}

// tageBisZahlung wird von aufrufender Seite übergeben (aus dem turnusgerecht
// vorgerückten Datum berechnet, siehe erzeugeAboKachel) — so existiert pro
// Render-Durchlauf nur eine einzige Quelle der Wahrheit für "wie viele Tage
// bis zur nächsten Zahlung", die niemals fälschlich negativ wird.
function ermittleAboStatus(abo, tageBisZahlung) {
    if (abo.gekuendigt) return 'gekuendigt';
    if (tageBisZahlung <= abo.kuendigungsfristTage) return 'kritisch';
    if (tageBisZahlung <= abo.kuendigungsfristTage + WARNSCHWELLE_TAGE) return 'warnung';
    return 'sicher';
}

function erzeugeAboAnsicht(abo, tageBisZahlung, effektivesZahlungsdatum) {
    const status = ermittleAboStatus(abo, tageBisZahlung);
    const kategorieKlasse = KATEGORIE_BADGE_KLASSE[abo.kategorie] || 'badge-cat-muted';

    const statusBadge = `<span class="badge ${STATUS_BADGE_KLASSE[status]}">${STATUS_LABEL[status]}</span>`;

    return `
        <div class="abo-top">
            <div class="abo-left">
                <div class="abo-icon">${ICON_WALLET}</div>
                <div>
                    <div class="abo-name-row">
                        <span class="abo-name">${abo.name}</span>
                        <span class="badge ${kategorieKlasse}">${abo.kategorie}</span>
                    </div>
                    <p class="abo-meta">${abo.turnus} | ${abo.waehrung}</p>
                </div>
            </div>
            <div class="abo-right">
                <p class="abo-price">${formatiereBetrag(abo.kosten, abo.waehrung)}</p>
                <p class="abo-price-sub">Nächste Zahlung: ${formatiereDatumISO(effektivesZahlungsdatum)}</p>
            </div>
        </div>
        <div class="abo-bottom">
            <div class="abo-bottom-info">
                ${statusBadge}
                <span class="abo-status-pill">${tageBisZahlung} Tage bis Zahlung · Frist ${abo.kuendigungsfristTage} Tage</span>
            </div>
            <div class="abo-aktionen">
                <button type="button" class="btn btn-outline btn-sm edit-btn">${ICON_EDIT} Bearbeiten</button>
                ${abo.gekuendigt ? '' : `<button type="button" class="btn btn-outline btn-sm cancel-btn">${ICON_X_CIRCLE} Kündigen</button>`}
                <button type="button" class="btn btn-outline btn-sm export-btn">${ICON_DOWNLOAD} Exportieren</button>
                <button type="button" class="btn btn-outline btn-sm delete-btn">${ICON_TRASH} Löschen</button>
            </div>
            <p class="karte-export-status" aria-live="polite"></p>
        </div>
    `;
}

const KUENDIGUNGS_KATEGORIEN = Object.keys(KATEGORIE_BADGE_KLASSE);
const KUENDIGUNGS_TURNUSSE = ['Monatlich', 'Vierteljährlich', 'Halbjährlich', 'Jährlich'];

function erzeugeAboBearbeitenFormular(abo) {
    return `
        <form class="abo-edit-form">
            <div class="form-group">
                <label>Abo-Name</label>
                <input type="text" class="input-control" data-feld="name" value="${escapeAttr(abo.name)}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Kosten</label>
                    <input type="text" inputmode="decimal" class="input-control" data-feld="kosten" value="${escapeAttr(formatiereZahlDE(abo.kosten))}" placeholder="z.B. 29,99">
                </div>
                <div class="form-group">
                    <label>Währung</label>
                    <input type="text" class="input-control" data-feld="waehrung" value="${escapeAttr(abo.waehrung)}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Turnus</label>
                    <select class="input-control select-control" data-feld="turnus">
                        ${KUENDIGUNGS_TURNUSSE.map((t) => `<option value="${t}" ${t === abo.turnus ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Kategorie</label>
                    <select class="input-control select-control" data-feld="kategorie">
                        ${KUENDIGUNGS_KATEGORIEN.map((k) => `<option value="${k}" ${k === abo.kategorie ? 'selected' : ''}>${k}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Nächste Zahlung</label>
                    <input type="date" class="input-control" data-feld="naechsteZahlung" value="${escapeAttr(abo.naechsteZahlung)}">
                </div>
                <div class="form-group">
                    <label>Frist (Tage)</label>
                    <input type="number" class="input-control" data-feld="kuendigungsfristTage" value="${escapeAttr(abo.kuendigungsfristTage)}">
                </div>
            </div>
            <div class="abo-edit-aktionen">
                <button type="button" class="btn btn-primary btn-sm save-btn">Speichern</button>
                <button type="button" class="btn btn-outline btn-sm cancel-edit-btn">Abbrechen</button>
            </div>
            <p class="edit-fehler" aria-live="polite"></p>
        </form>
    `;
}

function verdrahteAboAnsicht(kachel, abo) {
    kachel.querySelector('.delete-btn').addEventListener('click', () => window.aboLoeschen(abo.id));
    kachel.querySelector('.edit-btn').addEventListener('click', () => zeigeBearbeitenModus(kachel, abo));
    const kuendigenBtn = kachel.querySelector('.cancel-btn');
    if (kuendigenBtn) {
        // Der Klick öffnet NUR das Kündigungsschreiben — er setzt das Abo nicht
        // automatisch auf "gekündigt". Diese Statusänderung ist ein bewusster,
        // separater Schritt innerhalb des Modals (siehe kuendigungsschreiben.js).
        kuendigenBtn.addEventListener('click', () => oeffneKuendigungsschreibenModal(abo));
    }
    kachel.querySelector('.export-btn').addEventListener('click', () => exportiereAlsDatei(kachel));
}

// Exportiert den kompletten aktuellen Abo-Bestand als eigenständige JSON-Sicherungskopie
// (nicht nur das Abo der geklickten Kachel) — jede Kachel ist damit ein gleichwertiger,
// überall verfügbarer Auslöser für ein Voll-Backup ("damit nichts verloren geht"),
// statt eines einzelnen globalen Buttons an nur einer Stelle der Oberfläche.
async function exportiereAlsDatei(kachel) {
    const statusEl = kachel.querySelector('.karte-export-status');
    try {
        const ergebnis = await window.api.exportAbos();
        if (ergebnis.abgebrochen) {
            if (statusEl) statusEl.textContent = '';
            return;
        }
        if (statusEl) statusEl.textContent = `Gespeichert unter: ${ergebnis.pfad}`;
    } catch (error) {
        if (statusEl) statusEl.textContent = 'Speichern fehlgeschlagen — bitte erneut versuchen.';
    }
}

function zeigeBearbeitenModus(kachel, abo) {
    kachel.innerHTML = erzeugeAboBearbeitenFormular(abo);

    kachel.querySelector('.cancel-edit-btn').addEventListener('click', () => zeigeAbos());

    kachel.querySelector('.save-btn').addEventListener('click', async () => {
        const form = kachel.querySelector('.abo-edit-form');
        const feld = (name) => form.querySelector(`[data-feld="${name}"]`).value;
        const fehlerEl = form.querySelector('.edit-fehler');

        const aktualisiertesAbo = {
            ...abo,
            name: feld('name').trim(),
            kosten: parseBetrag(feld('kosten')),
            waehrung: feld('waehrung').trim(),
            turnus: feld('turnus'),
            kategorie: feld('kategorie'),
            naechsteZahlung: feld('naechsteZahlung'),
            kuendigungsfristTage: parseInt(feld('kuendigungsfristTage'), 10)
        };

        if (!Calculator.istGueltig(aktualisiertesAbo)) {
            if (fehlerEl) fehlerEl.textContent = 'Bitte alle Felder korrekt ausfüllen (inkl. Datum).';
            return;
        }

        await window.api.updateAbo(aktualisiertesAbo);
        await zeigeAbos();
    });
}

function erzeugeAboKachel(abo) {
    const effektivesZahlungsdatum = ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus);
    const tageBisZahlung = berechneTageBisZahlung(effektivesZahlungsdatum);

    const kachel = document.createElement('li');
    kachel.className = `glass abo-karte ${ermittleAboStatus(abo, tageBisZahlung)}`;
    kachel.innerHTML = erzeugeAboAnsicht(abo, tageBisZahlung, effektivesZahlungsdatum);
    verdrahteAboAnsicht(kachel, abo);
    return kachel;
}

// Rendering-Logik
export async function zeigeAbos() {
    const listeDiv = document.getElementById('abo-liste');
    const statsGrid = document.getElementById('stats-grid');
    const filterChipsDiv = document.getElementById('filter-chips');
    const suchBegriff = document.getElementById('input-suche')?.value.toLowerCase() || '';

    // 1. Daten sicher über die API-Bridge holen
    const alleAbos = await window.api.loadAbos();

    // Kategorie existiert nach dem Löschen von Abos evtl. nicht mehr — dann
    // zurück auf "Alle" springen statt eine leere Liste anzuzeigen.
    const verfuegbareKategorien = new Set(alleAbos.map((abo) => abo.kategorie));
    if (aktiverKategorieFilter !== 'Alle' && !verfuegbareKategorien.has(aktiverKategorieFilter)) {
        aktiverKategorieFilter = 'Alle';
    }

    const sichtbareAbos = alleAbos
        .filter((abo) => abo.name.toLowerCase().includes(suchBegriff))
        .filter((abo) => aktiverKategorieFilter === 'Alle' || abo.kategorie === aktiverKategorieFilter)
        .sort((a, b) => {
            // Gekündigte Abos sind für die Kündigungsfrist irrelevant — sie sollen
            // nicht zwischen dringenden aktiven Abos auftauchen, sondern ans Ende.
            if (!!a.gekuendigt !== !!b.gekuendigt) return a.gekuendigt ? 1 : -1;
            return tageBisNaechsterZahlung(a) - tageBisNaechsterZahlung(b);
        });

    filterChipsDiv.innerHTML = '';
    filterChipsDiv.appendChild(erzeugeFilterChips(alleAbos));

    listeDiv.innerHTML = '';

    if (sichtbareAbos.length === 0) {
        listeDiv.innerHTML = '<li class="glass empty-msg">Keine Abos gefunden.</li>';
    } else {
        sichtbareAbos.forEach((abo) => listeDiv.appendChild(erzeugeAboKachel(abo)));
    }

    // 2. Statistik-Kacheln aus den ungefilterten Daten berechnen (unabhängig von
    // Suche/Kategorie-Filter — die vier Kacheln bilden immer den Gesamtbestand ab).
    renderStatistiken(statsGrid, berechneStatistiken(alleAbos));

    return alleAbos;
}

// Globale Schnittstellen für das DOM
window.aboLoeschen = async (id) => {
    await window.api.deleteAbo(id);
    zeigeAbos();
};

window.aboKuendigen = async (id) => {
    const alleAbos = await window.api.loadAbos();
    const abo = alleAbos.find((a) => a.id === id);
    if (!abo) return;
    await window.api.updateAbo({ ...abo, gekuendigt: true });
    zeigeAbos();
};

export async function neuesAboSpeichern() {
    const fehlerEl = document.getElementById('form-fehler');

    const neuesAbo = {
        id: 'abo_' + Date.now(),
        name: document.getElementById('input-name').value.trim(),
        kosten: parseBetrag(document.getElementById('input-kosten').value),
        waehrung: document.getElementById('input-waehrung').value,
        turnus: document.getElementById('input-turnus').value,
        kategorie: document.getElementById('input-kategorie').value,
        naechsteZahlung: document.getElementById('input-datum-iso').value,
        kuendigungsfristTage: parseInt(document.getElementById('input-frist').value, 10)
    };

    // Nicht-blockierende Inline-Meldung statt alert(): ein natives alert() ist
    // in Electron ein echtes, synchrones OS-Dialogfenster, das die gesamte
    // Renderer-Oberfläche einfriert, solange es offen ist — landet es unauffällig
    // im Hintergrund, wirkt die komplette App wie "tot", obwohl sie nur wartet.
    if (!Calculator.istGueltig(neuesAbo)) {
        if (fehlerEl) fehlerEl.textContent = 'Bitte alle Felder korrekt ausfüllen (inkl. Datum).';
        return;
    }

    if (fehlerEl) fehlerEl.textContent = '';
    await window.api.saveAbo(neuesAbo);
    document.getElementById('abo-form').reset();
    await zeigeAbos();
}
