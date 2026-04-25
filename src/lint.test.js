import { describe, it, expect } from 'vitest';
import { isValidUrl, lintBookmarks } from './lint.js';

describe('isValidUrl', () => {
  it('returns true for valid http URL', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('returns true for valid https URL', () => {
    expect(isValidUrl('https://example.com/path?q=1')).toBe(true);
  });

  it('returns false for ftp URL', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('returns false for null', () => {
    expect(isValidUrl(null)).toBe(false);
  });

  it('returns false for plain text', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });
});

describe('lintBookmarks', () => {
  it('returns empty array for clean bookmarks', () => {
    const bookmarks = [
      { url: 'https://example.com', title: 'Example', tags: ['web'] },
    ];
    expect(lintBookmarks(bookmarks)).toEqual([]);
  });

  it('flags missing URL', () => {
    const bookmarks = [{ title: 'No URL', tags: [] }];
    const issues = lintBookmarks(bookmarks);
    expect(issues).toHaveLength(1);
    expect(issues[0].problems).toContain('Invalid or missing URL');
  });

  it('flags invalid URL', () => {
    const bookmarks = [{ url: 'not-a-url', title: 'Bad URL' }];
    const issues = lintBookmarks(bookmarks);
    expect(issues[0].problems).toContain('Invalid or missing URL');
  });

  it('flags missing title', () => {
    const bookmarks = [{ url: 'https://example.com', title: '' }];
    const issues = lintBookmarks(bookmarks);
    expect(issues[0].problems).toContain('Missing title');
  });

  it('flags non-array tags', () => {
    const bookmarks = [{ url: 'https://example.com', title: 'Hi', tags: 'web' }];
    const issues = lintBookmarks(bookmarks);
    expect(issues[0].problems).toContain('Tags must be an array');
  });

  it('flags empty tag values', () => {
    const bookmarks = [{ url: 'https://example.com', title: 'Hi', tags: ['', 'valid'] }];
    const issues = lintBookmarks(bookmarks);
    expect(issues[0].problems).toContain('Tags contain empty or non-string values');
  });

  it('returns empty array for non-array input', () => {
    expect(lintBookmarks(null)).toEqual([]);
  });
});
