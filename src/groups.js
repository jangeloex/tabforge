import { loadBookmarks, saveBookmarks } from './bookmarks.js';

export function getGroups(bookmarks) {
  const groups = {};
  for (const b of bookmarks) {
    const group = b.group || 'uncategorized';
    if (!groups[group]) groups[group] = [];
    groups[group].push(b);
  }
  return groups;
}

export function assignGroup(bookmarks, urlOrId, groupName) {
  if (!groupName || !groupName.trim()) throw new Error('Group name must not be empty');
  const updated = bookmarks.map((b) => {
    if (b.url === urlOrId || b.id === urlOrId) {
      return { ...b, group: groupName };
    }
    return b;
  });
  const changed = updated.some(
    (b, i) => b.group !== bookmarks[i].group
  );
  if (!changed) throw new Error(`Bookmark not found: ${urlOrId}`);
  return updated;
}

export function removeFromGroup(bookmarks, urlOrId) {
  const updated = bookmarks.map((b) => {
    if (b.url === urlOrId || b.id === urlOrId) {
      const { group, ...rest } = b;
      return rest;
    }
    return b;
  });
  return updated;
}

export function listGroupNames(bookmarks) {
  const names = new Set(
    bookmarks.map((b) => b.group || 'uncategorized')
  );
  return [...names].sort();
}

export function renameGroup(bookmarks, oldName, newName) {
  if (!oldName || !newName) throw new Error('Group names must not be empty');
  return bookmarks.map((b) => {
    if ((b.group || 'uncategorized') === oldName) {
      return { ...b, group: newName };
    }
    return b;
  });
}

/**
 * Returns all bookmarks that belong to the given group name.
 * Treats bookmarks without a group as belonging to 'uncategorized'.
 */
export function getBookmarksInGroup(bookmarks, groupName) {
  if (!groupName) throw new Error('Group name must not be empty');
  return bookmarks.filter(
    (b) => (b.group || 'uncategorized') === groupName
  );
}
