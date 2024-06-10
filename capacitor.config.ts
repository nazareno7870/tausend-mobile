import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lomo.tausend',
  appName: 'Alarmas Tausend IP',
  webDir: 'www',
  plugins: {
    BackgroundMode: {
      ios: {
        batteryMonitoringEnabled: true,
        preventSuspend: true,
      },
      android: {
        notificationTitle: 'App is running in background',
        notificationText: 'Tap to open the app',
      },
    },
  },
};

export default config;
