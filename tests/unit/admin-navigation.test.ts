import { describe, expect, test } from 'vitest';
import {
  getAdminNavIndicatorGeometry,
  getDefaultExpandedAdminGroups,
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

  test('keeps every navigation group collapsed by default', () => {
    expect(getDefaultExpandedAdminGroups()).toEqual(new Set());
  });
});
