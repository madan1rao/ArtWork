/**
 * News & Updates. Placeholder posts for the demo — replace with the gallery's real
 * announcements (or load them from a CMS).
 */
export interface NewsPost {
  slug: string;
  title: string;
  /** ISO date. */
  date: string;
  category: 'Exhibition' | 'Collection' | 'Event' | 'Announcement';
  excerpt: string;
  /** Artwork id used as the cover image. */
  coverId: string;
  body: string[];
}

export const news: NewsPost[] = [
  {
    slug: 'the-gallery-opens',
    title: 'The Gallery is open',
    date: '2026-10-20',
    category: 'Exhibition',
    excerpt: 'Ten paintings — from Vermeer’s quiet interiors to Turner’s burning skies — now hang in our main hall.',
    coverId: 'the-milkmaid',
    body: [
      'Our new Gallery brings together ten paintings made by hand, spanning more than two centuries — from the Dutch Golden Age to the Impressionists.',
      'Look closely and you’ll find the marks of the brush everywhere: Vermeer’s tiny points of light on bread and pottery, Van Gogh’s thick swirling impasto, Monet’s broken strokes of colour laid side by side.',
      'Visitors can walk the room in 3D on our website, stopping in front of each painting to read about it, save favourites and view every canvas full size.',
    ],
  },
  {
    slug: 'walk-the-gallery-online',
    title: 'Walk the gallery from anywhere',
    date: '2026-10-08',
    category: 'Announcement',
    excerpt: 'Every department on our site now has a 3D hall. Click “Enter the hall” and scroll to walk past the works.',
    coverId: 'wanderer-above-the-sea-of-fog',
    body: [
      'We’ve built a 3D walk-through for each department of the gallery — Paintings, Drawings, Prints, Ceramics and Photography.',
      'Open any department, click “Enter the hall”, and scroll to stroll down a softly lit corridor with the works hung on either side. Click any frame to see it full size.',
      'It works on phones too, and there’s always a plain grid view for anyone who prefers it.',
    ],
  },
  {
    slug: 'ceramics-from-athens-to-song-china',
    title: 'Ceramics: from Athens to Song China',
    date: '2026-09-22',
    category: 'Collection',
    excerpt: 'Black-figure amphorae, celadon bowls and a salt-glazed American jar join the collection display.',
    coverId: 'panathenaic-amphora',
    body: [
      'Our ceramics display spans two and a half thousand years: Athenian black-figure amphorae, celadon-glazed stoneware from Song-dynasty China, Qing porcelain and a nineteenth-century American stoneware jar.',
      'Each piece was thrown or built by hand, glazed and fired — and each tells you something about the kilns, trade routes and tastes of its time.',
    ],
  },
  {
    slug: 'printmaking-weekend',
    title: 'Printmaking weekend: woodblock to etching',
    date: '2026-09-05',
    category: 'Event',
    excerpt: 'A two-day look at how Hokusai, Hiroshige, Dürer and Rembrandt made their prints — with live demonstrations.',
    coverId: 'great-wave',
    body: [
      'Join us for a weekend on printmaking. We’ll look at the carved woodblocks behind Hokusai’s Great Wave and Hiroshige’s views of Edo, and at the copper plates Dürer and Rembrandt engraved and etched.',
      'Demonstrations run both days. Places are limited — send us an inquiry through the contact form to reserve yours.',
    ],
  },
];
