/**
 * build.mjs | Bündelt src/ nach www/ (das Verzeichnis, das Capacitor in die
 * nativen iOS-/Android-Projekte kopiert).
 *
 * Ein Bundling-Schritt ist hier — anders als bei der Windows-Electron-App,
 * die bewusst ohne Build läuft — notwendig: api.js importiert echte
 * npm-Pakete (@capacitor/filesystem, @capacitor/share, ...), und ein
 * WebView kann solche "nackten" Modul-Bezeichner ohne Bundler nicht
 * auflösen (im Gegensatz zu relativen Importen wie "./calculator.js").
 */

import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync } from 'fs';

rmSync('www', { recursive: true, force: true });
mkdirSync('www', { recursive: true });

cpSync('src/index.html', 'www/index.html');
cpSync('src/style.css', 'www/style.css');
cpSync('src/app-icon.png', 'www/app-icon.png');
cpSync('src/fonts', 'www/fonts', { recursive: true });

await build({
    entryPoints: ['src/index.js'],
    bundle: true,
    format: 'esm',
    outfile: 'www/index.js',
    target: 'es2020',
    logLevel: 'info'
});

console.log('Build abgeschlossen: src/ → www/');
