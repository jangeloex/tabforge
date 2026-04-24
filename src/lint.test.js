const { lintBookmarks, isValidUrl } = require('./lint');

describe('isValidUrl', () => {
  it('accepts valid http url', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
  });

  it('rejects plain strings', () => {
    expect(isValidUrl('not a url')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidUrl('')).toBe(false);
  });
});

describe('lintBookmarks', () => {
  it('returns no issues for clean bookmarks', () => {
    const bookmarks = [
      { id: '1', title: 'Example', url: 'https://example.com', tags: ['web'] },
      { id: '2', title: 'Google', url: 'https://google.com', tags: [] }
    ];
    expect(lintBookmarks(bookmarks)).toEqual([]);
  });

  it('flags missing title', () => {
    const bookmarks = [{ id: '1', title: '', url: 'https://example.com', tags: [] }];
    const issues = lintBookmarks(bookmarks);
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe('missing_title');
  });

  it('flags invalid url', () => {
    const bookmarks = [{ id: '1', title: 'Bad', url: 'not-a-url', tags: [] }];
    const issues = lintBookmarks(bookmarks);
    expect(issues.some(i => i.type === 'invalid_url')).toBe(true);
  });

  it('flags missing url', () => {
    const bookmarks = [{ id: '1', title: 'No URL', url: '', tags: [] }];
    const issues = lintBookmarks(bookmarks);
    expect(issues.some(i => i.type === 'missing_url')).toBe(true);
  });

  it('flags duplicate urls (case-insensitive)', () => {
    const bookmarks = [
      { id: '1', title: 'A', url: 'https://example.com', tags: [] },
      { id: '2', title: 'B', url: 'https://EXAMPLE.COM', tags: [] }
    ];
    const issues = lintBookmarks(bookmarks);
    expect(issues.some(i => i.type === 'duplicate_url')).toBe(true);
  });

  it('flags empty tags', () => {
    const bookmarks = [{ id: '1', title: 'A', url: 'https://example.com', tags: ['', 'valid'] }];
    const issues = lintBookmarks(bookmarks);
    expect(issues.some(i => i.type === 'empty_tag')).toBe(true);
  });

  it('returns multiple issues for one bookmark', () => {
    const bookmarks = [{ id: '1', title: '', url: 'bad-url', tags: [''] }];
    const issues = lintBookmarks(bookmarks);
    expect(issues.length).toBeGreaterThanOrEqual(2);
  });
});
