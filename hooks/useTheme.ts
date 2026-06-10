import { useCarbon } from '../context/CarbonContext';

export function useTheme() {
  const { state, toggleTheme } = useCarbon();

  return {
    theme: state.theme,
    toggleTheme,
    isDark: state.theme === 'dark',
  };
}
