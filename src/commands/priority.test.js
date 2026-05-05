import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Command } from 'commander';
import { registerPriorityCommand } from './priority.js';

vi.mock('../config.js', () => ({ loadConfig: vi.fn(async () => ({})) }));
vi.mock('../bookmarks.js', () => ({
  loadBookmarks: vi.fn(),
  saveBookmarks: vi.fn(async () => {}),
}));
vi.mock('../priority.js', () => ({
  setPriority: vi.fn(),
  clearPriority: vi.fn(),
  getPriorityLabel: vi.fn((n) => ['', 'low', 'medium', 'high'][n]),
  sortByPriority: vi.fn((b) => b),
  getBookmarksByPriority: vi.fn((b, lvl) => b.filter((x) => x.priority === lvl)),
}));

import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { setPriority, clearPriority, sortByPriority } from '../priority.js';

function makeProgram() {
  const p = new Command();
  p.exitOverride();
  registerPriorityCommand(p);
  return p;
}

const baseBookmarks = [
  { url: 'https://a.com', title: 'A', priority: 3 },
  { url: 'https://b.com', title: 'B', priority: 1 },
];

beforeEach(() => {
  vi.clearAllMocks();
  loadBookmarks.mockResolvedValue([...baseBookmarks]);
});

describe('priority set', () => {
  it('calls setPriority and saves', async () => {
    const updated = [...baseBookmarks];
    setPriority.mockReturnValue(updated);
    const p = makeProgram();
    await p.parseAsync(['priority', 'set', 'https://a.com', '2'], { from: 'user' });
    expect(setPriority).toHaveBeenCalledWith(expect.any(Array), 'https://a.com', 2);
    expect(saveBookmarks).toHaveBeenCalled();
  });

  it('exits on invalid level', async () => {
    const p = makeProgram();
    await expect(
      p.parseAsync(['priority', 'set', 'https://a.com', '5'], { from: 'user' })
    ).rejects.toThrow();
  });

  it('exits when bookmark not found', async () => {
    setPriority.mockReturnValue(null);
    const p = makeProgram();
    await expect(
      p.parseAsync(['priority', 'set', 'https://missing.com', '1'], { from: 'user' })
    ).rejects.toThrow();
  });
});

describe('priority clear', () => {
  it('calls clearPriority and saves', async () => {
    clearPriority.mockReturnValue([...baseBookmarks]);
    const p = makeProgram();
    await p.parseAsync(['priority', 'clear', 'https://a.com'], { from: 'user' });
    expect(clearPriority).toHaveBeenCalledWith(expect.any(Array), 'https://a.com');
    expect(saveBookmarks).toHaveBeenCalled();
  });
});

describe('priority list', () => {
  it('lists bookmarks with priority set', async () => {
    sortByPriority.mockReturnValue([...baseBookmarks]);
    const p = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await p.parseAsync(['priority', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it('shows message when no priorities set', async () => {
    loadBookmarks.mockResolvedValue([{ url: 'https://c.com', title: 'C' }]);
    sortByPriority.mockReturnValue([{ url: 'https://c.com', title: 'C' }]);
    const p = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await p.parseAsync(['priority', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No bookmarks with priority set.');
    spy.mockRestore();
  });
});
