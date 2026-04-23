const { handleAdd, handleRemove, handleList } = require('./bookmark');
const bookmarks = require('../bookmarks');

jest.mock('../bookmarks');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.log.mockRestore();
  console.error.mockRestore();
});

describe('handleAdd', () => {
  test('logs success on valid bookmark', () => {
    bookmarks.addBookmark.mockReturnValue({ id: '1', title: 'Test', url: 'https://test.com' });
    handleAdd({ url: 'https://test.com', title: 'Test', tags: 'dev,tools' });
    expect(bookmarks.addBookmark).toHaveBeenCalledWith({
      url: 'https://test.com',
      title: 'Test',
      tags: ['dev', 'tools'],
    });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Bookmark added'));
  });

  test('logs error and exits on failure', () => {
    bookmarks.addBookmark.mockImplementation(() => { throw new Error('Already exists'); });
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    handleAdd({ url: 'https://dupe.com' });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Already exists'));
    mockExit.mockRestore();
  });
});

describe('handleRemove', () => {
  test('logs removed bookmark', () => {
    bookmarks.removeBookmark.mockReturnValue({ title: 'Gone', url: 'https://gone.com' });
    handleRemove({ id: '42' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Removed'));
  });

  test('exits if no id provided', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});
    handleRemove({});
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('--id is required'));
    mockExit.mockRestore();
  });
});

describe('handleList', () => {
  test('prints bookmarks', () => {
    bookmarks.listBookmarks.mockReturnValue([
      { id: '1', title: 'A', url: 'https://a.com', tags: ['work'] },
    ]);
    handleList({});
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('https://a.com'));
  });

  test('prints empty message when no bookmarks', () => {
    bookmarks.listBookmarks.mockReturnValue([]);
    handleList({});
    expect(console.log).toHaveBeenCalledWith('No bookmarks found.');
  });
});
