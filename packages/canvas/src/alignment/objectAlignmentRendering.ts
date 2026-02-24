import type { Canvas, Point } from 'fabric';
import type { AlignmentLine } from './objectAlignmentUtils';

/** Style configuration for alignment guideline rendering. */
export interface AlignmentRenderConfig {
  canvas: Canvas;
  width: number;
  color: string;
  xSize: number;
  lineDash?: number[];
}

/** Draw a single alignment line between two points, with X markers at each end. */
export function drawAlignmentLine(
  config: AlignmentRenderConfig,
  origin: Point,
  target: Point,
): void {
  const ctx = config.canvas.getTopContext();
  const vt = config.canvas.viewportTransform;
  const zoom = config.canvas.getZoom();
  ctx.save();
  ctx.transform(...vt);
  ctx.lineWidth = config.width / zoom;
  if (config.lineDash) ctx.setLineDash(config.lineDash);
  ctx.strokeStyle = config.color;
  ctx.beginPath();
  ctx.moveTo(origin.x, origin.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  if (config.lineDash) ctx.setLineDash([]);
  drawXMarker(ctx, origin, config.xSize / zoom);
  drawXMarker(ctx, target, config.xSize / zoom);
  ctx.restore();
}

/** Draw an X marker at a point. */
export function drawXMarker(
  ctx: CanvasRenderingContext2D,
  point: Point,
  size: number,
): void {
  ctx.save();
  ctx.translate(point.x, point.y);
  ctx.beginPath();
  ctx.moveTo(-size, -size);
  ctx.lineTo(size, size);
  ctx.moveTo(size, -size);
  ctx.lineTo(-size, size);
  ctx.stroke();
  ctx.restore();
}

/** Draw X markers only (no lines) for a list of alignment lines. */
export function drawMarkerList(
  config: AlignmentRenderConfig,
  lines: AlignmentLine[],
): void {
  const ctx = config.canvas.getTopContext();
  const vt = config.canvas.viewportTransform;
  const zoom = config.canvas.getZoom();
  const markerSize = config.xSize / zoom;
  ctx.save();
  ctx.transform(...vt);
  ctx.lineWidth = config.width / zoom;
  ctx.strokeStyle = config.color;
  for (const item of lines) drawXMarker(ctx, item.target, markerSize);
  ctx.restore();
}

/** Draw vertical alignment lines (lines connecting points at the same X coordinate). */
export function drawVerticalAlignmentLines(
  config: AlignmentRenderConfig,
  lines: Set<string>,
): void {
  for (const v of lines) {
    const { origin, target }: AlignmentLine = JSON.parse(v);
    const from = { x: target.x, y: origin.y } as Point;
    drawAlignmentLine(config, from, target as Point);
  }
}

/** Draw horizontal alignment lines (lines connecting points at the same Y coordinate). */
export function drawHorizontalAlignmentLines(
  config: AlignmentRenderConfig,
  lines: Set<string>,
): void {
  for (const h of lines) {
    const { origin, target }: AlignmentLine = JSON.parse(h);
    const from = { x: origin.x, y: target.y } as Point;
    drawAlignmentLine(config, from, target as Point);
  }
}
