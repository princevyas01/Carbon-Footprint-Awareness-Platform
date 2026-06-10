/**
 * @file useTheme.ts
 * @description Custom hook to access and toggle the global dark/light theme state.
 *
 * @module Hooks
 * @author CarbonLens Team
 */

import { useCarbon } from '../context/CarbonContext';

/**
 * Custom hook providing the current theme value and a toggler function.
 * @returns Object containing theme string, toggleTheme function, and isDark convenience boolean.
 * @example
 * const { theme, toggleTheme } = useTheme();
 */
export function useTheme() {
  const { state, toggleTheme } = useCarbon();

  return {
    theme: state.theme,
    toggleTheme,
    isDark: state.theme === 'dark',
  };
}
