import chalk from 'chalk';
import { loadConfig } from '../config.js';
import {
  addTagToBookmark,
  removeTagFromBookmark,
  getBookmarksByTag,
  getTagsFromBookmarks,
} from '../tags.js';
import { loadBookmarks } from '../bookmarks.js';

export function registerTagCommand(program) {
  const tag = program.command('tag').description('Manage bookmark tags');

  tag
    .command('add <url> <tag>')
    .description('Add a tag to a bookmark')
    .action(async (url, tagName) => {
      const config = await loadConfig();
      const bookmark = await addTagToBookmark(config.storeDir, url, tagName);
      console.log(chalk.green(`Tag "${tagName}" added to ${bookmark.title || url}`));
    });

  tag
    .command('remove <url> <tag>')
    .description('Remove a tag from a bookmark')
    .action(async (url, tagName) => {
      const config = await loadConfig();
      const bookmark = await removeTagFromBookmark(config.storeDir, url, tagName);
      console.log(chalk.yellow(`Tag "${tagName}" removed from ${bookmark.title || url}`));
    });

  tag
    .command('list [tag]')
    .description('List all tags or bookmarks with a specific tag')
    .action(async (tagName) => {
      const config = await loadConfig();
      if (tagName) {
        const bookmarks = await getBookmarksByTag(config.storeDir, tagName);
        if (bookmarks.length === 0) {
          console.log(chalk.gray(`No bookmarks found with tag "${tagName}"`));
        } else {
          console.log(chalk.bold(`Bookmarks tagged "${tagName}":`))
          bookmarks.forEach(b => {
            console.log(`  ${chalk.cyan(b.title || b.url)}  ${chalk.gray(b.url)}`);
          });
        }
      } else {
        const bookmarks = await loadBookmarks(config.storeDir);
        const tags = getTagsFromBookmarks(bookmarks);
        if (tags.length === 0) {
          console.log(chalk.gray('No tags found.'));
        } else {
          console.log(chalk.bold('All tags:'));
          tags.forEach(t => console.log(`  ${chalk.cyan(t)}`));
        }
      }
    });
}
