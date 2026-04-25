import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchBookmarks, searchInStore } from './search.js';
import * as bookmarksModule from './bookmarks.js';

const SAMPLE_BOOKMARKS = [
  { id: '1', title: 'GitHub', url: 'https://github.com', tags: ['dev', 'git'] },
  { id: '2', title: 'MDN Web Docs', url: 'https://developer.mozilla.org', tags: ['dev', 'docs'] },
  { id: '3', title: 'Hacker News', url: 'https://news.ycombinator.com', tags: ['news'] },
  { id: '4', title: 'OpenAI', url: 'https://openai.com', tags: ['ai'] },
];

describe('searchBookmarks', () => {
  it('returns all bookmarks when query is empty', () => {
    const results = searchBookmarks(SAMPLE_BOOKMARKS, '');
    expect(results).toHaveLength(4);
  });

  it('matches by title (case-insensitive)', () => {
    const results = searchBookmarks(SAMPLE_BOOKMARKS, 'github');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('GitHub');
  });

  it('matches by url', () => {
    const results = searchBookmarks(SAMPLE_BOOKMARKS, 'mozilla');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('MDN Web Docs');
  });

  it('matches by tag', () => {
    const results = searchBookmarks(SAMPLE_BOOKMARKS, 'git');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some(b => b.title === 'GitHub')).toBe(true);
  });

  it('returns multiple matches', () => {
    const results = searchBookmarks(SAMPLE_BOOKMARKS, 'dev');
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  it('filters by tag', () => {
    const results = searchBookmarks(SAMPLE_BOOKMARKS, '', { tag: 'dev' });
    expect(results).toHaveLength(2);
  });

  it('combines tag filter and query', () => {
    const results = searchBookmarks(SAMPLE_BOOKMARKS, 'github', { tag: 'dev' });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('GitHub');
  });

  it('respects caseSensitive option', () => {
    const sensitive = searchBookmarks(SAMPLE_BOOKMARKS, 'github', { caseSensitive: true });
    expect(sensitive).toHaveLength(0);

    const insensitive = searchBookmarks(SAMPLE_BOOKMARKS, 'github', { caseSensitive: false });
    expect(insensitive).toHaveLength(1);
  });

  it('returns empty array when no matches', () => {
    const results = searchBookmarks(SAMPLE_BOOKMARKS, 'zzznomatch');
    expect(results).toHaveLength(0);
  });

  it('returns empty array for empty bookmark list', () => {
    const results = searchBookmarks([], 'github');
    expect(results).toHaveLength(0);
  });
});

describe('searchInStore', () => {
  beforeEach(() => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue(SAMPLE_BOOKMARKS);
  });

  it('loads bookmarks and searches them', async () => {
    const results = await searchInStore('/fake/path', 'hacker');
    expect(bookmarksModule.loadBookmarks).toHaveBeenCalledWith('/fake/path');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Hacker News');
  });

  it('passes options through', async () => {
    const results = await searchInStore('/fake/path', '', { tag: 'ai' });
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('OpenAI');
  });
});
