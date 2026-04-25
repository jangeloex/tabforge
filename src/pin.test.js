import { describe, it, expect } from 'vitest';
import { getPinnedBookmarks, pinBookmark, unpinBookmark } from './pin.js';

const base = [
  { url: 'https://example.com', title: 'Example', tags: [] },
  { url: 'https://pinned.com', title: 'Pinned', tags: [], pinned: true, pinnedAt: '2024-01-01T00:00:00.000Z' },
  { url: 'https://other.com', title: 'Other', tags: [] },
];

describe('getPinnedBookmarks', () => {
  it('returns only pinned bookmarks', () => {
    const pinned = getPinnedBookmarks(base);
    expect(pinned).toHaveLength(1);
    expect(pinned[0].url).toBe('https://pinned.com');
  });

  it('returns empty array when none pinned', () => {
    expect(getPinnedBookmarks([base[0], base[2]])).toHaveLength(0);
  });
});

describe('pinBookmark', () => {
  it('pins an existing bookmark', () => {
    const { bookmarks, changed } = pinBookmark(base, 'https://example.com');
    expect(changed).toBe(true);
    const b = bookmarks.find((x) => x.url === 'https://example.com');
    expect(b.pinned).toBe(true);
    expect(b.pinnedAt).toBeDefined();
  });

  it('returns changed false for unknown url', () => {
    const { changed } = pinBookmark(base, 'https://nope.com');
    expect(changed).toBe(false);
  });

  it('returns changed false if already pinned', () => {
    const { changed } = pinBookmark(base, 'https://pinned.com');
    expect(changed).toBe(false);
  });
});

describe('unpinBookmark', () => {
  it('unpins a pinned bookmark', () => {
    const { bookmarks, changed } = unpinBookmark(base, 'https://pinned.com');
    expect(changed).toBe(true);
    const b = bookmarks.find((x) => x.url === 'https://pinned.com');
    expect(b.pinned).toBeUndefined();
    expect(b.pinnedAt).toBeUndefined();
  });

  it('returns changed false if not pinned', () => {
    const { changed } = unpinBookmark(base, 'https://example.com');
    expect(changed).toBe(false);
  });

  it('returns changed false for unknown url', () => {
    const { changed } = unpinBookmark(base, 'https://nope.com');
    expect(changed).toBe(false);
  });
});
