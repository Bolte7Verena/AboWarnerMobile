package com.abowarner.pro;

import android.content.res.AssetManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Environment;
import android.util.Base64;

import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.googlecode.tesseract.android.TessBaseAPI;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * "Per Foto einlesen": Texterkennung ausschließlich auf dem Gerät.
 *
 * - Tesseract (Bibliothek tesseract4android, Apache-2.0) mit fest in der App
 *   enthaltenen Sprachdaten (assets/tessdata: deu, eng, spa, fra, por).
 *   Nichts wird nachgeladen, die App hat keine Internet-Berechtigung.
 *   (Der Paketname com.googlecode.* ist historisch und hat nichts mit
 *   Google-Diensten zu tun.)
 * - Das Bild kommt nur als Base64 im Speicher an und wird nicht gespeichert.
 * - Zwischendateien der System-Kamera (von Capacitor im app-eigenen Ordner
 *   Pictures als JPEG_*.jpg angelegt) werden nach jeder Erkennung gelöscht.
 */
@CapacitorPlugin(name = "TextErkennung")
public class TextErkennungPlugin extends Plugin {

    // Bei geänderten Sprachdaten erhöhen, dann werden sie neu kopiert.
    private static final String DATEN_VERSION = "tessdata_fast-4.1.0-v1";
    private static final String[] SPRACHDATEIEN = { "deu", "eng", "spa", "fra", "por" };

    private final ExecutorService ausfuehrer = Executors.newSingleThreadExecutor();
    private TessBaseAPI tess;
    private String tessSprachen;

    @PluginMethod
    public void erkenne(PluginCall call) {
        final String bildBase64 = call.getString("bild");
        if (bildBase64 == null || bildBase64.isEmpty()) {
            call.reject("Kein Bild übergeben");
            return;
        }
        final String sprachen = tesseractSprachen(call.getArray("sprachen"));
        ausfuehrer.execute(() -> {
            Bitmap bild = null;
            try {
                byte[] bytes = Base64.decode(bildBase64, Base64.DEFAULT);
                bild = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                if (bild == null) {
                    call.reject("Bild nicht lesbar");
                    return;
                }
                TessBaseAPI api = holeTesseract(sprachen);
                api.setImage(bild);
                String text = api.getUTF8Text();
                api.clear();

                JSArray zeilen = new JSArray();
                if (text != null) {
                    for (String zeile : text.split("\\r?\\n")) {
                        String sauber = zeile.trim();
                        if (!sauber.isEmpty()) zeilen.put(sauber);
                    }
                }
                JSObject ergebnis = new JSObject();
                ergebnis.put("zeilen", zeilen);
                call.resolve(ergebnis);
            } catch (Exception fehler) {
                call.reject("Texterkennung fehlgeschlagen", fehler);
            } finally {
                if (bild != null) bild.recycle();
                loescheKameraZwischendateien();
            }
        });
    }

    @PluginMethod
    public void aufraeumen(PluginCall call) {
        ausfuehrer.execute(() -> {
            loescheKameraZwischendateien();
            call.resolve();
        });
    }

    @Override
    public void load() {
        // Reste aus einem früheren Lauf (z.B. App während der Aufnahme beendet).
        ausfuehrer.execute(this::loescheKameraZwischendateien);
    }

    @Override
    protected void handleOnDestroy() {
        ausfuehrer.execute(() -> {
            if (tess != null) {
                tess.recycle();
                tess = null;
            }
        });
        ausfuehrer.shutdown();
    }

    // ["de","en",...] -> "deu+eng+..." (App-Sprache zuerst), nur bekannte Sprachen.
    private String tesseractSprachen(JSArray liste) {
        List<String> ergebnis = new ArrayList<>();
        try {
            if (liste != null) {
                for (Object eintrag : liste.toList()) {
                    String code = zuTesseract(String.valueOf(eintrag));
                    if (code != null && !ergebnis.contains(code)) ergebnis.add(code);
                }
            }
        } catch (Exception ignoriert) {
            // ungültige Liste: Standard verwenden
        }
        for (String code : SPRACHDATEIEN) {
            if (!ergebnis.contains(code)) ergebnis.add(code);
        }
        return String.join("+", ergebnis);
    }

    private static String zuTesseract(String code) {
        switch (code) {
            case "de": return "deu";
            case "en": return "eng";
            case "es": return "spa";
            case "fr": return "fra";
            case "pt": return "por";
            default: return null;
        }
    }

    private TessBaseAPI holeTesseract(String sprachen) throws IOException {
        if (tess != null && sprachen.equals(tessSprachen)) return tess;
        if (tess != null) {
            tess.recycle();
            tess = null;
        }
        File basis = new File(getContext().getFilesDir(), "tesseract");
        kopiereSprachdaten(basis);
        TessBaseAPI api = new TessBaseAPI();
        if (!api.init(basis.getAbsolutePath(), sprachen)) {
            api.recycle();
            throw new IOException("Tesseract konnte nicht gestartet werden");
        }
        api.setPageSegMode(TessBaseAPI.PageSegMode.PSM_AUTO);
        tess = api;
        tessSprachen = sprachen;
        return api;
    }

    // Tesseract braucht die Sprachdaten als Dateien: einmalig aus der App
    // (assets/tessdata) in den privaten App-Ordner kopieren. Kein Download.
    private void kopiereSprachdaten(File basis) throws IOException {
        File ordner = new File(basis, "tessdata");
        File marke = new File(ordner, "version.txt");
        if (marke.exists() && DATEN_VERSION.equals(leseText(marke))) return;
        if (!ordner.exists() && !ordner.mkdirs()) throw new IOException("Ordner nicht anlegbar");
        AssetManager assets = getContext().getAssets();
        for (String sprache : SPRACHDATEIEN) {
            File ziel = new File(ordner, sprache + ".traineddata");
            try (InputStream rein = assets.open("tessdata/" + sprache + ".traineddata");
                 OutputStream raus = new FileOutputStream(ziel)) {
                byte[] puffer = new byte[64 * 1024];
                int n;
                while ((n = rein.read(puffer)) > 0) raus.write(puffer, 0, n);
            }
        }
        try (OutputStream raus = new FileOutputStream(marke)) {
            raus.write(DATEN_VERSION.getBytes("UTF-8"));
        }
    }

    private static String leseText(File datei) {
        try (InputStream rein = new java.io.FileInputStream(datei)) {
            byte[] puffer = new byte[256];
            int n = rein.read(puffer);
            return n > 0 ? new String(puffer, 0, n, "UTF-8") : "";
        } catch (IOException fehler) {
            return "";
        }
    }

    // Fotos der System-Kamera legt Capacitor als JPEG_*.jpg im app-eigenen
    // Ordner Pictures ab. Die App braucht sie nach dem Auslesen nicht mehr.
    private void loescheKameraZwischendateien() {
        File ordner = getContext().getExternalFilesDir(Environment.DIRECTORY_PICTURES);
        if (ordner == null) return;
        File[] dateien = ordner.listFiles();
        if (dateien == null) return;
        for (File datei : dateien) {
            String name = datei.getName();
            if (datei.isFile() && name.startsWith("JPEG_") && name.endsWith(".jpg")) {
                //noinspection ResultOfMethodCallIgnored
                datei.delete();
            }
        }
    }
}
