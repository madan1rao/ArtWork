import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { supportsWebGL } from '@/lib/webgl';
import { useLightbox } from '@/hooks/useLightbox';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Lightbox } from '@/components/lightbox/Lightbox';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CloseIcon,
  RestartIcon,
  ZoomInIcon,
} from '@/components/ui/Icons';
import { dateLabel, type Photo } from '@/types/photo';
import { buildLayout, sampleWalk } from './layout';

const WalkScene = lazy(() => import('./WalkScene'));

const ease = [0.16, 1, 0.3, 1] as const;
/** Scroll distance per stop, in viewport heights. */
const VH_PER_STOP = 70;
/** Fired (e.g. by the header's "Walk" link) to open the hall and go to its entrance. */
export const ENTER_HALL_EVENT = 'lumen:enter-hall';

interface WalkthroughProps {
  photos: Photo[];
  /** Rendered instead when WebGL is unavailable, motion is reduced, or the scene fails. */
  fallback: ReactNode;
  /** Title card shown at the entrance; fades as you start scrolling. */
  intro?: ReactNode;
  /** Extra classes for the entrance title card (title + "Enter the hall"). */
  introClassName?: string;
  /** Name of the hall, shown top-left. */
  label?: string;
  /** When set, shows a "back to main hall" control. */
  onExit?: () => void;
  /** Changing this (to > 0) opens the hall so scrolling walks through it. */
  enterKey?: number;
  id?: string;
}

/**
 * A dark gallery hall with the photos hung on both walls. It's a single screen until
 * the visitor clicks "Enter the hall"; then the section grows so scrolling walks
 * through it (sticky canvas, height = length of the walk). Nothing moves on its own.
 */
export function Walkthrough({ fallback, id, ...props }: WalkthroughProps) {
  const reduce = useReducedMotion();
  if (reduce || !supportsWebGL()) return <div id={id}>{fallback}</div>;
  return (
    <ErrorBoundary fallback={<div id={id}>{fallback}</div>}>
      <Hall id={id} {...props} />
    </ErrorBoundary>
  );
}

