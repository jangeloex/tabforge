import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { loadConfig } from '../config.js';
import { mergeIntoStore } from '../merge.js';
import { fromNetscapeHTML, fromJSON } from '../import.js';

export function registerMergeCommand(program) {
  program
    .command('merge <file>')
    .description('Merge bookmarks from a JSON or Netscape HTML file into the local store')
    .option('-f, --format <format>', 'file format: json or html (default: auto-detect)', 'auto')
    .option('--dry-run', 'show what would change without writing', false)
    .action(async (file, opts) => {
      const config = await loadConfig();
      const raw = await readFile(file, 'utf8');

      let format = opts.format;
      if (format === 'auto') {
        format = file.endsWith('.html') || file.endsWith('.htm') ? 'html' : 'json';
      }

      let incoming;
      if (format === 'html') {
        incoming = fromNetscapeHTML(raw);
      } else {
        incoming = fromJSON(raw);
      }

      if (!Array.isArray(incoming) || incoming.length === 0) {
        console.error('No bookmarks found in the provided file.');
        process.exit(1);
      }

      if (opts.dryRun) {
        const { mergeBookmarks } = await import('../merge.js');
        const { loadBookmarks } = await import('../bookmarks.js');
        const base = await loadBookmarks(config.configDir);
        const result = mergeBookmarks(base, incoming);
        console.log(`Dry run — no changes written.`);
        console.log(`  Would add:    ${result.added}`);
        console.log(`  Would update: ${result.updated}`);
        console.log(`  Skipped:      ${result.skipped}`);
        return;
      }

      const result = await mergeIntoStore(config.configDir, incoming);
      console.log(`Merge complete.`);
      console.log(`  Added:   ${result.added}`);
      console.log(`  Updated: ${result.updated}`);
      console.log(`  Skipped: ${result.skipped}`);
    });
}
