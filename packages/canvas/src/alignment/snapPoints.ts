import { type FabricObject, Point, Polygon, Rect, util } from 'fabric';

/**
 * Extracts alignment-relevant snap points from a FabricObject.
 * All returned points must be in scene (world) coordinates.
 */
export type SnapPointExtractor = (object: FabricObject) => Point[];

interface SnapPointRegistration {
  matcher: (object: FabricObject) => boolean;
  extractor: SnapPointExtractor;
}

const registry: SnapPointRegistration[] = [];

/**
 * Register a snap point extractor for a shape type.
 * Matchers are checked in LIFO order (last registered wins),
 * allowing consumers to override built-in extractors.
 */
export function registerSnapPointExtractor(
  matcher: (object: FabricObject) => boolean,
  extractor: SnapPointExtractor,
): void {
  registry.unshift({ matcher, extractor });
}

/**
 * Get snap target points for a FabricObject by finding the first matching
 * registered extractor. Falls back to bounding box corners + center.
 */
export function getSnapPoints(object: FabricObject): Point[] {
  for (const { matcher, extractor } of registry) {
    if (matcher(object)) {
      return extractor(object);
    }
  }
  return getDefaultSnapPoints(object);
}

function getDefaultSnapPoints(object: FabricObject): Point[] {
  const coords = object.getCoords(); // [tl, tr, br, bl] in scene space
  return [...coords, object.getCenterPoint()];
}

// --- Built-in extractors ---

// Rectangle: 4 rotation-aware corners + 4 edge midpoints + center
registerSnapPointExtractor(
  (obj) => obj instanceof Rect,
  (obj) => {
    const [tl, tr, br, bl] = obj.getCoords();
    const mt = tl.add(tr).scalarDivide(2);
    const mr = tr.add(br).scalarDivide(2);
    const mb = br.add(bl).scalarDivide(2);
    const ml = bl.add(tl).scalarDivide(2);
    return [tl, tr, br, bl, mt, mr, mb, ml, obj.getCenterPoint()];
  },
);

// Polygon: all vertices transformed to scene space + center
registerSnapPointExtractor(
  (obj) => obj instanceof Polygon,
  (obj) => {
    const polygon = obj as Polygon;
    const matrix = polygon.calcTransformMatrix();
    const points: Point[] = polygon.points.map((pt) => {
      const local = new Point(
        pt.x - polygon.pathOffset.x,
        pt.y - polygon.pathOffset.y,
      );
      return util.transformPoint(local, matrix);
    });
    points.push(polygon.getCenterPoint());
    return points;
  },
);
