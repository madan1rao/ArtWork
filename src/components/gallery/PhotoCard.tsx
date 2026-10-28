import { ArtFrame } from '@/components/ui/ArtFrame';
import { Hang3D } from '@/components/ui/Hang3D';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useFinePointer } from '@/hooks/useMediaQuery';
import { dateLabel, type Photo } from '@/types/photo';

interface PhotoCardProps {
  photo: Photo;
  onOpen: (id: string) => void;
  index?: number;
  priority?: boolean;
  sizes?: string;
}

/** A work hung in its frame with a small wall label; swings onto the wall as it scrolls in. */
export function PhotoCard({ photo, onOpen, index = 0, priority, sizes }: PhotoCardProps) {
  const finePointer = useFinePointer();

  return (
    <Hang3D index={index}>
      <figure className="group relative">
        <ArtFrame
          photo={photo}
          priority={priority}
          sizes={sizes}
          className="transition-transform duration-700 ease-out-expo group-hover:-translate-y-1"
          imageClassName="transition-transform duration-[1.2s] ease-out-expo group-hover:scale-[1.03]"
        >
          <button
            type="button"
            onClick={() => onOpen(photo.id)}
            className="absolute inset-0 cursor-zoom-in"
            aria-label={`View ${photo.title}, ${photo.author}`}
          />
          <FavoriteButton
            photoId={photo.id}
            title={photo.title}
            className={`absolute top-2 right-2 ${
              finePointer ? 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 aria-pressed:opacity-100' : ''
            }`}
          />
        </ArtFrame>

        {/* Wall label */}
        <figcaption className="mt-3 px-1">
          <p className="display text-xl leading-tight">{photo.title}</p>
          <p className="mt-0.5 truncate text-xs text-ink-mute">
            {photo.author} · {dateLabel(photo)}
          </p>
        </figcaption>
      </figure>
    </Hang3D>
  );
}
