const fs = require('fs');
const path = require('path');
const os = require('os');
const { fromNetscapeHTML, fromJSON } = require('./import');

function writeTmp(name, content) {
  const p = path.join(os.tmpdir(), name);
  fs.writeFileSync(p, content, 'utf-8');
  return p;
}

describe('fromNetscapeHTML', () => {
  it('parses basic bookmark anchors', () => {
    const html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
  <DT><A HREF="https://example.com" ADD_DATE="1609459200" TAGS="dev,tools">Example</A>
  <DT><A HREF="https://openai.com" ADD_DATE="1609459200">OpenAI</A>
</DL>`;
    const file = writeTmp('test_bookmarks.html', html);
    const result = fromNetscapeHTML(file);
    expect(result).toHaveLength(2);
    expect(result[0].url).toBe('https://example.com');
    expect(result[0].title).toBe('Example');
    expect(result[0].tags).toEqual(['dev', 'tools']);
    expect(result[1].tags).toEqual([]);
  });

  it('filters out entries without a URL', () => {
    const html = `<DL><DT><A>No URL</A></DL>`;
    const file = writeTmp('test_no_url.html', html);
    const result = fromNetscapeHTML(file);
    expect(result).toHaveLength(0);
  });
});

describe('fromJSON', () => {
  it('parses a flat array', () => {
    const data = [
      { title: 'GitHub', url: 'https://github.com', tags: ['code'], addedAt: '2021-01-01T00:00:00.000Z' },
    ];
    const file = writeTmp('test_bookmarks.json', JSON.stringify(data));
    const result = fromJSON(file);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://github.com');
    expect(result[0].tags).toEqual(['code']);
  });

  it('parses an object with bookmarks key', () => {
    const data = { bookmarks: [{ title: 'MDN', url: 'https://developer.mozilla.org', tags: [] }] };
    const file = writeTmp('test_obj.json', JSON.stringify(data));
    const result = fromJSON(file);
    expect(result).toHaveLength(1);
  });

  it('throws on invalid format', () => {
    const file = writeTmp('test_bad.json', JSON.stringify({ foo: 'bar' }));
    expect(() => fromJSON(file)).toThrow('Invalid JSON format');
  });

  it('fills in missing addedAt with current time', () => {
    const data = [{ title: 'Test', url: 'https://test.com' }];
    const file = writeTmp('test_no_date.json', JSON.stringify(data));
    const result = fromJSON(file);
    expect(result[0].addedAt).toBeDefined();
  });
});
