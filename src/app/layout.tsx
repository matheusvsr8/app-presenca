import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from 'sonner';
import SplashScreen from "@/components/SplashScreen";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LogQR - Controle Inteligente de Presença",
  description: "Plataforma de controle de presença escolar e acadêmica via QR Code dinâmico.",
  icons: {
    icon: [
      { url: '/logo.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/logo.png',
    apple: '/logo.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SplashScreen />
        {children}
        <Toaster position="top-center" theme="dark" richColors />
      </body>
    </html>
  );
}
