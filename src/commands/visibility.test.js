const { Command } = require('commander');
const { registerVisibilityCommand } = require('./visibility');

jest.mock('../config', () => ({ loadConfig: jest.fn().mockResolvedValue({}) }));
jest.mock('../bookmarks', () => ({
  loadBookmarks: jest.fn(),
  saveBookmarks: jest.fn().mockResolvedValue(),
}));

const { loadBookmarks, saveBookmarks } = require('../bookmarks');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerVisibilityCommand(program);
  return program;
}

function makeBookmarks() {
  return [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://secret.com', title: 'Secret', visibility: 'private' },
  ];
}

beforeEach(() => jest.clearAllMocks());

test('set public updates and saves', async () => {
  const bookmarks = makeBookmarks();
  loadBookmarks.mockResolvedValue(bookmarks);
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'visibility', 'set', 'https://example.com', 'public']);
  expect(saveBookmarks).toHaveBeenCalled();
  expect(bookmarks[0].visibility).toBe('public');
});

test('set private updates and saves', async () => {
  const bookmarks = makeBookmarks();
  loadBookmarks.mockResolvedValue(bookmarks);
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'visibility', 'set', 'https://example.com', 'private']);
  expect(saveBookmarks).toHaveBeenCalled();
  expect(bookmarks[0].visibility).toBe('private');
});

test('list all shows all bookmarks', async () => {
  loadBookmarks.mockResolvedValue(makeBookmarks());
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'visibility', 'list', 'all']);
  expect(spy).toHaveBeenCalledTimes(2);
  spy.mockRestore();
});

test('list private shows only private', async () => {
  loadBookmarks.mockResolvedValue(makeBookmarks());
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'visibility', 'list', 'private']);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy.mock.calls[0][0]).toContain('private');
  spy.mockRestore();
});

test('list with no results prints message', async () => {
  loadBookmarks.mockResolvedValue([]);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  const program = makeProgram();
  await program.parseAsync(['node', 'test', 'visibility', 'list', 'private']);
  expect(spy).toHaveBeenCalledWith('No bookmarks found.');
  spy.mockRestore();
});
