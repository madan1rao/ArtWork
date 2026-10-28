import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { photoService } from '@/services/photoService';
import { useAsync } from '@/hooks/useAsync';
import { usePageTitle } from '@/hooks/usePageTitle';
import { site } from '@/config/site';
import { news } from '@/data/news';
import { Statement } from '@/components/home/Statement';
import { CategoryCard } from '@/components/artworks/CategoryCard';
import { CategoryHall } from '@/components/artworks/CategoryHall';
import { NewsCard } from '@/components/news/NewsCard';
import { Flight, FramedArtwork, elementPose, hallFramePose, type ScreenPose } from '@/components/home/FlyingPainting';
import { SectionHeading } from '@/components/ui/PageHeader';
import { ArrowRight } from '@/components/ui/Icons';
import { ENTER_HALL_EVENT } from '@/components/walkthrough/Walkthrough';
import type { Photo } from '@/types/photo';

const ease = [0.16, 1, 0.3, 1] as const;
const FEATURE_ID = 'girl-with-a-pearl-earring';
/** Flies out of the hall into the Paintings card (it's that card's cover). */
const OUT_ID = 'starry-night';

export default function HomePage() {
  usePageTitle();
  const { data } = useAsync(async () => {
    const [all, categories] = await Promise.all([photoService.listPhotos(), photoService.listCategories()]);
    const byId = new Map(all.map((p) => [p.id, p]));
    return {
      byId,
      // The hero painting hangs first (left wall, nearest the entrance) so it can fly into place.
      paintings: [
        ...all.filter((p) => p.id === FEATURE_ID),
        ...all.filter((p) => p.category === 'paintings' && p.id !== FEATURE_ID),
      ],
      categories: categories.map((c) => ({
        category: c,
        cover: byId.get(c.coverId),
        count: all.filter((p) => p.category === c.id).length,
      })),
    };
  }, []);

  return (
    <>
      <Hero feature={data?.byId.get(FEATURE_ID)} hallPhotos={data?.paintings ?? []} />


      {/* Directly under the hero: the hero painting flies down into this hall. */}
      <div>
        <CategoryHall
          id="hall"
          photos={data?.paintings ?? []}
          label="The Gallery"
          // The hero painting lands on the left wall; keep the title card clear of it.
          introClassName="md:translate-x-[9vw]"
          eyebrow="Walk the gallery"
          title={
            <>
              The <em>Gallery</em>
            </>
          }
          description="Ten paintings hung along a quiet hall. Step inside and scroll to walk."
        />
      </div>

      <section aria-labelledby="departments-heading" className="container-page mt-28 md:mt-40">
        <SectionHeading
          id="departments-heading"
          eyebrow="Artworks"
          title="Five departments"
          action={
            <Link to="/artworks" className="group inline-flex items-center gap-2 pb-2 text-sm text-ink-soft hover:text-ink">
              All artworks
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />
        <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {data?.categories.map(({ category, cover, count }, i) => (
            <CategoryCard
              key={category.id}
              category={category}
              cover={category.id === 'paintings' ? data.byId.get(OUT_ID) : cover}
              count={count}
              index={i}
              // Its painting arrives by flight from the hall instead of swinging in.
              still={category.id === 'paintings'}
            />
          ))}
        </div>
      </section>

      {data && <OutOfHall photo={data.byId.get(OUT_ID)} hallPhotos={data.paintings} />}

      <Statement />

      <section aria-labelledby="news-heading" className="container-page">
        <SectionHeading
          id="news-heading"
          eyebrow="News & Updates"
          title="From the gallery"
          action={
            <Link to="/news" className="group inline-flex items-center gap-2 pb-2 text-sm text-ink-soft hover:text-ink">
              All news
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          }
        />
        <div className="grid gap-x-6 gap-y-14 md:grid-cols-3">
          {news.slice(0, 3).map((post, i) => (
            <NewsCard key={post.slug} post={post} cover={data?.byId.get(post.coverId)} index={i} />
          ))}
        </div>
      </section>

      <InquiryBanner />
    </>
  );
}

/** Intro with a framed painting that tilts toward the pointer, then flies into the hall. */
function Hero({ feature, hallPhotos }: { feature?: Photo; hallPhotos: Photo[] }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateY = useSpring(useTransform(px, [-1, 1], [-10, 10]), { stiffness: 80, damping: 18 });
  const rotateX = useSpring(useTransform(py, [-1, 1], [8, -8]), { stiffness: 80, damping: 18 });
  const anchorRef = useRef<HTMLDivElement>(null);
  const flight = useMotionValue(0);
  // Flight 1: hero → the hall's first frame (left wall), landing as the hall reaches the top.
  const intoHallRange = useCallback((): [number, number] | null => {
    const hall = document.getElementById('hall');
    return hall ? [0, hall.getBoundingClientRect().top + window.scrollY] : null;
  }, []);
  const fromHero = useCallback(() => (anchorRef.current ? elementPose(anchorRef.current, 0, 1, 'height') : null), []);
  const toHall = useCallback(
    () => hallFramePose(hallPhotos, 0, document.getElementById('hall')?.getBoundingClientRect().top ?? 0),
    [hallPhotos],
  );

  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease, delay },
  });

  return (
    <section
      ref={ref}
      onPointerMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        px.set(((e.clientX - r.left) / r.width) * 2 - 1);
        py.set(((e.clientY - r.top) / r.height) * 2 - 1);
      }}
      className="container-page grid min-h-[calc(100svh-4rem)] items-center gap-12 py-12 lg:grid-cols-[1.15fr_1fr]"
    >
      <div>
        <motion.p {...rise(0.05)} className="eyebrow">
          {site.name} · {site.tagline}
        </motion.p>
        <h1 className="display mt-5 text-[clamp(3.25rem,8.5vw,8.5rem)]">
          {['Art,', 'made', 'by hand.'].map((word, i) => (
            <span key={word} className="inline-block overflow-hidden pb-[0.08em] align-bottom">
              <motion.span
                className={`inline-block ${i === 1 ? 'italic' : ''}`}
                initial={reduce ? false : { y: '105%' }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, ease, delay: 0.15 + i * 0.09 }}
              >
                {word}
              </motion.span>
              {i < 2 && ' '}
            </span>
          ))}
        </h1>
        <motion.p {...rise(0.5)} className="mt-6 max-w-lg text-base text-ink-soft md:text-lg">
          Paintings, drawings, prints, ceramics and photography — each one made by a human hand, and every room
          one you can walk through.
        </motion.p>
        <motion.div {...rise(0.65)} className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/artworks"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 text-sm text-paper transition-colors hover:bg-ink-soft"
          >
            Explore artworks
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(ENTER_HALL_EVENT))}
            className="rounded-full border border-line px-7 py-3.5 text-sm transition-colors hover:border-ink"
          >
            Walk the Gallery
          </button>
        </motion.div>
      </div>

      {feature && (
        <figure className="mx-auto w-full max-w-md [perspective:1200px]">
          {reduce ? (
            <FramedArtwork photo={feature} />
          ) : (
            <>
              {/* Holds the painting's place; the visible copy flies (see FlyingPainting). */}
              <div ref={anchorRef} className="invisible">
                <FramedArtwork photo={feature} />
              </div>
              {hallPhotos.length > 0 && (
                <Flight
                  photo={feature}
                  appear="shown"
                  range={intoHallRange}
                  from={fromHero}
                  to={toHall}
                  tiltX={rotateX}
                  tiltY={rotateY}
                  progress={flight}
                />
              )}
            </>
          )}
          <Caption feature={feature} flight={flight} />
        </figure>
      )}
    </section>
  );
}

