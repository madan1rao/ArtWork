import { Link, useParams } from 'react-router-dom';
import { photoService } from '@/services/photoService';
import { useAsync } from '@/hooks/useAsync';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { news } from '@/data/news';
import { PageHeader } from '@/components/ui/PageHeader';
import { FramedOnWall } from '@/components/ui/ArtFrame';
import { NewsCard, formatDate } from '@/components/news/NewsCard';
import NotFoundPage from './NotFoundPage';

export default function NewsPostPage() {
  const { slug } = useParams();
  const post = news.find((n) => n.slug === slug);
  const more = news.filter((n) => n.slug !== slug).slice(0, 3);
  const { data: covers = [] } = useAsync(
    () => photoService.getPhotosByIds([post?.coverId ?? '', ...more.map((m) => m.coverId)]),
    [slug],
  );
  usePageTitle(post?.title);
  // A wide, low wall suits big screens; phones get a taller one so the work isn't tiny.
  const wide = useMediaQuery('(min-width: 768px)');

  if (!post) return <NotFoundPage />;
  const cover = covers.find((c) => c.id === post.coverId);

  return (
    <>
      <PageHeader eyebrow={`${post.category} · ${formatDate(post.date)}`} title={post.title} crumbs={[{ label: 'News & Updates', to: '/news' }]}>
        {post.excerpt}
      </PageHeader>

      {cover && (
        <figure className="container-page">
          <FramedOnWall photo={cover} wallAspect={wide ? 16 / 7 : 4 / 3} fill={0.82} priority sizes="(min-width: 1024px) 40vw, 80vw" />
          <figcaption className="mt-3 text-xs text-ink-mute">
            {cover.title} — {cover.author}, {cover.date ?? cover.year}
          </figcaption>
        </figure>
      )}

      <article className="container-page mt-14">
        <div className="mx-auto max-w-2xl space-y-6 text-lg leading-relaxed text-ink-soft">
          {post.body.map((p, i) => (
            <p key={i} className={i === 0 ? 'text-ink' : ''}>
              {p}
            </p>
          ))}
        </div>
      </article>

      <section className="container-page mt-28" aria-labelledby="more-heading">
        <div className="mb-10 flex items-end justify-between">
          <h2 id="more-heading" className="display text-4xl md:text-5xl">
            More news
          </h2>
          <Link to="/news" className="text-sm text-ink-soft hover:text-ink">
            All news →
          </Link>
        </div>
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-3">
          {more.map((m, i) => (
            <NewsCard key={m.slug} post={m} cover={covers.find((c) => c.id === m.coverId)} index={i} />
          ))}
        </div>
      </section>
    </>
  );
}
