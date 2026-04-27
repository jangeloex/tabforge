import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getAliases, setAlias, removeAlias, resolveAlias } from './alias.js';

vi.mock('./bookmarks.js', () => ({
  loadBookmarks: vi.fn(),
  saveBookmarks: vi.fn(),
}));

import { loadBookmarks, saveBookmarks } from './bookmarks.js';

const sampleBookmarks = [
  { id: '1', title: 'GitHub', url: 'https://github.com', alias: 'gh' },
  { id: '2', title: 'MDN', url: 'https://developer.mozilla.org' },
  { id: '3', title: 'NPM', url: 'https://npmjs.com', alias: 'npm' },
];

beforeEach(() => {
  vi.clearAllMocks();
  loadBookmarks.mockResolvedValue(structuredClone(sampleBookmarks));
  saveBookmarks.mockResolvedValue();
});

describe('getAliases', () => {
  it('returns a map of alias to id', () => {
    const result = getAliases(sampleBookmarks);
    expect(result).toEqual({ gh: '1', npm: '3' });
  });

  it('returns empty object when no aliases', () => {
    expect(getAliases([{ id: '1', title: 'A', url: 'https://a.com' }])).toEqual({});
  });
});

describe('setAlias', () => {
  it('sets alias on a bookmark', async () => {
    const bm = await setAlias('/config', '2', 'mdn');
    expect(bm.alias).toBe('mdn');
    expect(saveBookmarks).toHaveBeenCalled();
  });

  it('throws if alias already taken by another bookmark', async () => {
    await expect(setAlias('/config', '2', 'gh')).rejects.toThrow('already used');
  });

  it('throws if bookmark id not found', async () => {
    await expect(setAlias('/config', 'nope', 'x')).rejects.toThrow('not found');
  });

  it('allows reassigning same alias to same bookmark', async () => {
    const bm = await setAlias('/config', '1', 'gh');
    expect(bm.alias).toBe('gh');
  });
});

describe('removeAlias', () => {
  it('removes alias from bookmark', async () => {
    const bm = await removeAlias('/config', '1');
    expect(bm.alias).toBeUndefined();
    expect(saveBookmarks).toHaveBeenCalled();
  });

  it('throws if bookmark not found', async () => {
    await expect(removeAlias('/config', 'bad')).rejects.toThrow('not found');
  });
});

describe('resolveAlias', () => {
  it('returns bookmark matching alias', () => {
    const bm = resolveAlias(sampleBookmarks, 'gh');
    expect(bm.id).toBe('1');
  });

  it('returns null for unknown alias', () => {
    expect(resolveAlias(sampleBookmarks, 'unknown')).toBeNull();
  });
});
