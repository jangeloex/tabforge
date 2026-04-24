import fs from 'fs';
import path from 'path';
import { getBookmarksPath, loadBookmarks } from './bookmarks.js';
import { getConfigDir } from './config.js';

export function getBackupDir() {
  return path.join(getConfigDir(), 'backups');
}

export function getBackupPath(timestamp) {
  const ts = timestamp || new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(getBackupDir(), `bookmarks-${ts}.json`);
}

export function listBackups() {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.startsWith('bookmarks-') && f.endsWith('.json'))
    .sort()
    .reverse();
}

export function createBackup() {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const bookmarks = loadBookmarks();
  const dest = getBackupPath();
  fs.writeFileSync(dest, JSON.stringify(bookmarks, null, 2), 'utf-8');
  return dest;
}

export function restoreBackup(filename) {
  const dir = getBackupDir();
  const src = path.join(dir, filename);
  if (!fs.existsSync(src)) {
    throw new Error(`Backup not found: ${filename}`);
  }
  const data = JSON.parse(fs.readFileSync(src, 'utf-8'));
  const dest = getBookmarksPath();
  fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf-8');
  return data;
}

export function pruneBackups(keep = 10) {
  const all = listBackups();
  const toDelete = all.slice(keep);
  const dir = getBackupDir();
  toDelete.forEach((f) => fs.unlinkSync(path.join(dir, f)));
  return toDelete;
}
