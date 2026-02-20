import { Canvas as FabricCanvas, Rect } from 'fabric';
import { DEFAULT_SHAPE_STYLE } from './defaultStyles';

export interface CircleOptions {
  left: number;
  top: number;
  size: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface CircleAtPointOptions {
  size: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
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
    ...DEFAULT_SHAPE_STYLE,
    width: size,
    height: size,
    rx: size / 2,
    ry: size / 2,
    ...rest,
  });
  rect.shapeType = 'circle';
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
  point: { x: number; y: number },
  options: CircleAtPointOptions,
): Rect {
  const { size, ...style } = options;
  const rect = new Rect({
    ...DEFAULT_SHAPE_STYLE,
    left: point.x,
    top: point.y,
    width: size,
    height: size,
    rx: size / 2,
    ry: size / 2,
    ...style,
  });
  rect.shapeType = 'circle';
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
