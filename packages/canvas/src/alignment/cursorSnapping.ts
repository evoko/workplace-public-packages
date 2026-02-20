import { Canvas as FabricCanvas, type FabricObject, Point } from 'fabric';
import { getSnapPoints } from './snapPoints';

export interface CursorSnapResult {
  /** The snapped point (or original if no snap occurred). */
  point: Point;
  /** Whether a snap occurred on either axis. */
  snapped: boolean;
  /** Whether the X coordinate was snapped. */
  snapX: boolean;
  /** Whether the Y coordinate was snapped. */
  snapY: boolean;
  /** All target points that triggered the X-axis snap (for drawing guidelines). */
  alignTargetsX?: Point[];
  /** All target points that triggered the Y-axis snap (for drawing guidelines). */
  alignTargetsY?: Point[];
}

export interface CursorSnapOptions {
  /** Snap margin in scene-space pixels. Default: 6. */
  margin?: number;
  /** Objects to exclude from snap targets (e.g., preview elements). */
  exclude?: Set<FabricObject>;
  /** Pre-computed target points. If provided, skips object iteration. */
  targetPoints?: Point[];
}

export interface GuidelineStyle {
  color?: string;
  width?: number;
  xSize?: number;
}

const DEFAULT_CURSOR_SNAP_MARGIN = 6;

/**
 * Compute a snapped cursor position given a raw scene-space point.
 * Finds the closest X and closest Y alignment independently,
 * snapping each axis if within margin.
 */
export function snapCursorPoint(
  canvas: FabricCanvas,
  rawPoint: Point,
  options?: CursorSnapOptions,
): CursorSnapResult {
  const margin =
    (options?.margin ?? DEFAULT_CURSOR_SNAP_MARGIN) / canvas.getZoom();
  const exclude = options?.exclude ?? new Set();

  let targetPoints: Point[];
  if (options?.targetPoints) {
    targetPoints = options.targetPoints;
  } else {
    targetPoints = [];
    canvas.forEachObject((obj) => {
      if (!obj.visible || !obj.isOnScreen()) return;
      if (exclude.has(obj)) return;
      targetPoints.push(...getSnapPoints(obj));
    });
  }

  let bestDx = Infinity;
  let bestDy = Infinity;
  let snapTargetsX: Point[] = [];
  let snapTargetsY: Point[] = [];

  for (const tp of targetPoints) {
    const dx = Math.abs(rawPoint.x - tp.x);
    const dy = Math.abs(rawPoint.y - tp.y);
    if (dx < bestDx) {
      bestDx = dx;
      snapTargetsX = [];
    }
    if (dx === bestDx) {
      snapTargetsX.push(tp);
    }
    if (dy < bestDy) {
      bestDy = dy;
      snapTargetsY = [];
    }
    if (dy === bestDy) {
      snapTargetsY.push(tp);
    }
  }

  const snapX = bestDx <= margin && snapTargetsX.length > 0;
  const snapY = bestDy <= margin && snapTargetsY.length > 0;

  return {
    point: new Point(
      snapX ? snapTargetsX[0].x : rawPoint.x,
      snapY ? snapTargetsY[0].y : rawPoint.y,
    ),
    snapped: snapX || snapY,
    snapX,
    snapY,
    alignTargetsX: snapX ? snapTargetsX : undefined,
    alignTargetsY: snapY ? snapTargetsY : undefined,
  };
}

/**
 * Draw alignment guidelines on the canvas top context based on a snap result.
 * Renders lines from the snapped point to the alignment target points,
 * with X markers at both endpoints.
 */
export function drawCursorGuidelines(
  canvas: FabricCanvas,
  snapResult: CursorSnapResult,
  style?: GuidelineStyle,
): void {
  if (!snapResult.snapped) return;

  const ctx = canvas.getTopContext();
  const vt = canvas.viewportTransform;
  const zoom = canvas.getZoom();
  const color = style?.color ?? 'rgba(255,0,0,0.9)';
  const width = style?.width ?? 1;
  const xSize = (style?.xSize ?? 2.4) / zoom;

  ctx.save();
  ctx.transform(vt[0], vt[1], vt[2], vt[3], vt[4], vt[5]);
  ctx.lineWidth = width / zoom;
  ctx.strokeStyle = color;

  if (snapResult.snapX && snapResult.alignTargetsX) {
    const to = snapResult.point;
    for (const from of snapResult.alignTargetsX) {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      drawXMarker(ctx, from, xSize);
    }
    drawXMarker(ctx, new Point(to.x, to.y), xSize);
  }

  if (snapResult.snapY && snapResult.alignTargetsY) {
    const to = snapResult.point;
    for (const from of snapResult.alignTargetsY) {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      drawXMarker(ctx, from, xSize);
    }
    drawXMarker(ctx, new Point(to.x, to.y), xSize);
  }

  ctx.restore();
}

function drawXMarker(
  ctx: CanvasRenderingContext2D,
  point: Point,
  size: number,
): void {
  ctx.beginPath();
  ctx.moveTo(point.x - size, point.y - size);
  ctx.lineTo(point.x + size, point.y + size);
  ctx.moveTo(point.x + size, point.y - size);
  ctx.lineTo(point.x - size, point.y + size);
  ctx.stroke();
}

/** Clear the canvas top context to remove previous guidelines. */
export function clearCursorGuidelines(canvas: FabricCanvas): void {
  canvas.clearContext(canvas.getTopContext());
}
