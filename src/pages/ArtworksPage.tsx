import { photoService } from '@/services/photoService';
import { useAsync } from '@/hooks/useAsync';
import { usePageTitle } from '@/hooks/usePageTitle';
import { PageHeader } from '@/components/ui/PageHeader';
import { CategoryCard } from '@/components/artworks/CategoryCard';

export default function ArtworksPage() {
  usePageTitle('Artworks');
  const { data } = useAsync(async () => {
    const [all, categories] = await Promise.all([photoService.listPhotos(), photoService.listCategories()]);
    return categories.map((c) => ({
      category: c,
      cover: all.find((p) => p.id === c.coverId),
      count: all.filter((p) => p.category === c.id).length,
    }));
  }, []);

  return (
    <>
      <PageHeader eyebrow="The collection" title="Artworks">
        Five departments, each with its own room. Browse the works on the wall, or step inside and walk the hall.
      </PageHeader>
      <div className="container-page grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map(({ category, cover, count }, i) => (
          <CategoryCard key={category.id} category={category} cover={cover} count={count} index={i} />
        ))}
      </div>
    </>
  );
}
