import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerPinCommand } from './pin.js';

vi.mock('../config.js', () => ({ loadConfig: vi.fn(async () => ({ configDir: '/fake' })) }));
vi.mock('../bookmarks.js', () => ({
  loadBookmarks: vi.fn(async () => [
    { url: 'https://a.com', title: 'A', tags: [] },
    { url: 'https://b.com', title: 'B', tags: ['dev'], pinned: true, pinnedAt: '2024-01-01T00:00:00.000Z' },
  ]),
}));
vi.mock('../pin.js', () => ({
  pinAndSave: vi.fn(async () => ({ changed: true, total: 2 })),
  unpinAndSave: vi.fn(async () => ({ changed: true, total: 1 })),
  getPinnedBookmarks: vi.fn((bms) => bms.filter((b) => b.pinned)),
}));

function makeProgram() {
  const p = new Command();
  p.exitOverride();
  registerPinCommand(p);
  return p;
}

describe('pin add', () => {
  it('calls pinAndSave and logs success', async () => {
    const p = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await p.parseAsync(['node', 'test', 'pin', 'add', 'https://a.com']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Pinned'));
    spy.mockRestore();
  });
});

describe('pin remove', () => {
  it('calls unpinAndSave and logs success', async () => {
    const p = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await p.parseAsync(['node', 'test', 'pin', 'remove', 'https://b.com']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Unpinned'));
    spy.mockRestore();
  });
});

describe('pin list', () => {
  it('lists pinned bookmarks', async () => {
    const p = makeProgram();
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    await p.parseAsync(['node', 'test', 'pin', 'list']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Pinned bookmarks'));
    spy.mockRestore();
  });
});
