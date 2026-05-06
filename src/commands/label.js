import { addLabel, removeLabel, listAllLabels, getBookmarksByLabel } from '../labels.js';
import { loadConfig } from '../config.js';

/**
 * Register the `label` command group with the CLI program.
 * @param {import('commander').Command} program
 */
export function registerLabelCommand(program) {
  const label = program
    .command('label')
    .description('Manage labels on bookmarks');

  label
    .command('add <url> <label>')
    .description('Add a label to a bookmark')
    .action((url, labelName) => {
      const config = loadConfig();
      const added = addLabel(config, url, labelName);
      if (added) {
        console.log(`Label "${labelName.trim().toLowerCase()}" added to ${url}`);
      } else {
        console.log(`Label already exists or bookmark not found.`);
      }
    });

  label
    .command('remove <url> <label>')
    .description('Remove a label from a bookmark')
    .action((url, labelName) => {
      const config = loadConfig();
      const removed = removeLabel(config, url, labelName);
      if (removed) {
        console.log(`Label "${labelName.trim().toLowerCase()}" removed from ${url}`);
      } else {
        console.log(`Label not found on bookmark.`);
      }
    });

  label
    .command('list')
    .description('List all labels in use')
    .action(() => {
      const config = loadConfig();
      const labels = listAllLabels(config);
      if (labels.length === 0) {
        console.log('No labels found.');
      } else {
        labels.forEach(l => console.log(`  ${l}`));
      }
    });

  label
    .command('filter <label>')
    .description('Show bookmarks with a specific label')
    .action((labelName) => {
      const config = loadConfig();
      const bms = getBookmarksByLabel(config, labelName);
      if (bms.length === 0) {
        console.log(`No bookmarks found with label "${labelName}".`);
      } else {
        bms.forEach(bm => console.log(`  [${bm.labels.join(', ')}] ${bm.title} — ${bm.url}`));
      }
    });
}
