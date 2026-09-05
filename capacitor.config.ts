import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.feelsafe.app',
  appName: 'feel-Safe',
  webDir: 'dist',

  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com', 'facebook.com'],
    },
  },
};

export default config;