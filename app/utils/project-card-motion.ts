interface PointerPosition {
  clientX: number;
  clientY: number;
}

interface CardBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

const MAX_TILT_DEGREES = 3;

export function getProjectCardPressMotion(pointer: PointerPosition, bounds: CardBounds) {
  const spotlightX = clamp(pointer.clientX - bounds.left, 0, bounds.width);
  const spotlightY = clamp(pointer.clientY - bounds.top, 0, bounds.height);
  const normalizedX = bounds.width ? spotlightX / bounds.width - 0.5 : 0;
  const normalizedY = bounds.height ? spotlightY / bounds.height - 0.5 : 0;

  return {
    rotateX: -normalizedY * MAX_TILT_DEGREES * 2 || 0,
    rotateY: normalizedX * MAX_TILT_DEGREES * 2 || 0,
    spotlightX,
    spotlightY,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
