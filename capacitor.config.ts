import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'jo.mizan.app',
  appName: 'مُرشِدي',
  webDir: 'dist',
  backgroundColor: '#FFFFFF',
  android: {
    backgroundColor: '#FFFFFF',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
