'use client';

import { useTheme } from '@/context/theme-context';

export function ThemeToggle() {
  const { isDark, toggleDarkMode } = useTheme();

  return (
    <button
      aria-pressed={isDark}
      className="button button-secondary"
      onClick={toggleDarkMode}
      type="button"
    >
      {isDark ? 'Dark' : 'Light'}
    </button>
  );
}
