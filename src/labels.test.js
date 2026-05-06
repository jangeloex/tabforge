import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLabels, addLabel, removeLabel, listAllLabels, getBookmarksByLabel } from './labels.js';
import * as bookmarksModule from './bookmarks.js';

const makeConfig = () => ({ store: '/tmp/tabforge-test' });

const sampleBookmarks = () => [
  { url: 'https://example.com', title: 'Example', labels: ['work', 'reference'] },
  { url: 'https://news.ycombinator.com', title: 'HN', labels: ['tech'] },
  { url: 'https://github.com', title: 'GitHub', labels: [] },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('getLabels', () => {
  it('returns map of url to labels for bookmarks with labels', () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(sampleBookmarks());
    const result = getLabels(makeConfig());
    expect(result['https://example.com']).toEqual(['work', 'reference']);
    expect(result['https://news.ycombinator.com']).toEqual(['tech']);
    expect(result['https://github.com']).toBeUndefined();
  });
});

describe('addLabel', () => {
  it('adds a new label to a bookmark', () => {
    const bms = sampleBookmarks();
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(bms);
    const save = vi.spyOn(bookmarksModule, 'saveBookmarks').mockImplementation(() => {});
    const result = addLabel(makeConfig(), 'https://github.com', 'Dev');
    expect(result).toBe(true);
    expect(bms[2].labels).toContain('dev');
    expect(save).toHaveBeenCalled();
  });

  it('returns false if label already exists', () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(sampleBookmarks());
    vi.spyOn(bookmarksModule, 'saveBookmarks').mockImplementation(() => {});
    const result = addLabel(makeConfig(), 'https://example.com', 'work');
    expect(result).toBe(false);
  });

  it('returns false if url not found', () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(sampleBookmarks());
    const result = addLabel(makeConfig(), 'https://notfound.io', 'tag');
    expect(result).toBe(false);
  });
});

describe('removeLabel', () => {
  it('removes an existing label', () => {
    const bms = sampleBookmarks();
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(bms);
    vi.spyOn(bookmarksModule, 'saveBookmarks').mockImplementation(() => {});
    const result = removeLabel(makeConfig(), 'https://example.com', 'work');
    expect(result).toBe(true);
    expect(bms[0].labels).not.toContain('work');
  });

  it('returns false if label not present', () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(sampleBookmarks());
    const result = removeLabel(makeConfig(), 'https://example.com', 'nonexistent');
    expect(result).toBe(false);
  });
});

describe('listAllLabels', () => {
  it('returns sorted unique labels', () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(sampleBookmarks());
    const labels = listAllLabels(makeConfig());
    expect(labels).toEqual(['reference', 'tech', 'work']);
  });
});

describe('getBookmarksByLabel', () => {
  it('returns bookmarks matching the label', () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(sampleBookmarks());
    const result = getBookmarksByLabel(makeConfig(), 'work');
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://example.com');
  });

  it('returns empty array when no matches', () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockReturnValue(sampleBookmarks());
    const result = getBookmarksByLabel(makeConfig(), 'nolabel');
    expect(result).toHaveLength(0);
  });
});
