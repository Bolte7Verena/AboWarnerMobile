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

final class AboWarnerProUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testMachtStoreScreenshots() throws {
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launchArguments += ["UITEST_SEED_DEMO_DATA"]
        app.launch()

        // 01 — Übersicht: Stat-Kacheln + mehrere Demo-Abos mit allen vier
        // Status-Farben (Sicher/Bald fällig/Kritisch/Gekündigt).
        let aboListe = app.otherElements["abo-liste"].exists
            ? app.otherElements["abo-liste"]
            : app.scrollViews.firstMatch
        _ = aboListe.waitForExistence(timeout: 20)
        XCTAssertTrue(app.staticTexts["Abo-Übersicht"].waitForExistence(timeout: 20))
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
