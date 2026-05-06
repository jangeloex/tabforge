import { describe, it, expect, beforeEach } from 'vitest';
import {
  setExpiry,
  clearExpiry,
  getExpiredBookmarks,
  getExpiringBookmarks,
  pruneExpired,
} from './expiry.js';

const NOW = new Date('2024-06-01T12:00:00Z');

function makeBookmarks() {
  return [
    { url: 'https://a.com', title: 'A' },
    { url: 'https://b.com', title: 'B', expiresAt: '2024-05-30T00:00:00Z' }, // expired
    { url: 'https://c.com', title: 'C', expiresAt: '2024-06-05T00:00:00Z' }, // expires in 4 days
    { url: 'https://d.com', title: 'D', expiresAt: '2024-06-15T00:00:00Z' }, // expires in 14 days
  ];
}

describe('setExpiry', () => {
  it('sets expiresAt as ISO string on the matching bookmark', () => {
    const bms = makeBookmarks();
    setExpiry(bms, 'https://a.com', new Date('2024-07-01T00:00:00Z'));
    expect(bms[0].expiresAt).toBe('2024-07-01T00:00:00.000Z');
  });

  it('accepts a string date directly', () => {
    const bms = makeBookmarks();
    setExpiry(bms, 'https://a.com', '2024-08-01T00:00:00Z');
    expect(bms[0].expiresAt).toBe('2024-08-01T00:00:00Z');
  });

  it('throws if bookmark not found', () => {
    expect(() => setExpiry(makeBookmarks(), 'https://missing.com', '2024-07-01')).toThrow();
  });
});

describe('clearExpiry', () => {
  it('removes expiresAt from a bookmark', () => {
    const bms = makeBookmarks();
    clearExpiry(bms, 'https://b.com');
    expect(bms[1].expiresAt).toBeUndefined();
  });

  it('throws if bookmark not found', () => {
    expect(() => clearExpiry(makeBookmarks(), 'https://nope.com')).toThrow();
  });
});

describe('getExpiredBookmarks', () => {
  it('returns only bookmarks past their expiry', () => {
    const expired = getExpiredBookmarks(makeBookmarks(), NOW);
    expect(expired).toHaveLength(1);
    expect(expired[0].url).toBe('https://b.com');
  });

  it('returns empty array when none expired', () => {
    const bms = [{ url: 'https://a.com', title: 'A' }];
    expect(getExpiredBookmarks(bms, NOW)).toHaveLength(0);
  });
});

describe('getExpiringBookmarks', () => {
  it('returns bookmarks expiring within the window', () => {
    const soon = getExpiringBookmarks(makeBookmarks(), 7, NOW);
    expect(soon).toHaveLength(1);
    expect(soon[0].url).toBe('https://c.com');
  });

  it('excludes already expired bookmarks', () => {
    const soon = getExpiringBookmarks(makeBookmarks(), 30, NOW);
    const urls = soon.map(b => b.url);
    expect(urls).not.toContain('https://b.com');
  });
});

describe('pruneExpired', () => {
  it('removes expired bookmarks', () => {
    const pruned = pruneExpired(makeBookmarks(), NOW);
    expect(pruned.find(b => b.url === 'https://b.com')).toBeUndefined();
  });

  it('keeps non-expired and no-expiry bookmarks', () => {
    const pruned = pruneExpired(makeBookmarks(), NOW);
    expect(pruned).toHaveLength(3);
  });
});
