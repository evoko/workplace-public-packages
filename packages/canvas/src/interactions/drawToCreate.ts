import {
  Canvas as FabricCanvas,
  Circle,
  FabricObject,
  Line,
  Point,
} from 'fabric';
import type { Point2D, SnappableInteractionOptions } from '../types';
import { createPolygonFromVertices, type PolygonStyleOptions } from '../shapes';
import {
  DEFAULT_DRAG_SHAPE_STYLE,
  DEFAULT_GUIDELINE_SHAPE_STYLE,
  DEFAULT_SHAPE_STYLE,
} from '../styles';
import {
  POLYGON_CLOSE_THRESHOLD,
  DEFAULT_ANGLE_SNAP_INTERVAL,
} from '../constants';
import { restoreViewport, createShiftKeyTracker } from './shared';
import { createInteractionSnapping } from './interactionSnapping';

export interface DrawToCreateOptions extends SnappableInteractionOptions {
  /** Style applied to the polygon being drawn. */
  style?: PolygonStyleOptions;
  /**
   * Snap vertex positions to multiples of `interval` degrees when Shift is
   * held while placing a vertex. The angle is measured relative to the
   * previous vertex.
   *
   * Pass `false` to disable. Default: enabled at 15° intervals.
   */
  angleSnap?: boolean | { interval?: number };
  /** Called when the user cancels drawing via Escape or Backspace. */
  onCancel?: () => void;
}

