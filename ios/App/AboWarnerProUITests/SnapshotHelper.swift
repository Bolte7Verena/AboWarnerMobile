// SnapshotHelper.swift — Standard-Hilfsdatei von Fastlane Snapshot
// (https://docs.fastlane.tools/actions/snapshot/), unverändert in der
// aktuell von Fastlane dokumentierten Fassung übernommen. Wird von
// `fastlane snapshot` zur Build-Zeit automatisch auf die jeweils neueste
// Version aktualisiert — nicht von Hand anpassen.
//
// swiftlint:disable all
import Foundation
import XCTest

var deviceLanguage = ""
var locale = ""

func setupSnapshot(_ app: XCUIApplication, waitForAnimations: Bool = true) {
    Snapshot.setupSnapshot(app, waitForAnimations: waitForAnimations)
}

func snapshot(_ name: String, timeWaitingForIdle: TimeInterval = 20) {
    Snapshot.snapshot(name, timeWaitingForIdle: timeWaitingForIdle)
}

enum SnapshotError: Error, CustomDebugStringConvertible {
    case cannotFindSimulatorHomeDirectory
    case cannotRunOnPhysicalDevice

    var debugDescription: String {
        switch self {
        case .cannotFindSimulatorHomeDirectory:
            return "Couldn't find simulator home location. Please, check SIMULATOR_HOST_HOME env variable."
        case .cannotRunOnPhysicalDevice:
            return "Can't use Snapshot on a physical device."
        }
    }
}

@objcMembers
open class Snapshot: NSObject {
    static var app: XCUIApplication?
    static var waitForAnimations = true
    static var cacheDirectory: URL?
    static var screenshotsDirectory: URL? {
        return cacheDirectory?.appendingPathComponent("screenshots", isDirectory: true)
    }

    open class func setupSnapshot(_ app: XCUIApplication, waitForAnimations: Bool = true) {
        Snapshot.app = app
        Snapshot.waitForAnimations = waitForAnimations

        do {
            let cacheDir = try getCacheDirectory()
            Snapshot.cacheDirectory = cacheDir
            setLanguage(app)
            setLocale(app)
            setLaunchArguments(app)
        } catch let error {
            NSLog(error.localizedDescription)
        }
    }

    class func setLanguage(_ app: XCUIApplication) {
        guard let cacheDirectory = self.cacheDirectory else {
            NSLog("CacheDirectory is not set - probably running on a physical device?")
            return
        }

        let path = cacheDirectory.appendingPathComponent("language.txt")

        do {
            let trimCharacterSet = CharacterSet.whitespacesAndNewlines
            deviceLanguage = try String(contentsOf: path, encoding: .utf8).trimmingCharacters(in: trimCharacterSet)
            app.launchArguments += ["-AppleLanguages", "(\(deviceLanguage))"]
        } catch {
            NSLog("Couldn't detect/set language...")
        }
    }

    class func setLocale(_ app: XCUIApplication) {
        guard let cacheDirectory = self.cacheDirectory else {
            NSLog("CacheDirectory is not set - probably running on a physical device?")
            return
        }

        let path = cacheDirectory.appendingPathComponent("locale.txt")

        do {
            let trimCharacterSet = CharacterSet.whitespacesAndNewlines
            locale = try String(contentsOf: path, encoding: .utf8).trimmingCharacters(in: trimCharacterSet)
        } catch {
            NSLog("Couldn't detect/set locale...")
        }

        if locale.isEmpty && !deviceLanguage.isEmpty {
            locale = Locale(identifier: deviceLanguage).identifier
        }

        if !locale.isEmpty {
            app.launchArguments += ["-AppleLocale", "\"\(locale)\""]
        }
    }

    class func setLaunchArguments(_ app: XCUIApplication) {
        guard let cacheDirectory = self.cacheDirectory else {
            NSLog("CacheDirectory is not set - probably running on a physical device?")
            return
        }

        let path = cacheDirectory.appendingPathComponent("snapshot-launch_arguments.txt")
        app.launchArguments += ["FASTLANE_SNAPSHOT", "YES", "-FASTLANE_SNAPSHOT", "YES"]

        do {
            let launchArguments = try String(contentsOf: path, encoding: String.Encoding.utf8)
            let regex = try NSRegularExpression(pattern: "(\\\".+?\\\"|\\S+)", options: [])
            let matches = regex.matches(in: launchArguments, options: [], range: NSRange(location: 0, length: launchArguments.count))
            let results = matches.map { result -> String in
                (launchArguments as NSString).substring(with: result.range)
            }
            app.launchArguments += results
        } catch {
            NSLog("Couldn't detect/set launch_arguments...")
        }
    }

