'use client';

import React, { useEffect, useRef } from 'react';
import { Award, Sparkles } from 'lucide-react';
import { useEcoScore } from '../../hooks/useEcoScore';

export default function LevelUpModal() {
  const { levelUpEvent, dismissLevelUp } = useEcoScore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (levelUpEvent) {
      // Focus the close button for accessibility
      closeButtonRef.current?.focus();

      // Auto dismiss after 3.5s
      const timer = setTimeout(() => {
        dismissLevelUp();
      }, 3500);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          dismissLevelUp();
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [levelUpEvent, dismissLevelUp]);

  if (!levelUpEvent) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-void/90 backdrop-blur-md p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="levelup-title"
    >
      {/* Background Glow */}
      <div className="absolute w-80 h-80 rounded-full aura-glow-green blur-3xl opacity-60 animate-pulse-slow" />

      {/* Modal Box */}
      <div 
        className="relative max-w-sm w-full glass-panel border-green/30 border rounded-3xl p-8 text-center shadow-2xl flex flex-col items-center space-y-6 animate-fade-in-up"
      >
        {/* Sparkles / Effects */}
        <div className="flex gap-2">
          <Sparkles className="h-6 w-6 text-green animate-bounce" />
          <Award className="h-12 w-12 text-green animate-pulse-slow" />
          <Sparkles className="h-6 w-6 text-green animate-bounce" />
        </div>

        <div className="space-y-2">
          <span className="text-sm font-body text-green uppercase tracking-widest font-semibold">
            Level Up!
          </span>
          <h2 id="levelup-title" className="font-display text-2xl md:text-3xl font-bold text-frost">
            You reached {levelUpEvent}!
          </h2>
        </div>

        <p className="font-body text-xs text-muted leading-relaxed">
          Amazing work. You are making a real, trackable impact on carbon reduction.
          You have been awarded <strong className="text-green">+50 XP</strong> bonus!
        </p>

        <button
          ref={closeButtonRef}
          onClick={dismissLevelUp}
          className="w-full py-3 bg-green hover:bg-green-dim text-void font-display font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-green/20"
        >
          Keep Going 🌍
        </button>
      </div>
    </div>
  );
}
