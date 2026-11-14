/**
 * en.js | English.
 * Terminology aligned with the English version of the website
 * (minimalist-landing-gen-main, src/lib/i18n/resources.ts), e.g.
 * "subscription", "Notice period", "Cancel by", "Active subscriptions",
 * "Privacy", "Legal notice", "Copy address", "A product by AppVektor".
 * Missing keys automatically fall back to German (see t() in i18n.js).
 */

export default {
    // --- Header, intro, toolbar ---
    'kopf.hilfe': 'Help',
    'kopf.sprache': 'Language',
    'start.titel': 'Subscription overview',
    'start.subline': 'Your watchlist',
    'start.untertitel': 'Keep all your contracts, costs and cancellation deadlines in one place.',
    'suche.platzhalter': 'Search or filter subscriptions …',
    'knopf.neuesAbo': 'New subscription',

    // --- Overview tiles ---
    'stat.aktiv': 'Active subscriptions',
    'stat.monat': 'Cost / month',
    'stat.jahr': 'Cost / year',
    'stat.fristen': 'Deadlines due',

    // --- List, filters, cards ---
    'filter.alle': 'All',
    'liste.leer': 'No subscriptions found.',
    'status.kritisch': 'Critical',
    'status.warnung': 'Due soon',
    'status.sicher': 'Safe',
    'status.gekuendigt': 'Cancelled',
    'karte.gekuendigtZum': 'Cancelled, ends {datum}',
    'karte.moeglichBis': 'Cancel by {datum}',
    'karte.keineZahlung': 'No further payment',
    'karte.naechsteZahlung': 'Next payment: {datum}',
    'karte.tageBisZahlung': '{tage} days until payment · notice period {frist} days',
    'karte.laeuftHeuteAus': 'Ends today',
    'karte.laeuftNoch': 'Ends in {anzahl} days',
    'karte.laeuftNoch.eins': 'Ends in {anzahl} day',
    'knopf.bearbeiten': 'Edit',
    'knopf.kuendigen': 'Cancel contract',
    'knopf.loeschen': 'Delete',
    'knopf.speichern': 'Save',
    'knopf.abbrechen': 'Cancel',
    'knopf.schliessen': 'Close',
    'knopf.ok': 'OK',

    // --- Billing cycle and categories (stored values stay German) ---
    'turnus.Monatlich': 'Monthly',
    'turnus.Vierteljährlich': 'Quarterly',
    'turnus.Halbjährlich': 'Every 6 months',
    'turnus.Jährlich': 'Yearly',
    'kategorie.Streaming': 'Streaming',
    'kategorie.Musik': 'Music',
    'kategorie.Software': 'Software',
    'kategorie.Sport': 'Sport',
    'kategorie.Versicherung': 'Insurance',
    'kategorie.Energie': 'Energy',
    'kategorie.Telekommunikation': 'Telecoms',
    'kategorie.Wohnen': 'Housing',
    'kategorie.Sonstiges': 'Other',

    // --- Form fields (new subscription + edit) ---
    'feld.name': 'Subscription name',
    'feld.namePlatzhalter': 'e.g. Netflix',
    'feld.kosten': 'Cost',
    'feld.kostenPlatzhalter': 'e.g. 29.99',
    'feld.waehrung': 'Currency',
    'feld.waehrungPlatzhalter': 'e.g. EUR',
    'feld.turnus': 'Billing cycle',
    'feld.kategorie': 'Category',
    'feld.naechsteZahlung': 'Next payment',
    'feld.datumPlatzhalter': 'Select date',
    'feld.frist': 'Notice period (days)',
    'feld.vertragsnummer': 'Contract number',
    'feld.kundennummer': 'Customer number',
    'feld.vertragspartner': 'Provider (company name and address)',
    'feld.vertragspartnerPlatzhalter': 'e.g. Sample Company Ltd\nCustomer Service\n1 Sample Street\nSample City 12345',
    'feld.gekuendigtZum': 'Cancelled, contract ends on',
    'feld.fehler': 'Please fill in all fields correctly (including the date).',
    'neu.titel': 'Add new subscription',
    'neu.weitere': 'More details (optional)',
    'neu.weitereHinweis': 'These are added to your cancellation letter automatically.',
    'neu.speichern': 'Save subscription',
    'edit.vertragsdaten': 'Contract details',
    'edit.vertragsdatenHinweis': '(optional, for your cancellation letter)',

    // --- Delete, mark as cancelled ---
    'loeschen.titel': 'Delete this subscription?',
    'loeschen.text': '“{name}” will be permanently removed from your list.',
    'gekuendigt.titel': 'Contract end date',
    'gekuendigt.text': 'Until which date does “{name}” keep running? Until then, the subscription stays in your list and in your costs. You can change the suggested date, e.g. to match the provider’s confirmation.',
    'gekuendigt.label': 'End of contract',
    'gekuendigt.speichern': 'Save as cancelled',
    'datum.fehlt': 'Please select a date.',

    // --- Calendar ---
    'kalender.wochentage': 'Mo,Tu,We,Th,Fr,Sa,Su',
    'kalender.monate': 'January,February,March,April,May,June,July,August,September,October,November,December',

    // --- Backup, restore, PDF ---
    'daten.titel': 'Back up your data',
    'daten.text': 'Your subscriptions are stored only on this device. Create a backup from time to time and keep it somewhere safe, e.g. in your cloud or by emailing it to yourself.',
    'daten.erstellen': 'Create backup',
    'daten.wiederherstellen': 'Restore backup',
    'daten.pdf': 'Overview as PDF',
    'daten.pdfText': 'A list of all your subscriptions to print or share. This is not a backup — to restore your data later, please use “Create backup”.',
    'daten.erstellt': 'Backup created: {pfad}',
    'daten.erstellenFehler': 'Backup failed — please try again.',
    'daten.zuGross': 'This file is too large to be an Abo-Warner backup. Your existing subscriptions remain unchanged.',
    'daten.nichtLesbar': 'The file could not be read. Your existing subscriptions remain unchanged.',
    'daten.ersetzenTitel': 'Replace existing subscriptions?',
    'daten.enthaelt': 'The backup contains {anzahl}. ',
    'daten.werdenErsetzt': 'Your current {anzahl} will be replaced.',
    'daten.keineVorhanden': 'No subscriptions are saved at the moment.',
    'daten.ersetzen': 'Replace',
    'daten.abgebrochen': 'Restore cancelled. Nothing was changed.',
    'daten.wiederherstellenFehler': 'Restore failed. Please try again.',
    'daten.wiederhergestellt': 'Backup restored: {anzahl}.',
    'daten.pdfErstellt': 'PDF created: {pfad}',
    'daten.pdfFehler': 'The PDF could not be created — please try again.',
    'anzahl.abos': '{anzahl} subscriptions',
    'anzahl.abos.eins': '1 subscription',

    // --- Backup file check (sicherung.js) ---
    'sicherung.nichtsGeaendert': 'Your existing subscriptions remain unchanged.',
    'sicherung.leer': 'The file is empty.',
    'sicherung.zuGross': 'This file is too large to be an Abo-Warner backup.',
    'sicherung.unlesbar': 'This file is not an Abo-Warner backup (content cannot be read).',
    'sicherung.fremd': 'This file is not an Abo-Warner backup.',
    'sicherung.keineAbos': 'The backup does not contain any subscriptions.',
    'sicherung.beschaedigt': 'The backup is damaged: {ungueltig} of {gesamt} entries are incomplete.',
    'sicherung.doppelt': 'The backup is damaged (duplicate entries).',

    // --- Share sheet titles and file names ---
    'teilen.export': 'Abo-Warner backup',
    'teilen.schreiben': 'Cancellation letter',
    'teilen.pdf': 'Subscription overview',
    'datei.schreiben': 'Cancellation',
    'datei.pdf': 'Subscription-overview',

    // --- Cancellation letter: dialog ---
    'brief.titel': 'Cancellation letter — {name}',
    'brief.fristHinweis': 'For the cancellation to take effect in time, the provider must receive it by <strong>{datum}</strong>.',
    'brief.absender': 'Your sender details:',
    'brief.absenderKurz': '{name}, {ort} (edit)',
    'brief.bitteAusfuellen': 'please fill in',
    'brief.feldName': 'Name',
    'brief.feldNamePlatzhalter': 'Jane Doe',
    'brief.feldStrasse': 'Street and house number',
    'brief.feldStrassePlatzhalter': '1 Sample Street',
    'brief.feldPlzOrt': 'Postcode and city',
    'brief.feldPlzOrtPlatzhalter': 'Sample City 12345',
    'brief.feldEmail': 'Email',
    'brief.feldEmailHinweis': '(optional, for the confirmation)',
    'brief.optional': 'optional',
    'brief.merkHinweis': 'Saved on this device and filled in automatically next time.',
    'brief.tipp': 'Tip: you can add the {liste} to the subscription under “Edit”. They will then appear in the letter automatically.',
    'brief.tippAnschrift': 'provider’s address',
    'brief.tippVertragsnummer': 'contract number',
    'brief.tippKundennummer': 'customer number',
    'brief.schreiben': 'Your letter',
    'brief.schreibenHinweis': '(you can still adjust it here)',
    'brief.kopieren': 'Copy to clipboard',
    'brief.teilen': 'Share as file',
    'brief.markieren': 'Mark subscription as cancelled',
    'brief.kopiert': 'Copied to clipboard.',
    'brief.kopierenFehler': 'Copying failed — please select and copy the text manually.',
    'brief.gespeichert': 'Saved as: {pfad}',
    'brief.speichernFehler': 'Saving failed — please try again.',

    // --- Cancellation letter: text (neutral, no reference to German law) ---
    'brief.platzhalterName': '[Your name]',
    'brief.platzhalterStrasse': '[Street and house number]',
    'brief.platzhalterPlzOrt': '[Postcode and city]',
    'brief.betreff': 'Cancellation: {name}',
    'brief.vertragsnummer': 'Contract number: {nummer}',
    'brief.kundennummer': 'Customer number: {nummer}',
    'brief.anrede': 'Dear Sir or Madam,',
    'brief.kern': 'I hereby cancel my contract referred to above at the earliest possible date.',
    'brief.bestaetigungMail': 'Please confirm the cancellation in writing by email to {email}.',
    'brief.bestaetigung': 'Please confirm the cancellation in writing.',
    'brief.gruss': 'Kind regards,',
    'brief.unterschriftslinie': '_______________________',

    // --- Notice at app start and notifications ---
    'hinweis.titel': 'Cancellation deadline ending soon',
    'hinweis.zeile': 'cancel by {datum}',
    'mitteilung.fristTitel': 'Cancellation deadline',
    'mitteilung.fristText': '{name}: cancellation is only possible until {datum}.',
    'mitteilung.endeTitel': 'Contract ends',
    'mitteilung.endeText': '{name} ends today.',

    // --- PDF overview ---
    'pdf.titel': 'Subscription overview',
    'pdf.untertitel': 'Abo-Warner Pro · created on {datum} · {anzahl}',
    'pdf.spalteAbo': 'Subscription',
    'pdf.spalteKosten': 'Cost',
    'pdf.spalteTurnus': 'Billing cycle',
    'pdf.spalteZahlung': 'Next payment',
    'pdf.spalteKuendigung': 'Cancel by',
    'pdf.spalteStatus': 'Status',
    'pdf.laeuft': 'active',
    'pdf.gekuendigtZum': 'cancelled, ends {datum}',
    'pdf.beendet': 'ended ({datum})',
    'pdf.gekuendigt': 'cancelled',
    'pdf.leer': 'No subscriptions saved.',
    'pdf.summe': 'Total of active subscriptions ({anzahl}):',
    'pdf.proMonat': 'per month: {betrag} €',
    'pdf.proJahr': 'per year: {betrag} €',
    'pdf.hinweis': 'Cancelled subscriptions are included until their contract ends.',
    'pdf.fremdwaehrung': ' Other currencies are converted to euros at an approximate rate.',
    'pdf.seite': 'Page {seite} of {anzahl}',
    'pdf.fusszeile': 'Created with Abo-Warner Pro – all information without guarantee, based on your own entries.',

    // --- Language ---
    'sprache.titel': 'Language',
    'sprache.auto': 'Automatic (device language)',
    'sprache.uebernehmen': 'Apply',

    // --- Footer, legal, contact ---
    'fuss.datenschutz': 'Privacy',
    'fuss.impressum': 'Legal notice',
    'fuss.kontakt': 'Contact',
    'fuss.von': 'A product by AppVektor',
    'rechtlich.datenschutz': 'Privacy policy',
    'rechtlich.impressum': 'Legal notice',
    'rechtlich.kontakt': 'Contact',
    'kontakt.ueberschrift': 'Questions, feedback or privacy requests',
    'kontakt.schreib': 'Write to us by email:',
    'kontakt.kopieren': 'Copy address',
    'kontakt.kopiert': 'Address copied.',
    'kontakt.kopierenFehler': 'Copying is not possible — select the address and copy it manually.',
    'kontakt.keinMailProgramm': 'If no mail app opens, copy the address and write to us from your usual email service.',
    'kontakt.telefon': 'Phone: +49 421 9899 1701',

    'datenschutz.inhalt': `
                <p class="rechtlich-sprachhinweis">In case of doubt, the German version applies.</p>

                <h3>1. Controller</h3>
                <p>
                    AppVektor, owner: Jens Hübeler<br>
                    c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern, Germany<br>
                    Email: kontakt@appvektor.com<br>
                    Phone: +49 421 9899 1701
                </p>

                <h3>2. Purpose of processing and data processed</h3>
                <p>Abo-Warner Pro only processes the data you enter yourself (subscription name, cost, category, payment dates and notice periods and, if you enter them, contract number, customer number, the provider's address and your sender details for the cancellation letter). This data is stored only locally in a file on your device (in the user-specific application data directory of your operating system). It is not transmitted to the provider or to any third party.</p>

                <h3>3. Server logs, hosting and external services</h3>
                <p>AppVektor does not operate any server that receives data from the app; accordingly, AppVektor does not hold any server logs about your use of the app. The fonts used by the app are stored locally in the app; the app does not load any content from external servers. No analytics, tracking or advertising services are integrated. If you obtain the app from an app store (e.g. Apple App Store or Google Play), its operator processes the resulting data under its own responsibility.</p>
                <p>At the very bottom of the app you will find a link to appvektor.com. If you tap it, the website opens in your device’s browser; the website’s privacy policy applies there. The app itself does not transmit any data in this process.</p>

                <h3>4. No analytics and no tracking</h3>
                <p>Abo-Warner Pro does not use cookies, analytics software or user tracking.</p>

                <h3>5. Storage period</h3>
                <p>Your data remains stored locally until you delete, edit or export it via the app, or until you uninstall the app.</p>

                <h3>6. Your rights</h3>
                <p>As all data is stored exclusively on your device, you can exercise your rights of access, rectification and erasure (Art. 15, 16, 17 GDPR) at any time directly via the “Edit”, “Delete” and “Create backup” (under “Back up your data”) functions in the app. For further requests, please use the contact address given in the legal notice. You also have the right to lodge a complaint with a data protection supervisory authority (Art. 77 GDPR).</p>

                <h3>7. Contact for privacy requests</h3>
                <p>For privacy requests or to exercise your rights, you can reach us at kontakt@appvektor.com or by phone at +49 421 9899 1701.</p>
            `,

    'impressum.inhalt': `
                <p class="rechtlich-sprachhinweis">In case of doubt, the German version applies.</p>

                <h3>Information pursuant to § 5 DDG (German Digital Services Act)</h3>
                <p>
                    AppVektor<br>
                    Owner: Jens Hübeler<br>
                    c/o Flexdienst – #21882<br>
                    Kurt-Schumacher-Str. 74<br>
                    67663 Kaiserslautern<br>
                    Germany
                </p>

                <h3>Contact</h3>
                <p>
                    Email: kontakt@appvektor.com<br>
                    Phone: +49 421 9899 1701
                </p>

                <h3>Responsible for the content pursuant to § 18 (2) MStV (German Interstate Media Treaty)</h3>
                <p>Jens Hübeler, c/o Flexdienst – #21882, Kurt-Schumacher-Str. 74, 67663 Kaiserslautern, Germany</p>
            `,

    'hilfe.titel': 'Help',
    'hilfe.inhalt': `
                <h3>What does the app do?</h3>
                <p>Abo-Warner Pro keeps track of your subscriptions and contracts: what they cost, when you pay and until when you can cancel. 7 days before a cancellation deadline ends, the app reminds you with a notification, if you allow notifications. All your data stays on your phone only.</p>

                <h3>How do I add a subscription?</h3>
                <ol>
                    <li>Tap “New subscription”.</li>
                    <li>Enter the name, the cost and the billing cycle (how often you pay, e.g. monthly).</li>
                    <li>Choose the date of the next payment.</li>
                    <li>Enter the notice period in days (see below).</li>
                    <li>If you like: under “More details”, enter the contract number, customer number and the provider’s address. They will then appear in your cancellation letter automatically.</li>
                    <li>Tap “Save subscription”.</li>
                </ol>
                <p>You can change everything later with “Edit” on the card.</p>

                <h3>What does the notice period mean?</h3>
                <p>The notice period tells you how many days before the next payment your cancellation must reach the provider. You will find it in your contract. If it says e.g. “3 months”, enter about 90 days — if in doubt, a little more.</p>
                <p>The app works out the date and shows it on every card: “Cancel by …”. Once that date has passed, it shows you the next possible date.</p>

                <h3>What do red, yellow and green mean?</h3>
                <ul class="hilfe-farben">
                    <li><span class="hilfe-punkt rot" aria-hidden="true"></span><strong>Red:</strong> 7 days or less until the cancellation deadline. Act now if you no longer want the subscription. At the start of these 7 days you will get a notification.</li>
                    <li><span class="hilfe-punkt gelb" aria-hidden="true"></span><strong>Yellow:</strong> 30 days or less left.</li>
                    <li><span class="hilfe-punkt gruen" aria-hidden="true"></span><strong>Green:</strong> More than 30 days left.</li>
                    <li><span class="hilfe-punkt grau" aria-hidden="true"></span><strong>Grey label “Cancelled, ends …”:</strong> The subscription has been cancelled. Until that date, the card stays in its usual place, because you are still paying until then. After that, it fades and moves to the end of the list.</li>
                </ul>

                <h3>How do I cancel?</h3>
                <ol>
                    <li>Tap “Cancel contract” on the card.</li>
                    <li>The app writes a ready-made cancellation letter for you. You only need to enter your name and address once.</li>
                    <li>Copy the letter or share it as a file and send it to the provider. The app does not send anything itself. Ideally, send it in a way that gives you proof (e.g. an email with a confirmation of receipt, or a registered letter).</li>
                    <li>Tap “Mark subscription as cancelled” and choose the end of the contract. Until then, the subscription stays in your list, because you are still paying. On the last day you will get a notification: “… ends today.”</li>
                </ol>

                <h3>How do I back up my data?</h3>
                <p>Your subscriptions are stored only on this phone. If you delete the app or lose your phone, they are gone. That is why, at the very bottom under “Back up your data”, you will find:</p>
                <ul>
                    <li><strong>Create backup:</strong> saves all subscriptions in a file. Keep it somewhere safe, e.g. in your cloud or by emailing it to yourself.</li>
                    <li><strong>Restore backup:</strong> reads such a file back in, e.g. on a new phone. Please note: the subscriptions on the phone will be replaced.</li>
                    <li><strong>Overview as PDF:</strong> a list to print or share. This is not a backup.</li>
                </ul>

                <h3>Any questions?</h3>
                <p>Tap “Contact” at the very bottom and write to us.</p>
            `
};
