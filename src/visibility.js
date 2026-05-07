// visibility.js — mark bookmarks as public or private

const PUBLIC = 'public';
const PRIVATE = 'private';

function getVisibility(bookmark) {
  return bookmark.visibility || PUBLIC;
}

function setVisibility(bookmarks, url, visibility) {
  if (![PUBLIC, PRIVATE].includes(visibility)) {
    throw new Error(`Invalid visibility: ${visibility}. Must be 'public' or 'private'.`);
  }
  const bookmark = bookmarks.find(b => b.url === url);
  if (!bookmark) throw new Error(`Bookmark not found: ${url}`);
  bookmark.visibility = visibility;
  return bookmarks;
}

function makePublic(bookmarks, url) {
  return setVisibility(bookmarks, url, PUBLIC);
}

function makePrivate(bookmarks, url) {
  return setVisibility(bookmarks, url, PRIVATE);
}

function getPublicBookmarks(bookmarks) {
  return bookmarks.filter(b => getVisibility(b) === PUBLIC);
}

function getPrivateBookmarks(bookmarks) {
  return bookmarks.filter(b => getVisibility(b) === PRIVATE);
}

module.exports = {
  getVisibility,
  setVisibility,
  makePublic,
  makePrivate,
  getPublicBookmarks,
  getPrivateBookmarks,
};
