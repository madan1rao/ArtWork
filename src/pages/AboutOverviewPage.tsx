import { Link } from 'react-router-dom';
import { photoService } from '@/services/photoService';
import { useAsync } from '@/hooks/useAsync';
import { usePageTitle } from '@/hooks/usePageTitle';
import { site } from '@/config/site';
import { PageHeader, SectionHeading } from '@/components/ui/PageHeader';
import { FramedOnWall } from '@/components/ui/ArtFrame';
import { Hang3D } from '@/components/ui/Hang3D';
import { ArrowRight } from '@/components/ui/Icons';
import type { Photo } from '@/types/photo';

const crumbs = [{ label: 'About', to: '/about/overview' }];

const WHAT_WE_DO = [
  {
    title: 'Exhibit',
    body: 'We hang paintings, drawings, prints, ceramics and photographs in rooms you can visit in person — and walk through online.',
  },
  {
    title: 'Present digitally',
    body: 'Every department has a 3D hall on our website, so anyone, anywhere, can stand in front of a painting and look closely.',
  },
  {
    title: 'Connect',
    body: 'We help collectors, students and visitors find the works they love, with inquiries handled by real people.',
  },
];

export default function AboutOverviewPage() {
  usePageTitle('Company Overview');
  const { data: works = [] } = useAsync(() => photoService.listPhotos(), []);
  const artists = groupByArtist(works);

  const stats = [
    { value: works.length, label: 'Works on view' },
    { value: 5, label: 'Departments' },
    { value: artists.length, label: 'Artists' },
  ];

  return (
    <>
      <PageHeader eyebrow="About · Company Overview" title={site.name} crumbs={crumbs}>
        {site.name} runs an art gallery that lives in two places at once: in rooms you can visit, and in a 3D gallery on
        the web. We show work that was made by hand — paint on canvas, ink on paper, glaze on clay, light on film.
      </PageHeader>

      <section className="container-page">
        <dl className="grid grid-cols-3 border-y border-line">
          {stats.map((s) => (
            <div
              key={s.label}
              className="min-w-0 border-line py-8 not-first:border-l not-first:pl-4 sm:not-first:pl-6 md:py-12 md:not-first:pl-10"
            >
              {/* Narrower tracking on phones so labels like "Departments" fit their column. */}
              <dt className="eyebrow text-[10px]! tracking-[0.1em]! sm:text-[11px]! sm:tracking-[0.22em]!">{s.label}</dt>
              <dd className="display mt-3 text-5xl tabular-nums md:text-7xl">{s.value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="container-page mt-24" aria-labelledby="what-heading">
        <SectionHeading id="what-heading" eyebrow="What we do" title="Gallery, in person and online" />
        <ol className="grid gap-10 md:grid-cols-3">
          {WHAT_WE_DO.map((item, i) => (
            <li key={item.title} className="border-t border-line pt-6">
              <span className="text-xs text-ink-mute tabular-nums">0{i + 1}</span>
              <h3 className="display mt-3 text-4xl">{item.title}</h3>
              <p className="mt-3 text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-page mt-24" aria-labelledby="artists-heading">
        <SectionHeading id="artists-heading" eyebrow="In the collection" title="Artists on our walls" />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 lg:grid-cols-6">
          {artists.slice(0, 12).map((a, i) => (
            <li key={a.name}>
              <Hang3D index={i}>
                <Link to={`/artworks/${a.sample.category}`} className="group block">
                  <FramedOnWall
                    photo={a.sample}
                    wallAspect={1}
                    sizes="(min-width: 1024px) 12vw, 40vw"
                    className="transition-transform duration-700 ease-out-expo group-hover:-translate-y-1"
                  />
                  <p className="display mt-3 text-xl leading-tight">{a.name}</p>
                  <p className="mt-1 text-xs text-ink-mute">
                    {a.count} {a.count === 1 ? 'work' : 'works'}
                  </p>
                </Link>
              </Hang3D>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-24">
        <Link
          to="/about/mission-vision"
          className="group flex items-center justify-between gap-6 border-y border-line py-10 transition-colors hover:text-accent"
        >
          <span>
            <span className="eyebrow">Next</span>
            <span className="display mt-2 block text-5xl md:text-6xl">Mission &amp; Vision</span>
          </span>
          <ArrowRight size={28} className="shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </>
  );
}

function groupByArtist(works: Photo[]) {
  const map = new Map<string, Photo[]>();
  works.forEach((w) => map.set(w.author, [...(map.get(w.author) ?? []), w]));
  return [...map.entries()]
    .map(([name, list]) => ({ name, count: list.length, sample: list[0] }))
    .sort((a, b) => b.count - a.count);
}
