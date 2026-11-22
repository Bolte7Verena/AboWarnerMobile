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
    // Zahlung in 3 Tagen, Frist 30 -> nächste mögliche Kündigung in wenigen
    // Tagen: rote Karte und Hinweis "Kündigungsfrist endet bald" beim Start
    // (siehe faelligkeitshinweis.js / benachrichtigungsplan.js).
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
    // Gelb: Kündigung möglich bis in 20 Tagen (Zahlung in 50 Tagen, Frist 30).
    {
        id: 'demo-fitlife',
        name: 'Fitnessstudio FitLife',
        kosten: 29.99,
        waehrung: 'EUR',
        turnus: 'Monatlich',
        kategorie: 'Sport',
        naechsteZahlung: inTagen(50),
        kuendigungsfristTage: 30
    },
    // Grün: Kündigung möglich bis in 110 Tagen.
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
    // Lokales Datum (toISOString wäre UTC und damit je nach Zeitzone ein Tag daneben)
    return `${datum.getFullYear()}-${String(datum.getMonth() + 1).padStart(2, '0')}-${String(datum.getDate()).padStart(2, '0')}`;
}

export async function seedDemoDatenFallsNoetig() {
    const vorhandeneAbos = await window.api.loadAbos();
    if (vorhandeneAbos.length > 0) return;

    for (const abo of DEMO_ABOS) {
        await window.api.saveAbo(abo);
    }
}
