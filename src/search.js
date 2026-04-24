import { loadBookmarks } from './bookmarks.js';

/**
 * Search bookmarks by query string (matches title or url)
 * @param {string} query
 * @param {object} options
 * @param {string} [options.tag] - filter by tag
 * @param {boolean} [options.caseSensitive]
 * @returns {Array} matching bookmarks
 */
export function searchBookmarks(bookmarks, query, options = {}) {
  const { tag, caseSensitive = false } = options;

  let results = [...bookmarks];

  if (tag) {
    results = results.filter(
      (b) => Array.isArray(b.tags) && b.tags.includes(tag)
    );
  }

  if (!query || query.trim() === '') {
    return results;
  }

  const needle = caseSensitive ? query : query.toLowerCase();

  return results.filter((b) => {
    const title = caseSensitive ? (b.title || '') : (b.title || '').toLowerCase();
    const url = caseSensitive ? (b.url || '') : (b.url || '').toLowerCase();
    return title.includes(needle) || url.includes(needle);
  });
}

/**
 * Load bookmarks from store and search them
 * @param {string} storePath
 * @param {string} query
 * @param {object} options
 * @returns {Promise<Array>}
 */
export async function searchInStore(storePath, query, options = {}) {
  const bookmarks = await loadBookmarks(storePath);
  return searchBookmarks(bookmarks, query, options);
}
