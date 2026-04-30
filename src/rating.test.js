import { describe, it, expect } from 'vitest';
import {
  getRating,
  setRating,
  clearRating,
  getTopRated,
  averageRating,
} from './rating.js';

const bookmarks = [
  { url: 'https://example.com', title: 'Example', tags: [], rating: 4 },
  { url: 'https://foo.dev', title: 'Foo', tags: [], rating: 2 },
  { url: 'https://bar.io', title: 'Bar', tags: [] },
  { url: 'https://baz.org', title: 'Baz', tags: [], rating: 5 },
];

describe('getRating', () => {
  it('returns rating for rated bookmark', () => {
    expect(getRating(bookmarks, 'https://example.com')).toBe(4);
  });

  it('returns null for unrated bookmark', () => {
    expect(getRating(bookmarks, 'https://bar.io')).toBeNull();
  });

  it('returns null for unknown url', () => {
    expect(getRating(bookmarks, 'https://unknown.com')).toBeNull();
  });
});

describe('setRating', () => {
  it('sets rating on existing bookmark', () => {
    const updated = setRating(bookmarks, 'https://bar.io', 3);
    expect(updated.find((b) => b.url === 'https://bar.io').rating).toBe(3);
  });

  it('does not mutate original array', () => {
    setRating(bookmarks, 'https://bar.io', 3);
    expect(bookmarks.find((b) => b.url === 'https://bar.io').rating).toBeUndefined();
  });

  it('throws for rating out of range', () => {
    expect(() => setRating(bookmarks, 'https://example.com', 6)).toThrow(RangeError);
    expect(() => setRating(bookmarks, 'https://example.com', 0)).toThrow(RangeError);
  });

  it('throws for unknown url', () => {
    expect(() => setRating(bookmarks, 'https://nope.com', 3)).toThrow();
  });
});

describe('clearRating', () => {
  it('removes rating from bookmark', () => {
    const updated = clearRating(bookmarks, 'https://example.com');
    expect(updated.find((b) => b.url === 'https://example.com').rating).toBeUndefined();
  });

  it('throws for unknown url', () => {
    expect(() => clearRating(bookmarks, 'https://ghost.com')).toThrow();
  });
});

describe('getTopRated', () => {
  it('returns rated bookmarks sorted desc', () => {
    const top = getTopRated(bookmarks);
    expect(top[0].rating).toBe(5);
    expect(top[1].rating).toBe(4);
    expect(top[2].rating).toBe(2);
  });

  it('excludes unrated bookmarks', () => {
    const top = getTopRated(bookmarks);
    expect(top.every((b) => typeof b.rating === 'number')).toBe(true);
  });

  it('respects limit', () => {
    expect(getTopRated(bookmarks, 2)).toHaveLength(2);
  });
});

describe('averageRating', () => {
  it('computes average of rated bookmarks', () => {
    // rated: 4, 2, 5 => avg = 11/3 = 3.67
    expect(averageRating(bookmarks)).toBe(3.67);
  });

  it('returns null when no bookmarks are rated', () => {
    expect(averageRating([{ url: 'x', title: 'x', tags: [] }])).toBeNull();
  });
});
