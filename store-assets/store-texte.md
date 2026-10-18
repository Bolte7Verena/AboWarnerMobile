<!--
Hinweis für dich (gehört nicht in den Store):
- Entwurf, Stand 2026-09-20, für App Store Connect (Deutsch + Englisch).
- Alle Aussagen sind gegen den Code der Mobile-App geprüft (src/app.js, src/api.js, src/faelligkeitshinweis.js, src/kuendigungsschreiben.js).
- Bewusst NICHT versprochen, weil die App es nicht kann: Texterkennung aus Kontoauszügen, Anbieter-Schnellstartliste, Import/Wiederherstellen von Sicherungen, Bezahlfunktion in der App, automatisches Kündigen oder Versenden, Umrechnung von Währungen.
- Keinen Preis in die Texte schreiben (der Preis wird in App Store Connect eingestellt).
-->

# Deutsch (Primärsprache)

**App-Name** (max. 30 Zeichen, hier 14)
Abo-Warner Pro

**Untertitel** (max. 30 Zeichen, hier 24)
Abos & Kündigungsfristen

**Schlüsselwörter** (max. 100 Zeichen inkl. Kommas, hier 99)
Abo,Abos,Kündigung,Kündigungsfrist,Vertrag,Verträge,Kosten,Erinnerung,Übersicht,Abonnement,Ausgaben

**Beschreibung**

Abo-Warner Pro hilft dir, wiederkehrende Ausgaben und Kündigungsfristen im Blick zu behalten.

Du trägst deine Abos und Verträge selbst ein: mit Name, Kosten, Währung, Zahlungsintervall (monatlich bis jährlich), Kategorie, nächstem Zahlungstermin und Kündigungsfrist. Die App zeigt alles in einer übersichtlichen Liste und rechnet dir die Kosten zusammen.

Das kann die App:

• Abos und Verträge erfassen, bearbeiten und löschen
• Liste durchsuchen und nach Kategorie filtern
• Übersicht auf einen Blick: aktive Abos, Kosten pro Monat, Kosten pro Jahr und wie viele Fristen fällig sind
• Status pro Abo („Sicher", „Bald fällig", „Kritisch", „Gekündigt"), berechnet aus dem Zahlungstermin und der Frist, die du selbst eingibst
• Erinnerung drei Tage vor der nächsten Abbuchung als lokale Benachrichtigung (nur, wenn du es erlaubst)
• Musterschreiben zur Kündigung: Die App erstellt aus deinen Angaben einen Text, den du kopieren oder über das Teilen-Menü weitergeben kannst. Deine Absenderangaben merkt sich die App auf dem Gerät.
• Abos als gekündigt markieren
• Deine Abo-Liste als Datei (JSON) über das Teilen-Menü exportieren

Datenschutz:

• Alle Daten bleiben auf deinem Gerät.
• Kein Konto, kein Tracking, keine Werbung.
• Die App funktioniert ohne Internetverbindung.

Gut zu wissen:

• Termine und Fristen beruhen auf deinen Angaben. Bitte prüfe deine Vertragsunterlagen selbst.
• Das Kündigungsschreiben ist eine Vorlage. Die App kündigt nichts für dich und versendet nichts selbst.
• Die App ist keine Rechtsberatung.

**Was ist neu** (Version 2.0.1)
Erste Veröffentlichung: Abos und Verträge erfassen, Kosten im Blick behalten, Erinnerung drei Tage vor der Abbuchung und Musterschreiben zur Kündigung.

# English

**App name** (max. 30 characters, here 14)
Abo-Warner Pro

**Subtitle** (max. 30 characters, here 28)
Track subscription deadlines

**Keywords** (max. 100 characters incl. commas, here 96)
subscription,subscriptions,cancel,cancellation,deadline,contract,costs,reminder,tracker,expenses

**Description**

Abo-Warner Pro helps you keep track of recurring expenses and cancellation deadlines.

You enter your subscriptions and contracts yourself: name, cost, currency, payment interval (monthly to yearly), category, next payment date and cancellation period. The app shows everything in a clear list and adds up your costs.

What the app does:

• Add, edit and delete subscriptions and contracts
• Search the list and filter by category
• Overview at a glance: active subscriptions, cost per month, cost per year and how many deadlines are due
• A status for each entry ("Safe", "Due soon", "Critical", "Cancelled"), calculated from the payment date and the deadline you enter yourself
• A reminder three days before the next payment as a local notification (only if you allow it)
• Cancellation letter template: the app creates a text from your details that you can copy or pass on via the share sheet. The app remembers your sender details on the device.
• Mark subscriptions as cancelled
• Export your subscription list as a file (JSON) via the share sheet

Privacy:

• All data stays on your device.
• No account, no tracking, no ads.
• The app works without an internet connection.

Good to know:

• Dates and deadlines are based on the details you enter. Please check your contract documents yourself.
• The cancellation letter is a template. The app does not cancel anything for you and does not send anything by itself.
• The app does not provide legal advice.

**What's new** (version 2.0.1)
First release: track subscriptions and contracts, keep an eye on costs, get a reminder three days before payment, and create a cancellation letter template.

> Hinweis zur englischen Fassung: Die App-Oberfläche selbst ist derzeit nur auf Deutsch. Apple erlaubt eine englische Store-Beschreibung, aber Nutzer sehen in der App deutsche Texte. Ob du Englisch überhaupt anbieten willst, ist deine Entscheidung. Die Status-Begriffe in der englischen Beschreibung ("Safe" usw.) sind Übersetzungen der deutschen App-Texte.

# Weitere Felder für App Store Connect (Vorschläge, bitte selbst prüfen)

- **Support-URL:** https://appvektor.com/#kontakt — live geprüft am 2026-10-13: appvektor.com ist erreichbar (Domain angeschlossen) und zeigt den Kontakt-Anker, als Support-URL nutzbar.
- **Datenschutz-URL:** Vorschlag `https://abo-warner-pro.com/datenschutz`. Die App-spezifischen Punkte aus `datenschutz-app.md` (lokale Benachrichtigungen, Teilen-Export, Kündigungsschreiben-Absenderdaten, Apple-/Google-Kaufabwicklung, Offline-Betrieb) stehen dort jetzt als neuer Abschnitt „4. Mobile App (iOS/Android)" im Quellcode (`C:\minimalist-landing-gen-main\src\routes\datenschutz.tsx`) — Stand 2026-10-13 aber nur lokal, noch NICHT live deployed. Vor der Store-Einreichung die Website neu bauen und veröffentlichen, dann live gegenprüfen.
- **Marketing-URL (optional):** https://abo-warner-pro.com
- **Kategorie:** z. B. „Finanzen" (Vorschlag). Altersfreigabe: Der Fragebogen in App Store Connect ergibt vermutlich die niedrigste Stufe, weil die App keine kritischen Inhalte hat; bitte die Fragen selbst beantworten.
- **Datenschutz-Angaben („App Privacy") in App Store Connect:** „Daten werden nicht erhoben" ist konsistent mit dem Code und der Datei `PrivacyInfo.xcprivacy` (kein Tracking, keine erhobenen Daten). Die Antwort trägst du selbst ein.
- **Exportvorschriften:** In der Info.plist steht `ITSAppUsesNonExemptEncryption = false`, damit App Store Connect nicht bei jedem Upload danach fragt.
- **Hinweise für die App-Prüfung (Review Notes):** „Die App speichert alle Daten lokal, hat kein Konto und keine Netzwerkverbindung. Alle Funktionen sind ohne Anmeldung testbar."
