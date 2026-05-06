import { loadBookmarks } from '../bookmarks.js';
import { loadConfig } from '../config.js';
import {
  buildShareBundle,
  getShareableBookmarks,
  formatShareText,
  formatMarkdownLink,
} from '../share.js';

export function registerShareCommand(program) {
  const share = program
    .command('share')
    .description('Generate shareable output for bookmarks');

  share
    .command('text')
    .description('Print bookmarks as plain text')
    .option('-t, --tags <tags>', 'Comma-separated tags to filter by', '')
    .action(async (opts) => {
      const config = await loadConfig();
      const all = await loadBookmarks(config);
      const tags = opts.tags ? opts.tags.split(',').map(t => t.trim()) : [];
      const bookmarks = getShareableBookmarks(all, tags);
      if (!bookmarks.length) {
        console.log('No bookmarks found.');
        return;
      }
      console.log(bookmarks.map(formatShareText).join('\n\n'));
    });

  share
    .command('markdown')
    .description('Print bookmarks as Markdown links')
    .option('-t, --tags <tags>', 'Comma-separated tags to filter by', '')
    .action(async (opts) => {
      const config = await loadConfig();
      const all = await loadBookmarks(config);
      const tags = opts.tags ? opts.tags.split(',').map(t => t.trim()) : [];
      const bookmarks = getShareableBookmarks(all, tags);
      if (!bookmarks.length) {
        console.log('No bookmarks found.');
        return;
      }
      console.log(bookmarks.map(formatMarkdownLink).join('\n\n'));
    });

  share
    .command('bundle')
    .description('Print a full share bundle as JSON (all formats)')
    .option('-t, --tags <tags>', 'Comma-separated tags to filter by', '')
    .action(async (opts) => {
      const config = await loadConfig();
      const all = await loadBookmarks(config);
      const tags = opts.tags ? opts.tags.split(',').map(t => t.trim()) : [];
      const bookmarks = getShareableBookmarks(all, tags);
      const bundle = buildShareBundle(bookmarks);
      console.log(JSON.stringify(bundle, null, 2));
    });
}
