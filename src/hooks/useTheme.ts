import { useCallback, useEffect, useState } from 'react';
import type { ThemeMode } from '../types/todo';
import { loadTheme, saveTheme } from '../utils/storage';

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => loadTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
