import { describe, it, expect } from 'vitest';
import {
  getCollections,
  listCollectionNames,
  addToCollection,
  removeFromCollection,
  renameCollection,
  deleteCollection,
} from './collections.js';

const base = () => [
  { url: 'https://a.com', title: 'A', collections: ['work', 'reading'] },
  { url: 'https://b.com', title: 'B', collections: ['work'] },
  { url: 'https://c.com', title: 'C' },
];

describe('getCollections', () => {
  it('groups bookmarks by collection', () => {
    const cols = getCollections(base());
    expect(cols['work']).toHaveLength(2);
    expect(cols['reading']).toHaveLength(1);
  });

  it('returns empty object when no collections', () => {
    expect(getCollections([{ url: 'x', title: 'x' }])).toEqual({});
  });
});

describe('listCollectionNames', () => {
  it('returns sorted unique names', () => {
    expect(listCollectionNames(base())).toEqual(['reading', 'work']);
  });
});

describe('addToCollection', () => {
  it('adds bookmark to collection', () => {
    const bms = addToCollection(base(), 'https://c.com', 'fun');
    expect(bms.find(b => b.url === 'https://c.com').collections).toContain('fun');
  });

  it('does not duplicate', () => {
    const bms = addToCollection(base(), 'https://a.com', 'work');
    const cols = bms.find(b => b.url === 'https://a.com').collections;
    expect(cols.filter(c => c === 'work')).toHaveLength(1);
  });

  it('throws for missing bookmark', () => {
    expect(() => addToCollection(base(), 'https://z.com', 'x')).toThrow();
  });
});

describe('removeFromCollection', () => {
  it('removes bookmark from collection', () => {
    const bms = removeFromCollection(base(), 'https://a.com', 'reading');
    expect(bms.find(b => b.url === 'https://a.com').collections).not.toContain('reading');
  });

  it('deletes collections key when empty', () => {
    const bms = removeFromCollection(base(), 'https://b.com', 'work');
    expect(bms.find(b => b.url === 'https://b.com').collections).toBeUndefined();
  });
});

describe('renameCollection', () => {
  it('renames across all bookmarks', () => {
    const bms = renameCollection(base(), 'work', 'office');
    expect(listCollectionNames(bms)).toContain('office');
    expect(listCollectionNames(bms)).not.toContain('work');
  });
});

describe('deleteCollection', () => {
  it('removes collection from all bookmarks', () => {
    const bms = deleteCollection(base(), 'work');
    expect(listCollectionNames(bms)).not.toContain('work');
  });
});
