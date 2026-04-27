import fs from 'fs';
import path from 'path';
import { loadBookmarks } from './bookmarks.js';
import { loadConfig } from './config.js';

export function getSnapshotDir() {
  const config = loadConfig();
  return path.join(config.storePath, 'snapshots');
}

export function getSnapshotPath(name) {
  return path.join(getSnapshotDir(), `${name}.json`);
}

export function listSnapshots() {
  const dir = getSnapshotDir();
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''))
    .sort();
}

export function createSnapshot(name) {
  const dir = getSnapshotDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const bookmarks = loadBookmarks();
  const snapshot = {
    name,
    createdAt: new Date().toISOString(),
    count: bookmarks.length,
    bookmarks,
  };

  const snapshotPath = getSnapshotPath(name);
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2));
  return snapshot;
}

export function loadSnapshot(name) {
  const snapshotPath = getSnapshotPath(name);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" not found.`);
  }
  return JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
}

export function deleteSnapshot(name) {
  const snapshotPath = getSnapshotPath(name);
  if (!fs.existsSync(snapshotPath)) {
    throw new Error(`Snapshot "${name}" not found.`);
  }
  fs.unlinkSync(snapshotPath);
}

export function diffSnapshot(name) {
  const snapshot = loadSnapshot(name);
  const current = loadBookmarks();

  const snapshotUrls = new Set(snapshot.bookmarks.map(b => b.url));
  const currentUrls = new Set(current.map(b => b.url));

  const added = current.filter(b => !snapshotUrls.has(b.url));
  const removed = snapshot.bookmarks.filter(b => !currentUrls.has(b.url));

  return { added, removed, snapshotName: name, snapshotDate: snapshot.createdAt };
}