    open class func snapshot(_ name: String, timeWaitingForIdle: TimeInterval = 20) {
        if timeWaitingForIdle > 0 {
            waitForLoadingIndicatorToDisappear(within: timeWaitingForIdle)
        }

        NSLog("snapshot: \(name)")

        if Snapshot.waitForAnimations {
            sleep(1)
        }

        #if os(OSX)
        guard let app = self.app else {
            NSLog("XCUIApplication is not set. Please call setupSnapshot(app) before snapshot().")
            return
        }
        app.typeKey(XCUIKeyboardKey.f11.rawValue, modifierFlags: [])
        #else
        guard self.app != nil else {
            NSLog("XCUIApplication is not set. Please call setupSnapshot(app) before snapshot().")
            return
        }

        let screenshot = XCUIScreen.main.screenshot()
        guard let simulatorID = ProcessInfo().environment["SIMULATOR_UDID"] else {
            NSLog("Couldn't find simulator ID; are you running on a real device?")
            return
        }
        guard let screenshotsDir = screenshotsDirectory else { return }
        let path = screenshotsDir.appendingPathComponent("\(simulatorID)-\(name).png")
        do {
            try screenshot.pngRepresentation.write(to: path)
        } catch let error {
            NSLog("Problem writing screenshot: \(name) to \(path.absoluteString)")
            NSLog(error.localizedDescription)
        }
        #endif
    }

    class func waitForLoadingIndicatorToDisappear(within timeout: TimeInterval) {
        #if os(tvOS)
        return
        #endif

        guard let app = self.app else {
            NSLog("XCUIApplication is not set. Please call setupSnapshot(app) before snapshot().")
            return
        }

        let networkLoadingIndicator = app.otherElements.deviceStatusBars.networkLoadingIndicators.element
        let networkLoadingIndicatorDisappeared = XCTNSPredicateExpectation(predicate: NSPredicate(format: "exists == false"), object: networkLoadingIndicator)
        _ = XCTWaiter.wait(for: [networkLoadingIndicatorDisappeared], timeout: timeout)
    }

    class func getCacheDirectory() throws -> URL {
        let homeDir: URL
        if let simulatorHostHome = ProcessInfo().environment["SIMULATOR_HOST_HOME"] {
            guard let url = URL(string: simulatorHostHome) else {
                throw SnapshotError.cannotFindSimulatorHomeDirectory
            }
            homeDir = url
        } else {
            throw SnapshotError.cannotRunOnPhysicalDevice
        }
        return homeDir.appendingPathComponent("Library/Caches/tools.fastlane")
    }
}

private extension XCUIElementAttributes {
    var isNetworkLoadingIndicator: Bool {
        if hasAllowListedIdentifier { return false }
        let hasOldLoadingIndicatorSize = frame.size == CGSize(width: 10, height: 20)
        let hasNewLoadingIndicatorSize = frame.size.width.rounded() == 24 && frame.size.height.rounded() == 24
        return hasOldLoadingIndicatorSize || hasNewLoadingIndicatorSize
    }

    var hasAllowListedIdentifier: Bool {
        let allowListedIdentifiers = ["GeofenceLocationTrackingOn", "StatusBarLocationActiveIndicator"]
        return allowListedIdentifiers.contains(identifier)
    }

    func isStatusBar(_ deviceWidth: CGFloat) -> Bool {
        if elementType == .statusBar { return true }
        guard frame.origin == .zero else { return false }
        let hasOldStatusBarSize = frame.size == CGSize(width: deviceWidth, height: 20)
        let hasNewStatusBarSize = frame.size == CGSize(width: deviceWidth, height: 44)
        return hasOldStatusBarSize || hasNewStatusBarSize
    }
}

private extension XCUIElementQuery {
    var networkLoadingIndicators: XCUIElementQuery {
        let isNetworkLoadingIndicator = NSPredicate { (evaluatedObject, _) in
            guard let element = evaluatedObject as? XCUIElementAttributes else { return false }
            return element.isNetworkLoadingIndicator
        }
        return self.containing(isNetworkLoadingIndicator)
    }

    var deviceStatusBars: XCUIElementQuery {
        guard let app = Snapshot.app else { return self }
        let deviceWidth = app.windows.firstMatch.frame.width
        let isStatusBar = NSPredicate { (evaluatedObject, _) in
            guard let element = evaluatedObject as? XCUIElementAttributes else { return false }
            return element.isStatusBar(deviceWidth)
        }
        return self.containing(isStatusBar)
    }
}
// swiftlint:enable all
