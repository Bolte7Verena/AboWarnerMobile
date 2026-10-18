# Einrichtung für den App Store – Schritt für Schritt (nur du kannst das)

Stand: 2026-09-20. Alles hier passiert in deinen Konten im Browser. Nichts davon kann ich für dich tun. Geheimnisse (Passwörter, die `.p8`-Datei, Tokens) niemals in einen Chat oder in Git legen.

## A. Vorher lokal (Git)

Der Ordner `C:\AboWarnerMobile` ist ein Git-Repo, hat aber noch keinen Remote und noch offene Änderungen.

1. Öffne im Ordner `C:\AboWarnerMobile` ein Terminal und schau mit `git status` nach, was geändert ist (geändert sind u. a. `MOBILE_STATUS.md`, das Android-Manifest, `src/index.html`, `src/rechtliches.js`, `src/style.css`, neu `src/fonts/`, die iOS-Dateien und die neuen Dateien in `store-assets/`).
2. Sicherheit: Schlüsseldateien (`*.jks`, `keystore.properties`, `*.p8`, `*.p12`, `*.mobileprovision`) sind in `.gitignore` ausgeschlossen. Ich habe geprüft, dass keine davon im Repo liegt und auch nie eingecheckt wurde.
3. Alles vormerken und einchecken: `git add .`, dann `git status` noch einmal ansehen, dann `git commit -m "iOS-Vorbereitung für den App Store"`.
4. Der Branch heißt **`master`** (nicht `main`, wie in älteren Notizen steht).

## B. GitHub

1. Auf github.com anmelden (Konto anlegen, falls du keins hast).
2. Oben rechts „+" → „New repository". Name z. B. `abo-warner-mobile`. **Private** wählen. Keine README/`.gitignore` dazulegen lassen. „Create repository".
3. GitHub zeigt dir zwei Befehle an. Im Terminal im Ordner `C:\AboWarnerMobile` eingeben:
   - `git remote add origin <die Adresse, die GitHub anzeigt>`
   - `git push -u origin master`
4. Beim ersten Push fragt Git nach deiner Anmeldung bei GitHub (Browser-Fenster oder Token). Das machst du selbst.

## C. Apple Developer und App Store Connect

