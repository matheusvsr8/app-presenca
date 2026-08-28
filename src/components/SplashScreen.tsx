'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Começa a esmaecer após 2.5 segundos
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Remove do DOM após 3 segundos (tempo do fade terminar)
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 3000);

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
        backgroundColor: '#000000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: fadeOut ? 'none' : 'all',
      }}
    >
      <div className="splash-logo-container">
        <Image 
          src="/icon.png" 
          alt="LogQR" 
          width={150} 
          height={150} 
          className="splash-logo"
        />
      </div>

      <style jsx>{`
        .splash-logo-container {
          position: relative;
          display: flex;
          justifyContent: center;
          alignItems: center;
        }
        
        .splash-logo {
          animation: pulse-glow 2s infinite, scale-up 2.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.2));
        }

        @keyframes pulse-glow {
          0% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.1)); }
          50% { filter: drop-shadow(0 0 25px rgba(255, 255, 255, 0.6)); }
          100% { filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.1)); }
        }

        @keyframes scale-up {
          0% { transform: scale(0.8); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
