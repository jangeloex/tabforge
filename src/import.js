const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

/**
 * Parse a Netscape HTML bookmarks file and return an array of bookmark objects.
 * @param {string} filePath
 * @returns {Array<{title: string, url: string, tags: string[], addedAt: string}>}
 */
function fromNetscapeHTML(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const root = parse(html);
  const anchors = root.querySelectorAll('a');

  return anchors.map((a) => {
    const tagsAttr = a.getAttribute('tags') || a.getAttribute('TAGS') || '';
    const tags = tagsAttr ? tagsAttr.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const addDate = a.getAttribute('add_date') || a.getAttribute('ADD_DATE');
    const addedAt = addDate
      ? new Date(parseInt(addDate, 10) * 1000).toISOString()
      : new Date().toISOString();

    return {
      title: a.text.trim(),
      url: a.getAttribute('href') || a.getAttribute('HREF') || '',
      tags,
      addedAt,
    };
  }).filter((b) => b.url);
}

/**
 * Parse a JSON bookmarks file and return an array of bookmark objects.
 * @param {string} filePath
 * @returns {Array<{title: string, url: string, tags: string[], addedAt: string}>}
 */
function fromJSON(filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  const bookmarks = Array.isArray(data) ? data : data.bookmarks;

  if (!Array.isArray(bookmarks)) {
    throw new Error('Invalid JSON format: expected an array or { bookmarks: [] }');
  }

  return bookmarks.map((b) => ({
    title: b.title || '',
    url: b.url || '',
    tags: Array.isArray(b.tags) ? b.tags : [],
    addedAt: b.addedAt || new Date().toISOString(),
  })).filter((b) => b.url);
}

module.exports = { fromNetscapeHTML, fromJSON };
