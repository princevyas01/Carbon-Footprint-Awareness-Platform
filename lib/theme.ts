/**
 * @file theme.ts
 * @description Theme utility functions for determining and applying system or user theme preferences (light/dark modes).
 *
 * @module Theme
 * @author CarbonLens Team
 */

import { Theme } from '../types';

/**
 * Checks system preferences to determine if light mode or dark mode is preferred.
 * @returns 'light' or 'dark' based on system settings
 * @example
 * const systemTheme = getSystemThemePreference();
 */
export function getSystemThemePreference(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  return isLight ? 'light' : 'dark';
}

/**
 * Applies the selected theme class and color-scheme to the document root element.
 * @param theme - The selected theme ('light' or 'dark')
 * @example
 * applyTheme('dark');
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
