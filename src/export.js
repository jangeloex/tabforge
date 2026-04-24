import { loadBookmarks } from './bookmarks.js';
import { loadConfig } from './config.js';
import fs from 'fs';
import path from 'path';

export function toNetscapeHTML(bookmarks) {
  const items = bookmarks
    .map(
      (b) =>
        `    <DT><A HREF="${b.url}" ADD_DATE="${Math.floor(
          new Date(b.createdAt).getTime() / 1000
        )}">${b.title}</A>`
    )
    .join('\n');

  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
${items}
</DL><p>`;
}

export function toJSON(bookmarks) {
  return JSON.stringify(bookmarks, null, 2);
}

export async function exportBookmarks(format, outputPath) {
  const config = await loadConfig();
  const bookmarks = await loadBookmarks(config);

  let content;
  let defaultExt;

  if (format === 'html') {
    content = toNetscapeHTML(bookmarks);
    defaultExt = 'html';
  } else if (format === 'json') {
    content = toJSON(bookmarks);
    defaultExt = 'json';
  } else {
    throw new Error(`Unsupported export format: ${format}. Use 'html' or 'json'.`);
  }

  const dest = outputPath || path.resolve(process.cwd(), `bookmarks.${defaultExt}`);
  fs.writeFileSync(dest, content, 'utf-8');
  return dest;
}
