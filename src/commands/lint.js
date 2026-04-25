import { loadBookmarks } from '../bookmarks.js';
import { lintBookmarks } from '../lint.js';

/**
 * Registers the `lint` command on the given CLI program.
 * @param {import('commander').Command} program
 */
export function registerLintCommand(program) {
  program
    .command('lint')
    .description('Check bookmarks for common issues (invalid URLs, missing titles, etc.)')
    .option('--fix', 'Remove bookmarks that have unfixable issues (missing URL)')
    .action(async (options) => {
      let bookmarks;
      try {
        bookmarks = await loadBookmarks();
      } catch (err) {
        console.error('Failed to load bookmarks:', err.message);
        process.exit(1);
      }

      const issues = lintBookmarks(bookmarks);

      if (issues.length === 0) {
        console.log('✅ All bookmarks look good!');
        return;
      }

      console.log(`⚠️  Found ${issues.length} bookmark(s) with issues:\n`);

      issues.forEach(({ index, bookmark, problems }) => {
        console.log(`  [${index}] ${bookmark.title || '(no title)'} — ${bookmark.url || '(no url)'}`);
        problems.forEach(p => console.log(`       • ${p}`));
      });

      if (options.fix) {
        const { saveBookmarks } = await import('../bookmarks.js');
        const badIndexes = new Set(
          issues
            .filter(i => i.problems.includes('Invalid or missing URL'))
            .map(i => i.index)
        );
        const cleaned = bookmarks.filter((_, i) => !badIndexes.has(i));
        await saveBookmarks(cleaned);
        console.log(`\n🗑  Removed ${badIndexes.size} bookmark(s) with invalid URLs.`);
      }
    });
}