function Hall({ photos, intro, introClassName = '', label, onExit, enterKey = 0, id }: Omit<WalkthroughProps, 'fallback'>) {
  const sectionRef = useRef<HTMLElement>(null);
  const layout = useMemo(() => buildLayout(photos), [photos]);
  const { frames } = layout;
  const segments = layout.stops.length - 1;
  const lightbox = useLightbox(photos, 'walk');
  const highQuality = useMediaQuery('(min-width: 768px) and (hover: hover)');

  const [entered, setEntered] = useState(false);
  const enteredRef = useRef(false);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  // Until the visitor clicks in, the camera stays at the entrance whatever the scroll.
  const walkProgress = useTransform(scrollYProgress, (p) => (enteredRef.current ? p : 0));
  const [active, setActive] = useState(-1);
  const [stop, setStop] = useState(0);
  const [inHall, setInHall] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [atEntrance, setAtEntrance] = useState(true);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  const sync = useCallback(
    (p: number) => {
      const s = sampleWalk(layout, p);
      setActive(s.active);
      setStop(s.stop);
      setAtEnd(p > 0.985);
      setAtEntrance(p < 0.025);
      setInHall(p > 0 && p < 1);
    },
    [layout],
  );
  useMotionValueEvent(walkProgress, 'change', sync);
  useEffect(() => sync(walkProgress.get()), [sync, walkProgress, entered]);

  /** Page scroll position at which the camera stands at stop `i` (0 = entrance). */
  const stopY = useCallback(
    (i: number) => {
      const el = sectionRef.current;
      if (!el) return window.scrollY;
      const target = Math.min(Math.max(i, 0), segments);
      const top = el.getBoundingClientRect().top + window.scrollY;
      const range = el.offsetHeight - window.innerHeight;
      return top + (target / segments) * range;
    },
    [segments],
  );

  /** Scrolls the page so the camera lands on stop `i` (0 = entrance, last = end wall). */
  const goToStop = useCallback((i: number) => window.scrollTo({ top: stopY(i), behavior: 'smooth' }), [stopY]);

  // When scrolling comes to rest close to a work, settle onto it so the view is square-on
  // and the label is clear — like stopping in front of a painting. Only small nudges.
  const settleTimer = useRef<number>(undefined);
  useMotionValueEvent(walkProgress, 'change', (p) => {
    window.clearTimeout(settleTimer.current);
    if (!enteredRef.current || p <= 0 || p >= 1) return;
    settleTimer.current = window.setTimeout(() => {
      const t = walkProgress.get() * segments;
      const nearest = Math.round(t);
      const off = Math.abs(t - nearest);
      if (nearest > 0 && nearest < segments && off > 0.01 && off < 0.3) goToStop(nearest);
    }, 220);
  });
  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  // ---- Entering / leaving: the hall is one screen until the visitor clicks in. ----
  const seenSinceEnter = useRef(false);

  const enter = useCallback(() => {
    seenSinceEnter.current = false;
    enteredRef.current = true;
    setEntered(true);
    requestAnimationFrame(() => {
      const el = sectionRef.current;
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' });
    });
  }, [enteredRef]);

  /** Collapses the hall back to one screen without making the page jump. */
  const leave = useCallback(
    (continueDown: boolean) => {
      const el = sectionRef.current;
      if (!el) return;
      const above = el.getBoundingClientRect().bottom <= 0;
      const before = el.offsetHeight;
      enteredRef.current = false;
      flushSync(() => setEntered(false));
      sync(0);
      if (above) window.scrollBy(0, -(before - el.offsetHeight));
      if (continueDown) {
        const bottom = el.getBoundingClientRect().bottom + window.scrollY;
        window.scrollTo({ top: bottom - 64, behavior: 'smooth' });
      }
    },
    [enteredRef, sync],
  );

  // Close the hall again once it's been scrolled out of view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !entered) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) seenSinceEnter.current = true;
      else if (seenSinceEnter.current) leave(false);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [entered, leave]);

  // A collection click or the header's "Walk" link opens the hall.
  useEffect(() => {
    if (enterKey > 0) enter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterKey]);

  useEffect(() => {
    window.addEventListener(ENTER_HALL_EVENT, enter);
    return () => window.removeEventListener(ENTER_HALL_EVENT, enter);
  }, [enter]);

  // ← / → step between photographs while the hall fills the screen; Enter opens one.
  const lightboxOpen = lightbox.index >= 0;
  useEffect(() => {
    if (!entered || !inHall || lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'ArrowRight') goToStop(stop + 1);
      else if (e.key === 'ArrowLeft') goToStop(stop - 1);
      else if (e.key === 'Enter' && active >= 0) lightbox.open(frames[active].photo.id);
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [entered, inHall, lightboxOpen, stop, active, frames, goToStop, lightbox]);

  const frame = active >= 0 ? frames[active] : undefined;
  const height = entered ? `${segments * VH_PER_STOP + 100}vh` : '100svh';

  return (
    // The hall is a lit room: always dark, whatever the page theme.
    <section
      ref={sectionRef}
      id={id}
      data-theme="dark"
      style={{ height }}
      className="relative text-ink"
      aria-label="Gallery walk-through"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-paper">
        <Suspense fallback={null}>
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: ready ? 1 : 0 }}
            transition={{ duration: 1.6, ease }}
          >
            <WalkScene
              layout={layout}
              progress={walkProgress}
              onFrame={(i) => lightbox.open(frames[i].photo.id)}
              onReady={onReady}
              highQuality={highQuality}
            />
          </motion.div>
        </Suspense>

        {/* Vignette keeps overlay text legible and focuses the eye down the hall. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.6)_100%)]" />

        <AnimatePresence>
          {!ready && (
            <motion.p key="loading" exit={{ opacity: 0 }} className="eyebrow absolute inset-x-0 bottom-10 text-center" role="status">
              Hanging the photographs…
            </motion.p>
          )}
        </AnimatePresence>

        {/* Entrance title + scroll hint: only while standing at the entrance */}
        <AnimatePresence>
          {atEntrance && intro && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.6, ease }}
              className="pointer-events-none absolute inset-0 grid place-items-center px-5 text-center"
            >
              <div className={introClassName}>
                {intro}
                {ready && !entered && (
                  <button
                    type="button"
                    onClick={enter}
                    className="group pointer-events-auto mt-10 inline-flex items-center gap-2.5 rounded-full bg-ink px-7 py-3.5 text-sm text-paper transition-colors hover:bg-ink-soft"
                  >
                    Enter the hall
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
          {atEntrance && ready && entered && (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3"
            >
              <span className="eyebrow">Scroll to walk · drag to look around</span>
              <span className="relative h-10 w-px overflow-hidden bg-line">
                <motion.span
                  className="absolute inset-x-0 top-0 h-1/2 bg-ink"
                  animate={{ y: ['-100%', '200%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hall name */}
        <div className="absolute top-24 left-5 flex flex-wrap items-center gap-2 md:left-10">
          {label && (
            <span className="rounded-full border border-line bg-paper/50 px-3 py-1.5 text-xs text-ink-soft backdrop-blur">
              {label} · {frames.length} works
            </span>
          )}
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-paper/50 px-3 py-1.5 text-xs backdrop-blur transition-colors hover:border-ink"
            >
              <ChevronLeft size={14} />
              Back to main hall
            </button>
          )}
        </div>

        {/* Wall label for the work you're facing. The camera composes the work toward its own
            wall, so the label takes the opposite side (left-wall work → label on the right,
            above the controls); on phones the work sits high and the label below it. */}
        <div
          className={`pointer-events-none absolute inset-x-5 bottom-24 md:inset-x-auto ${
            frame?.side === -1 ? 'md:right-10 md:bottom-28' : 'md:bottom-10 md:left-10'
          }`}
        >
          <AnimatePresence mode="wait">
            {frame && (
              <motion.div
                key={frame.photo.id}
                initial={{ opacity: 0, y: 24, rotateX: -20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease, delay: 0.2 }}
                style={{ transformPerspective: 800, transformOrigin: frame.side === -1 ? 'bottom right' : 'bottom left' }}
                className="pointer-events-auto rounded-sm border border-line bg-paper/75 p-4 backdrop-blur-xl md:w-[min(22rem,27vw)] md:p-5"
              >
                <p className="text-xs tracking-[0.2em] text-ink-mute tabular-nums">
                  {String(active + 1).padStart(2, '0')} / {String(frames.length).padStart(2, '0')}
                </p>
                <h3 className="display mt-1.5 text-3xl leading-[1.05] md:mt-2 md:text-4xl">{frame.photo.title}</h3>
                <p className="mt-1 text-sm text-ink-soft">
                  {frame.photo.author} · {frame.photo.location}
                </p>
                <p className="mt-0.5 text-xs text-ink-mute">
                  {dateLabel(frame.photo)}
                  {frame.photo.medium && ` · ${frame.photo.medium}`}
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => lightbox.open(frame.photo.id)}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-xs text-paper hover:bg-ink-soft"
                  >
                    <ZoomInIcon size={14} />
                    View full size
                  </button>
                  <FavoriteButton photoId={frame.photo.id} title={frame.photo.title} variant="dark" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* End of the hall */}
        <AnimatePresence>
          {atEnd && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease }}
              className="absolute inset-0 grid place-items-center px-5 text-center"
            >
              <div>
                <p className="eyebrow">End of the hall</p>
                <p className="display mt-4 text-5xl md:text-7xl">Keep looking.</p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => leave(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm text-paper hover:bg-ink-soft"
                  >
                    Leave the hall
                    <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStop(0)}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm hover:border-ink"
                  >
                    <RestartIcon size={16} />
                    Walk again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map + controls (they scroll the page; nothing moves on its own) */}
        {ready && entered && stop > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 md:inset-x-auto md:right-10 md:bottom-10"
          >
            <HallMap sides={frames.map((f) => f.side)} active={active} progress={walkProgress} onSelect={(i) => goToStop(i + 1)} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => leave(true)}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-paper/50 px-4 text-xs backdrop-blur transition-colors hover:border-ink"
              >
                <CloseIcon size={15} />
                <span className="hidden sm:inline">Leave the hall</span>
              </button>
              <WalkButton label="Back to the entrance" onClick={() => goToStop(0)}>
                <RestartIcon size={17} />
              </WalkButton>
              <WalkButton label="Previous photograph" onClick={() => goToStop(stop - 1)}>
                <ChevronLeft size={18} />
              </WalkButton>
              <WalkButton label="Next photograph" onClick={() => goToStop(stop + 1)} disabled={stop >= segments}>
                <ChevronRight size={18} />
              </WalkButton>
            </div>
          </motion.div>
        )}
      </div>

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
    </section>
  );
}

