import { loadBookmarks, saveBookmarks } from './bookmarks.js';

/**
 * Get all named collections from bookmarks.
 * A collection is a named set of bookmark URLs.
 */
export function getCollections(bookmarks) {
  const collections = {};
  for (const bm of bookmarks) {
    if (!bm.collections) continue;
    for (const col of bm.collections) {
      if (!collections[col]) collections[col] = [];
      collections[col].push(bm);
    }
  }
  return collections;
}

export function listCollectionNames(bookmarks) {
  const names = new Set();
  for (const bm of bookmarks) {
    if (bm.collections) bm.collections.forEach(c => names.add(c));
  }
  return [...names].sort();
}

export function addToCollection(bookmarks, url, collectionName) {
  const bm = bookmarks.find(b => b.url === url);
  if (!bm) throw new Error(`Bookmark not found: ${url}`);
  if (!bm.collections) bm.collections = [];
  if (!bm.collections.includes(collectionName)) {
    bm.collections.push(collectionName);
  }
  return bookmarks;
}

export function removeFromCollection(bookmarks, url, collectionName) {
  const bm = bookmarks.find(b => b.url === url);
  if (!bm) throw new Error(`Bookmark not found: ${url}`);
  if (!bm.collections) return bookmarks;
  bm.collections = bm.collections.filter(c => c !== collectionName);
  if (bm.collections.length === 0) delete bm.collections;
  return bookmarks;
}

export function renameCollection(bookmarks, oldName, newName) {
  for (const bm of bookmarks) {
    if (!bm.collections) continue;
    const idx = bm.collections.indexOf(oldName);
    if (idx !== -1) {
      bm.collections[idx] = newName;
    }
  }
  return bookmarks;
}

export function deleteCollection(bookmarks, collectionName) {
  for (const bm of bookmarks) {
    if (!bm.collections) continue;
    bm.collections = bm.collections.filter(c => c !== collectionName);
    if (bm.collections.length === 0) delete bm.collections;
  }
  return bookmarks;
}