1. Auf developer.apple.com dem **Apple Developer Program** beitreten (99 $/Jahr). Die Prüfung kann 1–2 Tage dauern.
2. Entscheiden: **Einzelperson oder Organisation.** Bei einer Einzelperson zeigt der Store deinen persönlichen Namen als Verkäufer, „AppVektor" als Firmenname geht nur mit einem Organisationskonto (dafür braucht Apple u. a. eine D-U-N-S-Nummer). Für EU-Händler zeigt Apple außerdem Adresse, Telefon und E-Mail öffentlich an. Bitte vorher klären, ob du damit einverstanden bist.
3. Auf developer.apple.com → „Certificates, Identifiers & Profiles" → „Identifiers" → neue App-ID mit der Bundle-ID **`com.abowarner.pro`** anlegen.
4. In App Store Connect (appstoreconnect.apple.com) → „Apps" → „+" → „Neue App": Plattform iOS, Name „Abo-Warner Pro", Sprache Deutsch, Bundle-ID `com.abowarner.pro`, SKU frei wählbar (z. B. `abowarnerpro`).
5. Die **numerische App-ID** der neuen App notieren (steht in App Store Connect bei „App-Informationen" als „Apple-ID"). Sie ersetzt später den Platzhalter `0000000000` in `codemagic.yaml`.
6. **Bezahlen:** Unter „Vereinbarungen, Steuern und Bankverbindung" die Vereinbarung für kostenpflichtige Apps annehmen und Bank- und Steuerangaben eintragen. Einfachster Weg für „Einmalkauf": die App als **bezahlte App** anbieten (unter „Preise und Verfügbarkeit" eine Preisstufe wählen). Dafür ist kein eigener Kaufcode nötig.
7. **App-Store-Connect-API-Schlüssel** erzeugen: App Store Connect → „Benutzer und Zugriff" → „Integrationen" → „App Store Connect API" → Schlüssel mit der Rolle **„App-Manager"**. Die `.p8`-Datei sofort herunterladen (geht nur einmal!), Key-ID und Issuer-ID notieren. Datei sicher aufbewahren, nicht ins Repo.

## D. Codemagic

1. Auf codemagic.io mit deinem GitHub-Konto anmelden. Das kostenlose Kontingent reicht für gelegentliche Builds.
2. „Add application" → das Repo `abo-warner-mobile` auswählen. Codemagic findet die Datei `codemagic.yaml` selbst (Workflow „iOS – Build, Sign & TestFlight").
3. Unter „Teams" → „Integrations" → „App Store Connect" eine Verbindung anlegen: `.p8`-Datei, Key-ID und Issuer-ID eintragen. Name der Verbindung **genau `appstore_credentials`** (so steht es in `codemagic.yaml`).
4. In `codemagic.yaml` bei `APP_STORE_APPLE_ID` die echte Zahl aus Schritt C5 eintragen (statt `0000000000`), einchecken (`git commit`) und pushen (`git push`).
5. Im Codemagic-Dashboard den Workflow **manuell starten** („Start new build"). Er baut die App, signiert sie und lädt sie nach TestFlight hoch. Er reicht sie **nicht** automatisch bei Apple zur Prüfung ein (das ist so eingestellt).

## E. Testen

1. Die App aus TestFlight auf einem echten iPhone installieren (TestFlight-App aus dem App Store, dein Apple-ID-Konto als interner Tester).
2. Durchtesten: Abo anlegen, bearbeiten, löschen, Erinnerung erlauben, Kündigungsschreiben erstellen und teilen, Export, Flugmodus an (alles muss auch offline gehen). Die App wurde bisher nie auf einem iOS-Gerät gestartet.

## F. Store-Eintrag fertigstellen und einreichen

1. In App Store Connect bei der App: die Texte aus `store-texte.md` eintragen (Name, Untertitel, Beschreibung, Schlüsselwörter, „Was ist neu").
2. **Screenshots** hochladen (App Store Connect zeigt an, welche iPhone-Größen verlangt werden).
3. **Datenschutz-URL** eintragen: erst möglich, wenn der Text aus `datenschutz-app.md` auf der Website veröffentlicht ist.
4. **Support-URL** eintragen: `https://appvektor.com/#kontakt`, sobald appvektor.com erreichbar ist.
5. „App Privacy" ausfüllen (Vorschlag: „Daten werden nicht erhoben"), Altersfreigabe-Fragebogen, Kategorie, Preisstufe, Copyright.
6. Den getesteten Build aus TestFlight der Version zuordnen, dann „Zur Prüfung einreichen". Apple prüft meist 1–3 Tage.

## G. Offene Punkte / Hinweise

- Die Datenschutz-URL und die Support-URL müssen bei der Einreichung wirklich erreichbar sein. Aktuell ist die Website noch nicht mit den neuen Texten veröffentlicht und appvektor.com noch nicht angeschlossen.
- `codemagic.yaml` enthält `cocoapods: default`, obwohl das iOS-Projekt Swift Package Manager nutzt (`CapApp-SPM`). Das ist vermutlich harmlos, wurde aber nie ausprobiert. Falls der erste Build daran scheitert, schick mir das Codemagic-Protokoll.
- Die Android-Versionsnummer steht noch auf 1.0 (`versionName`), das iOS-Projekt jetzt auf 2.0.1. Das ist nur ein optischer Unterschied, solange du Android nicht veröffentlichst.
- Die App hat keinen Import für Sicherungsdateien. Der Export als JSON-Datei ist nur eine Sicherung zum Aufbewahren, nicht zum Zurückspielen.
