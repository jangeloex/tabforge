import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildDigest, formatDigest } from './digest.js';

vi.mock('./bookmarks.js', () => ({
  loadBookmarks: vi.fn(),
}));
vi.mock('./stats.js', () => ({ computeStats: vi.fn() }));
vi.mock('./rating.js', () => ({ getTopRated: vi.fn() }));
vi.mock('./pin.js', () => ({ getPinnedBookmarks: vi.fn() }));
vi.mock('./remind.js', () => ({ getStaleBookmarks: vi.fn() }));

import { loadBookmarks } from './bookmarks.js';
import { computeStats } from './stats.js';
import { getTopRated } from './rating.js';
import { getPinnedBookmarks } from './pin.js';
import { getStaleBookmarks } from './remind.js';

const sampleBookmarks = [
  { id: '1', title: 'Alpha', url: 'https://alpha.com', createdAt: '2024-01-10T00:00:00Z', rating: 5 },
  { id: '2', title: 'Beta', url: 'https://beta.com', createdAt: '2024-02-01T00:00:00Z', rating: 3 },
];

beforeEach(() => {
  loadBookmarks.mockResolvedValue(sampleBookmarks);
  computeStats.mockReturnValue({ total: 2, uniqueTags: 4 });
  getTopRated.mockReturnValue([sampleBookmarks[0]]);
  getPinnedBookmarks.mockReturnValue([sampleBookmarks[1]]);
  getStaleBookmarks.mockReturnValue([]);
});

describe('buildDigest', () => {
  it('returns a digest with expected shape', async () => {
    const digest = await buildDigest({});
    expect(digest.totalBookmarks).toBe(2);
    expect(digest.totalTags).toBe(4);
    expect(digest.topRated).toHaveLength(1);
    expect(digest.topRated[0].title).toBe('Alpha');
    expect(digest.pinned[0].title).toBe('Beta');
    expect(digest.stale).toHaveLength(0);
    expect(digest.generatedAt).toBeTruthy();
  });

  it('sorts recentlyAdded by createdAt descending', async () => {
    const digest = await buildDigest({});
    const dates = digest.recentlyAdded.map((b) => b.createdAt);
    expect(dates[0] >= dates[1] || dates.length <= 1).toBe(true);
  });
});

describe('formatDigest', () => {
  it('includes section headers and bookmark titles', async () => {
    const digest = await buildDigest({});
    const output = formatDigest(digest);
    expect(output).toContain('Bookmark Digest');
    expect(output).toContain('Pinned');
    expect(output).toContain('Top Rated');
    expect(output).toContain('Alpha');
    expect(output).toContain('Beta');
  });

  it('omits stale section when empty', async () => {
    const digest = await buildDigest({});
    const output = formatDigest(digest);
    expect(output).not.toContain('Stale');
  });

  it('includes stale section when bookmarks are stale', async () => {
    getStaleBookmarks.mockReturnValue([{ title: 'Old', url: 'https://old.com' }]);
    const digest = await buildDigest({});
    const output = formatDigest(digest);
    expect(output).toContain('Stale');
    expect(output).toContain('Old');
  });
});
