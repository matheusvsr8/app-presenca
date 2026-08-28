'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Começa a esmaecer após 4 segundos (tempo para ver as faíscas)
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    // Remove do DOM após 4.5 segundos
    const removeTimer = setTimeout(() => {
      setShow(false);
    }, 4500);

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
        justifyContent: 'center',
        alignItems: 'center',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease-in-out',
        pointerEvents: fadeOut ? 'none' : 'all',
        overflow: 'hidden'
      }}
    >
      <video 
        src="/splash.mp4" 
        autoPlay 
        muted 
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scale(1.15)' // Zoom para esconder a marca d'água nos cantos
        }}
      />
    </div>
  );
}
