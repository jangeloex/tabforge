import { describe, it, expect, beforeEach } from 'vitest';
import { vol } from 'memfs';
import { vi } from 'vitest';
import { getFavorites, favoriteBookmark, unfavoriteBookmark, toggleFavorite } from './favorite.js';

vi.mock('fs', () => require('memfs').fs);
vi.mock('fs/promises', () => require('memfs').fs.promises);

const makeConfig = (dir) => ({ storePath: dir });

const sampleBookmarks = [
  { url: 'https://example.com', title: 'Example', tags: [], favorite: false },
  { url: 'https://favorited.com', title: 'Favorited', tags: [], favorite: true },
  { url: 'https://other.com', title: 'Other', tags: [] },
];

beforeEach(() => {
  vol.reset();
  vol.fromJSON({ '/store/bookmarks.json': JSON.stringify(sampleBookmarks) });
});

describe('getFavorites', () => {
  it('returns only favorited bookmarks', () => {
    const result = getFavorites(makeConfig('/store'));
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://favorited.com');
  });
});

describe('favoriteBookmark', () => {
  it('marks a bookmark as favorite', () => {
    const config = makeConfig('/store');
    const changed = favoriteBookmark(config, 'https://example.com');
    expect(changed).toBe(true);
    const favorites = getFavorites(config);
    expect(favorites.some((b) => b.url === 'https://example.com')).toBe(true);
  });

  it('returns false if already favorited', () => {
    const changed = favoriteBookmark(makeConfig('/store'), 'https://favorited.com');
    expect(changed).toBe(false);
  });

  it('throws if bookmark not found', () => {
    expect(() => favoriteBookmark(makeConfig('/store'), 'https://missing.com')).toThrow();
  });
});

describe('unfavoriteBookmark', () => {
  it('removes favorite status', () => {
    const config = makeConfig('/store');
    const changed = unfavoriteBookmark(config, 'https://favorited.com');
    expect(changed).toBe(true);
    expect(getFavorites(config)).toHaveLength(0);
  });

  it('returns false if not favorited', () => {
    const changed = unfavoriteBookmark(makeConfig('/store'), 'https://example.com');
    expect(changed).toBe(false);
  });
});

describe('toggleFavorite', () => {
  it('toggles on', () => {
    const result = toggleFavorite(makeConfig('/store'), 'https://example.com');
    expect(result).toBe(true);
  });

  it('toggles off', () => {
    const result = toggleFavorite(makeConfig('/store'), 'https://favorited.com');
    expect(result).toBe(false);
  });
});
