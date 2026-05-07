import { describe, it, expect } from 'vitest';
import {
  setExpiry,
  clearExpiry,
  getExpiredBookmarks,
  getExpiringBookmarks,
  pruneExpired,
} from './expiry.js';

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

const base = [
  { url: 'https://a.com', title: 'A' },
  { url: 'https://b.com', title: 'B', expiresAt: daysFromNow(-1) },
  { url: 'https://c.com', title: 'C', expiresAt: daysFromNow(3) },
  { url: 'https://d.com', title: 'D', expiresAt: daysFromNow(10) },
];

describe('setExpiry', () => {
  it('sets expiresAt on matching bookmark', () => {
    const result = setExpiry(base, 'https://a.com', '2099-01-01');
    expect(result.find(b => b.url === 'https://a.com').expiresAt).toBe('2099-01-01T00:00:00.000Z');
  });

  it('leaves other bookmarks unchanged', () => {
    const result = setExpiry(base, 'https://a.com', '2099-01-01');
    expect(result.find(b => b.url === 'https://b.com').expiresAt).toBe(base[1].expiresAt);
  });
});

describe('clearExpiry', () => {
  it('removes expiresAt from matching bookmark', () => {
    const result = clearExpiry(base, 'https://b.com');
    expect(result.find(b => b.url === 'https://b.com').expiresAt).toBeUndefined();
  });

  it('does not affect bookmarks without expiry', () => {
    const result = clearExpiry(base, 'https://a.com');
    expect(result.find(b => b.url === 'https://a.com')).not.toHaveProperty('expiresAt');
  });
});

describe('getExpiredBookmarks', () => {
  it('returns bookmarks whose expiresAt is in the past', () => {
    const expired = getExpiredBookmarks(base);
    expect(expired.map(b => b.url)).toContain('https://b.com');
    expect(expired.map(b => b.url)).not.toContain('https://c.com');
  });
});

describe('getExpiringBookmarks', () => {
  it('returns bookmarks expiring within N days', () => {
    const expiring = getExpiringBookmarks(base, 7);
    expect(expiring.map(b => b.url)).toContain('https://c.com');
    expect(expiring.map(b => b.url)).not.toContain('https://d.com');
  });

  it('excludes already expired bookmarks', () => {
    const expiring = getExpiringBookmarks(base, 7);
    expect(expiring.map(b => b.url)).not.toContain('https://b.com');
  });
});

describe('pruneExpired', () => {
  it('removes expired bookmarks', () => {
    const pruned = pruneExpired(base);
    expect(pruned.map(b => b.url)).not.toContain('https://b.com');
  });

  it('keeps non-expired and no-expiry bookmarks', () => {
    const pruned = pruneExpired(base);
    expect(pruned.map(b => b.url)).toContain('https://a.com');
    expect(pruned.map(b => b.url)).toContain('https://c.com');
  });
});
