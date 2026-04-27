import { describe, it, expect } from 'vitest';
import {
  getGroups,
  assignGroup,
  removeFromGroup,
  listGroupNames,
  renameGroup,
} from './groups.js';

const bookmarks = [
  { id: '1', url: 'https://a.com', title: 'A', group: 'work' },
  { id: '2', url: 'https://b.com', title: 'B', group: 'personal' },
  { id: '3', url: 'https://c.com', title: 'C', group: 'work' },
  { id: '4', url: 'https://d.com', title: 'D' },
];

describe('getGroups', () => {
  it('groups bookmarks by group field', () => {
    const groups = getGroups(bookmarks);
    expect(groups.work).toHaveLength(2);
    expect(groups.personal).toHaveLength(1);
    expect(groups.uncategorized).toHaveLength(1);
  });
});

describe('assignGroup', () => {
  it('assigns a group by url', () => {
    const updated = assignGroup(bookmarks, 'https://d.com', 'misc');
    expect(updated.find((b) => b.url === 'https://d.com').group).toBe('misc');
  });

  it('assigns a group by id', () => {
    const updated = assignGroup(bookmarks, '2', 'work');
    expect(updated.find((b) => b.id === '2').group).toBe('work');
  });

  it('throws if bookmark not found', () => {
    expect(() => assignGroup(bookmarks, 'nope', 'x')).toThrow();
  });
});

describe('removeFromGroup', () => {
  it('removes group field from bookmark', () => {
    const updated = removeFromGroup(bookmarks, 'https://a.com');
    expect(updated.find((b) => b.url === 'https://a.com').group).toBeUndefined();
  });
});

describe('listGroupNames', () => {
  it('returns sorted unique group names', () => {
    const names = listGroupNames(bookmarks);
    expect(names).toEqual(['personal', 'uncategorized', 'work']);
  });
});

describe('renameGroup', () => {
  it('renames all bookmarks in a group', () => {
    const updated = renameGroup(bookmarks, 'work', 'office');
    expect(updated.filter((b) => b.group === 'office')).toHaveLength(2);
    expect(updated.filter((b) => b.group === 'work')).toHaveLength(0);
  });

  it('throws on empty names', () => {
    expect(() => renameGroup(bookmarks, '', 'x')).toThrow();
  });
});
