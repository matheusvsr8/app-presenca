'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Sparkles, CheckCircle2, EyeOff } from 'lucide-react';
import styles from './student.module.css';

interface QrGeneratorCardProps {
  studentId: string;
  courseName?: string;
  formattedDate: string;
  dailyQrValue: string;
}

export default function QrGeneratorCard({
  courseName,
  formattedDate,
  dailyQrValue,
}: QrGeneratorCardProps) {
  const [isGenerated, setIsGenerated] = useState(false);

  return (
    <div className={`${styles.card} glass`}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>
        Presença na Aula
      </h2>

      {!isGenerated ? (
        <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 217, 95, 0.1)',
            border: '1px solid rgba(0, 217, 95, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <QrCode size={40} />
          </div>

          <div>
            <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>
              {courseName ? `Turma: ${courseName}` : 'Pronto para registrar presença?'}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>
              Data: {formattedDate}
            </p>
          </div>

          <button
            onClick={() => setIsGenerated(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary)',
              color: '#000000',
              border: 'none',
              borderRadius: 'var(--radius-md, 12px)',
              padding: '0.85rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(0, 217, 95, 0.35)',
              transition: 'transform 0.15s ease, background-color 0.15s ease',
              width: '100%',
              maxWidth: '300px'
            }}
          >
            <Sparkles size={18} />
            Gerar QR Code de Hoje
          </button>
        </div>
      ) : (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(0, 217, 95, 0.1)',
            border: '1px solid rgba(0, 217, 95, 0.3)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            color: 'var(--primary)',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            <CheckCircle2 size={14} />
            {courseName ? `${courseName} • ${formattedDate}` : `Válido para ${formattedDate}`}
          </div>

          <div className={styles.qrPlaceholder}>
            {dailyQrValue ? (
              <QRCodeSVG
                value={dailyQrValue}
                size={190}
                fgColor="#000000"
                bgColor="#ffffff"
                style={{ padding: '8px', background: '#ffffff', borderRadius: '8px' }}
              />
            ) : (
              <p>Você não possui um QR Code ainda.</p>
            )}
          </div>

          <p className={styles.instructions} style={{ marginBottom: '1rem' }}>
            Apresente este código para o professor ou colaborador ler.
          </p>

          <button
            onClick={() => setIsGenerated(false)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              color: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <EyeOff size={14} />
            Ocultar QR Code
          </button>
        </div>
      )}
    </div>
  );
}
