package com.barg.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {

    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        web.setWebViewClient(new WebViewClient() {
            @Override
            @SuppressWarnings("deprecation")
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("barg://exit")) { finish(); return true; }
                return false; // stay inside the app
            }
        });
        web.loadUrl("file:///android_asset/www/index.html");
        setContentView(web);
    }

    @Override
    public void onBackPressed() {
        // let the web layer decide: popups close, screens go back,
        // the library shows the exit confirmation dialog
        web.evaluateJavascript("window.bargBack && bargBack();", null);
    }
}
