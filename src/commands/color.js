const { loadBookmarks, saveBookmarks } = require('../bookmarks');
const { loadConfig } = require('../config');
const { setColor, clearColor, getBookmarksByColor, listColors } = require('../color');

function registerColorCommand(program) {
  const color = program.command('color').description('Color-code bookmarks for visual organization');

  color
    .command('set <url> <color>')
    .description(`Assign a color to a bookmark (${listColors().join(', ')})`)
    .action(async (url, colorName) => {
      try {
        const config = await loadConfig();
        const bookmarks = await loadBookmarks(config);
        setColor(bookmarks, url, colorName);
        await saveBookmarks(config, bookmarks);
        console.log(`Colored "${url}" as ${colorName}.`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  color
    .command('clear <url>')
    .description('Remove color from a bookmark')
    .action(async (url) => {
      try {
        const config = await loadConfig();
        const bookmarks = await loadBookmarks(config);
        clearColor(bookmarks, url);
        await saveBookmarks(config, bookmarks);
        console.log(`Cleared color from "${url}".`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  color
    .command('list <color>')
    .description('List all bookmarks with a given color')
    .action(async (colorName) => {
      try {
        const config = await loadConfig();
        const bookmarks = await loadBookmarks(config);
        const results = getBookmarksByColor(bookmarks, colorName);
        if (results.length === 0) {
          console.log(`No bookmarks with color "${colorName}".`);
        } else {
          results.forEach((b) => console.log(`[${colorName}] ${b.title || b.url}  ${b.url}`));
        }
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  color
    .command('colors')
    .description('Show all available colors')
    .action(() => {
      console.log('Available colors:');
      listColors().forEach((c) => console.log(`  ${c}`));
    });
}

module.exports = { registerColorCommand };
