import {
  Canvas as FabricCanvas,
  Circle,
  FabricObject,
  Line,
  Point,
} from 'fabric';
import type { Point2D } from '../fabric';
import type { ViewportController } from '../viewport';
import { createPolygonFromVertices, type PolygonStyleOptions } from '../shapes';
import {
  DEFAULT_DRAG_SHAPE_STYLE,
  DEFAULT_GUIDELINE_SHAPE_STYLE,
  DEFAULT_SHAPE_STYLE,
} from '../styles';
import { restoreViewport } from './shared';
import {
  clearCursorGuidelines,
  drawCursorGuidelines,
  getSnapPoints,
  snapCursorPoint,
  type GuidelineStyle,
} from '../alignment';

export interface DrawToCreateOptions {
  style?: PolygonStyleOptions;
  onCreated?: (polygon: ReturnType<typeof createPolygonFromVertices>) => void;
  viewport?: ViewportController;
  /** Enable cursor snapping during polygon drawing. Pass `true` for defaults or an options object. */
  snapping?:
    | boolean
    | {
        /** Snap margin in screen pixels. Default: 6. */
        margin?: number;
        /** Custom guideline style. */
        guidelineStyle?: GuidelineStyle;
      };
}

const CLOSE_THRESHOLD = 10;

/**
 * Enable draw mode for polygons.
 * Click to place vertices one by one. A preview shows edges and a tracking line
 * to the cursor. Click near the first vertex (within threshold) to close the
 * polygon once at least 3 points have been placed.
 * Returns a cleanup function that disables the mode.
 */
