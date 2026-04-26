import { loadBookmarks } from '../bookmarks.js';
import { searchBookmarks } from '../search.js';
import { openUrl } from '../open.js';

/**
 * Register the `open` command with the CLI program.
 * Opens a bookmark URL in the default browser by searching for it.
 *
 * Usage:
 *   tabforge open <query>
 *   tabforge open --index <n>
 */
export function registerOpenCommand(program) {
  program
    .command('open <query>')
    .description('Open a bookmark in the browser by title, URL, or tag')
    .option('-i, --index <n>', 'open bookmark at position n from search results (1-based)', parseInt)
    .option('--first', 'automatically open the first match without prompting')
    .action(async (query, opts) => {
      let bookmarks;
      try {
        bookmarks = await loadBookmarks();
      } catch (err) {
        console.error('Failed to load bookmarks:', err.message);
        process.exit(1);
      }

      const results = searchBookmarks(bookmarks, query);

      if (results.length === 0) {
        console.log(`No bookmarks found matching "${query}".`);
        process.exit(0);
      }

      let target;

      if (opts.index !== undefined) {
        const idx = opts.index - 1;
        if (idx < 0 || idx >= results.length) {
          console.error(`Index ${opts.index} is out of range (1–${results.length}).`);
          process.exit(1);
        }
        target = results[idx];
      } else if (opts.first || results.length === 1) {
        target = results[0];
      } else {
        // Show numbered list and let user pick
        console.log(`Found ${results.length} matches for "${query}":\n`);
        results.forEach((b, i) => {
          console.log(`  ${i + 1}. ${b.title || '(no title)'}`);
          console.log(`     ${b.url}`);
          if (b.tags && b.tags.length > 0) {
            console.log(`     tags: ${b.tags.join(', ')}`);
          }
        });
        console.log(
          '\nTip: use --first to open the top result, or --index <n> to pick one.'
        );
        process.exit(0);
      }

      try {
        await openUrl(target.url);
        console.log(`Opening: ${target.url}`);
      } catch (err) {
        console.error('Failed to open URL:', err.message);
        process.exit(1);
      }
    });
}
