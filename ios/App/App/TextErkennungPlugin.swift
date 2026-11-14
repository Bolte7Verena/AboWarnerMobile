import Foundation
import UIKit
import Vision
import Capacitor

/// "Per Foto einlesen": Texterkennung ausschließlich auf dem Gerät mit
/// Apple Vision (VNRecognizeTextRequest). Kein Netzwerk, kein Server.
/// Das Bild kommt nur als Base64 im Speicher an und wird nicht gespeichert.
/// Danach werden Bild-Zwischendateien im temporären Ordner der App gelöscht
/// (z.B. die Kopie, die die Bildauswahl des WebViews dort ablegt).
@objc(TextErkennungPlugin)
public class TextErkennungPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TextErkennungPlugin"
    public let jsName = "TextErkennung"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "erkenne", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "aufraeumen", returnType: CAPPluginReturnPromise)
    ]

    // App-Sprachcodes -> Vision-Sprachen
    private static let visionSprachen: [String: String] = [
        "de": "de-DE", "en": "en-US", "es": "es-ES", "fr": "fr-FR", "pt": "pt-BR"
    ]

    @objc func erkenne(_ call: CAPPluginCall) {
        guard let base64 = call.getString("bild"),
              let daten = Data(base64Encoded: base64, options: .ignoreUnknownCharacters),
              let bild = UIImage(data: daten),
              let cgBild = bild.cgImage else {
            call.reject("Bild nicht lesbar")
            return
        }
        let gewuenscht = (call.getArray("sprachen", String.self) ?? ["de", "en", "es", "fr", "pt"])
            .compactMap { Self.visionSprachen[$0] }

        DispatchQueue.global(qos: .userInitiated).async {
            defer { Self.loescheBildZwischendateien() }
            let anfrage = VNRecognizeTextRequest()
            anfrage.recognitionLevel = .accurate
            anfrage.usesLanguageCorrection = true
            if let unterstuetzt = try? anfrage.supportedRecognitionLanguages() {
                let sprachen = gewuenscht.filter { unterstuetzt.contains($0) }
                if !sprachen.isEmpty { anfrage.recognitionLanguages = sprachen }
            }
            let handler = VNImageRequestHandler(cgImage: cgBild, orientation: .up, options: [:])
            do {
                try handler.perform([anfrage])
            } catch {
                call.reject("Texterkennung fehlgeschlagen", nil, error)
                return
            }
            call.resolve(["zeilen": Self.zuZeilen(anfrage.results ?? [])])
        }
    }

    @objc func aufraeumen(_ call: CAPPluginCall) {
        DispatchQueue.global(qos: .utility).async {
            Self.loescheBildZwischendateien()
            call.resolve()
        }
    }

    /// Fügt erkannte Textstücke, die auf gleicher Höhe stehen (z.B.
    /// "Kundennummer:" links und der Wert rechts), zu einer Zeile zusammen.
    /// Reihenfolge: von oben nach unten, innerhalb der Zeile von links nach rechts.
    private static func zuZeilen(_ beobachtungen: [VNRecognizedTextObservation]) -> [String] {
        let stuecke = beobachtungen.compactMap { b -> (box: CGRect, text: String)? in
            guard let text = b.topCandidates(1).first?.string, !text.isEmpty else { return nil }
            return (b.boundingBox, text)
        }.sorted { $0.box.midY > $1.box.midY } // Vision: y = 0 ist unten

        var zeilen: [[(box: CGRect, text: String)]] = []
        for stueck in stuecke {
            if let letzte = zeilen.last, let referenz = letzte.first,
               abs(referenz.box.midY - stueck.box.midY) < max(referenz.box.height, stueck.box.height) * 0.5 {
                zeilen[zeilen.count - 1].append(stueck)
            } else {
                zeilen.append([stueck])
            }
        }
        return zeilen.map { zeile in
            zeile.sorted { $0.box.minX < $1.box.minX }.map { $0.text }.joined(separator: " ")
        }
    }

    /// Löscht Bilddateien im temporären Ordner der App (die App selbst legt
    /// dort nichts anderes ab; Sicherungen und PDFs liegen in Caches).
    private static func loescheBildZwischendateien() {
        let fm = FileManager.default
        let tmp = URL(fileURLWithPath: NSTemporaryDirectory(), isDirectory: true)
        guard let aufzaehlung = fm.enumerator(at: tmp, includingPropertiesForKeys: [.isRegularFileKey]) else { return }
        let endungen: Set<String> = ["jpg", "jpeg", "png", "heic", "heif", "gif", "tif", "tiff", "webp"]
        for case let datei as URL in aufzaehlung where endungen.contains(datei.pathExtension.lowercased()) {
            try? fm.removeItem(at: datei)
        }
    }
}
