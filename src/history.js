import fs from 'fs';
import path from 'path';
import { getConfigDir } from './config.js';

export function getHistoryPath() {
  return path.join(getConfigDir(), 'history.json');
}

export function loadHistory() {
  const p = getHistoryPath();
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return [];
  }
}

export function saveHistory(history) {
  fs.writeFileSync(getHistoryPath(), JSON.stringify(history, null, 2));
}

export function recordVisit(url, title = '') {
  const history = loadHistory();
  const entry = {
    url,
    title,
    visitedAt: new Date().toISOString(),
  };
  history.unshift(entry);
  // keep last 500 entries
  saveHistory(history.slice(0, 500));
  return entry;
}

export function getRecentHistory(limit = 20) {
  return loadHistory().slice(0, limit);
}

export function clearHistory() {
  saveHistory([]);
}

export function searchHistory(query) {
  const q = query.toLowerCase();
  return loadHistory().filter(
    (e) => e.url.toLowerCase().includes(q) || e.title.toLowerCase().includes(q)
  );
}
