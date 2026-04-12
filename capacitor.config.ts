import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.educatemw.app',
  appName: 'Educate MW',
  webDir: 'dist/app/browser',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'DARK'
    }
  }
};

export default config;
