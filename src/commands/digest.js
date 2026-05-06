import { buildDigest, formatDigest } from '../digest.js';
import { loadConfig } from '../config.js';

/**
 * Register the `digest` command on a commander program.
 * @param {import('commander').Command} program
 */
export function registerDigestCommand(program) {
  program
    .command('digest')
    .description('Show a summary digest of your bookmarks: pinned, top rated, recently added, and stale')
    .option('--json', 'Output digest as JSON instead of formatted text')
    .option('--stale-days <days>', 'Days threshold to consider a bookmark stale', '30')
    .action(async (opts) => {
      try {
        const config = await loadConfig();
        if (opts.staleDays) {
          config.staleDays = parseInt(opts.staleDays, 10);
        }

        const digest = await buildDigest(config);

        if (opts.json) {
          console.log(JSON.stringify(digest, null, 2));
        } else {
          console.log(formatDigest(digest));
        }
      } catch (err) {
        console.error('Error generating digest:', err.message);
        process.exit(1);
      }
    });
}
