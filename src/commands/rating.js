const { getRating, setRating, clearRating, getTopRated, averageRating } = require('../rating');
const { loadBookmarks, saveBookmarks } = require('../bookmarks');
const { loadConfig } = require('../config');

function registerRatingCommand(program) {
  const rating = program.command('rating').description('Rate and review bookmarks');

  rating
    .command('set <url> <score>')
    .description('Set a rating (1-5) for a bookmark')
    .action(async (url, score) => {
      const config = loadConfig();
      const bookmarks = loadBookmarks(config);
      const num = parseInt(score, 10);
      if (isNaN(num) || num < 1 || num > 5) {
        console.error('Score must be an integer between 1 and 5');
        process.exit(1);
      }
      const updated = setRating(bookmarks, url, num);
      saveBookmarks(config, updated);
      console.log(`Rated ${url}: ${num}/5`);
    });

  rating
    .command('get <url>')
    .description('Get the rating for a bookmark')
    .action(async (url) => {
      const config = loadConfig();
      const bookmarks = loadBookmarks(config);
      const r = getRating(bookmarks, url);
      if (r === null) {
        console.log(`No rating set for ${url}`);
      } else {
        console.log(`${url}: ${r}/5`);
      }
    });

  rating
    .command('clear <url>')
    .description('Remove the rating for a bookmark')
    .action(async (url) => {
      const config = loadConfig();
      const bookmarks = loadBookmarks(config);
      const updated = clearRating(bookmarks, url);
      saveBookmarks(config, updated);
      console.log(`Cleared rating for ${url}`);
    });

  rating
    .command('top')
    .description('List top-rated bookmarks')
    .option('-n, --count <n>', 'Number of results', '10')
    .action(async (opts) => {
      const config = loadConfig();
      const bookmarks = loadBookmarks(config);
      const top = getTopRated(bookmarks, parseInt(opts.count, 10));
      if (top.length === 0) {
        console.log('No rated bookmarks found.');
        return;
      }
      top.forEach(b => console.log(`[${b.rating}/5] ${b.title || b.url}  ${b.url}`));
    });

  rating
    .command('avg')
    .description('Show average rating across all rated bookmarks')
    .action(async () => {
      const config = loadConfig();
      const bookmarks = loadBookmarks(config);
      const avg = averageRating(bookmarks);
      if (avg === null) {
        console.log('No rated bookmarks.');
      } else {
        console.log(`Average rating: ${avg.toFixed(2)}/5`);
      }
    });
}

module.exports = { registerRatingCommand };
