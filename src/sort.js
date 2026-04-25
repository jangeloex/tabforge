import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Sort bookmarks by a given field and direction.
 * @param {Array} bookmarks
 * @param {'title'|'url'|'createdAt'|'tags'} field
 * @param {'asc'|'desc'} direction
 * @returns {Array}
 */
export function sortBookmarks(bookmarks, field = 'title', direction = 'asc') {
  const validFields = ['title', 'url', 'createdAt', 'tags'];
  if (!validFields.includes(field)) {
    throw new Error(`Invalid sort field: ${field}. Must be one of: ${validFields.join(', ')}`);
  }

  const sorted = [...bookmarks].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];

    if (field === 'tags') {
      valA = (valA || []).join(',').toLowerCase();
      valB = (valB || []).join(',').toLowerCase();
    } else if (field === 'createdAt') {
      valA = valA ? new Date(valA).getTime() : 0;
      valB = valB ? new Date(valB).getTime() : 0;
      return direction === 'asc' ? valA - valB : valB - valA;
    } else {
      valA = (valA || '').toLowerCase();
      valB = (valB || '').toLowerCase();
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * Sort bookmarks in the store in-place.
 * @param {string} configDir
 * @param {'title'|'url'|'createdAt'|'tags'} field
 * @param {'asc'|'desc'} direction
 * @returns {Array} sorted bookmarks
 */
export async function sortAndSave(configDir, field = 'title', direction = 'asc') {
  const bookmarks = await loadBookmarks(configDir);
  const sorted = sortBookmarks(bookmarks, field, direction);
  await saveBookmarks(configDir, sorted);
  return sorted;
}
