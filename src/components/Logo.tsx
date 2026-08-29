import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 36, showText = true }: LogoProps) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }}>
      {/* Ícone Vetorial de QR Code Cyberpunk Ultra-Nítido */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '9px',
          background: 'linear-gradient(135deg, #0d1a12 0%, #050a07 100%)',
          border: '1px solid rgba(0, 217, 95, 0.45)',
          boxShadow: '0 0 15px rgba(0, 217, 95, 0.25), inset 0 0 8px rgba(0, 217, 95, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}
      >
        <svg
          width={size * 0.68}
          height={size * 0.68}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Top-Left Finder */}
          <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="#00d95f" strokeWidth="1.8" />
          <rect x="4" y="4" width="3" height="3" rx="0.5" fill="#00d95f" />
          
          {/* Top-Right Finder */}
          <rect x="15" y="2" width="7" height="7" rx="1.5" stroke="#00d95f" strokeWidth="1.8" />
          <rect x="17" y="4" width="3" height="3" rx="0.5" fill="#00d95f" />
          
          {/* Bottom-Left Finder */}
          <rect x="2" y="15" width="7" height="7" rx="1.5" stroke="#00d95f" strokeWidth="1.8" />
          <rect x="4" y="17" width="3" height="3" rx="0.5" fill="#00d95f" />
          
          {/* High-Tech Data Pixels */}
          <rect x="11" y="2" width="2" height="2" rx="0.5" fill="#ffffff" />
          <rect x="11" y="6" width="2" height="2" rx="0.5" fill="#00d95f" />
          <rect x="2" y="11" width="2" height="2" rx="0.5" fill="#ffffff" />
          <rect x="6" y="11" width="2" height="2" rx="0.5" fill="#00d95f" />
          <rect x="10" y="10" width="4" height="4" rx="1" fill="#00d95f" />
          <rect x="16" y="11" width="2" height="2" rx="0.5" fill="#ffffff" />
          <rect x="20" y="11" width="2" height="2" rx="0.5" fill="#00d95f" />
          <rect x="11" y="16" width="2" height="2" rx="0.5" fill="#00d95f" />
          <rect x="11" y="20" width="2" height="2" rx="0.5" fill="#ffffff" />
          <rect x="15" y="15" width="7" height="7" rx="1.5" stroke="#00d95f" strokeWidth="1.8" />
          <circle cx="18.5" cy="18.5" r="1.5" fill="#ffffff" />
        </svg>
      </div>

      {showText && (
        <span style={{
          color: '#ffffff',
          fontSize: '1.25rem',
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
