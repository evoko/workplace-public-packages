import { type Canvas, type FabricObject, Point, util } from 'fabric';
import { getSnapPoints } from './snapPoints';
import {
  type TransformEvent,
  type AlignmentLine,
  getAlignmentTargets,
  getBoundingPointMap,
  getOppositeCornerMap,
} from './objectAlignmentUtils';
import {
  type AlignmentRenderConfig,
  drawMarkerList,
  drawVerticalAlignmentLines,
  drawHorizontalAlignmentLines,
} from './objectAlignmentRendering';
import {
  collectMovingAlignmentLines,
  collectVerticalSnapOffset,
  collectHorizontalSnapOffset,
} from './objectAlignmentMath';

export interface ObjectAlignmentOptions {
  /** At what distance from the shape does alignment begin? Default: 4. */
  margin?: number;
  /** Aligning line width. Default: 1. */
  width?: number;
  /** Aligning line color. Default: 'rgba(255,0,0,0.9)'. */
  color?: string;
  /** Endpoint marker size. Default: 2.4. */
  xSize?: number;
  /** Dashed line style. */
  lineDash?: number[];
  /**
   * Scale the snap margin proportionally with canvas size.
   * Uses `max(width, height) / 1000` as a multiplier so large canvases
   * (e.g. floor plans) get proportionally larger snap zones.
   * Default: `true`. Pass `false` to use a fixed margin regardless of size.
   */
  scaleWithCanvasSize?: boolean;
}

/**
 * Orchestrates object alignment guidelines on a Fabric canvas.
 * Listens to move/scale/resize events and delegates to math and rendering modules.
 */
class ObjectAlignmentGuides {
  private canvas: Canvas;
  private margin: number;
  private scaleWithCanvasSize: boolean;
  private renderConfig: AlignmentRenderConfig;

  private horizontalLines = new Set<string>();
  private verticalLines = new Set<string>();
  private cacheMap = new Map<string, Point[]>();
  private markersOnly = false;

  constructor(canvas: Canvas, opts?: ObjectAlignmentOptions) {
    this.canvas = canvas;
    this.margin = opts?.margin ?? 4;
    this.scaleWithCanvasSize = opts?.scaleWithCanvasSize ?? true;
    this.renderConfig = {
      canvas,
      width: opts?.width ?? 1,
      color: opts?.color ?? 'rgba(255,0,0,0.9)',
      xSize: opts?.xSize ?? 2.4,
      lineDash: opts?.lineDash,
    };

    this.mouseUp = this.mouseUp.bind(this);
    this.onMoving = this.onMoving.bind(this);
    this.onScalingOrResizing = this.onScalingOrResizing.bind(this);
    this.beforeRender = this.beforeRender.bind(this);
    this.afterRender = this.afterRender.bind(this);

    canvas.on('mouse:up', this.mouseUp);
    canvas.on('object:moving', this.onMoving);
    canvas.on('object:scaling', this.onScalingOrResizing);
    canvas.on('object:resizing', this.onScalingOrResizing);
    canvas.on('before:render', this.beforeRender);
    canvas.on('after:render', this.afterRender);
  }

  dispose() {
    this.canvas.off('mouse:up', this.mouseUp);
    this.canvas.off('object:moving', this.onMoving);
    this.canvas.off('object:scaling', this.onScalingOrResizing);
    this.canvas.off('object:resizing', this.onScalingOrResizing);
    this.canvas.off('before:render', this.beforeRender);
    this.canvas.off('after:render', this.afterRender);
  }

  // --- Margin calculation ---

  private readonly BASE_CANVAS_SIZE = 1000;

  private computeMargin(): number {
    const zoom = this.canvas.getZoom();
    const sizeScale = this.scaleWithCanvasSize
      ? Math.max(this.canvas.width ?? 800, this.canvas.height ?? 600) /
        this.BASE_CANVAS_SIZE
      : 1;
    return (this.margin * sizeScale) / zoom;
  }

  // --- Snap point caching ---

  private getCachedSnapPoints(object: FabricObject): Point[] {
    const cacheKey = [
      object.calcTransformMatrix().toString(),
      object.width,
      object.height,
      'points' in object && Array.isArray(object.points)
        ? object.points.length
        : 0,
    ].join();

    const cached = this.cacheMap.get(cacheKey);
    if (cached) return cached;

    const value = getSnapPoints(object);
    this.cacheMap.set(cacheKey, value);
    return value;
  }

  private collectSnapPointsFromTargets(target: FabricObject): Point[] {
    const objects = getAlignmentTargets(target);
    const points: Point[] = [];
    for (const obj of objects) points.push(...this.getCachedSnapPoints(obj));
    return points;
  }

