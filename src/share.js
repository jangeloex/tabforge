import { loadBookmarks } from './bookmarks.js';
import { toNetscapeHTML, toJSON } from './export.js';

/**
 * Generate a shareable text snippet for a single bookmark.
 */
export function formatShareText(bookmark) {
  const tags = bookmark.tags && bookmark.tags.length ? ` [${bookmark.tags.join(', ')}]` : '';
  const note = bookmark.note ? `\n  Note: ${bookmark.note}` : '';
  return `${bookmark.title}${tags}\n  ${bookmark.url}${note}`;
}

/**
 * Generate a shareable Markdown link.
 */
export function formatMarkdownLink(bookmark) {
  const tags = bookmark.tags && bookmark.tags.length
    ? `\nTags: ${bookmark.tags.map(t => `\`${t}\``).join(', ')}`
    : '';
  return `[${bookmark.title}](${bookmark.url})${tags}`;
}

/**
 * Build a share bundle: an object with multiple formats for a set of bookmarks.
 */
export function buildShareBundle(bookmarks) {
  return {
    text: bookmarks.map(formatShareText).join('\n\n'),
    markdown: bookmarks.map(formatMarkdownLink).join('\n\n'),
    html: toNetscapeHTML(bookmarks),
    json: toJSON(bookmarks),
    count: bookmarks.length,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Filter bookmarks by tags for sharing.
 */
export function getShareableBookmarks(bookmarks, tags = []) {
  if (!tags.length) return bookmarks;
  return bookmarks.filter(b =>
    tags.every(t => b.tags && b.tags.includes(t))
  );
}
