import { URL } from 'url';

/**
 * Returns true if the given string is a valid URL.
 * @param {string} url
 * @returns {boolean}
 */
export function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Lints a list of bookmarks and returns an array of issues.
 * Each issue has: { index, bookmark, problems: string[] }
 * @param {Array} bookmarks
 * @returns {Array}
 */
export function lintBookmarks(bookmarks) {
  if (!Array.isArray(bookmarks)) return [];

  const issues = [];

  bookmarks.forEach((bm, index) => {
    const problems = [];

    if (!bm.url || !isValidUrl(bm.url)) {
      problems.push('Invalid or missing URL');
    }

    if (!bm.title || bm.title.trim() === '') {
      problems.push('Missing title');
    }

    if (bm.tags && !Array.isArray(bm.tags)) {
      problems.push('Tags must be an array');
    }

    if (bm.tags && Array.isArray(bm.tags)) {
      const invalidTags = bm.tags.filter(t => typeof t !== 'string' || t.trim() === '');
      if (invalidTags.length > 0) {
        problems.push('Tags contain empty or non-string values');
      }
    }

    if (problems.length > 0) {
      issues.push({ index, bookmark: bm, problems });
    }
  });

  return issues;
}
