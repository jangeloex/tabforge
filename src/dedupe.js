/**
 * Deduplicate bookmarks by URL, keeping the most recently added entry.
 */

/**
 * Find duplicate bookmarks (same URL).
 * @param {Array} bookmarks
 * @returns {Array} groups of duplicates [{url, indices: [...]}]
 */
export function findDuplicates(bookmarks) {
  const urlMap = new Map();

  bookmarks.forEach((bookmark, index) => {
    const url = bookmark.url.trim().toLowerCase();
    if (!urlMap.has(url)) {
      urlMap.set(url, []);
    }
    urlMap.get(url).push(index);
  });

  const duplicates = [];
  for (const [url, indices] of urlMap.entries()) {
    if (indices.length > 1) {
      duplicates.push({ url, indices });
    }
  }

  return duplicates;
}

/**
 * Remove duplicate bookmarks, keeping the last occurrence of each URL.
 * Merges tags from all duplicates into the kept entry.
 * @param {Array} bookmarks
 * @returns {{ bookmarks: Array, removed: number }}
 */
export function dedupeBookmarks(bookmarks) {
  const urlMap = new Map();

  bookmarks.forEach((bookmark) => {
    const key = bookmark.url.trim().toLowerCase();
    if (urlMap.has(key)) {
      const existing = urlMap.get(key);
      const mergedTags = Array.from(
        new Set([...(existing.tags || []), ...(bookmark.tags || [])])
      );
      urlMap.set(key, { ...bookmark, tags: mergedTags });
    } else {
      urlMap.set(key, { ...bookmark });
    }
  });

  const deduped = Array.from(urlMap.values());
  return {
    bookmarks: deduped,
    removed: bookmarks.length - deduped.length,
  };
}
