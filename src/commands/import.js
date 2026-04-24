const path = require('path');
const { fromNetscapeHTML, fromJSON } = require('../import');
const { loadBookmarks, saveBookmarks } = require('../bookmarks');
const { loadConfig } = require('../config');

/**
 * Register the import command on a yargs instance.
 * @param {import('yargs').Argv} yargs
 */
function registerImportCommand(yargs) {
  yargs.command(
    'import <file>',
    'Import bookmarks from an HTML or JSON file',
    (y) => {
      y.positional('file', {
        describe: 'Path to the bookmarks file to import',
        type: 'string',
      });
      y.option('format', {
        alias: 'f',
        describe: 'File format: html or json (auto-detected by extension if omitted)',
        choices: ['html', 'json'],
        type: 'string',
      });
      y.option('merge', {
        alias: 'm',
        describe: 'Merge with existing bookmarks instead of replacing',
        type: 'boolean',
        default: true,
      });
    },
    async (argv) => {
      try {
        const config = loadConfig();
        const filePath = path.resolve(argv.file);
        const ext = path.extname(filePath).toLowerCase();
        const format = argv.format || (ext === '.json' ? 'json' : 'html');

        let imported;
        if (format === 'json') {
          imported = fromJSON(filePath);
        } else {
          imported = fromNetscapeHTML(filePath);
        }

        let existing = argv.merge ? loadBookmarks(config) : [];
        const existingUrls = new Set(existing.map((b) => b.url));
        const newOnes = imported.filter((b) => !existingUrls.has(b.url));
        const merged = [...existing, ...newOnes];

        saveBookmarks(config, merged);

        console.log(`Imported ${newOnes.length} new bookmark(s) (${imported.length - newOnes.length} duplicate(s) skipped).`);
      } catch (err) {
        console.error('Import failed:', err.message);
        process.exit(1);
      }
    }
  );
}

module.exports = { registerImportCommand };
