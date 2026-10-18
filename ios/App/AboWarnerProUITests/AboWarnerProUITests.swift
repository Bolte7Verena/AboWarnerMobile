// AboWarnerProUITests.swift
//
// Fährt die App für Fastlane Snapshot durch fünf feste Bildschirme und
// löst an jedem die passende snapshot()-Aufnahme aus. Läuft ausschließlich
// unter `fastlane snapshot` im iOS-Simulator (Codemagic-Cloud-Build) —
// lokal auf Windows nicht ausführbar/testbar.
//
// Die App wird mit dem Startargument "UITEST_SEED_DEMO_DATA" gestartet.
// SceneDelegate.swift erkennt das und injiziert ein WebView-Flag, auf das
// src/demo-seed.js reagiert und vier feste Demo-Abos anlegt (siehe dort) —
// ohne dieses Argument bleibt die App unverändert, es betrifft nur
// Screenshot-Läufe.
import XCTest

// @MainActor: Die aktuell von Codemagic installierte Fastlane-Version
// markiert setupSnapshot()/snapshot() aus SnapshotHelper.swift als
// MainActor-isoliert. Ohne diese Annotation hier verweigert der Compiler
// den Aufruf aus einem synchronen, nicht-isolierten Kontext (Fehler "call
// to main actor-isolated global function ... in a synchronous
// nonisolated context", 6x beim Codemagic-Build vom 18.10.2026).
@MainActor
final class AboWarnerProUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testMachtStoreScreenshots() throws {
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launchArguments += ["UITEST_SEED_DEMO_DATA"]
        app.launch()

        // Diagnose: volle Accessibility-Hierarchie unbedingt ins Build-Log
        // schreiben (läuft VOR jeder Prüfung, also auch wenn diese scheitert)
        // — zeigt exakt, was XCUITest nach dem App-Start tatsächlich sieht,
        // statt bei einem Fehlschlag erneut raten zu müssen.
        print("=== ACCESSIBILITY-HIERARCHIE NACH APP-START ===")
        print(app.debugDescription)
        print("=== ENDE HIERARCHIE ===")

        // 01 — Übersicht: Stat-Kacheln + mehrere Demo-Abos mit allen vier
        // Status-Farben (Sicher/Bald fällig/Kritisch/Gekündigt).
        //
        // Absichtlich ein CONTAINS-Vergleich statt exaktem Textabgleich:
        // WKWebView fasst benachbarte Textknoten (Überschrift + Unterzeile +
        // Beschreibung in derselben .intro-Box) teils zu einem einzigen
        // Accessibility-Element mit zusammengesetztem Label zusammen — eine
        // Suche nach exakt "Abo-Übersicht" fände dann nichts, obwohl der
        // Text sichtbar ist. Das ist eine begründete Vermutung, noch nicht
        // bestätigt — die Hierarchie-Ausgabe oben zeigt es im nächsten Lauf.
        let title = app.staticTexts.matching(
            NSPredicate(format: "label CONTAINS[c] 'Abo-Übersicht'")
        ).firstMatch
        XCTAssertTrue(title.waitForExistence(timeout: 20))
        snapshot("01-Uebersicht")

        // Fälligkeits-Hinweis-Toast ("In 3 Tagen fällig") — von Netflix in
        // den Demo-Daten ausgelöst. Falls er noch sichtbar ist, eigene
        // Aufnahme davon; sonst überspringen wir diesen einen Screen, statt
        // den ganzen Testlauf scheitern zu lassen.
        if app.staticTexts["In 3 Tagen fällig"].waitForExistence(timeout: 5) {
            snapshot("02-Erinnerung")
        }

        // 03 — Neues Abo: Hinzufügen-Formular.
        app.buttons["Neues Abo"].tap()
        XCTAssertTrue(app.textFields["input-name"].waitForExistence(timeout: 10)
                      || app.staticTexts["Neues Abo hinzufügen"].waitForExistence(timeout: 10))
        snapshot("03-NeuesAbo")
        if app.buttons["Schließen"].exists {
            app.buttons["Schließen"].tap()
        }

        // 04 — Kündigungsschreiben: Vorschau-Modal zum ersten "Kündigen"-Button.
        let kuendigenButton = app.buttons["Kündigen"].firstMatch
        if kuendigenButton.waitForExistence(timeout: 10) {
            kuendigenButton.tap()
            _ = app.staticTexts["Kündigungsschreiben"].waitForExistence(timeout: 10)
            snapshot("04-Kuendigungsschreiben")
            if app.buttons["Schließen"].exists {
                app.buttons["Schließen"].tap()
            }
        }

        // 05 — Kategoriefilter: gefilterte Ansicht (z.B. nur "Streaming").
        let streamingChip = app.buttons["Streaming"].firstMatch
        if streamingChip.waitForExistence(timeout: 10) {
            streamingChip.tap()
            snapshot("05-Kategoriefilter")
        }
    }
}
