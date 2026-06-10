import { Theme } from '../types';

/**
 * Checks system preference for light/dark theme.
 */
export function getSystemThemePreference(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  return isLight ? 'light' : 'dark';
}

/**
 * Applies the theme to the HTML document element.
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  const root = window.document.documentElement;
  
  if (theme === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
    root.style.colorScheme = 'light';
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  }
}
