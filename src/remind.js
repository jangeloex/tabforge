import { loadBookmarks } from './bookmarks.js';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Returns bookmarks not visited since `olderThanDays` days ago.
 * A bookmark is considered stale if it has a `lastVisited` field that is old,
 * or if it has never been visited (no `lastVisited` field) and was added
 * more than `olderThanDays` days ago.
 */
export function getStaleBookmarks(bookmarks, olderThanDays = 30) {
  const cutoff = Date.now() - olderThanDays * MS_PER_DAY;
  return bookmarks.filter((b) => {
    const ref = b.lastVisited ?? b.addedAt;
    if (!ref) return false;
    return new Date(ref).getTime() < cutoff;
  });
}

/**
 * Marks a bookmark as visited by URL, updating its `lastVisited` timestamp.
 */
export function markVisited(bookmarks, url) {
  const idx = bookmarks.findIndex((b) => b.url === url);
  if (idx === -1) return bookmarks;
  const updated = [...bookmarks];
  updated[idx] = { ...updated[idx], lastVisited: new Date().toISOString() };
  return updated;
}

/**
 * Loads bookmarks from the store and returns stale ones.
 */
export async function loadStaleBookmarks(configDir, olderThanDays = 30) {
  const bookmarks = await loadBookmarks(configDir);
  return getStaleBookmarks(bookmarks, olderThanDays);
}
