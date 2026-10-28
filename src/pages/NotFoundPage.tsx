import { Link } from 'react-router-dom';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Not found');
  return (
    <section className="container-page grid min-h-[60dvh] place-items-center text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="display mt-4 text-[clamp(3rem,10vw,8rem)]">
          Out of <em>frame</em>
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-ink-soft">The page you’re looking for isn’t here.</p>
        <Link to="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 text-sm text-paper hover:bg-ink-soft">
          Back home
        </Link>
      </div>
    </section>
  );
}
