import { describe, it, expect } from 'vitest';
import { findDuplicates, dedupeBookmarks } from './dedupe.js';

const sampleBookmarks = [
  { url: 'https://example.com', title: 'Example', tags: ['web'] },
  { url: 'https://foo.com', title: 'Foo', tags: ['dev'] },
  { url: 'https://example.com', title: 'Example Again', tags: ['news'] },
  { url: 'https://bar.com', title: 'Bar', tags: [] },
  { url: 'https://foo.com', title: 'Foo Dupe', tags: ['tools'] },
  { url: 'https://foo.com', title: 'Foo Third', tags: ['dev', 'extra'] },
];

describe('findDuplicates', () => {
  it('returns duplicate groups with correct indices', () => {
    const dupes = findDuplicates(sampleBookmarks);
    expect(dupes).toHaveLength(2);
    const urls = dupes.map((d) => d.url);
    expect(urls).toContain('https://example.com');
    expect(urls).toContain('https://foo.com');
  });

  it('returns correct indices for duplicates', () => {
    const dupes = findDuplicates(sampleBookmarks);
    const fooDupe = dupes.find((d) => d.url === 'https://foo.com');
    expect(fooDupe.indices).toEqual([1, 4, 5]);
  });

  it('returns empty array when no duplicates', () => {
    const unique = [
      { url: 'https://a.com', title: 'A', tags: [] },
      { url: 'https://b.com', title: 'B', tags: [] },
    ];
    expect(findDuplicates(unique)).toEqual([]);
  });

  it('handles empty bookmarks array', () => {
    expect(findDuplicates([])).toEqual([]);
  });
});

describe('dedupeBookmarks', () => {
  it('removes duplicates and returns correct count', () => {
    const { bookmarks, removed } = dedupeBookmarks(sampleBookmarks);
    expect(bookmarks).toHaveLength(3);
    expect(removed).toBe(3);
  });

  it('keeps last occurrence title', () => {
    const { bookmarks } = dedupeBookmarks(sampleBookmarks);
    const foo = bookmarks.find((b) => b.url.includes('foo.com'));
    expect(foo.title).toBe('Foo Third');
  });

  it('merges tags from all duplicates', () => {
    const { bookmarks } = dedupeBookmarks(sampleBookmarks);
    const foo = bookmarks.find((b) => b.url.includes('foo.com'));
    expect(foo.tags).toContain('dev');
    expect(foo.tags).toContain('tools');
    expect(foo.tags).toContain('extra');
    expect(new Set(foo.tags).size).toBe(foo.tags.length);
  });

  it('does not modify bookmarks with no duplicates', () => {
    const unique = [
      { url: 'https://a.com', title: 'A', tags: ['x'] },
    ];
    const { bookmarks, removed } = dedupeBookmarks(unique);
    expect(bookmarks).toHaveLength(1);
    expect(removed).toBe(0);
  });
});
