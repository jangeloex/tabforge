import { describe, it, expect } from 'vitest';
import {
  formatShareText,
  formatMarkdownLink,
  buildShareBundle,
  getShareableBookmarks,
} from './share.js';

const bm1 = { url: 'https://example.com', title: 'Example', tags: ['dev', 'web'] };
const bm2 = { url: 'https://notes.io', title: 'Notes', tags: ['writing'], note: 'Great tool' };
const bm3 = { url: 'https://plain.org', title: 'Plain', tags: [] };

describe('formatShareText', () => {
  it('includes title, url and tags', () => {
    const out = formatShareText(bm1);
    expect(out).toContain('Example');
    expect(out).toContain('https://example.com');
    expect(out).toContain('[dev, web]');
  });

  it('includes note when present', () => {
    const out = formatShareText(bm2);
    expect(out).toContain('Note: Great tool');
  });

  it('omits tag section when no tags', () => {
    const out = formatShareText(bm3);
    expect(out).not.toContain('[');
  });
});

describe('formatMarkdownLink', () => {
  it('produces markdown link', () => {
    const out = formatMarkdownLink(bm1);
    expect(out).toContain('[Example](https://example.com)');
  });

  it('includes tags as code spans', () => {
    const out = formatMarkdownLink(bm1);
    expect(out).toContain('`dev`');
    expect(out).toContain('`web`');
  });

  it('omits tags line when no tags', () => {
    const out = formatMarkdownLink(bm3);
    expect(out).not.toContain('Tags:');
  });
});

describe('buildShareBundle', () => {
  it('returns all formats and metadata', () => {
    const bundle = buildShareBundle([bm1, bm2]);
    expect(bundle.count).toBe(2);
    expect(bundle.text).toContain('Example');
    expect(bundle.markdown).toContain('[Notes]');
    expect(bundle.html).toContain('<!DOCTYPE');
    expect(typeof bundle.json).toBe('string');
    expect(bundle.generatedAt).toBeTruthy();
  });
});

describe('getShareableBookmarks', () => {
  const all = [bm1, bm2, bm3];

  it('returns all when no tags filter', () => {
    expect(getShareableBookmarks(all, []).length).toBe(3);
  });

  it('filters by single tag', () => {
    const result = getShareableBookmarks(all, ['dev']);
    expect(result).toHaveLength(1);
    expect(result[0].url).toBe('https://example.com');
  });

  it('filters by multiple tags (AND logic)', () => {
    const result = getShareableBookmarks(all, ['dev', 'web']);
    expect(result).toHaveLength(1);
  });

  it('returns empty when no match', () => {
    expect(getShareableBookmarks(all, ['nope'])).toHaveLength(0);
  });
});
