import { photoService } from '@/services/photoService';
import { useAsync } from '@/hooks/useAsync';
import { usePageTitle } from '@/hooks/usePageTitle';
import { news } from '@/data/news';
import { PageHeader } from '@/components/ui/PageHeader';
import { NewsCard } from '@/components/news/NewsCard';

export default function NewsPage() {
  usePageTitle('News & Updates');
  const { data: covers = [] } = useAsync(() => photoService.getPhotosByIds(news.map((n) => n.coverId)), []);
  const posts = [...news].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <PageHeader eyebrow="News & Updates" title="From the gallery">
        Exhibitions, new arrivals, events and announcements.
      </PageHeader>
      <div className="container-page grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <NewsCard key={post.slug} post={post} cover={covers.find((c) => c.id === post.coverId)} index={i} />
        ))}
      </div>
    </>
  );
}
