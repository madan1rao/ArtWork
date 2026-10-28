import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'fourstack:theme';
const META_COLOR: Record<Theme, string> = { light: '#f6f3ee', dark: '#0b0a09' };

function readStored(): Theme | null {
  try {
    const t = localStorage.getItem(STORAGE_KEY);
    return t === 'light' || t === 'dark' ? t : null;
  } catch {
    return null;
  }
}

const systemTheme = (): Theme => (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');

/**
 * Light / dark theme. Follows the OS setting until the visitor picks one, then
 * remembers it. The inline script in index.html applies it before first paint.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[theme]);
  }, [theme]);

  // Track OS changes while the visitor hasn't chosen explicitly.
  useEffect(() => {
    const mql = matchMedia('(prefers-color-scheme: light)');
    const onChange = () => !readStored() && setTheme(systemTheme());
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable — the choice lasts for this visit */
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
