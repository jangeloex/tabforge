import fs from 'fs';
import path from 'path';
import { loadBookmarks, saveBookmarks } from './bookmarks.js';

export function getArchivePath(configDir) {
  return path.join(configDir, 'archive.json');
}

export function loadArchive(configDir) {
  const archivePath = getArchivePath(configDir);
  if (!fs.existsSync(archivePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(archivePath, 'utf8'));
  } catch {
    return [];
  }
}

export function saveArchive(configDir, archived) {
  const archivePath = getArchivePath(configDir);
  fs.writeFileSync(archivePath, JSON.stringify(archived, null, 2));
}

export function archiveBookmarks(configDir, predicate) {
  const bookmarks = loadBookmarks(configDir);
  const toArchive = bookmarks.filter(predicate);
  const remaining = bookmarks.filter((b) => !predicate(b));

  if (toArchive.length === 0) return { archived: [], remaining };

  const existing = loadArchive(configDir);
  const now = new Date().toISOString();
  const withTimestamp = toArchive.map((b) => ({ ...b, archivedAt: now }));

  saveArchive(configDir, [...existing, ...withTimestamp]);
  saveBookmarks(configDir, remaining);

  return { archived: withTimestamp, remaining };
}

export function restoreFromArchive(configDir, predicate) {
  const archived = loadArchive(configDir);
  const toRestore = archived.filter(predicate);
  const stillArchived = archived.filter((b) => !predicate(b));

  if (toRestore.length === 0) return { restored: [], stillArchived };

  const bookmarks = loadBookmarks(configDir);
  const cleaned = toRestore.map(({ archivedAt, ...b }) => b);

  saveBookmarks(configDir, [...bookmarks, ...cleaned]);
  saveArchive(configDir, stillArchived);

  return { restored: cleaned, stillArchived };
}
