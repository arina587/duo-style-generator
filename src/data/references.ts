export interface ReferenceItem {
  id: string;
  image: string;
  style: string;
  label: string;
  promptKey?: string;
  inputMode?: 'single' | 'couple';
}

export interface Category {
  id: string;
  name: string;
  tag: string;
  cover: string;
  category: 'cartoon' | 'other' | 'collage';
  inputMode?: 'single' | 'couple';
}

export const categories: Category[] = [
  // Row 1 (col 1→3): Zootopia | Euphoria | Titanic
  { id: 'zootopia',                  name: 'Zootopia',                       tag: 'Animated',   cover: '/styles/zootopia/zootopia1.jpg',                                                          category: 'cartoon' },
  { id: 'euphoria',                  name: 'Euphoria',                       tag: 'TV Series',  cover: '/styles/euphoria/euphoria1.jpg',                                                          category: 'other'   },
  { id: 'titanic',                   name: 'Titanic',                        tag: 'Film',       cover: '/styles/titanic/titanic1.jpg',                                                            category: 'other'   },
  // Row 2 (col 1→3): Tangled | La La Land | Mr. & Mrs. Smith
  { id: 'tangled',                   name: 'Tangled',                        tag: 'Animated',   cover: '/styles/tangled/tangled1.jpg',                                                            category: 'cartoon' },
  { id: 'lalaland',                  name: 'La La Land',                     tag: 'Film',       cover: '/styles/lalaland/lalaland1.jpg',                                                         category: 'other'   },
  { id: 'smith',                     name: 'Mr. & Mrs. Smith',               tag: 'Film',       cover: '/styles/smith/smith1.jpg',                                                               category: 'other'   },
  // Row 3 (col 1→3): Cinderella | Stranger Things | TEOTFW
  { id: 'cinderella',                name: 'Cinderella',                     tag: 'Animated',   cover: '/styles/cinderella/cinderella1.jpg',                                                     category: 'cartoon' },
  { id: 'stranger-things',           name: 'Stranger Things',                tag: 'TV Series',  cover: '/styles/stranger-things/stranger-things1.jpg',                                           category: 'other'   },
  { id: 'end-of-the-fucking-world',  name: 'The End of the F***ing World',   tag: 'TV Series',  cover: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.jpg',                         category: 'other'   },
  // Row 4: Collages
  { id: 'collage',                   name: 'Collages',                       tag: 'Collage',    cover: '/styles/collage/collage1.jpg',                                                           category: 'collage' },
  // Row 5: Wolf of Wall Street | American Psycho
  { id: 'wallstreet',      name: 'The Wolf of Wall Street', tag: 'Film', cover: '/styles/wallstreet/wallstreet1.jpg',           category: 'other', inputMode: 'single' },
  { id: 'americanpsycho',  name: 'American Psycho',          tag: 'Film', cover: '/styles/americanpsycho/americanpsycho1.jpg',   category: 'other', inputMode: 'single' },
];

export function getRefsForCategory(categoryId: string): ReferenceItem[] {
  return references.filter((r) => r.style === categoryId);
}

export const references: ReferenceItem[] = [
  // ── Zootopia ──
  { id: 'zootopia-1', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia1.jpg' },
  { id: 'zootopia-2', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia2.jpg' },
  { id: 'zootopia-3', style: 'zootopia', label: 'Zootopia', image: '/styles/zootopia/zootopia3.jpg' },

  // ── Euphoria ──
  { id: 'euphoria-1', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria1.jpg' },
  { id: 'euphoria-2', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria2.jpg' },
  { id: 'euphoria-3', style: 'euphoria', label: 'Euphoria', image: '/styles/euphoria/euphoria3.jpg' },

  // ── Titanic ──
  { id: 'titanic-1', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic1.jpg' },
  { id: 'titanic-2', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic2.jpg' },
  { id: 'titanic-3', style: 'titanic', label: 'Titanic', image: '/styles/titanic/titanic3.jpg' },

  // ── La La Land ──
  { id: 'lalaland-1', style: 'lalaland', label: 'La La Land', image: '/styles/lalaland/lalaland1.jpg', promptKey: 'LALALAND_1' },
  { id: 'lalaland-2', style: 'lalaland', label: 'La La Land', image: '/styles/lalaland/lalaland2.jpg', promptKey: 'LALALAND_2' },
  { id: 'lalaland-3', style: 'lalaland', label: 'La La Land', image: '/styles/lalaland/lalaland3.jpg', promptKey: 'LALALAND_3' },

  // ── Tangled ──
  { id: 'tangled-1', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled1.jpg' },
  { id: 'tangled-2', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled2.jpg' },
  { id: 'tangled-3', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled3.jpg' },

  // ── Mr. & Mrs. Smith ──
  { id: 'smith-1', style: 'smith', label: 'Mr. & Mrs. Smith', image: '/styles/smith/smith1.jpg' },
  { id: 'smith-2', style: 'smith', label: 'Mr. & Mrs. Smith', image: '/styles/smith/smith2.jpg' },
  { id: 'smith-3', style: 'smith', label: 'Mr. & Mrs. Smith', image: '/styles/smith/smith3.jpg' },

  // ── Cinderella ──
  { id: 'cinderella-1', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella1.jpg' },
  { id: 'cinderella-2', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella2.jpg' },
  { id: 'cinderella-3', style: 'cinderella', label: 'Cinderella', image: '/styles/cinderella/cinderella3.jpg' },

  // ── Stranger Things ──
  { id: 'stranger-things-1', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things1.jpg' },
  { id: 'stranger-things-2', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things2.jpg' },
  { id: 'stranger-things-3', style: 'stranger-things', label: 'Stranger Things', image: '/styles/stranger-things/stranger-things3.jpg' },

  // ── The End of the F***ing World ──
  { id: 'end-of-the-fucking-world-1', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.jpg' },
  { id: 'end-of-the-fucking-world-2', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world2.jpg' },
  { id: 'end-of-the-fucking-world-3', style: 'end-of-the-fucking-world', label: 'The End of the F***ing World', image: '/styles/end-of-the-fucking-world/end-of-the-fucking-world3.jpg' },

  // ── Collages ──
  { id: 'collage-1', style: 'collage', label: 'The Notebook',      image: '/styles/collage/collage1.jpg' },
  { id: 'collage-2', style: 'collage', label: 'The Notebook',      image: '/styles/collage/collage2.jpg' },
  { id: 'collage-3', style: 'collage', label: '500 Days of Summer', image: '/styles/collage/collage3.jpg' },
  { id: 'collage-4', style: 'collage', label: 'Me Before You',     image: '/styles/collage/collage4.jpg' },
  { id: 'collage-5', style: 'collage', label: 'Mr. & Mrs. Smith',  image: '/styles/collage/collage5.jpg' },
  { id: 'collage-6', style: 'collage', label: 'Spider-Man',        image: '/styles/collage/collage6.jpg' },

  // ── The Wolf of Wall Street ──
  { id: 'wallstreet-1', style: 'wallstreet', label: 'The Wolf of Wall Street', image: '/styles/wallstreet/wallstreet1.jpg', inputMode: 'single' },
  { id: 'wallstreet-2', style: 'wallstreet', label: 'The Wolf of Wall Street', image: '/styles/wallstreet/wallstreet2.jpg', inputMode: 'single' },
  { id: 'wallstreet-3', style: 'wallstreet', label: 'The Wolf of Wall Street', image: '/styles/wallstreet/wallstreet3.jpg', inputMode: 'single' },

  // ── American Psycho ──
  { id: 'americanpsycho-1', style: 'americanpsycho', label: 'American Psycho', image: '/styles/americanpsycho/americanpsycho1.jpg', inputMode: 'single' },
  { id: 'americanpsycho-2', style: 'americanpsycho', label: 'American Psycho', image: '/styles/americanpsycho/americanpsycho2.jpg', inputMode: 'single' },
  { id: 'americanpsycho-3', style: 'americanpsycho', label: 'American Psycho', image: '/styles/americanpsycho/americanpsycho3.jpg', inputMode: 'single' },
];
