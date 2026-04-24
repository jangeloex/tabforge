import { describe, it, expect } from 'vitest';
import { getStaleBookmarks, markVisited } from './remind.js';

const DAY = 1000 * 60 * 60 * 24;

function daysAgo(n) {
  return new Date(Date.now() - n * DAY).toISOString();
}

const bookmarks = [
  { url: 'https://old.com', title: 'Old', lastVisited: daysAgo(40) },
  { url: 'https://recent.com', title: 'Recent', lastVisited: daysAgo(5) },
  { url: 'https://never.com', title: 'Never', addedAt: daysAgo(60) },
  { url: 'https://newadded.com', title: 'New', addedAt: daysAgo(2) },
];

describe('getStaleBookmarks', () => {
  it('returns bookmarks older than threshold', () => {
    const stale = getStaleBookmarks(bookmarks, 30);
    const urls = stale.map((b) => b.url);
    expect(urls).toContain('https://old.com');
    expect(urls).toContain('https://never.com');
  });

  it('excludes recently visited bookmarks', () => {
    const stale = getStaleBookmarks(bookmarks, 30);
    const urls = stale.map((b) => b.url);
    expect(urls).not.toContain('https://recent.com');
    expect(urls).not.toContain('https://newadded.com');
  });

  it('returns empty array when all bookmarks are fresh', () => {
    const fresh = [{ url: 'https://a.com', lastVisited: daysAgo(1) }];
    expect(getStaleBookmarks(fresh, 30)).toHaveLength(0);
  });

  it('respects custom threshold', () => {
    const stale = getStaleBookmarks(bookmarks, 3);
    const urls = stale.map((b) => b.url);
    expect(urls).toContain('https://recent.com');
  });
});

describe('markVisited', () => {
  it('updates lastVisited for matching url', () => {
    const updated = markVisited(bookmarks, 'https://old.com');
    const b = updated.find((x) => x.url === 'https://old.com');
    expect(new Date(b.lastVisited).getTime()).toBeGreaterThan(Date.now() - 5000);
  });

  it('returns unchanged array when url not found', () => {
    const updated = markVisited(bookmarks, 'https://notexist.com');
    expect(updated).toEqual(bookmarks);
  });

  it('does not mutate original array', () => {
    const original = [{ url: 'https://x.com', lastVisited: daysAgo(50) }];
    markVisited(original, 'https://x.com');
    expect(original[0].lastVisited).toBe(daysAgo(50));
  });
});
