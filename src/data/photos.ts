import type { Category, Photo } from '@/types/photo';
import { artworks } from './artworks';

/**
 * Seed content. Photographs are served from Unsplash (their titles and credits are
 * placeholder copy). Paintings, drawings, prints and ceramics are public-domain works
 * self-hosted in /public/artworks — swap in the gallery's own pieces when ready.
 * Replace all of this with API data via `services/photoService.ts`.
 */

export const categories: Category[] = [
  {
    id: 'paintings',
    label: 'Paintings',
    title: 'Paintings',
    description: 'Brushwork, glazes and light built up by hand, layer over layer.',
    coverId: 'starry-night',
  },
  {
    id: 'photography',
    label: 'Photography',
    title: 'Photography',
    description: 'Landscapes, cities and faces from photographers who would rather wait for the light.',
    coverId: 'p001',
  },
  {
    id: 'drawings',
    label: 'Drawings',
    title: 'Drawings',
    description: 'Pen, ink, chalk and watercolour — the first and most direct mark an artist makes.',
    coverId: 'vitruvian-man',
  },
  {
    id: 'ceramics',
    label: 'Ceramics',
    title: 'Ceramics',
    description: 'Thrown, glazed and fired: vessels from ancient Athens to Song-dynasty China.',
    coverId: 'panathenaic-amphora',
  },
  {
    id: 'prints',
    label: 'Prints',
    title: 'Prints',
    description: 'Woodblock, woodcut, engraving and etching — images carved, inked and pressed by hand.',
    coverId: 'great-wave',
  },
];

type Seed = Omit<Photo, 'id' | 'category'>;