export function enableDrawToCreate(
  canvas: FabricCanvas,
  options?: DrawToCreateOptions,
): () => void {
  const points: Point2D[] = [];
  const markers: Circle[] = [];
  const edgeLines: Line[] = [];
  let trackingLine: Line | null = null;
  let closingLine: Line | null = null;
  let previousSelection: boolean;

  // Snapping setup
  const snapEnabled =
    options?.snapping !== undefined && options?.snapping !== false;
  const snapMargin =
    typeof options?.snapping === 'object' ? options.snapping.margin : undefined;
  const guidelineStyle =
    typeof options?.snapping === 'object'
      ? options.snapping.guidelineStyle
      : undefined;
  const previewElements = new Set<FabricObject>();
  let cachedTargetPoints: Point[] | null = null;

  function getTargetPoints(): Point[] {
    if (cachedTargetPoints) return cachedTargetPoints;
    cachedTargetPoints = [];
    canvas.forEachObject((obj) => {
      if (!obj.visible) return;
      if (previewElements.has(obj)) return;
      cachedTargetPoints!.push(...getSnapPoints(obj));
    });
    return cachedTargetPoints;
  }

  const invalidateCache = () => {
    cachedTargetPoints = null;
  };

  if (snapEnabled) {
    canvas.on('object:added', invalidateCache);
    canvas.on('object:removed', invalidateCache);
  }

  function snapPoint(rawX: number, rawY: number): { x: number; y: number } {
    if (!snapEnabled) return { x: rawX, y: rawY };

    // Add first vertex as extra snap target when 3+ points (easier closing)
    let targetPoints = getTargetPoints();
    if (points.length >= 3) {
      targetPoints = [...targetPoints, new Point(points[0].x, points[0].y)];
    }

    const result = snapCursorPoint(canvas, new Point(rawX, rawY), {
      margin: snapMargin,
      exclude: previewElements,
      targetPoints,
    });
    return { x: result.point.x, y: result.point.y };
  }

  function snapPointWithGuidelines(
    rawX: number,
    rawY: number,
  ): { x: number; y: number } {
    if (!snapEnabled) return { x: rawX, y: rawY };

    let targetPoints = getTargetPoints();
    if (points.length >= 3) {
      targetPoints = [...targetPoints, new Point(points[0].x, points[0].y)];
    }

    clearCursorGuidelines(canvas);
    const result = snapCursorPoint(canvas, new Point(rawX, rawY), {
      margin: snapMargin,
      exclude: previewElements,
      targetPoints,
    });
    drawCursorGuidelines(canvas, result, guidelineStyle);
    return { x: result.point.x, y: result.point.y };
  }

  options?.viewport?.setEnabled(false);

  const lineStyle = {
    stroke: options?.style?.stroke ?? DEFAULT_DRAG_SHAPE_STYLE.stroke,
    strokeWidth:
      options?.style?.strokeWidth ?? DEFAULT_DRAG_SHAPE_STYLE.strokeWidth,
    selectable: false,
    evented: false,
  };

  const guideLineStyle = {
    stroke: options?.style?.stroke ?? DEFAULT_GUIDELINE_SHAPE_STYLE.stroke,
    strokeWidth:
      options?.style?.strokeWidth ?? DEFAULT_GUIDELINE_SHAPE_STYLE.strokeWidth,
    selectable: false,
    evented: false,
  } as const;

  const removePreviewElements = () => {
    for (const marker of markers) {
      canvas.remove(marker);
      previewElements.delete(marker);
    }
    markers.length = 0;

    for (const line of edgeLines) {
      canvas.remove(line);
      previewElements.delete(line);
    }
    edgeLines.length = 0;

    if (trackingLine) {
      canvas.remove(trackingLine);
      previewElements.delete(trackingLine);
      trackingLine = null;
    }
    if (closingLine) {
      canvas.remove(closingLine);
      previewElements.delete(closingLine);
      closingLine = null;
    }
  };

  const finalize = () => {
    removePreviewElements();
    clearCursorGuidelines(canvas);

    const polygon = createPolygonFromVertices(canvas, points, options?.style);
    canvas.selection = previousSelection;
    canvas.requestRenderAll();

    restoreViewport(options?.viewport);
    options?.onCreated?.(polygon);
    points.length = 0;
  };

  const handleMouseDown = (event: { scenePoint: Point2D }) => {
    const { x, y } = snapPoint(event.scenePoint.x, event.scenePoint.y);

    // Close the polygon if clicking near the first vertex with 3+ points
    if (points.length >= 3) {
      const dx = x - points[0].x;
      const dy = y - points[0].y;
      if (Math.sqrt(dx * dx + dy * dy) <= CLOSE_THRESHOLD) {
        finalize();
        return;
      }
    }

    // Disable selection on first point
    if (points.length === 0) {
      previousSelection = canvas.selection;
      canvas.selection = false;
    }

    points.push({ x, y });

    // Add vertex marker
    const marker = new Circle({
      left: x,
      top: y,
      radius: 4,
      fill: DEFAULT_SHAPE_STYLE.stroke,
      stroke: DEFAULT_SHAPE_STYLE.stroke,
      strokeWidth: 1,
      selectable: false,
      evented: false,
    });
    markers.push(marker);
    previewElements.add(marker);
    canvas.add(marker);

    // Add edge line from previous vertex to this one
    if (points.length >= 2) {
      const prev = points[points.length - 2];
      const edge = new Line([prev.x, prev.y, x, y], lineStyle);
      edgeLines.push(edge);
      previewElements.add(edge);
      canvas.add(edge);
    }

    canvas.requestRenderAll();
  };

  const handleMouseMove = (event: { scenePoint: Point2D }) => {
    if (points.length === 0) return;

    const lastPoint = points[points.length - 1];
    const { x, y } = snapPointWithGuidelines(
      event.scenePoint.x,
      event.scenePoint.y,
    );

    // Update tracking line from last vertex to cursor
    if (trackingLine) {
      previewElements.delete(trackingLine);
      canvas.remove(trackingLine);
    }
    trackingLine = new Line([lastPoint.x, lastPoint.y, x, y], {
      ...guideLineStyle,
      strokeDashArray: [5, 5],
    });
    previewElements.add(trackingLine);
    canvas.add(trackingLine);

    // Show closing line from cursor to first vertex when 3+ points
    if (closingLine) {
      previewElements.delete(closingLine);
      canvas.remove(closingLine);
      closingLine = null;
    }
    if (points.length >= 3) {
      closingLine = new Line([x, y, points[0].x, points[0].y], {
        ...guideLineStyle,
        strokeDashArray: [5, 5],
      });
      previewElements.add(closingLine);
      canvas.add(closingLine);
    }

    canvas.requestRenderAll();
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);

    if (snapEnabled) {
      canvas.off('object:added', invalidateCache);
      canvas.off('object:removed', invalidateCache);
    }

    removePreviewElements();
    clearCursorGuidelines(canvas);
    if (points.length > 0) {
      canvas.selection = previousSelection;
    }
    points.length = 0;
    canvas.requestRenderAll();
    restoreViewport(options?.viewport);
  };
}
