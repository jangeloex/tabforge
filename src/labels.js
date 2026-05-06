import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Get all labels assigned to bookmarks, keyed by URL.
 * @param {object} config
 * @returns {object} map of url -> string[]
 */
export function getLabels(config) {
  const bookmarks = loadBookmarks(config);
  const result = {};
  for (const bm of bookmarks) {
    if (bm.labels && bm.labels.length > 0) {
      result[bm.url] = bm.labels;
    }
  }
  return result;
}

/**
 * Add a label to a bookmark by URL.
 * @param {object} config
 * @param {string} url
 * @param {string} label
 * @returns {boolean} true if added, false if already present or not found
 */
export function addLabel(config, url, label) {
  const bookmarks = loadBookmarks(config);
  const bm = bookmarks.find(b => b.url === url);
  if (!bm) return false;
  if (!bm.labels) bm.labels = [];
  const normalized = label.trim().toLowerCase();
  if (bm.labels.includes(normalized)) return false;
  bm.labels.push(normalized);
  saveBookmarks(config, bookmarks);
  return true;
}

/**
 * Remove a label from a bookmark by URL.
 * @param {object} config
 * @param {string} url
 * @param {string} label
 * @returns {boolean} true if removed, false if not found
 */
export function removeLabel(config, url, label) {
  const bookmarks = loadBookmarks(config);
  const bm = bookmarks.find(b => b.url === url);
  if (!bm || !bm.labels) return false;
  const normalized = label.trim().toLowerCase();
  const idx = bm.labels.indexOf(normalized);
  if (idx === -1) return false;
  bm.labels.splice(idx, 1);
  saveBookmarks(config, bookmarks);
  return true;
}

/**
 * List all unique labels used across all bookmarks.
 * @param {object} config
 * @returns {string[]}
 */
export function listAllLabels(config) {
  const bookmarks = loadBookmarks(config);
  const set = new Set();
  for (const bm of bookmarks) {
    if (bm.labels) bm.labels.forEach(l => set.add(l));
  }
  return Array.from(set).sort();
}

/**
 * Get bookmarks that have a specific label.
 * @param {object} config
 * @param {string} label
 * @returns {object[]}
 */
export function getBookmarksByLabel(config, label) {
  const bookmarks = loadBookmarks(config);
  const normalized = label.trim().toLowerCase();
  return bookmarks.filter(bm => bm.labels && bm.labels.includes(normalized));
}
