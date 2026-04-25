import { renameBookmark, renameBookmarkUrl } from '../rename.js';

/**
 * @param {import('commander').Command} program
 */
export function registerRenameCommand(program) {
  const rename = program
    .command('rename')
    .description('Rename a bookmark title or URL');

  rename
    .command('title <url> <newTitle>')
    .description('Update the title of a bookmark by its URL')
    .action(async (url, newTitle) => {
      try {
        const { updated, bookmark } = await renameBookmark(url, newTitle);
        if (!updated) {
          console.error(`No bookmark found with URL: ${url}`);
          process.exit(1);
        }
        console.log(`Renamed bookmark to "${bookmark.title}"`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  rename
    .command('url <oldUrl> <newUrl>')
    .description('Change the URL of a bookmark')
    .option('-t, --title <title>', 'Also update the title')
    .action(async (oldUrl, newUrl, opts) => {
      try {
        const { updated, bookmark } = await renameBookmarkUrl(
          oldUrl,
          newUrl,
          opts.title || null
        );
        if (!updated) {
          console.error(`No bookmark found with URL: ${oldUrl}`);
          process.exit(1);
        }
        console.log(`Updated URL to "${bookmark.url}"`);
        if (opts.title) {
          console.log(`Updated title to "${bookmark.title}"`);
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
