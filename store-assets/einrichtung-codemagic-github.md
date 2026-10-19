# Einrichtung für den App Store – Schritt für Schritt (nur du kannst das)

Stand: 2026-10-19. Alles hier passiert in deinen Konten im Browser. Nichts davon kann ich für dich tun. Geheimnisse (Passwörter, die `.p8`-Datei, Tokens) niemals in einen Chat oder in Git legen.

## ✅ Bereits erledigt (nicht mehr nötig)

- **Git/GitHub:** Repo ist eingerichtet, mit `https://github.com/Bolte7Verena/AboWarnerMobile` verbunden, Branch `master`, sauber committet und gepusht.
- **Codemagic:** Konto eingerichtet, Repo verbunden, `codemagic.yaml` wird erkannt. Der Workflow „iOS – App-Store-Screenshots (Fastlane Snapshot)" läuft bereits erfolgreich durch (9 von 10 Screenshots erzeugt, siehe `MOBILE_STATUS.md`).

## C. Apple Developer und App Store Connect — das ist jetzt dran

1. Auf developer.apple.com dem **Apple Developer Program** beitreten (99 $/Jahr). Die Prüfung kann 1–2 Tage dauern.
2. Entscheiden: **Einzelperson oder Organisation.** Bei einer Einzelperson zeigt der Store deinen persönlichen Namen als Verkäufer, „AppVektor" als Firmenname geht nur mit einem Organisationskonto (dafür braucht Apple u. a. eine D-U-N-S-Nummer). Für EU-Händler zeigt Apple außerdem Adresse, Telefon und E-Mail öffentlich an. Bitte vorher klären, ob du damit einverstanden bist.
3. Auf developer.apple.com → „Certificates, Identifiers & Profiles" → „Identifiers" → neue App-ID mit der Bundle-ID **`com.abowarner.pro`** anlegen.
4. In App Store Connect (appstoreconnect.apple.com) → „Apps" → „+" → „Neue App": Plattform iOS, Name „Abo-Warner Pro", Sprache Deutsch, Bundle-ID `com.abowarner.pro`, SKU frei wählbar (z. B. `abowarnerpro`).
5. Die **numerische App-ID** der neuen App notieren (steht in App Store Connect bei „App-Informationen" als „Apple-ID"). Sie ersetzt später den Platzhalter `0000000000` in `codemagic.yaml`.
6. **Bezahlen:** Unter „Vereinbarungen, Steuern und Bankverbindung" die Vereinbarung für kostenpflichtige Apps annehmen und Bank- und Steuerangaben eintragen. Einfachster Weg für „Einmalkauf": die App als **bezahlte App** anbieten (unter „Preise und Verfügbarkeit" eine Preisstufe wählen). Dafür ist kein eigener Kaufcode nötig.
7. **App-Store-Connect-API-Schlüssel** erzeugen: App Store Connect → „Benutzer und Zugriff" → „Integrationen" → „App Store Connect API" → Schlüssel mit der Rolle **„App-Manager"**. Die `.p8`-Datei sofort herunterladen (geht nur einmal!), Key-ID und Issuer-ID notieren. Datei sicher aufbewahren, nicht ins Repo, nicht in den Chat.

## D. Codemagic — Rest (A und B oben sind schon erledigt)

1. Im Codemagic-Dashboard unter „Teams" → „Integrations" → „App Store Connect" eine Verbindung anlegen: `.p8`-Datei, Key-ID und Issuer-ID aus Schritt C7 eintragen. Name der Verbindung **genau `appstore_credentials`** (so steht es in `codemagic.yaml`).
2. In `codemagic.yaml` bei `APP_STORE_APPLE_ID` die echte Zahl aus Schritt C5 eintragen (statt `0000000000`). Sag mir Bescheid, dann mache ich diese eine Zeile für dich und du musst nur noch committen/pushen (oder ich pushe, wenn du magst).
3. Im Codemagic-Dashboard den Workflow **„iOS – Build, Sign & TestFlight"** manuell starten. Er baut die App, signiert sie und lädt sie nach TestFlight hoch. Reicht sie **nicht** automatisch bei Apple zur Prüfung ein (bewusst so eingestellt).

## E. Testen

1. Die App aus TestFlight auf einem echten iPhone installieren (TestFlight-App aus dem App Store, dein Apple-ID-Konto als interner Tester).
2. Durchtesten: Abo anlegen, bearbeiten, löschen, Erinnerung erlauben, Kündigungsschreiben erstellen und teilen, Export, Flugmodus an (alles muss auch offline gehen). Die App wurde bisher nie auf einem echten iOS-Gerät gestartet — der Fastlane-Snapshot-Lauf lief im Simulator, das ist nicht dasselbe wie ein echtes Gerät.

## F. Store-Eintrag fertigstellen und einreichen

1. In App Store Connect bei der App: die Texte aus `store-texte.md` eintragen (Name, Untertitel, Beschreibung, Schlüsselwörter, „Was ist neu").
2. **Screenshots hochladen:** Die 9 fertigen Bilder liegen als Codemagic-Artefakt bereit (`fastlane/screenshots/**`), musst du einmalig herunterladen. Für iPhone fehlt `05-Kategoriefilter` (optional, kein Blocker — 01–04 reichen für die Einreichung).
3. **Datenschutz-URL** eintragen: erst möglich, wenn der Text aus `datenschutz-app.md` auf der Website veröffentlicht ist.
4. **Support-URL** eintragen: `https://appvektor.com/#kontakt`, sobald appvektor.com erreichbar ist.
5. „App Privacy" ausfüllen (Vorschlag: „Daten werden nicht erhoben"), Altersfreigabe-Fragebogen, Kategorie, Preisstufe, Copyright.
6. Den getesteten Build aus TestFlight der Version zuordnen, dann „Zur Prüfung einreichen". Apple prüft meist 1–3 Tage.

## G. Offene Punkte / Hinweise

- **Behoben (19.10.2026):** `codemagic.yaml` verwies im IPA-Build-Schritt auf `ios/App/App.xcworkspace` — diese Datei gibt es in diesem reinen SPM-Projekt nicht (kein CocoaPods, kein Podfile). Korrigiert auf `--project ios/App/App.xcodeproj`, bestätigt durch den exakt gleichen, nachweislich funktionierenden Pfad aus dem erfolgreichen Screenshot-Workflow.
- `codemagic.yaml` enthält weiterhin `cocoapods: default`, obwohl kein Podfile existiert. Vermutlich harmlos (keine Pods zu installieren), aber nie in diesem konkreten Workflow ausprobiert. Falls der erste `ios-app-store`-Build daran scheitert, schick mir das Protokoll.
- Die Android-Versionsnummer steht noch auf 1.0 (`versionName`), das iOS-Projekt jetzt auf 2.0.1. Das ist nur ein optischer Unterschied, solange du Android nicht veröffentlichst.
- Die App hat keinen Import für Sicherungsdateien. Der Export als JSON-Datei ist nur eine Sicherung zum Aufbewahren, nicht zum Zurückspielen.
