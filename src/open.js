import { exec } from 'child_process';
import { platform } from 'os';
import { loadBookmarks } from './bookmarks.js';
import { searchBookmarks } from './search.js';

export function getOpenCommand() {
  switch (platform()) {
    case 'darwin': return 'open';
    case 'win32': return 'start';
    default: return 'xdg-open';
  }
}

export function openUrl(url) {
  return new Promise((resolve, reject) => {
    const cmd = getOpenCommand();
    exec(`${cmd} "${url}"`, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function openBookmark(query, { configDir } = {}) {
  const bookmarks = await loadBookmarks({ configDir });

  if (!query) {
    throw new Error('No query provided');
  }

  // Try exact URL match first
  const exactMatch = bookmarks.find(
    (b) => b.url === query || b.title === query
  );

  if (exactMatch) {
    await openUrl(exactMatch.url);
    return exactMatch;
  }

  // Fall back to search
  const results = searchBookmarks(bookmarks, query);

  if (results.length === 0) {
    throw new Error(`No bookmark found matching: ${query}`);
  }

  const first = results[0];
  await openUrl(first.url);
  return first;
}
