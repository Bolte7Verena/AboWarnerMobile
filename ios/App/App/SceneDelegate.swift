import UIKit
import Capacitor
import WebKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        let bridgeViewController = CAPBridgeViewController()

        // Nur für automatisierte Store-Screenshots (Fastlane Snapshot/XCUITest,
        // siehe AboWarnerProUITests): setzt ein Flag im WebView-Kontext, BEVOR
        // die App-eigenen Skripte laufen, damit src/demo-seed.js feste
        // Demo-Abos anzeigen kann. Ohne dieses Startargument bleibt die App
        // für echte Nutzer unverändert — kein Einfluss auf das normale
        // Laufzeitverhalten.
        if ProcessInfo.processInfo.arguments.contains("UITEST_SEED_DEMO_DATA") {
            _ = bridgeViewController.view // erzwingt viewDidLoad, damit bridge/webView existieren
            let script = WKUserScript(
                source: "window.__UITEST_SEED_DEMO_DATA__ = true;",
                injectionTime: .atDocumentStart,
                forMainFrameOnly: true
            )
            bridgeViewController.bridge?.webView?.configuration.userContentController.addUserScript(script)
        }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = bridgeViewController
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
