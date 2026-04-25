import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renameBookmark, renameBookmarkUrl } from './rename.js';

vi.mock('./bookmarks.js', () => {
  let store = [];
  return {
    loadBookmarks: vi.fn(async () => [...store]),
    saveBookmarks: vi.fn(async (b) => { store = [...b]; }),
    __setStore: (b) => { store = [...b]; },
  };
});

import { loadBookmarks, saveBookmarks, __setStore } from './bookmarks.js';

const SAMPLE = [
  { url: 'https://example.com', title: 'Example', tags: [] },
  { url: 'https://other.com', title: 'Other', tags: ['dev'] },
];

beforeEach(() => {
  vi.clearAllMocks();
  __setStore(SAMPLE);
});

describe('renameBookmark', () => {
  it('renames the title of an existing bookmark', async () => {
    const result = await renameBookmark('https://example.com', 'New Title');
    expect(result.updated).toBe(true);
    expect(result.bookmark.title).toBe('New Title');
    expect(saveBookmarks).toHaveBeenCalled();
  });

  it('returns updated:false when url not found', async () => {
    const result = await renameBookmark('https://notfound.com', 'X');
    expect(result.updated).toBe(false);
    expect(result.bookmark).toBeNull();
    expect(saveBookmarks).not.toHaveBeenCalled();
  });

  it('throws when url or newTitle is missing', async () => {
    await expect(renameBookmark('', 'Title')).rejects.toThrow();
    await expect(renameBookmark('https://x.com', '')).rejects.toThrow();
  });
});

describe('renameBookmarkUrl', () => {
  it('renames the url of an existing bookmark', async () => {
    const result = await renameBookmarkUrl('https://example.com', 'https://new.com');
    expect(result.updated).toBe(true);
    expect(result.bookmark.url).toBe('https://new.com');
  });

  it('also updates title when provided', async () => {
    const result = await renameBookmarkUrl('https://example.com', 'https://new.com', 'New');
    expect(result.bookmark.title).toBe('New');
  });

  it('throws when new url already exists', async () => {
    await expect(
      renameBookmarkUrl('https://example.com', 'https://other.com')
    ).rejects.toThrow(/already exists/);
  });

  it('returns updated:false when old url not found', async () => {
    const result = await renameBookmarkUrl('https://ghost.com', 'https://new.com');
    expect(result.updated).toBe(false);
  });

  it('throws when args are missing', async () => {
    await expect(renameBookmarkUrl('', 'https://new.com')).rejects.toThrow();
  });
});
