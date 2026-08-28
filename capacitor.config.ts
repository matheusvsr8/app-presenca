import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.app.presenca',
  appName: 'app-presenca',
  webDir: 'out',
  server: {
    // Apontando para o seu servidor Vercel real na nuvem!
    url: 'https://app-presenca-seven.vercel.app',
    cleartext: true
  }
};

export default config;
