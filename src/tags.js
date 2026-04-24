import { loadBookmarks, saveBookmarks } from './bookmarks.js';

export function getTagsFromBookmarks(bookmarks) {
  const tagSet = new Set();
  for (const bookmark of bookmarks) {
    if (Array.isArray(bookmark.tags)) {
      bookmark.tags.forEach(tag => tagSet.add(tag));
    }
  }
  return Array.from(tagSet).sort();
}

export async function addTagToBookmark(configDir, url, tag) {
  const bookmarks = await loadBookmarks(configDir);
  const bookmark = bookmarks.find(b => b.url === url);
  if (!bookmark) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  if (!Array.isArray(bookmark.tags)) {
    bookmark.tags = [];
  }
  if (!bookmark.tags.includes(tag)) {
    bookmark.tags.push(tag);
    await saveBookmarks(configDir, bookmarks);
  }
  return bookmark;
}

export async function removeTagFromBookmark(configDir, url, tag) {
  const bookmarks = await loadBookmarks(configDir);
  const bookmark = bookmarks.find(b => b.url === url);
  if (!bookmark) {
    throw new Error(`Bookmark not found: ${url}`);
  }
  if (Array.isArray(bookmark.tags)) {
    bookmark.tags = bookmark.tags.filter(t => t !== tag);
    await saveBookmarks(configDir, bookmarks);
  }
  return bookmark;
}

export async function getBookmarksByTag(configDir, tag) {
  const bookmarks = await loadBookmarks(configDir);
  return bookmarks.filter(
    b => Array.isArray(b.tags) && b.tags.includes(tag)
  );
}
