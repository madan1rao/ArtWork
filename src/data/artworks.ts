import type { Photo } from '@/types/photo';

/**
 * Public-domain works used as gallery content. Images were downloaded once from
 * Wikimedia Commons into /public/artworks (see the `credit` on each). Replace with the
 * gallery's own artworks by dropping images in that folder and editing this list.
 */

const PD = 'Public domain, via Wikimedia Commons';
const MET = 'CC0, The Metropolitan Museum of Art via Wikimedia Commons';
const HONOLULU = 'CC0, Honolulu Museum of Art via Wikimedia Commons';

type Seed = Omit<Photo, 'src' | 'tags'> & { tags?: string[] };

const art = (seed: Seed): Photo => ({ ...seed, src: `/artworks/${seed.id}.jpg`, tags: seed.tags ?? [] });

export const artworks: Photo[] = [
  // ---- Paintings ----
  art({ id: 'starry-night', category: 'paintings', title: 'The Starry Night', author: 'Vincent van Gogh', location: 'Museum of Modern Art, New York', year: 1889, medium: 'Oil on canvas', width: 1280, height: 1013, color: '#2c3e63', credit: PD, tags: ['night', 'sky', 'post-impressionism', 'village'], description: 'Painted from memory at the asylum in Saint-Rémy: a swirling night sky over a sleeping village, laid down in thick, rhythmic strokes of paint.' }),
  art({ id: 'girl-with-a-pearl-earring', category: 'paintings', title: 'Girl with a Pearl Earring', author: 'Johannes Vermeer', location: 'Mauritshuis, The Hague', year: 1665, date: 'c. 1665', medium: 'Oil on canvas', width: 1280, height: 1516, color: '#2a2a24', credit: PD, tags: ['portrait', 'dutch golden age', 'tronie'] }),
  art({ id: 'wanderer-above-the-sea-of-fog', category: 'paintings', title: 'Wanderer above the Sea of Fog', author: 'Caspar David Friedrich', location: 'Hamburger Kunsthalle', year: 1818, date: 'c. 1818', medium: 'Oil on canvas', width: 1280, height: 1639, color: '#8a8f94', credit: PD, tags: ['romanticism', 'mountains', 'fog', 'landscape'] }),
  art({ id: 'water-lilies', category: 'paintings', title: 'Water Lilies', author: 'Claude Monet', location: 'Art Institute of Chicago', year: 1906, medium: 'Oil on canvas', width: 1280, height: 1230, color: '#5b6e74', credit: PD, tags: ['impressionism', 'garden', 'pond', 'water'] }),
  art({ id: 'the-milkmaid', category: 'paintings', title: 'The Milkmaid', author: 'Johannes Vermeer', location: 'Rijksmuseum, Amsterdam', year: 1658, date: 'c. 1658', medium: 'Oil on canvas', width: 1280, height: 1435, color: '#6b6248', credit: PD, tags: ['interior', 'dutch golden age', 'light'] }),
  art({ id: 'impression-sunrise', category: 'paintings', title: 'Impression, Sunrise', author: 'Claude Monet', location: 'Musée Marmottan Monet, Paris', year: 1872, medium: 'Oil on canvas', width: 1280, height: 996, color: '#6f7d84', credit: PD, tags: ['impressionism', 'harbour', 'sunrise', 'water'] }),
  art({ id: 'rembrandt-self-portrait', category: 'paintings', title: 'Self-Portrait', author: 'Rembrandt van Rijn', location: 'National Gallery of Art, Washington', year: 1659, medium: 'Oil on canvas', width: 1280, height: 1658, color: '#2b2219', credit: PD, tags: ['portrait', 'dutch golden age'] }),
  art({ id: 'the-hay-wain', category: 'paintings', title: 'The Hay Wain', author: 'John Constable', location: 'National Gallery, London', year: 1821, medium: 'Oil on canvas', width: 1280, height: 882, color: '#6e7258', credit: PD, tags: ['landscape', 'river', 'countryside', 'romanticism'] }),
  art({ id: 'moulin-de-la-galette', category: 'paintings', title: 'Bal du moulin de la Galette', author: 'Pierre-Auguste Renoir', location: "Musée d'Orsay, Paris", year: 1876, medium: 'Oil on canvas', width: 1280, height: 954, color: '#5a5a4a', credit: PD, tags: ['impressionism', 'dance', 'paris', 'crowd'] }),
  art({ id: 'fighting-temeraire', category: 'paintings', title: 'The Fighting Temeraire', author: 'J. M. W. Turner', location: 'National Gallery, London', year: 1839, medium: 'Oil on canvas', width: 1280, height: 951, color: '#9a8058', credit: PD, tags: ['ship', 'sunset', 'sea', 'romanticism'] }),

  // ---- Drawings ----
  art({ id: 'vitruvian-man', category: 'drawings', title: 'Vitruvian Man', author: 'Leonardo da Vinci', location: "Gallerie dell'Accademia, Venice", year: 1490, date: 'c. 1490', medium: 'Pen and ink over metalpoint on paper', width: 1280, height: 1740, color: '#b9a98a', credit: PD, tags: ['renaissance', 'proportion', 'figure'] }),
  art({ id: 'praying-hands', category: 'drawings', title: 'Praying Hands', author: 'Albrecht Dürer', location: 'Albertina, Vienna', year: 1508, medium: 'Brush and ink, heightened with white, on blue prepared paper', width: 1280, height: 1863, color: '#3d4a5a', credit: PD, tags: ['renaissance', 'study', 'hands'] }),
  art({ id: 'young-hare', category: 'drawings', title: 'Young Hare', author: 'Albrecht Dürer', location: 'Albertina, Vienna', year: 1502, medium: 'Watercolour and gouache on paper', width: 1280, height: 1414, color: '#b9a78a', credit: PD, tags: ['animal', 'nature study', 'watercolour'] }),
  art({ id: 'leonardo-self-portrait', category: 'drawings', title: 'Portrait of a Man in Red Chalk', author: 'Leonardo da Vinci', location: 'Biblioteca Reale, Turin', year: 1512, date: 'c. 1512', medium: 'Red chalk on paper', width: 1280, height: 1995, color: '#b48d6a', credit: PD, tags: ['portrait', 'renaissance', 'chalk'] }),
  art({ id: 'cafe-terrace-drawing', category: 'drawings', title: 'Café Terrace at Night', author: 'Vincent van Gogh', location: 'Dallas Museum of Art', year: 1888, medium: 'Reed pen and ink over pencil on laid paper', width: 960, height: 1254, color: '#b9b09a', credit: PD, tags: ['night', 'street', 'arles'] }),
  art({ id: 'the-zouave', category: 'drawings', title: 'The Zouave', author: 'Vincent van Gogh', location: 'Arles, France', year: 1888, medium: 'Pen and ink on paper', width: 1280, height: 1666, color: '#c2b79e', credit: PD, tags: ['portrait', 'arles'] }),

  // ---- Prints ----
  art({ id: 'great-wave', category: 'prints', title: 'The Great Wave off Kanagawa', author: 'Katsushika Hokusai', location: 'Edo (Tokyo), Japan', year: 1831, date: 'c. 1831', medium: 'Polychrome woodblock print', width: 1280, height: 860, color: '#c9bea0', credit: PD, tags: ['ukiyo-e', 'wave', 'fuji', 'sea'] }),
  art({ id: 'red-fuji', category: 'prints', title: 'Fine Wind, Clear Morning (Red Fuji)', author: 'Katsushika Hokusai', location: 'Edo (Tokyo), Japan', year: 1831, date: 'c. 1831', medium: 'Polychrome woodblock print', width: 1280, height: 854, color: '#8a5a3c', credit: PD, tags: ['ukiyo-e', 'fuji', 'mountain'] }),
  art({ id: 'rhinoceros', category: 'prints', title: 'Rhinoceros', author: 'Albrecht Dürer', location: 'Nuremberg, Germany', year: 1515, medium: 'Woodcut', width: 1280, height: 1014, color: '#d2cbbb', credit: PD, tags: ['animal', 'renaissance'] }),
  art({ id: 'melencolia-i', category: 'prints', title: 'Melencolia I', author: 'Albrecht Dürer', location: 'Nuremberg, Germany', year: 1514, medium: 'Engraving', width: 1280, height: 1617, color: '#8f8a7e', credit: PD, tags: ['allegory', 'renaissance'] }),
  art({ id: 'ryogoku-bridge', category: 'prints', title: 'Ryōgoku Bridge and the Great Riverbank', author: 'Utagawa Hiroshige', location: 'Brooklyn Museum', year: 1856, medium: 'Woodblock print, from One Hundred Famous Views of Edo', width: 960, height: 1441, color: '#6f8794', credit: PD, tags: ['ukiyo-e', 'bridge', 'river', 'edo'] }),
  art({ id: 'rembrandt-at-a-window', category: 'prints', title: 'Self-Portrait Drawing at a Window', author: 'Rembrandt van Rijn', location: 'The Metropolitan Museum of Art, New York', year: 1648, medium: 'Etching, drypoint and burin', width: 1280, height: 1768, color: '#b9b2a2', credit: MET, tags: ['portrait', 'dutch golden age', 'etching'] }),

  // ---- Ceramics ----
  art({ id: 'panathenaic-amphora', category: 'ceramics', title: 'Panathenaic Prize Amphora', author: 'Attributed to the Kleophrades Painter', location: 'The Metropolitan Museum of Art, New York', year: -500, date: 'c. 500 BC', medium: 'Terracotta, black-figure', width: 1280, height: 1600, color: '#4a3a2c', credit: MET, tags: ['greek', 'amphora', 'athena'] }),
  art({ id: 'song-fish-bowl', category: 'ceramics', title: 'Bowl with Fish and Waves', author: 'Unknown Chinese potter', location: 'Honolulu Museum of Art', year: 1100, date: 'Northern Song dynasty (960–1127)', medium: 'Stoneware with celadon glaze', width: 1280, height: 1010, color: '#7f8a6e', credit: HONOLULU, tags: ['chinese', 'celadon', 'bowl', 'song'] }),
  art({ id: 'stoneware-jar', category: 'ceramics', title: 'Stoneware Jar', author: 'Anna Pottery (Cornwall and Wallace Kirkpatrick)', location: 'The Metropolitan Museum of Art, New York', year: 1873, medium: 'Salt-glazed stoneware', width: 1280, height: 1739, color: '#8a7a62', credit: MET, tags: ['american', 'jar', 'stoneware'] }),
  art({ id: 'bottle-vase', category: 'ceramics', title: 'Small Bottle-Shaped Vase', author: 'Unknown Chinese potter', location: 'The Metropolitan Museum of Art, New York', year: 1750, date: 'Probably 18th century', medium: 'Porcelain', width: 1280, height: 1707, color: '#9a9488', credit: MET, tags: ['chinese', 'porcelain', 'vase', 'qing'] }),
  art({ id: 'neck-amphora', category: 'ceramics', title: 'Neck-Amphora', author: 'Attributed to the Timiades Painter', location: 'The Metropolitan Museum of Art, New York', year: -560, date: 'c. 570–550 BC', medium: 'Terracotta, black-figure', width: 1280, height: 1707, color: '#5a4636', credit: MET, tags: ['greek', 'amphora'] }),
  art({ id: 'song-celadon-bowl', category: 'ceramics', title: 'Celadon Bowl', author: 'Unknown Chinese potter', location: 'Honolulu Museum of Art', year: 1150, date: 'Song dynasty (960–1279)', medium: 'Stoneware with celadon glaze', width: 1280, height: 1015, color: '#7d8a78', credit: HONOLULU, tags: ['chinese', 'celadon', 'bowl', 'song'] }),
];
