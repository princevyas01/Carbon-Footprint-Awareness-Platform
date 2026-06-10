'use client';

import React, { useEffect, useState } from 'react';
import ParticleCanvas from './ParticleCanvas';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // 1.8s display then start fade
    const timer = setTimeout(() => {
      setFade(true);
      // Wait for fade transition (500ms) before completing
      const completeTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(completeTimer);
    }, 1800);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080B12] transition-opacity duration-500 ease-in-out ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Loading CarbonLens"
    >
      <ParticleCanvas />

      {/* Earth Aura Breathing Orb */}
      <div className="absolute flex items-center justify-center z-10">
        <div 
          className="earth-aura-orb animate-pulse-slow animate-float w-64 h-64 rounded-full aura-glow-green blur-3xl"
          aria-hidden="true"
        />
      </div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center space-y-4 px-6">
        <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight text-[#E8F4F1] drop-shadow-[0_0_15px_rgba(0,255,135,0.3)]">
          CarbonLens
        </h1>
        <p className="font-body text-lg md:text-xl text-[#8899AA] tracking-wide animate-fade-in-up">
          See your carbon. Shrink it.
        </p>
      </div>
    </div>
  );
}
