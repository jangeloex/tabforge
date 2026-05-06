import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { loadConfig } from '../config.js';
import { markWatched, getUnwatched, startWatcher } from '../watch.js';

export function registerWatchCommand(program) {
  const watch = program.command('watch').description('Watch and inspect bookmark activity');

  watch
    .command('unwatched')
    .description('List bookmarks that have never been watched')
    .action(() => {
      const config = loadConfig();
      const bookmarks = loadBookmarks(config);
      const list = getUnwatched(bookmarks);
      if (list.length === 0) {
        console.log('All bookmarks have been watched.');
        return;
      }
      list.forEach((b) => console.log(`[${b.title || '(no title)'}] ${b.url}`));
    });

  watch
    .command('mark <url>')
    .description('Mark a bookmark URL as watched')
    .action((url) => {
      const config = loadConfig();
      const bookmarks = loadBookmarks(config);
      const updated = markWatched(bookmarks, url);
      if (updated === bookmarks) {
        console.error(`Bookmark not found: ${url}`);
        process.exit(1);
      }
      saveBookmarks(config, updated);
      console.log(`Marked as watched: ${url}`);
    });

  watch
    .command('start')
    .description('Poll for bookmark changes and print updates (Ctrl+C to stop)')
    .option('--interval <ms>', 'polling interval in ms', '5000')
    .action((opts) => {
      const config = loadConfig();
      console.log('Watching for bookmark changes... (Ctrl+C to stop)');
      const stop = startWatcher(config, (changed) => {
        console.log(`\n[watch] ${changed.length} bookmark(s) changed:`);
        changed.forEach((b) => console.log(`  - ${b.url}`));
      });
      process.on('SIGINT', () => {
        stop();
        console.log('\nStopped watching.');
        process.exit(0);
      });
    });
}
