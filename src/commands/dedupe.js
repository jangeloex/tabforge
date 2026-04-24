import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { findDuplicates, dedupeBookmarks } from '../dedupe.js';

/**
 * Register the dedupe command on a yargs instance.
 * @param {object} yargs
 */
export function registerDedupeCommand(yargs) {
  yargs.command(
    'dedupe',
    'Find and remove duplicate bookmarks by URL',
    (y) =>
      y.option('dry-run', {
        alias: 'n',
        type: 'boolean',
        default: false,
        description: 'Show duplicates without removing them',
      }),
    async (argv) => {
      const bookmarks = await loadBookmarks();

      const duplicates = findDuplicates(bookmarks);

      if (duplicates.length === 0) {
        console.log('No duplicates found.');
        return;
      }

      console.log(`Found ${duplicates.length} duplicate URL(s):`);
      duplicates.forEach(({ url, indices }) => {
        console.log(`  ${url} — ${indices.length} occurrences`);
      });

      if (argv.dryRun) {
        console.log('Dry run — no changes saved.');
        return;
      }

      const { bookmarks: deduped, removed } = dedupeBookmarks(bookmarks);
      await saveBookmarks(deduped);
      console.log(`Removed ${removed} duplicate(s). ${deduped.length} bookmarks remaining.`);
    }
  );
}
