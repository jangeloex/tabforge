import { loadConfig } from '../config.js';
import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import {
  setPriority,
  clearPriority,
  getPriorityLabel,
  sortByPriority,
  getBookmarksByPriority,
} from '../priority.js';

export function registerPriorityCommand(program) {
  const priority = program
    .command('priority')
    .description('manage bookmark priorities');

  priority
    .command('set <url> <level>')
    .description('set priority for a bookmark (1=low, 2=medium, 3=high)')
    .action(async (url, level) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      const lvl = parseInt(level, 10);
      if (![1, 2, 3].includes(lvl)) {
        console.error('Priority level must be 1 (low), 2 (medium), or 3 (high)');
        process.exit(1);
      }
      const updated = setPriority(bookmarks, url, lvl);
      if (!updated) {
        console.error(`Bookmark not found: ${url}`);
        process.exit(1);
      }
      await saveBookmarks(config, updated);
      console.log(`Set priority to ${getPriorityLabel(lvl)} for ${url}`);
    });

  priority
    .command('clear <url>')
    .description('clear priority for a bookmark')
    .action(async (url) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      const updated = clearPriority(bookmarks, url);
      if (!updated) {
        console.error(`Bookmark not found: ${url}`);
        process.exit(1);
      }
      await saveBookmarks(config, updated);
      console.log(`Cleared priority for ${url}`);
    });

  priority
    .command('list')
    .description('list bookmarks sorted by priority')
    .option('--level <n>', 'filter by priority level (1, 2, or 3)')
    .action(async (opts) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      let list = opts.level
        ? getBookmarksByPriority(bookmarks, parseInt(opts.level, 10))
        : sortByPriority(bookmarks).filter((b) => b.priority);
      if (list.length === 0) {
        console.log('No bookmarks with priority set.');
        return;
      }
      for (const b of list) {
        const label = getPriorityLabel(b.priority);
        console.log(`[${label.toUpperCase()}] ${b.title || b.url} — ${b.url}`);
      }
    });
}
