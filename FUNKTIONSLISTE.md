# Abo-Warner Pro – Funktionsliste

Die eine Übersicht für Jens, Kira und Lilly.
[x] = erledigt, [ ] = offen.
Lilly hält diese Liste nach jedem erledigten Auftrag aktuell.

Stand: 24.11.2026

---

## GRUNDREGEL

Alles wird für den weltweiten Markt gebaut. Jede App, jede Webseite und jedes Buch mindestens auf Deutsch UND Englisch, mit automatischer Spracherkennung und Umschalter. Weitere Sprachen nach Markt.

## FESTE REGEL: ECHTES IPHONE

Vor jeder Einreichung auf einem echten iPhone testen, nicht nur im Browser.

---

## STAND 15.11.2026 / NÄCHSTE SCHRITTE

**Neu am 15.11.2026**
- PC aufgerüstet: 12 GB RAM, Windows läuft jetzt auf einer SSD (C:). Die alte Windows-Platte heißt jetzt F: (alte Windows-Kopie, vorerst nicht löschen). G: ist unverändert G:. Node, Git, Java und Android-SDK werden weiter gefunden (alle auf G:).
- Fehler auf echtem iPhone (iPhone 17 Pro Max, iOS 26.6.1, Version 2.0.1 über TestFlight): Beim Antippen von Eingabefeldern zoomt iOS hinein, die App wird breiter als der Bildschirm und rechts abgeschnitten (sichtbar im Formular „Neues Abo"). Ursache: Schriftgröße der Eingabefelder 14px, iOS zoomt bei unter 16px. Muss in 2.0.1 (master) UND im Update behoben werden, bevor das Apple-Video gemacht wird (siehe Abschnitt 3 und 4).

**App (G:\AboWarnerMobile)**
- Zweig update-2.0.2 mit Paket 1 bis 5 fertig.
- Test-APK „AWP Test“ ist auf Jens' Handy installiert.
- [ ] Offen: Foto-Funktion und Übersetzungen auf dem Handy testen.

**appvektor.com (G:\appvektor-landing)**
- Zweig „sprachen“ mit 5 Sprachen fertig, NICHT veröffentlicht.
- Nächste Schritte in dieser Reihenfolge:
  1. [ ] Jens schaut die Vorschau an
  2. [x] Veralteten Produkttext zu Abo-Warner Pro korrigieren, in allen 5 Sprachen (15.11.2026, Commit 7519bfa im Zweig „sprachen“, nicht veröffentlicht)
  3. [x] „Wer steckt dahinter?“, Grundsatz „Fairer Preis“, echter App-Screenshot in der Produktkarte (15.11.2026, Commit a200dbe; zugeschnitten auf die Abo-Liste, größer, Commit c598679)
  4. [x] Neuen Cloudflare-API-Token auf diesem Rechner einrichten (15.11.2026, Benutzervariable CLOUDFLARE_API_TOKEN, wrangler whoami ok; Worker appvektor, tanstack-start-ts = abo-warner-pro.com, wieticktkiwirklich sichtbar)
  5. [x] Veröffentlicht (15.11.2026, Zweig sprachen, live geprüft)
  6. [x] Auf GitHub gesichert (16.11.2026, siehe Abschnitt „GitHub-Sicherung“)
  7. [ ] Link in der App auf die Sprach-Adressen umstellen (appvektor.com/de/, /en/, /es/, /fr/, /pt/)

**abo-warner-pro.com (G:\minimalist-landing-gen-main, Zweig main)**
- [x] Git eingerichtet, Ausgangsstand = live gesichert (15.11.2026, Commit 4051e31)
- [x] Login-Knopf entfernt, „Automatische Erkennung“ raus, Texte/FAQ/Preis auf den echten Stand der App, DE/EN/ES/FR/PT mit Sprachwähler (15.11.2026, Commit 1ca5b79, nicht veröffentlicht)
- [ ] Japanisch und Norwegisch liegen noch im Code (abgeschaltet, alte Texte mit „Automatischer Erkennung“) – Entscheidung Jens
- [x] Web-Werkzeug /dashboard versteckt (liefert „nicht gefunden“, Code bleibt), aus der Sitemap, Datenschutz angepasst (Entscheidung Jens, 15.11.2026, Commit e7dadbe)
- [x] Impressum und Datenschutz in DE/EN/ES/FR/PT mit „Im Zweifel gilt die deutsche Fassung“; Preis überall 4,99 €, auch auf Englisch (15.11.2026, Commit e7dadbe)
- [x] Veröffentlicht auf Worker tanstack-start-ts (15.11.2026, live geprüft: 5 Sprachen, Rechtsseiten, /dashboard = 404)
- [x] Tote Knöpfe („Bald in den Stores“ u. a.) zu schlichten Schildern „Bald für iPhone und Android“ in 5 Sprachen, live, geprüft auf 360/390 px (16.11.2026)
- [x] Auf GitHub gesichert (16.11.2026, siehe Abschnitt „GitHub-Sicherung“)

**wieticktkiwirklich.com (G:\wie-tickt-ki-wirklich, Zweig main)**
- [x] Git war schon da, Stand = live (Commit c0190e7)
- [x] DE/EN/ES/FR/PT mit Sprachwähler und eigenen Adressen (/en/ usw.), fremde Sprachen sagen „Buch erscheint auf Deutsch“ (15.11.2026, Commit cf948bf, nicht veröffentlicht)
- [x] Impressum und Datenschutz in DE/EN/ES/FR/PT mit „Im Zweifel gilt die deutsche Fassung“ (15.11.2026, Commit d359db2)
- [x] Veröffentlicht (15.11.2026, live geprüft: 5 Sprachen, Weiterleitung nach Browsersprache, Rechtsseiten)
- [x] Auf GitHub gesichert (16.11.2026, siehe Abschnitt „GitHub-Sicherung“)

**Danach**
- [ ] abo-warner-pro.com auf eigene Adressen je Sprache umbauen (bisher Erkennung + Umschalter ohne eigene Adresse)

---

## 1. Version 2.0.1 (bei Apple freigegeben und veröffentlicht, Meldung 24.11.2026)

Geprüft im Code von master (Stand ab6372a).

**Abos anlegen und verwalten**
- [x] Neues Abo anlegen: Name, Kosten, Währung, Turnus, Kategorie, nächste Zahlung, Kündigungsfrist in Tagen
- [x] Turnus: monatlich, vierteljährlich, halbjährlich, jährlich
- [x] Kategorien im Formular: Streaming, Sport, Versicherung, Sonstiges
- [x] Währung wird nach Land des Handys vorgeschlagen, fremde Währungen werden für die Summen in Euro umgerechnet
- [x] Eigener Kalender zur Datumsauswahl
- [x] Abo bearbeiten und löschen (Löschen ohne Rückfrage)
- [x] Liegt die nächste Zahlung in der Vergangenheit, rückt das Datum automatisch auf die nächste Zahlung vor

**Übersicht**
- [x] Liste aller Abos mit Suche und Filter nach Kategorie
- [x] Vier Kacheln: aktive Abos, Kosten pro Monat, Kosten pro Jahr, Fristen fällig
- [x] Etikett je Abo: Kritisch (rot), Bald fällig (gelb), Sicher (grün), Gekündigt
  - gerechnet ab Tagen bis zur Zahlung: rot, wenn die Frist erreicht ist; gelb 14 Tage davor
- [x] Gekündigte Abos stehen am Ende der Liste

**Kündigen**
- [x] Knopf „Kündigen“ öffnet ein fertiges Kündigungsschreiben (nur Deutsch, „fristgerecht zum …“)
- [x] Absenderdaten (Name, Anschrift, E-Mail, Kundennummer) werden auf dem Handy gemerkt
- [x] Schreiben kopieren oder als Datei teilen
- [x] „Abo als gekündigt markieren“

**Erinnerungen**
- [x] Mitteilung 3 Tage vor jeder Zahlung („In 3 Tagen fällig“)
- [x] Hinweis beim App-Start für Abos, die in genau 3 Tagen fällig sind

**Daten**
- [x] Alles bleibt nur auf dem Handy, keine Datenübertragung, kein Tracking
- [x] Knopf „Exportieren“ auf jeder Karte: speichert alle Abos als Datei (Teilen-Menü)
- Nicht dabei: Sicherung wiederherstellen (kommt mit 2.0.2)

**Sonstiges**
- [x] Nur Deutsch
- [x] Datenschutz, Impressum, Kontakt in der App
- [x] Demo-Abos nur für die automatischen Store-Screenshots

---

## 2. Update 2.0.2 (Zweig update-2.0.2, seit 24.11.2026 auch master)

Geprüft im Code von update-2.0.2. Noch nicht in den Stores.

**Einreichung vorbereitet (24.11.2026)**
- [x] update-2.0.2 in master zusammengeführt (Fast-Forward) und auf GitHub gepusht
- [x] Version 2.0.2: iOS Buildnummer 4 im Projekt (Codemagic setzt beim Build selbst letzte Apple-Buildnummer + 1), Android versionCode 2 (2.0.1 hatte 1), versionName 2.0.2
- [x] Android-Bundle builds/AboWarnerPro-2.0.2-release-vc2.aab (signiert mit Upload-Schlüssel, versionCode 2 / 2.0.2, ohne gelben Teststempel; nicht hochgeladen)
- [ ] iOS: Codemagic-Workflow „iOS – Build, Sign & TestFlight“ auf Zweig master starten (Jens)
- [ ] 2.0.2 auf echtem iPhone über TestFlight prüfen (feste Regel), dann bei Apple einreichen
- [ ] AAB in der Play Console hochladen (Jens)

**Paket 1 – Abos und Kündigen**
- [x] Sicherheitsabfrage vor dem Löschen eines Abos
- [x] Datum überall im Format TT.MM.JJJJ (in anderen Sprachen nach Land)
- [x] Karte zeigt „Kündigung möglich bis [Datum]“ statt Kritisch/Bald fällig
- [x] Ist das Datum vorbei, zeigt die Karte die nächste Möglichkeit
- [x] Neue freiwillige Felder: Vertragsnummer, Kundennummer, Anbieter mit Anschrift
- [x] Diese Felder auch bei „Neues Abo“ (zugeklappt unter „Weitere Angaben“)
- [x] Kündigungsschreiben vereinfacht, Vertragsdaten werden automatisch übernommen
- [x] Gekündigte Abos laufen bis zum Vertragsende weiter („Gekündigt zum …“), Vorschlag für das Vertragsende
- [x] Kartenfarbe nach dem angezeigten Datum: rot ab 7 Tagen, gelb ab 30 Tagen vorher
- [x] Kachel „Fristen fällig“ zählt die roten Karten

**Paket 2 – Daten, PDF, Hilfe**
- [x] „Daten sichern“ unten in der App: Sicherung erstellen und Sicherung wiederherstellen
- [x] Wiederherstellen prüft die Datei vorher und fragt nach, die alten Abos werden vorher noch einmal gesichert
- [x] „Übersicht als PDF“: Liste aller Abos, wird komplett auf dem Handy erzeugt
- [x] Hilfe-Seite über das „?“ oben rechts, in einfacher Sprache
- [x] Unten „Von AppVektor“ mit Link zu appvektor.com

**Paket 3 – Erinnerungen**
- [x] Buch-Link entfernt
- [x] Datenschutz: Hinweis zum Link auf appvektor.com
- [x] Mitteilung 7 Tage vor „Kündigung möglich bis“: „[Name]: Kündigung nur noch bis [Datum] möglich.“
- [x] Gekündigte Abos: nur eine Mitteilung am letzten Tag: „[Name] endet heute.“
- [x] Hinweis beim App-Start: „Kündigungsfrist endet bald“ für alle roten Abos
- [x] Hilfetext angepasst

**Paket 4 – Englisch**
- [x] Alle Texte in einer Datei je Sprache (src/i18n/)
- [x] Komplette englische Fassung
- [x] Sprache automatisch nach Handysprache, zusätzlich wählbar über die Weltkugel oben rechts
- [x] Datum nach Land des Handys, Währungsanzeige unverändert
- [x] Englisches Kündigungsschreiben, neutral ohne deutsches Recht
- [x] Hilfe, Datenschutz, Impressum auf Englisch, mit „Im Zweifel gilt die deutsche Fassung“
- [x] Mitteilungen in der gewählten Sprache
- [x] Datenschutz nennt die neuen Felder (Vertragsnummer, Kundennummer, Anschrift, Absender)

**Paket 5 – Neue Funktionen und Sprachen**
- [x] Kündigungsfrist wahlweise in Tagen, Wochen oder Monaten (Monate als echte Kalendermonate)
- [x] Probeabo / Testzeitraum mit „Probezeit endet am“, Erinnerung 3 Tage vorher
- [x] Spanisch, Französisch, Portugiesisch (Brasilien), komplett mit Schreiben, Hilfe, Datenschutz, Impressum
- [x] Sprachwahl: Automatisch / Deutsch / English / Español / Français / Português
- [x] Abo per Foto einlesen: iPhone mit Apple Vision, Android mit Tesseract, nur auf dem Handy, ohne Internet
- [x] Foto: Werte werden nur vorgeschlagen, das Bild wird nicht gespeichert, Kamera/Fotos nur auf Knopfdruck
- [x] Foto: Erklärtexte für Kamera und Fotos auf dem iPhone in allen 5 Sprachen
- [x] Datenschutz in allen 5 Sprachen um die Foto-Funktion ergänzt
- [x] Test-App „AWP Test“ für Android, läuft neben der Store-Version

**Paket 6 – Feinschliff (16.11.2026)**
- [x] iPhone-Zoom-Fix aus 2.0.1 übernommen (Zoom aus, Tastatur-Plugin, kein seitlicher Überlauf)
- [x] Untertitel „Alles im Blick“ (EN Everything at a glance, ES Todo bajo control, FR Tout sous contrôle, PT Tudo sob controle)
- [x] Suchfeld-Platzhalter ohne Leerzeichen vor „…“
- [x] Layout 5 Sprachen bei 360/390 px: Titel max. 2 Zeilen, Felder bündig, kürzere Beschriftungen (PT „Frequência“, FR „Fréquence“ u. a.), Kachel-Texte nicht mehr abgeschnitten
- [x] Foto: Rechnungs-/Zahlungsdatum wird erkannt; liegt es in der Vergangenheit, schlägt die App die nächste Zahlung nach dem Turnus vor (änderbar)
- [x] Neue Test-APK gebaut: G:\AboWarnerMobile\builds\AWP-Test-2026-11-16.apk (installiert sich über die alte AWP Test, gleicher Debug-Schlüssel)
- [ ] Diese APK auf Jens' Handy testen (Foto mit Rechnung, Portugiesisch-Ansicht)

**Paket 7 – Korrekturen aus dem Screenshot-Lauf (22.11.2026)**
- [x] Foto: Anschrift wird auch mit „ust“, „vat“, „fax“, „bic“ im Wort erkannt (z. B. Industriestraße)
- [x] Beträge landesüblich: Englisch mit Punkt, Tausendertrennung in allen Sprachen (2.466,00 / 2,466.00 / 2 466,00)
- [x] Eingabe versteht alle Schreibweisen (1.299,99 / 1,299.99 / 1 299,99)
- [x] Französisch: kürzerer Suchtext „Rechercher un abonnement…“
- [x] Fußzeile scrollt mit statt dauerhaft Platz zu nehmen; weniger Leerraum über der Suche (Handy)
- [x] Karten: Preis immer rechts neben dem Namen, Trennlinie mit Abstand, drei Knöpfe in einer Zeile (geprüft ab 320 px)
- [x] Kündigungsschreiben: Textfeld nutzt die freie Höhe, Knöpfe bleiben sichtbar
- [x] Fristen-Hinweis beim Start deckend, auf dem Handy in voller Breite
- [x] Neue Test-APK gebaut: G:\AboWarnerMobile\builds\AWP-Test-2026-11-22.apk (Paket 7 bis 10, installiert sich über die alte AWP Test)
- [x] Erster Test auf dem Samsung S20 FE (22.11.2026): neun Befunde, bearbeitet in Paket 11. Warum „Seu monitoramento“ und 6,00 € angezeigt wurden, ist ungeklärt: Die APK von 17:42 enthält diesen Text nachweislich nicht und rechnet 6.99 und „6. 99“ richtig (ausgeführt und gemessen)
- [x] Zweiter Test auf dem S20 FE mit Stand 22.11.2026 18:53 0106b2a: fast alles in Ordnung, vier Punkte in Paket 12
- [x] Neue Test-APK mit sichtbarem Stand in der Fußzeile: G:\AboWarnerMobile\builds\AWP-Test-2026-11-22-1853.apk
- [x] Test-APK Paket 12: G:\AboWarnerMobile\builds\AWP-Test-2026-11-22-2048.apk
- [x] Dritter Test auf dem S20 FE mit Stand 22.11.2026 20:48 b490034: Vertragspartner, Schreiben, Erinnerung, Gekündigt-Anzeige in Ordnung; ein Punkt (Meldung bei fehlender Frist) in Paket 13
- [x] Test-APK Paket 13: G:\AboWarnerMobile\builds\AWP-Test-2026-11-22-2118.apk
- [ ] Test-APK Paket 13 auf Jens' Handy prüfen

**Paket 8 – Andere Länder (22.11.2026)**
- [x] Terminfehler Amerika behoben: Zahlungs- und Kündigungstermine nicht mehr einen Tag zu früh (nur update-2.0.2, nicht in 2.0.1; gespeicherte Daten waren immer richtig)
- [x] Datum im Format der App-Sprache und des Landes, nie in dem einer fremden Gerätesprache
- [x] Kalender beginnt je Land mit Sonntag, Montag oder Samstag
- [x] PDF in US-Letter in den USA und anderen Letter-Ländern, sonst A4
- [x] Währungssymbole landesüblich (29,90 € / €29.90 / R$ 29,90 / $29.90)
- [x] Hauptwährung wählbar (Weltkugel), automatisch nach den Abos und dem Land
- [x] Währung als Auswahlliste (62 Währungen) statt Freitext; alte und unbekannte Eingaben bleiben erhalten
- [x] Umgerechnete Summen mit „ca.“, Kurse der EU-Kommission November 2026; nicht umrechenbare Währungen werden nicht mitgezählt und genannt
- [x] Foto: „$“ nach Land, mehr Währungen erkannt
- [x] Jahressumme nicht mehr aus dem gerundeten Monat gerechnet
- [x] Kündigungsschreiben je Land: Deutsch, Englisch (GB, USA), Spanisch (Spanien, Lateinamerika), Französisch (Frankreich, Belgien, Schweiz, Kanada), Portugiesisch (Brasilien, Portugal)
- [x] Französisch „jusqu’au“ statt „avant le“
- [x] Monatsende: Zahlungen am 29., 30. oder 31. landen in kurzen Monaten am Monatsletzten und danach wieder am richtigen Tag (nur update-2.0.2)
- [x] Kündigungsschreiben von Kira gegengelesen und angepasst (22.11.2026, Paket 10)
- [ ] Kündigungsschreiben von Muttersprachlern gegenlesen lassen (alle außer Deutsch; neu: Einschreiben-Vermerke in de, en, es, pt). Vorlage: store-screenshots/kuendigungsschreiben-pruefen.md (nur lokal)
- [ ] Kurse vor jedem Update auffrischen (src/waehrungen.js)

**Paket 9 – Amerikanisches Englisch und Fehlersuche (22.11.2026)**

- [x] Englische App-Fassung in amerikanischer Schreibweise (canceled, recognized, Telecom …); britische Geräte behalten „Town and postcode“
- [x] Karte: „1 Tag bis Zahlung“ statt „1 Tage“ (5 Sprachen)
- [x] Bleibt die App über Mitternacht offen, werden Termine und Erinnerungen beim Zurückkehren erneuert
- [x] Doppeltes Tippen auf „Speichern“ legt ein Abo nur einmal an
- [x] Eigene Kategorie aus einer Sicherung bleibt beim Bearbeiten erhalten (wurde vorher zu „Streaming“)
- [x] Sonderzeichen wie „&copy“ im Namen bleiben beim Bearbeiten unverändert
- [x] Unmögliche Beträge (unendlich, „1.2.3“) werden abgelehnt; ein kaputter Betrag macht die Summe nicht mehr leer
- [x] Frist „1e3“ wird als 1000 gelesen statt als 1
- [x] Sehr lange Namen: Dateiname des Schreibens gekürzt (Teilen schlug sonst fehl), Titel im Brief-Fenster bricht um
- [x] Sehr große Summen und PDF-Beträge werden kleiner geschrieben statt abgeschnitten; PDF kennt œ, ™, š, ž
- [x] Fehlermeldung im Formular verschwindet nach dem Schließen
- [x] Fremde Angaben in einer Sicherungsdatei (Turnus „constructor“) können die App nicht mehr aufhängen
- [ ] Offen: drei Nachkommastellen (KWD, TND): „1.250“ wird als 1250 gelesen
- [ ] Englischer Text in der App: von Muttersprachler (USA) gegenlesen lassen

**Paket 10 – Sicher speichern, Briefe, Frist (22.11.2026)**

- [x] Zweite Sicherheitskopie der Abo-Datei (abos-kopie.json): Ist die Hauptdatei beschädigt oder verschwunden, stellt die App die Abos beim Start wieder her und sagt es
- [x] Beschädigte Dateien werden aufgehoben und nie überschrieben; geht das nicht, ist Speichern gesperrt (mit Hinweis)
- [x] Jedes Speichern wird zurückgelesen und verglichen; schlägt es fehl, erscheint „Nicht gespeichert“, Eingaben bleiben im Formular (Anlegen, Bearbeiten, Löschen, Kündigen, Sprache/Währung, Absender)
- [x] Teilen: echter Fehler wird gemeldet (vorher wie „abgebrochen“ behandelt)
- [x] Gerätesicherung (iCloud/Google) und Sicherheitskopie im Datenschutztext in der App (5 Sprachen)
- [x] Kündigungsfrist bei der Eingabe höchstens 10 Jahre (3650 Tage, 520 Wochen, 120 Monate); alte Daten mit unsinniger Frist zeigen gelb „Frist prüfen“ statt grün „Sicher“
- [x] Schreiben: Schalter „Per Einschreiben“ (Standard aus), Vermerk nur dann, in allen 11 Fassungen
- [x] Schreiben: es-ES-Kernsatz, englischer Betreff „Cancellation – …“, deutsche Unterschriftslinie
- [x] Schreiben: Von Hand geänderter Text bleibt erhalten, wenn danach Absender oder Einschreiben geändert wird
- [x] Datenschutzseite auf abo-warner-pro.com um die zweite Sicherheitskopie und die aufgehobene beschädigte Datei ergänzt, 5 Sprachen (veröffentlicht 22.11.2026, Commit 260c296)

**Paket 11 – Rückmeldungen vom Handy (22.11.2026)**

- [x] Beträge: Punkt und Komma, Leerzeichen der Tastatur („6. 99“), fremde Ziffern und Währungszeichen davor werden verstanden; Unklares wird mit Hinweis abgelehnt, nie still gekürzt
- [x] Kostenfeld zeigt beim Tippen das Zeichen des Landes und nach dem Verlassen genau den Betrag, der gespeichert wird
- [x] Kündigungsschreiben wird als PDF geteilt (A4 oder US-Letter, fetter Betreff, Platz für die Unterschrift); Namen wie Łukasz oder Иван werden richtig gedruckt; Kopieren in die Zwischenablage bleibt
- [x] Foto: Anbieter und Anschrift aus Absenderzeile und mehrspaltiger Fußzeile; Bank, Zahlungsdienst und Empfänger zählen nicht; „Max Mustermann“ wird nicht mehr zur Marke „Max“
- [x] Foto: verliert die Texterkennung das Komma (29,99 → 299), wird der Betrag aus Netto und Steuer berechnet oder weggelassen
- [x] Foto: Turnus aus dem Abrechnungszeitraum, Datum auch aus „Datum: …“ auf Rechnungen
- [x] Kategorie: im Formular alle neun, neutral „Bitte wählen“; Foto schlägt sie aus dem Inhalt vor
- [x] Hilfe, App und Store-Texte: PDF-Übersicht nur zum Lesen und Drucken, Wiederherstellen nur mit der Sicherung; wer eine PDF als Sicherung wählt, bekommt eine klare Meldung
- [x] Alle Sprachen auf alte Textreste geprüft (Vergleich mit dem Stand vom 14.11.): keine
- [ ] Foto-Funktion mit echten Rechnungen auf dem Handy prüfen (hier nur mit selbst gebauten Beispielrechnungen und Tesseract am PC)

**Paket 12 – Vertragspartner, Währungszeichen, PDF-Übersicht (22.11.2026)**

- [x] Foto: Vertragspartner nur mit Beleg (Anschrift in der Absenderzeile, Registerangaben, Kontaktzeile darunter oder erkennbarer Empfänger weiter unten), sonst bleibt das Feld leer; nie die Anschrift des Empfängers, keine Wortreste wie „Ihre“ oder „Kundenreferenz“
- [x] Gemerkte eigene Anschrift wird nie Vertragspartner; ist sie schon gespeichert, lässt das Schreiben sie weg und warnt (5 Sprachen)
- [x] Tipp im Schreiben: Einzahl und Mehrzahl, Aufzählung mit „und“ (5 Sprachen)
- [x] Portugiesisch: Euro hinten („6,99 €“), Real vorn („R$ 6,99“); auf brasilianischen Geräten Euro landesüblich „€ 6,99“
- [x] PDF-Übersicht: Ł, Ş, Kyrillisch, Japanisch, Hebräisch und Emoji werden gezeichnet statt „?“ (dann Text in der PDF nicht markierbar); Emoji werden beim Kürzen nicht zerschnitten

**Paket 13 – Pflichtfelder**

- [x] Meldung nennt genau das fehlende oder falsche Feld, steht direkt am Feld und unter dem Knopf, Feld rot markiert, App scrollt hin; gilt für Neues Abo und Bearbeiten (5 Sprachen). Bei mehreren Feldern werden alle genannt
- [x] Markierung verschwindet, sobald das Feld geändert, per Kalender gewählt oder vom Foto ausgefüllt wird
- [x] Frist mit Nachkommastellen („2.5“) wird gemeldet statt still abgeschnitten
- [x] Auswahl „Jederzeit kündbar“ neben Tage/Wochen/Monate (5 Sprachen): Karte grün mit Hinweis auf die nächste Zahlung, keine Frist-Erinnerung, Probezeit erinnert weiter; auch in Schreiben, PDF-Übersicht, Sicherung und Hilfe. Vorhandene Abos (auch mit 0 Tagen) unverändert
- [x] Entscheidung: vorerst keine Erinnerung vor jeder Zahlung
- [x] Frist 0 und heute Zahlungstag: Vertragsende-Vorschlag ist jetzt der Tag vor der folgenden Zahlung (vorher gestern)

**Geprüft**
- [x] Keine Daten verlassen das Handy, kein Analytics-, Tracking- oder Werbe-SDK (14.11.2026)
- [x] Android-App ohne Internet-, Kamera- und Foto-Berechtigung

---

## 3. Noch offen für das Update

- [ ] iPhone-Zoom beim Antippen von Eingabefeldern: 16px allein reichte nicht (Build 2). Am 16.11.2026 vollständig behoben (Zoom aus, Tastatur-Plugin, seitlicher Überlauf, Ansicht springt zurück; Playwright-WebKit-Test 360/390/440 px ok), Commit 156568e in update-2.0.2 – Test auf echtem iPhone offen
- [ ] Foto-Funktion auf echtem iPhone testen (Codemagic-Build)
- [ ] Erkennungsqualität Tesseract auf Jens' Android-Handy testen
- [ ] Übersetzungen ES/FR/PT: Bedeutung prüfen (Kira anhand von Screenshots), Gegenleser optional später
- [x] Versionsnummer auf 2.0.2 setzen (24.11.2026)
- [x] Store-Screenshots erzeugt: 135 Bilder, 5 Sprachen, iPhone 6,9 und 6,3 Zoll, iPad 13 Zoll, Google Play (22.11.2026; DE/ES/FR mit Euro, EN mit Dollar im US-Format, PT mit Real; Ordner store-screenshots, nur lokal, nicht auf GitHub und nicht hochgeladen)
- [ ] Screenshots ansehen und freigeben (Jens, Kira)
- [x] Store-Texte in 5 Sprachen auf Stand 2.0.2 vorbereitet, mit Änderungsliste (22.11.2026, store-assets/store-texte.md, nicht hochgeladen)
- [x] Store-Texte: „Jederzeit kündbar“ in Beschreibung und „Was ist neu“ ergänzt, 5 Sprachen mit den Begriffen aus der App; alle Felder nachgezählt, alle innerhalb der Grenzen (24.11.2026)
- [x] Store-Texte: Kartenanzeige richtiggestellt („Kündigung möglich bis …“, „Jederzeit kündbar“, „Gekündigt zum …“), neu: Schreiben je Land, „Per Einschreiben“, Mitteilung am letzten Tag, Hilfe; veralteter Datenschutz-Hinweis entfernt; ES/FR „Was ist neu“ gekürzt; alle Felder innerhalb der Grenzen (24.11.2026)
- [ ] Store-Texte freigeben (Jens, Kira), ES/FR/PT gegenlesen lassen
- [x] Datenschutzseite auf abo-warner-pro.com in 5 Sprachen auf Stand 2.0.2 (neue Felder, Foto-Funktion, Link zu appvektor.com, Gerätesicherung; veröffentlicht 22.11.2026, Commit f35d757)
- [x] Play Console Datensicherheit geprüft (22.11.2026): „keine Daten erhoben, keine geteilt“ passt weiter; in der Console selbst noch von Jens zu vergleichen
- [ ] Hinweis an Apple in den Prüfnotizen (Link zu appvektor.com, in der App wird nichts verkauft)
- [ ] Anleitung für Tester, wie man ein Abo richtig einträgt
- [ ] Gesperrte Dateien vom alten Rechner bereinigen (ios/App/App.xcodeproj/project.pbxproj, android/build/reports/problems/problems-report.html) – als Administrator löschen, dann project.pbxproj mit `git checkout` wiederherstellen

---

## 4. Vor dem Start in den Stores (kein App-Code, nur zur Übersicht)

- [ ] Apple: iPhone-Zoom in Version 2.0.1 – Build 2 hat es NICHT behoben; Build 3 mit vollständigem Fix im Zweig fix-2.0.1-zoom (6845a36, auf GitHub, 16.11.2026). Offen: Codemagic-Workflow „iOS – Build, Sign & TestFlight“ auf diesem Zweig starten, auf echtem iPhone prüfen – VOR dem Bildschirmvideo
- [ ] Apple: iPhone-Bildschirmvideo + Antworten auf Punkte 2–6 der Ablehnung (Guideline 2.1)
- [ ] Apple: DSA-Händlerprüfung neu einreichen (Antworten von María und Flexdienst abwarten)
- [ ] Google: Produktionsantrag frühestens ca. 24.11.2026 (12 Tester, 14 Tage)
- [ ] Google: Preise zurückstellen – Deutschland 0,09 EUR und Polen 0,39 PLN auf Endpreis 4,99 EUR
- [ ] Google: DSA-Händlerstatus angeben, Frist 1. Februar 2027
- [x] Upload-Schlüssel und keystore.properties auf USB-Stick sichern (15.11.2026, Intenso-Stick, Ordner AppVektor-Sicherung-2026-11-15, zusammen mit G:\Geschäftsunterlagen; Apple-Schlüssel .p8/Zertifikate nicht auf diesem Rechner gefunden)

---

## 5. Webseiten und Buch

- [x] appvektor.com in 5 Sprachen gebaut (Deutsch, Englisch, Spanisch, Französisch, Portugiesisch), wie in der App: automatische Erkennung nach Browsersprache, Umschalter (Weltkugel), Wahl wird gemerkt, Impressum und Datenschutz in allen Sprachen mit „Im Zweifel gilt die deutsche Fassung“ (14.11.2026, Projekt G:\appvektor-landing, Zweig sprachen, nur lokal)
- [x] appvektor.com: feste Adressen je Sprache (/de/, /en/, /es/, /fr/, /pt/ + /impressum, /datenschutz), Titel, Beschreibung und lang je Sprache für Google
- [x] appvektor.com: veröffentlicht (15.11.2026)
- [x] appvektor.com: Cloudflare-Token (CLOUDFLARE_API_TOKEN) auf dem neuen Rechner eingerichtet (15.11.2026)
- [x] appvektor.com: Projekt auf GitHub gesichert (16.11.2026)
- [x] appvektor.com: Produkttext zu Abo-Warner Pro in allen 5 Sprachen auf den aktuellen Stand gebracht: iPhone und Android, Einmalkauf 4,99 €, alles lokal, in Prüfung bei Apple und Google; Foto-Funktion bewusst nicht erwähnt (15.11.2026, Zweig sprachen, nur lokal)
- [ ] Link in der App zu appvektor.com öffnet die Seite in der gerade gewählten App-Sprache (Adressen stehen jetzt fest, z. B. appvektor.com/en/)
- [x] wieticktkiwirklich.com (Buchseite) in DE/EN/ES/FR/PT, fremde Sprachen mit Hinweis „Buch erscheint auf Deutsch“ (15.11.2026, nur lokal)
- [x] abo-warner-pro.com in DE/EN/ES/FR/PT, Texte passend zur App 2.0.1 (15.11.2026, nur lokal)
- [ ] Buch nach Fertigstellung ins Englische übersetzen (eigenes Projekt)
- [ ] Buch zuerst nur auf Deutsch veröffentlichen (Print-on-Demand, E-Book), um zu sehen, wie es läuft
- [ ] Buch weltweit: Amazon Kindle Translate prüfen (Beta nur auf Einladung, Deutsch → Englisch, danach weitere Sprachen; Rechte an der Übersetzung klären; nur E-Book)
- [ ] Hörbuch prüfen (eigener Schritt, echte Stimme oder KI-Stimme)

---

## GITHUB-SICHERUNG (Stand 16.11.2026)

Alle Repos privat, Konto Bolte7Verena. Anmeldung über den Git Credential Manager, kein Token in der Remote-URL. Vor dem ersten Push die komplette Historie auf Zugangsdaten geprüft (keine gefunden).

| Ordner auf dem Medion | GitHub-Repo | Zweige auf GitHub | Live-Seite |
|---|---|---|---|
| G:\AboWarnerMobile (+ Arbeitsordner G:\AboWarnerMobile-fix-zoom) | Bolte7Verena/AboWarnerMobile | master (= update-2.0.2, Version 2.0.2), fix-2.0.1-zoom, update-2.0.2 | – (App) |
| G:\appvektor-landing | Bolte7Verena/appvektor-landing | sprachen (= live, Standardzweig), main (alter Stand vor den Sprachen) | appvektor.com (Worker appvektor) |
| G:\minimalist-landing-gen-main | Bolte7Verena/abo-warner-pro-landing | main | abo-warner-pro.com (Worker tanstack-start-ts) |
| G:\wie-tickt-ki-wirklich | Bolte7Verena/wieticktkiwirklich | main | wieticktkiwirklich.com (Worker wieticktkiwirklich) |
| G:\abo-warner-www-redirect | Bolte7Verena/abo-warner-www-redirect | main | www.abo-warner-pro.com → abo-warner-pro.com (Worker abo-warner-www-redirect; Code = live, 16.11.2026) |

---

## 6. Bewusst verworfen

- Windows-App (18.10.2026): wird nicht mehr gepflegt
- Japanisch und Norwegisch in der App (13.11.2026): vorerst nicht
- Link zur Buchseite in der App (13.11.2026): nur appvektor.com bleibt
- Automatische Verlängerung der Kündigungsfrist (14.11.2026): zu aufwendig, stattdessen Tage/Wochen/Monate
- Google ML Kit für Fotos (14.11.2026): sendet Nutzungsdaten an Google, stattdessen Tesseract

---

## 7. Ideen für später

- Weitere Sprachen, Märkte Naher Osten und China prüfen
