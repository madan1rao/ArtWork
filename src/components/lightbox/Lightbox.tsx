import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from 'framer-motion';
import { fallbackUrl, photoSrcSet, photoUrl } from '@/lib/image';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { ChevronLeft, ChevronRight, CloseIcon, ZoomInIcon, ZoomOutIcon } from '@/components/ui/Icons';
import { Link } from 'react-router-dom';
import { dateLabel, type Photo } from '@/types/photo';

interface LightboxProps {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const ZOOM = 2.25;
const SWIPE_DISTANCE = 80;
const SWIPE_VELOCITY = 500;

export function Lightbox({ photos, index, onClose, onNext, onPrev }: LightboxProps) {
  const photo = photos[index];
  const reduce = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoomed, setZoomed] = useState(false);
  const [direction, setDirection] = useState(0);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const panX = useMotionValue(0);
  const panY = useMotionValue(0);
  // A swipe or pan ends with a click event; ignore it so it doesn't close the viewer.
  const dragged = useRef(false);
  const markDragged = () => {
    dragged.current = true;
  };
  const clearDragged = () => {
    requestAnimationFrame(() => {
      dragged.current = false;
    });
  };

  const go = (delta: 1 | -1) => {
    setDirection(delta);
    if (delta > 0) onNext();
    else onPrev();
  };

  // Reset zoom and pan whenever the photo changes or zoom is turned off.
  useEffect(() => setZoomed(false), [photo.id]);
  useEffect(() => {
    if (!zoomed) {
      animate(panX, 0, { duration: 0.3 });
      animate(panY, 0, { duration: 0.3 });
    }
  }, [zoomed, panX, panY]);

  // Scroll lock + focus management.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setStage({ w: entry.contentRect.width, h: entry.contentRect.height }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Warm the cache for neighbours so stepping feels instant.
  useEffect(() => {
    if (photos.length < 2) return;
    [photos[(index + 1) % photos.length], photos[(index - 1 + photos.length) % photos.length]].forEach((p) => {
      const img = new Image();
      img.src = photoUrl(p, 1280, 80);
    });
  }, [index, photos]);

  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      if (zoomed) setZoomed(false);
      else onClose();
    } else if (e.key === 'ArrowRight' && !zoomed) go(1);
    else if (e.key === 'ArrowLeft' && !zoomed) go(-1);
    else if (e.key === 'Tab') trapFocus(e, dialogRef.current);
  };

  const panBounds = {
    left: (-stage.w * (ZOOM - 1)) / 2,
    right: (stage.w * (ZOOM - 1)) / 2,
    top: (-stage.h * (ZOOM - 1)) / 2,
    bottom: (stage.h * (ZOOM - 1)) / 2,
  };

  const slide = reduce ? 0 : 60;

  return createPortal(
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title} — photo ${index + 1} of ${photos.length}`}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#0e0d0c]/[0.97] text-white outline-none"
    >
      {/* Top bar */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 md:px-6">
        <p className="text-xs tracking-[0.2em] text-white/60 tabular-nums" aria-live="polite">
          {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
        </p>
        <div className="flex items-center gap-2">
          <IconButton label={zoomed ? 'Zoom out' : 'Zoom in'} onClick={() => setZoomed((z) => !z)}>
            {zoomed ? <ZoomOutIcon /> : <ZoomInIcon />}
          </IconButton>
          <FavoriteButton photoId={photo.id} title={photo.title} variant="dark" />
          <IconButton label="Close" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
      </div>

      {/* Stage */}
      <div ref={stageRef} className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={photo.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * slide }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -slide }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            drag={zoomed ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.5}
            onDragStart={markDragged}
            onDragEnd={(_, info) => {
              clearDragged();
              if (info.offset.x < -SWIPE_DISTANCE || info.velocity.x < -SWIPE_VELOCITY) go(1);
              else if (info.offset.x > SWIPE_DISTANCE || info.velocity.x > SWIPE_VELOCITY) go(-1);
            }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-2 md:px-20 md:py-4"
          >
            <motion.div
              style={{ x: panX, y: panY }}
              animate={{ scale: zoomed ? ZOOM : 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              drag={zoomed}
              dragConstraints={panBounds}
              dragElastic={0.08}
              onDragStart={markDragged}
              onDragEnd={clearDragged}
              onClick={(e) => {
                // Clicking the empty area around the photo closes the viewer.
                if (e.target === e.currentTarget && !zoomed && !dragged.current) onClose();
              }}
              onDoubleClick={() => setZoomed((z) => !z)}
              className={`pointer-events-auto flex h-full w-full items-center justify-center ${
                zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
              }`}
            >
              <LightboxImage photo={photo} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {photos.length > 1 && !zoomed && (
          <>
            <IconButton
              label="Previous photo"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-4 hidden -translate-y-1/2 md:grid"
            >
              <ChevronLeft size={22} />
            </IconButton>
            <IconButton
              label="Next photo"
              onClick={() => go(1)}
              className="absolute top-1/2 right-4 hidden -translate-y-1/2 md:grid"
            >
              <ChevronRight size={22} />
            </IconButton>
          </>
        )}
      </div>

      {/* Caption */}
      <div className="shrink-0 px-4 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:px-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-1 md:flex-row md:items-end md:justify-between md:gap-6">
          <div>
            <h2 className="display text-3xl md:text-4xl">{photo.title}</h2>
            <p className="mt-1 text-sm text-white/65">
              {photo.author} · {photo.location}
            </p>
          </div>
          <div className="text-xs text-white/45 md:text-right">
            <p>
              {dateLabel(photo)}
              {photo.medium && ` · ${photo.medium}`}
              {photo.camera && ` · ${photo.camera}`}
            </p>
            {photo.credit && <p className="mt-0.5 text-white/35">{photo.credit}</p>}
            <p className="mt-2">
              <Link
                to={`/contact?artwork=${encodeURIComponent(photo.id)}#inquiry`}
                className="text-white/70 underline underline-offset-4 hover:text-white"
              >
                Inquire about this work
              </Link>
              <span className="hidden md:inline"> · Double-click to zoom</span>
            </p>
          </div>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

function LightboxImage({ photo }: { photo: Photo }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      src={failed ? fallbackUrl(photo, 1600) : photoUrl(photo, 1280, 80)}
      srcSet={failed ? undefined : photoSrcSet(photo)}
      sizes="100vw"
      alt={`${photo.title} — ${photo.location}`}
      width={photo.width}
      height={photo.height}
      draggable={false}
      onLoad={() => setLoaded(true)}
      onError={() => !failed && setFailed(true)}
      className={`max-h-full max-w-full object-contain transition-opacity duration-500 select-none ${
        loaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
    />
  );
}

function IconButton({
  label,
  onClick,
  className = '',
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 ${className}`}
    >
      {children}
    </button>
  );
}

function trapFocus(e: ReactKeyboardEvent, root: HTMLElement | null) {
  if (!root) return;
  const focusable = Array.from(root.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex="0"]')).filter(
    (el) => el.offsetParent !== null,
  );
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && (document.activeElement === first || document.activeElement === root)) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}
