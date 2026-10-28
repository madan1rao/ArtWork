import { categories, photos } from '@/data/photos';
import type { Category, CategoryId, Photo, PhotoQuery } from '@/types/photo';

/**
 * Data access boundary. Components talk to this interface only, so moving to a real
 * backend (or adding admin write operations) means providing another implementation
 * of `PhotoService` — e.g. one backed by `fetch('/api/artworks')`.
 */
export interface PhotoService {
  listPhotos(query?: PhotoQuery): Promise<Photo[]>;
  getPhotosByIds(ids: string[]): Promise<Photo[]>;
  listCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
}

export function matchesQuery(photo: Photo, { search = '', category = 'all' }: PhotoQuery): boolean {
  if (category !== 'all' && photo.category !== category) return false;
  const q = search.trim().toLowerCase();
  if (!q) return true;
  return [photo.title, photo.author, photo.location, photo.medium ?? '', ...photo.tags].some((field) =>
    field.toLowerCase().includes(q),
  );
}

const byId = new Map(photos.map((p) => [p.id, p]));

export const mockPhotoService: PhotoService = {
  async listPhotos(query = {}) {
    return photos.filter((p) => matchesQuery(p, query));
  },
  async getPhotosByIds(ids) {
    return ids.map((id) => byId.get(id)).filter((p): p is Photo => Boolean(p));
  },
  async listCategories() {
    return categories;
  },
  async getCategory(id) {
    return categories.find((c) => c.id === (id as CategoryId));
  },
};

export const photoService: PhotoService = mockPhotoService;