/** Top-down strip of the hall: left-wall frames above the line, right-wall below. */
function HallMap({
  sides,
  active,
  progress,
  onSelect,
}: {
  sides: (-1 | 1)[];
  active: number;
  progress: MotionValue<number>;
  onSelect: (i: number) => void;
}) {
  const youAt = useTransform(progress, (p) => `${p * 100}%`);
  return (
    <div className="relative h-11 w-full max-w-[260px] rounded-full border border-line bg-paper/50 px-4 backdrop-blur md:w-[260px]">
      <div className="absolute inset-x-4 top-1/2 h-px bg-line" />
      <div className="absolute inset-x-4 inset-y-0">
        {sides.map((side, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to photograph ${i + 1}`}
            onClick={() => onSelect(i)}
            style={{ left: `${((i + 1) / (sides.length + 1)) * 100}%` }}
            className={`absolute h-3 w-1.5 -translate-x-1/2 rounded-[1px] transition-colors ${
              side === -1 ? 'top-2' : 'bottom-2'
            } ${active === i ? 'bg-accent' : 'bg-ink-mute hover:bg-ink'}`}
          />
        ))}
        <motion.span
          aria-hidden="true"
          style={{ left: youAt }}
          className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink shadow-[0_0_0_4px_rgba(242,238,232,0.15)]"
        />
      </div>
    </div>
  );
}

function WalkButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-11 place-items-center rounded-full border border-line bg-paper/50 backdrop-blur transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-35"
    >
      {children}
    </button>
  );
}
