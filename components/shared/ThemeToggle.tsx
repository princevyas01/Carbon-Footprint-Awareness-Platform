'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  // On mount: read saved theme
  useEffect(() => {
    const saved = localStorage.getItem('carbonlens_theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      setIsDark(true);
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggle = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);

    // Apply IMMEDIATELY to <html> element — no reload needed
    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }

    // Persist
    localStorage.setItem('carbonlens_theme', newTheme);
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="w-10 h-10 rounded-full flex items-center justify-center
                 border border-white/10 hover:border-[#00FF87]/50
                 transition-all duration-200 text-lg"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}
