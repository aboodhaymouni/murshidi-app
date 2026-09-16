import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'jo.vcoders.murshidi',
  appName: 'مُرشِدي',
  webDir: 'dist',
  backgroundColor: '#FFFFFF',
  android: {
    allowMixedContent: true,
    backgroundColor: '#FFFFFF',
  },
  plugins: {
    SplashScreen: {
      // The native splash is dismissed by BrandSplash once the first web frame
      // has painted, so there is no white gap between the two.
      launchAutoHide: false,
      backgroundColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false,
    },
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
