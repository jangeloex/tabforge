import { loadBookmarks, saveBookmarks } from './bookmarks.js';

export function getPinnedBookmarks(bookmarks) {
  return bookmarks.filter((b) => b.pinned === true);
}

export function pinBookmark(bookmarks, url) {
  const idx = bookmarks.findIndex((b) => b.url === url);
  if (idx === -1) return { bookmarks, changed: false };
  if (bookmarks[idx].pinned) return { bookmarks, changed: false };
  const updated = bookmarks.map((b, i) =>
    i === idx ? { ...b, pinned: true, pinnedAt: new Date().toISOString() } : b
  );
  return { bookmarks: updated, changed: true };
}

export function unpinBookmark(bookmarks, url) {
  const idx = bookmarks.findIndex((b) => b.url === url);
  if (idx === -1) return { bookmarks, changed: false };
  if (!bookmarks[idx].pinned) return { bookmarks, changed: false };
  const updated = bookmarks.map((b, i) => {
    if (i !== idx) return b;
    const copy = { ...b };
    delete copy.pinned;
    delete copy.pinnedAt;
    return copy;
  });
  return { bookmarks: updated, changed: true };
}

export async function pinAndSave(configDir, url) {
  const bookmarks = await loadBookmarks(configDir);
  const { bookmarks: updated, changed } = pinBookmark(bookmarks, url);
  if (changed) await saveBookmarks(configDir, updated);
  return { changed, total: getPinnedBookmarks(updated).length };
}

export async function unpinAndSave(configDir, url) {
  const bookmarks = await loadBookmarks(configDir);
  const { bookmarks: updated, changed } = unpinBookmark(bookmarks, url);
  if (changed) await saveBookmarks(configDir, updated);
  return { changed, total: getPinnedBookmarks(updated).length };
}
