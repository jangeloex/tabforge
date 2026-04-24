/**
 * Lint bookmarks for common issues:
 * - missing title
 * - invalid URL format
 * - duplicate URLs
 * - empty tag strings
 */

const { URL } = require('url');

function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

function lintBookmarks(bookmarks) {
  const issues = [];
  const seenUrls = new Map();

  bookmarks.forEach((bookmark, index) => {
    const id = bookmark.id || `#${index}`;

    if (!bookmark.title || bookmark.title.trim() === '') {
      issues.push({ id, url: bookmark.url, type: 'missing_title', message: 'Bookmark has no title' });
    }

    if (!bookmark.url || bookmark.url.trim() === '') {
      issues.push({ id, url: bookmark.url, type: 'missing_url', message: 'Bookmark has no URL' });
    } else if (!isValidUrl(bookmark.url)) {
      issues.push({ id, url: bookmark.url, type: 'invalid_url', message: `Invalid URL: ${bookmark.url}` });
    } else {
      const normalized = bookmark.url.toLowerCase();
      if (seenUrls.has(normalized)) {
        issues.push({
          id,
          url: bookmark.url,
          type: 'duplicate_url',
          message: `Duplicate URL also found at id ${seenUrls.get(normalized)}`
        });
      } else {
        seenUrls.set(normalized, id);
      }
    }

    if (Array.isArray(bookmark.tags)) {
      bookmark.tags.forEach((tag, ti) => {
        if (typeof tag !== 'string' || tag.trim() === '') {
          issues.push({ id, url: bookmark.url, type: 'empty_tag', message: `Empty or invalid tag at index ${ti}` });
        }
      });
    }
  });

  return issues;
}

module.exports = { lintBookmarks, isValidUrl };
