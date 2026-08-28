'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { registerAttendance } from './actions';
import { toast } from 'sonner';

export default function ScannerClient({ sessionId }: { sessionId: string }) {
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        },
        false
      );

      scanner.render(async (decodedText) => {
        setIsScanning(false);
        try {
          const res = await registerAttendance(decodedText, sessionId);
          if (res.success) {
            toast.success(res.message);
          } else {
            toast.error(res.message);
          }
        } catch (error) {
          toast.error("Erro na leitura do QR Code.");
        }
        
        // Reinicia após pequeno delay
        setTimeout(() => setIsScanning(true), 2500);
        
      }, (error) => {
        // Ignora erros de frame vazio
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Erro ao limpar scanner", e));
      }
    };
  }, [isScanning, sessionId]);

  return (
    <div className="glass" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '500px', margin: '0 auto' }}>
      <div id="qr-reader" style={{ width: '100%' }}></div>
      <p style={{ marginTop: '1rem', opacity: 0.7 }}>Aponte a câmera para a carteirinha do aluno.</p>
    </div>
  );
}
