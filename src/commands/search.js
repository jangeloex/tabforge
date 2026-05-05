import { loadConfig } from '../config.js';
import { loadBookmarks } from '../bookmarks.js';
import { searchBookmarks } from '../search.js';

export function registerSearchCommand(program) {
  program
    .command('search <query>')
    .description('Search bookmarks by title, URL, or tags')
    .option('-t, --tags', 'Search by tags only')
    .option('-u, --url', 'Search by URL only')
    .option('--json', 'Output results as JSON')
    .option('-l, --limit <n>', 'Limit number of results', parseInt)
    .action(async (query, opts) => {
      try {
        const config = await loadConfig();
        const bookmarks = await loadBookmarks(config);

        const field = opts.tags ? 'tags' : opts.url ? 'url' : null;
        let results = searchBookmarks(bookmarks, query, field);

        if (opts.limit && opts.limit > 0) {
          results = results.slice(0, opts.limit);
        }

        if (results.length === 0) {
          console.log('No bookmarks matched your search.');
          return;
        }

        if (opts.json) {
          console.log(JSON.stringify(results, null, 2));
          return;
        }

        console.log(`Found ${results.length} bookmark(s):\n`);
        for (const bm of results) {
          console.log(`  ${bm.title}`);
          console.log(`    URL  : ${bm.url}`);
          if (bm.tags && bm.tags.length > 0) {
            console.log(`    Tags : ${bm.tags.join(', ')}`);
          }
          if (bm.note) {
            console.log(`    Note : ${bm.note}`);
          }
          console.log();
        }
      } catch (err) {
        console.error('Search failed:', err.message);
        process.exit(1);
      }
    });
}
