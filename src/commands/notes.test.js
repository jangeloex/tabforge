import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerNotesCommand } from './notes.js';

vi.mock('../bookmarks.js', () => ({
  loadBookmarks: vi.fn(),
  saveBookmarks: vi.fn(),
}));

vi.mock('../notes.js', () => ({
  getNote: vi.fn(),
  setNote: vi.fn(),
  removeNote: vi.fn(),
  getBookmarksWithNotes: vi.fn(),
}));

import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { getNote, setNote, removeNote, getBookmarksWithNotes } from '../notes.js';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerNotesCommand(program);
  return program;
}

const fakeBookmarks = [
  { url: 'https://example.com', title: 'Example', tags: [], note: 'hello' },
];

beforeEach(() => {
  vi.clearAllMocks();
  loadBookmarks.mockResolvedValue(fakeBookmarks);
  saveBookmarks.mockResolvedValue();
});

describe('notes set', () => {
  it('calls setNote and saves', async () => {
    setNote.mockReturnValue(fakeBookmarks);
    const program = makeProgram();
    await program.parseAsync(['notes', 'set', 'https://example.com', 'my note'], { from: 'user' });
    expect(setNote).toHaveBeenCalledWith(fakeBookmarks, 'https://example.com', 'my note');
    expect(saveBookmarks).toHaveBeenCalledWith(fakeBookmarks);
  });
});

describe('notes get', () => {
  it('prints the note when found', async () => {
    getNote.mockReturnValue('hello world');
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['notes', 'get', 'https://example.com'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('hello world');
    spy.mockRestore();
  });

  it('prints fallback when no note', async () => {
    getNote.mockReturnValue(null);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['notes', 'get', 'https://example.com'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No note found for that bookmark.');
    spy.mockRestore();
  });
});

describe('notes remove', () => {
  it('calls removeNote and saves', async () => {
    removeNote.mockReturnValue(fakeBookmarks);
    const program = makeProgram();
    await program.parseAsync(['notes', 'remove', 'https://example.com'], { from: 'user' });
    expect(removeNote).toHaveBeenCalledWith(fakeBookmarks, 'https://example.com');
    expect(saveBookmarks).toHaveBeenCalled();
  });
});

describe('notes list', () => {
  it('lists bookmarks with notes', async () => {
    getBookmarksWithNotes.mockReturnValue(fakeBookmarks);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['notes', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('prints empty message when none', async () => {
    getBookmarksWithNotes.mockReturnValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['notes', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No bookmarks with notes.');
    spy.mockRestore();
  });
});
