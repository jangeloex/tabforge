import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getOpenCommand, openUrl, openBookmark } from './open.js';
import * as bookmarksModule from './bookmarks.js';
import { exec } from 'child_process';

vi.mock('child_process', () => ({ exec: vi.fn() }));
vi.mock('./bookmarks.js');

const mockBookmarks = [
  { id: '1', url: 'https://example.com', title: 'Example', tags: [] },
  { id: '2', url: 'https://github.com', title: 'GitHub', tags: ['dev'] },
  { id: '3', url: 'https://nodejs.org', title: 'Node.js Docs', tags: ['dev', 'docs'] },
];

beforeEach(() => {
  vi.clearAllMocks();
  bookmarksModule.loadBookmarks.mockResolvedValue(mockBookmarks);
});

describe('getOpenCommand', () => {
  it('returns open on darwin', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('darwin');
    expect(getOpenCommand()).toBe('open');
  });

  it('returns xdg-open on linux', () => {
    vi.spyOn(process, 'platform', 'get').mockReturnValue('linux');
    expect(getOpenCommand()).toBe('xdg-open');
  });
});

describe('openUrl', () => {
  it('calls exec with the correct command', async () => {
    exec.mockImplementation((cmd, cb) => cb(null));
    await openUrl('https://example.com');
    expect(exec).toHaveBeenCalledWith(
      expect.stringContaining('https://example.com'),
      expect.any(Function)
    );
  });

  it('rejects on exec error', async () => {
    exec.mockImplementation((cmd, cb) => cb(new Error('fail')));
    await expect(openUrl('https://bad.url')).rejects.toThrow('fail');
  });
});

describe('openBookmark', () => {
  beforeEach(() => {
    exec.mockImplementation((cmd, cb) => cb(null));
  });

  it('throws if no query provided', async () => {
    await expect(openBookmark('')).rejects.toThrow('No query provided');
  });

  it('opens exact URL match', async () => {
    const result = await openBookmark('https://example.com');
    expect(result.url).toBe('https://example.com');
  });

  it('opens exact title match', async () => {
    const result = await openBookmark('GitHub');
    expect(result.url).toBe('https://github.com');
  });

  it('falls back to search and opens first result', async () => {
    const result = await openBookmark('node');
    expect(result.url).toBe('https://nodejs.org');
  });

  it('throws if no bookmark found', async () => {
    await expect(openBookmark('zzznomatch')).rejects.toThrow('No bookmark found matching');
  });
});
