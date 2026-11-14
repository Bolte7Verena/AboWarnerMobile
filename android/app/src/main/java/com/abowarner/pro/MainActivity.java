package com.abowarner.pro;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Eigenes Plugin der App (Texterkennung auf dem Gerät, "Per Foto einlesen").
        registerPlugin(TextErkennungPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
