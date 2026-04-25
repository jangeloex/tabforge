import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Rename a bookmark's title by URL.
 * @param {string} configDir
 * @param {string} url
 * @param {string} newTitle
 * @returns {{ ok: boolean, message: string }}
 */
export async function renameBookmark(configDir, url, newTitle) {
  if (!url || typeof url !== 'string') {
    return { ok: false, message: 'URL is required.' };
  }
  if (!newTitle || typeof newTitle !== 'string' || !newTitle.trim()) {
    return { ok: false, message: 'New title is required.' };
  }

  const bookmarks = await loadBookmarks(configDir);
  const index = bookmarks.findIndex((b) => b.url === url);

  if (index === -1) {
    return { ok: false, message: `No bookmark found with URL: ${url}` };
  }

  const oldTitle = bookmarks[index].title;
  bookmarks[index] = { ...bookmarks[index], title: newTitle.trim() };
  await saveBookmarks(configDir, bookmarks);

  return {
    ok: true,
    message: `Renamed "${oldTitle}" → "${newTitle.trim()}".`,
  };
}

/**
 * Rename a bookmark's title by index (1-based).
 * @param {string} configDir
 * @param {number} index  1-based
 * @param {string} newTitle
 * @returns {{ ok: boolean, message: string }}
 */
export async function renameBookmarkByIndex(configDir, index, newTitle) {
  if (!newTitle || typeof newTitle !== 'string' || !newTitle.trim()) {
    return { ok: false, message: 'New title is required.' };
  }

  const bookmarks = await loadBookmarks(configDir);
  const i = index - 1;

  if (i < 0 || i >= bookmarks.length) {
    return { ok: false, message: `Index ${index} is out of range.` };
  }

  const oldTitle = bookmarks[i].title;
  bookmarks[i] = { ...bookmarks[i], title: newTitle.trim() };
  await saveBookmarks(configDir, bookmarks);

  return {
    ok: true,
    message: `Renamed "${oldTitle}" → "${newTitle.trim()}".`,
  };
}
