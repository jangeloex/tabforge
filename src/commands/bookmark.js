const { addBookmark, removeBookmark, listBookmarks } = require('../bookmarks');

function handleAdd(args) {
  const { url, title, tags } = args;
  try {
    const bm = addBookmark({
      url,
      title,
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
    });
    console.log(`✅ Bookmark added: [${bm.id}] ${bm.title} — ${bm.url}`);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}

function handleRemove(args) {
  const { id } = args;
  if (!id) {
    console.error('❌ --id is required');
    process.exit(1);
  }
  try {
    const removed = removeBookmark(id);
    console.log(`🗑️  Removed: ${removed.title} — ${removed.url}`);
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}

function handleList(args) {
  const { tag } = args;
  try {
    const bookmarks = listBookmarks({ tag });
    if (bookmarks.length === 0) {
      console.log('No bookmarks found.');
      return;
    }
    bookmarks.forEach(bm => {
      const tagStr = bm.tags.length ? ` [${bm.tags.join(', ')}]` : '';
      console.log(`• [${bm.id}] ${bm.title}${tagStr}\n  ${bm.url}`);
    });
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
  }
}

module.exports = { handleAdd, handleRemove, handleList };
