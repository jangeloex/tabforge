const { Command } = require('commander');
const { registerRatingCommand } = require('./rating');
const rating = require('../rating');
const bookmarks = require('../bookmarks');
const config = require('../config');

jest.mock('../rating');
jest.mock('../bookmarks');
jest.mock('../config');

const BOOKMARKS = [
  { url: 'https://example.com', title: 'Example', tags: [], rating: 4 },
  { url: 'https://other.com', title: 'Other', tags: [], rating: 2 },
];

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerRatingCommand(program);
  return program;
}

beforeEach(() => {
  config.loadConfig.mockReturnValue({});
  bookmarks.loadBookmarks.mockReturnValue([...BOOKMARKS]);
  bookmarks.saveBookmarks.mockImplementation(() => {});
});

afterEach(() => jest.clearAllMocks());

test('set rating calls setRating and saves', async () => {
  rating.setRating.mockReturnValue(BOOKMARKS);
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'rating', 'set', 'https://example.com', '5']);
  expect(rating.setRating).toHaveBeenCalledWith(BOOKMARKS, 'https://example.com', 5);
  expect(bookmarks.saveBookmarks).toHaveBeenCalled();
});

test('set rating rejects invalid score', async () => {
  const program = makeProgram();
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(program.parseAsync(['node', 'test', 'rating', 'set', 'https://example.com', '9']))
    .rejects.toThrow();
  mockExit.mockRestore();
});

test('get rating prints value', async () => {
  rating.getRating.mockReturnValue(4);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'rating', 'get', 'https://example.com']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('4/5'));
  spy.mockRestore();
});

test('get rating prints no rating message when null', async () => {
  rating.getRating.mockReturnValue(null);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'rating', 'get', 'https://example.com']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('No rating'));
  spy.mockRestore();
});

test('clear rating calls clearRating and saves', async () => {
  rating.clearRating.mockReturnValue(BOOKMARKS);
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'rating', 'clear', 'https://example.com']);
  expect(rating.clearRating).toHaveBeenCalledWith(BOOKMARKS, 'https://example.com');
  expect(bookmarks.saveBookmarks).toHaveBeenCalled();
});

test('top lists top rated bookmarks', async () => {
  rating.getTopRated.mockReturnValue([BOOKMARKS[0]]);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'rating', 'top']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('4/5'));
  spy.mockRestore();
});

test('avg prints average', async () => {
  rating.averageRating.mockReturnValue(3.5);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'rating', 'avg']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('3.50'));
  spy.mockRestore();
});
