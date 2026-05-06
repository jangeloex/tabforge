import { batchRemove, batchTag, batchUpdate } from '../batch.js';
import { loadConfig } from '../config.js';

export function registerBatchCommand(program) {
  const batch = program.command('batch').description('Bulk operations on bookmarks');

  batch
    .command('remove')
    .description('Remove multiple bookmarks by URL')
    .argument('<urls...>', 'URLs to remove')
    .action(async (urls) => {
      const config = await loadConfig();
      const { removed, notFound } = await batchRemove(config, urls);
      console.log(`Removed ${removed} bookmark(s).`);
      if (notFound.length) {
        console.warn(`Not found: ${notFound.join(', ')}`);
      }
    });

  batch
    .command('tag')
    .description('Add tags to multiple bookmarks')
    .argument('<urls...>', 'URLs to tag')
    .requiredOption('-t, --tags <tags>', 'Comma-separated tags to add')
    .action(async (urls, opts) => {
      const config = await loadConfig();
      const tags = opts.tags.split(',').map((t) => t.trim()).filter(Boolean);
      const { updated, notFound } = await batchTag(config, urls, tags);
      console.log(`Tagged ${updated} bookmark(s) with: ${tags.join(', ')}`);
      if (notFound.length) {
        console.warn(`Not found: ${notFound.join(', ')}`);
      }
    });

  batch
    .command('set-title')
    .description('Set title prefix on multiple bookmarks')
    .argument('<urls...>', 'URLs to update')
    .requiredOption('--prefix <prefix>', 'Prefix to prepend to title')
    .action(async (urls, opts) => {
      const config = await loadConfig();
      const { updated, notFound } = await batchUpdate(
        config,
        urls,
        (bm) => ({ ...bm, title: `${opts.prefix} ${bm.title}` })
      );
      console.log(`Updated title for ${updated} bookmark(s).`);
      if (notFound.length) {
        console.warn(`Not found: ${notFound.join(', ')}`);
      }
    });
}
