'use client';

import React, { useEffect, useRef } from 'react';
import { Trophy, Star, X } from 'lucide-react';
import { useChallenge } from '../../hooks/useChallenge';

export default function CompletionCelebration() {
  const { celebrationChallenge, dismissCelebration } = useChallenge();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (celebrationChallenge) {
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
    }
  }, [celebrationChallenge, dismissCelebration]);

  if (!celebrationChallenge) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-md p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      {/* Floating Particles overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-green/20 animate-float"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 4 + 4}s`,
            }}
          />
        ))}
      </div>

      {/* Glow */}
      <div className="absolute w-96 h-96 rounded-full aura-glow-green blur-3xl opacity-50 animate-pulse-slow" />

      {/* Main card */}
      <div 
        className="relative max-w-md w-full glass-panel border border-green/30 rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center space-y-6 animate-fade-in-up"
      >
        <button
          onClick={dismissCelebration}
          className="absolute top-4 right-4 p-1 rounded-lg text-muted hover:text-frost hover:bg-white/5 transition-colors"
          aria-label="Close celebration"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative">
          <div className="absolute inset-0 bg-green/20 blur-xl rounded-full scale-125 animate-pulse" />
          <div className="relative bg-space border border-border p-4 rounded-full">
            <Trophy className="h-14 w-14 text-green" />
          </div>
          <Star className="absolute -top-1 -right-1 h-5 w-5 text-amber animate-bounce" />
          <Star className="absolute -bottom-1 -left-1 h-4 w-4 text-amber animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-data text-green uppercase tracking-widest font-semibold">
            Mission Accomplished!
          </span>
          <h2 id="celebration-title" className="font-display text-2xl md:text-3xl font-bold text-frost">
            {celebrationChallenge.name} Completed
          </h2>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-border w-full space-y-1">
          <p className="text-xs text-muted font-body">Carbon footprint saved</p>
          <p className="text-2xl font-bold font-data text-green">
            ~{celebrationChallenge.co2SavedPotential} kg CO₂
          </p>
        </div>

        <p className="font-body text-xs text-muted leading-relaxed">
          Congratulations! You completed the {celebrationChallenge.duration} challenge, 
          earning <strong className="text-green">+50 XP</strong> and lowering your footprint!
        </p>

        <button
          ref={closeButtonRef}
          onClick={dismissCelebration}
          className="w-full py-3 bg-green hover:bg-green-dim text-void font-display font-bold text-sm rounded-xl transition-all duration-200 shadow-lg"
        >
          View Dashboard
        </button>
      </div>
    </div>
  );
}
