import { Canvas as FabricCanvas, Polygon } from 'fabric';
import type { Point2D, ShapeStyleOptions } from '../types';
import { DEFAULT_SHAPE_STYLE } from '../styles';

export interface PolygonOptions extends ShapeStyleOptions {
  points: Point2D[];
  left?: number;
  top?: number;
}

/** @deprecated Use `ShapeStyleOptions` directly. This alias will be removed in a future major version. */
export type PolygonStyleOptions = ShapeStyleOptions;

/**
 * Create a polygon and add it to the canvas.
 * Returns the fabric Polygon instance for further manipulation.
 */
export function createPolygon(
  canvas: FabricCanvas,
  options: PolygonOptions,
): Polygon {
  const { points, ...rest } = options;
  const polygon = new Polygon(points, { ...DEFAULT_SHAPE_STYLE, ...rest });
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
  point: Point2D,
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
    { ...DEFAULT_SHAPE_STYLE, left: point.x, top: point.y, ...style },
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
  start: Point2D,
  end: Point2D,
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
    { ...DEFAULT_SHAPE_STYLE, left, top, ...style },
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
  points: Point2D[],
  style?: PolygonStyleOptions,
): Polygon {
  const polygon = new Polygon(
    points.map((p) => ({ x: p.x, y: p.y })),
    { ...DEFAULT_SHAPE_STYLE, ...style },
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
