import { Link } from 'react-router-dom';
import { photoService } from '@/services/photoService';
import { useFavorites } from '@/context/FavoritesContext';
import { useAsync } from '@/hooks/useAsync';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader, EmptyState } from '@/components/ui/PageHeader';
import { PhotoGrid } from '@/components/gallery/PhotoGrid';
import { CategoryHall } from '@/components/artworks/CategoryHall';

export default function FavoritesPage() {
  usePageTitle('Saved');
  const { ids } = useFavorites();
  const { data, loading } = useAsync(() => photoService.getPhotosByIds(ids), [ids]);
  const works = data ?? [];

  return (
    <>
      <PageHeader eyebrow="Saved" title="Your selection">
        Works you’ve marked with a heart. They’re kept in this browser only.
      </PageHeader>
      <div className="container-page">
        {!loading && works.length === 0 ? (
          <EmptyState title="Nothing saved yet">
            Tap the heart on any artwork to keep it here.{' '}
            <Link to="/artworks" className="text-ink underline underline-offset-4">
              Browse artworks
            </Link>
          </EmptyState>
        ) : (
          <PhotoGrid photos={works} maxColumns={3} />
        )}
      </div>
      {works.length > 1 && (
        <div className="mt-28">
          <CategoryHall
            id="hall"
            photos={works}
            label="Your selection"
            eyebrow="Your private room"
            title="Your selection"
            description="The works you’ve saved, hung just for you. Step inside and scroll to walk."
          />
        </div>
      )}
    </>
  );
}
