import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

vi.mock('./config.js', () => ({
  loadConfig: () => ({ storePath: fs.mkdtempSync(path.join(os.tmpdir(), 'tabforge-')) }),
}));

let storePath;

beforeEach(() => {
  storePath = fs.mkdtempSync(path.join(os.tmpdir(), 'tabforge-snap-'));
  vi.resetModules();
  vi.doMock('./config.js', () => ({ loadConfig: () => ({ storePath }) }));
});

const sampleBookmarks = [
  { url: 'https://example.com', title: 'Example', tags: [] },
  { url: 'https://foo.dev', title: 'Foo', tags: ['dev'] },
];

async function getModule() {
  vi.doMock('./bookmarks.js', () => ({ loadBookmarks: () => sampleBookmarks }));
  return await import('./snapshot.js');
}

describe('createSnapshot', () => {
  it('creates a snapshot file with bookmarks', async () => {
    const { createSnapshot, getSnapshotPath } = await getModule();
    const snap = createSnapshot('test-snap');
    expect(snap.name).toBe('test-snap');
    expect(snap.count).toBe(2);
    expect(snap.bookmarks).toHaveLength(2);
    expect(fs.existsSync(getSnapshotPath('test-snap'))).toBe(true);
  });
});

describe('listSnapshots', () => {
  it('returns empty array when no snapshots exist', async () => {
    const { listSnapshots } = await getModule();
    expect(listSnapshots()).toEqual([]);
  });

  it('lists created snapshots', async () => {
    const { createSnapshot, listSnapshots } = await getModule();
    createSnapshot('alpha');
    createSnapshot('beta');
    const list = listSnapshots();
    expect(list).toContain('alpha');
    expect(list).toContain('beta');
  });
});

describe('deleteSnapshot', () => {
  it('removes the snapshot file', async () => {
    const { createSnapshot, deleteSnapshot, getSnapshotPath } = await getModule();
    createSnapshot('to-delete');
    deleteSnapshot('to-delete');
    expect(fs.existsSync(getSnapshotPath('to-delete'))).toBe(false);
  });

  it('throws if snapshot does not exist', async () => {
    const { deleteSnapshot } = await getModule();
    expect(() => deleteSnapshot('ghost')).toThrow('not found');
  });
});

describe('diffSnapshot', () => {
  it('detects added and removed bookmarks', async () => {
    const { createSnapshot } = await getModule();
    createSnapshot('base');

    const newBookmarks = [
      { url: 'https://example.com', title: 'Example', tags: [] },
      { url: 'https://new.io', title: 'New', tags: [] },
    ];
    vi.doMock('./bookmarks.js', () => ({ loadBookmarks: () => newBookmarks }));
    const { diffSnapshot } = await import('./snapshot.js');

    const diff = diffSnapshot('base');
    expect(diff.added.map(b => b.url)).toContain('https://new.io');
    expect(diff.removed.map(b => b.url)).toContain('https://foo.dev');
  });
});
