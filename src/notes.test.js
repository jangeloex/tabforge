import { describe, it, expect } from 'vitest';
import { getNote, setNote, removeNote, getBookmarksWithNotes } from './notes.js';

const base = [
  { url: 'https://example.com', title: 'Example', tags: [] },
  { url: 'https://foo.com', title: 'Foo', tags: [], note: 'check this later' },
  { url: 'https://bar.com', title: 'Bar', tags: [], note: '' },
];

describe('getNote', () => {
  it('returns note when present', () => {
    expect(getNote(base, 'https://foo.com')).toBe('check this later');
  });

  it('returns null when no note field', () => {
    expect(getNote(base, 'https://example.com')).toBeNull();
  });

  it('returns null when bookmark not found', () => {
    expect(getNote(base, 'https://missing.com')).toBeNull();
  });
});

describe('setNote', () => {
  it('sets a note on an existing bookmark', () => {
    const result = setNote(base, 'https://example.com', 'my note');
    expect(result.find((b) => b.url === 'https://example.com').note).toBe('my note');
  });

  it('trims whitespace from note', () => {
    const result = setNote(base, 'https://example.com', '  trimmed  ');
    expect(result.find((b) => b.url === 'https://example.com').note).toBe('trimmed');
  });

  it('does not mutate original array', () => {
    setNote(base, 'https://example.com', 'test');
    expect(base[0].note).toBeUndefined();
  });

  it('throws when bookmark not found', () => {
    expect(() => setNote(base, 'https://nope.com', 'x')).toThrow('Bookmark not found');
  });
});

describe('removeNote', () => {
  it('removes the note field', () => {
    const result = removeNote(base, 'https://foo.com');
    expect(result.find((b) => b.url === 'https://foo.com').note).toBeUndefined();
  });

  it('throws when bookmark not found', () => {
    expect(() => removeNote(base, 'https://ghost.com')).toThrow('Bookmark not found');
  });
});

describe('getBookmarksWithNotes', () => {
  it('returns only bookmarks with non-empty notes', () => {
    const result = getBookmarksWithNotes(base);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://foo.com');
  });
});
