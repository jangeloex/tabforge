const { getRating, setRating, clearRating, getTopRated, averageRating } = require('./rating');

const BASE = [
  { url: 'https://a.com', title: 'A', tags: [] },
  { url: 'https://b.com', title: 'B', tags: [], rating: 3 },
  { url: 'https://c.com', title: 'C', tags: [], rating: 5 },
  { url: 'https://d.com', title: 'D', tags: [], rating: 1 },
];

test('getRating returns null when no rating', () => {
  expect(getRating(BASE, 'https://a.com')).toBeNull();
});

test('getRating returns rating when set', () => {
  expect(getRating(BASE, 'https://b.com')).toBe(3);
});

test('getRating returns null for unknown url', () => {
  expect(getRating(BASE, 'https://unknown.com')).toBeNull();
});

test('setRating adds rating to bookmark', () => {
  const result = setRating(BASE, 'https://a.com', 4);
  expect(result.find(b => b.url === 'https://a.com').rating).toBe(4);
});

test('setRating updates existing rating', () => {
  const result = setRating(BASE, 'https://b.com', 5);
  expect(result.find(b => b.url === 'https://b.com').rating).toBe(5);
});

test('setRating does not mutate original', () => {
  setRating(BASE, 'https://a.com', 2);
  expect(BASE[0].rating).toBeUndefined();
});

test('clearRating removes rating', () => {
  const result = clearRating(BASE, 'https://b.com');
  expect(result.find(b => b.url === 'https://b.com').rating).toBeUndefined();
});

test('clearRating is no-op for unrated bookmark', () => {
  const result = clearRating(BASE, 'https://a.com');
  expect(result.find(b => b.url === 'https://a.com').rating).toBeUndefined();
});

test('getTopRated returns sorted by rating desc', () => {
  const top = getTopRated(BASE, 3);
  expect(top[0].rating).toBe(5);
  expect(top[1].rating).toBe(3);
  expect(top[2].rating).toBe(1);
});

test('getTopRated respects count limit', () => {
  const top = getTopRated(BASE, 1);
  expect(top).toHaveLength(1);
  expect(top[0].url).toBe('https://c.com');
});

test('getTopRated excludes unrated bookmarks', () => {
  const top = getTopRated(BASE, 10);
  expect(top.every(b => b.rating !== undefined)).toBe(true);
});

test('averageRating computes correct average', () => {
  const avg = averageRating(BASE);
  expect(avg).toBeCloseTo((3 + 5 + 1) / 3);
});

test('averageRating returns null when no rated bookmarks', () => {
  const unrated = [{ url: 'https://x.com', title: 'X', tags: [] }];
  expect(averageRating(unrated)).toBeNull();
});
