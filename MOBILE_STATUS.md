# Abo-Warner Pro 2.0 (Mobile) — Projektstatus / Neustart-Key

> Zweck dieser Datei: kompakter Einstiegspunkt für den nächsten Chat. Diese Codebasis ist **eigenständig** — die Windows-Electron-App in `C:\AboWarner` wurde bei ihrer Erstellung nicht verändert.

## Was ist das Projekt

Mobile Portierung von Abo-Warner Pro für iOS (App Store) und Android (Play Store), via **Capacitor** — bewusst statt eines Frameworks wie React Native/Flutter gewählt, weil es die bestehende, bereits per Playwright/Electron ausgiebig getestete Web-Codebasis (HTML/CSS/Vanilla-JS) fast unverändert in einen echten nativen Container packt, statt sie komplett neu zu schreiben. Das minimiert das Risiko neuer Fehler massiv gegenüber einem Full-Rewrite.

## Architektur

```
AboWarnerMobile/
  package.json           Capacitor-Core + -Plugins (dependencies), CLI/Plattformen/esbuild (devDependencies)
  capacitor.config.json  appId com.abowarner.pro, appName "Abo-Warner Pro", webDir "www"
  build.mjs               esbuild-Bundler: src/ → www/ (siehe "Warum ein Build-Schritt" unten)
  serve.mjs               Nur für lokale Verifikation: statischer Server für www/ (kein App-Bestandteil)
  src/                     Handgeschriebener Quellcode (Eingabe für den Build)
    index.html, style.css  1:1 aus der Windows-App übernommen (+ Meta-Viewport, Safe-Area-CSS für Notch/Home-Indicator)
    calculator.js          1:1 übernommen — Kernlogik inkl. des "-22 Tage"-Rollover-Fixes
    app.js                 1:1 übernommen — nur Importpfad angepasst (flache src/-Struktur statt core/renderer/-Trennung)
    datepicker.js           1:1 übernommen (reines DOM, keine Electron-Abhängigkeit)
    kuendigungsschreiben.js 1:1 übernommen — nur Importpfad angepasst
    rechtliches.js          1:1 übernommen (Datenschutz/Impressum-Modal, inkl. Platzhalter-Warnhinweis)
    waehrungen.js           1:1 übernommen (Wechselkurse + Region→Währung-Map)
    faelligkeitshinweis.js  ERWEITERT: Toast bleibt, PLUS neue native Local-Notification-Planung (siehe unten)
    api.js                  NEU: Capacitor-Adapter, ersetzt Electrons preload.js/contextBridge (siehe unten)
    index.js                Bootstrap, strukturell identisch zur Windows-App
  tests/calculator.test.js  Echte, mit `node --test` ausführbare Unit-Tests (15/15 bestehen)
  www/                     BUILD-OUTPUT (von build.mjs erzeugt) — das, was Capacitor in ios/android kopiert
  ios/, android/           Von `npx cap add ios/android` generierte native Projekte
```

**Bewusst NICHT übernommen:** `sprachen.js` (i18n-Übersetzungen), `localeService.js`, `cryptoService.js` — in der Windows-App bereits als dokumentiertes, komplett ungenutztes totes Gepäck bekannt. Die neue Codebasis startet an dieser Stelle sauberer, statt bekannten Ballast mitzuschleppen. Sprach-/Regionserkennung läuft in `api.js` direkt über `navigator.language` + `WaehrungsHelper` aus `waehrungen.js`.

## Warum überhaupt ein Build-Schritt? (Abweichung von der Windows-App-Philosophie)

Die Windows-App läuft bewusst ohne Build (`npm start` lädt Quellcode direkt). Das geht hier nicht: `api.js` importiert echte npm-Pakete (`@capacitor/filesystem`, `@capacitor/share`, `@capacitor/local-notifications`) — ein WebView kann solche "nackten" Modul-Bezeichner ohne Bundler nicht auflösen (anders als die bestehenden relativen Importe wie `./calculator.js`, die unverändert funktionieren). `esbuild` (eine einzelne, sehr schnelle Bundling-Bibliothek, kein komplexes Toolchain-Setup) übernimmt das in `build.mjs`. `npm run sync` baut automatisch mit, bevor es an `cap sync` übergibt.

## Der zentrale Architektur-Kniff: api.js

