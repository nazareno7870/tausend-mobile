package com.lomo.tausend;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.media.AudioAttributes;
import android.net.Uri;
import android.os.Build;

import androidx.core.app.NotificationCompat;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        // Create notification channel if it doesn't exist
        createNotificationChannel();

        // Handle the notification
        sendNotification(remoteMessage);
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
            NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
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

    private void sendNotification(RemoteMessage remoteMessage) {
      // write in console the channel id
        System.out.println( "Channel id: " + remoteMessage.getNotification().getChannelId());

        // Create notification builder if the channel id exists or if it doesn't exist use de default one
        if(remoteMessage.getNotification().getChannelId().equals("my_channel_id")) {
                  NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, "my_channel_id")
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle(remoteMessage.getNotification().getTitle())
                .setContentText(remoteMessage.getNotification().getBody())
                .setAutoCancel(true)
                .setSound(Uri.parse("android.resource://" + getPackageName() + "/" + R.raw.alert));

        NotificationManager notificationManager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(0, notificationBuilder.build());
        } else {
            NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this, "default_channel_id")
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle(remoteMessage.getNotification().getTitle())
                    .setContentText(remoteMessage.getNotification().getBody())
                    .setAutoCancel(true);
            NotificationManager notificationManager2 = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            notificationManager2.notify(0, notificationBuilder.build());
        }
    }
}
