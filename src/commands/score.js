const { loadBookmarks } = require('../bookmarks');
const { loadConfig } = require('../config');
const { rankBookmarks } = require('../score');

function registerScoreCommand(program) {
  program
    .command('score')
    .description('Rank bookmarks by relevance score')
    .option('-n, --top <n>', 'Show top N results', '10')
    .option('--all', 'Show all bookmarks with scores')
    .option('--json', 'Output as JSON')
    .action(async (opts) => {
      const config = loadConfig();
      const bookmarks = loadBookmarks(config);

      if (bookmarks.length === 0) {
        console.log('No bookmarks found.');
        return;
      }

      const ranked = rankBookmarks(bookmarks);
      const limit = opts.all ? ranked.length : parseInt(opts.top, 10);
      const results = ranked.slice(0, limit);

      if (opts.json) {
        console.log(JSON.stringify(results, null, 2));
        return;
      }

      console.log(`\nTop ${results.length} bookmarks by relevance score:\n`);
      results.forEach((b, i) => {
        const score = (b._score * 100).toFixed(1);
        const fav = b.favorite ? ' ★' : '';
        const pri = b.priority ? ` [${b.priority}]` : '';
        console.log(`${String(i + 1).padStart(3)}. [${score}%]${fav}${pri} ${b.title}`);
        console.log(`      ${b.url}`);
      });
    });
}

module.exports = { registerScoreCommand };
