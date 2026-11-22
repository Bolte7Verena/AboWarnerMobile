/**
 * app.js | Goldstandard-UI-Logik
 * Fokus: Trennung von Daten (via API) und Darstellung.
 * Visuelle Bausteine (Karten, Badges, Icons) folgen 1:1 dem Design-System
 * aus C:\minimalist-landing-gen-main (Farben, Radien, Typografie, Lucide-Icons).
 */
import { Calculator, FRIST_EINHEITEN, istProbezeitLaufend, ermittleFristAngabe, erzeugeFristFelder, ermittleEffektivesZahlungsdatum, parseBetrag, parseFristAnzahl, formatiereDatumISO, ermittleKuendigungsfrist, ermittleFristStatus, istGekuendigtLaufend, istVertragBeendet, schlageVertragsendeVor, parseDatumISO, sortiereAbos } from './calculator.js';
import { initDatePicker } from './datepicker.js';
import { t, tAnzahl, tWert, formatiereDatum, formatiereZahlEingabe, formatiereBetrag } from './i18n.js';
import { oeffneKuendigungsschreibenModal } from './kuendigungsschreiben.js';
import { frageBestaetigung, frageDatum, zeigeMeldung } from './bestaetigung.js';
import { planeFaelligkeitsBenachrichtigungen } from './faelligkeitshinweis.js';
import { pruefeSicherung, MAX_DATEIGROESSE_BYTES } from './sicherung.js';
import { ermittleHauptwaehrung, normalisiereWaehrung } from './waehrungen.js';
import { fuelleWaehrungsAuswahl, waehrungsOptionen } from './waehrungsauswahl.js';
import { erzeugeUebersichtPdf, dateinameUebersicht } from './uebersicht-pdf.js';

// Nach jeder Datenänderung: Liste neu zeichnen UND die nativen
// Benachrichtigungen neu planen — sonst blieben z.B. nach einer Kündigung
// alte Zahlungserinnerungen stehen bzw. fehlte die "endet heute"-Meldung,
// bis die App das nächste Mal neu gestartet wird. (Nicht bei Suche/Filter,
// dort ändern sich keine Daten.)
async function nachDatenaenderung() {
    const alleAbos = await zeigeAbos();
    // Bewusst nicht abgewartet: Fehler werden in der Funktion selbst
    // abgefangen und dürfen die Oberfläche nicht blockieren. Sind die Abos gerade
    // nicht lesbar, bleiben die schon geplanten Erinnerungen stehen.
    if (!window.api.speicherGesperrt()) planeFaelligkeitsBenachrichtigungen(alleAbos);
    return alleAbos;
}

// Speichern fehlgeschlagen: deutlich sagen, dass sich nichts geändert hat.
function meldeSpeicherfehler() {
    return zeigeMeldung({ titel: t('speichern.titel'), text: t('speichern.fehler') });
}

// Abo-Datei war beschädigt oder ist nicht lesbar (siehe speicher.js).
function zeigeSpeicherMeldung() {
    const meldung = window.api.speicherMeldung();
    if (!meldung) return;
    zeigeMeldung({
        titel: t(`speicher.${meldung.art}Titel`),
        text: t(`speicher.${meldung.art}Text`, { anzahl: anzahlText(meldung.anzahl) })
    });
}

const ICON_WALLET = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/></svg>';
const ICON_LAYERS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/></svg>';
const ICON_CALENDAR_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 14v2.2l1.6 1"/><path d="M16 2v4"/><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M3 10h5"/><path d="M8 2v4"/><circle cx="16" cy="16" r="6"/></svg>';
const ICON_ALARM_CLOCK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M5 3 2 6"/><path d="m22 6-3-3"/><path d="M6.38 18.7 4 21"/><path d="M17.64 18.67 20 21"/></svg>';
const ICON_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
const ICON_EDIT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.986L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>';
const ICON_X_CIRCLE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>';
const ICON_KALENDER = '<svg class="date-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>';

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

const STATUS_BADGE_KLASSE = {
    kritisch: 'badge-status-critical',
    warnung: 'badge-status-warnung',
    sicher: 'badge-status-safe',
    gekuendigt: 'badge-status-gekuendigt'
};

// Für value-Attribute: auch & maskieren, sonst würde aus einem Namen wie
// "A&copy B" beim Bearbeiten "A© B".
function escapeAttr(text) {
    return escapeHtml(text);
}

