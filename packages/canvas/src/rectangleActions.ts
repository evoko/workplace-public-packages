import { Canvas as FabricCanvas, Rect } from 'fabric';

export interface RectangleOptions {
  left: number;
  top: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
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
  const rect = new Rect(options);
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
