import type { ReactNode } from 'react';
import { Walkthrough } from '@/components/walkthrough/Walkthrough';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import type { Photo } from '@/types/photo';

interface CategoryHallProps {
  id: string;
  photos: Photo[];
  label: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  /** Extra classes for the entrance title card (e.g. to keep it clear of a painting). */
  introClassName?: string;
}

/** A department's works hung in the 3D hall (falls back to a grid without WebGL). */
export function CategoryHall({ id, photos, label, eyebrow, title, description, introClassName = '' }: CategoryHallProps) {
  if (photos.length === 0) return null;
  return (
    <Walkthrough
      id={id}
      photos={photos}
      label={label}
      introClassName={introClassName}
      intro={
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display mt-5 text-[clamp(3rem,9vw,7.5rem)]">{title}</h2>
          <p className="mx-auto mt-6 max-w-md text-base text-ink-soft md:text-lg">{description}</p>
        </div>
      }
      fallback={
        <section className="container-page" aria-label={label}>
          <PhotoGrid photos={photos} maxColumns={3} param="walk" />
        </section>
      }
    />
  );
}