`api.js` bildet exakt dieselbe `window.api`-Schnittstelle nach, die Electrons `preload.js` bereitstellt (`loadAbos/saveAbo/deleteAbo/updateAbo/exportAbos/exportSchreiben/getLocaleConfig`). Dadurch mussten `app.js` und `kuendigungsschreiben.js` — die komplette Geschäftslogik und das komplette UI-Rendering — **inhaltlich unverändert** übernommen werden. Unterschiede stecken ausschließlich in der Implementierung hinter der Schnittstelle:

| Funktion | Windows (Electron) | Mobile (Capacitor) |
|---|---|---|
| Datenpersistenz | `fs/promises` + IPC, `app.getPath('userData')` | `@capacitor/filesystem`, `Directory.Data` |
| Backup-Export | natives "Speichern unter"-Dialogfenster | `@capacitor/share` (natives Share-Sheet) — kein Desktop-Äquivalent zu "Pfad wählen", mobiltypisch stattdessen: Datei ins Cache-Verzeichnis schreiben, dann teilen |
| Kündigungsschreiben-Export | wie Backup-Export | wie Backup-Export (Share-Sheet) |
| Locale-Erkennung | `app.getLocale()`/`app.getLocaleCountryCode()` (Main-Prozess) | `navigator.language` (WebView) |

## Deutsches Komma bei Preis-/Betragseingaben

Identisch zur Windows-App gefixt (siehe dortige `PROJECT_STATUS.md` für die volle Begründung) — `calculator.js` hier bewusst 1:1 gepflegt: `parseBetrag`/`formatiereZahlDE`/`formatiereBetrag` neu exportiert, `app.js`/`index.html`-Eingabefelder von `type="number"` auf `type="text" inputmode="decimal"` umgestellt, `faelligkeitshinweis.js`s lokale `formatiereBetrag`-Kopie entfernt und durch den zentralen Import ersetzt. **10 neue Unit-Tests** in `tests/calculator.test.js` (25/25 insgesamt bestehen), plus 4/4 Checks per echtem Chromium-Browser gegen den neu gebauten `www/`-Stand.

## Fälligkeitshinweis-Toast: Untersuchung eines gemeldeten Plattform-Unterschieds

**Meldung:** Toast erscheine auf Desktop "bei kritischen Fristen", auf Mobile bei kritischem Status nicht.

**Befund nach Untersuchung:** Kein Plattform-Bug — `zeigeFaelligkeitshinweisFallsNoetig()` ist zwischen Desktop und Mobile byte-identisch (gleiche `tageBisZahlung === 3`-Bedingung). Live mit kontrolliertem Datensatz auf **beiden** Plattformen identisch bestätigt: Ein Abo mit Status "Kritisch" (Frist bereits erreicht), das NICHT genau 3 Tage bis zur nächsten Zahlung hat, löst auf **keiner** Plattform einen Toast aus — das ist so beabsichtigt, der Toast hängt strikt an "genau 3 Tage bis Zahlung", nicht am roten "Kritisch"-Badge (das ist ein separates Kriterium: `tageBisZahlung <= kuendigungsfristTage`). Wahrscheinlichste Erklärung für den gemeldeten Unterschied: Desktop- und Mobile-App haben **komplett getrennte Datenbestände** (unterschiedliche Speicherorte) — unterschiedliche Testdaten auf beiden Seiten können leicht den Eindruck eines Plattform-Unterschieds erzeugen, wo keiner besteht.

**Trotzdem zwei echte, unabhängig sinnvolle Verbesserungen umgesetzt** (identisch in beiden `index.js`):
1. Der Toast-Aufruf läuft jetzt in einem eigenen, vom restlichen Start-Ablauf getrennten `try/catch` — ein Fehler an anderer Stelle (z.B. bei der Benachrichtigungs-Berechtigungsabfrage) kann ihn nie mehr stillschweigend unterdrücken.
2. `.faelligkeit-toast` bekommt jetzt `env(safe-area-inset-bottom)`-Abstand (nur Mobile) — ohne das hätte er auf Geräten mit Gesten-Navigationsleiste teilweise dahinter verschwinden können.

Live re-verifiziert (Desktop 3/3, Mobile 5/5 inkl. `getComputedStyle`+Viewport-Sichtbarkeitscheck) — auf beiden Plattformen identisches Ergebnis.

