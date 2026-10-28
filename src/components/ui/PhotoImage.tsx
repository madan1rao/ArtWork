import { useCallback, useState, type ImgHTMLAttributes } from 'react';
import { fallbackUrl, photoSrcSet, photoUrl } from '@/lib/image';
import type { Photo } from '@/types/photo';

interface PhotoImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet'> {
  photo: Photo;
  /** `sizes` attribute so the browser picks the smallest adequate source. */
  sizes?: string;
  /** Load eagerly with high priority (above-the-fold images only). */
  priority?: boolean;
  maxWidth?: number;
}

/**
 * Responsive image with a dominant-colour placeholder, fade-in on load and a
 * fallback source on error. Callers control the box size; the image fills it.
 */
export function PhotoImage({
  photo,
  sizes = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
  priority = false,
  maxWidth = 1920,
  className = '',
  alt,
  ...rest
}: PhotoImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  // Images served from cache can finish before React attaches onLoad.
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <img
      ref={ref}
      src={failed ? fallbackUrl(photo) : photoUrl(photo, 960)}
      srcSet={failed ? undefined : photoSrcSet(photo, maxWidth)}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={alt ?? `${photo.title} — ${photo.location}`}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={() => setLoaded(true)}
      onError={() => !failed && setFailed(true)}
      draggable={false}
      className={`h-full w-full object-cover transition-opacity duration-700 ease-out ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      style={{ backgroundColor: photo.color }}
      {...rest}
    />
  );
}
