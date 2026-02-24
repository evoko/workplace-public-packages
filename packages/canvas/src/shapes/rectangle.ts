import { Canvas as FabricCanvas, Rect } from 'fabric';
import type { Point2D, ShapeStyleOptions } from '../types';
import { DEFAULT_SHAPE_STYLE } from '../styles';

export interface RectangleOptions extends ShapeStyleOptions {
  left: number;
  top: number;
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

export interface RectangleAtPointOptions extends ShapeStyleOptions {
  width: number;
  height: number;
  rx?: number;
  ry?: number;
}

/**
 * Create a rectangle and add it to the canvas.
 * Returns the fabric Rect instance for further manipulation.
 */
export function createRectangle(
  canvas: FabricCanvas,
  options: RectangleOptions,
): Rect {
  const rect = new Rect({ ...DEFAULT_SHAPE_STYLE, ...options });
  canvas.add(rect);
  canvas.requestRenderAll();
  return rect;
}

/**
 * Create a rectangle at the given scene point and add it to the canvas.
 * Returns the fabric Rect instance.
 */
export function createRectangleAtPoint(
  canvas: FabricCanvas,
  point: Point2D,
  options: RectangleAtPointOptions,
): Rect {
  const { width, height, ...style } = options;
  const rect = new Rect({
    ...DEFAULT_SHAPE_STYLE,
    left: point.x,
    top: point.y,
    width,
    height,
    ...style,
  });
  canvas.add(rect);
  canvas.requestRenderAll();
  return rect;
}

/**
 * Edit an existing rectangle's properties (position, dimensions, appearance, etc.).
 */
export function editRectangle(
  canvas: FabricCanvas,
  rect: Rect,
  changes: Partial<RectangleOptions>,
): void {
  rect.set(changes);
  rect.setCoords();
  canvas.requestRenderAll();
}
