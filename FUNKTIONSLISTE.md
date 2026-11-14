# Abo-Warner Pro – Funktionsliste

Die eine Übersicht für Jens, Kira und Lilly.
[x] = erledigt, [ ] = offen.
Lilly hält diese Liste nach jedem erledigten Auftrag aktuell.

Stand: 14.11.2026

---

## GRUNDREGEL

Alles wird für den weltweiten Markt gebaut. Jede App, jede Webseite und jedes Buch mindestens auf Deutsch UND Englisch, mit automatischer Spracherkennung und Umschalter. Weitere Sprachen nach Markt.

---

## 1. Version 2.0.1 (Zweig master, liegt bei Apple und Google in der Prüfung)

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

## 2. Update 2.0.2 (Zweig update-2.0.2)

Geprüft im Code von update-2.0.2. Noch nicht in den Stores.

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

**Geprüft**
- [x] Keine Daten verlassen das Handy, kein Analytics-, Tracking- oder Werbe-SDK (14.11.2026)
- [x] Android-App ohne Internet-, Kamera- und Foto-Berechtigung

---

## 3. Noch offen für das Update

- [ ] Foto-Funktion auf echtem iPhone testen (Codemagic-Build)
- [ ] Erkennungsqualität Tesseract auf Jens' Android-Handy testen
- [ ] Übersetzungen ES/FR/PT: Bedeutung prüfen (Kira anhand von Screenshots), Gegenleser optional später
- [ ] Versionsnummer auf 2.0.2 setzen (erst kurz vor Einreichung)
- [ ] Store-Screenshots neu erzeugen (Deutsch und Englisch, später ggf. ES/FR/PT)
- [ ] Store-Texte Englisch, Spanisch, Französisch, Portugiesisch (schreibt Kira)
- [ ] Datenschutzseite auf abo-warner-pro.com anpassen (neue Felder, Foto-Funktion, Link zu appvektor.com) – anderes Projekt
- [ ] Hinweis an Apple in den Prüfnotizen (Link zu appvektor.com, in der App wird nichts verkauft)
- [ ] Anleitung für Tester, wie man ein Abo richtig einträgt
- [ ] Gesperrte Dateien vom alten Rechner bereinigen (ios/App/App.xcodeproj/project.pbxproj, android/build/reports/problems/problems-report.html) – als Administrator löschen, dann project.pbxproj mit `git checkout` wiederherstellen

---

## 4. Vor dem Start in den Stores (kein App-Code, nur zur Übersicht)

- [ ] Apple: iPhone-Bildschirmvideo + Antworten auf Punkte 2–6 der Ablehnung (Guideline 2.1)
- [ ] Apple: DSA-Händlerprüfung neu einreichen (Antworten von María und Flexdienst abwarten)
- [ ] Google: Produktionsantrag frühestens ca. 24.11.2026 (12 Tester, 14 Tage)
- [ ] Google: Preise zurückstellen – Deutschland 0,09 EUR und Polen 0,39 PLN auf Endpreis 4,99 EUR
- [ ] Google: DSA-Händlerstatus angeben, Frist 1. Februar 2027
- [ ] Upload-Schlüssel und keystore.properties auf USB-Stick sichern

---

## 5. Webseiten und Buch

- [x] appvektor.com in 5 Sprachen gebaut (Deutsch, Englisch, Spanisch, Französisch, Portugiesisch), wie in der App: automatische Erkennung nach Browsersprache, Umschalter (Weltkugel), Wahl wird gemerkt, Impressum und Datenschutz in allen Sprachen mit „Im Zweifel gilt die deutsche Fassung“ (14.11.2026, Projekt G:\appvektor-landing, Zweig sprachen, nur lokal)
- [x] appvektor.com: feste Adressen je Sprache (/de/, /en/, /es/, /fr/, /pt/ + /impressum, /datenschutz), Titel, Beschreibung und lang je Sprache für Google
- [ ] appvektor.com: Vorschau ansehen und Veröffentlichen freigeben (Jens), dann veröffentlichen
- [ ] appvektor.com: Cloudflare-Token (CLOUDFLARE_API_TOKEN) auf dem neuen Rechner einrichten – ist hier noch nicht gesetzt
- [ ] appvektor.com: Projekt auf GitHub sichern (Git ist jetzt angelegt, aber noch ohne GitHub)
- [ ] appvektor.com: Produkttext zu Abo-Warner Pro prüfen (nennt noch Kontoauszug-Erkennung, CSV-Export und „Apps in Vorbereitung“)
- [ ] Link in der App zu appvektor.com öffnet die Seite in der gerade gewählten App-Sprache (Adressen stehen jetzt fest, z. B. appvektor.com/en/)
- [ ] wieticktkiwirklich.com (Buchseite) auf Englisch, mit Hinweis „English edition in preparation“
- [ ] abo-warner-pro.com: Englisch ist schon da, später Spanisch/Französisch/Portugiesisch passend zur App
- [ ] Buch nach Fertigstellung ins Englische übersetzen (eigenes Projekt)
- [ ] Buch zuerst nur auf Deutsch veröffentlichen (Print-on-Demand, E-Book), um zu sehen, wie es läuft
- [ ] Buch weltweit: Amazon Kindle Translate prüfen (Beta nur auf Einladung, Deutsch → Englisch, danach weitere Sprachen; Rechte an der Übersetzung klären; nur E-Book)
- [ ] Hörbuch prüfen (eigener Schritt, echte Stimme oder KI-Stimme)

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
