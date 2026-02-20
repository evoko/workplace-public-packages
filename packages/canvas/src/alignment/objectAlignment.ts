import {
  ActiveSelection,
  type BasicTransformEvent,
  type Canvas,
  type FabricObject,
  Group,
  Point,
  type TOriginX,
  type TOriginY,
  type TPointerEvent,
  util,
} from 'fabric';
import { getSnapPoints } from './snapPoints';

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
}

type TransformEvent = BasicTransformEvent<TPointerEvent> & {
  target: FabricObject;
};

interface LineProps {
  origin: Point;
  target: Point;
}

type OriginMap = Record<string, [TOriginX, TOriginY]>;

// --- Utility functions ---

function getDistance(a: number, b: number) {
  return Math.abs(a - b);
}

function getDistanceList(point: Point, list: Point[], type: 'x' | 'y') {
  let dis = Infinity;
  let arr: Point[] = [];
  for (const item of list) {
    const v = getDistance(point[type], item[type]);
    if (dis > v) {
      arr = [];
      dis = v;
    }
    if (dis === v) {
      arr.push(item);
    }
  }
  return { dis, arr };
}

function getPointMap(target: FabricObject): Record<string, Point> {
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

function getContraryMap(target: FabricObject): Record<string, Point> {
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

function getObjectsByTarget(target: FabricObject): Set<FabricObject> {
  const objects = new Set<FabricObject>();
  const canvas = target.canvas;
  if (!canvas) return objects;

  const children =
    target instanceof ActiveSelection ? target.getObjects() : [target];

  canvas.forEachObject((o) => {
    if (!o.isOnScreen() || !o.visible) return;
    if (o.constructor === Group) {
      collectGroup(objects, o as Group);
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

function collectGroup(objects: Set<FabricObject>, g: Group) {
  for (const child of g.getObjects()) {
    if (!child.visible) continue;
    if (child.constructor === Group) {
      collectGroup(objects, child as Group);
    } else {
      objects.add(child);
    }
  }
}

// --- Core alignment class ---

class ObjectAlignmentGuides {
  private canvas: Canvas;
  private margin: number;
  private width: number;
  private color: string;
  private xSize: number;
  private lineDash: number[] | undefined;

  private horizontalLines = new Set<string>();
  private verticalLines = new Set<string>();
  private cacheMap = new Map<string, Point[]>();
  private onlyDrawPoint = false;

  private contraryOriginMap: OriginMap = {
    tl: ['right', 'bottom'],
    tr: ['left', 'bottom'],
    br: ['left', 'top'],
    bl: ['right', 'top'],
    mt: ['center', 'bottom'],
    mr: ['left', 'center'],
    mb: ['center', 'top'],
    ml: ['right', 'center'],
  };

  constructor(canvas: Canvas, opts?: ObjectAlignmentOptions) {
    this.canvas = canvas;
    this.margin = opts?.margin ?? 4;
    this.width = opts?.width ?? 1;
    this.color = opts?.color ?? 'rgba(255,0,0,0.9)';
    this.xSize = opts?.xSize ?? 2.4;
    this.lineDash = opts?.lineDash;

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
    this.onlyDrawPoint = false;
    this.verticalLines.clear();
    this.horizontalLines.clear();

    const objects = getObjectsByTarget(target);
    const points: Point[] = [];
    for (const obj of objects) points.push(...this.getCachedSnapPoints(obj));

    const { vLines, hLines } = this.collectMovingLines(target, points);
    for (const l of vLines) this.verticalLines.add(JSON.stringify(l));
    for (const l of hLines) this.horizontalLines.add(JSON.stringify(l));
  }

  private onScalingOrResizing(e: TransformEvent) {
    const target = e.target;
    target.setCoords();
    const isScale = String(e.transform.action).startsWith('scale');
    this.verticalLines.clear();
    this.horizontalLines.clear();

    const objects = getObjectsByTarget(target);

    let corner = e.transform.corner;
    if (target.flipX) {
      if (corner.includes('l')) corner = corner.replace('l', 'r');
      else if (corner.includes('r')) corner = corner.replace('r', 'l');
    }
    if (target.flipY) {
      if (corner.includes('t')) corner = corner.replace('t', 'b');
      else if (corner.includes('b')) corner = corner.replace('b', 't');
    }

    const pointMap = getPointMap(target);
    if (!(corner in pointMap)) return;

    this.onlyDrawPoint = corner.includes('m');
    if (this.onlyDrawPoint) {
      if (target.getTotalAngle() % 90 !== 0) return;
    }

    const contraryMap = getContraryMap(target);
    const point = pointMap[corner];
    let diagonalPoint = contraryMap[corner];

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
    if (this.onlyDrawPoint) isUniform = false;

    const allPoints: Point[] = [];
    for (const obj of objects) allPoints.push(...this.getCachedSnapPoints(obj));

    const props = {
      target,
      point,
      diagonalPoint,
      corner,
      list: allPoints,
      isScale,
      isUniform,
      isCenter,
    };

    const noNeedToCollectV =
      this.onlyDrawPoint && (corner.includes('t') || corner.includes('b'));
    const noNeedToCollectH =
      this.onlyDrawPoint && (corner.includes('l') || corner.includes('r'));

    const vList = noNeedToCollectV ? [] : this.collectVerticalPoint(props);
    const hList = noNeedToCollectH ? [] : this.collectHorizontalPoint(props);

    for (const l of vList) this.verticalLines.add(JSON.stringify(l));
    for (const l of hList) this.horizontalLines.add(JSON.stringify(l));
  }

  // --- Render ---

  private beforeRender() {
    this.canvas.clearContext(this.canvas.contextTop);
  }

  private afterRender() {
    if (this.onlyDrawPoint) {
      this.drawPointList();
    } else {
      this.drawVerticalLines();
      this.drawHorizontalLines();
    }
  }

  // --- Moving alignment ---

  private collectMovingLines(target: FabricObject, points: Point[]) {
    const list = target.getCoords();
    list.push(target.getCenterPoint());
    const margin = this.margin / this.canvas.getZoom();
    const opts = { target, list, points, margin };
    const vLines = this.collectMovingPoints({ ...opts, type: 'x' });
    const hLines = this.collectMovingPoints({ ...opts, type: 'y' });
    return { vLines, hLines };
  }

  private static readonly ORIGIN_ARR: [TOriginX, TOriginY][] = [
    ['left', 'top'],
    ['right', 'top'],
    ['right', 'bottom'],
    ['left', 'bottom'],
    ['center', 'center'],
  ];

  private collectMovingPoints(props: {
    target: FabricObject;
    list: Point[];
    points: Point[];
    margin: number;
    type: 'x' | 'y';
  }): LineProps[] {
    const { target, list, points, margin, type } = props;
    const res: LineProps[] = [];
    const arr: ReturnType<typeof getDistanceList>[] = [];
    let min = Infinity;

    for (const item of list) {
      const o = getDistanceList(item, points, type);
      arr.push(o);
      if (min > o.dis) min = o.dis;
    }
    if (min > margin) return res;

    let snapped = false;
    for (let i = 0; i < list.length; i++) {
      if (arr[i].dis !== min) continue;
      for (const item of arr[i].arr) {
        res.push({ origin: list[i], target: item });
      }

      if (snapped) continue;
      snapped = true;
      const d = arr[i].arr[0][type] - list[i][type];
      list.forEach((item) => {
        item[type] += d;
      });
      target.setXY(list[i], ...ObjectAlignmentGuides.ORIGIN_ARR[i]);
      target.setCoords();
    }

    return res;
  }

  // --- Scaling alignment ---

  private collectVerticalPoint(props: {
    target: FabricObject;
    point: Point;
    diagonalPoint: Point;
    list: Point[];
    isScale: boolean;
    isUniform: boolean;
    isCenter: boolean;
    corner: string;
  }): LineProps[] {
    const {
      target,
      isScale,
      isUniform,
      corner,
      point,
      diagonalPoint,
      list,
      isCenter,
    } = props;
    const { dis, arr } = getDistanceList(point, list, 'x');
    const margin = this.margin / this.canvas.getZoom();
    if (dis > margin) return [];

    let v = arr[arr.length - 1].x - point.x;
    const dirX = corner.includes('l') ? -1 : 1;
    v *= dirX;

    const { width, height, scaleX, scaleY } = target;
    const dStrokeWidth = target.strokeUniform ? 0 : target.strokeWidth;
    const scaleWidth = scaleX * width + dStrokeWidth;
    const sx = (v + scaleWidth) / scaleWidth;
    if (sx === 0) return [];

    if (isScale) {
      target.set('scaleX', scaleX * sx);
      if (isUniform) target.set('scaleY', scaleY * sx);
    } else {
      target.set('width', width * sx);
      if (isUniform) target.set('height', height * sx);
    }

    if (isCenter) {
      target.setRelativeXY(diagonalPoint, 'center', 'center');
    } else {
      target.setRelativeXY(diagonalPoint, ...this.contraryOriginMap[corner]);
    }
    target.setCoords();

    return arr.map((t) => ({ origin: point, target: t }));
  }

  private collectHorizontalPoint(props: {
    target: FabricObject;
    point: Point;
    diagonalPoint: Point;
    list: Point[];
    isScale: boolean;
    isUniform: boolean;
    isCenter: boolean;
    corner: string;
  }): LineProps[] {
    const {
      target,
      isScale,
      isUniform,
      corner,
      point,
      diagonalPoint,
      list,
      isCenter,
    } = props;
    const { dis, arr } = getDistanceList(point, list, 'y');
    const margin = this.margin / this.canvas.getZoom();
    if (dis > margin) return [];

    let v = arr[arr.length - 1].y - point.y;
    const dirY = corner.includes('t') ? -1 : 1;
    v *= dirY;

    const { width, height, scaleX, scaleY } = target;
    const dStrokeWidth = target.strokeUniform ? 0 : target.strokeWidth;
    const scaleHeight = scaleY * height + dStrokeWidth;
    const sy = (v + scaleHeight) / scaleHeight;
    if (sy === 0) return [];

    if (isScale) {
      target.set('scaleY', scaleY * sy);
      if (isUniform) target.set('scaleX', scaleX * sy);
    } else {
      target.set('height', height * sy);
      if (isUniform) target.set('width', width * sy);
    }

    if (isCenter) {
      target.setRelativeXY(diagonalPoint, 'center', 'center');
    } else {
      target.setRelativeXY(diagonalPoint, ...this.contraryOriginMap[corner]);
    }
    target.setCoords();

    return arr.map((t) => ({ origin: point, target: t }));
  }

  // --- Drawing ---

  private drawLine(origin: Point, target: Point) {
    const ctx = this.canvas.getTopContext();
    const vt = this.canvas.viewportTransform;
    const zoom = this.canvas.getZoom();
    ctx.save();
    ctx.transform(...vt);
    ctx.lineWidth = this.width / zoom;
    if (this.lineDash) ctx.setLineDash(this.lineDash);
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    if (this.lineDash) ctx.setLineDash([]);
    this.drawXMarker(origin);
    this.drawXMarker(target);
    ctx.restore();
  }

  private drawXMarker(point: Point) {
    const ctx = this.canvas.getTopContext();
    const zoom = this.canvas.getZoom();
    const size = this.xSize / zoom;
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

  private drawPointList() {
    const list: LineProps[] = [];
    for (const v of this.verticalLines) list.push(JSON.parse(v));
    for (const h of this.horizontalLines) list.push(JSON.parse(h));

    const ctx = this.canvas.getTopContext();
    const vt = this.canvas.viewportTransform;
    const zoom = this.canvas.getZoom();
    ctx.save();
    ctx.transform(...vt);
    ctx.lineWidth = this.width / zoom;
    ctx.strokeStyle = this.color;
    for (const item of list) this.drawXMarker(item.target);
    ctx.restore();
  }

  private drawVerticalLines() {
    for (const v of this.verticalLines) {
      const { origin, target } = JSON.parse(v);
      const o = new Point(target.x, origin.y);
      this.drawLine(o, target);
    }
  }

  private drawHorizontalLines() {
    for (const h of this.horizontalLines) {
      const { origin, target } = JSON.parse(h);
      const o = new Point(origin.x, target.y);
      this.drawLine(o, target);
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
