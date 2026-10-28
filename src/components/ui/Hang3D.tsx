import { useRef, type ReactNode } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

interface Hang3DProps {
  children: ReactNode;
  /** Alternates the swing direction so neighbours don't all turn the same way. */
  index?: number;
  className?: string;
}

/**
 * Scroll-linked "hanging" motion: as a framed work scrolls into view it swings in from a
 * tilted, turned, set-back pose and settles flat on the wall. Scrubbed by scroll, so it
 * reverses when scrolling back up.
 */
export function Hang3D({ children, index = 0, className = '' }: Hang3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // From the moment the item's top enters the viewport until it reaches ~60% height.
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 60%'] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const swing = index % 2 === 0 ? 1 : -1;

  const rotateX = useTransform(p, [0, 1], [24, 0]);
  const rotateY = useTransform(p, [0, 1], [swing * 26, 0]);
  const rotateZ = useTransform(p, [0, 1], [swing * -3, 0]);
  const y = useTransform(p, [0, 1], [120, 0]);
  const scale = useTransform(p, [0, 1], [0.84, 1]);
  const opacity = useTransform(p, [0, 0.45], [0, 1]);

  return (
    // The outer box stays put so scroll measurement isn't affected by the motion.
    <div ref={ref} className={className}>
      <motion.div
        style={
          reduce
            ? undefined
            : { rotateX, rotateY, rotateZ, y, scale, opacity, transformPerspective: 1100, transformOrigin: '50% 0%' }
        }
      >
        {children}
      </motion.div>
    </div>
  );
}
