import fs from 'fs';
import { loadBookmarks, saveBookmarks } from './bookmarks.js';
import { recordVisit } from './history.js';

const WATCH_INTERVAL_MS = 5000;

/**
 * Returns a list of bookmarks modified after the given timestamp.
 */
export function getRecentlyModified(bookmarks, sinceMs) {
  return bookmarks.filter((b) => b.updatedAt && new Date(b.updatedAt).getTime() > sinceMs);
}

/**
 * Marks a bookmark as watched (sets lastWatched timestamp).
 */
export function markWatched(bookmarks, url) {
  const idx = bookmarks.findIndex((b) => b.url === url);
  if (idx === -1) return bookmarks;
  const updated = [...bookmarks];
  updated[idx] = { ...updated[idx], lastWatched: new Date().toISOString() };
  return updated;
}

/**
 * Returns bookmarks that have never been watched.
 */
export function getUnwatched(bookmarks) {
  return bookmarks.filter((b) => !b.lastWatched);
}

/**
 * Starts a polling watcher that calls onChange whenever bookmarks change on disk.
 * Returns a stop function.
 */
export function startWatcher(config, onChange) {
  let lastMtime = 0;

  const check = () => {
    try {
      const bookmarks = loadBookmarks(config);
      const mtime = Date.now();
      const changed = getRecentlyModified(bookmarks, lastMtime);
      if (changed.length > 0) {
        onChange(changed);
      }
      lastMtime = mtime;
    } catch (_) {
      // file may not exist yet
    }
  };

  const timer = setInterval(check, WATCH_INTERVAL_MS);
  return () => clearInterval(timer);
}
