import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerWatchCommand } from './watch.js';

vi.mock('../bookmarks.js', () => ({
  loadBookmarks: vi.fn(),
  saveBookmarks: vi.fn(),
}));
vi.mock('../config.js', () => ({ loadConfig: vi.fn(() => ({})) }));
vi.mock('../watch.js', () => ({
  markWatched: vi.fn(),
  getUnwatched: vi.fn(),
  startWatcher: vi.fn(),
}));

import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { markWatched, getUnwatched } from '../watch.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerWatchCommand(program);
  return program;
}

beforeEach(() => vi.clearAllMocks());

describe('watch unwatched', () => {
  it('prints message when all are watched', async () => {
    getUnwatched.mockReturnValue([]);
    loadBookmarks.mockReturnValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['watch', 'unwatched'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('All bookmarks have been watched.');
    spy.mockRestore();
  });

  it('lists unwatched bookmarks', async () => {
    const bm = [{ url: 'https://x.com', title: 'X' }];
    getUnwatched.mockReturnValue(bm);
    loadBookmarks.mockReturnValue(bm);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['watch', 'unwatched'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('[X] https://x.com');
    spy.mockRestore();
  });
});

describe('watch mark', () => {
  it('saves updated bookmarks when url found', () => {
    const original = [{ url: 'https://x.com', title: 'X' }];
    const updated = [{ url: 'https://x.com', title: 'X', lastWatched: 'ts' }];
    loadBookmarks.mockReturnValue(original);
    markWatched.mockReturnValue(updated);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['watch', 'mark', 'https://x.com'], { from: 'user' });
    expect(saveBookmarks).toHaveBeenCalledWith({}, updated);
    spy.mockRestore();
  });

  it('exits with error when url not found', () => {
    const original = [{ url: 'https://x.com' }];
    loadBookmarks.mockReturnValue(original);
    markWatched.mockReturnValue(original);
    const spy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() =>
      makeProgram().parse(['watch', 'mark', 'https://missing.com'], { from: 'user' })
    ).toThrow();
    expect(spy).toHaveBeenCalledWith(1);
    spy.mockRestore();
  });
});
