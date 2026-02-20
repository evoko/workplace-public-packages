import { Canvas as FabricCanvas, Polygon } from 'fabric';

export interface PolygonOptions {
  points: Array<{ x: number; y: number }>;
  left?: number;
  top?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/**
 * Create a polygon and add it to the canvas.
 * Returns the fabric Polygon instance for further manipulation.
 */
export function createPolygon(
  canvas: FabricCanvas,
  options: PolygonOptions,
): Polygon {
  const { points, ...rest } = options;
  const polygon = new Polygon(points, rest);
  canvas.add(polygon);
  canvas.requestRenderAll();
  return polygon;
}

/**
 * Edit an existing polygon's properties (position, points, appearance, etc.).
 */
export function editPolygon(
  canvas: FabricCanvas,
  polygon: Polygon,
  changes: Partial<PolygonOptions>,
): void {
  const { points, ...rest } = changes;
  if (points) {
    polygon.points = points;
    polygon.setDimensions();
  }
  polygon.set(rest);
  polygon.setCoords();
  canvas.requestRenderAll();
}
