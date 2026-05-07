// Bookmark relevance scoring based on multiple signals

const DEFAULT_WEIGHTS = {
  rating: 0.3,
  visits: 0.25,
  recency: 0.2,
  priority: 0.15,
  favorite: 0.1,
};

function normalizeVisits(visits, maxVisits) {
  if (!maxVisits || maxVisits === 0) return 0;
  return Math.min(visits / maxVisits, 1);
}

function normalizeRecency(lastVisited) {
  if (!lastVisited) return 0;
  const daysSince = (Date.now() - new Date(lastVisited).getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, 1 - daysSince / 365);
}

function normalizePriority(priority) {
  const map = { high: 1, medium: 0.5, low: 0.1 };
  return map[priority] ?? 0;
}

function scoreBookmark(bookmark, maxVisits = 1, weights = DEFAULT_WEIGHTS) {
  const ratingScore = ((bookmark.rating ?? 0) / 5) * weights.rating;
  const visitScore = normalizeVisits(bookmark.visits ?? 0, maxVisits) * weights.visits;
  const recencyScore = normalizeRecency(bookmark.lastVisited) * weights.recency;
  const priorityScore = normalizePriority(bookmark.priority) * weights.priority;
  const favoriteScore = (bookmark.favorite ? 1 : 0) * weights.favorite;

  return parseFloat(
    (ratingScore + visitScore + recencyScore + priorityScore + favoriteScore).toFixed(4)
  );
}

function scoreBookmarks(bookmarks, weights = DEFAULT_WEIGHTS) {
  const maxVisits = Math.max(...bookmarks.map((b) => b.visits ?? 0), 1);
  return bookmarks.map((b) => ({
    ...b,
    _score: scoreBookmark(b, maxVisits, weights),
  }));
}

function rankBookmarks(bookmarks, weights = DEFAULT_WEIGHTS) {
  return scoreBookmarks(bookmarks, weights).sort((a, b) => b._score - a._score);
}

module.exports = { scoreBookmark, scoreBookmarks, rankBookmarks, DEFAULT_WEIGHTS };
