import { getStats } from '../stats.js';
import { loadConfig } from '../config.js';

export function registerStatsCommand(program) {
  program
    .command('stats')
    .description('Show statistics about your bookmark collection')
    .option('--json', 'Output raw JSON')
    .action(async (opts) => {
      const config = await loadConfig();
      const stats = await getStats(config.storeDir);

      if (opts.json) {
        console.log(JSON.stringify(stats, null, 2));
        return;
      }

      console.log('\n📊 Bookmark Statistics\n');
      console.log(`  Total bookmarks   : ${stats.total}`);
      console.log(`  Tagged            : ${stats.tagged}`);
      console.log(`  Untagged          : ${stats.untagged}`);
      console.log(`  Avg tags/bookmark : ${stats.avgTagsPerBookmark}`);

      if (stats.topTags.length > 0) {
        console.log('\n  Top Tags:');
        for (const { tag, count } of stats.topTags) {
          console.log(`    #${tag.padEnd(20)} ${count}`);
        }
      }

      const topDomains = Object.entries(stats.domains)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      if (topDomains.length > 0) {
        console.log('\n  Top Domains:');
        for (const [domain, count] of topDomains) {
          console.log(`    ${domain.padEnd(30)} ${count}`);
        }
      }

      console.log('');
    });
}
