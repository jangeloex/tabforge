import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Get the note for a bookmark by URL.
 */
export function getNote(bookmarks, url) {
  const bm = bookmarks.find((b) => b.url === url);
  return bm ? bm.note || null : null;
}

/**
 * Set a note on a bookmark identified by URL.
 * Returns the updated bookmarks array, or throws if not found.
 */
export function setNote(bookmarks, url, note) {
  const idx = bookmarks.findIndex((b) => b.url === url);
  if (idx === -1) throw new Error(`Bookmark not found: ${url}`);
  const updated = [...bookmarks];
  updated[idx] = { ...updated[idx], note: note.trim() };
  return updated;
}

/**
 * Remove the note from a bookmark identified by URL.
 * Returns the updated bookmarks array, or throws if not found.
 */
export function removeNote(bookmarks, url) {
  const idx = bookmarks.findIndex((b) => b.url === url);
  if (idx === -1) throw new Error(`Bookmark not found: ${url}`);
  const updated = [...bookmarks];
  const { note: _removed, ...rest } = updated[idx];
  updated[idx] = rest;
  return updated;
}

/**
 * List all bookmarks that have a note attached.
 */
export function getBookmarksWithNotes(bookmarks) {
  return bookmarks.filter((b) => b.note && b.note.trim().length > 0);
}
