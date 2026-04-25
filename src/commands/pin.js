import chalk from 'chalk';
import { loadConfig } from '../config.js';
import { loadBookmarks } from '../bookmarks.js';
import { pinAndSave, unpinAndSave, getPinnedBookmarks } from '../pin.js';

export function registerPinCommand(program) {
  const pin = program.command('pin').description('Pin or unpin bookmarks for quick access');

  pin
    .command('add <url>')
    .description('Pin a bookmark by URL')
    .action(async (url) => {
      const config = await loadConfig();
      const { changed, total } = await pinAndSave(config.configDir, url);
      if (!changed) {
        console.log(chalk.yellow(`Bookmark not found or already pinned: ${url}`));
      } else {
        console.log(chalk.green(`Pinned: ${url}`));
        console.log(chalk.gray(`Total pinned: ${total}`));
      }
    });

  pin
    .command('remove <url>')
    .description('Unpin a bookmark by URL')
    .action(async (url) => {
      const config = await loadConfig();
      const { changed, total } = await unpinAndSave(config.configDir, url);
      if (!changed) {
        console.log(chalk.yellow(`Bookmark not found or not pinned: ${url}`));
      } else {
        console.log(chalk.green(`Unpinned: ${url}`));
        console.log(chalk.gray(`Total pinned: ${total}`));
      }
    });

  pin
    .command('list')
    .description('List all pinned bookmarks')
    .action(async () => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config.configDir);
      const pinned = getPinnedBookmarks(bookmarks);
      if (pinned.length === 0) {
        console.log(chalk.gray('No pinned bookmarks.'));
        return;
      }
      console.log(chalk.bold(`Pinned bookmarks (${pinned.length}):`));
      for (const b of pinned) {
        const tags = b.tags && b.tags.length ? chalk.gray(` [${b.tags.join(', ')}]`) : '';
        console.log(`  ${chalk.cyan(b.title || b.url)}${tags}\n  ${chalk.gray(b.url)}`);
      }
    });
}
