'use client';

import React from 'react';

interface EarthAuraProps {
  monthlyTotal: number;
}

export default function EarthAura({ monthlyTotal }: EarthAuraProps) {
  // Color logic (change radial gradient color dynamically):
  // Monthly CO₂ < 150 kg  → green  rgba(0,255,135,...)
  // Monthly CO₂ 150–300   → amber  rgba(255,179,71,...)
  // Monthly CO₂ > 300     → coral  rgba(255,107,107,...)
  let bgGradient = 'radial-gradient(circle, rgba(0, 255, 135, 0.18) 0%, rgba(0, 255, 135, 0.06) 40%, transparent 70%)';

  if (monthlyTotal > 300) {
    bgGradient = 'radial-gradient(circle, rgba(255, 107, 107, 0.18) 0%, rgba(255, 107, 107, 0.06) 40%, transparent 70%)';
  } else if (monthlyTotal >= 150) {
    bgGradient = 'radial-gradient(circle, rgba(255, 179, 71, 0.18) 0%, rgba(255, 179, 71, 0.06) 40%, transparent 70%)';
  }

  return (
    <div
      style={{
        position: 'absolute',
        width: '320px',
        height: '320px',
        borderRadius: '50%',
        background: bgGradient,
        animation: 'aura-breathe 3s ease-in-out infinite, aura-float 6s ease-in-out infinite',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
}
