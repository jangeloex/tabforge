import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Get the rating for a bookmark by URL (1-5, or null if unrated)
 */
export function getRating(bookmarks, url) {
  const bm = bookmarks.find((b) => b.url === url);
  if (!bm) return null;
  return bm.rating ?? null;
}

/**
 * Set the rating for a bookmark by URL. Rating must be 1-5.
 */
export function setRating(bookmarks, url, rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new RangeError(`Rating must be an integer between 1 and 5, got: ${rating}`);
  }
  const idx = bookmarks.findIndex((b) => b.url === url);
  if (idx === -1) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  const updated = bookmarks.map((b, i) =>
    i === idx ? { ...b, rating } : b
  );
  return updated;
}

/**
 * Remove the rating from a bookmark by URL.
 */
export function clearRating(bookmarks, url) {
  const idx = bookmarks.findIndex((b) => b.url === url);
  if (idx === -1) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  return bookmarks.map((b, i) => {
    if (i !== idx) return b;
    const { rating, ...rest } = b;
    return rest;
  });
}

/**
 * Return bookmarks sorted by rating descending (unrated last).
 */
export function getTopRated(bookmarks, limit = 10) {
  return [...bookmarks]
    .filter((b) => typeof b.rating === 'number')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Return average rating across all rated bookmarks, or null if none.
 */
export function averageRating(bookmarks) {
  const rated = bookmarks.filter((b) => typeof b.rating === 'number');
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, b) => acc + b.rating, 0);
  return Math.round((sum / rated.length) * 100) / 100;
}
