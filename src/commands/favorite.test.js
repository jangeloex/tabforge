import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Command } from 'commander';
import { registerFavoriteCommand } from './favorite.js';

const mockFavorites = [
  { url: 'https://favorited.com', title: 'Favorited', tags: ['cool'], favorite: true },
];

vi.mock('../config.js', () => ({ loadConfig: () => ({ storePath: '/store' }) }));
vi.mock('../favorite.js', () => ({
  getFavorites: vi.fn(() => mockFavorites),
  favoriteBookmark: vi.fn((config, url) => {
    if (url === 'https://missing.com') throw new Error('Bookmark not found: https://missing.com');
    return url !== 'https://favorited.com';
  }),
  unfavoriteBookmark: vi.fn((config, url) => url === 'https://favorited.com'),
  toggleFavorite: vi.fn((config, url) => url !== 'https://favorited.com'),
}));

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerFavoriteCommand(program);
  return program;
}

describe('favorite list', () => {
  it('prints favorited bookmarks', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['favorite', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Favorited'));
    spy.mockRestore();
  });
});

describe('favorite add', () => {
  it('marks a new bookmark as favorite', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['favorite', 'add', 'https://new.com'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Marked as favorite'));
    spy.mockRestore();
  });

  it('reports already favorited', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['favorite', 'add', 'https://favorited.com'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Already a favorite'));
    spy.mockRestore();
  });
});

describe('favorite remove', () => {
  it('removes favorite status', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['favorite', 'remove', 'https://favorited.com'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Removed from favorites'));
    spy.mockRestore();
  });

  it('reports not a favorite', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['favorite', 'remove', 'https://new.com'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Not a favorite'));
    spy.mockRestore();
  });
});

describe('favorite toggle', () => {
  it('prints favorited on toggle on', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['favorite', 'toggle', 'https://new.com'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Favorited'));
    spy.mockRestore();
  });

  it('prints unfavorited on toggle off', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['favorite', 'toggle', 'https://favorited.com'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Unfavorited'));
    spy.mockRestore();
  });
});
