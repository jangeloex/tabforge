import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getTagsFromBookmarks,
  addTagToBookmark,
  removeTagFromBookmark,
  getBookmarksByTag,
} from './tags.js';
import * as bookmarksModule from './bookmarks.js';

const sampleBookmarks = [
  { url: 'https://example.com', title: 'Example', tags: ['dev', 'tools'] },
  { url: 'https://github.com', title: 'GitHub', tags: ['dev'] },
  { url: 'https://news.ycombinator.com', title: 'HN', tags: [] },
];

beforeEach(() => {
  vi.restoreAllMocks();
});

describe('getTagsFromBookmarks', () => {
  it('returns sorted unique tags', () => {
    const tags = getTagsFromBookmarks(sampleBookmarks);
    expect(tags).toEqual(['dev', 'tools']);
  });

  it('returns empty array for no tags', () => {
    expect(getTagsFromBookmarks([{ url: 'x', tags: [] }])).toEqual([]);
  });
});

describe('addTagToBookmark', () => {
  it('adds a tag to an existing bookmark', async () => {
    const bms = JSON.parse(JSON.stringify(sampleBookmarks));
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue(bms);
    vi.spyOn(bookmarksModule, 'saveBookmarks').mockResolvedValue();
    const result = await addTagToBookmark('/cfg', 'https://github.com', 'vcs');
    expect(result.tags).toContain('vcs');
    expect(bookmarksModule.saveBookmarks).toHaveBeenCalled();
  });

  it('throws if bookmark not found', async () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue([]);
    await expect(addTagToBookmark('/cfg', 'https://nope.com', 'x')).rejects.toThrow('Bookmark not found');
  });

  it('does not duplicate existing tag', async () => {
    const bms = JSON.parse(JSON.stringify(sampleBookmarks));
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue(bms);
    vi.spyOn(bookmarksModule, 'saveBookmarks').mockResolvedValue();
    const result = await addTagToBookmark('/cfg', 'https://example.com', 'dev');
    expect(result.tags.filter(t => t === 'dev').length).toBe(1);
  });
});

describe('removeTagFromBookmark', () => {
  it('removes a tag from a bookmark', async () => {
    const bms = JSON.parse(JSON.stringify(sampleBookmarks));
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue(bms);
    vi.spyOn(bookmarksModule, 'saveBookmarks').mockResolvedValue();
    const result = await removeTagFromBookmark('/cfg', 'https://example.com', 'tools');
    expect(result.tags).not.toContain('tools');
  });
});

describe('getBookmarksByTag', () => {
  it('filters bookmarks by tag', async () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue(sampleBookmarks);
    const results = await getBookmarksByTag('/cfg', 'dev');
    expect(results.length).toBe(2);
  });

  it('returns empty array if no matches', async () => {
    vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue(sampleBookmarks);
    const results = await getBookmarksByTag('/cfg', 'nonexistent');
    expect(results).toEqual([]);
  });
});
