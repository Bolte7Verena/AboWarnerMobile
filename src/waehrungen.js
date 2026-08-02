/**
 * waehrungen.js | Goldstandard-Architektur
 * Kombiniert Wechselkurse, Symbole und Region-to-Currency Mapping.
 */

// Referenzkurse (Stand: 2026, Basis EUR)
export const WECHSELKURSE = {
    'EUR': 1.0, 'USD': 0.92, 'GBP': 1.17, 'JPY': 0.006, 'CHF': 1.04,
    'AUD': 0.61, 'CAD': 0.68, 'CNY': 0.13, 'SEK': 0.088, 'NZD': 0.56,
    'MXN': 0.054, 'SGD': 0.68, 'HKD': 0.12, 'NOK': 0.086, 'KRW': 0.00067,
    'TRY': 0.028, 'INR': 0.011, 'RUB': 0.010, 'BRL': 0.18, 'ZAR': 0.050,
    'DKK': 0.13, 'PLN': 0.23, 'TWD': 0.029, 'THB': 0.025, 'AED': 0.25,
    'COP': 0.00023, 'CLP': 0.00098, 'MYR': 0.20, 'PHP': 0.016, 'ILS': 0.25
};

export const WAEHRUNG_SYMBOLE = {
    'EUR': '€', 'USD': '$', 'GBP': '£', 'JPY': '¥', 'CHF': 'CHF',
    'AUD': 'A$', 'CAD': 'C$', 'CNY': '¥', 'SEK': 'kr', 'NZD': 'NZ$',
    'MXN': '$', 'SGD': 'S$', 'HKD': 'HK$', 'NOK': 'kr', 'KRW': '₩',
    'TRY': '₺', 'INR': '₹', 'RUB': '₽', 'BRL': 'R$', 'ZAR': 'R',
    'DKK': 'kr', 'PLN': 'zł', 'TWD': 'NT$', 'THB': '฿', 'AED': 'AED',
    'COP': '$', 'CLP': '$', 'MYR': 'RM', 'PHP': '₱', 'ILS': '₪'
};

/**
 * Automatisches Mapping: Ländercode zu Währung.
 * Damit die App bei Start weiß, welche Währung für welche Region gilt.
 */
export const REGION_WAEHRUNG_MAP = {
    'DE': 'EUR', 'AT': 'EUR', 'FR': 'EUR', 'IT': 'EUR', 'ES': 'EUR',
    'US': 'USD', 'GB': 'GBP', 'JP': 'JPY', 'CH': 'CHF', 'NO': 'NOK',
    'CN': 'CNY', 'SE': 'SEK', 'AU': 'AUD', 'CA': 'CAD', 'DK': 'DKK',
    // ... kann hier unendlich erweitert werden
};

// Hilfsfunktion zur automatischen Ermittlung
export const WaehrungsHelper = {
    holeWaehrungFuerRegion(countryCode) {
        return REGION_WAEHRUNG_MAP[countryCode.toUpperCase()] || 'EUR';
    }
};