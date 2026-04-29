import { describe, it, expect, vi, beforeEach } from 'vitest';
import { applyTemplate, listTemplates, templateSummary } from './template.js';
import * as bookmarksModule from './bookmarks.js';

const SAMPLE = [
  { id: '1', url: 'https://a.com', title: 'A', pinned: true,  tags: ['js'],     group: 'dev',  addedAt: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: '2', url: 'https://b.com', title: 'B', pinned: false, tags: ['css'],    group: 'dev',  addedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
  { id: '3', url: 'https://c.com', title: 'C', pinned: false, tags: ['js','ts'],group: 'misc', addedAt: new Date(Date.now() - 3 * 86400000).toISOString() },
];

beforeEach(() => {
  vi.spyOn(bookmarksModule, 'loadBookmarks').mockResolvedValue(SAMPLE);
});

describe('listTemplates', () => {
  it('returns known template names', () => {
    const names = listTemplates();
    expect(names).toContain('pinned');
    expect(names).toContain('tagged');
    expect(names).toContain('group');
    expect(names).toContain('recent');
    expect(names).toContain('all');
  });
});

describe('applyTemplate', () => {
  it('all returns every bookmark', async () => {
    const result = await applyTemplate('all');
    expect(result).toHaveLength(3);
  });

  it('pinned filters to pinned bookmarks', async () => {
    const result = await applyTemplate('pinned');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('tagged filters by tag', async () => {
    const result = await applyTemplate('tagged', { tag: 'js' });
    expect(result.map((b) => b.id)).toEqual(['1', '3']);
  });

  it('group filters by group name', async () => {
    const result = await applyTemplate('group', { group: 'misc' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('recent uses default 7 days', async () => {
    const result = await applyTemplate('recent');
    // bookmark 2 is 10 days old, should be excluded
    expect(result.map((b) => b.id)).not.toContain('2');
    expect(result.map((b) => b.id)).toContain('1');
    expect(result.map((b) => b.id)).toContain('3');
  });

  it('recent respects custom days option', async () => {
    const result = await applyTemplate('recent', { days: 2 });
    expect(result.map((b) => b.id)).toEqual(['1']);
  });

  it('throws for unknown template', async () => {
    await expect(applyTemplate('nope')).rejects.toThrow('Unknown template');
  });
});

describe('templateSummary', () => {
  it('includes template name and bookmark count', () => {
    const summary = templateSummary('pinned', [SAMPLE[0]]);
    expect(summary).toContain('pinned');
    expect(summary).toContain('1');
  });

  it('lists tags in summary', () => {
    const summary = templateSummary('all', SAMPLE);
    expect(summary).toContain('js');
  });

  it('shows (none) when no tags', () => {
    const noTagBookmarks = [{ id: '9', url: 'https://x.com', title: 'X' }];
    const summary = templateSummary('all', noTagBookmarks);
    expect(summary).toContain('(none)');
  });
});
