import { describe, it, expect, beforeEach } from 'vitest';
import {
  setExpiry,
  clearExpiry,
  getExpiredBookmarks,
  getExpiringBookmarks,
  pruneExpired,
} from './expiry.js';

function makeBookmarks() {
  return [
    { url: 'https://a.com', title: 'A' },
    { url: 'https://b.com', title: 'B' },
    { url: 'https://c.com', title: 'C' },
  ];
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

describe('setExpiry', () => {
  it('sets expiresAt on a bookmark', () => {
    const bms = makeBookmarks();
    const result = setExpiry(bms, 'https://a.com', daysFromNow(5));
    expect(result[0].expiresAt).toBeDefined();
  });

  it('throws if bookmark not found', () => {
    expect(() => setExpiry(makeBookmarks(), 'https://z.com', daysFromNow(1))).toThrow();
  });
});

describe('clearExpiry', () => {
  it('removes expiresAt from a bookmark', () => {
    const bms = makeBookmarks();
    setExpiry(bms, 'https://a.com', daysFromNow(5));
    clearExpiry(bms, 'https://a.com');
    expect(bms[0].expiresAt).toBeUndefined();
  });

  it('throws if bookmark not found', () => {
    expect(() => clearExpiry(makeBookmarks(), 'https://z.com')).toThrow();
  });
});

describe('getExpiredBookmarks', () => {
  it('returns bookmarks past their expiry', () => {
    const bms = makeBookmarks();
    bms[0].expiresAt = daysFromNow(-3);
    bms[1].expiresAt = daysFromNow(2);
    const expired = getExpiredBookmarks(bms);
    expect(expired).toHaveLength(1);
    expect(expired[0].url).toBe('https://a.com');
  });

  it('returns empty if none expired', () => {
    const bms = makeBookmarks();
    expect(getExpiredBookmarks(bms)).toHaveLength(0);
  });
});

describe('getExpiringBookmarks', () => {
  it('returns bookmarks expiring within the window', () => {
    const bms = makeBookmarks();
    bms[0].expiresAt = daysFromNow(3);
    bms[1].expiresAt = daysFromNow(10);
    const soon = getExpiringBookmarks(bms, 7);
    expect(soon).toHaveLength(1);
    expect(soon[0].url).toBe('https://a.com');
  });
});

describe('pruneExpired', () => {
  it('removes expired bookmarks and returns them', () => {
    const bms = makeBookmarks();
    bms[0].expiresAt = daysFromNow(-1);
    const { pruned, bookmarks } = pruneExpired(bms);
    expect(pruned).toHaveLength(1);
    expect(bookmarks).toHaveLength(2);
  });

  it('returns all bookmarks if none expired', () => {
    const bms = makeBookmarks();
    const { pruned, bookmarks } = pruneExpired(bms);
    expect(pruned).toHaveLength(0);
    expect(bookmarks).toHaveLength(3);
  });
});
