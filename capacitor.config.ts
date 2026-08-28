import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.app.presenca',
  appName: 'LogQR',
  webDir: 'out',
  server: {
    // Apontando para o seu servidor Vercel real na nuvem!
    url: 'https://app-presenca-omega.vercel.app',
    cleartext: true
  }
};

export default config;
