import { useSyncExternalStore } from 'react';

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** True on devices with a precise pointer that can hover (i.e. not touch-first). */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)');
