import { AnimatePresence } from 'framer-motion';
import { useLightbox } from '@/hooks/useLightbox';
import { Lightbox } from '@/components/lightbox/Lightbox';
import type { Photo } from '@/types/photo';
import { MasonryGrid } from './MasonryGrid';

interface PhotoGridProps {
  photos: Photo[];
  priorityCount?: number;
  maxColumns?: number;
  /** URL param holding the open photo; see `useLightbox`. */
  param?: string;
}

/** Masonry grid wired to a URL-driven lightbox. */
export function PhotoGrid({ photos, priorityCount, maxColumns, param }: PhotoGridProps) {
  const lightbox = useLightbox(photos, param);

  return (
    <>
      <MasonryGrid photos={photos} onOpen={lightbox.open} priorityCount={priorityCount} maxColumns={maxColumns} />
      <AnimatePresence>
        {lightbox.index >= 0 && (
          <Lightbox
            key="lightbox"
            photos={photos}
            index={lightbox.index}
            onClose={lightbox.close}
            onNext={lightbox.next}
            onPrev={lightbox.prev}
          />
        )}
      </AnimatePresence>
    </>
  );
}
