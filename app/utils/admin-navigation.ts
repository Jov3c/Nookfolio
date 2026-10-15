interface IndicatorRect {
  left: number;
  top: number;
  width?: number;
  height?: number;
}

export function getAdminNavIndicatorGeometry(
  target: Required<IndicatorRect>,
  container: IndicatorRect,
) {
  return {
    x: target.left - container.left,
    y: target.top - container.top,
    width: target.width,
    height: target.height,
  };
}

export function getDefaultExpandedAdminGroups() {
  return new Set<string>();
}
