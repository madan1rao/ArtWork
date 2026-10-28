import { useMemo } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { Photo } from '@/types/photo';
import { PhotoCard } from './PhotoCard';

interface MasonryGridProps {
  photos: Photo[];
  onOpen: (id: string) => void;
  /** How many leading images load eagerly. */
  priorityCount?: number;
  maxColumns?: number;
}

function useColumnCount(max: number) {
  const sm = useMediaQuery('(min-width: 640px)');
  const lg = useMediaQuery('(min-width: 1024px)');
  const xl = useMediaQuery('(min-width: 1536px)');
  return Math.min(max, xl ? 4 : lg ? 3 : sm ? 2 : 1);
}

/**
 * Masonry that keeps reading order left-to-right: each photo goes into the currently
 * shortest column (by aspect ratio), unlike CSS columns which fill top-to-bottom.
 */
export function MasonryGrid({ photos, onOpen, priorityCount = 0, maxColumns = 4 }: MasonryGridProps) {
  const count = useColumnCount(maxColumns);

  const columns = useMemo(() => {
    const cols: { photo: Photo; index: number }[][] = Array.from({ length: count }, () => []);
    const heights = new Array<number>(count).fill(0);
    photos.forEach((photo, index) => {
      const shortest = heights.indexOf(Math.min(...heights));
      cols[shortest].push({ photo, index });
      heights[shortest] += photo.height / photo.width;
    });
    return cols;
  }, [photos, count]);

  const sizes = `${Math.round(100 / count)}vw`;

  return (
    <div className="flex gap-6 md:gap-10">
      {columns.map((col, c) => (
        <div key={c} className="flex min-w-0 flex-1 flex-col gap-10 md:gap-14">
          {col.map(({ photo, index }) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onOpen={onOpen}
              // Neighbouring columns swing in from opposite sides.
              index={c}
              priority={index < priorityCount}
              sizes={sizes}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
