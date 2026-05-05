/**
 * Priority management for bookmarks.
 * Priority levels: 1 (low) to 5 (high), default 3.
 */

const VALID_PRIORITIES = [1, 2, 3, 4, 5];
const DEFAULT_PRIORITY = 3;

const PRIORITY_LABELS = {
  1: 'low',
  2: 'below-normal',
  3: 'normal',
  4: 'high',
  5: 'critical',
};

/**
 * Set priority on a bookmark (mutates).
 */
function setPriority(bookmark, level) {
  const p = parseInt(level, 10);
  if (!VALID_PRIORITIES.includes(p)) {
    throw new Error(`Invalid priority: ${level}. Must be 1–5.`);
  }
  bookmark.priority = p;
  return bookmark;
}

/**
 * Remove priority from a bookmark (resets to default).
 */
function clearPriority(bookmark) {
  delete bookmark.priority;
  return bookmark;
}

/**
 * Get the effective priority of a bookmark.
 */
function getPriority(bookmark) {
  return bookmark.priority ?? DEFAULT_PRIORITY;
}

/**
 * Get a human-readable label for a priority level.
 */
function getPriorityLabel(level) {
  return PRIORITY_LABELS[level] ?? 'normal';
}

/**
 * Return bookmarks sorted by priority descending (highest first).
 */
function sortByPriority(bookmarks) {
  return [...bookmarks].sort((a, b) => getPriority(b) - getPriority(a));
}

/**
 * Filter bookmarks at or above a minimum priority level.
 */
function filterByMinPriority(bookmarks, minLevel) {
  const min = parseInt(minLevel, 10);
  return bookmarks.filter((b) => getPriority(b) >= min);
}

module.exports = {
  VALID_PRIORITIES,
  DEFAULT_PRIORITY,
  PRIORITY_LABELS,
  setPriority,
  clearPriority,
  getPriority,
  getPriorityLabel,
  sortByPriority,
  filterByMinPriority,
};
