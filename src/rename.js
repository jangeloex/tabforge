import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Rename a bookmark's title by URL.
 * @param {string} url
 * @param {string} newTitle
 * @returns {{ updated: boolean, bookmark: object|null }}
 */
export async function renameBookmark(url, newTitle) {
  if (!url || !newTitle) {
    throw new Error('url and newTitle are required');
  }

  const bookmarks = await loadBookmarks();
  const index = bookmarks.findIndex((b) => b.url === url);

  if (index === -1) {
    return { updated: false, bookmark: null };
  }

  bookmarks[index] = { ...bookmarks[index], title: newTitle };
  await saveBookmarks(bookmarks);

  return { updated: true, bookmark: bookmarks[index] };
}

/**
 * Rename a bookmark's URL (and optionally title) by old URL.
 * @param {string} oldUrl
 * @param {string} newUrl
 * @param {string|null} newTitle
 * @returns {{ updated: boolean, bookmark: object|null }}
 */
export async function renameBookmarkUrl(oldUrl, newUrl, newTitle = null) {
  if (!oldUrl || !newUrl) {
    throw new Error('oldUrl and newUrl are required');
  }

  const bookmarks = await loadBookmarks();
  const index = bookmarks.findIndex((b) => b.url === oldUrl);

  if (index === -1) {
    return { updated: false, bookmark: null };
  }

  const duplicate = bookmarks.findIndex((b, i) => b.url === newUrl && i !== index);
  if (duplicate !== -1) {
    throw new Error(`A bookmark with URL "${newUrl}" already exists`);
  }

  bookmarks[index] = {
    ...bookmarks[index],
    url: newUrl,
    ...(newTitle ? { title: newTitle } : {}),
  };

  await saveBookmarks(bookmarks);
  return { updated: true, bookmark: bookmarks[index] };
}
