import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Set an expiry date on a bookmark by URL.
 */
export function setExpiry(bookmarks, url, expiryDate) {
  const bm = bookmarks.find(b => b.url === url);
  if (!bm) throw new Error(`Bookmark not found: ${url}`);
  bm.expiresAt = expiryDate instanceof Date ? expiryDate.toISOString() : expiryDate;
  return bookmarks;
}

/**
 * Clear the expiry date from a bookmark.
 */
export function clearExpiry(bookmarks, url) {
  const bm = bookmarks.find(b => b.url === url);
  if (!bm) throw new Error(`Bookmark not found: ${url}`);
  delete bm.expiresAt;
  return bookmarks;
}

/**
 * Return bookmarks that have expired as of `now` (default: current time).
 */
export function getExpiredBookmarks(bookmarks, now = new Date()) {
  return bookmarks.filter(b => {
    if (!b.expiresAt) return false;
    return new Date(b.expiresAt) <= now;
  });
}

/**
 * Return bookmarks expiring within `days` days from `now`.
 */
export function getExpiringBookmarks(bookmarks, days = 7, now = new Date()) {
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return bookmarks.filter(b => {
    if (!b.expiresAt) return false;
    const exp = new Date(b.expiresAt);
    return exp > now && exp <= cutoff;
  });
}

/**
 * Remove all expired bookmarks and return the pruned list.
 */
export function pruneExpired(bookmarks, now = new Date()) {
  return bookmarks.filter(b => {
    if (!b.expiresAt) return true;
    return new Date(b.expiresAt) > now;
  });
}
