import type { Photo } from '@/types/photo';

/**
 * Central place for building image URLs. Swap this out for a CDN / image proxy
 * (Cloudinary, imgix, your own resizer) without touching any component.
 *
 * `src` is either an Unsplash photo key (resized on the fly) or a site path starting
 * with "/" for self-hosted images, which are served as-is.
 */
const BASE = 'https://images.unsplash.com/photo-';
const WIDTHS = [400, 640, 960, 1280, 1920] as const;

const isLocal = (src: string) => src.startsWith('/');

export function photoUrl(photo: Pick<Photo, 'src' | 'width' | 'height'>, width: number, quality = 72) {
  if (isLocal(photo.src)) return photo.src;
  const height = Math.round((width * photo.height) / photo.width);
  return `${BASE}${photo.src}?auto=format&fit=crop&w=${width}&h=${height}&q=${quality}`;
}

export function photoSrcSet(photo: Pick<Photo, 'src' | 'width' | 'height'>, maxWidth = 1920) {
  if (isLocal(photo.src)) return undefined;
  return WIDTHS.filter((w) => w <= maxWidth)
    .map((w) => `${photoUrl(photo, w)} ${w}w`)
    .join(', ');
}

/** Deterministic fallback used if the primary source fails to load. */
export function fallbackUrl(photo: Pick<Photo, 'id' | 'width' | 'height'>, width = 960) {
  const height = Math.round((width * photo.height) / photo.width);
  return `https://picsum.photos/seed/${photo.id}/${width}/${height}`;
}
