import { Link } from 'react-router-dom';
import { NAV, site } from '@/config/site';

export function Footer() {
  return (
    <footer className="mt-28 border-t border-line">
      <div className="container-page grid grid-cols-2 gap-x-8 gap-y-10 py-14 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:gap-12">
        <div className="col-span-2 lg:col-span-1">
          <p className="display text-4xl">{site.name}</p>
          <p className="eyebrow mt-2">{site.tagline}</p>
          <p className="mt-5 max-w-xs text-sm text-ink-soft">
            Paintings, drawings, prints, ceramics and photography — shown in a gallery you can walk through.
          </p>
        </div>
        {NAV.filter((n) => n.to !== '/').map((group) => (
          <nav key={group.label} aria-label={group.label}>
            <Link to={group.to} className="eyebrow hover:text-ink">
              {group.label}
            </Link>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {(group.children ?? [{ label: group.label, to: group.to }]).map((c) => (
                <li key={c.to}>
                  <Link to={c.to} className="hover:text-ink">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="container-page flex flex-col gap-2 border-t border-line py-6 text-xs text-ink-mute md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p className="max-w-xl md:text-right">
          Paintings, drawings, prints and ceramics shown are public-domain works (via Wikimedia Commons, The Met and
          Honolulu Museum of Art open access). Photographs via Unsplash.
        </p>
      </div>
    </footer>
  );
}
