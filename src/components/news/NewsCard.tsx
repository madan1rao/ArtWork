import { Link } from 'react-router-dom';
import { FramedOnWall } from '@/components/ui/ArtFrame';
import { Hang3D } from '@/components/ui/Hang3D';
import type { NewsPost } from '@/data/news';
import type { Photo } from '@/types/photo';

export const formatDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

export function NewsCard({ post, cover, index }: { post: NewsPost; cover?: Photo; index: number }) {
  return (
    <Hang3D index={index}>
      <article>
        <Link to={`/news/${post.slug}`} className="group block">
          {cover ? (
            <FramedOnWall
              photo={cover}
              wallAspect={3 / 2}
              fill={0.8}
              sizes="(min-width: 1024px) 26vw, 80vw"
              className="transition-transform duration-700 ease-out-expo group-hover:-translate-y-1"
            />
          ) : (
            <div className="aspect-[3/2] rounded-sm bg-paper-2" />
          )}
          <p className="mt-4 text-xs text-ink-mute">
            <span className="text-accent">{post.category}</span> ·{' '}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
          <h3 className="display mt-2 text-3xl transition-colors group-hover:text-accent">{post.title}</h3>
          <p className="mt-2 text-sm text-ink-soft">{post.excerpt}</p>
        </Link>
      </article>
    </Hang3D>
  );
}
