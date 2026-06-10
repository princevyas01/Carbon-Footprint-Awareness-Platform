'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export default function ThemeToggle() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 border border-transparent hover:border-border transition-all duration-200"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-green animate-pulse-slow" />
      ) : (
        <Moon className="h-5 w-5 text-[#0D1117]" />
      )}
    </button>
  );
}
