/**
 * de.js | Deutsch — Ausgangssprache von Abo-Warner Pro.
 * Schlüssel sind für alle Sprachen gleich; Platzhalter in {geschweiften
 * Klammern} werden zur Laufzeit ersetzt. Einträge mit ".eins" sind
 * Einzahl-Varianten (z.B. "1 Tag" statt "1 Tage"), siehe tAnzahl in i18n.js.
 */

export default {
    // --- Kopf, Einleitung, Werkzeugleiste ---
    'kopf.hilfe': 'Hilfe',
    'kopf.sprache': 'Sprache',
    'start.titel': 'Abo-Übersicht',
    'start.subline': 'Deine Überwachung',
    'start.untertitel': 'Behalte alle Verträge, Kosten und Kündigungsfristen an einem Ort.',
    'suche.platzhalter': 'Abos durchsuchen oder filtern …',
    'knopf.neuesAbo': 'Neues Abo',

    // --- Übersichtskacheln ---
    'stat.aktiv': 'Aktive Abos',
    'stat.monat': 'Kosten / Monat',
    'stat.jahr': 'Kosten / Jahr',
    'stat.fristen': 'Fristen fällig',

    // --- Liste, Filter, Karten ---
    'filter.alle': 'Alle',
    'liste.leer': 'Keine Abos gefunden.',
    'status.kritisch': 'Kritisch',
    'status.warnung': 'Bald fällig',
    'status.sicher': 'Sicher',
    'status.gekuendigt': 'Gekündigt',
    'karte.gekuendigtZum': 'Gekündigt zum {datum}',
    'karte.moeglichBis': 'Kündigung möglich bis {datum}',
    'karte.keineZahlung': 'Keine weitere Zahlung',
    'karte.naechsteZahlung': 'Nächste Zahlung: {datum}',
    'karte.tageBisZahlung': '{tage} Tage bis Zahlung · Frist {frist} Tage',
    'karte.laeuftHeuteAus': 'Läuft heute aus',
    'karte.laeuftNoch': 'Läuft noch {anzahl} Tage',
    'karte.laeuftNoch.eins': 'Läuft noch {anzahl} Tag',
    'knopf.bearbeiten': 'Bearbeiten',
    'knopf.kuendigen': 'Kündigen',
    'knopf.loeschen': 'Löschen',
    'knopf.speichern': 'Speichern',
    'knopf.abbrechen': 'Abbrechen',
    'knopf.schliessen': 'Schließen',
    'knopf.ok': 'OK',

    // --- Turnus und Kategorien (gespeichert werden immer die deutschen Werte) ---
    'turnus.Monatlich': 'Monatlich',
    'turnus.Vierteljährlich': 'Vierteljährlich',
    'turnus.Halbjährlich': 'Halbjährlich',
    'turnus.Jährlich': 'Jährlich',
    'kategorie.Streaming': 'Streaming',
    'kategorie.Musik': 'Musik',
    'kategorie.Software': 'Software',
    'kategorie.Sport': 'Sport',
    'kategorie.Versicherung': 'Versicherung',
    'kategorie.Energie': 'Energie',
    'kategorie.Telekommunikation': 'Telekommunikation',
    'kategorie.Wohnen': 'Wohnen',
    'kategorie.Sonstiges': 'Sonstiges',

    // --- Formularfelder (Neues Abo + Bearbeiten) ---
    'feld.name': 'Abo-Name',
    'feld.namePlatzhalter': 'z.B. Netflix',
    'feld.kosten': 'Kosten',
    'feld.kostenPlatzhalter': 'z.B. 29,99',
    'feld.waehrung': 'Währung',
    'feld.waehrungPlatzhalter': 'z.B. EUR',
    'feld.turnus': 'Turnus',
    'feld.kategorie': 'Kategorie',
    'feld.naechsteZahlung': 'Nächste Zahlung',
    'feld.datumPlatzhalter': 'Datum auswählen',
    'feld.frist': 'Frist (Tage)',
    'feld.vertragsnummer': 'Vertragsnummer',
    'feld.kundennummer': 'Kundennummer',
    'feld.vertragspartner': 'Vertragspartner (Firmenname und Anschrift)',
    'feld.vertragspartnerPlatzhalter': 'z.B. Musterfirma GmbH\nKundenservice\nMusterstraße 1\n12345 Musterstadt',
    'feld.gekuendigtZum': 'Gekündigt zum (Vertragsende)',
    'feld.fehler': 'Bitte alle Felder korrekt ausfüllen (inkl. Datum).',
    'neu.titel': 'Neues Abo hinzufügen',
    'neu.weitere': 'Weitere Angaben (optional)',
    'neu.weitereHinweis': 'Werden automatisch ins Kündigungsschreiben übernommen.',
    'neu.speichern': 'Abo speichern',
    'edit.vertragsdaten': 'Vertragsdaten',
    'edit.vertragsdatenHinweis': '(optional, für das Kündigungsschreiben)',

    // --- Löschen, Kündigen markieren ---
    'loeschen.titel': 'Wirklich löschen?',
    'loeschen.text': '„{name}“ wird endgültig aus deiner Liste entfernt.',
    'gekuendigt.titel': 'Gekündigt zum',
    'gekuendigt.text': 'Bis zu welchem Datum läuft „{name}“ noch? Bis dahin bleibt das Abo in der Liste und in den Kosten. Den Vorschlag kannst du ändern, z.B. laut Bestätigung des Anbieters.',
    'gekuendigt.label': 'Vertragsende',
    'gekuendigt.speichern': 'Als gekündigt speichern',
    'datum.fehlt': 'Bitte ein Datum auswählen.',

    // --- Kalender ---
    'kalender.wochentage': 'Mo,Di,Mi,Do,Fr,Sa,So',
    'kalender.monate': 'Januar,Februar,März,April,Mai,Juni,Juli,August,September,Oktober,November,Dezember',

    // --- Daten sichern, Wiederherstellen, PDF ---
    'daten.titel': 'Daten sichern',
    'daten.text': 'Deine Abos liegen nur auf diesem Gerät. Erstelle ab und zu eine Sicherung und bewahre sie gut auf, z.B. in deiner Cloud oder per E-Mail an dich selbst.',
    'daten.erstellen': 'Sicherung erstellen',
    'daten.wiederherstellen': 'Sicherung wiederherstellen',
    'daten.pdf': 'Übersicht als PDF',
    'daten.pdfText': 'Eine Liste aller Abos zum Ausdrucken oder Weitergeben. Keine Sicherung — zum Wiederherstellen bitte „Sicherung erstellen“ nutzen.',
    'daten.erstellt': 'Sicherung erstellt: {pfad}',
    'daten.erstellenFehler': 'Sicherung fehlgeschlagen — bitte erneut versuchen.',
    'daten.zuGross': 'Die Datei ist zu groß für eine Abo-Warner-Sicherung. Deine vorhandenen Abos bleiben unverändert.',
    'daten.nichtLesbar': 'Die Datei konnte nicht gelesen werden. Deine vorhandenen Abos bleiben unverändert.',
    'daten.ersetzenTitel': 'Vorhandene Abos ersetzen?',
    'daten.enthaelt': 'Die Sicherung enthält {anzahl}. ',
    'daten.werdenErsetzt': 'Deine aktuellen {anzahl} werden dadurch ersetzt.',
    'daten.keineVorhanden': 'Zurzeit sind keine Abos gespeichert.',
    'daten.ersetzen': 'Ersetzen',
    'daten.abgebrochen': 'Wiederherstellung abgebrochen. Es wurde nichts geändert.',
    'daten.wiederherstellenFehler': 'Wiederherstellen fehlgeschlagen. Bitte erneut versuchen.',
    'daten.wiederhergestellt': 'Sicherung wiederhergestellt: {anzahl}.',
    'daten.pdfErstellt': 'PDF erstellt: {pfad}',
    'daten.pdfFehler': 'PDF konnte nicht erstellt werden — bitte erneut versuchen.',
    'anzahl.abos': '{anzahl} Abos',
    'anzahl.abos.eins': '1 Abo',

    // --- Prüfung von Sicherungsdateien (sicherung.js) ---
    'sicherung.nichtsGeaendert': 'Deine vorhandenen Abos bleiben unverändert.',
    'sicherung.leer': 'Die Datei ist leer.',
    'sicherung.zuGross': 'Die Datei ist zu groß für eine Abo-Warner-Sicherung.',
    'sicherung.unlesbar': 'Diese Datei ist keine Abo-Warner-Sicherung (Inhalt nicht lesbar).',
    'sicherung.fremd': 'Diese Datei ist keine Abo-Warner-Sicherung.',
    'sicherung.keineAbos': 'Die Sicherung enthält keine Abos.',
    'sicherung.beschaedigt': 'Die Sicherung ist beschädigt: {ungueltig} von {gesamt} Einträgen sind unvollständig.',
    'sicherung.doppelt': 'Die Sicherung ist beschädigt (doppelte Einträge).',

    // --- Teilen-Menü (Titel) und Dateinamen ---
    'teilen.export': 'Abo-Warner Export',
    'teilen.schreiben': 'Kündigungsschreiben',
    'teilen.pdf': 'Abo-Übersicht',
    'datei.schreiben': 'Kuendigung',
    'datei.pdf': 'Abo-Uebersicht',

    // --- Kündigungsschreiben: Fenster ---
    'brief.titel': 'Kündigungsschreiben — {name}',
    'brief.fristHinweis': 'Damit die Kündigung rechtzeitig wirkt, muss sie bis zum <strong>{datum}</strong> beim Anbieter sein.',
    'brief.absender': 'Dein Absender:',
    'brief.absenderKurz': '{name}, {ort} (ändern)',
    'brief.bitteAusfuellen': 'bitte ausfüllen',
    'brief.feldName': 'Name',
    'brief.feldNamePlatzhalter': 'Max Mustermann',
    'brief.feldStrasse': 'Straße und Hausnummer',
    'brief.feldStrassePlatzhalter': 'Musterstraße 1',
    'brief.feldPlzOrt': 'PLZ und Ort',
    'brief.feldPlzOrtPlatzhalter': '12345 Musterstadt',
    'brief.feldEmail': 'E-Mail',
    'brief.feldEmailHinweis': '(optional, für die Bestätigung)',
    'brief.optional': 'optional',
    'brief.merkHinweis': 'Wird auf diesem Gerät gemerkt und beim nächsten Mal automatisch eingesetzt.',
    'brief.tipp': 'Tipp: {liste} kannst du beim Abo unter „Bearbeiten“ hinterlegen. Dann stehen sie automatisch im Schreiben.',
    'brief.tippAnschrift': 'Anschrift des Anbieters',
    'brief.tippVertragsnummer': 'Vertragsnummer',
    'brief.tippKundennummer': 'Kundennummer',
    'brief.schreiben': 'Dein Schreiben',
    'brief.schreibenHinweis': '(kannst du hier noch anpassen)',
    'brief.kopieren': 'In Zwischenablage kopieren',
    'brief.teilen': 'Als Datei teilen',
    'brief.markieren': 'Abo als gekündigt markieren',
    'brief.kopiert': 'In die Zwischenablage kopiert.',
    'brief.kopierenFehler': 'Kopieren fehlgeschlagen — bitte Text manuell markieren und kopieren.',
    'brief.gespeichert': 'Gespeichert unter: {pfad}',
    'brief.speichernFehler': 'Speichern fehlgeschlagen — bitte erneut versuchen.',

    // --- Kündigungsschreiben: Text ---
    'brief.platzhalterName': '[Dein Name]',
    'brief.platzhalterStrasse': '[Straße und Hausnummer]',
    'brief.platzhalterPlzOrt': '[PLZ und Ort]',
    'brief.betreff': 'Kündigung: {name}',
    'brief.vertragsnummer': 'Vertragsnummer: {nummer}',
    'brief.kundennummer': 'Kundennummer: {nummer}',
    'brief.anrede': 'Sehr geehrte Damen und Herren,',
    'brief.kern': 'hiermit kündige ich den oben genannten Vertrag fristgerecht zum nächstmöglichen Zeitpunkt.',
    'brief.bestaetigungMail': 'Bitte bestätigen Sie mir die Kündigung und das Vertragsende per E-Mail an {email}.',
    'brief.bestaetigung': 'Bitte bestätigen Sie mir die Kündigung und das Vertragsende schriftlich.',
    'brief.gruss': 'Mit freundlichen Grüßen',
    // Leer = keine Unterschriftslinie (deutsche Fassung wie bisher).
    'brief.unterschriftslinie': '',

    // --- Hinweis beim App-Start und Mitteilungen ---
    'hinweis.titel': 'Kündigungsfrist endet bald',
    'hinweis.zeile': 'Kündigung nur noch bis {datum}',
    'mitteilung.fristTitel': 'Kündigungsfrist',
    'mitteilung.fristText': '{name}: Kündigung nur noch bis {datum} möglich.',
    'mitteilung.endeTitel': 'Vertragsende',
    'mitteilung.endeText': '{name} endet heute.',

    // --- PDF-Übersicht ---
    'pdf.titel': 'Abo-Übersicht',
    'pdf.untertitel': 'Abo-Warner Pro · erstellt am {datum} · {anzahl}',
    'pdf.spalteAbo': 'Abo',
    'pdf.spalteKosten': 'Kosten',
    'pdf.spalteTurnus': 'Turnus',
    'pdf.spalteZahlung': 'Nächste Zahlung',
    'pdf.spalteKuendigung': 'Kündigung möglich bis',
    'pdf.spalteStatus': 'Status',
    'pdf.laeuft': 'läuft',
    'pdf.gekuendigtZum': 'gekündigt zum {datum}',
    'pdf.beendet': 'beendet (zum {datum})',
    'pdf.gekuendigt': 'gekündigt',
    'pdf.leer': 'Keine Abos gespeichert.',
    'pdf.summe': 'Summe der laufenden Abos ({anzahl}):',
    'pdf.proMonat': 'pro Monat: {betrag} €',
    'pdf.proJahr': 'pro Jahr: {betrag} €',
    'pdf.hinweis': 'Gekündigte Abos zählen bis zu ihrem Vertragsende mit.',
    'pdf.fremdwaehrung': ' Andere Währungen sind mit einem Richtkurs in Euro umgerechnet.',
    'pdf.seite': 'Seite {seite} von {anzahl}',
    'pdf.fusszeile': 'Erstellt mit Abo-Warner Pro – alle Angaben ohne Gewähr, Grundlage sind deine eigenen Eingaben.',

    // --- Sprache ---
    'sprache.titel': 'Sprache',
    'sprache.auto': 'Automatisch (Sprache des Geräts)',
    'sprache.uebernehmen': 'Übernehmen',

    // --- Fußzeile, Rechtliches, Kontakt ---
    'fuss.datenschutz': 'Datenschutz',
    'fuss.impressum': 'Impressum',
    'fuss.kontakt': 'Kontakt',
    'fuss.von': 'Von AppVektor',
    'rechtlich.datenschutz': 'Datenschutzerklärung',
    'rechtlich.impressum': 'Impressum',
    'rechtlich.kontakt': 'Kontakt',
    'kontakt.ueberschrift': 'Fragen, Feedback oder Datenschutzanfragen',
    'kontakt.schreib': 'Schreib uns per E-Mail:',
    'kontakt.kopieren': 'Adresse kopieren',
    'kontakt.kopiert': 'Adresse kopiert.',
    'kontakt.kopierenFehler': 'Kopieren nicht möglich — markiere die Adresse und kopiere sie manuell.',
    'kontakt.keinMailProgramm': 'Öffnet sich kein Mail-Programm, kopiere die Adresse und schreib uns aus deinem gewohnten Mail-Dienst.',
    'kontakt.telefon': 'Telefon: 0049 421 9899 1701',

    'datenschutz.inhalt': `
                <h3>1. Verantwortlicher</h3>
                <p>
                    AppVektor, Inhaber: Jens Hübeler<br>
                    c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern, Deutschland<br>
                    E-Mail: kontakt@appvektor.com<br>
                    Telefon: 0049 421 9899 1701
                </p>

                <h3>2. Zweck der Datenverarbeitung und verarbeitete Daten</h3>
                <p>Abo-Warner Pro verarbeitet ausschließlich die Daten, die du selbst einträgst (Abo-Name, Kosten, Kategorie, Zahlungs- und Kündigungsfristen). Diese werden lokal in einer Datei auf deinem Gerät gespeichert (im nutzerspezifischen Anwendungsdatenverzeichnis deines Betriebssystems). Es findet keine Übertragung dieser Daten an den Anbieter oder an Dritte statt.</p>

                <h3>3. Server-Logs, Hosting und externe Dienste</h3>
                <p>AppVektor betreibt keinen Server, der Daten aus der App empfängt; entsprechend fallen bei AppVektor keine Server-Logs zu deiner Nutzung der App an. Die von der App verwendeten Schriftarten sind lokal in der App gespeichert; die App lädt keine Inhalte von externen Servern nach. Es werden keine Analyse-, Tracking- oder Werbedienste eingebunden. Beziehst du die App über einen App-Store (z. B. Apple App Store oder Google Play), verarbeitet dessen Betreiber die dabei anfallenden Daten in eigener Verantwortung.</p>
                <p>Ganz unten in der App findest du einen Link zu appvektor.com. Tippst du ihn an, öffnet sich die Website im Browser deines Geräts; dort gilt die Datenschutzerklärung der Website. Die App selbst überträgt dabei keine Daten.</p>

                <h3>4. Keine Analyse und kein Tracking</h3>
                <p>Abo-Warner Pro verwendet keine Cookies, keine Analyse-Software und kein Nutzer-Tracking.</p>

                <h3>5. Speicherdauer</h3>
                <p>Deine Daten bleiben lokal gespeichert, bis du sie über die App löschst, bearbeitest oder exportierst, oder bis du die App deinstallierst.</p>

                <h3>6. Deine Rechte</h3>
                <p>Da alle Daten ausschließlich lokal auf deinem Gerät liegen, kannst du dein Recht auf Auskunft, Berichtigung und Löschung (Art. 15, 16, 17 DSGVO) jederzeit direkt über die Funktionen „Bearbeiten", „Löschen" und „Sicherung erstellen" (unter „Daten sichern") in der App ausüben. Für weitergehende Anfragen wende dich an die im Impressum genannte Kontaktadresse. Zudem steht dir ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde zu (Art. 77 DSGVO).</p>

                <h3>7. Kontakt für Datenschutzanfragen</h3>
                <p>Für Anfragen zum Datenschutz oder zur Ausübung deiner Rechte erreichst du uns unter kontakt@appvektor.com oder telefonisch unter 0049 421 9899 1701.</p>
            `,

    'impressum.inhalt': `
                <h3>Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</h3>
                <p>
                    AppVektor<br>
                    Inhaber: Jens Hübeler<br>
                    c/o Flexdienst – #21882<br>
                    Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern<br>
                    Deutschland
                </p>

                <h3>Kontakt</h3>
                <p>
                    E-Mail: kontakt@appvektor.com<br>
                    Telefon: 0049 421 9899 1701
                </p>

                <h3>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
                <p>Jens Hübeler, c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74, 67663 Kaiserslautern</p>
            `,

    'hilfe.titel': 'Hilfe',
    'hilfe.inhalt': `
                <h3>Was kann die App?</h3>
                <p>Abo-Warner Pro behält deine Abos und Verträge im Blick: was sie kosten, wann du zahlst und bis wann du kündigen kannst. 7 Tage bevor eine Kündigungsfrist endet, erinnert dich die App mit einer Mitteilung, wenn du Mitteilungen erlaubst. Alle Daten bleiben nur auf deinem Handy.</p>

                <h3>Wie lege ich ein Abo an?</h3>
                <ol>
                    <li>Tippe auf „Neues Abo“.</li>
                    <li>Trag den Namen, die Kosten und den Turnus ein (wie oft du zahlst, z.B. monatlich).</li>
                    <li>Wähle das Datum der nächsten Zahlung.</li>
                    <li>Trag die Kündigungsfrist in Tagen ein (siehe unten).</li>
                    <li>Wenn du willst: Unter „Weitere Angaben“ Vertragsnummer, Kundennummer und Anschrift des Anbieters eintragen. Die stehen dann automatisch im Kündigungsschreiben.</li>
                    <li>Tippe auf „Abo speichern“.</li>
                </ol>
                <p>Ändern kannst du alles später mit „Bearbeiten“ auf der Karte.</p>

                <h3>Was bedeutet die Frist?</h3>
                <p>Die Kündigungsfrist sagt, wie viele Tage vor der nächsten Zahlung deine Kündigung beim Anbieter sein muss. Du findest sie in deinem Vertrag. Steht dort z.B. „3 Monate“, trag rund 90 Tage ein, im Zweifel lieber etwas mehr.</p>
                <p>Die App rechnet daraus das Datum aus und zeigt es auf jeder Karte: „Kündigung möglich bis …“. Ist das Datum vorbei, zeigt sie dir die nächste Möglichkeit.</p>

                <h3>Was bedeuten Rot, Gelb und Grün?</h3>
                <ul class="hilfe-farben">
                    <li><span class="hilfe-punkt rot" aria-hidden="true"></span><strong>Rot:</strong> Nur noch 7 Tage oder weniger bis zum Kündigungsdatum. Jetzt handeln, wenn du das Abo nicht mehr willst. Zu Beginn dieser 7 Tage bekommst du eine Mitteilung.</li>
                    <li><span class="hilfe-punkt gelb" aria-hidden="true"></span><strong>Gelb:</strong> Noch höchstens 30 Tage Zeit.</li>
                    <li><span class="hilfe-punkt gruen" aria-hidden="true"></span><strong>Grün:</strong> Noch mehr als 30 Tage Zeit.</li>
                    <li><span class="hilfe-punkt grau" aria-hidden="true"></span><strong>Graues Etikett „Gekündigt zum …“:</strong> Das Abo ist gekündigt. Bis zu diesem Datum bleibt die Karte ganz normal an ihrem Platz, denn so lange zahlst du noch. Danach wird sie blasser und rutscht ans Ende der Liste.</li>
                </ul>

                <h3>Wie kündige ich?</h3>
                <ol>
                    <li>Tippe auf der Karte auf „Kündigen“.</li>
                    <li>Die App schreibt dir ein fertiges Kündigungsschreiben. Deinen Namen und deine Anschrift trägst du nur einmal ein.</li>
                    <li>Kopiere das Schreiben oder teile es als Datei und schick es an den Anbieter. Die App verschickt nichts selbst. Am besten so, dass du einen Nachweis hast (z.B. E-Mail mit Eingangsbestätigung oder Einschreiben).</li>
                    <li>Tippe auf „Abo als gekündigt markieren“ und wähle das Vertragsende. Bis dahin bleibt das Abo in der Liste, denn so lange zahlst du noch. Am letzten Tag bekommst du eine Mitteilung: „… endet heute.“</li>
                </ol>

                <h3>Wie sichere ich meine Daten?</h3>
                <p>Deine Abos sind nur auf diesem Handy gespeichert. Wenn du die App löschst oder das Handy verlierst, sind sie weg. Deshalb ganz unten unter „Daten sichern“:</p>
                <ul>
                    <li><strong>Sicherung erstellen:</strong> speichert alle Abos in einer Datei. Leg sie an einem sicheren Ort ab, z.B. in deiner Cloud oder per E-Mail an dich selbst.</li>
                    <li><strong>Sicherung wiederherstellen:</strong> liest so eine Datei wieder ein, z.B. auf einem neuen Handy. Achtung: Die Abos auf dem Handy werden dabei ersetzt.</li>
                    <li><strong>Übersicht als PDF:</strong> eine Liste zum Ausdrucken oder Weitergeben. Das ist keine Sicherung.</li>
                </ul>

                <h3>Noch Fragen?</h3>
                <p>Tippe ganz unten auf „Kontakt“ und schreib uns.</p>
            `
};
