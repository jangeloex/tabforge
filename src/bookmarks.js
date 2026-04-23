const fs = require('fs');
const path = require('path');
const { loadConfig } = require('./config');

const BOOKMARKS_FILE = 'bookmarks.json';

function getBookmarksPath() {
  const config = loadConfig();
  if (!config || !config.storePath) {
    throw new Error('Store not initialized. Run `tabforge init` first.');
  }
  return path.join(config.storePath, BOOKMARKS_FILE);
}

function loadBookmarks() {
  const bookmarksPath = getBookmarksPath();
  if (!fs.existsSync(bookmarksPath)) {
    return [];
  }
  const raw = fs.readFileSync(bookmarksPath, 'utf-8');
  return JSON.parse(raw);
}

function saveBookmarks(bookmarks) {
  const bookmarksPath = getBookmarksPath();
  fs.writeFileSync(bookmarksPath, JSON.stringify(bookmarks, null, 2), 'utf-8');
}

function addBookmark({ url, title, tags = [] }) {
  if (!url) throw new Error('URL is required');
  const bookmarks = loadBookmarks();
  const existing = bookmarks.find(b => b.url === url);
  if (existing) {
    throw new Error(`Bookmark already exists: ${url}`);
  }
  const bookmark = {
    id: Date.now().toString(),
    url,
    title: title || url,
    tags,
    createdAt: new Date().toISOString(),
  };
  bookmarks.push(bookmark);
  saveBookmarks(bookmarks);
  return bookmark;
}

function removeBookmark(id) {
  const bookmarks = loadBookmarks();
  const index = bookmarks.findIndex(b => b.id === id);
  if (index === -1) {
    throw new Error(`Bookmark not found: ${id}`);
  }
  const [removed] = bookmarks.splice(index, 1);
  saveBookmarks(bookmarks);
  return removed;
}

function listBookmarks({ tag } = {}) {
  const bookmarks = loadBookmarks();
  if (tag) {
    return bookmarks.filter(b => b.tags.includes(tag));
  }
  return bookmarks;
}

module.exports = { addBookmark, removeBookmark, listBookmarks, loadBookmarks, saveBookmarks, getBookmarksPath };
