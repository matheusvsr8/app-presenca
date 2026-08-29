'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Inicia o fade out após 2.4 segundos
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2400);

    // Remove do DOM após 2.9 segundos
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 2900);

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
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#05070a',
        backgroundImage: 'radial-gradient(circle at center, rgba(0, 217, 95, 0.12) 0%, rgba(5, 7, 10, 0.98) 75%)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        pointerEvents: fadeOut ? 'none' : 'all',
        overflow: 'hidden',
        padding: '1.5rem',
        boxSizing: 'border-box'
      }}
    >
      <div className="cyber-container">
        {/* Imagem do QR Cyber com Scanner Laser */}
        <div className="qr-wrapper">
          <Image
            src="/logo.png"
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

        {/* Barra de Progresso Futurista */}
        <div className="loading-bar">
          <div className="loading-fill"></div>
        </div>
      </div>

      <style jsx>{`
        .cyber-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 1.5rem;
          width: 100%;
          max-width: 340px;
          margin: 0 auto;
          animation: enterScale 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .qr-wrapper {
          position: relative;
          width: 150px;
          height: 150px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 0 35px rgba(0, 217, 95, 0.3), 0 0 10px rgba(0, 255, 200, 0.2);
          border: 1.5px solid rgba(0, 217, 95, 0.4);
          background: #000;
          margin: 0 auto;
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
          background: linear-gradient(90deg, transparent, #00ffff, #00d95f, transparent);
          box-shadow: 0 0 15px #00ffff, 0 0 8px #00d95f;
          animation: scanMove 1.6s ease-in-out infinite alternate;
        }

        /* Cantos Cyberpunk */
        .corner-tl, .corner-tr, .corner-bl, .corner-br {
          position: absolute;
          width: 12px;
          height: 12px;
          border-color: #00d95f;
          border-style: solid;
        }
        .corner-tl { top: 5px; left: 5px; border-width: 2px 0 0 2px; }
        .corner-tr { top: 5px; right: 5px; border-width: 2px 2px 0 0; }
        .corner-bl { bottom: 5px; left: 5px; border-width: 0 0 2px 2px; }
        .corner-br { bottom: 5px; right: 5px; border-width: 0 2px 2px 0; }

        .text-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
        }

        .cyber-title {
          font-size: 2.2rem;
          font-weight: 900;
          letter-spacing: 0.35rem;
          color: #ffffff;
          margin: 0;
          text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
          font-family: system-ui, -apple-system, sans-serif;
          line-height: 1;
        }

        .cyber-title span {
          color: #00d95f;
          text-shadow: 0 0 20px #00d95f, 0 0 40px rgba(0, 217, 95, 0.4);
        }

        .cyber-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12rem;
          color: rgba(255, 255, 255, 0.7);
          text-transform: uppercase;
          white-space: nowrap;
        }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00d95f;
          box-shadow: 0 0 8px #00d95f;
          animation: pulseDot 1.2s infinite ease-in-out;
          flex-shrink: 0;
        }

        /* Barra de progresso */
        .loading-bar {
          width: 140px;
          height: 3px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          overflow: hidden;
          margin-top: 0.25rem;
        }

        .loading-fill {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #00ffff, #00d95f);
          box-shadow: 0 0 10px #00d95f;
          border-radius: 99px;
          animation: fillProgress 2.2s ease-out forwards;
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

        @keyframes fillProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
