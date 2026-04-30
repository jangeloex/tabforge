import { recordVisit, getRecentHistory, clearHistory, searchHistory } from '../history.js';

export function registerHistoryCommand(program) {
  const history = program.command('history').description('Manage bookmark visit history');

  history
    .command('list')
    .description('Show recent visit history')
    .option('-n, --limit <n>', 'Number of entries to show', '20')
    .action((opts) => {
      const entries = getRecentHistory(parseInt(opts.limit, 10));
      if (!entries.length) {
        console.log('No history yet.');
        return;
      }
      entries.forEach((e, i) => {
        console.log(`${i + 1}. [${e.visitedAt}] ${e.title || '(no title)'} — ${e.url}`);
      });
    });

  history
    .command('search <query>')
    .description('Search visit history')
    .action((query) => {
      const results = searchHistory(query);
      if (!results.length) {
        console.log('No matches found.');
        return;
      }
      results.forEach((e, i) => {
        console.log(`${i + 1}. [${e.visitedAt}] ${e.title || '(no title)'} — ${e.url}`);
      });
    });

  history
    .command('record <url>')
    .description('Manually record a visit')
    .option('-t, --title <title>', 'Title for the entry', '')
    .action((url, opts) => {
      const entry = recordVisit(url, opts.title);
      console.log(`Recorded visit: ${entry.url} at ${entry.visitedAt}`);
    });

  history
    .command('clear')
    .description('Clear all visit history')
    .action(() => {
      clearHistory();
      console.log('History cleared.');
    });
}
