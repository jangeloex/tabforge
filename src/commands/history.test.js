import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerHistoryCommand } from './history.js';
import * as historyModule from '../history.js';

vi.mock('../history.js');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerHistoryCommand(program);
  return program;
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('history list', () => {
  it('prints entries', () => {
    historyModule.getRecentHistory.mockReturnValue([
      { url: 'https://a.com', title: 'A', visitedAt: '2024-06-01T00:00:00Z' },
    ]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['history', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('https://a.com'));
  });

  it('prints message when empty', () => {
    historyModule.getRecentHistory.mockReturnValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['history', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No history yet.');
  });
});

describe('history search', () => {
  it('prints matches', () => {
    historyModule.searchHistory.mockReturnValue([
      { url: 'https://github.com', title: 'GitHub', visitedAt: '2024-06-01T00:00:00Z' },
    ]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['history', 'search', 'github'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('github.com'));
  });

  it('prints no matches message', () => {
    historyModule.searchHistory.mockReturnValue([]);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['history', 'search', 'xyz'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No matches found.');
  });
});

describe('history record', () => {
  it('records a visit and prints confirmation', () => {
    historyModule.recordVisit.mockReturnValue({ url: 'https://example.com', visitedAt: '2024-06-01T00:00:00Z' });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['history', 'record', 'https://example.com'], { from: 'user' });
    expect(historyModule.recordVisit).toHaveBeenCalledWith('https://example.com', '');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Recorded visit'));
  });
});

describe('history clear', () => {
  it('clears history', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    makeProgram().parse(['history', 'clear'], { from: 'user' });
    expect(historyModule.clearHistory).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('History cleared.');
  });
});
