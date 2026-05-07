const { Command } = require('commander');
const { registerScoreCommand } = require('./score');
const bookmarks = require('../bookmarks');
const config = require('../config');
const score = require('../score');

jest.mock('../bookmarks');
jest.mock('../config');
jest.mock('../score');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerScoreCommand(program);
  return program;
}

const sampleBookmarks = [
  { id: '1', url: 'https://a.com', title: 'A', rating: 5, favorite: true, priority: 'high', _score: 0.95 },
  { id: '2', url: 'https://b.com', title: 'B', rating: 2, favorite: false, priority: null, _score: 0.3 },
];

beforeEach(() => {
  config.loadConfig.mockReturnValue({});
  bookmarks.loadBookmarks.mockReturnValue(sampleBookmarks);
  score.rankBookmarks.mockReturnValue(sampleBookmarks);
});

afterEach(() => jest.clearAllMocks());

describe('score command', () => {
  test('prints ranked bookmarks', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['node', 'tabforge', 'score']);
    expect(spy).toHaveBeenCalled();
    expect(score.rankBookmarks).toHaveBeenCalledWith(sampleBookmarks);
    spy.mockRestore();
  });

  test('--json outputs JSON', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['node', 'tabforge', 'score', '--json']);
    const output = spy.mock.calls[0][0];
    expect(() => JSON.parse(output)).not.toThrow();
    spy.mockRestore();
  });

  test('shows message when no bookmarks', async () => {
    bookmarks.loadBookmarks.mockReturnValue([]);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['node', 'tabforge', 'score']);
    expect(spy).toHaveBeenCalledWith('No bookmarks found.');
    spy.mockRestore();
  });

  test('--top limits results', async () => {
    score.rankBookmarks.mockReturnValue(sampleBookmarks);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['node', 'tabforge', 'score', '--top', '1']);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
