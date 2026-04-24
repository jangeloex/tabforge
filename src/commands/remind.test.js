import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerRemindCommand } from './remind.js';

vi.mock('../bookmarks.js', () => ({
  loadBookmarks: vi.fn(),
  saveBookmarks: vi.fn(),
}));
vi.mock('../config.js', () => ({
  loadConfig: vi.fn(),
}));
vi.mock('../remind.js', () => ({
  getStaleBookmarks: vi.fn(),
  markVisited: vi.fn(),
}));

import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { loadConfig } from '../config.js';
import { getStaleBookmarks, markVisited } from '../remind.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerRemindCommand(program);
  return program;
}

beforeEach(() => {
  vi.clearAllMocks();
  loadConfig.mockResolvedValue({ storeDir: '/fake' });
});

describe('remind list', () => {
  it('prints message when no stale bookmarks', async () => {
    loadBookmarks.mockResolvedValue([]);
    getStaleBookmarks.mockReturnValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['remind', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No stale'));
    spy.mockRestore();
  });

  it('lists stale bookmarks', async () => {
    const stale = [{ url: 'https://old.com', title: 'Old', lastVisited: '2020-01-01' }];
    loadBookmarks.mockResolvedValue(stale);
    getStaleBookmarks.mockReturnValue(stale);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['remind', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('1 bookmark'));
    spy.mockRestore();
  });
});

describe('remind visited', () => {
  it('saves updated bookmarks on success', async () => {
    const bms = [{ url: 'https://x.com', title: 'X' }];
    const updated = [{ url: 'https://x.com', title: 'X', lastVisited: new Date().toISOString() }];
    loadBookmarks.mockResolvedValue(bms);
    markVisited.mockReturnValue(updated);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['remind', 'visited', 'https://x.com'], { from: 'user' });
    expect(saveBookmarks).toHaveBeenCalledWith('/fake', updated);
    spy.mockRestore();
  });

  it('exits with error when url not found', async () => {
    const bms = [{ url: 'https://x.com', title: 'X' }];
    loadBookmarks.mockResolvedValue(bms);
    markVisited.mockReturnValue(bms); // same ref = not found
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      makeProgram().parseAsync(['remind', 'visited', 'https://notexist.com'], { from: 'user' })
    ).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    spy.mockRestore();
    exitSpy.mockRestore();
  });
});
