import { describe, expect, test } from 'vitest';
import {
  adminNavigation,
  getAdminNavigationState,
  getAdminNavIndicatorGeometry,
} from '../../app/utils/admin-navigation';

describe('admin navigation motion', () => {
  test('positions the indicator relative to the navigation container', () => {
    expect(
      getAdminNavIndicatorGeometry(
        { left: 32, top: 184, width: 176, height: 36 },
        { left: 16, top: 96 },
      ),
    ).toEqual({ x: 16, y: 88, width: 176, height: 36 });
  });

  test.each([
    ['/admin', 'overview', '/admin'],
    ['/admin/write', 'content', '/admin/write'],
    ['/admin/write/drafts', 'content', '/admin/write/drafts'],
    ['/admin/posts', 'content', '/admin/posts'],
    ['/admin/home', 'profile', '/admin/home'],
    ['/admin/about', 'profile', '/admin/about'],
    ['/admin/comments', 'community', '/admin/comments'],
    ['/admin/messages', 'community', '/admin/messages'],
  ])('maps %s to %s and %s', (path, groupKey, itemPath) => {
    const state = getAdminNavigationState(path);

    expect(state.activeGroup.key).toBe(groupKey);
    expect(state.activeItem.to).toBe(itemPath);
  });

  test('exposes four primary destinations with content secondary tabs', () => {
    expect(adminNavigation.map((group) => group.label)).toEqual(['概览', '内容', '资料', '互动']);
    expect(
      getAdminNavigationState('/admin/projects').secondaryItems.map((item) => item.label),
    ).toContain('项目管理');
  });
});
