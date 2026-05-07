import { loadBookmarks, saveBookmarks } from './bookmarks.js';

export function setExpiry(bookmarks, url, date) {
  return bookmarks.map(b =>
    b.url === url ? { ...b, expiresAt: new Date(date).toISOString() } : b
  );
}

export function clearExpiry(bookmarks, url) {
  return bookmarks.map(b => {
    if (b.url !== url) return b;
    const { expiresAt, ...rest } = b;
    return rest;
  });
}

export function getExpiredBookmarks(bookmarks, now = new Date()) {
  return bookmarks.filter(b => b.expiresAt && new Date(b.expiresAt) <= now);
}

export function getExpiringBookmarks(bookmarks, withinDays = 7, now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + withinDays);
  return bookmarks.filter(b => {
    if (!b.expiresAt) return false;
    const exp = new Date(b.expiresAt);
    return exp > now && exp <= cutoff;
  });
}

export function pruneExpired(bookmarks, now = new Date()) {
  return bookmarks.filter(b => !b.expiresAt || new Date(b.expiresAt) > now);
}
