import { Canvas as FabricCanvas, Polygon } from 'fabric';

export interface PolygonOptions {
  points: Array<{ x: number; y: number }>;
  left?: number;
  top?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface PolygonStyleOptions {
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
 * Create a rectangular polygon at the given scene point and add it to the canvas.
 * Returns the fabric Polygon instance.
 */
export function createPolygonAtPoint(
  canvas: FabricCanvas,
  point: { x: number; y: number },
  options: PolygonStyleOptions & { width: number; height: number },
): Polygon {
  const { width, height, ...style } = options;
  const polygon = new Polygon(
    [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ],
    { left: point.x, top: point.y, ...style },
  );
  canvas.add(polygon);
  canvas.requestRenderAll();
  return polygon;
}

/**
 * Create a rectangular polygon from drag bounds (two corner points) and add it to the canvas.
 * Returns the fabric Polygon instance.
 */
export function createPolygonFromDrag(
  canvas: FabricCanvas,
  start: { x: number; y: number },
  end: { x: number; y: number },
  style?: PolygonStyleOptions,
): Polygon {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  const left = Math.min(start.x, end.x) + width / 2;
  const top = Math.min(start.y, end.y) + height / 2;
  const polygon = new Polygon(
    [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height },
    ],
    { left, top, ...style },
  );
  canvas.add(polygon);
  canvas.requestRenderAll();
  return polygon;
}

/**
 * Create a polygon from an arbitrary array of vertices and add it to the canvas.
 * Returns the fabric Polygon instance.
 */
export function createPolygonFromVertices(
  canvas: FabricCanvas,
  points: Array<{ x: number; y: number }>,
  style?: PolygonStyleOptions,
): Polygon {
  const polygon = new Polygon(
    points.map((p) => ({ x: p.x, y: p.y })),
    { ...style },
  );
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
