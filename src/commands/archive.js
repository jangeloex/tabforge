import { loadConfig } from '../config.js';
import { archiveBookmarks, restoreFromArchive, loadArchive } from '../archive.js';

export function registerArchiveCommand(program) {
  const cmd = program.command('archive').description('archive or restore bookmarks');

  cmd
    .command('add')
    .description('archive bookmarks matching a tag or url substring')
    .option('-t, --tag <tag>', 'archive bookmarks with this tag')
    .option('-u, --url <substring>', 'archive bookmarks whose URL contains this substring')
    .action((opts) => {
      const config = loadConfig();
      if (!opts.tag && !opts.url) {
        console.error('Provide --tag or --url to select bookmarks to archive.');
        process.exit(1);
      }
      const predicate = (b) => {
        if (opts.tag) return Array.isArray(b.tags) && b.tags.includes(opts.tag);
        if (opts.url) return b.url.includes(opts.url);
        return false;
      };
      const { archived } = archiveBookmarks(config.configDir, predicate);
      if (archived.length === 0) {
        console.log('No bookmarks matched.');
      } else {
        console.log(`Archived ${archived.length} bookmark(s).`);
        archived.forEach((b) => console.log(`  - ${b.title || b.url}`));
      }
    });

  cmd
    .command('restore')
    .description('restore archived bookmarks by url substring')
    .requiredOption('-u, --url <substring>', 'restore bookmarks whose URL contains this substring')
    .action((opts) => {
      const config = loadConfig();
      const { restored } = restoreFromArchive(config.configDir, (b) => b.url.includes(opts.url));
      if (restored.length === 0) {
        console.log('No archived bookmarks matched.');
      } else {
        console.log(`Restored ${restored.length} bookmark(s).`);
        restored.forEach((b) => console.log(`  - ${b.title || b.url}`));
      }
    });

  cmd
    .command('list')
    .description('list all archived bookmarks')
    .action(() => {
      const config = loadConfig();
      const archived = loadArchive(config.configDir);
      if (archived.length === 0) {
        console.log('No archived bookmarks.');
        return;
      }
      archived.forEach((b) => {
        console.log(`[${b.archivedAt?.slice(0, 10)}] ${b.title || b.url} <${b.url}>`);
      });
    });
}