// Vollständiges Maskieren für Freitext-Felder (z.B. Vertragspartner-Anschrift
// in einer <textarea>), damit eingetippte Zeichen wie < > & nie als HTML
// interpretiert werden.
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
    const ziel = new Date(datum);
    ziel.setHours(0, 0, 0, 0);
    return Math.round((ziel - heute) / (1000 * 60 * 60 * 24));
}

function erzeugeFilterChips(alleAbos) {
    const kategorien = ['Alle', ...new Set(alleAbos.map((abo) => abo.kategorie))];

    const chipsDiv = document.createElement('div');
    chipsDiv.className = 'filter-chips';
    chipsDiv.innerHTML = kategorien.map((kat) => `
        <button type="button" class="filter-chip ${kat === aktiverKategorieFilter ? 'active' : ''}" data-kategorie="${escapeHtml(kat)}">${escapeHtml(kat === 'Alle' ? t('filter.alle') : tWert('kategorie', kat))}</button>
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
    // Gekündigte Abos zählen bis zu ihrem Vertragsende weiter mit — bis dahin
    // wird ja noch gezahlt (z.B. Miete). Für "Fristen fällig" sind sie egal,
    // da bereits gekündigt.
    const aktiveAbos = alleAbos.filter((abo) => !istVertragBeendet(abo));
    // Zählt genau die rot markierten Karten (gleiche Regel wie ermittleAboStatus).
    const kritischeAnzahl = aktiveAbos.filter(
        (abo) => !abo.gekuendigt && ermittleFristStatus(abo) === 'kritisch'
    ).length;

    const hauptwaehrung = ermittleHauptwaehrung(alleAbos);
    return {
        aktiveAnzahl: aktiveAbos.length,
        hauptwaehrung,
        summen: Calculator.berechneSummen(aktiveAbos, hauptwaehrung),
        kritischeAnzahl
    };
}

// Summe in der Hauptwährung; umgerechnete Summen tragen ein "ca.".
function summeHtml(betrag, { hauptwaehrung, summen }) {
    const zahl = formatiereBetrag(betrag, hauptwaehrung);
    // Sehr große Summen kleiner, statt sie mit "…" abzuschneiden.
    const groesse = zahl.length > 18 ? ' sehr-lang' : zahl.length > 12 ? ' lang' : '';
    const text = `<span class="stat-betrag${groesse}">${escapeHtml(zahl)}</span>`;
    return summen.umgerechnet ? `<span class="stat-ca">${escapeHtml(t('summe.ca'))}</span> ${text}` : text;
}

function renderStatistiken(statsGrid, statistiken) {
    const { summen } = statistiken;
    statsGrid.innerHTML = [
        erzeugeStatTile(ICON_LAYERS, t('stat.aktiv'), String(statistiken.aktiveAnzahl), 'primary'),
        erzeugeStatTile(ICON_WALLET, t('stat.monat'), summeHtml(summen.monat, statistiken), 'neutral'),
        erzeugeStatTile(ICON_CALENDAR_CLOCK, t('stat.jahr'), summeHtml(summen.jahr, statistiken), 'primary'),
        erzeugeStatTile(ICON_ALARM_CLOCK, t('stat.fristen'), String(statistiken.kritischeAnzahl), statistiken.kritischeAnzahl > 0 ? 'warning' : 'neutral'),
        summen.nichtEnthalten.length > 0 ? `<p class="stat-hinweis">${escapeHtml(t('summe.nichtEnthalten', { liste: summen.nichtEnthalten.join(', ') }))}</p>` : ''
    ].join('');
}

// Farbe der Karte/des Etiketts. Richtet sich nach der Frist, die auf der
// Karte angezeigt wird ("Kündigung möglich bis ..."), siehe
// ermittleFristStatus in calculator.js.
function ermittleAboStatus(abo) {
    if (abo.gekuendigt) return 'gekuendigt';
    return ermittleFristStatus(abo);
}

// Text im Status-Etikett der Karte. Für laufende Abos statt "Kritisch"/
// "Bald fällig"/"Sicher" das konkrete Datum, bis zu dem gekündigt werden
// kann. Die Farbe (rot/gelb/grün) bezieht sich auf genau dieses Datum.
function erzeugeStatusText(abo, status) {
    if (status === 'gekuendigt') {
        // Ältere, vor 2.0.2 gekündigte Abos haben kein Vertragsende hinterlegt.
        return abo.gekuendigtZum ? t('karte.gekuendigtZum', { datum: formatiereDatum(abo.gekuendigtZum) }) : t('status.gekuendigt');
    }
    if (istProbezeitLaufend(abo)) return t('karte.probeEndet', { datum: formatiereDatum(abo.probeEndeAm) });
    const frist = ermittleKuendigungsfrist(abo);
    return frist ? t('karte.moeglichBis', { datum: formatiereDatum(frist.fristDatum) }) : t(`status.${status}`);
}

// Zeile unter dem Preis. Bei gekündigten Abos, deren Vertragsende vor der
// nächsten regulären Zahlung liegt, gibt es keine weitere Zahlung mehr.
function erzeugeZahlungsZeile(abo, effektivesZahlungsdatum) {
    const ende = parseDatumISO(abo.gekuendigtZum);
    if (abo.gekuendigt && ende && parseDatumISO(effektivesZahlungsdatum) > ende) return t('karte.keineZahlung');
    return t('karte.naechsteZahlung', { datum: formatiereDatum(effektivesZahlungsdatum) });
}

// "30 Tage", "4 Wochen", "3 Monate" — so, wie der Nutzer die Frist eingetragen hat.
function fristText(abo) {
    const { anzahl, einheit } = ermittleFristAngabe(abo);
    return tAnzahl(`frist.${einheit}`, anzahl);
}

// Grauer Hinweis neben dem Etikett.
function erzeugeStatusPill(abo, tageBisZahlung) {
    if (!abo.gekuendigt) {
        return `<span class="abo-status-pill">${tAnzahl('karte.tageBisZahlung', tageBisZahlung, { tage: tageBisZahlung, frist: fristText(abo) })}</span>`;
    }
    if (istGekuendigtLaufend(abo)) {
        const tage = berechneTageBisZahlung(parseDatumISO(abo.gekuendigtZum));
        return `<span class="abo-status-pill">${tage === 0 ? t('karte.laeuftHeuteAus') : tAnzahl('karte.laeuftNoch', tage)}</span>`;
    }
    return '';
}

function erzeugeAboAnsicht(abo, tageBisZahlung, effektivesZahlungsdatum) {
    const status = ermittleAboStatus(abo);
    const kategorieKlasse = KATEGORIE_BADGE_KLASSE[abo.kategorie] || 'badge-cat-muted';

    const statusBadge = `<span class="badge ${STATUS_BADGE_KLASSE[status]}">${erzeugeStatusText(abo, status)}</span>`;

    return `
        <div class="abo-top">
            <div class="abo-icon">${ICON_WALLET}</div>
            <div class="abo-kopf">
                <div class="abo-zeile">
                    <div class="abo-name-row">
                        <span class="abo-name">${escapeHtml(abo.name)}</span>
                        <span class="badge ${kategorieKlasse}">${escapeHtml(tWert('kategorie', abo.kategorie))}</span>
                        ${istProbezeitLaufend(abo) ? `<span class="badge badge-probe">${escapeHtml(t('karte.probeBadge'))}</span>` : ''}
                    </div>
                    <p class="abo-price">${escapeHtml(formatiereBetrag(abo.kosten, abo.waehrung))}</p>
                </div>
                <div class="abo-unterzeile">
                    <p class="abo-meta">${escapeHtml(tWert('turnus', abo.turnus))} | ${escapeHtml(normalisiereWaehrung(abo.waehrung))}</p>
                    <p class="abo-price-sub">${erzeugeZahlungsZeile(abo, effektivesZahlungsdatum)}</p>
                </div>
            </div>
        </div>
        <div class="abo-bottom">
            <div class="abo-bottom-info">
                ${statusBadge}
                ${erzeugeStatusPill(abo, tageBisZahlung)}
            </div>
            <div class="abo-aktionen">
                <button type="button" class="btn btn-outline btn-sm edit-btn">${ICON_EDIT} ${t('knopf.bearbeiten')}</button>
                ${abo.gekuendigt ? '' : `<button type="button" class="btn btn-outline btn-sm cancel-btn">${ICON_X_CIRCLE} ${t('knopf.kuendigen')}</button>`}
                <button type="button" class="btn btn-outline btn-sm delete-btn">${ICON_TRASH} ${t('knopf.loeschen')}</button>
            </div>
        </div>
    `;
}

const KUENDIGUNGS_KATEGORIEN = Object.keys(KATEGORIE_BADGE_KLASSE);
const KUENDIGUNGS_TURNUSSE = ['Monatlich', 'Vierteljährlich', 'Halbjährlich', 'Jährlich'];

function erzeugeAboBearbeitenFormular(abo) {
    const fristAngabe = ermittleFristAngabe(abo);
    // Eigene Kategorie (z.B. aus einer Sicherung) mit anbieten, sonst würde sie
    // beim Speichern still durch die erste der Liste ersetzt.
    const kategorien = KUENDIGUNGS_KATEGORIEN.includes(abo.kategorie) ? KUENDIGUNGS_KATEGORIEN : [abo.kategorie || 'Sonstiges', ...KUENDIGUNGS_KATEGORIEN.filter((k) => abo.kategorie || k !== 'Sonstiges')];
    return `
        <form class="abo-edit-form">
            <div class="form-group">
                <label>${t('feld.name')}</label>
                <input type="text" class="input-control" data-feld="name" value="${escapeAttr(abo.name)}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t('feld.kosten')}</label>
                    <input type="text" inputmode="decimal" class="input-control" data-feld="kosten" value="${escapeAttr(formatiereZahlEingabe(abo.kosten))}" placeholder="${escapeHtml(t('feld.kostenPlatzhalter'))}">
                </div>
                <div class="form-group">
                    <label>${t('feld.waehrung')}</label>
                    <select class="input-control select-control" data-feld="waehrung">${waehrungsOptionen(abo.waehrung)}</select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t('feld.turnus')}</label>
                    <select class="input-control select-control" data-feld="turnus">
                        ${KUENDIGUNGS_TURNUSSE.map((wert) => `<option value="${wert}" ${wert === abo.turnus ? 'selected' : ''}>${escapeHtml(tWert('turnus', wert))}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>${t('feld.kategorie')}</label>
                    <select class="input-control select-control" data-feld="kategorie">
                        ${kategorien.map((k) => `<option value="${escapeHtml(k)}" ${k === abo.kategorie ? 'selected' : ''}>${escapeHtml(tWert('kategorie', k))}</option>`).join('')}
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group date-field">
                    <label>${t('feld.naechsteZahlung')}</label>
                    <div class="date-input-wrap">
                        <input type="text" class="input-control date-input" data-datum-anzeige="naechsteZahlung" placeholder="${escapeHtml(t('feld.datumPlatzhalter'))}" readonly autocomplete="off">
                        ${ICON_KALENDER}
                        <div class="date-picker-popover" hidden></div>
                    </div>
                    <input type="hidden" data-feld="naechsteZahlung" value="${escapeAttr(abo.naechsteZahlung)}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>${t('feld.frist')}</label>
                    <div class="frist-eingabe">
                        <input type="number" class="input-control frist-anzahl" min="0" step="1" inputmode="numeric" data-feld="fristAnzahl" value="${escapeAttr(fristAngabe.anzahl)}">
                        <select class="input-control select-control frist-einheit" data-feld="fristEinheit" aria-label="${escapeAttr(t('feld.fristEinheit'))}">
                            ${FRIST_EINHEITEN.map((e) => `<option value="${e}" ${e === fristAngabe.einheit ? 'selected' : ''}>${escapeHtml(t(`einheit.${e}`))}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>
            <div class="probe-bereich">
                <label class="schalter">
                    <input type="checkbox" class="schalter-input" data-feld="probeabo" ${abo.probeabo === true ? 'checked' : ''}>
                    <span class="schalter-regler" aria-hidden="true"></span>
                    <span class="schalter-text">${escapeHtml(t('feld.probe'))}</span>
                </label>
                <div class="form-group date-field probe-datum-gruppe" ${abo.probeabo === true ? '' : 'hidden'}>
                    <label>${t('feld.probeEnde')}</label>
                    <div class="date-input-wrap">
                        <input type="text" class="input-control date-input" data-datum-anzeige="probeEndeAm" placeholder="${escapeHtml(t('feld.datumPlatzhalter'))}" readonly autocomplete="off">
                        ${ICON_KALENDER}
                        <div class="date-picker-popover" hidden></div>
                    </div>
                    <input type="hidden" data-feld="probeEndeAm" value="${escapeAttr(abo.probeEndeAm || '')}">
                </div>
            </div>
            ${abo.gekuendigt ? `
            <div class="form-group date-field">
                <label>${t('feld.gekuendigtZum')}</label>
                <div class="date-input-wrap">
                    <input type="text" class="input-control date-input" data-datum-anzeige="gekuendigtZum" placeholder="${escapeHtml(t('feld.datumPlatzhalter'))}" readonly autocomplete="off">
                    ${ICON_KALENDER}
                    <div class="date-picker-popover" hidden></div>
                </div>
                <input type="hidden" data-feld="gekuendigtZum" value="${escapeAttr(abo.gekuendigtZum || '')}">
            </div>` : ''}
            <fieldset class="vertragsdaten">
                <legend>${t('edit.vertragsdaten')} <span class="legend-hinweis">${t('edit.vertragsdatenHinweis')}</span></legend>
                <div class="form-row">
                    <div class="form-group">
                        <label>${t('feld.vertragsnummer')}</label>
                        <input type="text" class="input-control" data-feld="vertragsnummer" value="${escapeHtml(abo.vertragsnummer || '')}" autocomplete="off">
                    </div>
                    <div class="form-group">
                        <label>${t('feld.kundennummer')}</label>
                        <input type="text" class="input-control" data-feld="kundennummer" value="${escapeHtml(abo.kundennummer || '')}" autocomplete="off">
                    </div>
                </div>
                <div class="form-group">
                    <label>${t('feld.vertragspartner')}</label>
                    <textarea class="input-control textarea-control" data-feld="vertragspartner" rows="4" placeholder="${escapeHtml(t('feld.vertragspartnerPlatzhalter')).replace(/\n/g, '&#10;')}">${escapeHtml(abo.vertragspartner || '')}</textarea>
                </div>
            </fieldset>
            <div class="abo-edit-aktionen">
                <button type="button" class="btn btn-primary btn-sm save-btn">${t('knopf.speichern')}</button>
                <button type="button" class="btn btn-outline btn-sm cancel-edit-btn">${t('knopf.abbrechen')}</button>
            </div>
            <p class="edit-fehler" aria-live="polite"></p>
        </form>
    `;
}

// Probeabo-Felder zum Speichern. Schalter aus: Felder entfallen (undefined
// wird beim Speichern als JSON weggelassen). Schalter an ohne Datum: ungültig
// (probeEndeAm leer), istGueltig meldet dann den Fehler.
function probeFelder(an, endeISO) {
    return an ? { probeabo: true, probeEndeAm: endeISO || '' } : { probeabo: undefined, probeEndeAm: undefined };
}

function verdrahteAboAnsicht(kachel, abo) {
    kachel.querySelector('.delete-btn').addEventListener('click', async () => {
        // Löschen ist nicht rückgängig zu machen — daher immer erst nachfragen.
        const bestaetigt = await frageBestaetigung({
            titel: t('loeschen.titel'),
            text: t('loeschen.text', { name: abo.name }),
            bestaetigenText: t('knopf.loeschen'),
            abbrechenText: t('knopf.abbrechen'),
            gefaehrlich: true
        });
        if (bestaetigt) await window.aboLoeschen(abo.id);
    });
    kachel.querySelector('.edit-btn').addEventListener('click', () => zeigeBearbeitenModus(kachel, abo));
    const kuendigenBtn = kachel.querySelector('.cancel-btn');
    if (kuendigenBtn) {
        // Der Klick öffnet NUR das Kündigungsschreiben — er setzt das Abo nicht
        // automatisch auf "gekündigt". Diese Statusänderung ist ein bewusster,
        // separater Schritt innerhalb des Modals (siehe kuendigungsschreiben.js).
        kuendigenBtn.addEventListener('click', () => oeffneKuendigungsschreibenModal(abo));
    }
}

// --- "Daten sichern": eine zentrale Stelle unter der Liste (ab 2.0.2) ---
// Ersetzt den früheren "Exportieren"-Knopf auf jeder einzelnen Karte.

function zeigeDatenStatus(text, art = '') {
    const statusEl = document.getElementById('daten-status');
    statusEl.textContent = text;
    statusEl.className = `daten-status ${art}`.trim();
}

async function erstelleSicherung() {
    try {
        const ergebnis = await window.api.exportAbos();
        if (ergebnis.abgebrochen) {
            zeigeDatenStatus('');
            return;
        }
        zeigeDatenStatus(t('daten.erstellt', { pfad: ergebnis.pfad }), 'erfolg');
    } catch (error) {
        zeigeDatenStatus(t('daten.erstellenFehler'), 'fehler');
    }
}

function anzahlText(anzahl) {
    return tAnzahl('anzahl.abos', anzahl);
}

// Liest die gewählte Datei, prüft sie vollständig und ersetzt erst nach
// ausdrücklicher Bestätigung den Bestand. Bei jeder Unstimmigkeit: Meldung,
// nichts wird verändert.
async function stelleSicherungWiederHer(datei) {
    if (!datei) return;
    if (datei.size > MAX_DATEIGROESSE_BYTES) {
        zeigeDatenStatus(t('daten.zuGross'), 'fehler');
        return;
    }
    let text;
    try {
        text = await datei.text();
    } catch (error) {
        zeigeDatenStatus(t('daten.nichtLesbar'), 'fehler');
        return;
    }

    const pruefung = pruefeSicherung(text);
    if (!pruefung.ok) {
        zeigeDatenStatus(pruefung.meldung, 'fehler');
        return;
    }

    const vorhandene = await window.api.loadAbos();
    const bestaetigt = await frageBestaetigung({
        titel: t('daten.ersetzenTitel'),
        text: t('daten.enthaelt', { anzahl: anzahlText(pruefung.abos.length) })
            + (vorhandene.length > 0
                ? t('daten.werdenErsetzt', { anzahl: anzahlText(vorhandene.length) })
                : t('daten.keineVorhanden')),
        bestaetigenText: t('daten.ersetzen'),
        abbrechenText: t('knopf.abbrechen'),
        gefaehrlich: true
    });
    if (!bestaetigt) {
        zeigeDatenStatus(t('daten.abgebrochen'));
        return;
    }

    try {
        await window.api.ersetzeAlleAbos(pruefung.abos);
    } catch (error) {
        zeigeDatenStatus(t('daten.wiederherstellenFehler'), 'fehler');
        return;
    }
    aktiverKategorieFilter = 'Alle';
    await nachDatenaenderung();
    zeigeDatenStatus(t('daten.wiederhergestellt', { anzahl: anzahlText(pruefung.abos.length) }), 'erfolg');
}

// "Übersicht als PDF": wird komplett auf dem Gerät erzeugt (uebersicht-pdf.js),
// danach Teilen-Menü. Keine Sicherung, nur zum Lesen/Ausdrucken.
async function erstelleUebersichtPdf() {
    try {
        const abos = await window.api.loadAbosFuerPdf();
        const bytes = erzeugeUebersichtPdf(abos);
        const ergebnis = await window.api.exportPdf(bytes, dateinameUebersicht());
        if (ergebnis.abgebrochen) {
            zeigeDatenStatus('');
            return;
        }
        zeigeDatenStatus(t('daten.pdfErstellt', { pfad: ergebnis.pfad }), 'erfolg');
    } catch (error) {
        zeigeDatenStatus(t('daten.pdfFehler'), 'fehler');
    }
}

export function initDatenSichern() {
    const dateiInput = document.getElementById('input-sicherung-datei');
    document.getElementById('btn-sicherung-erstellen').addEventListener('click', erstelleSicherung);
    document.getElementById('btn-uebersicht-pdf').addEventListener('click', erstelleUebersichtPdf);
    document.getElementById('btn-sicherung-wiederherstellen').addEventListener('click', () => {
        zeigeDatenStatus('');
        dateiInput.click();
    });
    dateiInput.addEventListener('change', async () => {
        const datei = dateiInput.files && dateiInput.files[0];
        // Zurücksetzen, damit dieselbe Datei erneut gewählt werden kann.
        dateiInput.value = '';
        await stelleSicherungWiederHer(datei);
    });
}

// Kalender-Instanzen offener Bearbeiten-Formulare. Werden bei jedem
// Neuzeichnen der Liste (zeigeAbos) abgeräumt, da ihre Formulare dann
// verschwinden.
let offeneEditKalender = [];

function raeumeEditKalenderAuf() {
    offeneEditKalender.forEach((kalender) => kalender.zerstoeren());
    offeneEditKalender = [];
}

function verdrahteDatumsfeld(form, feldName) {
    const wrapEl = form.querySelector(`[data-datum-anzeige="${feldName}"]`).closest('.date-input-wrap');
    offeneEditKalender.push(initDatePicker({
        inputEl: wrapEl.querySelector('.date-input'),
        hiddenEl: form.querySelector(`input[type="hidden"][data-feld="${feldName}"]`),
        wrapEl,
        popoverEl: wrapEl.querySelector('.date-picker-popover')
    }));
}

function zeigeBearbeitenModus(kachel, abo) {
    kachel.innerHTML = erzeugeAboBearbeitenFormular(abo);
    verdrahteDatumsfeld(kachel.querySelector('.abo-edit-form'), 'naechsteZahlung');
    verdrahteDatumsfeld(kachel.querySelector('.abo-edit-form'), 'probeEndeAm');
    const probeSchalter = kachel.querySelector('[data-feld="probeabo"]');
    probeSchalter.addEventListener('change', () => {
        kachel.querySelector('.probe-datum-gruppe').hidden = !probeSchalter.checked;
    });
    if (abo.gekuendigt) verdrahteDatumsfeld(kachel.querySelector('.abo-edit-form'), 'gekuendigtZum');

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
            ...erzeugeFristFelder(parseFristAnzahl(feld('fristAnzahl')), feld('fristEinheit')),
            // Neue, optionale Vertragsdaten (ab 2.0.2). Ältere Abos haben diese
            // Felder nicht — überall wird dann mit '' gerechnet.
            vertragsnummer: feld('vertragsnummer').trim(),
            kundennummer: feld('kundennummer').trim(),
            vertragspartner: feld('vertragspartner').trim(),
            ...probeFelder(form.querySelector('[data-feld="probeabo"]').checked, feld('probeEndeAm'))
        };
        if (abo.gekuendigt) {
            const gekuendigtZum = feld('gekuendigtZum');
            // Leer lassen ist erlaubt (dann gilt das Abo wie bisher als beendet).
            if (gekuendigtZum) aktualisiertesAbo.gekuendigtZum = gekuendigtZum;
        }

        if (!Calculator.istGueltig(aktualisiertesAbo)) {
            if (fehlerEl) fehlerEl.textContent = t('feld.fehler');
            return;
        }

        try {
            await window.api.updateAbo(aktualisiertesAbo);
        } catch (error) {
            // Formular bleibt offen, die Eingaben sind noch da.
            if (fehlerEl) fehlerEl.textContent = t('speichern.fehlerFormular');
            meldeSpeicherfehler();
            return;
        }
        await nachDatenaenderung();
    });
}

function erzeugeAboKachel(abo) {
    const effektivesZahlungsdatum = ermittleEffektivesZahlungsdatum(abo.naechsteZahlung, abo.turnus);
    const tageBisZahlung = berechneTageBisZahlung(effektivesZahlungsdatum);

    const kachel = document.createElement('li');
    // "laufend": gekündigt, aber Vertragsende noch nicht erreicht — wird nicht
    // ausgegraut, da bis dahin weiter gezahlt wird.
    kachel.className = `glass abo-karte ${ermittleAboStatus(abo)}${istGekuendigtLaufend(abo) ? ' laufend' : ''}`;
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
    gezeichnetAm = formatiereDatumISO(new Date());
    raeumeEditKalenderAuf();

    // Kategorie existiert nach dem Löschen von Abos evtl. nicht mehr — dann
    // zurück auf "Alle" springen statt eine leere Liste anzuzeigen.
    const verfuegbareKategorien = new Set(alleAbos.map((abo) => abo.kategorie));
    if (aktiverKategorieFilter !== 'Alle' && !verfuegbareKategorien.has(aktiverKategorieFilter)) {
        aktiverKategorieFilter = 'Alle';
    }

    // Beendete Verträge ans Ende; gekündigte, die noch laufen, bleiben an
    // ihrem gewohnten Platz (siehe sortiereAbos in calculator.js).
    const sichtbareAbos = sortiereAbos(alleAbos
        .filter((abo) => abo.name.toLowerCase().includes(suchBegriff))
        .filter((abo) => aktiverKategorieFilter === 'Alle' || abo.kategorie === aktiverKategorieFilter));

    filterChipsDiv.innerHTML = '';
    filterChipsDiv.appendChild(erzeugeFilterChips(alleAbos));

    listeDiv.innerHTML = '';

    if (sichtbareAbos.length === 0) {
        listeDiv.innerHTML = `<li class="glass empty-msg">${t('liste.leer')}</li>`;
    } else {
        sichtbareAbos.forEach((abo) => listeDiv.appendChild(erzeugeAboKachel(abo)));
    }

    zeigeSpeicherMeldung();

    // 2. Statistik-Kacheln aus den ungefilterten Daten berechnen (unabhängig von
    // Suche/Kategorie-Filter — die vier Kacheln bilden immer den Gesamtbestand ab).
    const statistiken = berechneStatistiken(alleAbos);
    renderStatistiken(statsGrid, statistiken);

    // 3. Vorschlag im Formular "Neues Abo" (nicht, solange es gerade ausgefüllt wird).
    if (document.getElementById('abo-modal-overlay').hidden) {
        fuelleWaehrungsAuswahl(document.getElementById('input-waehrung'), statistiken.hauptwaehrung);
    }

    return alleAbos;
}

// Bleibt die App über Mitternacht im Speicher, zeigten die Karten sonst weiter
// die Termine von gestern. Beim Zurückkehren an einem neuen Tag neu zeichnen und
// Mitteilungen neu planen — aber nie, während gerade etwas ausgefüllt wird.
let gezeichnetAm = '';

export async function aktualisiereBeiNeuemTag() {
    const heute = formatiereDatumISO(new Date());
    if (!gezeichnetAm || heute === gezeichnetAm) return;
    if (offeneEditKalender.length > 0 || document.querySelector('.modal-overlay:not([hidden])')) return;
    await nachDatenaenderung();
}

// Globale Schnittstellen für das DOM
window.aboLoeschen = async (id) => {
    try {
        await window.api.deleteAbo(id);
    } catch (error) {
        await meldeSpeicherfehler();
    }
    await nachDatenaenderung();
};

window.aboKuendigen = async (id) => {
    const alleAbos = await window.api.loadAbos();
    const abo = alleAbos.find((a) => a.id === id);
    if (!abo) return;
    // Vertragsende abfragen — vorbelegt mit dem berechneten Vorschlag, änderbar
    // (z.B. laut Kündigungsbestätigung des Anbieters).
    const gekuendigtZum = await frageDatum({
        titel: t('gekuendigt.titel'),
        text: t('gekuendigt.text', { name: abo.name }),
        label: t('gekuendigt.label'),
        vorschlagISO: formatiereDatumISO(schlageVertragsendeVor(abo)),
        bestaetigenText: t('gekuendigt.speichern')
    });
    if (!gekuendigtZum) return;
    try {
        await window.api.updateAbo({ ...abo, gekuendigt: true, gekuendigtZum });
    } catch (error) {
        await meldeSpeicherfehler();
    }
    await nachDatenaenderung();
};

// Doppeltes Tippen auf "Speichern" darf das Abo nicht zweimal anlegen.
let speichertGerade = false;

export async function neuesAboSpeichern() {
    if (speichertGerade) return false;
    speichertGerade = true;
    try {
        return await speichereNeuesAbo();
    } finally {
        speichertGerade = false;
    }
}

// true, wenn gespeichert wurde.
async function speichereNeuesAbo() {
    const fehlerEl = document.getElementById('form-fehler');

    const neuesAbo = {
        id: 'abo_' + Date.now(),
        name: document.getElementById('input-name').value.trim(),
        kosten: parseBetrag(document.getElementById('input-kosten').value),
        waehrung: document.getElementById('input-waehrung').value,
        turnus: document.getElementById('input-turnus').value,
        kategorie: document.getElementById('input-kategorie').value,
        naechsteZahlung: document.getElementById('input-datum-iso').value,
        ...erzeugeFristFelder(parseFristAnzahl(document.getElementById('input-frist').value), document.getElementById('input-frist-einheit').value),
        // Optional (zugeklappt unter "Weitere Angaben").
        vertragsnummer: document.getElementById('input-vertragsnummer').value.trim(),
        kundennummer: document.getElementById('input-kundennummer').value.trim(),
        vertragspartner: document.getElementById('input-vertragspartner').value.trim(),
        ...probeFelder(document.getElementById('input-probe').checked, document.getElementById('input-probe-datum-iso').value)
    };

    // Nicht-blockierende Inline-Meldung statt alert(): ein natives alert() ist
    // in Electron ein echtes, synchrones OS-Dialogfenster, das die gesamte
    // Renderer-Oberfläche einfriert, solange es offen ist — landet es unauffällig
    // im Hintergrund, wirkt die komplette App wie "tot", obwohl sie nur wartet.
    if (!Calculator.istGueltig(neuesAbo)) {
        if (fehlerEl) fehlerEl.textContent = t('feld.fehler');
        return false;
    }

    if (fehlerEl) fehlerEl.textContent = '';
    try {
        await window.api.saveAbo(neuesAbo);
    } catch (error) {
        // Formular bleibt offen, die Eingaben sind noch da.
        if (fehlerEl) fehlerEl.textContent = t('speichern.fehlerFormular');
        meldeSpeicherfehler();
        return false;
    }
    document.getElementById('abo-form').reset();
    await nachDatenaenderung();
    return true;
}
