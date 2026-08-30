'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { registerAttendance } from './actions';
import { toast } from 'sonner';
import { CheckCircle2, AlertCircle, Camera, RefreshCw, QrCode, Sparkles, XCircle } from 'lucide-react';

export default function ScannerClient({ sessionId }: { sessionId: string }) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastAttendance, setLastAttendance] = useState<{
    name: string;
    time: string;
    status: 'success' | 'error';
    message?: string;
  } | null>(null);

  const isProcessingRef = useRef(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Som sutil de confirmação via Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      // Ignora restrição de autoplay
    }
  };

  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);

    // Garante que o elemento DOM esteja renderizado
    setTimeout(async () => {
      try {
        const elementId = "qr-reader-direct";
        if (scannerRef.current) {
          try {
            await scannerRef.current.stop();
          } catch (e) {}
        }

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

        // Abre direto com a CÂMERA TRASEIRA
        try {
          await html5QrCode.start(
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
            () => {}
          );
        } catch (err) {
          // Fallback para câmera padrão (ex: webcam)
          await html5QrCode.start(
            { facingMode: "user" },
            { fps: 15, qrbox: { width: 250, height: 250 } },
            onScanSuccess,
            () => {}
          );
        }
      } catch (err: any) {
        console.error("Erro ao iniciar câmera:", err);
        setCameraError("Permissão de câmera não concedida. Por favor, autorize o acesso à câmera.");
        setIsScanning(false);
      }
    }, 150);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (e) {
        console.error("Erro ao parar scanner:", e);
      }
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '520px', margin: '0 auto' }}>
      
      {!isScanning ? (
        /* Card Antes de Iniciar a Câmera */
        <div className="glass" style={{
          padding: '2rem 1.5rem',
          borderRadius: '20px',
          border: '1px solid rgba(0, 217, 95, 0.3)',
          textAlign: 'center',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          background: 'linear-gradient(145deg, rgba(20, 26, 22, 0.9) 0%, rgba(10, 14, 12, 0.9) 100%)'
        }}>
          <div style={{
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            background: 'rgba(0, 217, 95, 0.12)',
            border: '2px solid rgba(0, 217, 95, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)',
            margin: '0 auto 1.25rem auto',
            boxShadow: '0 0 25px rgba(0, 217, 95, 0.25)'
          }}>
            <Camera size={34} />
          </div>

          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
            Pronto para Fazer a Chamada?
          </h3>
          <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.4 }}>
            Escolha o dia da aula acima se desejar, e quando estiver pronto clique abaixo para abrir a câmera e escanear os alunos.
          </p>

          <button
            onClick={startScanner}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #00d95f 0%, #00b34d 100%)',
              color: '#000000',
              border: 'none',
              borderRadius: '12px',
              padding: '0.95rem 1.75rem',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 217, 95, 0.4)',
              width: '100%',
              maxWidth: '340px',
              transition: 'transform 0.15s ease'
            }}
          >
            <Camera size={20} strokeWidth={2.5} />
            Abrir Câmera e Iniciar Chamada
          </button>
        </div>
      ) : (
        /* Área da Câmera Ativa */
        <div className="glass" style={{ 
          padding: '1rem', 
          borderRadius: '20px', 
          border: '1px solid rgba(0, 217, 95, 0.3)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
          position: 'relative',
          overflow: 'hidden',
          background: '#0a0e0c'
        }}>
          {/* Barra Superior da Câmera */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></span>
              Câmera Ao Vivo
            </div>

            <button
              onClick={stopScanner}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <XCircle size={13} /> Fechar Câmera
            </button>
          </div>

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

          {/* Erro de Permissão */}
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
                onClick={startScanner}
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
                <RefreshCw size={14} /> Tentar Novamente
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
      )}
    </div>
  );
}