const seeds: Seed[] = [
  { src: '1506905925346-21bda4d32df4', title: 'Above the Cloud Line', author: 'Mara Ellis', location: 'Dolomites, Italy', tags: ['landscape', 'mountains', 'clouds', 'dawn'], width: 1600, height: 1067, color: '#9aa3ad', year: 2024, camera: 'Sony A7R IV' },
  { src: '1438761681033-6461ffad8d80', title: 'Soft Light Study', author: 'Jonah Reyes', location: 'Lisbon, Portugal', tags: ['portrait', 'portrait', 'window light'], width: 1200, height: 1500, color: '#a08c7d', year: 2023, camera: 'Fujifilm GFX 50S' },
  { src: '1449824913935-59a10b8d2000', title: 'Grid at Dusk', author: 'Ines Okafor', location: 'Chicago, USA', tags: ['urban', 'city', 'skyline', 'aerial'], width: 1600, height: 1067, color: '#5f6b78', year: 2024 },
  { src: '1441974231531-c6227db76b6e', title: 'Cathedral of Pines', author: 'Mara Ellis', location: 'Black Forest, Germany', tags: ['nature', 'forest', 'light rays', 'green'], width: 1200, height: 1600, color: '#4d5a3c', year: 2022, camera: 'Nikon Z7' },
  { src: '1487958449943-2429e8be8625', title: 'White Geometry', author: 'Theo Lindqvist', location: 'Valencia, Spain', tags: ['architecture', 'minimal', 'white', 'curves'], width: 1200, height: 1500, color: '#d9dcdf', year: 2023 },
  { src: '1507525428034-b723cf961d3e', title: 'Turquoise Hour', author: 'Ines Okafor', location: 'Maldives', tags: ['travel', 'beach', 'ocean', 'tropical'], width: 1600, height: 1067, color: '#7fb3bf', year: 2024 },
  { src: '1470071459604-3b5ec3a7fe05', title: 'Valley Breath', author: 'Mara Ellis', location: 'Faroe Islands', tags: ['landscape', 'fog', 'hills', 'moody'], width: 1600, height: 1067, color: '#6f7a6a', year: 2023 },
  { src: '1500648767791-00dcc994a43e', title: 'Quiet Confidence', author: 'Jonah Reyes', location: 'Berlin, Germany', tags: ['portrait', 'portrait', 'studio'], width: 1200, height: 1500, color: '#8c7a6b', year: 2024, camera: 'Canon R5' },
  { src: '1480714378408-67cf0d13bc1b', title: 'Island of Light', author: 'Theo Lindqvist', location: 'New York, USA', tags: ['urban', 'city', 'night', 'skyline'], width: 1600, height: 1067, color: '#3d4b5c', year: 2022 },
  { src: '1433086966358-54859d0ed716', title: 'Falling Silk', author: 'Ama Sato', location: 'Iceland', tags: ['nature', 'waterfall', 'long exposure'], width: 1200, height: 1600, color: '#5c6e6a', year: 2023 },
  { src: '1486325212027-8081e485255e', title: 'Vertical Rhythm', author: 'Theo Lindqvist', location: 'Hong Kong', tags: ['architecture', 'facade', 'pattern', 'density'], width: 1200, height: 1600, color: '#7d8893', year: 2024 },
  { src: '1516483638261-f4dbaf036963', title: 'Cliffside Colour', author: 'Ama Sato', location: 'Cinque Terre, Italy', tags: ['travel', 'coast', 'village', 'summer'], width: 1200, height: 1500, color: '#b2876a', year: 2023 },
  { src: '1519681393784-d120267933ba', title: 'Night Ascent', author: 'Mara Ellis', location: 'Alberta, Canada', tags: ['landscape', 'stars', 'night', 'snow'], width: 1600, height: 1067, color: '#2e3a4f', year: 2024, camera: 'Sony A7S III' },
  { src: '1494790108377-be9c29b29330', title: 'Golden Hour Portrait', author: 'Jonah Reyes', location: 'Barcelona, Spain', tags: ['portrait', 'portrait', 'smile', 'warm'], width: 1200, height: 1500, color: '#b49176', year: 2023 },
  { src: '1447752875215-b2761acb3c5d', title: 'The Long Path', author: 'Ama Sato', location: 'Oregon, USA', tags: ['nature', 'forest', 'trail', 'autumn'], width: 1600, height: 1067, color: '#6d5f45', year: 2022 },
  { src: '1502602898657-3e91760cbb34', title: 'Iron & Morning', author: 'Ines Okafor', location: 'Paris, France', tags: ['travel', 'city', 'landmark', 'spring'], width: 1200, height: 1600, color: '#9b9a99', year: 2024 },
  { src: '1464822759023-fed622ff2c3b', title: 'Ridge Line', author: 'Mara Ellis', location: 'Patagonia, Chile', tags: ['landscape', 'mountains', 'peaks', 'snow'], width: 1600, height: 1067, color: '#6c7c8c', year: 2023 },
  { src: '1514565131-fce0801e5785', title: 'Electric Avenue', author: 'Theo Lindqvist', location: 'Tokyo, Japan', tags: ['urban', 'night', 'neon', 'street'], width: 1200, height: 1500, color: '#2f3442', year: 2024 },
  { src: '1534528741775-53994a69daeb', title: 'Still Gaze', author: 'Jonah Reyes', location: 'Copenhagen, Denmark', tags: ['portrait', 'portrait', 'close-up'], width: 1200, height: 1500, color: '#a48f80', year: 2022 },
  { src: '1505142468610-359e7d316be0', title: 'Glass Wave', author: 'Ama Sato', location: 'Oahu, Hawaii', tags: ['nature', 'ocean', 'wave', 'blue'], width: 1600, height: 1067, color: '#3f7f99', year: 2024 },
  { src: '1494526585095-c41746248156', title: 'Modern Retreat', author: 'Theo Lindqvist', location: 'Los Angeles, USA', tags: ['architecture', 'house', 'modern', 'pool'], width: 1600, height: 1067, color: '#8aa0a6', year: 2023 },
  { src: '1509316785289-025f5b846b35', title: 'Dune Script', author: 'Ines Okafor', location: 'Sahara, Morocco', tags: ['landscape', 'desert', 'dunes', 'minimal'], width: 1200, height: 1600, color: '#c49a6c', year: 2024 },
  { src: '1523906834658-6e24ef2386f9', title: 'Canal Reflections', author: 'Ama Sato', location: 'Venice, Italy', tags: ['travel', 'canal', 'boats', 'water'], width: 1200, height: 1500, color: '#8b7c6a', year: 2022 },
  { src: '1499002238440-d264edd596ec', title: 'Lavender Rows', author: 'Mara Ellis', location: 'Provence, France', tags: ['nature', 'flowers', 'field', 'purple'], width: 1600, height: 1067, color: '#8b7aa6', year: 2023 },
  { src: '1477959858617-67f85cf4f1df', title: 'Blue Metropolis', author: 'Theo Lindqvist', location: 'Chicago, USA', tags: ['urban', 'city', 'blue hour', 'towers'], width: 1200, height: 1600, color: '#44546a', year: 2024 },
  { src: '1507003211169-0a1dd7228f2d', title: 'Portrait in Grey', author: 'Jonah Reyes', location: 'London, UK', tags: ['portrait', 'portrait', 'beard', 'natural'], width: 1200, height: 1500, color: '#7d7570', year: 2023 },
  { src: '1501785888041-af3ef285b470', title: 'Mirror Lake', author: 'Mara Ellis', location: 'Banff, Canada', tags: ['landscape', 'lake', 'reflection', 'calm'], width: 1600, height: 1067, color: '#6a8794', year: 2022 },
  { src: '1513635269975-59663e0ac1ad', title: 'River Crossing', author: 'Ines Okafor', location: 'London, UK', tags: ['travel', 'city', 'river', 'landmark'], width: 1600, height: 1067, color: '#8592a0', year: 2024 },
  { src: '1473448912268-2022ce9509d8', title: 'Morning Canopy', author: 'Ama Sato', location: 'British Columbia, Canada', tags: ['nature', 'forest', 'mist', 'green'], width: 1200, height: 1500, color: '#56664d', year: 2024 },
  { src: '1503899036084-c55cdd92da26', title: 'Crossing Signals', author: 'Theo Lindqvist', location: 'Tokyo, Japan', tags: ['urban', 'street', 'night', 'crowd'], width: 1600, height: 1067, color: '#3a3c4d', year: 2023 },
];

const photographs: Photo[] = seeds.map((seed, i) => ({
  ...seed,
  id: `p${String(i + 1).padStart(3, '0')}`,
  category: 'photography',
  medium: 'Photograph',
  credit: 'Photograph via Unsplash',
  description:
    seed.description ??
    `${seed.title} — photographed in ${seed.location}, ${seed.year}. Part of an ongoing study of light, form and stillness.`,
}));

export const photos: Photo[] = [...artworks, ...photographs];
