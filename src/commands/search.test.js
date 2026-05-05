import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerSearchCommand } from './search.js';

vi.mock('../config.js', () => ({ loadConfig: vi.fn(async () => ({})) }));
vi.mock('../bookmarks.js', () => ({
  loadBookmarks: vi.fn(async () => [
    { title: 'GitHub', url: 'https://github.com', tags: ['dev', 'git'] },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', tags: ['docs', 'web'] },
    { title: 'Node.js', url: 'https://nodejs.org', tags: ['dev', 'node'] },
  ]),
}));
vi.mock('../search.js', () => ({
  searchBookmarks: vi.fn((bookmarks, query, field) =>
    bookmarks.filter((b) => {
      if (field === 'tags') return b.tags.includes(query);
      if (field === 'url') return b.url.includes(query);
      return b.title.toLowerCase().includes(query.toLowerCase()) ||
        b.url.includes(query) ||
        (b.tags && b.tags.includes(query));
    })
  ),
}));

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSearchCommand(program);
  return program;
}

describe('search command', () => {
  let consoleSpy;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('prints results for a matching query', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'tabforge', 'search', 'github']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('1 bookmark'));
  });

  it('outputs JSON when --json flag is used', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'tabforge', 'search', 'github', '--json']);
    const jsonCall = consoleSpy.mock.calls.find((c) => c[0].startsWith('['));
    expect(jsonCall).toBeDefined();
    const parsed = JSON.parse(jsonCall[0]);
    expect(parsed[0].title).toBe('GitHub');
  });

  it('filters by tags when --tags flag is used', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'tabforge', 'search', 'dev', '--tags']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('2 bookmark'));
  });

  it('shows no results message when nothing matches', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'tabforge', 'search', 'zzznomatch']);
    expect(consoleSpy).toHaveBeenCalledWith('No bookmarks matched your search.');
  });

  it('respects --limit option', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'tabforge', 'search', 'dev', '--tags', '--limit', '1']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('1 bookmark'));
  });
});
