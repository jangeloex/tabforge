import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerBatchCommand } from './batch.js';
import * as batchModule from '../batch.js';
import * as configModule from '../config.js';

const makeProgram = () => {
  const program = new Command();
  program.exitOverride();
  registerBatchCommand(program);
  return program;
};

beforeEach(() => {
  vi.spyOn(configModule, 'loadConfig').mockResolvedValue({ store: '/tmp' });
});

describe('batch remove', () => {
  it('calls batchRemove and logs result', async () => {
    vi.spyOn(batchModule, 'batchRemove').mockResolvedValue({ removed: 2, notFound: [] });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'cli', 'batch', 'remove', 'https://a.com', 'https://b.com']);
    expect(batchModule.batchRemove).toHaveBeenCalledWith(
      { store: '/tmp' },
      ['https://a.com', 'https://b.com']
    );
    expect(spy).toHaveBeenCalledWith('Removed 2 bookmark(s).');
    spy.mockRestore();
  });

  it('warns about not found urls', async () => {
    vi.spyOn(batchModule, 'batchRemove').mockResolvedValue({
      removed: 0,
      notFound: ['https://missing.com'],
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'cli', 'batch', 'remove', 'https://missing.com']);
    expect(warn).toHaveBeenCalledWith('Not found: https://missing.com');
    warn.mockRestore();
  });
});

describe('batch tag', () => {
  it('splits tags and calls batchTag', async () => {
    vi.spyOn(batchModule, 'batchTag').mockResolvedValue({ updated: 1, notFound: [] });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync([
      'node', 'cli', 'batch', 'tag', 'https://a.com', '--tags', 'dev,js',
    ]);
    expect(batchModule.batchTag).toHaveBeenCalledWith(
      { store: '/tmp' },
      ['https://a.com'],
      ['dev', 'js']
    );
    spy.mockRestore();
  });
});
