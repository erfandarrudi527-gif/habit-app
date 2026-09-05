package com.habityar.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import java.util.Calendar;

public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context ctx, Intent in) {
        String title = in.getStringExtra("title");
        int id = in.getIntExtra("id", 0);
        int h = in.getIntExtra("hour", 0);
        int m = in.getIntExtra("minute", 0);

        NotificationHelper.show(ctx, title);

        // تکرار روزانه: آلارم فردا را دوباره ثبت کن
        AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
        Intent next = new Intent(ctx, ReminderReceiver.class);
        next.putExtra("id", id);
        next.putExtra("title", title);
        next.putExtra("hour", h);
        next.putExtra("minute", m);
        PendingIntent pi = PendingIntent.getBroadcast(ctx, id, next,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.HOUR_OF_DAY, h);
        cal.set(Calendar.MINUTE, m);
        cal.set(Calendar.SECOND, 0);
        cal.add(Calendar.DAY_OF_YEAR, 1);
        if (Build.VERSION.SDK_INT >= 23) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
        }
    }
}
