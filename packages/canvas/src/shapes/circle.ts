import { Canvas as FabricCanvas, Rect } from 'fabric';
import type { Point2D, ShapeStyleOptions } from '../types';
import { DEFAULT_CIRCLE_STYLE } from '../styles';

export interface CircleOptions extends ShapeStyleOptions {
  left: number;
  top: number;
  size: number;
}

export interface CircleAtPointOptions extends ShapeStyleOptions {
  size: number;
}

/** Constraints applied to every circle: uniform-only scaling, no rotation. */
const CIRCLE_CONSTRAINTS = {
  lockRotation: true,
  lockUniScaling: true,
} as const;

/** Controls hidden on circles: mid-edge handles (non-uniform) and rotation. */
const HIDDEN_CIRCLE_CONTROLS = {
  mt: false,
  mb: false,
  ml: false,
  mr: false,
  mtr: false,
} as const;

/** Apply circle tag and interaction constraints to a Rect. */
function applyCircleConstraints(rect: Rect): void {
  rect.shapeType = 'circle';
  rect.setControlsVisibility(HIDDEN_CIRCLE_CONTROLS);
}

/**
 * Create a circle (a square Rect with full border-radius) and add it to the canvas.
 * Returns the fabric Rect instance for further manipulation.
 */
export function createCircle(
  canvas: FabricCanvas,
  options: CircleOptions,
): Rect {
  const { size, ...rest } = options;
  const rect = new Rect({
    ...DEFAULT_CIRCLE_STYLE,
    ...CIRCLE_CONSTRAINTS,
    width: size,
    height: size,
    rx: size / 2,
    ry: size / 2,
    ...rest,
  });
  applyCircleConstraints(rect);
  canvas.add(rect);
  canvas.requestRenderAll();
  return rect;
}

/**
 * Create a circle at the given scene point and add it to the canvas.
 * Returns the fabric Rect instance.
 */
export function createCircleAtPoint(
  canvas: FabricCanvas,
  point: Point2D,
  options: CircleAtPointOptions,
): Rect {
  const { size, ...style } = options;
  const rect = new Rect({
    ...DEFAULT_CIRCLE_STYLE,
    ...CIRCLE_CONSTRAINTS,
    left: point.x,
    top: point.y,
    width: size,
    height: size,
    rx: size / 2,
    ry: size / 2,
    ...style,
  });
  applyCircleConstraints(rect);
  canvas.add(rect);
  canvas.requestRenderAll();
  return rect;
}

/**
 * Edit an existing circle's properties (position, size, appearance).
 * When size changes, rx and ry are automatically updated to maintain the circular shape.
 */
export function editCircle(
  canvas: FabricCanvas,
  rect: Rect,
  changes: Partial<CircleOptions>,
): void {
  const { size, ...rest } = changes;
  if (size !== undefined) {
    rect.set({
      width: size,
      height: size,
      rx: size / 2,
      ry: size / 2,
      ...rest,
    });
  } else {
    rect.set(rest);
  }
  rect.setCoords();
  canvas.requestRenderAll();
}
