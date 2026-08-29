'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { registerAttendance } from './actions';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Camera, RefreshCw } from 'lucide-react';

export default function ScannerClient({ sessionId }: { sessionId: string }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastAttendance, setLastAttendance] = useState<{
    name: string;
    time: string;
    status: 'success' | 'error';
    message?: string;
  } | null>(null);

  const isProcessingRef = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Som sutil de confirmação via Web Audio API (sem precisar de arquivos externos)
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // Tom agudo agradável
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Ignora se o navegador bloquear autoplay
    }
  };

  useEffect(() => {
    const elementId = "qr-reader-direct";
    const html5QrCode = new Html5Qrcode(elementId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false
    });
    scannerRef.current = html5QrCode;

    const onScanSuccess = async (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      const currentTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      try {
        const res = await registerAttendance(decodedText, sessionId);
        if (res.success) {
          playBeep();
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

      // Libera para o próximo aluno após 2.5 segundos
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 2500);
    };

    // Inicia direto com a CÂMERA TRASEIRA (facingMode: environment)
    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.75);
            return { width: qrboxSize, height: qrboxSize };
          },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {} // Ignora frames sem código
      )
      .then(() => {
        setCameraActive(true);
        setCameraError(null);
      })
      .catch((err) => {
        console.warn("Falha ao abrir câmera traseira, tentando câmera padrão...", err);
        // Fallback caso o dispositivo não tenha 'environment' (ex: webcam de notebook)
        html5QrCode
          .start(
            { facingMode: "user" },
            { fps: 15, qrbox: { width: 250, height: 250 } },
            onScanSuccess,
            () => {}
          )
          .then(() => {
            setCameraActive(true);
            setCameraError(null);
          })
          .catch((error) => {
            console.error("Erro total ao acessar câmera:", error);
            setCameraError("Permissão de câmera não concedida. Por favor, autorize o acesso à câmera.");
            setCameraActive(false);
          });
      });

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().then(() => {
            scannerRef.current?.clear();
          }).catch(e => console.error("Erro ao parar scanner:", e));
        }
      }
    };
  }, [sessionId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '520px', margin: '0 auto' }}>
      
      {/* Área da Câmera Limpa sem Menus de Seleção */}
      <div className="glass" style={{ 
        padding: '1rem', 
        borderRadius: '20px', 
        border: '1px solid rgba(0, 217, 95, 0.3)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
        position: 'relative',
        overflow: 'hidden',
        background: '#0a0e0c'
      }}>
        {/* Contêiner de Vídeo */}
        <div 
          id="qr-reader-direct" 
          style={{ 
            width: '100%', 
            borderRadius: '16px', 
            overflow: 'hidden',
            backgroundColor: '#000000',
            minHeight: '280px',
            position: 'relative'
          }}
        ></div>

        {/* Estado de Erro de Permissão */}
        {cameraError && (
          <div style={{
            padding: '2rem 1.5rem',
            textAlign: 'center',
            color: 'var(--error)',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '12px',
            marginTop: '1rem'
          }}>
            <AlertCircle size={36} style={{ margin: '0 auto 10px auto', display: 'block' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>{cameraError}</p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '1rem',
                padding: '8px 16px',
                background: 'var(--primary)',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} /> Recarregar
            </button>
          </div>
        )}

        {/* Card de Confirmação em Tempo Real */}
        {lastAttendance && (
          <div style={{
            marginTop: '1rem',
            padding: '1rem 1.25rem',
            borderRadius: '14px',
            background: lastAttendance.status === 'success' 
              ? 'linear-gradient(135deg, rgba(0, 217, 95, 0.18) 0%, rgba(0, 217, 95, 0.05) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(239, 68, 68, 0.05) 100%)',
            border: `1px solid ${lastAttendance.status === 'success' ? 'rgba(0, 217, 95, 0.45)' : 'rgba(239, 68, 68, 0.45)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            animation: 'fadeIn 0.25s ease-in-out'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: lastAttendance.status === 'success' ? 'rgba(0, 217, 95, 0.25)' : 'rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: lastAttendance.status === 'success' ? 'var(--primary)' : 'var(--error)',
              flexShrink: 0
            }}>
              {lastAttendance.status === 'success' ? <CheckCircle2 size={26} /> : <AlertCircle size={26} />}
            </div>

            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 800, 
                  textTransform: 'uppercase',
                  color: lastAttendance.status === 'success' ? 'var(--primary)' : 'var(--error)',
                  letterSpacing: '0.04rem'
                }}>
                  {lastAttendance.status === 'success' ? 'PRESENÇA CONFIRMADA ✅' : 'FALHA NO REGISTRO ❌'}
                </span>
                <span style={{ fontSize: '0.75rem', opacity: 0.65, fontWeight: 600 }}>{lastAttendance.time}</span>
              </div>
              <h3 style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                {lastAttendance.name}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.82rem', opacity: 0.8 }}>
                {lastAttendance.message}
              </p>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '0.85rem', opacity: 0.7, fontSize: '0.85rem' }}>
          <Camera size={16} color="var(--primary)" />
          <span>Aponte para o QR Code do aluno</span>
        </div>
      </div>
    </div>
  );
}