/** Fades away as the painting leaves for the hall. */
function Caption({ feature, flight }: { feature: Photo; flight: MotionValue<number> }) {
  const opacity = useTransform(flight, [0, 0.25], [1, 0]);
  return (
    <motion.figcaption style={{ opacity }} className="mt-5 text-center">
      <p className="display text-2xl">{feature.title}</p>
      <p className="mt-1 text-xs text-ink-mute">
        {feature.author} · {feature.date ?? feature.year} · {feature.medium}
      </p>
      <p className="eyebrow mt-4">Scroll — it’s waiting for you in the hall</p>
    </motion.figcaption>
  );
}

function InquiryBanner() {
  return (
    <section className="container-page mt-28 md:mt-40">
      <div className="relative overflow-hidden rounded-sm border border-line bg-paper-2 px-6 py-16 md:px-16 md:py-20">
        <div className="pointer-events-none absolute -top-24 right-0 h-64 w-2/3 bg-[radial-gradient(ellipse_at_top_right,rgba(212,163,115,0.18),transparent_70%)]" />
        <p className="eyebrow">Contact</p>
        <h2 className="display mt-4 max-w-3xl text-5xl md:text-7xl">Purchases, commissions &amp; visits</h2>
        <p className="mt-6 max-w-lg text-ink-soft">
          Interested in a work, a commission or a private viewing? Send us an inquiry and we’ll get back to you.
        </p>
        <Link
          to="/contact#inquiry"
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper transition-colors hover:bg-ink-soft"
        >
          Send an inquiry
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}

const coverEl = () => document.querySelector<HTMLElement>('[data-category-cover="paintings"]');

/** Scroll position at which the Paintings card cover sits centred in the viewport. */
function coverCentredAt(cover: HTMLElement) {
  const r = cover.getBoundingClientRect();
  return r.top + window.scrollY + r.height / 2 - window.innerHeight / 2;
}

/**
 * Flight 2: as you scroll on from the hall, a painting lifts off the hall's right wall,
 * turns to face you and settles into the Paintings card below, whose cover then appears.
 */
function OutOfHall({ photo, hallPhotos }: { photo?: Photo; hallPhotos: Photo[] }) {
  const reduce = useReducedMotion();
  const landing = useMotionValue(0);
  const index = hallPhotos.findIndex((p) => p.id === OUT_ID);

  const range = useCallback((): [number, number] | null => {
    const hall = document.getElementById('hall');
    const cover = coverEl();
    if (!hall || !cover) return null;
    // Starts when the hall's last screen fills the viewport.
    const hallEnd = hall.getBoundingClientRect().bottom + window.scrollY - window.innerHeight;
    return [hallEnd, coverCentredAt(cover)];
  }, []);

  const from = useCallback((): ScreenPose | null => {
    const hall = document.getElementById('hall');
    // From the entrance view (hall not entered) the painting's exact spot is known;
    // after a walk, rise from the middle of the hall instead.
    if (hall && hall.offsetHeight <= window.innerHeight * 1.5) {
      return hallFramePose(hallPhotos, index, hall.getBoundingClientRect().bottom - window.innerHeight);
    }
    return { x: window.innerWidth / 2, y: window.innerHeight * 0.45, height: window.innerHeight * 0.28, turn: 0, perspective: 1200, brightness: 0.8 };
  }, [hallPhotos, index]);

  const to = useCallback((frameAspect: number) => {
    const cover = coverEl();
    // Same frame proportions on both ends, so land exactly on the card's frame.
    return cover ? elementPose(cover, window.scrollY, frameAspect, 'height') : null;
  }, []);

  // The card's cover waits, empty, until the painting arrives.
  useEffect(() => {
    if (reduce) return;
    const show = (p: number) => {
      const c = coverEl();
      if (!c) return;
      c.style.transition = 'opacity 0.25s';
      c.style.opacity = String(Math.min(Math.max((p - 0.86) / 0.14, 0), 1));
    };
    show(landing.get());
    const off = landing.on('change', show);
    return () => {
      off();
      const c = coverEl();
      if (c) c.style.opacity = '';
    };
  }, [landing, reduce]);

  if (reduce || !photo || index < 0) return null;
  return <Flight photo={photo} appear="fade-in" range={range} from={from} to={to} progress={landing} />;
}
