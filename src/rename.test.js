import { describe, it, expect, beforeEach } from 'vitest';
import { vol } from 'memfs';
import { vi } from 'vitest';
import { renameBookmark, renameBookmarkByIndex } from './rename.js';

vi.mock('fs/promises', () => require('memfs').promises);

const DIR = '/test-config';

const INITIAL = [
  { url: 'https://example.com', title: 'Example', tags: [] },
  { url: 'https://mozilla.org', title: 'Mozilla', tags: ['browser'] },
];

beforeEach(() => {
  vol.reset();
  vol.fromJSON({
    [`${DIR}/bookmarks.json`]: JSON.stringify(INITIAL),
  });
});

describe('renameBookmark', () => {
  it('renames a bookmark by URL', async () => {
    const result = await renameBookmark(DIR, 'https://example.com', 'Example Site');
    expect(result.ok).toBe(true);
    expect(result.message).toContain('Example Site');
  });

  it('returns error when URL not found', async () => {
    const result = await renameBookmark(DIR, 'https://nothere.com', 'Whatever');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/no bookmark found/i);
  });

  it('returns error when new title is empty', async () => {
    const result = await renameBookmark(DIR, 'https://example.com', '   ');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/title is required/i);
  });

  it('returns error when URL is missing', async () => {
    const result = await renameBookmark(DIR, '', 'Title');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/url is required/i);
  });
});

describe('renameBookmarkByIndex', () => {
  it('renames a bookmark by 1-based index', async () => {
    const result = await renameBookmarkByIndex(DIR, 2, 'Mozilla Foundation');
    expect(result.ok).toBe(true);
    expect(result.message).toContain('Mozilla Foundation');
  });

  it('returns error for out-of-range index', async () => {
    const result = await renameBookmarkByIndex(DIR, 99, 'Nope');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/out of range/i);
  });

  it('returns error for zero index', async () => {
    const result = await renameBookmarkByIndex(DIR, 0, 'Nope');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/out of range/i);
  });

  it('returns error when new title is blank', async () => {
    const result = await renameBookmarkByIndex(DIR, 1, '');
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/title is required/i);
  });
});
