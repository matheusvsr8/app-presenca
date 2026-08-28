import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.app.presenca',
  appName: 'app-presenca',
  webDir: 'out',
  server: {
    // 10.0.2.2 é o alias do Android Emulator para o 'localhost' do seu PC
    url: 'http://10.0.2.2:3000',
    cleartext: true
  }
};

export default config;
