import { describe, it, expect, beforeEach, vi } from 'vitest';
import { batchUpdate, batchRemove, batchTag } from './batch.js';
import * as bookmarksModule from './bookmarks.js';

const makeConfig = () => ({ store: '/tmp/tabforge-test' });

const sampleBookmarks = [
  { url: 'https://a.com', title: 'A', tags: ['x'] },
  { url: 'https://b.com', title: 'B', tags: [] },
  { url: 'https://c.com', title: 'C', tags: ['y'] },
];

beforeEach(() => {
  vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue(
    sampleBookmarks.map((b) => ({ ...b, tags: [...b.tags] }))
  );
  vi.spyOn(bookmarksModule, 'saveBookmarks').mockResolvedValue(undefined);
});

describe('batchUpdate', () => {
  it('applies transform to matched bookmarks', async () => {
    const config = makeConfig();
    const { updated, notFound } = await batchUpdate(
      config,
      ['https://a.com', 'https://b.com'],
      (bm) => ({ ...bm, title: bm.title + '!' })
    );
    expect(updated).toBe(2);
    expect(notFound).toHaveLength(0);
    const saved = bookmarksModule.saveBookmarks.mock.calls[0][1];
    expect(saved.find((b) => b.url === 'https://a.com').title).toBe('A!');
  });

  it('reports not found urls', async () => {
    const config = makeConfig();
    const { updated, notFound } = await batchUpdate(
      config,
      ['https://missing.com'],
      (bm) => bm
    );
    expect(updated).toBe(0);
    expect(notFound).toContain('https://missing.com');
  });
});

describe('batchRemove', () => {
  it('removes matched bookmarks', async () => {
    const config = makeConfig();
    const { removed, notFound } = await batchRemove(config, [
      'https://a.com',
      'https://c.com',
    ]);
    expect(removed).toBe(2);
    expect(notFound).toHaveLength(0);
    const saved = bookmarksModule.saveBookmarks.mock.calls[0][1];
    expect(saved).toHaveLength(1);
    expect(saved[0].url).toBe('https://b.com');
  });
});

describe('batchTag', () => {
  it('merges tags without duplicates', async () => {
    const config = makeConfig();
    await batchTag(config, ['https://a.com'], ['x', 'z']);
    const saved = bookmarksModule.saveBookmarks.mock.calls[0][1];
    expect(saved.find((b) => b.url === 'https://a.com').tags).toEqual(['x', 'z']);
  });
});
