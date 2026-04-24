import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isGitRepo, gitPull, gitPush, syncBookmarks, getRepoPath } from './sync.js';

vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('./config.js', () => ({
  loadConfig: vi.fn(),
}));

import { execSync } from 'child_process';
import { loadConfig } from './config.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getRepoPath', () => {
  it('returns repoPath from config', () => {
    loadConfig.mockReturnValue({ repoPath: '/tmp/repo' });
    expect(getRepoPath()).toBe('/tmp/repo');
  });

  it('throws if repoPath is not set', () => {
    loadConfig.mockReturnValue({});
    expect(() => getRepoPath()).toThrow('No repo path configured');
  });
});

describe('isGitRepo', () => {
  it('returns true when directory is a git repo', () => {
    execSync.mockReturnValue('');
    expect(isGitRepo('/tmp/repo')).toBe(true);
  });

  it('returns false when execSync throws', () => {
    execSync.mockImplementation(() => { throw new Error('not a repo'); });
    expect(isGitRepo('/tmp/not-a-repo')).toBe(false);
  });
});

describe('gitPull', () => {
  it('returns success with output on pull', () => {
    execSync.mockReturnValue('Already up to date.');
    const result = gitPull('/tmp/repo');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Already up to date.');
  });

  it('returns failure on error', () => {
    execSync.mockImplementation(() => { throw new Error('network error'); });
    const result = gitPull('/tmp/repo');
    expect(result.success).toBe(false);
    expect(result.error).toMatch('network error');
  });
});

describe('gitPush', () => {
  it('returns nothing to commit when status is clean', () => {
    execSync.mockReturnValueOnce('').mockReturnValueOnce('');
    const result = gitPush('/tmp/repo');
    expect(result.success).toBe(true);
    expect(result.output).toBe('Nothing to commit.');
  });

  it('returns failure on push error', () => {
    execSync.mockImplementationOnce(() => {}).mockImplementation(() => { throw new Error('push rejected'); });
    const result = gitPush('/tmp/repo');
    expect(result.success).toBe(false);
  });
});
