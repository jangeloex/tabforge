const {
  setPriority,
  clearPriority,
  getPriority,
  getPriorityLabel,
  sortByPriority,
  filterByMinPriority,
  DEFAULT_PRIORITY,
} = require('./priority');

function makeBookmark(url, priority) {
  const b = { url, title: url };
  if (priority !== undefined) b.priority = priority;
  return b;
}

describe('setPriority', () => {
  it('sets a valid priority on a bookmark', () => {
    const b = makeBookmark('https://example.com');
    setPriority(b, 4);
    expect(b.priority).toBe(4);
  });

  it('accepts string numbers', () => {
    const b = makeBookmark('https://example.com');
    setPriority(b, '2');
    expect(b.priority).toBe(2);
  });

  it('throws on invalid priority', () => {
    const b = makeBookmark('https://example.com');
    expect(() => setPriority(b, 6)).toThrow('Invalid priority');
    expect(() => setPriority(b, 0)).toThrow('Invalid priority');
  });
});

describe('clearPriority', () => {
  it('removes the priority field', () => {
    const b = makeBookmark('https://example.com', 5);
    clearPriority(b);
    expect(b.priority).toBeUndefined();
  });
});

describe('getPriority', () => {
  it('returns the bookmark priority if set', () => {
    const b = makeBookmark('https://example.com', 5);
    expect(getPriority(b)).toBe(5);
  });

  it('returns default priority when unset', () => {
    const b = makeBookmark('https://example.com');
    expect(getPriority(b)).toBe(DEFAULT_PRIORITY);
  });
});

describe('getPriorityLabel', () => {
  it('returns correct labels', () => {
    expect(getPriorityLabel(1)).toBe('low');
    expect(getPriorityLabel(5)).toBe('critical');
    expect(getPriorityLabel(3)).toBe('normal');
  });

  it('returns normal for unknown levels', () => {
    expect(getPriorityLabel(99)).toBe('normal');
  });
});

describe('sortByPriority', () => {
  it('sorts bookmarks highest priority first', () => {
    const bookmarks = [
      makeBookmark('a', 1),
      makeBookmark('b', 5),
      makeBookmark('c', 3),
    ];
    const sorted = sortByPriority(bookmarks);
    expect(sorted.map((b) => b.url)).toEqual(['b', 'c', 'a']);
  });

  it('does not mutate original array', () => {
    const bookmarks = [makeBookmark('a', 2), makeBookmark('b', 4)];
    sortByPriority(bookmarks);
    expect(bookmarks[0].url).toBe('a');
  });
});

describe('filterByMinPriority', () => {
  it('returns only bookmarks at or above min level', () => {
    const bookmarks = [
      makeBookmark('a', 1),
      makeBookmark('b', 3),
      makeBookmark('c', 5),
    ];
    const result = filterByMinPriority(bookmarks, 3);
    expect(result.map((b) => b.url)).toEqual(['b', 'c']);
  });

  it('includes bookmarks with default priority when applicable', () => {
    const bookmarks = [makeBookmark('a'), makeBookmark('b', 1)];
    const result = filterByMinPriority(bookmarks, 3);
    expect(result.map((b) => b.url)).toEqual(['a']);
  });
});
