import {
  ActiveSelection,
  type BasicTransformEvent,
  type FabricObject,
  Group,
  Point,
  type TOriginX,
  type TOriginY,
  type TPointerEvent,
} from 'fabric';

/** A line segment between two alignment points, used for guideline drawing. */
export interface AlignmentLine {
  origin: Point;
  target: Point;
}

export type TransformEvent = BasicTransformEvent<TPointerEvent> & {
  target: FabricObject;
};

export type OriginMap = Record<string, [TOriginX, TOriginY]>;

/** Return the absolute distance between two values. */
export function getAbsoluteDistance(a: number, b: number): number {
  return Math.abs(a - b);
}

/**
 * Find the closest value on a given axis from a list of points.
 * Returns the minimum distance and all points at that distance.
 */
export function findNearestOnAxis(
  point: Point,
  list: Point[],
  axis: 'x' | 'y',
): { distance: number; matches: Point[] } {
  let distance = Infinity;
  let matches: Point[] = [];
  for (const item of list) {
    const d = getAbsoluteDistance(point[axis], item[axis]);
    if (distance > d) {
      matches = [];
      distance = d;
    }
    if (distance === d) {
      matches.push(item);
    }
  }
  return { distance, matches };
}

/**
 * Get a map of bounding-box key points for an object:
 * corners (tl, tr, br, bl) and edge midpoints (mt, mr, mb, ml).
 */
export function getBoundingPointMap(
  target: FabricObject,
): Record<string, Point> {
  const coords = target.getCoords();
  return {
    tl: coords[0],
    tr: coords[1],
    br: coords[2],
    bl: coords[3],
    mt: coords[0].add(coords[1]).scalarDivide(2),
    mr: coords[1].add(coords[2]).scalarDivide(2),
    mb: coords[2].add(coords[3]).scalarDivide(2),
    ml: coords[3].add(coords[0]).scalarDivide(2),
  };
}

/**
 * Get a map of the opposite (diagonal) corners for each control point.
 * Used during scaling to anchor the opposite side.
 */
export function getOppositeCornerMap(
  target: FabricObject,
): Record<string, Point> {
  const aCoords = target.aCoords ?? target.calcACoords();
  return {
    tl: aCoords.br,
    tr: aCoords.bl,
    br: aCoords.tl,
    bl: aCoords.tr,
    mt: aCoords.br.add(aCoords.bl).scalarDivide(2),
    mr: aCoords.bl.add(aCoords.tl).scalarDivide(2),
    mb: aCoords.tl.add(aCoords.tr).scalarDivide(2),
    ml: aCoords.tr.add(aCoords.br).scalarDivide(2),
  };
}

/**
 * Collect all canvas objects that should be considered as alignment targets
 * for a given moving/scaling object. Excludes the target itself and its children
 * (for groups/active selections). Flattens groups into leaf objects.
 */
export function getAlignmentTargets(target: FabricObject): Set<FabricObject> {
  const objects = new Set<FabricObject>();
  const canvas = target.canvas;
  if (!canvas) return objects;

  const children =
    target instanceof ActiveSelection ? target.getObjects() : [target];

  canvas.forEachObject((o) => {
    if (!o.isOnScreen() || !o.visible) return;
    if (o.constructor === Group) {
      collectGroupChildren(objects, o as Group);
      return;
    }
    objects.add(o);
  });

  for (const child of children) {
    if (child.constructor === Group) {
      for (const gc of (child as Group).getObjects()) objects.delete(gc);
    } else {
      objects.delete(child);
    }
  }

  return objects;
}

/** Recursively collect leaf objects from a group, skipping invisible children. */
function collectGroupChildren(objects: Set<FabricObject>, group: Group): void {
  for (const child of group.getObjects()) {
    if (!child.visible) continue;
    if (child.constructor === Group) {
      collectGroupChildren(objects, child as Group);
    } else {
      objects.add(child);
    }
  }
}
