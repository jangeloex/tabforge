const { loadBookmarks, saveBookmarks } = require('./bookmarks');

/**
 * Rate a bookmark (1–5 stars).
 */
async function rateBookmark(configDir, url, rating) {
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be an integer between 1 and 5');
  }
  const bookmarks = await loadBookmarks(configDir);
  const bookmark = bookmarks.find((b) => b.url === url);
  if (!bookmark) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  bookmark.rating = rating;
  bookmark.ratedAt = new Date().toISOString();
  await saveBookmarks(configDir, bookmarks);
  return bookmark;
}

/**
 * Remove the rating from a bookmark.
 */
async function unrateBookmark(configDir, url) {
  const bookmarks = await loadBookmarks(configDir);
  const bookmark = bookmarks.find((b) => b.url === url);
  if (!bookmark) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  delete bookmark.rating;
  delete bookmark.ratedAt;
  await saveBookmarks(configDir, bookmarks);
  return bookmark;
}

/**
 * Return bookmarks sorted by rating descending.
 * Unrated bookmarks appear last.
 */
function getTopRated(bookmarks, limit = 10) {
  return [...bookmarks]
    .filter((b) => typeof b.rating === 'number')
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

/**
 * Return average rating across all rated bookmarks.
 */
function averageRating(bookmarks) {
  const rated = bookmarks.filter((b) => typeof b.rating === 'number');
  if (rated.length === 0) return null;
  const sum = rated.reduce((acc, b) => acc + b.rating, 0);
  return Math.round((sum / rated.length) * 100) / 100;
}

module.exports = { rateBookmark, unrateBookmark, getTopRated, averageRating };
