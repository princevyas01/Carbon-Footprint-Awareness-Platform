/**
 * @file CompletionCelebration.tsx
 * @description Dialog modal overlay for celebrating successful completion of a sustainability challenge.
 *
 * @module Components
 * @author CarbonLens Team
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { Trophy, Star, X } from 'lucide-react';
import { useChallenge } from '../../hooks/useChallenge';

/**
 * Overlay modal celebrating a completed challenge, displaying stats, trophies, and auto-dismissing.
 * @returns React element representing the celebration modal, or null if not active.
 */
export default function CompletionCelebration() {
  const { celebrationChallenge, dismissCelebration } = useChallenge();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!celebrationChallenge) {
      return () => {};
    }

    closeButtonRef.current?.focus();

    const timer = setTimeout(() => {
      dismissCelebration();
    }, 5000); // Display for 5 seconds

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        dismissCelebration();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [celebrationChallenge, dismissCelebration]);

  if (!celebrationChallenge) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-md p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      {/* Background glow effects */}
      <div className="absolute w-80 h-80 rounded-full bg-[#00FF87]/20 blur-3xl opacity-60 animate-pulse-slow" />
      <div className="absolute w-60 h-60 rounded-full bg-cyan-500/10 blur-3xl opacity-40 animate-pulse-slow delay-75" />

      {/* Modal Box */}
      <div
        className="relative max-w-md w-full glass-panel border-[#00FF87]/30 border rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center space-y-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          ref={closeButtonRef}
          onClick={dismissCelebration}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:text-frost hover:bg-white/5 transition-all duration-200"
          aria-label="Dismiss celebration"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Trophies & Icons */}
        <div className="relative flex items-center justify-center w-20 h-20">
          <Star className="absolute top-0 left-0 h-6 w-6 text-yellow-400 animate-bounce" />
          <Trophy className="h-16 w-16 text-[#00FF87] animate-pulse-slow" />
          <Star className="absolute bottom-0 right-0 h-6 w-6 text-yellow-400 animate-bounce delay-150" />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-body text-[#00FF87] uppercase tracking-widest font-semibold">
            Challenge Completed!
          </span>
          <h2 id="celebration-title" className="font-display text-2xl md:text-3xl font-bold text-frost">
            You crushed it!
          </h2>
        </div>

        {/* Challenge details */}
        <div className="w-full bg-white/5 border border-border p-4 rounded-2xl space-y-2">
          <p className="font-display text-lg font-bold text-frost flex items-center justify-center gap-2">
            <span>{celebrationChallenge.emoji}</span>
            <span>{celebrationChallenge.name}</span>
          </p>
          <p className="font-body text-xs text-muted">
            {celebrationChallenge.description}
          </p>
        </div>

        {/* Stats card */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-[#00FF87]/5 border border-[#00FF87]/10 p-3 rounded-xl">
            <span className="text-[10px] text-muted uppercase tracking-wider font-semibold font-data">
              CO₂ Saved
            </span>
            <p className="font-data text-base font-bold text-[#00FF87]">
              {celebrationChallenge.co2SavedPotential} kg
            </p>
          </div>
          <div className="bg-cyan-500/5 border border-cyan-500/10 p-3 rounded-xl">
            <span className="text-[10px] text-muted uppercase tracking-wider font-semibold font-data">
              XP Awarded
            </span>
            <p className="font-data text-base font-bold text-cyan-400">
              +50 XP
            </p>
          </div>
        </div>

        <p className="font-body text-xs text-muted leading-relaxed">
          Every small action counts. You are helping to drive real carbon reductions!
        </p>

        <button
          onClick={dismissCelebration}
          className="w-full py-3 bg-gradient-to-r from-[#00FF87] to-cyan-500 hover:opacity-90 text-void font-display font-bold text-sm rounded-xl transition-all duration-200 shadow-lg"
        >
          Collect Rewards 🎉
        </button>
      </div>
    </div>
  );
}
