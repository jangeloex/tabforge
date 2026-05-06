import { loadBookmarks } from './bookmarks.js';
import { computeStats } from './stats.js';
import { getTopRated } from './rating.js';
import { getPinnedBookmarks } from './pin.js';
import { getStaleBookmarks } from './remind.js';

/**
 * Build a digest summary object for the current bookmark store.
 * @param {object} config
 * @returns {object}
 */
export async function buildDigest(config) {
  const bookmarks = await loadBookmarks(config);
  const stats = computeStats(bookmarks);
  const topRated = getTopRated(bookmarks, config, 5);
  const pinned = getPinnedBookmarks(bookmarks);
  const stale = getStaleBookmarks(bookmarks, config);

  return {
    generatedAt: new Date().toISOString(),
    totalBookmarks: stats.total,
    totalTags: stats.uniqueTags,
    topRated: topRated.map((b) => ({ title: b.title, url: b.url, rating: b.rating })),
    pinned: pinned.map((b) => ({ title: b.title, url: b.url })),
    stale: stale.map((b) => ({ title: b.title, url: b.url, lastVisited: b.lastVisited })),
    recentlyAdded: bookmarks
      .filter((b) => b.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((b) => ({ title: b.title, url: b.url, createdAt: b.createdAt })),
  };
}

/**
 * Format a digest object as a human-readable string.
 * @param {object} digest
 * @returns {string}
 */
export function formatDigest(digest) {
  const lines = [];
  lines.push(`📋 Bookmark Digest — ${digest.generatedAt}`);
  lines.push(`Total: ${digest.totalBookmarks} bookmarks, ${digest.totalTags} unique tags\n`);

  if (digest.pinned.length) {
    lines.push('📌 Pinned:');
    digest.pinned.forEach((b) => lines.push(`  • ${b.title} <${b.url}>`));
    lines.push('');
  }

  if (digest.topRated.length) {
    lines.push('⭐ Top Rated:');
    digest.topRated.forEach((b) => lines.push(`  • [${b.rating}] ${b.title} <${b.url}>`));
    lines.push('');
  }

  if (digest.recentlyAdded.length) {
    lines.push('🆕 Recently Added:');
    digest.recentlyAdded.forEach((b) => lines.push(`  • ${b.title} <${b.url}>`));
    lines.push('');
  }

  if (digest.stale.length) {
    lines.push('⏰ Stale (not visited recently):');
    digest.stale.forEach((b) => lines.push(`  • ${b.title} <${b.url}>`));
  }

  return lines.join('\n');
}
