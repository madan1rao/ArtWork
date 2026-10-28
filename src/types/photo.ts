/**
 * Domain types. These mirror the shape a future REST/GraphQL backend should return,
 * so the UI never depends on where the data comes from.
 */

/** The gallery's departments, one per page under /artworks. */
export type CategoryId = 'photography' | 'paintings' | 'drawings' | 'ceramics' | 'prints';

export interface Category {
  id: CategoryId;
  /** Short name used in menus. */
  label: string;
  /** Heading on the category page. */
  title: string;
  description: string;
  coverId: string;
}

/** Any work in the gallery: a photograph, painting, drawing, ceramic or print. */
export interface Photo {
  id: string;
  title: string;
  /** Artist / photographer credit. */
  author: string;
  /** Collection that holds the work, or where it was made. */
  location: string;
  category: CategoryId;
  tags: string[];
  /** Intrinsic dimensions, used to reserve layout space before the image loads. */
  width: number;
  height: number;
  /** Dominant colour shown as a placeholder while loading. */
  color: string;
  /** Unsplash photo key, or a site path (starting with "/") for self-hosted images. */
  src: string;
  /** Sortable year (negative = BC). */
  year: number;
  /** Display date when the year alone isn't right, e.g. "c. 1665" or "c. 500 BC". */
  date?: string;
  /** e.g. "Oil on canvas". */
  medium?: string;
  camera?: string;
  description?: string;
  /** Image licence / source line. */
  credit?: string;
}

export interface PhotoQuery {
  search?: string;
  category?: CategoryId | 'all';
}

export const dateLabel = (p: Pick<Photo, 'year' | 'date'>) => p.date ?? String(p.year);
