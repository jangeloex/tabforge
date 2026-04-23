import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';

// We'll mock the home directory to isolate tests
const TEST_HOME = path.join(os.tmpdir(), 'tabforge-test-' + Date.now());

beforeEach(() => {
  process.env.HOME = TEST_HOME;
  if (fs.existsSync(TEST_HOME)) {
    fs.rmSync(TEST_HOME, { recursive: true });
  }
});

afterEach(() => {
  if (fs.existsSync(TEST_HOME)) {
    fs.rmSync(TEST_HOME, { recursive: true });
  }
});

describe('config', () => {
  it('returns defaults when no config file exists', async () => {
    const { loadConfig } = await import('./config.js');
    const config = loadConfig();
    expect(config.browser).toBe('auto');
    expect(config.syncOnStart).toBe(false);
    expect(config.gitRemote).toBeNull();
  });

  it('saves and reloads config correctly', async () => {
    const { saveConfig, loadConfig } = await import('./config.js');
    saveConfig({ gitRemote: 'git@github.com:user/bookmarks.git', browser: 'chrome' });
    const loaded = loadConfig();
    expect(loaded.gitRemote).toBe('git@github.com:user/bookmarks.git');
    expect(loaded.browser).toBe('chrome');
  });

  it('merges new values with existing config on save', async () => {
    const { saveConfig, loadConfig } = await import('./config.js');
    saveConfig({ browser: 'firefox' });
    saveConfig({ syncOnStart: true });
    const loaded = loadConfig();
    expect(loaded.browser).toBe('firefox');
    expect(loaded.syncOnStart).toBe(true);
  });

  it('throws on malformed config file', async () => {
    const { getConfigPath, loadConfig } = await import('./config.js');
    const configPath = getConfigPath();
    fs.mkdirSync(path.dirname(configPath), { recursive: true });
    fs.writeFileSync(configPath, '{ invalid json }', 'utf-8');
    expect(() => loadConfig()).toThrow('Failed to parse config file');
  });
});
