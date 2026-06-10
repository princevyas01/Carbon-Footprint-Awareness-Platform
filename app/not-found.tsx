'use client';

import React from 'react';
import Link from 'next/link';
import ParticleCanvas from '../components/shared/ParticleCanvas';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#080B12] text-[#E8F4F1] flex flex-col items-center justify-center relative p-6">
      {/* Background canvas */}
      <ParticleCanvas />

      {/* Earth Aura Glow background decoration */}
      <div className="absolute w-72 h-72 rounded-full aura-glow-green blur-3xl opacity-40 animate-pulse-slow pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 text-center space-y-6 max-w-sm">
        <h1 className="font-display text-7xl font-bold tracking-tight text-frost drop-shadow-[0_0_15px_rgba(0,255,135,0.3)]">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-frost">
            Lost in Deep Space?
          </h2>
          <p className="font-body text-xs text-muted leading-relaxed">
            The page you are trying to reach has drifted out of orbit or was never mapped.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-3 bg-green hover:bg-green-dim text-void font-display font-bold text-xs rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Return to Orbit 🌍
        </Link>
      </div>
    </div>
  );
}
