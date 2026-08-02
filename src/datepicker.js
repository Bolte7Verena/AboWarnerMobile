/**
 * datepicker.js | Eigenständiges Kalender-Popover für das Datumsfeld.
 * Ersetzt <input type="date">, dessen natives "tt.mm.jjjj"-Placeholder und
 * dessen Kalender-Popup sich nicht ins dunkle Design einfügen lassen.
 */

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONATE = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const ICON_CHEVRON_LEFT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
const ICON_CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';

function pad(zahl) {
    return String(zahl).padStart(2, '0');
}

function zuISO(datum) {
    return `${datum.getFullYear()}-${pad(datum.getMonth() + 1)}-${pad(datum.getDate())}`;
}

function zuDeutschemFormat(datum) {
    return `${pad(datum.getDate())}.${pad(datum.getMonth() + 1)}.${datum.getFullYear()}`;
}

export function initDatePicker({ inputEl, hiddenEl, wrapEl, popoverEl, formEl }) {
    const heute = new Date();
    let sichtJahr = heute.getFullYear();
    let sichtMonat = heute.getMonth();
    let ausgewaehltesDatum = null;

    function istOffen() {
        return !popoverEl.hidden;
    }

    function positioniereSauber() {
        const wrapRect = wrapEl.getBoundingClientRect();
        const popoverRect = popoverEl.getBoundingClientRect();
        const scrollContainer = wrapEl.closest('.main');
        const containerRect = scrollContainer
            ? scrollContainer.getBoundingClientRect()
            : { top: 0, bottom: window.innerHeight };

        const ABSTAND = 8;
        const platzUnten = containerRect.bottom - wrapRect.bottom - ABSTAND;
        const platzOben = wrapRect.top - containerRect.top - ABSTAND;
        const brauchtFlip = platzUnten < popoverRect.height && platzOben > platzUnten;

        // Maximale Höhe an den tatsächlich verfügbaren Platz in der gewählten Richtung
        // koppeln (nicht nur an einen statischen CSS-Wert) — so bleiben Kopfzeile und
        // Wochentagsreihe garantiert sichtbar, nur das Tage-Raster scrollt bei Bedarf intern.
        const verfuegbarerPlatz = Math.max(160, brauchtFlip ? platzOben : platzUnten);
        popoverEl.style.maxHeight = `${verfuegbarerPlatz}px`;

        // Das Popover hängt (siehe oeffnen()) direkt an <body>, nicht mehr in
        // .date-input-wrap — position:fixed-Koordinaten daher in echten
        // Viewport-Pixeln berechnen statt relativ über CSS calc(100% + ...).
        popoverEl.style.left = `${wrapRect.left}px`;
        if (brauchtFlip) {
            popoverEl.style.top = 'auto';
            popoverEl.style.bottom = `${window.innerHeight - wrapRect.top + ABSTAND}px`;
        } else {
            popoverEl.style.bottom = 'auto';
            popoverEl.style.top = `${wrapRect.bottom + ABSTAND}px`;
        }
    }

    function render() {
        const ersterTagWochentag = (new Date(sichtJahr, sichtMonat, 1).getDay() + 6) % 7;
        const tageImMonat = new Date(sichtJahr, sichtMonat + 1, 0).getDate();
        const tageVormonat = new Date(sichtJahr, sichtMonat, 0).getDate();

        let zellen = '';
        for (let i = 0; i < ersterTagWochentag; i++) {
            zellen += `<button type="button" class="date-picker-day outside" tabindex="-1">${tageVormonat - ersterTagWochentag + 1 + i}</button>`;
        }
        for (let tag = 1; tag <= tageImMonat; tag++) {
            const istHeute = tag === heute.getDate() && sichtMonat === heute.getMonth() && sichtJahr === heute.getFullYear();
            const istAusgewaehlt = ausgewaehltesDatum
                && tag === ausgewaehltesDatum.getDate()
                && sichtMonat === ausgewaehltesDatum.getMonth()
                && sichtJahr === ausgewaehltesDatum.getFullYear();
            const klassen = ['date-picker-day'];
            if (istHeute) klassen.push('today');
            if (istAusgewaehlt) klassen.push('selected');
            zellen += `<button type="button" class="${klassen.join(' ')}" data-tag="${tag}">${tag}</button>`;
        }
        const restZellen = (7 - ((ersterTagWochentag + tageImMonat) % 7)) % 7;
        for (let tag = 1; tag <= restZellen; tag++) {
            zellen += `<button type="button" class="date-picker-day outside" tabindex="-1">${tag}</button>`;
        }

        popoverEl.innerHTML = `
            <div class="date-picker-header">
                <button type="button" class="date-picker-nav-btn" data-nav="-1">${ICON_CHEVRON_LEFT}</button>
                <span class="date-picker-month-label">${MONATE[sichtMonat]} ${sichtJahr}</span>
                <button type="button" class="date-picker-nav-btn" data-nav="1">${ICON_CHEVRON_RIGHT}</button>
            </div>
            <div class="date-picker-weekdays">${WOCHENTAGE.map((tag) => `<span>${tag}</span>`).join('')}</div>
            <div class="date-picker-days">${zellen}</div>
        `;

        popoverEl.querySelectorAll('[data-nav]').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                sichtMonat += parseInt(btn.dataset.nav, 10);
                if (sichtMonat < 0) { sichtMonat = 11; sichtJahr -= 1; }
                if (sichtMonat > 11) { sichtMonat = 0; sichtJahr += 1; }
                render();
            });
        });

        popoverEl.querySelectorAll('.date-picker-day:not(.outside)').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                ausgewaehltesDatum = new Date(sichtJahr, sichtMonat, parseInt(btn.dataset.tag, 10));
                inputEl.value = zuDeutschemFormat(ausgewaehltesDatum);
                hiddenEl.value = zuISO(ausgewaehltesDatum);
                schliessen();
            });
        });

        // Muss NACH dem Befüllen erfolgen, damit popoverEl bereits eine echte
        // (nicht versteckte) Layout-Box hat, sonst liefert getBoundingClientRect 0.
        positioniereSauber();
    }

    function oeffnen() {
        if (ausgewaehltesDatum) {
            sichtJahr = ausgewaehltesDatum.getFullYear();
            sichtMonat = ausgewaehltesDatum.getMonth();
        }
        // Popover per Portal direkt an <body> hängen — löst es aus dem
        // Stacking-Context von .glass-strong (backdrop-filter auf dem
        // Formular-Panel), in dem es sonst gefangen wäre und hinter
        // Elementen von .content-panel gerendert werden könnte.
        document.body.appendChild(popoverEl);
        // Erst sichtbar machen, dann rendern+positionieren — sonst ist die
        // Popover-Box beim ersten Öffnen noch "hidden" und hat keine Ausmaße.
        popoverEl.hidden = false;
        render();
    }

    function schliessen() {
        popoverEl.hidden = true;
    }

    function istInnerhalbFeldOderPopover(el) {
        return wrapEl.contains(el) || popoverEl.contains(el);
    }

    // Verhindert, dass ein Klick auf Nav-/Tages-Buttons den Fokus von inputEl
    // wegnimmt. Ohne das würde ein Klick im Popover zunächst einen blur auf
    // inputEl auslösen; render() ersetzt danach den geklickten Button per
    // innerHTML, wodurch der Browser den Fokus auf <body> zurückfallen lässt —
    // der blur-Handler würde das Popover dann fälschlich mitten in der
    // Interaktion schließen. preventDefault() auf mousedown unterbindet den
    // Fokuswechsel, ohne das nachfolgende click-Event zu beeinträchtigen.
    popoverEl.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    wrapEl.addEventListener('click', oeffnen);
    inputEl.addEventListener('focus', oeffnen);

    // Schließt bei Fokuswechsel weg vom Feld (z.B. Tab-Navigation per Tastatur,
    // die kein 'click'-Event auslöst). Der setTimeout-Puffer ist nötig, weil ein
    // Klick auf einen Tag/Nav-Button zuerst einen blur auf inputEl auslöst,
    // bevor der eigene click-Handler des Buttons feuert — ohne Verzögerung
    // würde schliessen() das Popover verstecken, bevor die Auswahl greift.
    inputEl.addEventListener('blur', () => {
        setTimeout(() => {
            if (istOffen() && !istInnerhalbFeldOderPopover(document.activeElement)) {
                schliessen();
            }
        }, 0);
    });

    // pointerdown statt click: feuert bereits beim Drücken, BEVOR ein Tages-/
    // Nav-Klick über render() das DOM (und damit e.target) verändern kann.
    // Prüft explizit gegen inputEl und popoverEl — landet der Klick in keinem
    // von beiden, wird sofort geschlossen.
    document.addEventListener('pointerdown', (e) => {
        const klickWarInnerhalb = inputEl.contains(e.target) || popoverEl.contains(e.target);
        if (istOffen() && !klickWarInnerhalb) {
            schliessen();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && istOffen()) schliessen();
    });

    if (formEl) {
        formEl.addEventListener('reset', () => {
            ausgewaehltesDatum = null;
            sichtJahr = heute.getFullYear();
            sichtMonat = heute.getMonth();
            // Nicht auf das native Reset-Verhalten von input[type=hidden] verlassen —
            // explizit leeren, damit kein veraltetes ISO-Datum in den nächsten Speichervorgang durchsickert.
            inputEl.value = '';
            hiddenEl.value = '';
            schliessen();
        });
    }
}
