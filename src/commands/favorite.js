import { getFavorites, favoriteBookmark, unfavoriteBookmark, toggleFavorite } from '../favorite.js';
import { loadConfig } from '../config.js';

export function registerFavoriteCommand(program) {
  const fav = program
    .command('favorite')
    .description('Manage favorite bookmarks');

  fav
    .command('add <url>')
    .description('Mark a bookmark as favorite')
    .action((url) => {
      const config = loadConfig();
      try {
        const changed = favoriteBookmark(config, url);
        if (changed) {
          console.log(`⭐ Marked as favorite: ${url}`);
        } else {
          console.log(`Already a favorite: ${url}`);
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  fav
    .command('remove <url>')
    .description('Remove favorite status from a bookmark')
    .action((url) => {
      const config = loadConfig();
      try {
        const changed = unfavoriteBookmark(config, url);
        if (changed) {
          console.log(`Removed from favorites: ${url}`);
        } else {
          console.log(`Not a favorite: ${url}`);
        }
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  fav
    .command('toggle <url>')
    .description('Toggle favorite status for a bookmark')
    .action((url) => {
      const config = loadConfig();
      try {
        const now = toggleFavorite(config, url);
        console.log(now ? `⭐ Favorited: ${url}` : `Unfavorited: ${url}`);
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    });

  fav
    .command('list')
    .description('List all favorited bookmarks')
    .action(() => {
      const config = loadConfig();
      const favorites = getFavorites(config);
      if (favorites.length === 0) {
        console.log('No favorites yet.');
        return;
      }
      favorites.forEach((b) => {
        const tags = b.tags && b.tags.length ? ` [${b.tags.join(', ')}]` : '';
        console.log(`⭐ ${b.title}${tags}\n   ${b.url}`);
      });
    });
}
