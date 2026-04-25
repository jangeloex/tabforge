import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Merge two bookmark arrays, deduplicating by URL.
 * Bookmarks from `incoming` take precedence for title/tags on conflict.
 * @param {Array} base - existing bookmarks
 * @param {Array} incoming - bookmarks to merge in
 * @returns {{ merged: Array, added: number, updated: number, skipped: number }}
 */
export function mergeBookmarks(base, incoming) {
  const byUrl = new Map(base.map(b => [b.url, { ...b }]));
  let added = 0;
  let updated = 0;
  let skipped = 0;

  for (const bookmark of incoming) {
    if (!bookmark.url) { skipped++; continue; }

    if (!byUrl.has(bookmark.url)) {
      byUrl.set(bookmark.url, { ...bookmark });
      added++;
    } else {
      const existing = byUrl.get(bookmark.url);
      const incomingDate = new Date(bookmark.createdAt || 0);
      const existingDate = new Date(existing.createdAt || 0);

      // Merge tags (union)
      const mergedTags = Array.from(
        new Set([...(existing.tags || []), ...(bookmark.tags || [])])
      );

      if (incomingDate >= existingDate) {
        byUrl.set(bookmark.url, {
          ...existing,
          ...bookmark,
          tags: mergedTags,
        });
        updated++;
      } else {
        byUrl.set(bookmark.url, { ...existing, tags: mergedTags });
        skipped++;
      }
    }
  }

  return {
    merged: Array.from(byUrl.values()),
    added,
    updated,
    skipped,
  };
}

/**
 * Load bookmarks from disk, merge with incoming, and save.
 */
export async function mergeIntoStore(configDir, incoming) {
  const base = await loadBookmarks(configDir);
  const result = mergeBookmarks(base, incoming);
  await saveBookmarks(configDir, result.merged);
  return result;
}
