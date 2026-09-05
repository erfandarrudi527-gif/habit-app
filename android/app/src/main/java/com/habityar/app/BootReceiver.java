package com.habityar.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** بعد از ریستارت گوشی، یادآورهای زمان‌بندی‌شده دوباره ثبت می‌شوند
 *  (WebView با باز شدن بعدی اپ خودش schedule را صدا می‌زند) */
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent in) {
        // nothing to do here; the web layer re-registers alarms on next app open
    }
}
