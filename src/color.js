/**
 * Color-coding / visual tagging for bookmarks.
 * Each bookmark can have a color label (e.g. 'red', 'blue', 'green').
 */

const VALID_COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'gray'];

function isValidColor(color) {
  return VALID_COLORS.includes(color);
}

function getColor(bookmark) {
  return bookmark.color || null;
}

function setColor(bookmarks, url, color) {
  if (!isValidColor(color)) {
    throw new Error(`Invalid color "${color}". Valid colors: ${VALID_COLORS.join(', ')}`);
  }
  const bm = bookmarks.find((b) => b.url === url);
  if (!bm) throw new Error(`Bookmark not found: ${url}`);
  bm.color = color;
  return bookmarks;
}

function clearColor(bookmarks, url) {
  const bm = bookmarks.find((b) => b.url === url);
  if (!bm) throw new Error(`Bookmark not found: ${url}`);
  delete bm.color;
  return bookmarks;
}

function getBookmarksByColor(bookmarks, color) {
  if (!isValidColor(color)) {
    throw new Error(`Invalid color "${color}". Valid colors: ${VALID_COLORS.join(', ')}`);
  }
  return bookmarks.filter((b) => b.color === color);
}

function listColors() {
  return [...VALID_COLORS];
}

module.exports = {
  VALID_COLORS,
  isValidColor,
  getColor,
  setColor,
  clearColor,
  getBookmarksByColor,
  listColors,
};
