const { highlightTerm, highlightTerms, highlightBookmark, highlightBookmarks } = require('./highlight');

const RESET = '\x1b[0m';
const YELLOW_BOLD = '\x1b[1;33m';

function wrap(s) {
  return `${YELLOW_BOLD}${s}${RESET}`;
}

describe('highlightTerm', () => {
  test('wraps matched substring', () => {
    expect(highlightTerm('hello world', 'world')).toBe(`hello ${wrap('world')}`);
  });

  test('is case-insensitive', () => {
    expect(highlightTerm('Hello World', 'hello')).toBe(`${wrap('Hello')} World`);
  });

  test('returns original text when term is empty', () => {
    expect(highlightTerm('hello', '')).toBe('hello');
  });

  test('returns original text when text is empty', () => {
    expect(highlightTerm('', 'foo')).toBe('');
  });

  test('handles regex special characters in term', () => {
    const result = highlightTerm('price: $5.00', '$5.00');
    expect(result).toBe(`price: ${wrap('$5.00')}`);
  });

  test('highlights multiple occurrences', () => {
    const result = highlightTerm('foo foo foo', 'foo');
    expect(result).toBe(`${wrap('foo')} ${wrap('foo')} ${wrap('foo')}`);
  });
});

describe('highlightTerms', () => {
  test('highlights multiple terms', () => {
    const result = highlightTerms('github notes', ['github', 'notes']);
    expect(result).toContain(wrap('github'));
    expect(result).toContain(wrap('notes'));
  });

  test('returns text unchanged for empty terms array', () => {
    expect(highlightTerms('hello', [])).toBe('hello');
  });
});

describe('highlightBookmark', () => {
  const bm = { id: '1', title: 'GitHub Repo', url: 'https://github.com', tags: [] };

  test('highlights term in title', () => {
    const result = highlightBookmark(bm, 'GitHub');
    expect(result.title).toContain(wrap('GitHub'));
  });

  test('highlights term in url', () => {
    const result = highlightBookmark(bm, 'github');
    expect(result.url).toContain(wrap('github'));
  });

  test('does not mutate original bookmark', () => {
    highlightBookmark(bm, 'GitHub');
    expect(bm.title).toBe('GitHub Repo');
  });
});

describe('highlightBookmarks', () => {
  const bookmarks = [
    { id: '1', title: 'GitHub', url: 'https://github.com', tags: [] },
    { id: '2', title: 'Google', url: 'https://google.com', tags: [] },
  ];

  test('highlights across all bookmarks', () => {
    const results = highlightBookmarks(bookmarks, 'git');
    expect(results[0].title).toContain(wrap('Git'));
    expect(results[1].title).toBe('Google');
  });

  test('accepts array of terms', () => {
    const results = highlightBookmarks(bookmarks, ['GitHub', 'Google']);
    expect(results[0].title).toContain(wrap('GitHub'));
    expect(results[1].title).toContain(wrap('Google'));
  });
});
