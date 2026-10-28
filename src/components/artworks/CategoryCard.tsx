import { Link } from 'react-router-dom';
import { FramedOnWall } from '@/components/ui/ArtFrame';
import { Hang3D } from '@/components/ui/Hang3D';
import { ArrowRight } from '@/components/ui/Icons';
import type { Category, Photo } from '@/types/photo';

interface CategoryCardProps {
  category: Category;
  cover?: Photo;
  count: number;
  index: number;
  /** Skip the scroll swing (e.g. when the work arrives some other way). */
  still?: boolean;
}

/** One department: its cover work framed on a lit wall panel, linking to the department page. */
export function CategoryCard({ category, cover, count, index, still = false }: CategoryCardProps) {
  const body = (
    <Link to={`/artworks/${category.id}`} className="group block">
      <div className="relative">
        {cover ? (
          <FramedOnWall
            photo={cover}
            wallAspect={4 / 5}
            sizes="(min-width: 1024px) 26vw, (min-width: 640px) 40vw, 80vw"
            className="transition-transform duration-700 ease-out-expo group-hover:-translate-y-1"
            // data-category-cover: lets the home page fly a painting into this frame.
            frameProps={{ 'data-category-cover': category.id }}
          />
        ) : (
          <div className="aspect-[4/5] rounded-sm bg-paper-2" />
        )}
        <span className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-[11px] tracking-wide text-white backdrop-blur">
          {count} works
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="display text-4xl md:text-5xl">{category.title}</h3>
          <p className="mt-2 text-sm text-ink-soft">{category.description}</p>
        </div>
        <span className="mt-2 grid size-10 shrink-0 place-items-center rounded-full border border-line transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-paper">
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );

  return still ? <article>{body}</article> : <Hang3D index={index}><article>{body}</article></Hang3D>;
}
