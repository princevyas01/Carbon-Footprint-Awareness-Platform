'use client';

import React from 'react';
import { useCarbon } from '../../context/CarbonContext';

export default function ThemeToggle() {
  const { state, toggleTheme } = useCarbon();
  const isDark = state.theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="w-10 h-10 rounded-full flex items-center justify-center
                 border border-white/10 hover:border-[#00FF87]/50
                 transition-all duration-200 text-lg"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
