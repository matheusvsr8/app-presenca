'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Inicia o fade out após 2.6 segundos
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2600);

    // Remove do DOM após 3.1 segundos
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 3100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#05070a',
        backgroundImage: 'radial-gradient(circle at center, rgba(0, 255, 136, 0.08) 0%, rgba(5, 7, 10, 0.98) 70%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fadeOut ? 'none' : 'all',
        overflow: 'hidden',
      }}
    >
      <div className="cyber-container">
        {/* Imagem do QR Cyber com Scanner Laser */}
        <div className="qr-wrapper">
          <Image
            src="/cyber-qr.jpg"
            alt="LogQR Cyber"
            width={180}
            height={180}
            priority
            className="qr-image"
          />
          <div className="scan-beam"></div>
          <div className="corner-tl"></div>
          <div className="corner-tr"></div>
          <div className="corner-bl"></div>
          <div className="corner-br"></div>
        </div>

        {/* Logo Text e Subtítulo */}
        <div className="text-wrapper">
          <h1 className="cyber-title">
            LOG<span>QR</span>
          </h1>
          <div className="cyber-badge">
            <span className="dot"></span>
            CONTROLE INTELIGENTE DE PRESENÇA
          </div>
        </div>
      </div>

      <style jsx>{`
        .cyber-container {
          display: flex;
          flexDirection: column;
          alignItems: center;
          gap: 1.8rem;
          animation: enterScale 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .qr-wrapper {
          position: relative;
          width: 180px;
          height: 180px;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 0 35px rgba(0, 255, 200, 0.25), 0 0 10px rgba(0, 255, 136, 0.15);
          border: 1px solid rgba(0, 255, 200, 0.3);
          background: #000;
        }

        .qr-image {
          object-fit: cover;
          width: 100%;
          height: 100%;
          filter: contrast(1.1) brightness(1.05);
        }

        /* Feixe do Scanner Laser */
        .scan-beam {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #00ffff, #00ff88, transparent);
          box-shadow: 0 0 15px #00ffff, 0 0 8px #00ff88;
          animation: scanMove 1.8s ease-in-out infinite alternate;
        }

        /* Cantos Cyberpunk */
        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: #00ff88;
          border-style: solid;
        }
        .corner-tl { top: 4px; left: 4px; border-width: 2px 0 0 2px; }
        .corner-tr { top: 4px; right: 4px; border-width: 2px 2px 0 0; }
        .corner-bl { bottom: 4px; left: 4px; border-width: 0 0 2px 2px; }
        .corner-br { bottom: 4px; right: 4px; border-width: 0 2px 2px 0; }

        .text-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }

        .cyber-title {
          font-size: 2.4rem;
          font-weight: 900;
          letter-spacing: 0.35rem;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
          font-family: system-ui, -apple-system, sans-serif;
        }

        .cyber-title span {
          color: var(--primary, #00ff88);
          text-shadow: 0 0 20px #00ff88, 0 0 40px rgba(0, 255, 136, 0.4);
        }

        .cyber-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.18rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00ff88;
          box-shadow: 0 0 8px #00ff88;
          animation: pulseDot 1.2s infinite ease-in-out;
        }

        @keyframes scanMove {
          0% { top: 0%; opacity: 0.4; }
          50% { opacity: 1; }
          100% { top: 96%; opacity: 0.4; }
        }

        @keyframes enterScale {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes pulseDot {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
