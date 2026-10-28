import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const TEXT =
  'Every work here was made by a human hand — a brush loaded with paint, a pen dragged across paper, clay turned on a wheel, a shutter opened at the right moment. We hang them so you can look slowly.';

/** Words brighten one by one as the section scrolls through the viewport. */
export function Statement() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.fromTo(
          '[data-word]',
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: ref.current, start: 'top 75%', end: 'bottom 45%', scrub: 0.6 },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className="container-page py-28 md:py-40">
      <p className="eyebrow mb-8">Approach</p>
      <p className="display max-w-5xl text-[clamp(2rem,5vw,4.25rem)] leading-[1.08]">
        {TEXT.split(' ').map((word, i) => (
          <span key={i} data-word className="inline-block">
            {word}&nbsp;
          </span>
        ))}
      </p>
    </section>
  );
}
