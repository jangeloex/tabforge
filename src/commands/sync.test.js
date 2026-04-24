import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleSync } from './sync.js';
import * as config from '../config.js';
import * as sync from '../sync.js';

vi.mock('../config.js');
vi.mock('../sync.js');

const mockConfig = { repoPath: '/tmp/test-repo' };

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(config, 'loadConfig').mockResolvedValue(mockConfig);
  vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('process.exit'); });
});

describe('handleSync', () => {
  it('exits if no repoPath configured', async () => {
    vi.spyOn(config, 'loadConfig').mockResolvedValue({});
    await expect(handleSync()).rejects.toThrow('process.exit');
  });

  it('runs full sync by default', async () => {
    vi.spyOn(sync, 'syncBookmarks').mockResolvedValue({ pulled: true, pushed: false });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handleSync();

    expect(sync.syncBookmarks).toHaveBeenCalledWith(mockConfig.repoPath);
    expect(consoleSpy).toHaveBeenCalledWith('Pulled latest changes from remote.');
  });

  it('only pulls when --pull flag is set', async () => {
    vi.spyOn(sync, 'gitPull').mockResolvedValue();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handleSync({ pull: true });

    expect(sync.gitPull).toHaveBeenCalledWith(mockConfig.repoPath);
    expect(sync.gitPush).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Pull complete.');
  });

  it('only pushes when --push flag is set', async () => {
    vi.spyOn(sync, 'gitPush').mockResolvedValue();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handleSync({ push: true });

    expect(sync.gitPush).toHaveBeenCalledWith(mockConfig.repoPath);
    expect(sync.gitPull).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Push complete.');
  });

  it('logs up to date when nothing changed', async () => {
    vi.spyOn(sync, 'syncBookmarks').mockResolvedValue({ pulled: false, pushed: false });
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await handleSync();

    expect(consoleSpy).toHaveBeenCalledWith('Everything up to date.');
  });

  it('exits on sync error', async () => {
    vi.spyOn(sync, 'syncBookmarks').mockRejectedValue(new Error('git error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(handleSync()).rejects.toThrow('process.exit');
  });
});
