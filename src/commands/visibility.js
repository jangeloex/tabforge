const { loadConfig } = require('../config');
const { loadBookmarks, saveBookmarks } = require('../bookmarks');
const {
  makePublic,
  makePrivate,
  getPublicBookmarks,
  getPrivateBookmarks,
  getVisibility,
} = require('../visibility');

function registerVisibilityCommand(program) {
  const vis = program.command('visibility').description('Manage bookmark visibility (public/private)');

  vis
    .command('set <url> <visibility>')
    .description('Set visibility to public or private')
    .action(async (url, visibility) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      if (visibility === 'public') makePublic(bookmarks, url);
      else if (visibility === 'private') makePrivate(bookmarks, url);
      else return console.error(`Unknown visibility: ${visibility}. Use 'public' or 'private'.`);
      await saveBookmarks(config, bookmarks);
      console.log(`Set ${url} to ${visibility}.`);
    });

  vis
    .command('list [filter]')
    .description('List bookmarks by visibility (public|private|all)')
    .action(async (filter = 'all') => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      let results;
      if (filter === 'public') results = getPublicBookmarks(bookmarks);
      else if (filter === 'private') results = getPrivateBookmarks(bookmarks);
      else results = bookmarks;

      if (results.length === 0) return console.log('No bookmarks found.');
      results.forEach(b => {
        const v = getVisibility(b);
        console.log(`[${v}] ${b.title || b.url} — ${b.url}`);
      });
    });
}

module.exports = { registerVisibilityCommand };