**Offene Rückfrage an den Nutzer:** Falls tatsächlich gewünscht ist, dass der Hinweis bei JEDEM "Kritisch"-Status erscheint (nicht nur bei exakt 3 Tagen) — das wäre eine bewusste Erweiterung der Trigger-Bedingung, keine Fehlerbehebung, und wurde hier nicht selbstständig umgesetzt.

## Android-APK — tatsächlich gebaut und verifiziert

Anders als iOS ist ein Android-Build unter Windows grundsätzlich möglich (kein Mac nötig) — dafür extra installiert (liegt außerhalb des Projektordners, unter `C:\dev-tools`, nicht Teil des Repos):
- **JDK 17** (`C:\dev-tools\jdk-extracted\jdk-17.0.20+8`) — für Gradle selbst.
- **JDK 21** (`C:\dev-tools\jdk-extracted\jdk-21.0.12+8`) — zusätzlich nötig, da einzelne Capacitor-Plugin-Module (z.B. `capacitor-filesystem`) per Gradle-Java-Toolchain explizit Java 21 verlangen; JDK 17 allein reichte nicht.
- **Android SDK Command-Line-Tools** (`C:\dev-tools\android-sdk`) mit `platform-tools`, `platforms;android-36`, `build-tools;36.0.0` (passend zu `android/variables.gradle`, compileSdk/targetSdk 36) — Lizenzen automatisiert akzeptiert.

**Build:** `npm run build && npx cap sync android` (aktuelle `src/`-Änderungen ins native Projekt übernehmen) gefolgt von `./gradlew assembleDebug` (mit `JAVA_HOME` auf JDK 21) — **BUILD SUCCESSFUL in 5m 53s, 244 Tasks**.

**Ergebnis:** [`builds/AboWarnerPro-debug.apk`](builds/AboWarnerPro-debug.apk) (4,3 MB). Per `aapt dump badging` verifiziert — kein bloßes "Datei existiert", sondern echter Manifest-Inhalt geprüft: Paket `com.abowarner.pro`, App-Label „Abo-Warner Pro", `minSdkVersion 24`, `targetSdkVersion 36`, korrekte Berechtigungen (`INTERNET` für Google Fonts, `POST_NOTIFICATIONS`/`RECEIVE_BOOT_COMPLETED`/`WAKE_LOCK` für die Fälligkeits-Benachrichtigungen).

**Wichtig — Debug- vs. Release-Build:** Dies ist ein **Debug-APK**, signiert mit dem automatisch generierten Android-Debug-Keystore. Direkt installierbar auf einem Handy per Sideloading (APK-Datei aufs Gerät übertragen, "Installation aus unbekannten Quellen" erlauben, öffnen) — **aber nicht für den Play Store geeignet**. Für eine echte Play-Store-Einreichung wird zusätzlich ein **Release-Build mit eigenem Signing-Keystore** benötigt (`./gradlew bundleRelease` für ein `.aab`, das Play Store verlangt, plus ein selbst erzeugter/verwalteter Keystore — bewusst nicht hier erzeugt, da ein Signing-Key eine sicherheitskritische, dauerhafte Identität ist, die der Betreiber selbst kontrollieren sollte, nicht automatisiert von mir).

## Fälligkeitshinweis: erweitert um echte native Benachrichtigungen

Die Windows-App zeigt beim Start einen Toast für Abos, die in genau 3 Tagen fällig werden — funktioniert nur, wenn die App gerade offen ist. Mobil sinnvoll ergänzt: `planeFaelligkeitsBenachrichtigungen()` in `faelligkeitshinweis.js` plant zusätzlich **echte native Local Notifications** (`@capacitor/local-notifications`) für den Fälligkeitstermin minus 3 Tage, 9:00 Uhr lokale Zeit — die erscheinen auch, wenn die App geschlossen ist (auf dem Desktop technisch nicht sinnvoll nachbildbar, da Electron-Apps nicht im Hintergrund weiterlaufen). Vor jeder Neuplanung werden alle ausstehenden Benachrichtigungen verworfen und aus dem aktuellen Datenbestand neu berechnet — robust gegen nachträgliches Bearbeiten/Löschen/Kündigen, ohne einzelne Einträge abgleichen zu müssen. Fehler beim Planen (z.B. verweigerte Berechtigung) werden abgefangen und blockieren weder App-Start noch restliche Funktion.

