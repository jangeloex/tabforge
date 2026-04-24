import { loadConfig } from '../config.js';
import { syncBookmarks, gitPull, gitPush } from '../sync.js';

export async function handleSync(options = {}) {
  const config = await loadConfig();

  if (!config.repoPath) {
    console.error('No repository configured. Run `tabforge init` first.');
    process.exit(1);
  }

  const { pull = false, push = false } = options;

  try {
    if (pull && !push) {
      console.log('Pulling latest bookmarks from remote...');
      await gitPull(config.repoPath);
      console.log('Pull complete.');
      return;
    }

    if (push && !pull) {
      console.log('Pushing bookmarks to remote...');
      await gitPush(config.repoPath);
      console.log('Push complete.');
      return;
    }

    // default: full two-way sync
    console.log('Syncing bookmarks...');
    const result = await syncBookmarks(config.repoPath);

    if (result.pulled) {
      console.log('Pulled latest changes from remote.');
    }
    if (result.pushed) {
      console.log('Pushed local changes to remote.');
    }
    if (!result.pulled && !result.pushed) {
      console.log('Everything up to date.');
    }
  } catch (err) {
    console.error('Sync failed:', err.message);
    process.exit(1);
  }
}
