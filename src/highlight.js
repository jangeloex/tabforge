/**
 * highlight.js — Highlight search terms in bookmark titles and URLs
 */

const RESET = '\x1b[0m';
const YELLOW_BOLD = '\x1b[1;33m';

/**
 * Wrap matched substrings in ANSI escape codes for terminal highlighting.
 * @param {string} text
 * @param {string} term
 * @returns {string}
 */
function highlightTerm(text, term) {
  if (!term || !text) return text;
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, `${YELLOW_BOLD}$1${RESET}`);
}

/**
 * Highlight all provided terms in a single string.
 * @param {string} text
 * @param {string[]} terms
 * @returns {string}
 */
function highlightTerms(text, terms) {
  if (!terms || terms.length === 0) return text;
  return terms.reduce((acc, term) => highlightTerm(acc, term), text);
}

/**
 * Return a copy of a bookmark with title and url highlighted.
 * @param {object} bookmark
 * @param {string|string[]} terms
 * @returns {object}
 */
function highlightBookmark(bookmark, terms) {
  const termList = Array.isArray(terms) ? terms : [terms];
  return {
    ...bookmark,
    title: highlightTerms(bookmark.title || '', termList),
    url: highlightTerms(bookmark.url || '', termList),
  };
}

/**
 * Highlight terms across an array of bookmarks.
 * @param {object[]} bookmarks
 * @param {string|string[]} terms
 * @returns {object[]}
 */
function highlightBookmarks(bookmarks, terms) {
  return bookmarks.map((b) => highlightBookmark(b, terms));
}

module.exports = { highlightTerm, highlightTerms, highlightBookmark, highlightBookmarks };
