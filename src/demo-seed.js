/**
 * demo-seed.js | Feste Demo-Abos ausschließlich für automatisierte
 * Store-Screenshots (Fastlane Snapshot, siehe AboWarnerProUITests).
 *
 * Aktiv wird dieser Code NUR, wenn SceneDelegate.swift zuvor
 * window.__UITEST_SEED_DEMO_DATA__ gesetzt hat (gebunden an das
 * Startargument "UITEST_SEED_DEMO_DATA") — für echte Nutzer bleibt
 * dieser Pfad immer inaktiv.
 *
 * Nutzt bewusst dieselbe window.api.saveAbo()-Funktion wie ein echter
 * Nutzer über das Formular, keine eigene Persistenz-Logik.
 */

const DEMO_ABOS = [
    // Fällig in genau 3 Tagen -> löst zugleich den "In 3 Tagen fällig"-Hinweis
    // aus (siehe faelligkeitshinweis.js, TAGE_SCHWELLE = 3) und zeigt den
    // "Kritisch"-Status.
    {
        id: 'demo-netflix',
        name: 'Netflix',
        kosten: 17.99,
        waehrung: 'EUR',
        turnus: 'Monatlich',
        kategorie: 'Streaming',
        naechsteZahlung: inTagen(3),
        kuendigungsfristTage: 30
    },
    // "Bald fällig" (Warnschwelle).
    {
        id: 'demo-fitlife',
        name: 'Fitnessstudio FitLife',
        kosten: 29.99,
        waehrung: 'EUR',
        turnus: 'Monatlich',
        kategorie: 'Sport',
        naechsteZahlung: inTagen(35),
        kuendigungsfristTage: 30
    },
    // "Sicher".
    {
        id: 'demo-haftpflicht',
        name: 'Haftpflichtversicherung',
        kosten: 84.00,
        waehrung: 'EUR',
        turnus: 'Jährlich',
        kategorie: 'Versicherung',
        naechsteZahlung: inTagen(200),
        kuendigungsfristTage: 90
    },
    // "Gekündigt".
    {
        id: 'demo-spotify',
        name: 'Spotify Premium',
        kosten: 9.99,
        waehrung: 'EUR',
        turnus: 'Monatlich',
        kategorie: 'Streaming',
        naechsteZahlung: inTagen(20),
        kuendigungsfristTage: 30,
        gekuendigt: true
    }
];

function inTagen(tage) {
    const datum = new Date();
    datum.setDate(datum.getDate() + tage);
    return datum.toISOString().slice(0, 10);
}

export async function seedDemoDatenFallsNoetig() {
    const vorhandeneAbos = await window.api.loadAbos();
    if (vorhandeneAbos.length > 0) return;

    for (const abo of DEMO_ABOS) {
        await window.api.saveAbo(abo);
    }
}
