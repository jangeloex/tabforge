import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Get all favorited bookmarks.
 */
export function getFavorites(config) {
  const bookmarks = loadBookmarks(config);
  return bookmarks.filter((b) => b.favorite === true);
}

/**
 * Mark a bookmark as favorite by URL.
 */
export function favoriteBookmark(config, url) {
  const bookmarks = loadBookmarks(config);
  const bookmark = bookmarks.find((b) => b.url === url);
  if (!bookmark) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  if (bookmark.favorite) {
    return false; // already favorited
  }
  bookmark.favorite = true;
  saveBookmarks(config, bookmarks);
  return true;
}

/**
 * Remove favorite status from a bookmark by URL.
 */
export function unfavoriteBookmark(config, url) {
  const bookmarks = loadBookmarks(config);
  const bookmark = bookmarks.find((b) => b.url === url);
  if (!bookmark) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  if (!bookmark.favorite) {
    return false; // not favorited
  }
  bookmark.favorite = false;
  saveBookmarks(config, bookmarks);
  return true;
}

/**
 * Toggle favorite status for a bookmark by URL.
 */
export function toggleFavorite(config, url) {
  const bookmarks = loadBookmarks(config);
  const bookmark = bookmarks.find((b) => b.url === url);
  if (!bookmark) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  bookmark.favorite = !bookmark.favorite;
  saveBookmarks(config, bookmarks);
  return bookmark.favorite;
}
