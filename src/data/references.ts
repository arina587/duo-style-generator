export interface ReferenceItem {
  id: string;
  image: string;
  style: string;
  label: string;
}

export interface Category {
  id: string;
  name: string;
  tag: string;
  cover: string;
}

export const categories: Category[] = [
  { id: 'zootopia',                  name: 'Zootopia',                       tag: 'Animated',   cover: '/styles/zootopia/zootopia1.jpg' },
  { id: 'euphoria',                  name: 'Euphoria',                       tag: 'TV Series',  cover: '/styles/euphoria/euphoria1.jpg' },
  { id: 'titanic',                   name: 'Titanic',                        tag: 'Film',       cover: '/styles/titanic/titanic1.jpg' },
  { id: 'tangled',                   name: 'Tangled',                        tag: 'Animated',   cover: '/styles/tangled/tangled1.jpg' },
  { id: 'terabithia',                name: 'Bridge to Terabithia',           tag: 'Film',       cover: '/styles/terabithia/terabithia1.jpg' },
  { id: 'cinderella',                name: 'Cinderella',                     tag: 'Animated',   cover: '/styles/cinderella/cinderella1.jpg' },
  { id: 'stranger-things',           name: 'Stranger Things',                tag: 'TV Series',  cover: '/styles/stranger-things/stranger-things1.jpg' },
  { id: 'end-of-the-fucking-world',  name: 'The End of the F***ing World',   tag: 'TV Series',  cover: '/styles/end-of-the-fucking-world/end-of-the-fucking-world1.jpg' },
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

  // ── Tangled ──
  { id: 'tangled-1', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled1.jpg' },
  { id: 'tangled-2', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled2.jpg' },
  { id: 'tangled-3', style: 'tangled', label: 'Tangled', image: '/styles/tangled/tangled3.jpg' },

  // ── Terabithia ──
  { id: 'terabithia-1', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia1.jpg' },
  { id: 'terabithia-2', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia2.jpg' },
  { id: 'terabithia-3', style: 'terabithia', label: 'Terabithia', image: '/styles/terabithia/terabithia3.jpg' },

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
];
