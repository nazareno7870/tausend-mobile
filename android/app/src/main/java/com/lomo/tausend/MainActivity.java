package com.lomo.tausend;

import com.getcapacitor.BridgeActivity;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Crear el canal de notificación al iniciar la aplicación
        createNotificationChannel();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Uri soundUri = Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.alert);
            NotificationChannel channel = new NotificationChannel("my_channel_id", "My Channel", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("My notification channel description");
            channel.setSound(soundUri, new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build());
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            notificationManager.createNotificationChannel(channel);

                String defaultChannelId = "default_channel_id";
    String defaultChannelName = "Default Channel";
    int importance = NotificationManager.IMPORTANCE_DEFAULT;

    NotificationChannel defaultChannel = new NotificationChannel(defaultChannelId, defaultChannelName, importance);

    // Configura las propiedades del canal (sin sonido personalizado)
    defaultChannel.setDescription("Canal por defecto para notificaciones generales");

    NotificationManager notificationManager2 = getSystemService(NotificationManager.class);
    notificationManager2.createNotificationChannel(defaultChannel);
        }
    }
}
