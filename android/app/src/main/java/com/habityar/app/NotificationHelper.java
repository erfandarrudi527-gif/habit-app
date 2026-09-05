package com.habityar.app;

import android.content.Context;
import android.content.Intent;

/** نوتیفیکشن از هر دو receiver و activity قابل استفاده است */
public final class NotificationHelper {
    public static void show(Context ctx, String habitTitle) {
        String body = "وقت «" + habitTitle + "» شد ⏰ — یادت نره تیکش رو بزنی!";
        android.app.NotificationManager nm =
                (android.app.NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        Intent open = new Intent(ctx, MainActivity.class);
        android.app.PendingIntent pi = android.app.PendingIntent.getActivity(ctx, 0, open,
                android.app.PendingIntent.FLAG_UPDATE_CURRENT
                        | (android.os.Build.VERSION.SDK_INT >= 23
                           ? android.app.PendingIntent.FLAG_IMMUTABLE : 0));

        android.app.Notification.Builder b = (android.os.Build.VERSION.SDK_INT >= 26)
                ? new android.app.Notification.Builder(ctx, MainActivity.CHANNEL_ID)
                : new android.app.Notification.Builder(ctx);
        b.setContentTitle("عادت‌یار 🔔")
         .setContentText(body)
         .setStyle(new android.app.Notification.BigTextStyle().bigText(body))
         .setSmallIcon(android.R.drawable.ic_popup_reminder)
         .setContentIntent(pi)
         .setAutoCancel(true)
         .setDefaults(android.app.Notification.DEFAULT_ALL);
        try {
            nm.notify((int) (System.currentTimeMillis() % 100000), b.build());
        } catch (SecurityException ignored) { }
    }
}
