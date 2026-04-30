import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import {
  loadHistory,
  saveHistory,
  recordVisit,
  getRecentHistory,
  clearHistory,
  searchHistory,
} from './history.js';

vi.mock('./config.js', () => ({ getConfigDir: () => '/tmp/tabforge-test' }));
vi.mock('fs');

beforeEach(() => {
  vi.resetAllMocks();
});

describe('loadHistory', () => {
  it('returns empty array if file missing', () => {
    fs.existsSync.mockReturnValue(false);
    expect(loadHistory()).toEqual([]);
  });

  it('parses existing history file', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([{ url: 'https://a.com', title: 'A', visitedAt: '2024-01-01' }]));
    expect(loadHistory()).toHaveLength(1);
  });
});

describe('recordVisit', () => {
  it('prepends a new entry', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([]));
    const entry = recordVisit('https://example.com', 'Example');
    expect(entry.url).toBe('https://example.com');
    expect(entry.title).toBe('Example');
    expect(fs.writeFileSync).toHaveBeenCalled();
  });
});

describe('getRecentHistory', () => {
  it('returns limited entries', () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ url: `https://${i}.com`, title: '', visitedAt: '' }));
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(items));
    expect(getRecentHistory(10)).toHaveLength(10);
  });
});

describe('clearHistory', () => {
  it('writes empty array', () => {
    clearHistory();
    expect(fs.writeFileSync).toHaveBeenCalledWith(expect.any(String), JSON.stringify([], null, 2));
  });
});

describe('searchHistory', () => {
  it('filters by url or title', () => {
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify([
      { url: 'https://github.com', title: 'GitHub', visitedAt: '' },
      { url: 'https://google.com', title: 'Google', visitedAt: '' },
    ]));
    expect(searchHistory('github')).toHaveLength(1);
    expect(searchHistory('google')).toHaveLength(1);
  });
});
