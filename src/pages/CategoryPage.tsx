import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { photoService, matchesQuery } from '@/services/photoService';
import { useAsync } from '@/hooks/useAsync';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader, EmptyState } from '@/components/ui/PageHeader';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import { CategoryHall } from '@/components/artworks/CategoryHall';
import { CloseIcon, SearchIcon } from '@/components/ui/Icons';
import { ENTER_HALL_EVENT } from '@/components/walkthrough/Walkthrough';
import NotFoundPage from './NotFoundPage';

export default function CategoryPage() {
  const { category: id = '' } = useParams();
  const { data, loading } = useAsync(async () => {
    const category = await photoService.getCategory(id);
    const [works, all] = await Promise.all([
      category ? photoService.listPhotos({ category: category.id }) : Promise.resolve([]),
      photoService.listCategories(),
    ]);
    return { category, works, others: all.filter((c) => c.id !== category?.id) };
  }, [id]);
  const [search, setSearch] = useState('');

  usePageTitle(data?.category?.title);

  if (loading && !data) return null;
  if (!data?.category) return <NotFoundPage />;

  const { category, works, others } = data;
  const shown = works.filter((p) => matchesQuery(p, { search }));
  const artists = new Set(works.map((w) => w.author)).size;

  return (
    <>
      <PageHeader eyebrow={`Artworks · ${works.length} works · ${artists} artists`} title={category.title} crumbs={[{ label: 'Artworks', to: '/artworks' }]}>
        <p>{category.description}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(ENTER_HALL_EVENT))}
            className="rounded-full bg-ink px-6 py-3 text-sm text-paper transition-colors hover:bg-ink-soft"
          >
            Walk this room in 3D
          </button>
          <label className="relative flex w-full items-center sm:w-72">
            <span className="sr-only">Search {category.title.toLowerCase()}</span>
            <SearchIcon size={17} className="pointer-events-none absolute left-3.5 text-ink-mute" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, artist, medium…"
              className="h-11 w-full rounded-full border border-line bg-paper pr-10 pl-10 text-sm placeholder:text-ink-mute focus:border-ink focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                className="absolute right-2 grid size-7 place-items-center rounded-full text-ink-mute hover:bg-paper-2 hover:text-ink"
              >
                <CloseIcon size={15} />
              </button>
            )}
          </label>
        </div>
      </PageHeader>

      <section className="container-page" aria-label={`${category.title} — all works`}>
        {shown.length === 0 ? (
          <EmptyState title="Nothing matches">Try another word, or clear the search.</EmptyState>
        ) : (
          <PhotoGrid photos={shown} priorityCount={3} maxColumns={3} />
        )}
      </section>

      <div className="mt-28 md:mt-40">
        <CategoryHall
          key={category.id}
          id="hall"
          photos={works}
          label={category.title}
          eyebrow="Walk the room"
          title={category.title}
          description={`${works.length} works hung along a quiet hall. Step inside and scroll to walk.`}
        />
      </div>

      <nav aria-label="Other departments" className="container-page mt-24">
        <p className="eyebrow">More departments</p>
        <ul className="mt-5 flex flex-wrap gap-3">
          {others.map((c) => (
            <li key={c.id}>
              <Link
                to={`/artworks/${c.id}`}
                className="inline-block rounded-full border border-line px-5 py-2.5 text-sm text-ink-soft transition-colors hover:border-ink hover:text-ink"
              >
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
