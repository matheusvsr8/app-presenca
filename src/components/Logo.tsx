import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 36, showText = true }: LogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      {/* Ícone Vetorial de QR Code Cyberpunk Idêntico à Identidade Visual */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 0 8px rgba(0, 217, 95, 0.35))',
          flexShrink: 0
        }}
      >
        <defs>
          {/* Gradiente de Fundo Cyber */}
          <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0a1a12"/>
            <stop offset="100%" stopColor="#030704"/>
          </linearGradient>

          {/* Gradiente Neon Verde */}
          <linearGradient id="logoNeonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2aff8f"/>
            <stop offset="100%" stopColor="#00d95f"/>
          </linearGradient>

          {/* Gradiente Brilho Ciano/Verde para o Núcleo */}
          <linearGradient id="logoCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#80ffc4"/>
            <stop offset="100%" stopColor="#00e66b"/>
          </linearGradient>
        </defs>

        {/* Moldura Arredondada com Borda Verde Neon */}
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="7.5"
          fill="url(#logoBgGrad)"
          stroke="#00e66b"
          strokeWidth="1.3"
          strokeOpacity="0.9"
        />

        {/* Canto Superior Esquerdo */}
        <rect x="4.2" y="4.2" width="8.6" height="8.6" rx="2.5" stroke="url(#logoNeonGrad)" strokeWidth="1.7"/>
        <rect x="6.3" y="6.3" width="4.4" height="4.4" rx="1.2" fill="url(#logoNeonGrad)"/>

        {/* Canto Superior Direito */}
        <rect x="19.2" y="4.2" width="8.6" height="8.6" rx="2.5" stroke="url(#logoNeonGrad)" strokeWidth="1.7"/>
        <rect x="21.3" y="6.3" width="4.4" height="4.4" rx="1.2" fill="url(#logoNeonGrad)"/>

        {/* Canto Inferior Esquerdo */}
        <rect x="4.2" y="19.2" width="8.6" height="8.6" rx="2.5" stroke="url(#logoNeonGrad)" strokeWidth="1.7"/>
        <rect x="6.3" y="21.3" width="4.4" height="4.4" rx="1.2" fill="url(#logoNeonGrad)"/>

        {/* Canto Inferior Direito com Ponto Branco */}
        <rect x="19.2" y="19.2" width="8.6" height="8.6" rx="2.5" stroke="url(#logoNeonGrad)" strokeWidth="1.7"/>
        <circle cx="23.5" cy="23.5" r="2.2" fill="#ffffff"/>

        {/* Centro Matrix Core */}
        <circle cx="16" cy="16" r="3.8" stroke="#00ff73" strokeWidth="0.8" strokeDasharray="1.5 1" opacity="0.8"/>
        <circle cx="16" cy="16" r="2.5" fill="url(#logoCoreGrad)"/>
        <circle cx="16" cy="16" r="1.1" fill="#ffffff"/>

        {/* Conectores Matrix (Brancos e Verdes) */}
        {/* Superior */}
        <circle cx="16" cy="5.8" r="1.2" fill="#ffffff"/>
        <circle cx="16" cy="9.4" r="0.9" fill="#00ff73"/>

        {/* Inferior */}
        <circle cx="16" cy="26.2" r="1.2" fill="#ffffff"/>
        <circle cx="16" cy="22.6" r="0.9" fill="#00ff73"/>

        {/* Esquerda */}
        <circle cx="5.8" cy="16" r="1.2" fill="#ffffff"/>
        <circle cx="9.4" cy="16" r="0.9" fill="#00ff73"/>

        {/* Direita */}
        <circle cx="26.2" cy="16" r="1.2" fill="#ffffff"/>
        <circle cx="22.6" cy="16" r="0.9" fill="#00ff73"/>
      </svg>

      {showText && (
        <span style={{
          color: '#ffffff',
          fontSize: `${Math.max(1, size * 0.033)}rem`,
          fontWeight: 900,
          letterSpacing: '0.04rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          LOG<span style={{ color: 'var(--primary, #00d95f)' }}>QR</span>
        </span>
      )}
    </div>
  );
}
