import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { Photo } from '@/types/photo';

interface LightboxState {
  lightbox?: boolean;
}

/**
 * The open photo lives in `?photo=<id>` so it's shareable and the back button closes
 * the viewer. Opening pushes one history entry; stepping replaces it. Pass a distinct
 * `param` when several viewers share a page so they don't open each other.
 */
export function useLightbox(photos: Photo[], param = 'photo') {
  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const id = params.get(param);
  const index = id ? photos.findIndex((p) => p.id === id) : -1;
  const openedHere = (location.state as LightboxState | null)?.lightbox === true;

  const setPhoto = useCallback(
    (nextId: string | null, replace: boolean) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextId) next.set(param, nextId);
          else next.delete(param);
          return next;
        },
        { replace, preventScrollReset: true, state: nextId ? { lightbox: true } : null },
      ),
    [setParams, param],
  );

  const open = useCallback((photoId: string) => setPhoto(photoId, false), [setPhoto]);

  const close = useCallback(() => {
    if (openedHere) navigate(-1);
    else setPhoto(null, true);
  }, [openedHere, navigate, setPhoto]);

  const step = useCallback(
    (delta: number) => {
      if (index < 0 || photos.length === 0) return;
      const next = photos[(index + delta + photos.length) % photos.length];
      // Keep the "opened here" flag so closing still pops the original entry.
      setParams(
        (prev) => {
          const p = new URLSearchParams(prev);
          p.set(param, next.id);
          return p;
        },
        { replace: true, preventScrollReset: true, state: location.state },
      );
    },
    [index, photos, setParams, location.state, param],
  );

  return { index, open, close, next: () => step(1), prev: () => step(-1) };
}