## Was tatsächlich verifiziert wurde (und was nicht)

**Kann in dieser Windows-Sandbox nicht existieren, nicht als "unverifiziert" missverstehen:** ein iOS-Build/-Test ist ohne echten Mac mit Xcode **grundsätzlich unmöglich** — keine Ausnahme, kein Workaround. Ein Android-Emulator wäre unter Windows theoretisch möglich, aber sehr schwergewichtig (mehrere GB SDK, Hardware-Virtualisierung nötig) und wurde hier bewusst nicht versucht.

**Was stattdessen tatsächlich lief und bestand:**
1. **`npm test` — 15/15 echte Unit-Tests bestehen** (`node --test`, keine zusätzliche Test-Bibliothek nötig): komplette `calculator.js`-Logik inkl. `ermittleEffektivesZahlungsdatum` (der turnusgerechte Datums-Rollover, der in der Windows-App den "-22 Tage"-Bug behoben hat) — bewusst mit relativen statt hart einprogrammierten Datumsangaben, um nicht in dieselbe Falle wie ein früherer Testlauf in der Windows-App-Session zu laufen (siehe dortige `feedback_electron_testing`-Lektion).
2. **`npx cap add android` / `npx cap add ios` — beide erfolgreich.** Native Projektstrukturen (Gradle-Projekt bzw. Xcode-Projekt mit Package.swift für die 5 Capacitor-Plugins) wurden fehlerfrei generiert.
3. **Web-Ebene per echtem Chromium-Browser (Playwright, NICHT Electron) verifiziert — 12/12 Checks, 0 JS-Fehler**, mit mobiler Viewport-Breite (390×844, iPhone-typisch) UND aktiven Capacitor-Web-Fallback-Implementierungen (Filesystem→IndexedDB, Share→Web-Share-API): App lädt fehlerfrei, `window.api` korrekt vom Adapter gesetzt, leerer Erststart, Modal öffnet auf schmaler Breite, Abo anlegen/bearbeiten/löschen funktioniert über den echten Filesystem-Web-Fallback, Kündigungsschreiben- und Datenschutz-Modal öffnen korrekt, Reload danach fehlerfrei.
4. **Nicht verifizierbar von hier aus:** tatsächliches Rendering/Verhalten in einer echten iOS-/Android-WebView (native Plugin-Bridges, echte Share-Sheet-/Benachrichtigungs-UI, Performance auf echter Hardware, Safe-Area-Werte auf echten Geräten mit Notch). Web-Fallback-Verifikation ist eine starke, aber keine vollständige Garantie — vor Store-Einreichung zwingend auf mindestens einem echten oder simulierten Gerät je Plattform testen.

## Was für eine echte Store-Einreichung noch fehlt (nichts davon ist Code)

- ~~App-Icons und Splashscreens~~ — **erledigt, siehe Abschnitt „iOS ohne physischen Mac" unten.**
- **Entwickler-Accounts:** Apple Developer Program (99 $/Jahr) für iOS, Google Play Console (einmalig 25 $) für Android. Weiterhin offen, reine Kontoanlage außerhalb des Codes.
- **Code-Signierung:** iOS-Signierung läuft jetzt über Codemagic + App-Store-Connect-API (siehe unten), kein eigener Mac mehr nötig. Android-Keystore existiert bereits (siehe Play-Store-Audit oben).
- **Store-Listing-Metadaten:** Screenshots je Gerätegröße, Beschreibungstexte, Kategorisierung, Altersfreigabe, Google Play Data-Safety-Formular, Apple App Privacy-Angaben (Privacy Nutrition Label) — weiterhin offen, reine Content-Aufgabe.
- **Gehostete Datenschutzerklärung-URL:** Beide Stores verlangen im Store-Listing selbst eine öffentlich erreichbare URL, nicht nur den In-App-Text unter „Datenschutz" im Footer. Noch nicht vorhanden — braucht irgendein Hosting (z.B. GitHub Pages aus genau diesem jetzt existierenden Repo, eine simple Static-Page).
- **Datenschutz/Impressum:** `rechtliches.js`/`index.html` — echte Betreiberdaten sind inzwischen eingetragen (siehe Datei), keine Platzhalter mehr im aktuellen Quellcode.

