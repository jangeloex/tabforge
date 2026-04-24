import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toNetscapeHTML, toJSON, exportBookmarks } from './export.js';

vi.mock('./bookmarks.js', () => ({
  loadBookmarks: vi.fn(),
}));
vi.mock('./config.js', () => ({
  loadConfig: vi.fn(),
}));
vi.mock('fs', () => ({ default: { writeFileSync: vi.fn() } }));

import { loadBookmarks } from './bookmarks.js';
import { loadConfig } from './config.js';
import fs from 'fs';

const sampleBookmarks = [
  { url: 'https://example.com', title: 'Example', createdAt: '2024-01-01T00:00:00.000Z' },
  { url: 'https://github.com', title: 'GitHub', createdAt: '2024-03-15T12:00:00.000Z' },
];

describe('toNetscapeHTML', () => {
  it('includes DOCTYPE header', () => {
    const html = toNetscapeHTML(sampleBookmarks);
    expect(html).toContain('NETSCAPE-Bookmark-file-1');
  });

  it('includes all bookmark URLs and titles', () => {
    const html = toNetscapeHTML(sampleBookmarks);
    expect(html).toContain('https://example.com');
    expect(html).toContain('GitHub');
  });
});

describe('toJSON', () => {
  it('returns valid JSON string', () => {
    const json = toJSON(sampleBookmarks);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toHaveLength(2);
  });
});

describe('exportBookmarks', () => {
  beforeEach(() => {
    loadConfig.mockResolvedValue({});
    loadBookmarks.mockResolvedValue(sampleBookmarks);
    fs.writeFileSync.mockClear();
  });

  it('writes html file to given path', async () => {
    const dest = await exportBookmarks('html', '/tmp/out.html');
    expect(dest).toBe('/tmp/out.html');
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/out.html', expect.stringContaining('NETSCAPE'), 'utf-8');
  });

  it('writes json file to given path', async () => {
    const dest = await exportBookmarks('json', '/tmp/out.json');
    expect(fs.writeFileSync).toHaveBeenCalledWith('/tmp/out.json', expect.stringContaining('example.com'), 'utf-8');
  });

  it('throws on unsupported format', async () => {
    await expect(exportBookmarks('csv')).rejects.toThrow('Unsupported export format');
  });
});
