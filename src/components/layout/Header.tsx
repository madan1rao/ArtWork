import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useFavorites } from '@/context/FavoritesContext';
import { CloseIcon, HeartIcon, MenuIcon, MoonIcon, SunIcon } from '@/components/ui/Icons';
import { useTheme } from '@/hooks/useTheme';
import { NAV, site, type NavItem } from '@/config/site';

const ease = [0.16, 1, 0.3, 1] as const;

/** Section is "active" when the current path is inside it. */
function isActive(item: NavItem, pathname: string) {
  if (item.to === '/') return pathname === '/';
  const root = '/' + item.to.split('/')[1];
  return pathname === root || pathname.startsWith(root + '/');
}

export function Header() {
  const { ids } = useFavorites();
  const { pathname, hash } = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => setOpen(false), [pathname, hash]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-[background-color,border-color] duration-300 ${
        scrolled || open ? 'border-b border-line bg-paper/85 backdrop-blur-lg' : 'border-b border-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link to="/" className="flex items-baseline gap-2" aria-label={`${site.name} — home`}>
          <span className="display text-[1.6rem] leading-none">{site.name}</span>
          <span className="eyebrow hidden sm:inline">{site.tagline}</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) =>
            item.children ? (
              <Dropdown key={item.label} item={item} active={isActive(item, pathname)} />
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive: a }) =>
                  `rounded-full px-3.5 py-2 text-sm transition-colors hover:text-ink ${a ? 'text-ink' : 'text-ink-soft'}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
          <FavoritesLink count={ids.length} />
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <FavoritesLink count={ids.length} />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-10 place-items-center rounded-full hover:bg-paper-2"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Primary"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
            className="max-h-[calc(100dvh-4rem)] overflow-y-auto lg:hidden"
          >
            <ul className="container-page flex flex-col pb-8">
              {NAV.map((item) => (
                <MobileItem key={item.label} item={item} active={isActive(item, pathname)} />
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

function Dropdown({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number>(undefined);

  const show = () => {
    window.clearTimeout(closeTimer.current);
    setOpen(true);
  };
  // A short delay lets the pointer travel from the trigger into the menu.
  const hide = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onPointerEnter={(e) => e.pointerType === 'mouse' && show()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && hide()}
      onBlur={(e) => !ref.current?.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm transition-colors hover:text-ink ${
          active || open ? 'text-ink' : 'text-ink-soft'
        }`}
      >
        {item.label}
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, rotateX: -12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.28, ease }}
            style={{ transformPerspective: 700, transformOrigin: 'top center' }}
            className="absolute top-full left-1/2 z-50 mt-2 min-w-56 -translate-x-1/2 rounded-sm border border-line bg-paper-2/95 p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <ul>
              {item.children!.map((child) => (
                <li key={child.to}>
                  <Link
                    to={child.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-sm px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-paper hover:text-ink"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
              <li className="mt-1 border-t border-line pt-1">
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-sm px-3 py-2 text-xs text-ink-mute transition-colors hover:text-ink"
                >
                  All of {item.label} →
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileItem({ item, active }: { item: NavItem; active: boolean }) {
  const [expanded, setExpanded] = useState(active);
  const base = `display block py-4 text-4xl ${active ? 'text-ink' : 'text-ink-soft'}`;

  if (!item.children) {
    return (
      <li className="border-b border-line">
        <Link to={item.to} className={base}>
          {item.label}
        </Link>
      </li>
    );
  }
  return (
    <li className="border-b border-line">
      <button
        type="button"
        onClick={() => setExpanded((x) => !x)}
        aria-expanded={expanded}
        className={`${base} flex w-full items-center justify-between text-left`}
      >
        {item.label}
        <span className={`text-2xl transition-transform ${expanded ? 'rotate-45' : ''}`}>+</span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            {[{ label: `All of ${item.label}`, to: item.to }, ...item.children].map((child) => (
              <li key={child.label}>
                <Link to={child.to} className="block py-2.5 pl-1 text-base text-ink-soft hover:text-ink">
                  {child.label}
                </Link>
              </li>
            ))}
            <li className="h-3" />
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="relative grid size-10 place-items-center overflow-hidden rounded-full text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, rotate: -90, opacity: 0 }}
          animate={{ y: 0, rotate: 0, opacity: 1 }}
          exit={{ y: -14, rotate: 90, opacity: 0 }}
          transition={{ duration: 0.3, ease }}
        >
          {theme === 'dark' ? <SunIcon size={19} /> : <MoonIcon size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

function FavoritesLink({ count }: { count: number }) {
  return (
    <NavLink
      to="/favorites"
      aria-label={`Saved artworks (${count})`}
      className={({ isActive: a }) =>
        `relative grid size-10 place-items-center rounded-full transition-colors hover:bg-paper-2 ${a ? 'text-ink' : 'text-ink-soft'}`
      }
    >
      <HeartIcon size={19} filled={count > 0} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute top-1 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[10px] font-medium text-paper"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </NavLink>
  );
}
