import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sortBookmarks, sortAndSave } from './sort.js';
import * as bookmarksModule from './bookmarks.js';

const sampleBookmarks = [
  { title: 'Zebra Site', url: 'https://zebra.com', tags: ['z'], createdAt: '2024-03-01T00:00:00Z' },
  { title: 'Apple Docs', url: 'https://apple.com', tags: ['a', 'docs'], createdAt: '2024-01-01T00:00:00Z' },
  { title: 'Mango News', url: 'https://mango.com', tags: ['m'], createdAt: '2024-02-01T00:00:00Z' },
];

describe('sortBookmarks', () => {
  it('sorts by title ascending by default', () => {
    const result = sortBookmarks(sampleBookmarks);
    expect(result[0].title).toBe('Apple Docs');
    expect(result[2].title).toBe('Zebra Site');
  });

  it('sorts by title descending', () => {
    const result = sortBookmarks(sampleBookmarks, 'title', 'desc');
    expect(result[0].title).toBe('Zebra Site');
    expect(result[2].title).toBe('Apple Docs');
  });

  it('sorts by url ascending', () => {
    const result = sortBookmarks(sampleBookmarks, 'url', 'asc');
    expect(result[0].url).toBe('https://apple.com');
    expect(result[2].url).toBe('https://zebra.com');
  });

  it('sorts by createdAt ascending', () => {
    const result = sortBookmarks(sampleBookmarks, 'createdAt', 'asc');
    expect(result[0].createdAt).toBe('2024-01-01T00:00:00Z');
    expect(result[2].createdAt).toBe('2024-03-01T00:00:00Z');
  });

  it('sorts by createdAt descending', () => {
    const result = sortBookmarks(sampleBookmarks, 'createdAt', 'desc');
    expect(result[0].createdAt).toBe('2024-03-01T00:00:00Z');
  });

  it('sorts by tags ascending', () => {
    const result = sortBookmarks(sampleBookmarks, 'tags', 'asc');
    expect(result[0].tags).toEqual(['a', 'docs']);
  });

  it('does not mutate the original array', () => {
    const original = [...sampleBookmarks];
    sortBookmarks(sampleBookmarks, 'title', 'desc');
    expect(sampleBookmarks).toEqual(original);
  });

  it('throws on invalid field', () => {
    expect(() => sortBookmarks(sampleBookmarks, 'invalid')).toThrow('Invalid sort field');
  });
});

describe('sortAndSave', () => {
  beforeEach(() => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue([...sampleBookmarks]);
    vi.spyOn(bookmarksModule, 'saveBookmarks').mockResolvedValue();
  });

  it('loads, sorts, and saves bookmarks', async () => {
    const result = await sortAndSave('/fake/dir', 'title', 'asc');
    expect(bookmarksModule.loadBookmarks).toHaveBeenCalledWith('/fake/dir');
    expect(bookmarksModule.saveBookmarks).toHaveBeenCalled();
    expect(result[0].title).toBe('Apple Docs');
  });
});
