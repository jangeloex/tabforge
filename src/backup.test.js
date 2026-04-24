import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

vi.mock('./config.js', () => ({
  getConfigDir: () => tmpDir,
}));

vi.mock('./bookmarks.js', () => ({
  getBookmarksPath: () => path.join(tmpDir, 'bookmarks.json'),
  loadBookmarks: () => [{ id: '1', url: 'https://example.com', title: 'Example', tags: [] }],
}));

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabforge-backup-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('backup', async () => {
  const { getBackupDir, getBackupPath, listBackups, createBackup, restoreBackup, pruneBackups } =
    await import('./backup.js');

  it('getBackupDir returns path inside config dir', () => {
    expect(getBackupDir()).toBe(path.join(tmpDir, 'backups'));
  });

  it('listBackups returns empty array when dir missing', () => {
    expect(listBackups()).toEqual([]);
  });

  it('createBackup writes a json file and returns its path', () => {
    const dest = createBackup();
    expect(fs.existsSync(dest)).toBe(true);
    const data = JSON.parse(fs.readFileSync(dest, 'utf-8'));
    expect(data).toHaveLength(1);
    expect(data[0].url).toBe('https://example.com');
  });

  it('listBackups returns created backup', () => {
    createBackup();
    const list = listBackups();
    expect(list).toHaveLength(1);
    expect(list[0]).toMatch(/^bookmarks-.*\.json$/);
  });

  it('restoreBackup throws if file not found', () => {
    expect(() => restoreBackup('nonexistent.json')).toThrow('Backup not found');
  });

  it('restoreBackup writes bookmarks file', () => {
    const dest = createBackup();
    const filename = path.basename(dest);
    const restored = restoreBackup(filename);
    expect(restored).toHaveLength(1);
  });

  it('pruneBackups removes old backups beyond keep count', () => {
    for (let i = 0; i < 5; i++) {
      const ts = `2024-01-0${i + 1}T00-00-00-000Z`;
      const p = getBackupPath(ts);
      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, '[]');
    }
    const deleted = pruneBackups(3);
    expect(deleted).toHaveLength(2);
    expect(listBackups()).toHaveLength(3);
  });
});
