import { loadBookmarks } from './bookmarks.js';
import { getGroups } from './groups.js';
import { getTagsFromBookmarks } from './tags.js';

/**
 * Built-in templates for exporting bookmark subsets
 */
const BUILT_IN_TEMPLATES = {
  pinned: (bookmarks) => bookmarks.filter((b) => b.pinned),
  tagged: (bookmarks, { tag }) =>
    bookmarks.filter((b) => b.tags && b.tags.includes(tag)),
  group: (bookmarks, { group }) =>
    bookmarks.filter((b) => b.group === group),
  recent: (bookmarks, { days = 7 } = {}) => {
    const cutoff = Date.now() - days * 86400000;
    return bookmarks.filter((b) => b.addedAt && new Date(b.addedAt).getTime() >= cutoff);
  },
  all: (bookmarks) => bookmarks,
};

/**
 * Resolve and apply a named template to the current bookmarks.
 * @param {string} name - Template name
 * @param {object} opts - Options passed to the template fn
 * @returns {Promise<Array>} Filtered bookmarks
 */
export async function applyTemplate(name, opts = {}) {
  const fn = BUILT_IN_TEMPLATES[name];
  if (!fn) {
    throw new Error(`Unknown template "${name}". Available: ${listTemplates().join(', ')}`);
  }
  const bookmarks = await loadBookmarks();
  return fn(bookmarks, opts);
}

/**
 * Return the list of available template names.
 * @returns {string[]}
 */
export function listTemplates() {
  return Object.keys(BUILT_IN_TEMPLATES);
}

/**
 * Generate a quick summary string for a set of bookmarks produced by a template.
 * @param {string} name
 * @param {Array} bookmarks
 * @returns {string}
 */
export function templateSummary(name, bookmarks) {
  const tags = getTagsFromBookmarks(bookmarks);
  return [
    `Template : ${name}`,
    `Bookmarks: ${bookmarks.length}`,
    `Tags     : ${tags.length > 0 ? tags.join(', ') : '(none)'}`,
  ].join('\n');
}
