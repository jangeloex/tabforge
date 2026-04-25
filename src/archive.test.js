import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { archiveBookmarks, restoreFromArchive, loadArchive } from './archive.js';
import { saveBookmarks } from './bookmarks.js';

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabforge-archive-'));
  saveBookmarks(tmpDir, [
    { id: '1', url: 'https://old.example.com', title: 'Old', tags: [], addedAt: '2022-01-01' },
    { id: '2', url: 'https://new.example.com', title: 'New', tags: [], addedAt: '2024-01-01' },
  ]);
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('archiveBookmarks', () => {
  it('moves matching bookmarks to archive', () => {
    const { archived, remaining } = archiveBookmarks(tmpDir, (b) => b.id === '1');
    expect(archived).toHaveLength(1);
    expect(archived[0].url).toBe('https://old.example.com');
    expect(archived[0].archivedAt).toBeDefined();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe('2');
  });

  it('persists archive to disk', () => {
    archiveBookmarks(tmpDir, (b) => b.id === '1');
    const onDisk = loadArchive(tmpDir);
    expect(onDisk).toHaveLength(1);
    expect(onDisk[0].id).toBe('1');
  });

  it('returns empty archived when nothing matches', () => {
    const { archived } = archiveBookmarks(tmpDir, () => false);
    expect(archived).toHaveLength(0);
  });

  it('accumulates across multiple calls', () => {
    archiveBookmarks(tmpDir, (b) => b.id === '1');
    archiveBookmarks(tmpDir, (b) => b.id === '2');
    const onDisk = loadArchive(tmpDir);
    expect(onDisk).toHaveLength(2);
  });
});

describe('restoreFromArchive', () => {
  it('moves archived bookmark back to active', () => {
    archiveBookmarks(tmpDir, (b) => b.id === '1');
    const { restored } = restoreFromArchive(tmpDir, (b) => b.id === '1');
    expect(restored).toHaveLength(1);
    expect(restored[0].archivedAt).toBeUndefined();
    const remaining = loadArchive(tmpDir);
    expect(remaining).toHaveLength(0);
  });

  it('returns empty when nothing matches', () => {
    archiveBookmarks(tmpDir, (b) => b.id === '1');
    const { restored } = restoreFromArchive(tmpDir, () => false);
    expect(restored).toHaveLength(0);
  });
});
