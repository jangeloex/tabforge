const {
  getVisibility,
  setVisibility,
  makePublic,
  makePrivate,
  getPublicBookmarks,
  getPrivateBookmarks,
} = require('./visibility');

function makeBookmarks() {
  return [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://private.com', title: 'Private Site', visibility: 'private' },
    { url: 'https://public.com', title: 'Public Site', visibility: 'public' },
  ];
}

test('getVisibility defaults to public', () => {
  const b = { url: 'https://example.com', title: 'Example' };
  expect(getVisibility(b)).toBe('public');
});

test('getVisibility returns stored value', () => {
  const b = { url: 'https://example.com', visibility: 'private' };
  expect(getVisibility(b)).toBe('private');
});

test('setVisibility updates bookmark', () => {
  const bookmarks = makeBookmarks();
  setVisibility(bookmarks, 'https://example.com', 'private');
  expect(bookmarks[0].visibility).toBe('private');
});

test('setVisibility throws on invalid value', () => {
  const bookmarks = makeBookmarks();
  expect(() => setVisibility(bookmarks, 'https://example.com', 'hidden')).toThrow('Invalid visibility');
});

test('setVisibility throws if bookmark not found', () => {
  const bookmarks = makeBookmarks();
  expect(() => setVisibility(bookmarks, 'https://missing.com', 'private')).toThrow('Bookmark not found');
});

test('makePrivate marks bookmark private', () => {
  const bookmarks = makeBookmarks();
  makePrivate(bookmarks, 'https://example.com');
  expect(bookmarks[0].visibility).toBe('private');
});

test('makePublic marks bookmark public', () => {
  const bookmarks = makeBookmarks();
  makePublic(bookmarks, 'https://private.com');
  expect(bookmarks[1].visibility).toBe('public');
});

test('getPublicBookmarks returns only public', () => {
  const bookmarks = makeBookmarks();
  const result = getPublicBookmarks(bookmarks);
  expect(result.every(b => b.visibility !== 'private')).toBe(true);
  expect(result.length).toBe(2);
});

test('getPrivateBookmarks returns only private', () => {
  const bookmarks = makeBookmarks();
  const result = getPrivateBookmarks(bookmarks);
  expect(result.length).toBe(1);
  expect(result[0].url).toBe('https://private.com');
});