function snapAngleToInterval(
  point: { x: number; y: number },
  ref: { x: number; y: number },
  intervalDeg: number,
): { x: number; y: number } {
  const dx = point.x - ref.x;
  const dy = point.y - ref.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return point;
  const radInterval = (intervalDeg * Math.PI) / 180;
  const snappedAngle =
    Math.round(Math.atan2(dy, dx) / radInterval) * radInterval;
  return {
    x: ref.x + Math.cos(snappedAngle) * dist,
    y: ref.y + Math.sin(snappedAngle) * dist,
  };
}

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
  let exited = false;

  const angleSnapEnabled = options?.angleSnap !== false;
  const angleInterval =
    typeof options?.angleSnap === 'object'
      ? (options.angleSnap.interval ?? DEFAULT_ANGLE_SNAP_INTERVAL)
      : DEFAULT_ANGLE_SNAP_INTERVAL;

  const shiftTracker = createShiftKeyTracker();

  const points: Point2D[] = [];
  const markers: Circle[] = [];
  const edgeLines: Line[] = [];
  let trackingLine: Line | null = null;
  let closingLine: Line | null = null;
  let previousSelection: boolean;

  // Use shared snapping context, with placed vertices as additional snap targets
  const snapping = createInteractionSnapping(canvas, options, () =>
    points.map((p) => new Point(p.x, p.y)),
  );

  /** Track a preview element in the snapping exclude set. */
  function trackPreviewElement(obj: FabricObject) {
    snapping.excludeSet.add(obj);
  }
  function untrackPreviewElement(obj: FabricObject) {
    snapping.excludeSet.delete(obj);
  }

  options?.viewport?.setEnabled(false);

  const lineStyle = {
    stroke: options?.style?.stroke ?? DEFAULT_DRAG_SHAPE_STYLE.stroke,
    strokeWidth:
      options?.style?.strokeWidth ?? DEFAULT_DRAG_SHAPE_STYLE.strokeWidth,
    strokeUniform: true,
    selectable: false,
    evented: false,
  };

  const guideLineStyle = {
    stroke: options?.style?.stroke ?? DEFAULT_GUIDELINE_SHAPE_STYLE.stroke,
    strokeWidth:
      options?.style?.strokeWidth ?? DEFAULT_GUIDELINE_SHAPE_STYLE.strokeWidth,
    strokeUniform: true,
    selectable: false,
    evented: false,
  } as const;

  const removePreviewElements = () => {
    for (const marker of markers) {
      canvas.remove(marker);
      untrackPreviewElement(marker);
    }
    markers.length = 0;

    for (const line of edgeLines) {
      canvas.remove(line);
      untrackPreviewElement(line);
    }
    edgeLines.length = 0;

    if (trackingLine) {
      canvas.remove(trackingLine);
      untrackPreviewElement(trackingLine);
      trackingLine = null;
    }
    if (closingLine) {
      canvas.remove(closingLine);
      untrackPreviewElement(closingLine);
      closingLine = null;
    }
  };

  const finalize = () => {
    removePreviewElements();
    snapping.clearSnapResult();

    const polygon = createPolygonFromVertices(canvas, points, options?.style);
    canvas.selection = previousSelection;
    canvas.requestRenderAll();

    restoreViewport(options?.viewport);
    options?.onCreated?.(polygon);
    points.length = 0;
  };

  const handleMouseDown = (event: { scenePoint: Point2D }) => {
    let { x, y } = snapping.snap(event.scenePoint.x, event.scenePoint.y);
    if (angleSnapEnabled && shiftTracker.held && points.length > 0) {
      ({ x, y } = snapAngleToInterval(
        { x, y },
        points[points.length - 1],
        angleInterval,
      ));
    }
    snapping.clearSnapResult();

    // Close the polygon if clicking near the first vertex with 3+ points
    if (points.length >= 3) {
      const dx = x - points[0].x;
      const dy = y - points[0].y;
      if (Math.sqrt(dx * dx + dy * dy) <= POLYGON_CLOSE_THRESHOLD) {
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
      strokeUniform: true,
      selectable: false,
      evented: false,
    });
    markers.push(marker);
    trackPreviewElement(marker);
    canvas.add(marker);

    // Add edge line from previous vertex to this one
    if (points.length >= 2) {
      const prev = points[points.length - 2];
      const edge = new Line([prev.x, prev.y, x, y], lineStyle);
      edgeLines.push(edge);
      trackPreviewElement(edge);
      canvas.add(edge);
    }

    canvas.requestRenderAll();
  };

  const handleMouseMove = (event: { scenePoint: Point2D }) => {
    if (points.length === 0) return;

    const lastPoint = points[points.length - 1];
    let { x, y } = snapping.snapWithGuidelines(
      event.scenePoint.x,
      event.scenePoint.y,
    );
    if (angleSnapEnabled && shiftTracker.held) {
      ({ x, y } = snapAngleToInterval({ x, y }, lastPoint, angleInterval));
      // Cursor-snap guideline is now at a different position than the
      // angle-snapped tracking line — clear it to avoid visual confusion.
      snapping.clearSnapResult();
    }

    // Update tracking line from last vertex to cursor
    if (trackingLine) {
      untrackPreviewElement(trackingLine);
      canvas.remove(trackingLine);
    }
    trackingLine = new Line([lastPoint.x, lastPoint.y, x, y], {
      ...guideLineStyle,
      strokeDashArray: [5, 5],
    });
    trackPreviewElement(trackingLine);
    canvas.add(trackingLine);

    // Show closing line from cursor to first vertex when 3+ points
    if (closingLine) {
      untrackPreviewElement(closingLine);
      canvas.remove(closingLine);
      closingLine = null;
    }
    if (points.length >= 3) {
      closingLine = new Line([x, y, points[0].x, points[0].y], {
        ...guideLineStyle,
        strokeDashArray: [5, 5],
      });
      trackPreviewElement(closingLine);
      canvas.add(closingLine);
    }

    canvas.requestRenderAll();
  };

  // Cancel drawing on Escape or Backspace (capture phase to prevent other handlers)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      e.stopImmediatePropagation();
      e.preventDefault();
      cleanup('cancel');
    }
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  document.addEventListener('keydown', handleKeyDown, true);

  function cleanup(reason?: 'cancel') {
    if (exited) return;
    exited = true;

    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    document.removeEventListener('keydown', handleKeyDown, true);
    shiftTracker.cleanup();

    snapping.cleanup();
    removePreviewElements();

    if (points.length > 0) {
      canvas.selection = previousSelection;
    }
    points.length = 0;
    canvas.requestRenderAll();
    restoreViewport(options?.viewport);

    if (reason === 'cancel') {
      options?.onCancel?.();
    }
  }

  return () => cleanup();
}
