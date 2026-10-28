import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';

const ease = [0.16, 1, 0.3, 1] as const;

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  /** Trail of parent pages, e.g. [{ label: 'Artworks', to: '/artworks' }]. */
  crumbs?: { label: string; to: string }[];
}

/** Title block at the top of each page. */
export function PageHeader({ eyebrow, title, children, crumbs }: PageHeaderProps) {
  const reduce = useReducedMotion();
  return (
    <header className="container-page pt-12 pb-12 md:pt-20 md:pb-16">
      {crumbs && (
        <nav aria-label="Breadcrumb" className="mb-8 text-xs text-ink-mute">
          {crumbs.map((c) => (
            <span key={c.to}>
              <Link to={c.to} className="hover:text-ink">
                {c.label}
              </Link>
              <span className="mx-2">/</span>
            </span>
          ))}
        </nav>
      )}
      <motion.p
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="eyebrow"
      >
        {eyebrow}
      </motion.p>
      <h1 className="display mt-4 text-[clamp(3rem,9vw,7.5rem)]">
        <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: '105%' }}
            animate={{ y: 0 }}
            transition={{ duration: 1, ease, delay: 0.05 }}
          >
            {title}
          </motion.span>
        </span>
      </h1>
      {children && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease, delay: 0.25 }}
          className="mt-6 max-w-2xl text-ink-soft md:text-lg"
        >
          {children}
        </motion.div>
      )}
    </header>
  );
}

/** Heading for a section inside a page. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
  action,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="display mt-3 text-5xl md:text-7xl">
          {title}
        </h2>
        {children && <div className="mt-5 max-w-xl text-ink-soft md:text-lg">{children}</div>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-sm border border-dashed border-line px-6 py-20 text-center">
      <p className="display text-3xl">{title}</p>
      {children && <div className="mx-auto mt-3 max-w-sm text-sm text-ink-soft">{children}</div>}
    </div>
  );
}
