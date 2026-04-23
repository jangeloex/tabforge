const fs = require('fs');
const path = require('path');
const os = require('os');
const { addBookmark, removeBookmark, listBookmarks, getBookmarksPath } = require('./bookmarks');
const { saveConfig } = require('./config');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabforge-test-'));
  saveConfig({ storePath: tmpDir });
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('addBookmark', () => {
  test('adds a new bookmark', () => {
    const bm = addBookmark({ url: 'https://example.com', title: 'Example', tags: ['test'] });
    expect(bm.url).toBe('https://example.com');
    expect(bm.title).toBe('Example');
    expect(bm.tags).toContain('test');
    expect(bm.id).toBeDefined();
    expect(bm.createdAt).toBeDefined();
  });

  test('throws if URL is missing', () => {
    expect(() => addBookmark({ title: 'No URL' })).toThrow('URL is required');
  });

  test('throws on duplicate URL', () => {
    addBookmark({ url: 'https://dupe.com' });
    expect(() => addBookmark({ url: 'https://dupe.com' })).toThrow('Bookmark already exists');
  });

  test('uses URL as title if title not provided', () => {
    const bm = addBookmark({ url: 'https://notitle.com' });
    expect(bm.title).toBe('https://notitle.com');
  });
});

describe('removeBookmark', () => {
  test('removes an existing bookmark', () => {
    const bm = addBookmark({ url: 'https://remove.me' });
    const removed = removeBookmark(bm.id);
    expect(removed.url).toBe('https://remove.me');
    expect(listBookmarks()).toHaveLength(0);
  });

  test('throws if bookmark not found', () => {
    expect(() => removeBookmark('nonexistent-id')).toThrow('Bookmark not found');
  });
});

describe('listBookmarks', () => {
  test('returns all bookmarks', () => {
    addBookmark({ url: 'https://a.com' });
    addBookmark({ url: 'https://b.com' });
    expect(listBookmarks()).toHaveLength(2);
  });

  test('filters by tag', () => {
    addBookmark({ url: 'https://work.com', tags: ['work'] });
    addBookmark({ url: 'https://fun.com', tags: ['personal'] });
    const results = listBookmarks({ tag: 'work' });
    expect(results).toHaveLength(1);
    expect(results[0].url).toBe('https://work.com');
  });
});
