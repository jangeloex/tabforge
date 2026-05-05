import {
  getCollections,
  listCollectionNames,
  addToCollection,
  removeFromCollection,
  renameCollection,
  deleteCollection,
} from '../collections.js';
import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { loadConfig } from '../config.js';

export function registerCollectionCommand(program) {
  const col = program.command('collection').description('Manage bookmark collections');

  col
    .command('list')
    .description('List all collections')
    .action(async () => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      const names = listCollectionNames(bookmarks);
      if (!names.length) return console.log('No collections found.');
      const cols = getCollections(bookmarks);
      for (const name of names) {
        console.log(`${name} (${cols[name].length})`);
      }
    });

  col
    .command('show <name>')
    .description('Show bookmarks in a collection')
    .action(async (name) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config);
      const cols = getCollections(bookmarks);
      const items = cols[name] || [];
      if (!items.length) return console.log(`No bookmarks in collection "${name}".`);
      items.forEach(b => console.log(`  ${b.title}  ${b.url}`));
    });

  col
    .command('add <url> <name>')
    .description('Add a bookmark to a collection')
    .action(async (url, name) => {
      const config = await loadConfig();
      let bookmarks = await loadBookmarks(config);
      bookmarks = addToCollection(bookmarks, url, name);
      await saveBookmarks(config, bookmarks);
      console.log(`Added ${url} to collection "${name}".`);
    });

  col
    .command('remove <url> <name>')
    .description('Remove a bookmark from a collection')
    .action(async (url, name) => {
      const config = await loadConfig();
      let bookmarks = await loadBookmarks(config);
      bookmarks = removeFromCollection(bookmarks, url, name);
      await saveBookmarks(config, bookmarks);
      console.log(`Removed ${url} from collection "${name}".`);
    });

  col
    .command('rename <old> <new>')
    .description('Rename a collection')
    .action(async (oldName, newName) => {
      const config = await loadConfig();
      let bookmarks = await loadBookmarks(config);
      bookmarks = renameCollection(bookmarks, oldName, newName);
      await saveBookmarks(config, bookmarks);
      console.log(`Renamed collection "${oldName}" to "${newName}".`);
    });

  col
    .command('delete <name>')
    .description('Delete a collection (bookmarks are kept)')
    .action(async (name) => {
      const config = await loadConfig();
      let bookmarks = await loadBookmarks(config);
      bookmarks = deleteCollection(bookmarks, name);
      await saveBookmarks(config, bookmarks);
      console.log(`Deleted collection "${name}".`);
    });
}
