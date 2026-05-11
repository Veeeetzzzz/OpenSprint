import { describe, expect, it } from 'vitest';
import { isLastAdminChangeBlocked, roleMeetsMinimum } from './access.js';

describe('project access helpers', () => {
  it('requires member role for issue mutations', () => {
    expect(roleMeetsMinimum('viewer', 'member')).toBe(false);
    expect(roleMeetsMinimum('member', 'member')).toBe(true);
    expect(roleMeetsMinimum('admin', 'member')).toBe(true);
  });

  it('keeps at least one project admin', () => {
    expect(isLastAdminChangeBlocked('admin', 'member', 1)).toBe(true);
    expect(isLastAdminChangeBlocked('admin', null, 1)).toBe(true);
    expect(isLastAdminChangeBlocked('admin', 'viewer', 2)).toBe(false);
    expect(isLastAdminChangeBlocked('member', null, 1)).toBe(false);
  });
});
