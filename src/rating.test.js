const { rateBookmark, unrateBookmark, getTopRated, averageRating } = require('./rating');

const BOOKMARKS = [
  { url: 'https://example.com', title: 'Example', rating: 5 },
  { url: 'https://foo.com', title: 'Foo', rating: 3 },
  { url: 'https://bar.com', title: 'Bar', rating: 1 },
  { url: 'https://unrated.com', title: 'Unrated' },
];

function makeConfig(bookmarks) {
  const store = [...bookmarks.map((b) => ({ ...b }))];
  return {
    configDir: '/fake',
    store,
    loadBookmarks: jest.fn(async () => store),
    saveBookmarks: jest.fn(async (_dir, updated) => store.splice(0, store.length, ...updated)),
  };
}

jest.mock('./bookmarks', () => ({
  loadBookmarks: jest.fn(),
  saveBookmarks: jest.fn(),
}));

const bookmarksModule = require('./bookmarks');

beforeEach(() => jest.clearAllMocks());

describe('rateBookmark', () => {
  it('sets a valid rating on an existing bookmark', async () => {
    const bms = [{ url: 'https://example.com', title: 'Example' }];
    bookmarksModule.loadBookmarks.mockResolvedValue(bms);
    bookmarksModule.saveBookmarks.mockResolvedValue();
    const result = await rateBookmark('/fake', 'https://example.com', 4);
    expect(result.rating).toBe(4);
    expect(result.ratedAt).toBeDefined();
    expect(bookmarksModule.saveBookmarks).toHaveBeenCalledOnce;
  });

  it('throws for out-of-range rating', async () => {
    bookmarksModule.loadBookmarks.mockResolvedValue([{ url: 'https://x.com' }]);
    await expect(rateBookmark('/fake', 'https://x.com', 6)).rejects.toThrow('Rating must be');
  });

  it('throws for non-integer rating', async () => {
    bookmarksModule.loadBookmarks.mockResolvedValue([{ url: 'https://x.com' }]);
    await expect(rateBookmark('/fake', 'https://x.com', 3.5)).rejects.toThrow('Rating must be');
  });

  it('throws when bookmark not found', async () => {
    bookmarksModule.loadBookmarks.mockResolvedValue([]);
    await expect(rateBookmark('/fake', 'https://missing.com', 3)).rejects.toThrow('Bookmark not found');
  });
});

describe('unrateBookmark', () => {
  it('removes rating and ratedAt fields', async () => {
    const bms = [{ url: 'https://example.com', title: 'Example', rating: 5, ratedAt: '2024-01-01' }];
    bookmarksModule.loadBookmarks.mockResolvedValue(bms);
    bookmarksModule.saveBookmarks.mockResolvedValue();
    const result = await unrateBookmark('/fake', 'https://example.com');
    expect(result.rating).toBeUndefined();
    expect(result.ratedAt).toBeUndefined();
  });

  it('throws when bookmark not found', async () => {
    bookmarksModule.loadBookmarks.mockResolvedValue([]);
    await expect(unrateBookmark('/fake', 'https://nope.com')).rejects.toThrow('Bookmark not found');
  });
});

describe('getTopRated', () => {
  it('returns bookmarks sorted by rating desc', () => {
    const top = getTopRated(BOOKMARKS);
    expect(top[0].url).toBe('https://example.com');
    expect(top[1].url).toBe('https://foo.com');
    expect(top[2].url).toBe('https://bar.com');
  });

  it('excludes unrated bookmarks', () => {
    const top = getTopRated(BOOKMARKS);
    expect(top.find((b) => b.url === 'https://unrated.com')).toBeUndefined();
  });

  it('respects limit', () => {
    const top = getTopRated(BOOKMARKS, 2);
    expect(top).toHaveLength(2);
  });
});

describe('averageRating', () => {
  it('computes average of rated bookmarks', () => {
    expect(averageRating(BOOKMARKS)).toBe((5 + 3 + 1) / 3);
  });

  it('returns null when no rated bookmarks', () => {
    expect(averageRating([{ url: 'https://x.com' }])).toBeNull();
  });
});
