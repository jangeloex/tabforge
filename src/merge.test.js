import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mergeBookmarks } from './merge.js';

const base = [
  { url: 'https://a.com', title: 'A', tags: ['news'], createdAt: '2024-01-01T00:00:00Z' },
  { url: 'https://b.com', title: 'B', tags: [], createdAt: '2024-01-02T00:00:00Z' },
];

describe('mergeBookmarks', () => {
  it('adds new bookmarks not in base', () => {
    const incoming = [
      { url: 'https://c.com', title: 'C', tags: ['dev'], createdAt: '2024-02-01T00:00:00Z' },
    ];
    const { merged, added, updated, skipped } = mergeBookmarks(base, incoming);
    expect(added).toBe(1);
    expect(updated).toBe(0);
    expect(merged).toHaveLength(3);
    expect(merged.find(b => b.url === 'https://c.com')).toBeTruthy();
  });

  it('updates existing bookmark when incoming is newer', () => {
    const incoming = [
      { url: 'https://a.com', title: 'A Updated', tags: ['tech'], createdAt: '2025-01-01T00:00:00Z' },
    ];
    const { merged, updated } = mergeBookmarks(base, incoming);
    expect(updated).toBe(1);
    const a = merged.find(b => b.url === 'https://a.com');
    expect(a.title).toBe('A Updated');
    expect(a.tags).toContain('news');
    expect(a.tags).toContain('tech');
  });

  it('skips update when incoming is older', () => {
    const incoming = [
      { url: 'https://a.com', title: 'Old A', tags: [], createdAt: '2020-01-01T00:00:00Z' },
    ];
    const { merged, skipped } = mergeBookmarks(base, incoming);
    expect(skipped).toBe(1);
    const a = merged.find(b => b.url === 'https://a.com');
    expect(a.title).toBe('A');
  });

  it('merges tags as union regardless of precedence', () => {
    const incoming = [
      { url: 'https://b.com', title: 'B', tags: ['work'], createdAt: '2024-01-02T00:00:00Z' },
    ];
    const { merged } = mergeBookmarks(base, incoming);
    const b = merged.find(bm => bm.url === 'https://b.com');
    expect(b.tags).toContain('work');
  });

  it('skips bookmarks with no URL', () => {
    const incoming = [{ title: 'No URL', tags: [] }];
    const { skipped, merged } = mergeBookmarks(base, incoming);
    expect(skipped).toBe(1);
    expect(merged).toHaveLength(2);
  });

  it('returns empty merged for empty inputs', () => {
    const { merged, added } = mergeBookmarks([], []);
    expect(merged).toHaveLength(0);
    expect(added).toBe(0);
  });
});
