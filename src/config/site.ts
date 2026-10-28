import type { CategoryId } from '@/types/photo';

/**
 * Company details shown across the site. Placeholder contact values are marked —
 * replace them with the real ones before going live.
 */
export const site = {
  name: 'FourStackinfotech',
  tagline: 'Art Gallery',
  // TODO: replace with the real contact details.
  email: 'hello@example.com',
  phone: '+00 00000 00000',
  address: 'Gallery address to be added',
  hours: 'Tue–Sun · 10:00–18:00',
};

export interface NavItem {
  label: string;
  to: string;
  children?: { label: string; to: string }[];
}

const CATEGORY_MENU: { id: CategoryId; label: string }[] = [
  { id: 'photography', label: 'Photography' },
  { id: 'paintings', label: 'Paintings' },
  { id: 'drawings', label: 'Drawings' },
  { id: 'ceramics', label: 'Ceramics' },
  { id: 'prints', label: 'Prints' },
];

/** Site map — drives the header, mobile menu and footer. */
export const NAV: NavItem[] = [
  { label: 'Home', to: '/' },
  {
    label: 'About',
    to: '/about/overview',
    children: [
      { label: 'Mission & Vision', to: '/about/mission-vision' },
      { label: 'Company Overview', to: '/about/overview' },
    ],
  },
  {
    label: 'Artworks',
    to: '/artworks',
    children: CATEGORY_MENU.map((c) => ({ label: c.label, to: `/artworks/${c.id}` })),
  },
  { label: 'News & Updates', to: '/news' },
  {
    label: 'Contact',
    to: '/contact',
    children: [{ label: 'Inquiry / Contact Form', to: '/contact#inquiry' }],
  },
];
