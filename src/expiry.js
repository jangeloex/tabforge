import { loadBookmarks, saveBookmarks } from './bookmarks.js';

export function setExpiry(bookmarks, url, date) {
  const bm = bookmarks.find(b => b.url === url);
  if (!bm) throw new Error(`Bookmark not found: ${url}`);
  bm.expiresAt = new Date(date).toISOString();
  return bookmarks;
}

export function clearExpiry(bookmarks, url) {
  const bm = bookmarks.find(b => b.url === url);
  if (!bm) throw new Error(`Bookmark not found: ${url}`);
  delete bm.expiresAt;
  return bookmarks;
}

export function getExpiredBookmarks(bookmarks) {
  const now = new Date();
  return bookmarks.filter(b => b.expiresAt && new Date(b.expiresAt) < now);
}

export function getExpiringBookmarks(bookmarks, withinDays = 7) {
  const now = new Date();
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);
  return bookmarks.filter(b => {
    if (!b.expiresAt) return false;
    const exp = new Date(b.expiresAt);
    return exp >= now && exp <= cutoff;
  });
}

export function pruneExpired(bookmarks) {
  const expired = getExpiredBookmarks(bookmarks);
  const remaining = bookmarks.filter(b => !b.expiresAt || new Date(b.expiresAt) >= new Date());
  return { pruned: expired, bookmarks: remaining };
}