## iOS ohne physischen Mac — Codemagic-Cloud-Build eingerichtet (2026-08-02)

Auf Nutzerwunsch: konkreter, umsetzbarer Weg zur App-Store-Einreichung ohne eigenen Mac. Vorher zwei tatsächliche Store-Blocker im iOS-Zweig gefunden und behoben, die unabhängig vom CI-Thema bestanden:

**1. iOS-Markenicon & Splashscreen waren nie ersetzt worden** (anders als Android — siehe Play-Store-Audit oben): `Assets.xcassets/AppIcon.appiconset` zeigte noch das generische Capacitor/Ionic-Standardicon, `Splash.imageset` den Standard-Splash. Beides ersetzt:
- Neue Quell-Assets unter `assets/icon.png` (1024×1024, voll ausgefüllt, keine eingebrannten abgerundeten Ecken — Apple maskiert das Icon selbst; ein vorgerundetes Quellbild hätte ein sichtbares „Icon-im-Icon"-Artefakt erzeugt) und `assets/splash.png` (2732×2732), pixelgenau aus denselben Gradient-/Pfaddaten wie das bereits geprüfte Android-Adaptive-Icon nachgebaut (`android/app/src/main/res/drawable/ic_launcher_background.xml` + `drawable-v24/ic_launcher_foreground.xml`), per SVG+`sharp` gerendert (kein Mac/Xcode nötig).
- `npx @capacitor/assets generate --ios` (bewusst nur `--ios`, NICHT `--android` — die bestehende, bereits audit-geprüfte Android-Adaptive-Icon-Lösung mit ihren erklärenden Kommentaren sollte nicht durch rasterisierte PNGs ersetzt werden) erzeugte daraus den vollständigen iOS-Asset-Katalog (AppIcon 1024er + Splash light/dark in allen Skalierungen). Alte, jetzt unreferenzierte Platzhalter-Splash-PNGs aus dem `Splash.imageset`-Ordner entfernt.
- Visuell verifiziert (beide Quellbilder UND die generierten Xcode-Assets angesehen) — Icon und Splash zeigen jetzt exakt dasselbe Wallet-Symbol/denselben Farbverlauf wie Android/Windows.

**2. Kein `PrivacyInfo.xcprivacy`-Privacy-Manifest im App-Target.** Seit Mai 2024 verlangt Apple bei Nutzung bestimmter „Required Reason APIs" ein deklariertes Manifest, sonst droht eine automatisierte Ablehnung/Warnung bei der Einreichung. Recherchiert (siehe Quellen unten): `@capacitor/filesystem` nutzt nachweislich `modificationDate`-APIs (bestätigt über ein offenes Issue im `ionic-team/capacitor-plugins`-Repo) → Kategorie **File Timestamp APIs**, Reason-Code **`C617.1`** („Zugriff auf Zeitstempel/Größe/Metadaten von Dateien innerhalb des eigenen App-Containers" — passt exakt zu `Directory.Data`/`Directory.Cache`, die einzigen in `api.js` genutzten Speicherorte). Neue Datei `ios/App/App/PrivacyInfo.xcprivacy` angelegt (`NSPrivacyTracking: false`, `NSPrivacyCollectedDataTypes: []`, ein Required-Reason-Eintrag für `C617.1`) und **manuell korrekt ins Xcode-Projekt verdrahtet** (`project.pbxproj`: neuer `PBXFileReference`- und `PBXBuildFile`-Eintrag, in der „App"-Gruppe und in der Resources-Build-Phase registriert — sonst würde die Datei zwar im Ordner liegen, aber nie in die IPA gepackt).
- **Bewusst nicht spekulativ erweitert:** Für die übrigen Plugins (`local-notifications`, `share`, `app`, `status-bar`, Capacitor-Core selbst) ließ sich von hier ohne Mac/Xcode nicht zweifelsfrei verifizieren, ob sie zusätzliche Required-Reason-APIs (z.B. UserDefaults) berühren. Statt zu raten: Der erste TestFlight-Upload über Codemagic gibt in App Store Connect exakt an, welche zusätzlichen Kategorien Apples automatischer Scan im fertig gelinkten Binary findet, falls welche fehlen — dann gezielt ergänzen statt vorab blind deklarieren.

**3. Git-Repository lokal initialisiert** (`C:\AboWarnerMobile` war bis dahin gar nicht unter Versionskontrolle — Voraussetzung für jeden Cloud-CI-Dienst, der von einem Git-Host baut). Neues Top-Level-`.gitignore` (node_modules, `www/`-Build-Output, `builds/`, alle Signing-Artefakte `*.jks`/`*.keystore`/`keystore.properties`/`*.p8`/`*.mobileprovision`/`*.p12` — verifiziert vor dem ersten Commit, dass keine dieser Dateien im Staging landet). Erster Commit lokal erstellt. **Noch kein Remote/Push** — dafür fehlt ein GitHub/GitLab-Repo, siehe manuelle Schritte unten.

**4. `codemagic.yaml` (Workflow `ios-app-store`) im Repo-Root angelegt** — deklarativer Build/Sign/Publish-Workflow für Codemagic:
- `npm ci` → `npm run build` (esbuild, `src/` → `www/`) → `npx cap sync ios` (synct `www/` ins native Projekt, führt `pod install` automatisch aus) → `xcode-project use-profiles` (holt/erzeugt Zertifikat + Provisioning-Profil vollautomatisch über die App-Store-Connect-API-Integration, kein manuelles Zertifikats-Handling) → Build-Nummer automatisch hochgezählt (`app-store-connect get-latest-build-number` + `agvtool`, verhindert „Build-Nummer bereits vergeben"-Fehler bei wiederholten Uploads) → `xcode-project build-ipa`.
- Publishing bewusst konservativ: `submit_to_testflight: true`, `submit_to_app_store: false` — jeder erfolgreiche Build landet automatisch in TestFlight, geht aber NICHT automatisch in die echte Apple-Review. Erst nach eigenem Test in TestFlight bewusst auf `submit_to_app_store: true` umstellen oder manuell in App Store Connect einreichen.
- Kein automatischer Trigger auf `git push` konfiguriert (bewusst) — Builds werden anfangs manuell über das Codemagic-Dashboard gestartet, bis der Ablauf sich bewährt hat.
- `APP_STORE_APPLE_ID` (die numerische App-Store-Connect-App-ID, nicht die Bundle-ID) ist noch ein Platzhalter (`0000000000`) — kann erst eingetragen werden, nachdem die App einmal in App Store Connect angelegt wurde (siehe manuelle Schritte).

**Kann von hier aus nicht verifiziert werden:** ob der erste echte Codemagic-Build tatsächlich grün durchläuft (Signing-Integration, Provisioning, Xcode-Kompatibilität der generierten CapApp-SPM-Swift-Package-Struktur) — die YAML-Konfiguration folgt dem offiziell dokumentierten Codemagic-Capacitor/Fastlane-losen Standardablauf, aber ein realer Build auf Apples/Codemagics Infrastruktur wurde noch nicht ausgelöst (fehlt: Apple-Developer-Account, App-Store-Connect-App-Eintrag, Codemagic-Account, GitHub-Remote — alles außerhalb dieser Sandbox).

**Manuelle Schritte, die zwingend beim Nutzer liegen (keine davon technisch von hier aus möglich):**
1. Apple Developer Program beitreten (developer.apple.com, 99 $/Jahr, Verifizierung kann 24–48h dauern).
2. In App Store Connect eine neue App anlegen mit Bundle-ID `com.abowarner.pro` (App-ID vorher unter „Certificates, Identifiers & Profiles" registrieren) → liefert die numerische App-ID für `APP_STORE_APPLE_ID` in `codemagic.yaml`.
3. App-Store-Connect-API-Key erzeugen: App Store Connect → Users and Access → Integrations → App Store Connect API → Key mit Rolle „App Manager" erzeugen, `.p8`-Datei herunterladen (nur einmalig möglich!), Key-ID + Issuer-ID notieren.
4. GitHub-Repo für `C:\AboWarnerMobile` anlegen (privat empfohlen) und den bestehenden lokalen Commit dorthin pushen (`git remote add origin ...`, `git push -u origin main`).
5. Codemagic-Account erstellen (codemagic.io, kostenloses Kontingent reicht für gelegentliche Releases), das GitHub-Repo verbinden/autorisieren.
6. In Codemagic unter Teams → Integrations → App Store Connect: die Daten aus Schritt 3 (.p8, Key-ID, Issuer-ID) eintragen, Integration **exakt** `appstore_credentials` nennen (muss zum Namen in `codemagic.yaml` passen).
7. `APP_STORE_APPLE_ID` in `codemagic.yaml` mit der echten App-ID aus Schritt 2 ersetzen, committen, pushen.
8. Ersten Build im Codemagic-Dashboard manuell starten (Workflow „iOS – Build, Sign & TestFlight"), Ergebnis in TestFlight prüfen.

## Android / Google-Play-Store-Audit (2026-08-01)

Auf Nutzerwunsch: systematische Prüfung von Gradle, AndroidManifest und Capacitor-Konfiguration gegen aktuelle Play-Store-Vorgaben. Anders als beim macOS-Fall (siehe Desktop-Repo) ist auf dieser Windows-Maschine ein vollständiger, funktionierender Android-Build-Toolchain vorhanden (JDK 21, Android SDK, `gradlew`) — alle Fixes wurden daher live durch echte `assembleRelease`/`bundleRelease`-Builds verifiziert, nicht nur als Konfiguration vorbereitet.

**Kritischster Fund, behoben: kein Signing-Key.** Release-Builds hatten keinerlei `signingConfig` — ohne signierten Build ist ein Play-Store-Upload technisch unmöglich. Mit Nutzerbestätigung einen Upload-Keystore erzeugt (`keytool`, RSA 2048, Gültigkeit 30 Jahre bis 2056-07-24) unter `android/abo-warner-pro-upload.jks`, Zugangsdaten in `android/keystore.properties` (Passwort NICHT im Klartext in `build.gradle`, Datei über `.gitignore` von Versionskontrolle ausgeschlossen). `build.gradle` lädt die Properties defensiv (Build bleibt auch ohne die Datei lauffähig, dann eben unsigniert). **Wichtig, unbedingt beachten:** `android/abo-warner-pro-upload.jks` und das Passwort in `android/keystore.properties` müssen extern sicher gesichert werden (Passwort-Manager, Backup außerhalb dieser Maschine) — Verlust bedeutet, dieselbe App in der Play Console nie wieder aktualisieren zu können. Signatur mit `jarsigner -verify`/`apksigner verify` gegengeprüft — beide Artefakte sind korrekt und gültig signiert.

**Weitere behobene Funde:**
- **Unveränderter Capacitor/Ionic-Standard-Icon-Platzhalter** (weißer Hintergrund, stilisierter Roboterkopf, Farbverlauf-Testraster) — die App hätte mit einem komplett generischen, nicht zur Marke passenden Icon im Play Store gestanden. Ersetzt durch das tatsächliche Abo-Warner-Pro-Icon (derselbe Farbverlauf und dasselbe Wallet-Symbol wie bei der Windows/macOS-Version): adaptives Icon als Vector-Drawables (`drawable/ic_launcher_background.xml`, `drawable-v24/ic_launcher_foreground.xml`, im sicheren 66%-Bereich zentriert) für API 26+, plus neu gerenderte klassische PNG-Icons für alle fünf Dichte-Ordner (mdpi–xxxhdpi) für ältere Geräte (API 24–25, vor Einführung adaptiver Icons). Zusätzlich ein 512×512-Store-Listing-Icon unter `store-assets/play-store-icon-512.png` für den Play-Console-Eintrag erzeugt.
- **FileProvider zu weit gefasst:** `file_paths.xml` gewährte per unverändertem Vorlagen-Eintrag (`<external-path path=".">`) Zugriff auf das komplette externe Speicherverzeichnis, obwohl die App (siehe `src/api.js`) ausschließlich `Directory.Cache`/`Directory.Data` (privater App-Speicher) nutzt. Der ungenutzte, überbreite Eintrag wurde entfernt (Least-Privilege).
- **`minifyEnabled false` im Release-Build:** R8-Minifizierung/Resource-Shrinking war deaktiviert. Aktiviert (`minifyEnabled true`, `shrinkResources true`) und per echtem `assembleRelease` verifiziert — Release-APK schrumpfte dadurch von 4,3 MB (Debug-Referenz) auf 1,25 MB, Build fehlerfrei durchgelaufen.
- **CSP-Parität zur Desktop-Version:** `src/index.html` hatte (anders als die inzwischen gehärtete Electron-Version) keine Content-Security-Policy. Dieselbe strikte CSP wie im Windows-Audit ergänzt (kein `unsafe-inline`/`unsafe-eval`, App nutzt nur `element.style.property`). Im gebauten `www/`- und im in die APK synchronisierten `android/app/src/main/assets/public/`-Verzeichnis verifiziert vorhanden.
- `.gitignore`: Keystore-Ausschluss war auskommentiert (Vorlagen-Default) — aktiviert, `*.jks`/`*.keystore`/`keystore.properties` jetzt aktiv ausgeschlossen (relevant, sobald dieses Projekt einmal unter Versionskontrolle steht).

**Geprüft und für gut befunden (kein Fix nötig):**
- `targetSdkVersion 36` (Android 16) — bereits konform mit Googles Vorgabe, dass ab 31.08.2026 neue Apps/Updates mindestens API 36 targetieren müssen. Aktuell sogar schon vorauseilend erfüllt.
- `minSdkVersion 24`, App-ID/Namespace `com.abowarner.pro` konsistent zwischen `capacitor.config.json`, `build.gradle` und `strings.xml`.
- Alle Komponenten mit Intent-Filtern haben explizites `android:exported` (Pflicht seit API 31) — `MainActivity` (`true`, LAUNCHER), `FileProvider` (`false`).
- `POST_NOTIFICATIONS`/`RECEIVE_BOOT_COMPLETED`/`WAKE_LOCK`-Berechtigungen werden korrekt automatisch vom `@capacitor/local-notifications`-Plugin-Manifest gemerged (per `aapt2 dump badging` an der fertigen Release-APK bestätigt); die Laufzeit-Berechtigungsanfrage (`LocalNotifications.requestPermissions()`) ist in `faelligkeitshinweis.js` bereits korrekt implementiert.
- `android.permission.INTERNET` ist die einzige App-eigene Berechtigung und legitim begründet (Google-Fonts-Nachladung über die WebView) — für die Play-Console-„Data Safety"-Angabe: keine Nutzerdaten werden gesammelt/übertragen, alles bleibt lokal auf dem Gerät.
- Kein Cleartext-Traffic (Capacitor liefert die App-Inhalte über das Standard-`https://`-Schema aus), kein `google-services.json`/Firebase (Plugin-Einbindung ist bereits defensiv per try/catch abgesichert, kein Fehler bei Abwesenheit).

**Erzeugte, store-fertige Artefakte** (in `builds/`):
- `AboWarnerPro-release-signed-v1.apk` — signiert, minifiziert, für Sideload-Tests.
- `AboWarnerPro-release-v1.aab` — signiert, das für eine **neue** Play-Store-Einreichung zwingend erforderliche App-Bundle-Format (Play Console akzeptiert für Erstveröffentlichungen kein reines APK mehr).
- `store-assets/play-store-icon-512.png` — Store-Listing-Icon für die Play-Console-Eintragsseite.

**Nicht automatisierbar, verbleibt manuell in der Play Console:**
1. Google-Play-Console-Entwicklerkonto (einmalig 25 $) und App-Eintrag mit Paket-ID `com.abowarner.pro` anlegen.
2. `AboWarnerPro-release-v1.aab` hochladen, dabei **Play App Signing** aktivieren (empfohlen — Google verwaltet dann den finalen Distributionsschlüssel, unser Upload-Key bleibt nur der Upload-Nachweis).
3. Data-Safety-Fragebogen ausfüllen (siehe Hinweis oben: keine Datensammlung/-übertragung).
4. Store-Listing-Inhalte (Beschreibung, Screenshots, Feature-Grafik, Datenschutzerklärung-URL) pflegen — reine Content-/Marketing-Aufgabe, kein technischer Punkt.
5. `versionName`/`versionCode` (aktuell `"1.0"`/`1`, unverändert aus der Vorlage) vor der ersten echten Veröffentlichung bewusst festlegen — bewusst nicht automatisch angepasst, da das eine Versionsentscheidung des Nutzers ist, kein technischer Fehler.
6. Konnte nicht auf einem echten Gerät/Emulator laufzeit-getestet werden (kein `adb`-Gerät in dieser Umgebung angeschlossen) — Build/Signierung/Minifizierung sind strukturell vollständig verifiziert, ein finaler Rauchtest auf echtem Gerät vor Veröffentlichung wird trotzdem empfohlen.
