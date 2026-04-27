import { loadBookmarks, saveBookmarks } from '../bookmarks.js';
import { getNote, setNote, removeNote, getBookmarksWithNotes } from '../notes.js';

export function registerNotesCommand(program) {
  const notes = program.command('notes').description('manage notes on bookmarks');

  notes
    .command('set <url> <note>')
    .description('attach a note to a bookmark')
    .action(async (url, note) => {
      const bookmarks = await loadBookmarks();
      const updated = setNote(bookmarks, url, note);
      await saveBookmarks(updated);
      console.log(`Note set on ${url}`);
    });

  notes
    .command('get <url>')
    .description('show the note for a bookmark')
    .action(async (url) => {
      const bookmarks = await loadBookmarks();
      const note = getNote(bookmarks, url);
      if (note === null) {
        console.log('No note found for that bookmark.');
      } else {
        console.log(note);
      }
    });

  notes
    .command('remove <url>')
    .description('remove the note from a bookmark')
    .action(async (url) => {
      const bookmarks = await loadBookmarks();
      const updated = removeNote(bookmarks, url);
      await saveBookmarks(updated);
      console.log(`Note removed from ${url}`);
    });

  notes
    .command('list')
    .description('list all bookmarks that have notes')
    .action(async () => {
      const bookmarks = await loadBookmarks();
      const withNotes = getBookmarksWithNotes(bookmarks);
      if (withNotes.length === 0) {
        console.log('No bookmarks with notes.');
        return;
      }
      withNotes.forEach((b) => {
        console.log(`${b.title} — ${b.url}`);
        console.log(`  Note: ${b.note}`);
      });
    });
}
