'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { checkStudentLatestAttendance } from './actions';
import { CheckCircle2, Sparkles, X, Clock, Calendar, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

interface StudentRealtimeAttendanceProps {
  studentId: string;
  initialAttendanceCount: number;
}

export default function StudentRealtimeAttendance({
  studentId,
  initialAttendanceCount,
}: StudentRealtimeAttendanceProps) {
  const router = useRouter();
  const [knownCount, setKnownCount] = useState(initialAttendanceCount);
  const [celebration, setCelebration] = useState<{
    courseName: string;
    date: string;
    time: string;
  } | null>(null);

  const isPollingRef = useRef(false);

  // Som agradável de confirmação com Web Audio API
  const playSuccessChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioCtx.currentTime;

      // Primeiro tom (Mi)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now); // E5
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.2);

      // Segundo tom (Sol sustenido)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(830.61, now + 0.12); // G#5
      gain2.gain.setValueAtTime(0.25, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.45);
    } catch (e) {
      // Ignora restrição de autoplay
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const res = await checkStudentLatestAttendance(studentId, knownCount);
        if (res.hasNew && res.courseName && res.date && res.time) {
          setKnownCount(res.totalCount);
          playSuccessChime();
          
          // Exibe Toast vibrante
          toast.success(`🎉 Presença confirmada em ${res.courseName}!`);

          // Abre o Modal comemorativo
          setCelebration({
            courseName: res.courseName,
            date: res.date,
            time: res.time,
          });

          // Atualiza os dados da página
          router.refresh();
        }
      } catch (e) {
        // Ignora falhas de conexão temporárias
      } finally {
        isPollingRef.current = false;
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [studentId, knownCount, router]);

  if (!celebration) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 7, 10, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.5rem',
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #0d1a12 0%, #050a07 100%)',
        border: '1.5px solid var(--primary, #00d95f)',
        borderRadius: '24px',
        padding: '2rem 1.75rem',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 0 50px rgba(0, 217, 95, 0.35)',
        position: 'relative',
        animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Botão Fechar */}
        <button
          onClick={() => setCelebration(null)}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* Ícone de Sucesso Pulsante */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(0, 217, 95, 0.15)',
          border: '2px solid var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          margin: '0 auto 1.25rem auto',
          boxShadow: '0 0 25px rgba(0, 217, 95, 0.4)'
        }}>
          <CheckCircle2 size={40} />
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06rem', marginBottom: '6px' }}>
          <Sparkles size={14} />
          Presença Confirmada!
        </div>

        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
          Você está Presente! 🎉
        </h2>

        {/* Detalhes da Presença */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          textAlign: 'left',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BookOpen size={16} color="var(--primary)" />
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
              {celebration.courseName}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', opacity: 0.65, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Calendar size={13} /> {celebration.date}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} /> {celebration.time}
            </span>
          </div>
        </div>

        <button
          onClick={() => setCelebration(null)}
          style={{
            background: 'var(--primary)',
            color: '#000000',
            border: 'none',
            borderRadius: '12px',
            padding: '0.85rem 1.5rem',
            fontWeight: 800,
            fontSize: '0.95rem',
            width: '100%',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(0, 217, 95, 0.3)'
          }}
        >
          Excelente, Entendido!
        </button>
      </div>

      <style jsx>{`
        @keyframes scaleIn {
          from { transform: scale(0.85); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
