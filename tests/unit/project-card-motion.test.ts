import { describe, expect, it } from 'vitest';

import { getProjectCardPressMotion } from '../../app/utils/project-card-motion';

const card = { left: 100, top: 200, width: 300, height: 180 };

describe('project card press motion', () => {
  it('keeps a centered press flat and places the spotlight at the touch point', () => {
    expect(getProjectCardPressMotion({ clientX: 250, clientY: 290 }, card)).toEqual({
      rotateX: 0,
      rotateY: 0,
      spotlightX: 150,
      spotlightY: 90,
    });
  });

  it('limits tilt and spotlight coordinates when the pointer leaves the card bounds', () => {
    expect(getProjectCardPressMotion({ clientX: -200, clientY: -100 }, card)).toEqual({
      rotateX: 3,
      rotateY: -3,
      spotlightX: 0,
      spotlightY: 0,
    });

    expect(getProjectCardPressMotion({ clientX: 800, clientY: 900 }, card)).toEqual({
      rotateX: -3,
      rotateY: 3,
      spotlightX: 300,
      spotlightY: 180,
    });
  });
});
