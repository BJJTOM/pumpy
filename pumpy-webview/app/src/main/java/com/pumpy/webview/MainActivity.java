package com.pumpy.webview;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.EditText;
import android.widget.Button;
import android.widget.LinearLayout;
import android.view.View;

public class MainActivity extends Activity {
    private WebView webView;
    private SharedPreferences prefs;
    private static final String PREF_NAME = "PumpyPrefs";
    private static final String KEY_SERVER_URL = "serverUrl";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        prefs = getSharedPreferences(PREF_NAME, MODE_PRIVATE);
        String serverUrl = prefs.getString(KEY_SERVER_URL, "");
        
        if (serverUrl.isEmpty()) {
            showServerConfigScreen();
        } else {
            loadWebView(serverUrl);
        }
    }
    
    private void showServerConfigScreen() {
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(40, 40, 40, 40);
        
        EditText urlInput = new EditText(this);
        urlInput.setHint("서버 URL 입력 (예: http://192.168.0.7:3000)");
        urlInput.setText("http://");
        
        Button saveButton = new Button(this);
        saveButton.setText("저장 및 연결");
        saveButton.setOnClickListener(v -> {
            String url = urlInput.getText().toString();
            if (url.startsWith("http")) {
                prefs.edit().putString(KEY_SERVER_URL, url).apply();
                loadWebView(url);
            }
        });
        
        layout.addView(urlInput);
        layout.addView(saveButton);
        setContentView(layout);
    }
    
    private void loadWebView(String url) {
        webView = new WebView(this);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl(url);
        setContentView(webView);
    }
    
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}


