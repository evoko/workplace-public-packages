import { type FabricObject, Point } from 'fabric';
import {
  type AlignmentLine,
  type OriginMap,
  findNearestOnAxis,
  getStrokeFreeCoords,
} from './objectAlignmentUtils';

/** Maps each corner/midpoint to the opposite origin for anchoring during scale. */
export const OPPOSITE_ORIGIN_MAP: OriginMap = {
  tl: ['right', 'bottom'],
  tr: ['left', 'bottom'],
  br: ['left', 'top'],
  bl: ['right', 'top'],
  mt: ['center', 'bottom'],
  mr: ['left', 'center'],
  mb: ['center', 'top'],
  ml: ['right', 'center'],
};

// --- Moving alignment ---

/**
 * Collect alignment lines when an object is being moved.
 * Checks the target's corners + center against all snap points.
 */
export function collectMovingAlignmentLines(
  target: FabricObject,
  points: Point[],
  margin: number,
): { verticalLines: AlignmentLine[]; horizontalLines: AlignmentLine[] } {
  const list: Point[] = [...getStrokeFreeCoords(target)];
  list.push(target.getCenterPoint());
  const opts = { target, list, points, margin };
  const verticalLines = collectMovingAxisMatches({ ...opts, axis: 'x' });
  const horizontalLines = collectMovingAxisMatches({ ...opts, axis: 'y' });
  return { verticalLines, horizontalLines };
}

/**
 * For a single axis, find the closest matching snap points for the target's
 * bounding points, snap the object to align, and return the alignment lines.
 */
function collectMovingAxisMatches(props: {
  target: FabricObject;
  list: Point[];
  points: Point[];
  margin: number;
  axis: 'x' | 'y';
}): AlignmentLine[] {
  const { target, list, points, margin, axis } = props;
  const result: AlignmentLine[] = [];
  const distances: ReturnType<typeof findNearestOnAxis>[] = [];
  let min = Infinity;

  for (const item of list) {
    const nearest = findNearestOnAxis(item, points, axis);
    distances.push(nearest);
    if (min > nearest.distance) min = nearest.distance;
  }
  if (min > margin) return result;

  let snapped = false;
  for (let i = 0; i < list.length; i++) {
    if (distances[i].distance !== min) continue;
    for (const item of distances[i].matches) {
      result.push({ origin: list[i], target: item });
    }

    if (snapped) continue;
    snapped = true;
    const snapOffset = distances[i].matches[0][axis] - list[i][axis];
    list.forEach((item) => {
      item[axis] += snapOffset;
    });
    // Use center-based positioning to avoid stroke/origin offset issues.
    // The center is stroke-independent, so shifting it by snapOffset
    // moves the geometric edges by exactly that amount.
    const center = target.getCenterPoint();
    center[axis] += snapOffset;
    target.setXY(center, 'center', 'center');
    target.setCoords();
  }

  return result;
}

// --- Scaling alignment ---

interface ScalingAlignmentProps {
  target: FabricObject;
  point: Point;
  diagonalPoint: Point;
  list: Point[];
  isScale: boolean;
  isUniform: boolean;
  isCenter: boolean;
  corner: string;
  margin: number;
}

/**
 * Collect vertical (X-axis) snap offset during scaling/resizing.
 * Adjusts the target's scaleX (or width) to align with the nearest snap point.
 */
export function collectVerticalSnapOffset(
  props: ScalingAlignmentProps,
): AlignmentLine[] {
  const {
    target,
    isScale,
    isUniform,
    corner,
    point,
    diagonalPoint,
    list,
    isCenter,
    margin,
  } = props;
  const { distance, matches } = findNearestOnAxis(point, list, 'x');
  if (distance > margin) return [];

  let snapOffset = matches[matches.length - 1].x - point.x;
  const dirX = corner.includes('l') ? -1 : 1;
  snapOffset *= dirX;

  const { width, height, scaleX, scaleY } = target;
  const scaleWidth = scaleX * width;
  const sx = (snapOffset + scaleWidth) / scaleWidth;
  if (sx === 0) return [];

  if (isScale) {
    target.set('scaleX', scaleX * sx);
    if (isUniform) target.set('scaleY', scaleY * sx);
  } else {
    target.set('width', width * sx);
    if (isUniform) target.set('height', height * sx);
  }

  if (isCenter) {
    target.setRelativeXY(diagonalPoint, 'center', 'center');
  } else {
    target.setRelativeXY(diagonalPoint, ...OPPOSITE_ORIGIN_MAP[corner]);
  }
  target.setCoords();

  return matches.map((t) => ({ origin: point, target: t }));
}

/**
 * Collect horizontal (Y-axis) snap offset during scaling/resizing.
 * Adjusts the target's scaleY (or height) to align with the nearest snap point.
 */
export function collectHorizontalSnapOffset(
  props: ScalingAlignmentProps,
): AlignmentLine[] {
  const {
    target,
    isScale,
    isUniform,
    corner,
    point,
    diagonalPoint,
    list,
    isCenter,
    margin,
  } = props;
  const { distance, matches } = findNearestOnAxis(point, list, 'y');
  if (distance > margin) return [];

  let snapOffset = matches[matches.length - 1].y - point.y;
  const dirY = corner.includes('t') ? -1 : 1;
  snapOffset *= dirY;

  const { width, height, scaleX, scaleY } = target;
  const scaleHeight = scaleY * height;
  const sy = (snapOffset + scaleHeight) / scaleHeight;
  if (sy === 0) return [];

  if (isScale) {
    target.set('scaleY', scaleY * sy);
    if (isUniform) target.set('scaleX', scaleX * sy);
  } else {
    target.set('height', height * sy);
    if (isUniform) target.set('width', width * sy);
  }

  if (isCenter) {
    target.setRelativeXY(diagonalPoint, 'center', 'center');
  } else {
    target.setRelativeXY(diagonalPoint, ...OPPOSITE_ORIGIN_MAP[corner]);
  }
  target.setCoords();

  return matches.map((t) => ({ origin: point, target: t }));
}
