const { setColor, clearColor, getColor, getBookmarksByColor, isValidColor, listColors } = require('./color');

function makeBookmarks() {
  return [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://github.com', title: 'GitHub', color: 'blue' },
    { url: 'https://news.ycombinator.com', title: 'HN', color: 'orange' },
  ];
}

test('isValidColor returns true for known colors', () => {
  expect(isValidColor('red')).toBe(true);
  expect(isValidColor('blue')).toBe(true);
});

test('isValidColor returns false for unknown colors', () => {
  expect(isValidColor('magenta')).toBe(false);
  expect(isValidColor('')).toBe(false);
});

test('listColors returns all valid colors', () => {
  const colors = listColors();
  expect(colors).toContain('red');
  expect(colors).toContain('green');
  expect(colors.length).toBeGreaterThan(0);
});

test('setColor assigns a color to a bookmark', () => {
  const bms = makeBookmarks();
  setColor(bms, 'https://example.com', 'red');
  expect(bms[0].color).toBe('red');
});

test('setColor throws for invalid color', () => {
  const bms = makeBookmarks();
  expect(() => setColor(bms, 'https://example.com', 'neon')).toThrow('Invalid color');
});

test('setColor throws for unknown url', () => {
  const bms = makeBookmarks();
  expect(() => setColor(bms, 'https://notfound.com', 'red')).toThrow('Bookmark not found');
});

test('clearColor removes color from bookmark', () => {
  const bms = makeBookmarks();
  clearColor(bms, 'https://github.com');
  expect(bms[1].color).toBeUndefined();
});

test('clearColor throws for unknown url', () => {
  const bms = makeBookmarks();
  expect(() => clearColor(bms, 'https://notfound.com')).toThrow('Bookmark not found');
});

test('getColor returns the color of a bookmark', () => {
  const bm = { url: 'https://github.com', color: 'blue' };
  expect(getColor(bm)).toBe('blue');
});

test('getColor returns null when no color set', () => {
  const bm = { url: 'https://example.com' };
  expect(getColor(bm)).toBeNull();
});

test('getBookmarksByColor filters correctly', () => {
  const bms = makeBookmarks();
  const result = getBookmarksByColor(bms, 'blue');
  expect(result).toHaveLength(1);
  expect(result[0].url).toBe('https://github.com');
});

test('getBookmarksByColor throws for invalid color', () => {
  const bms = makeBookmarks();
  expect(() => getBookmarksByColor(bms, 'neon')).toThrow('Invalid color');
});
