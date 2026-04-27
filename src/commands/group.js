import {
  getGroups,
  assignGroup,
  removeFromGroup,
  listGroupNames,
  renameGroup,
} from '../groups.js';
import { loadBookmarks, saveBookmarks } from '../bookmarks.js';

export function registerGroupCommand(program) {
  const group = program
    .command('group')
    .description('Organize bookmarks into named groups');

  group
    .command('list')
    .description('List all group names')
    .action(async () => {
      const bookmarks = await loadBookmarks();
      const names = listGroupNames(bookmarks);
      if (names.length === 0) {
        console.log('No groups found.');
        return;
      }
      const groups = getGroups(bookmarks);
      for (const name of names) {
        console.log(`${name} (${groups[name].length})`);
      }
    });

  group
    .command('show <groupName>')
    .description('Show bookmarks in a group')
    .action(async (groupName) => {
      const bookmarks = await loadBookmarks();
      const groups = getGroups(bookmarks);
      const members = groups[groupName] || [];
      if (members.length === 0) {
        console.log(`No bookmarks in group "${groupName}".`);
        return;
      }
      for (const b of members) {
        console.log(`  [${b.id}] ${b.title} — ${b.url}`);
      }
    });

  group
    .command('assign <urlOrId> <groupName>')
    .description('Assign a bookmark to a group')
    .action(async (urlOrId, groupName) => {
      const bookmarks = await loadBookmarks();
      const updated = assignGroup(bookmarks, urlOrId, groupName);
      await saveBookmarks(updated);
      console.log(`Assigned to group "${groupName}".`);
    });

  group
    .command('unassign <urlOrId>')
    .description('Remove a bookmark from its group')
    .action(async (urlOrId) => {
      const bookmarks = await loadBookmarks();
      const updated = removeFromGroup(bookmarks, urlOrId);
      await saveBookmarks(updated);
      console.log('Removed from group.');
    });

  group
    .command('rename <oldName> <newName>')
    .description('Rename a group')
    .action(async (oldName, newName) => {
      const bookmarks = await loadBookmarks();
      const updated = renameGroup(bookmarks, oldName, newName);
      await saveBookmarks(updated);
      console.log(`Renamed group "${oldName}" to "${newName}".`);
    });
}