  // --- Event handlers ---

  private mouseUp() {
    this.verticalLines.clear();
    this.horizontalLines.clear();
    this.cacheMap.clear();
    this.canvas.requestRenderAll();
  }

  private onMoving(e: TransformEvent) {
    const target = e.target;
    target.setCoords();
    this.markersOnly = false;
    this.verticalLines.clear();
    this.horizontalLines.clear();

    const points = this.collectSnapPointsFromTargets(target);
    const margin = this.computeMargin();
    const { verticalLines, horizontalLines } = collectMovingAlignmentLines(
      target,
      points,
      margin,
    );
    for (const l of verticalLines) this.verticalLines.add(JSON.stringify(l));
    for (const l of horizontalLines)
      this.horizontalLines.add(JSON.stringify(l));
  }

  private onScalingOrResizing(e: TransformEvent) {
    const target = e.target;
    target.setCoords();
    const isScale = String(e.transform.action).startsWith('scale');
    this.verticalLines.clear();
    this.horizontalLines.clear();

    let corner = e.transform.corner;
    if (target.flipX) {
      if (corner.includes('l')) corner = corner.replace('l', 'r');
      else if (corner.includes('r')) corner = corner.replace('r', 'l');
    }
    if (target.flipY) {
      if (corner.includes('t')) corner = corner.replace('t', 'b');
      else if (corner.includes('b')) corner = corner.replace('b', 't');
    }

    const pointMap = getBoundingPointMap(target);
    if (!(corner in pointMap)) return;

    this.markersOnly = corner.includes('m');
    if (this.markersOnly) {
      if (target.getTotalAngle() % 90 !== 0) return;
    }

    const oppositeMap = getOppositeCornerMap(target);
    const point = pointMap[corner];
    let diagonalPoint = oppositeMap[corner];

    const isCenter =
      e.transform.original.originX === 'center' &&
      e.transform.original.originY === 'center';
    if (isCenter) {
      const p = target.group
        ? point.transform(
            util.invertTransform(target.group.calcTransformMatrix()),
          )
        : point;
      diagonalPoint = diagonalPoint.add(p).scalarDivide(2);
    }

    const uniformIsToggled = e.e[this.canvas.uniScaleKey!];
    let isUniform =
      (this.canvas.uniformScaling && !uniformIsToggled) ||
      (!this.canvas.uniformScaling && uniformIsToggled);
    if (this.markersOnly) isUniform = false;

    const allPoints = this.collectSnapPointsFromTargets(target);
    const margin = this.computeMargin();

    const props = {
      target,
      point,
      diagonalPoint,
      corner,
      list: allPoints,
      isScale,
      isUniform,
      isCenter,
      margin,
    };

    const skipVertical =
      this.markersOnly && (corner.includes('t') || corner.includes('b'));
    const skipHorizontal =
      this.markersOnly && (corner.includes('l') || corner.includes('r'));

    const vList = skipVertical ? [] : collectVerticalSnapOffset(props);
    // Vertical snap may have mutated scaleX (and scaleY for uniform scaling),
    // shifting the active corner's Y position. Refresh point so horizontal snap
    // computes its offset against the post-snap corner location, not the stale one.
    if (vList.length > 0) {
      const updatedPointMap = getBoundingPointMap(target);
      if (corner in updatedPointMap) props.point = updatedPointMap[corner];
    }
    const hList = skipHorizontal ? [] : collectHorizontalSnapOffset(props);

    for (const l of vList) this.verticalLines.add(JSON.stringify(l));
    for (const l of hList) this.horizontalLines.add(JSON.stringify(l));
  }

  // --- Render ---

  private beforeRender() {
    this.canvas.clearContext(this.canvas.contextTop);
  }

  private afterRender() {
    if (this.markersOnly) {
      const lines: AlignmentLine[] = [];
      for (const v of this.verticalLines) lines.push(JSON.parse(v));
      for (const h of this.horizontalLines) lines.push(JSON.parse(h));
      drawMarkerList(this.renderConfig, lines);
    } else {
      drawVerticalAlignmentLines(this.renderConfig, this.verticalLines);
      drawHorizontalAlignmentLines(this.renderConfig, this.horizontalLines);
    }
  }
}

/**
 * Enable object alignment guidelines on a canvas.
 * Draws visual guidelines and snaps objects during movement and scaling.
 * Returns a dispose function for cleanup.
 */
export function enableObjectAlignment(
  canvas: Canvas,
  options?: ObjectAlignmentOptions,
): () => void {
  const alignment = new ObjectAlignmentGuides(canvas, options);
  return () => alignment.dispose();
}
