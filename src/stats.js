import { loadBookmarks } from './bookmarks.js';
import { getTagsFromBookmarks } from './tags.js';

/**
 * Generate statistics about the bookmark collection.
 * @param {Array} bookmarks
 * @returns {Object}
 */
export function computeStats(bookmarks) {
  const total = bookmarks.length;

  if (total === 0) {
    return { total: 0, tagged: 0, untagged: 0, topTags: [], avgTagsPerBookmark: 0, domains: {} };
  }

  const tagged = bookmarks.filter(b => b.tags && b.tags.length > 0).length;
  const untagged = total - tagged;

  const tagCounts = {};
  for (const b of bookmarks) {
    for (const tag of b.tags || []) {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    }
  }

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }));

  const totalTags = bookmarks.reduce((sum, b) => sum + (b.tags ? b.tags.length : 0), 0);
  const avgTagsPerBookmark = parseFloat((totalTags / total).toFixed(2));

  const domains = {};
  for (const b of bookmarks) {
    try {
      const host = new URL(b.url).hostname.replace(/^www\./, '');
      domains[host] = (domains[host] || 0) + 1;
    } catch {
      // skip invalid URLs
    }
  }

  return { total, tagged, untagged, topTags, avgTagsPerBookmark, domains };
}

export async function getStats(configDir) {
  const bookmarks = await loadBookmarks(configDir);
  return computeStats(bookmarks);
}
