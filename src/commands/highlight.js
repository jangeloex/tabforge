const { loadBookmarks } = require('../bookmarks');
const { searchBookmarks } = require('../search');
const { highlightBookmarks } = require('../highlight');
const { loadConfig } = require('../config');

/**
 * Register the `highlight` command — search and display results with
 * matched terms highlighted in the terminal output.
 */
function registerHighlightCommand(program) {
  program
    .command('highlight <query>')
    .description('search bookmarks and display results with highlighted matches')
    .option('-t, --tags <tags>', 'filter by comma-separated tags')
    .option('--url-only', 'only search URLs')
    .option('--title-only', 'only search titles')
    .action(async (query, opts) => {
      try {
        const config = await loadConfig();
        const bookmarks = await loadBookmarks(config);

        const filterTags = opts.tags
          ? opts.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [];

        const results = searchBookmarks(bookmarks, query, {
          tags: filterTags,
          urlOnly: opts.urlOnly || false,
          titleOnly: opts.titleOnly || false,
        });

        if (results.length === 0) {
          console.log('No bookmarks matched your query.');
          return;
        }

        const terms = query.trim().split(/\s+/);
        const highlighted = highlightBookmarks(results, terms);

        console.log(`\nFound ${highlighted.length} result(s) for "${query}":\n`);
        for (const bm of highlighted) {
          const tags = bm.tags && bm.tags.length ? `  [${bm.tags.join(', ')}]` : '';
          console.log(`  ${bm.title}${tags}`);
          console.log(`  ${bm.url}`);
          if (bm.notes) console.log(`  Note: ${bm.notes}`);
          console.log();
        }
      } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
      }
    });
}

module.exports = { registerHighlightCommand };
