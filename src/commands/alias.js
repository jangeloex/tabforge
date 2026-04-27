import { loadBookmarks } from '../bookmarks.js';
import { loadConfig } from '../config.js';
import { getAliases, setAlias, removeAlias, resolveAlias } from '../alias.js';

export function registerAliasCommand(program) {
  const alias = program
    .command('alias')
    .description('manage bookmark aliases for quick access');

  alias
    .command('set <id> <alias>')
    .description('set an alias for a bookmark')
    .action(async (id, aliasName) => {
      try {
        const config = await loadConfig();
        const bm = await setAlias(config.configDir, id, aliasName);
        console.log(`Alias "${aliasName}" set for "${bm.title}"`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  alias
    .command('remove <id>')
    .description('remove alias from a bookmark')
    .action(async (id) => {
      try {
        const config = await loadConfig();
        const bm = await removeAlias(config.configDir, id);
        console.log(`Alias removed from "${bm.title}"`);
      } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  alias
    .command('list')
    .description('list all aliases')
    .action(async () => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config.configDir);
      const aliases = getAliases(bookmarks);
      const entries = Object.entries(aliases);
      if (entries.length === 0) {
        console.log('No aliases defined.');
        return;
      }
      for (const [a, id] of entries) {
        const bm = bookmarks.find(b => b.id === id);
        console.log(`${a.padEnd(20)} -> ${bm ? bm.title : id} (${bm ? bm.url : ''})`);
      }
    });

  alias
    .command('resolve <alias>')
    .description('resolve an alias to its bookmark')
    .action(async (aliasName) => {
      const config = await loadConfig();
      const bookmarks = await loadBookmarks(config.configDir);
      const bm = resolveAlias(bookmarks, aliasName);
      if (!bm) {
        console.error(`No bookmark found for alias "${aliasName}"`);
        process.exit(1);
      }
      console.log(`${bm.title}\n${bm.url}`);
    });
}
