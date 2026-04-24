import { describe, it, expect } from 'vitest';
import { computeStats } from './stats.js';

const sampleBookmarks = [
  { url: 'https://github.com/user/repo', title: 'Repo', tags: ['dev', 'git'] },
  { url: 'https://news.ycombinator.com', title: 'HN', tags: ['news'] },
  { url: 'https://github.com/other/proj', title: 'Proj', tags: ['dev'] },
  { url: 'https://example.com/page', title: 'Example', tags: [] },
  { url: 'not-a-valid-url', title: 'Bad URL', tags: ['misc'] },
];

describe('computeStats', () => {
  it('returns zeroed stats for empty array', () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.tagged).toBe(0);
    expect(stats.untagged).toBe(0);
    expect(stats.topTags).toEqual([]);
  });

  it('counts total correctly', () => {
    const stats = computeStats(sampleBookmarks);
    expect(stats.total).toBe(5);
  });

  it('counts tagged and untagged', () => {
    const stats = computeStats(sampleBookmarks);
    expect(stats.tagged).toBe(4);
    expect(stats.untagged).toBe(1);
  });

  it('returns top tags sorted by count', () => {
    const stats = computeStats(sampleBookmarks);
    expect(stats.topTags[0].tag).toBe('dev');
    expect(stats.topTags[0].count).toBe(2);
  });

  it('computes average tags per bookmark', () => {
    const stats = computeStats(sampleBookmarks);
    // tags: 2+1+1+0+1 = 5, avg = 5/5 = 1
    expect(stats.avgTagsPerBookmark).toBe(1);
  });

  it('aggregates domain counts, stripping www', () => {
    const stats = computeStats(sampleBookmarks);
    expect(stats.domains['github.com']).toBe(2);
    expect(stats.domains['news.ycombinator.com']).toBe(1);
    expect(stats.domains['example.com']).toBe(1);
  });

  it('ignores invalid URLs in domain count', () => {
    const stats = computeStats(sampleBookmarks);
    expect(Object.keys(stats.domains)).not.toContain('not-a-valid-url');
  });
});
