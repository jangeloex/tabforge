import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Apply a transformation function to multiple bookmarks by URL.
 * Returns { updated, notFound } counts.
 */
export async function batchUpdate(config, urls, transformFn) {
  const bookmarks = await loadBookmarks(config);
  let updated = 0;
  const notFound = [];

  const result = bookmarks.map((bm) => {
    if (urls.includes(bm.url)) {
      updated++;
      return transformFn(bm);
    }
    return bm;
  });

  urls.forEach((url) => {
    if (!bookmarks.find((bm) => bm.url === url)) {
      notFound.push(url);
    }
  });

  await saveBookmarks(config, result);
  return { updated, notFound };
}

/**
 * Remove multiple bookmarks by URL in one pass.
 */
export async function batchRemove(config, urls) {
  const bookmarks = await loadBookmarks(config);
  const urlSet = new Set(urls);
  const remaining = bookmarks.filter((bm) => !urlSet.has(bm.url));
  const removed = bookmarks.length - remaining.length;
  const notFound = urls.filter((url) => !bookmarks.find((bm) => bm.url === url));
  await saveBookmarks(config, remaining);
  return { removed, notFound };
}

/**
 * Add tags to multiple bookmarks by URL.
 */
export async function batchTag(config, urls, tags) {
  return batchUpdate(config, urls, (bm) => {
    const existing = bm.tags || [];
    const merged = Array.from(new Set([...existing, ...tags]));
    return { ...bm, tags: merged };
  });
}
