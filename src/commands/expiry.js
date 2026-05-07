import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { loadConfig } from '../config.js';
import {
  setExpiry,
  clearExpiry,
  getExpiredBookmarks,
  getExpiringBookmarks,
  pruneExpired,
} from '../expiry.js';

export function registerExpiryCommand(program) {
  const expiry = program.command('expiry').description('Manage bookmark expiry dates');

  expiry
    .command('set <url> <date>')
    .description('Set expiry date for a bookmark (YYYY-MM-DD)')
    .action(async (url, date) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      const updated = setExpiry(bookmarks, url, date);
      if (updated === bookmarks) {
        console.error(`Bookmark not found: ${url}`);
        process.exit(1);
      }
      await saveBookmarks(config, updated);
      console.log(`Expiry set to ${date} for ${url}`);
    });

  expiry
    .command('clear <url>')
    .description('Remove expiry date from a bookmark')
    .action(async (url) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      const updated = clearExpiry(bookmarks, url);
      await saveBookmarks(config, updated);
      console.log(`Expiry cleared for ${url}`);
    });

  expiry
    .command('list')
    .description('List expired or expiring bookmarks')
    .option('--within <days>', 'Show bookmarks expiring within N days', '7')
    .option('--expired', 'Show only already-expired bookmarks')
    .action(async (opts) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      const results = opts.expired
        ? getExpiredBookmarks(bookmarks)
        : getExpiringBookmarks(bookmarks, parseInt(opts.within, 10));
      if (results.length === 0) {
        console.log('No matching bookmarks.');
        return;
      }
      results.forEach(b => console.log(`[${b.expiresAt?.slice(0, 10)}] ${b.title} — ${b.url}`));
    });

  expiry
    .command('prune')
    .description('Remove all expired bookmarks')
    .action(async () => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      const pruned = pruneExpired(bookmarks);
      const removed = bookmarks.length - pruned.length;
      await saveBookmarks(config, pruned);
      console.log(`Removed ${removed} expired bookmark(s).`);
    });
}
