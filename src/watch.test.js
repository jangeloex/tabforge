import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRecentlyModified, markWatched, getUnwatched } from './watch.js';

const now = Date.now();
const past = now - 10000;
const future = now + 10000;

const bookmarks = [
  { url: 'https://a.com', title: 'A', updatedAt: new Date(past).toISOString() },
  { url: 'https://b.com', title: 'B', updatedAt: new Date(future).toISOString() },
  { url: 'https://c.com', title: 'C' },
];

describe('getRecentlyModified', () => {
  it('returns bookmarks updated after sinceMs', () => {
    const result = getRecentlyModified(bookmarks, now - 5000);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://b.com');
  });

  it('returns empty if none are recent', () => {
    const result = getRecentlyModified(bookmarks, now + 20000);
    expect(result).toHaveLength(0);
  });
});

describe('markWatched', () => {
  it('sets lastWatched on the matching bookmark', () => {
    const result = markWatched(bookmarks, 'https://a.com');
    expect(result[0].lastWatched).toBeDefined();
    expect(result[1].lastWatched).toBeUndefined();
  });

  it('returns unchanged array if url not found', () => {
    const result = markWatched(bookmarks, 'https://notfound.com');
    expect(result).toEqual(bookmarks);
  });

  it('does not mutate original array', () => {
    const orig = { ...bookmarks[0] };
    markWatched(bookmarks, 'https://a.com');
    expect(bookmarks[0]).toEqual(orig);
  });
});

describe('getUnwatched', () => {
  it('returns bookmarks without lastWatched', () => {
    const withWatched = [
      ...bookmarks,
      { url: 'https://d.com', title: 'D', lastWatched: new Date().toISOString() },
    ];
    const result = getUnwatched(withWatched);
    expect(result.map((b) => b.url)).not.toContain('https://d.com');
    expect(result).toHaveLength(3);
  });

  it('returns all if none are watched', () => {
    expect(getUnwatched(bookmarks)).toHaveLength(3);
  });
});
