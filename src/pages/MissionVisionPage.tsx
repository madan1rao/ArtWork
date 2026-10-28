import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { usePageTitle } from '@/hooks/usePageTitle';
import { site } from '@/config/site';
import { PageHeader } from '@/components/ui/PageHeader';
import { Statement } from '@/components/home/Statement';
import { ArrowRight } from '@/components/ui/Icons';

const VALUES = [
  { title: 'Made by hand', body: 'We champion work that carries the mark of the person who made it — the brushstroke, the cut, the fingerprint in the clay.' },
  { title: 'Open to everyone', body: 'Art should not depend on a postcode. Our 3D halls put every room within reach of anyone with a screen.' },
  { title: 'Look slowly', body: 'We design for attention: fewer works, better light, and room to stand still in front of each one.' },
  { title: 'Honest provenance', body: 'Every work is shown with its artist, date, medium and source, so you always know what you are looking at.' },
];

export default function MissionVisionPage() {
  usePageTitle('Mission & Vision');
  const reduce = useReducedMotion();

  return (
    <>
      <PageHeader eyebrow="About · Mission & Vision" title={<>Mission &amp; <em>Vision</em></>} crumbs={[{ label: 'About', to: '/about/overview' }]}>
        Why {site.name} exists, and where we’re going.
      </PageHeader>

      <section className="container-page grid gap-6 md:grid-cols-2">
        {[
          {
            label: 'Our mission',
            text: 'To bring people face to face with art made by human hands — in our rooms and online — and to make looking closely feel natural, unhurried and open to all.',
          },
          {
            label: 'Our vision',
            text: 'A gallery without walls: every painting, drawing, print and pot one click and a few steps away, presented with the care of a real exhibition.',
          },
        ].map((card, i) => (
          <motion.article
            key={card.label}
            initial={reduce ? false : { opacity: 0, y: 40, rotateX: -12 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
            style={{ transformPerspective: 1200, transformOrigin: 'top center' }}
            className="rounded-sm border border-line bg-paper-2 p-8 md:p-12"
          >
            <p className="eyebrow text-accent!">{card.label}</p>
            <p className="display mt-5 text-3xl leading-[1.15] md:text-[2.6rem]">{card.text}</p>
          </motion.article>
        ))}
      </section>

      <Statement />

      <section className="container-page" aria-labelledby="values-heading">
        <p className="eyebrow">What guides us</p>
        <h2 id="values-heading" className="display mt-3 text-5xl md:text-7xl">
          Our values
        </h2>
        <ul className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {VALUES.map((v, i) => (
            <li key={v.title} className="border-t border-line pt-6">
              <span className="text-xs text-ink-mute tabular-nums">0{i + 1}</span>
              <h3 className="display mt-3 text-4xl">{v.title}</h3>
              <p className="mt-3 max-w-md text-ink-soft">{v.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-page mt-24">
        <Link
          to="/about/overview"
          className="group flex items-center justify-between gap-6 border-y border-line py-10 transition-colors hover:text-accent"
        >
          <span>
            <span className="eyebrow">Next</span>
            <span className="display mt-2 block text-5xl md:text-6xl">Company Overview</span>
          </span>
          <ArrowRight size={28} className="shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      </section>
    </>
  );
}
