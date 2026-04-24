import chalk from 'chalk';
import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { getStaleBookmarks, markVisited } from '../remind.js';
import { loadConfig } from '../config.js';

export function registerRemindCommand(program) {
  const cmd = program.command('remind');

  cmd
    .command('list')
    .description('List bookmarks you have not visited recently')
    .option('-d, --days <number>', 'Staleness threshold in days', '30')
    .action(async (opts) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config.storeDir);
      const days = parseInt(opts.days, 10);
      const stale = getStaleBookmarks(bookmarks, days);
      if (stale.length === 0) {
        console.log(chalk.green(`No stale bookmarks (threshold: ${days} days).`));
        return;
      }
      console.log(chalk.yellow(`${stale.length} bookmark(s) not visited in ${days}+ days:\n`));
      stale.forEach((b) => {
        const ref = b.lastVisited ?? b.addedAt ?? 'unknown';
        console.log(`  ${chalk.bold(b.title)} — ${b.url}`);
        console.log(`    ${chalk.dim('Last seen: ' + ref)}`);
      });
    });

  cmd
    .command('visited <url>')
    .description('Mark a bookmark as visited now')
    .action(async (url) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config.storeDir);
      const updated = markVisited(bookmarks, url);
      if (updated === bookmarks) {
        console.error(chalk.red(`No bookmark found with URL: ${url}`));
        process.exit(1);
      }
      await saveBookmarks(config.storeDir, updated);
      console.log(chalk.green(`Marked as visited: ${url}`));
    });
}
