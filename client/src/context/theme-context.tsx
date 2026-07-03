'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  preference: ThemePreference;
  isDark: boolean;
  toggleDarkMode: () => void;
};

const THEME_KEY = 'clientpulse-theme';
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemIsDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(preference: ThemePreference) {
  if (preference === 'system') {
    document.documentElement.removeAttribute('data-theme');
    return;
  }

  document.documentElement.setAttribute('data-theme', preference);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const [systemIsDark, setSystemIsDark] = useState(false);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem(THEME_KEY);
    const initialPreference =
      storedPreference === 'light' || storedPreference === 'dark'
        ? storedPreference
        : 'system';

    setPreference(initialPreference);
    setSystemIsDark(getSystemIsDark());
    applyTheme(initialPreference);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (event: MediaQueryListEvent) => {
      setSystemIsDark(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const isDark = preference === 'system' ? systemIsDark : preference === 'dark';

  const toggleDarkMode = useCallback(() => {
    const nextPreference = isDark ? 'light' : 'dark';
    window.localStorage.setItem(THEME_KEY, nextPreference);
    setPreference(nextPreference);
    applyTheme(nextPreference);
  }, [isDark]);

  const value = useMemo(
    () => ({
      preference,
      isDark,
      toggleDarkMode,
    }),
    [isDark, preference, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return value;
}
