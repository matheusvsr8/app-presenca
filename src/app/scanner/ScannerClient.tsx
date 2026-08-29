'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { registerAttendance } from './actions';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Sparkles, Camera } from 'lucide-react';

export default function ScannerClient({ sessionId }: { sessionId: string }) {
  const [isScanning, setIsScanning] = useState(true);
  const [lastAttendance, setLastAttendance] = useState<{
    name: string;
    time: string;
    status: 'success' | 'error';
    message?: string;
  } | null>(null);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        },
        false
      );

      scanner.render(async (decodedText) => {
        setIsScanning(false);
        const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        try {
          const res = await registerAttendance(decodedText, sessionId);
          if (res.success) {
            toast.success(res.message);
            setLastAttendance({
              name: (res as any).studentName || 'Aluno Identificado',
              time: currentTime,
              status: 'success',
              message: 'Presença confirmada com sucesso!'
            });
          } else {
            const errorMsg = res.error || (res as any).message || 'Erro ao registrar presença.';
            toast.error(errorMsg);
            setLastAttendance({
              name: 'Não Registrado',
              time: currentTime,
              status: 'error',
              message: errorMsg
            });
          }
        } catch (error) {
          toast.error("Erro na leitura do QR Code.");
          setLastAttendance({
            name: 'Erro de Leitura',
            time: currentTime,
            status: 'error',
            message: 'Código inválido ou ilegível.'
          });
        }
        
        // Retoma o scanner após 3 segundos
        setTimeout(() => {
          setIsScanning(true);
        }, 3000);
        
      }, (error) => {
        // Ignora frames sem QR code
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error("Erro ao limpar scanner", e));
      }
    };
  }, [isScanning, sessionId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '520px', margin: '0 auto' }}>
      
      {/* Área da Câmera */}
      <div className="glass" style={{ 
        padding: '1.25rem', 
        borderRadius: '20px', 
        border: '1px solid rgba(0, 217, 95, 0.25)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div id="qr-reader" style={{ width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>

        {/* Card de Confirmação em Tempo Real */}
        {lastAttendance && (
          <div style={{
            marginTop: '1.25rem',
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            background: lastAttendance.status === 'success' 
              ? 'linear-gradient(135deg, rgba(0, 217, 95, 0.15) 0%, rgba(0, 217, 95, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: `1px solid ${lastAttendance.status === 'success' ? 'rgba(0, 217, 95, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: lastAttendance.status === 'success' ? 'rgba(0, 217, 95, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: lastAttendance.status === 'success' ? 'var(--primary)' : 'var(--error)',
              flexShrink: 0
            }}>
              {lastAttendance.status === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>

            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  color: lastAttendance.status === 'success' ? 'var(--primary)' : 'var(--error)',
                  letterSpacing: '0.04rem'
                }}>
                  {lastAttendance.status === 'success' ? 'PRESENÇA CONFIRMADA ✅' : 'FALHA NO REGISTRO ❌'}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{lastAttendance.time}</span>
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
                {lastAttendance.name}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', opacity: 0.75 }}>
                {lastAttendance.message}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '1rem', opacity: 0.7, fontSize: '0.85rem' }}>
          <Camera size={16} color="var(--primary)" />
          <span>Aponte para o QR Code no celular do aluno</span>
        </div>
      </div>
    </div>
  );
}
