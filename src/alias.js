import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Get all aliases from bookmarks
 * @param {Array} bookmarks
 * @returns {Object} map of alias -> bookmark id
 */
export function getAliases(bookmarks) {
  const aliases = {};
  for (const bm of bookmarks) {
    if (bm.alias) {
      aliases[bm.alias] = bm.id;
    }
  }
  return aliases;
}

/**
 * Set an alias on a bookmark by id
 * @param {string} configDir
 * @param {string} id
 * @param {string} alias
 * @returns {Object} updated bookmark
 */
export async function setAlias(configDir, id, alias) {
  const bookmarks = await loadBookmarks(configDir);

  // check alias not already taken
  const existing = bookmarks.find(b => b.alias === alias && b.id !== id);
  if (existing) {
    throw new Error(`Alias "${alias}" is already used by bookmark "${existing.title}"`);
  }

  const bm = bookmarks.find(b => b.id === id);
  if (!bm) throw new Error(`Bookmark with id "${id}" not found`);

  bm.alias = alias;
  await saveBookmarks(configDir, bookmarks);
  return bm;
}

/**
 * Remove alias from a bookmark by id
 * @param {string} configDir
 * @param {string} id
 * @returns {Object} updated bookmark
 */
export async function removeAlias(configDir, id) {
  const bookmarks = await loadBookmarks(configDir);
  const bm = bookmarks.find(b => b.id === id);
  if (!bm) throw new Error(`Bookmark with id "${id}" not found`);

  delete bm.alias;
  await saveBookmarks(configDir, bookmarks);
  return bm;
}

/**
 * Resolve an alias to a bookmark
 * @param {Array} bookmarks
 * @param {string} alias
 * @returns {Object|null}
 */
export function resolveAlias(bookmarks, alias) {
  return bookmarks.find(b => b.alias === alias) || null;
}
