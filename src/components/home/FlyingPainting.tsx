import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from 'framer-motion';
import { ArtFrame } from '@/components/ui/ArtFrame';
import { START_Z, WALL_X, buildLayout, fovFor } from '@/components/walkthrough/layout';
import type { Photo } from '@/types/photo';

/** The site-wide gallery frame, with its picture light, at hero size. */
export function FramedArtwork({ photo, glow = true }: { photo: Photo; glow?: boolean }) {
  return <ArtFrame photo={photo} glow={glow} priority sizes="(min-width: 1024px) 28rem, 90vw" />;
}

/** Where (in viewport pixels) and how a painting appears at one end of a flight. */
export interface ScreenPose {
  /** Centre. */
  x: number;
  y: number;
  /** On-screen height of the whole frame. */
  height: number;
  /** rotateY, degrees (how far the frame is turned away, as on a side wall). */
  turn: number;
  /** CSS perspective distance used with `turn`. */
  perspective: number;
  brightness: number;
}

/** A document element's resting pose, centred in its box (no turn). `fit` sizes the frame to contain it. */
export function elementPose(el: Element, scrollAt: number, frameAspect: number, fit: 'height' | 'contain'): ScreenPose {
  const r = el.getBoundingClientRect();
  const height = fit === 'height' ? r.height : Math.min(r.height, r.width / frameAspect);
  return {
    x: r.left + r.width / 2,
    y: r.top + window.scrollY - scrollAt + r.height / 2,
    height,
    turn: 0,
    perspective: 1200,
    brightness: 1,
  };
}

/**
 * Where the hall's camera, standing at the entrance, shows frame `index`, given where the
 * hall's (sticky) view currently starts in the viewport (`viewTop`). Mirrors the projection in the 3D scene, so a DOM copy
 * can hand over to (or take over from) the real 3D painting seamlessly.
 */
export function hallFramePose(hallPhotos: Photo[], index: number, viewTop = 0): ScreenPose | null {
  const frame = buildLayout(hallPhotos).frames[index];
  if (!frame) return null;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const aspect = vw / vh;
  const tanV = Math.tan((fovFor(aspect) * Math.PI) / 360);
  const dist = START_Z - frame.z;
  const cx = frame.side * (WALL_X - 0.04 - 0.063); // front of the canvas on its wall
  const outer = frame.h + 0.34; // moulding included
  const height = (outer / dist / tanV) * (vh / 2);
  const facing = 90 - (Math.atan2(Math.abs(cx), dist) * 180) / Math.PI;
  return {
    x: (vw / 2) * (1 + cx / dist / (tanV * aspect)),
    y: viewTop + (vh / 2) * (1 - 0.05 / dist / tanV),
    height,
    // Left-wall frames face right (their right edge recedes) and vice versa.
    turn: -frame.side * facing,
    // Perspective equivalent to the hall camera's at that depth.
    perspective: (dist * height) / outer,
    // Works you're not standing at sit in the hall's half-light.
    brightness: 0.58,
  };
}

interface FlightProps {
  photo: Photo;
  /** Scroll positions where the flight starts and lands; null to stay hidden. */
  range: () => [number, number] | null;
  /** Pose at the start / end of the range (viewport pixels). Gets the frame's width ÷ height. */
  from: (frameAspect: number) => ScreenPose | null;
  to: (frameAspect: number) => ScreenPose | null;
  /** Show the copy at the start (a DOM anchor it replaces) or fade it in (taking over from 3D). */
  appear: 'shown' | 'fade-in';
  /** Optional pointer tilt (degrees) applied near the start. */
  tiltX?: MotionValue<number>;
  tiltY?: MotionValue<number>;
  /** Receives flight progress 0–1. */
  progress?: MotionValue<number>;
}

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const smooth = (a: number, b: number, t: number) => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A framed painting that flies between two poses as the page scrolls — lifting, arcing
 * in 3D and turning — then fades out at the far end where the real thing takes over.
 * Scrolling back reverses it.
 */
export function Flight({ photo, range, from, to, appear, tiltX, tiltY, progress }: FlightProps) {
  const { scrollY } = useScroll();
  const box = useRef<HTMLDivElement>(null);
  const transform = useMotionValue('none');
  const opacity = useMotionValue(0);
  const filter = useMotionValue('none');
  const ready = useRef(false);

  const update = useCallback(() => {
    const el = box.current;
    const r = range();
    const frameAspect = el ? el.offsetWidth / (el.offsetHeight || 1) : 1;
    const a = from(frameAspect);
    const b = to(frameAspect);
    if (!el || !r || !a || !b || r[1] <= r[0]) {
      opacity.set(0);
      return;
    }
    const p = clamp01((window.scrollY - r[0]) / (r[1] - r[0]));
    progress?.set(p);

    const baseW = el.offsetWidth;
    const baseH = el.offsetHeight || 1;
    const e = easeInOut(p);
    const arc = Math.sin(Math.PI * p);
    const rest = 1 - p;
    const x = mix(a.x, b.x, e);
    const y = mix(a.y, b.y, e);
    const scale = mix(a.height, b.height, e) / baseH;
    // Turn mostly mid-flight, so it leaves/lands at the right angle.
    const turn = mix(a.turn, b.turn, smooth(0.15, 0.95, p));
    const tilt = { x: (tiltX?.get() ?? 0) * rest, y: (tiltY?.get() ?? 0) * rest };

    transform.set(
      `translate3d(${x - baseW / 2}px, ${y - baseH / 2}px, 0) ` +
        `perspective(${mix(a.perspective, b.perspective, e)}px) ` +
        `rotateY(${turn + tilt.y}deg) rotateX(${-14 * arc + tilt.x}deg) rotateZ(${3 * arc}deg) scale(${scale})`,
    );
    filter.set(`brightness(${mix(a.brightness, b.brightness, smooth(0.2, 0.9, p))})`);

    const fadeIn = appear === 'shown' ? 1 : smooth(0, 0.06, p);
    const fadeOut = p < 0.9 ? 1 : clamp01(1 - (p - 0.9) / 0.1);
    opacity.set(ready.current ? fadeIn * fadeOut : 0);
  }, [range, from, to, appear, tiltX, tiltY, progress, transform, opacity, filter]);

  useMotionValueEvent(scrollY, 'change', update);
  useEffect(() => tiltX?.on('change', update), [tiltX, update]);
  useEffect(() => tiltY?.on('change', update), [tiltY, update]);

  useLayoutEffect(() => {
    update();
    // Fade in once the page has laid out (fonts and the hall can shift positions).
    const t = window.setTimeout(() => {
      ready.current = true;
      update();
    }, 250);
    const ro = new ResizeObserver(update);
    ro.observe(document.body);
    window.addEventListener('resize', update);
    return () => {
      window.clearTimeout(t);
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [update]);

  // Portal to <body>: any ancestor with transform/perspective would otherwise become the
  // containing block for this fixed layer and throw its position off.
  return createPortal(
    <motion.div
      ref={box}
      aria-hidden="true"
      style={{ transform, opacity, filter, transformOrigin: '50% 50%' }}
      className="pointer-events-none fixed top-0 left-0 z-30 w-[28rem] max-w-[90vw] transition-opacity duration-200 will-change-transform"
    >
      <FramedArtwork photo={photo} />
    </motion.div>,
    document.body,
  );
}
