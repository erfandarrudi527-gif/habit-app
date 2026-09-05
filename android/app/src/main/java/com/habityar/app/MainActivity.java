package com.habityar.app;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.InputStream;
import java.util.Calendar;

public class MainActivity extends Activity {

    public static final String CHANNEL_ID = "habit_reminders";
    private WebView web;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        createChannel();

        web = new WebView(this);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false);
        web.setWebViewClient(new WebViewClient() {
            @Override
            public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest req) {
                String path = req.getUrl().getPath();
                if (path == null) return null;
                if (path.startsWith("/android/")) {
                    // /android/notify?...  /android/schedule?h=..&m=..&id=..&title=..
                    handleNative(path, Uri.parse(req.getUrl().toString()));
                    return new WebResourceResponse("text/plain", "utf-8",
                            new java.io.ByteArrayInputStream("ok".getBytes()));
                }
                return null;
            }
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                return false; // stay inside the app
            }
        });
        web.addJavascriptInterface(new JsBridge(), "AndroidBridge");

        if (Build.VERSION.SDK_INT >= 29) {
            web.setWebContentsDebuggingEnabled(false);
        }

        setContentView(web);
        web.loadUrl("file:///android_asset/www/index.html");
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationManager nm = getSystemService(NotificationManager.class);
            NotificationChannel ch = new NotificationChannel(
                    CHANNEL_ID, "یادآور عادت‌ها", NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription("یادآوری روتین‌های روزانه");
            nm.createNotificationChannel(ch);
        }
    }

    private void handleNative(String path, Uri uri) {
        if (path.startsWith("/android/notify")) {
            notifyNow(uri.getQueryParameter("title"), uri.getQueryParameter("body"));
        } else if (path.startsWith("/android/schedule")) {
            scheduleReminder(
                    Integer.parseInt(uri.getQueryParameter("id")),
                    uri.getQueryParameter("title"),
                    Integer.parseInt(uri.getQueryParameter("h")),
                    Integer.parseInt(uri.getQueryParameter("m")));
        } else if (path.startsWith("/android/unschedule")) {
            cancelReminder(Integer.parseInt(uri.getQueryParameter("id")));
        } else if (path.startsWith("/android/perm")) {
            if (Build.VERSION.SDK_INT >= 33) {
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 42);
            }
        }
    }

    public void notifyNow(String title, String body) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        Intent open = new Intent(this, MainActivity.class);
        PendingIntent pi = PendingIntent.getActivity(this, 0, open,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));

        Notification.Builder b = (Build.VERSION.SDK_INT >= 26)
                ? new Notification.Builder(this, CHANNEL_ID)
                : new Notification.Builder(this);
        b.setContentTitle(title == null ? "عادت‌یار" : title)
         .setContentText(body)
         .setSmallIcon(android.R.drawable.ic_popup_reminder)
         .setContentIntent(pi)
         .setAutoCancel(true)
         .setDefaults(Notification.DEFAULT_ALL);

        try {
            nm.notify((int) (System.currentTimeMillis() % 100000), b.build());
        } catch (SecurityException ignored) { }
    }

    /** یک یادآور روزانه برای ساعت h:m ثبت می‌کند */
    public void scheduleReminder(int id, String title, int h, int m) {
        AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        Intent in = new Intent(this, ReminderReceiver.class);
        in.putExtra("id", id);
        in.putExtra("title", title);
        in.putExtra("hour", h);
        in.putExtra("minute", m);
        PendingIntent pi = PendingIntent.getBroadcast(this, id, in,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));

        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, h);
        cal.set(Calendar.MINUTE, m);
        cal.set(Calendar.SECOND, 0);
        if (cal.getTimeInMillis() <= System.currentTimeMillis()) cal.add(Calendar.DAY_OF_YEAR, 1);

        if (Build.VERSION.SDK_INT >= 23) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
        }
    }

    public void cancelReminder(int id) {
        AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
        Intent in = new Intent(this, ReminderReceiver.class);
        PendingIntent pi = PendingIntent.getBroadcast(this, id, in,
                PendingIntent.FLAG_NO_CREATE | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        if (pi != null) { am.cancel(pi); pi.cancel(); }
    }

    @Override
    public void onRequestPermissionsResult(int rc, String[] perms, int[] grants) {
        if (web != null) web.loadUrl("javascript:window.onNativePerm&&window.onNativePerm()");
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    class JsBridge {
        @JavascriptInterface
        public void notify(String title, String body) { notifyNow(title, body); }

        @JavascriptInterface
        public void schedule(int id, String title, int h, int m) { scheduleReminder(id, title, h, m); }

        @JavascriptInterface
        public void unschedule(int id) { cancelReminder(id); }

        @JavascriptInterface
        public void askPermission() {
            if (Build.VERSION.SDK_INT >= 33) {
                requestPermissions(new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 42);
            }
        }

        @JavascriptInterface
        public boolean isNative() { return true; }
    }
}
