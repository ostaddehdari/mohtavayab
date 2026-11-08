import { describe, expect, it } from 'vitest';
import { allNavigationItems, navigationGroups } from './navigation';

describe('information architecture', () => {
  it('keeps navigation identifiers unique and permission-bound', () => {
    const ids = allNavigationItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(allNavigationItems.every((item) => item.permission.includes('.'))).toBe(true);
  });

  it('covers observe, create and insight user intents', () => {
    expect(navigationGroups.map((group) => group.id)).toEqual(['observe', 'create', 'insight']);
  });
});
