import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 36, showText = true }: LogoProps) {
  const borderRadius = Math.max(8, Math.round(size * 0.22));

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      {/* Ícone Ultra-HD de QR Code Cyberpunk com Efeito de Brilho */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: `${borderRadius}px`,
          overflow: 'hidden',
          border: '1.5px solid rgba(0, 217, 95, 0.45)',
          boxShadow: '0 0 16px rgba(0, 217, 95, 0.35), inset 0 0 6px rgba(0, 217, 95, 0.2)',
          position: 'relative',
          flexShrink: 0,
          background: '#05070a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Image
          src="/logo.png"
          alt="LogQR Logo"
          width={size}
          height={size}
          priority
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            filter: 'contrast(1.1) brightness(1.05)'
          }}
        />
      </div>

      {showText && (
        <span style={{
          color: '#ffffff',
          fontSize: `${Math.max(1.1, size * 0.035)}rem`,
          fontWeight: 900,
          letterSpacing: '0.05rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          LOG<span style={{ color: 'var(--primary, #00d95f)', textShadow: '0 0 12px rgba(0, 217, 95, 0.5)' }}>QR</span>
        </span>
      )}
    </div>
  );
}
