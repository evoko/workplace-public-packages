import {
  Canvas as FabricCanvas,
  Circle,
  FabricObject,
  Line,
  Point,
  Rect,
} from 'fabric';
import type {
  Point2D,
  ShapeStyleOptions,
  SnappableInteractionOptions,
} from '../types';
import { createPolygonFromVertices } from '../shapes';
import {
  DEFAULT_DRAG_SHAPE_STYLE,
  DEFAULT_GUIDELINE_SHAPE_STYLE,
  DEFAULT_SHAPE_STYLE,
} from '../styles';
import {
  POLYGON_CLOSE_THRESHOLD,
  DEFAULT_ANGLE_SNAP_INTERVAL,
  MIN_DRAG_SIZE,
} from '../constants';
import { restoreViewport, createShiftKeyTracker } from './shared';
import { createInteractionSnapping } from './interactionSnapping';

export interface DrawToCreateOptions extends SnappableInteractionOptions {
  /** Style applied to the polygon being drawn. */
  style?: ShapeStyleOptions;
  /**
   * Metadata to attach to the created polygon. If provided, this is set on
   * the polygon's `data` property after creation. Takes precedence over
   * `style.data` if both are specified.
   */
  data?: FabricObject['data'];
  /**
   * Factory function to create the final object from placed vertices.
   * Receives the canvas and the array of placed points.
   * Default: creates a polygon via `createPolygonFromVertices`.
   */
  factory?: (canvas: FabricCanvas, points: Point2D[]) => FabricObject;
  /**
   * Snap vertex positions to multiples of `interval` degrees when Shift is
   * held while placing a vertex. The angle is measured relative to the
   * previous vertex.
   *
   * Pass `false` to disable. Default: enabled at 15° intervals.
   */
  angleSnap?: boolean | { interval?: number };
  /**
   * When enabled, pressing and dragging (instead of clicking) on the first
   * interaction creates a rectangular polygon from the drag bounds — exactly
   * like {@link enableDragToCreate} behaves for polygons. Shift constrains
   * to a square. Once a vertex has been placed, normal draw behaviour applies.
   *
   * Pass `false` to disable. Default: enabled.
   */
  dragOnHold?: boolean;
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
 * Apply cursor snapping while maintaining an angle constraint.
 * For each axis that cursor-snapped, compute the intersection of the angle
 * ray with that axis value (preserving both angle and axis alignment).
 * Pick the candidate closest to the original position and re-snap there
 * so guidelines render from the correct on-ray point.
 */
function snapAlongRay(
  angleSnapped: { x: number; y: number },
  ref: { x: number; y: number },
  doSnap: (x: number, y: number) => { x: number; y: number },
): { x: number; y: number } {
  const cursorSnapped = doSnap(angleSnapped.x, angleSnapped.y);

  const snappedX = cursorSnapped.x !== angleSnapped.x;
  const snappedY = cursorSnapped.y !== angleSnapped.y;

  if (!snappedX && !snappedY) return angleSnapped;

  const rayDx = angleSnapped.x - ref.x;
  const rayDy = angleSnapped.y - ref.y;

  const candidates: Array<{ x: number; y: number; dist: number }> = [];

  // X-snap: find where the ray crosses x = cursorSnapped.x
  if (snappedX && Math.abs(rayDx) > 1e-9) {
    const t = (cursorSnapped.x - ref.x) / rayDx;
    const onRayY = ref.y + t * rayDy;
    candidates.push({
      x: cursorSnapped.x,
      y: onRayY,
      dist: Math.abs(onRayY - angleSnapped.y),
    });
  }

  // Y-snap: find where the ray crosses y = cursorSnapped.y
  if (snappedY && Math.abs(rayDy) > 1e-9) {
    const t = (cursorSnapped.y - ref.y) / rayDy;
    const onRayX = ref.x + t * rayDx;
    candidates.push({
      x: onRayX,
      y: cursorSnapped.y,
      dist: Math.abs(onRayX - angleSnapped.x),
    });
  }

  if (candidates.length === 0) return angleSnapped;

  // Pick candidate closest to the original angle-snapped position
  candidates.sort((a, b) => a.dist - b.dist);
  const best = candidates[0];

  // Re-snap at the on-ray position so guidelines render correctly
  doSnap(best.x, best.y);

  return best;
}

/**
 * Enable draw mode for polygons.
 * Click to place vertices one by one. A preview shows edges and a tracking line
 * to the cursor. Click near the first vertex (within threshold) to close the
 * polygon once at least 3 points have been placed.
 *
 * When `dragOnHold` is enabled (default), pressing and dragging on the first
 * interaction creates a rectangular polygon from the drag bounds instead of
 * placing individual vertices.
 *
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

  // --- Drag-on-hold state ---
  const dragEnabled = options?.dragOnHold !== false;
  let dragPending = false;
  let isDragMode = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragLastEndX = 0;
  let dragLastEndY = 0;
  let dragPreviewRect: Rect | null = null;

  const computeDragDimensions = (
    endX: number,
    endY: number,
  ): { width: number; height: number } => {
    let width = Math.max(0, endX - dragStartX);
    let height = Math.max(0, endY - dragStartY);
    if (shiftTracker.held) {
      const size = Math.max(width, height);
      width = size;
      height = size;
    }
    return { width, height };
  };

  const updateDragPreview = (endX: number, endY: number) => {
    dragLastEndX = endX;
    dragLastEndY = endY;
    if (!isDragMode || !dragPreviewRect) return;
    const { width, height } = computeDragDimensions(endX, endY);
    dragPreviewRect.set({
      left: dragStartX + width / 2,
      top: dragStartY + height / 2,
      width,
      height,
    });
    dragPreviewRect.setCoords();
    canvas.requestRenderAll();
  };

  const shiftTracker = createShiftKeyTracker(() => {
    if (isDragMode) {
      updateDragPreview(dragLastEndX, dragLastEndY);
    }
  });

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

    const obj = options?.factory
      ? options.factory(canvas, [...points])
      : createPolygonFromVertices(canvas, points, options?.style);
    if (options?.data) {
      obj.data = options.data;
    }
    canvas.selection = previousSelection;
    canvas.requestRenderAll();

    restoreViewport(options?.viewport);
    options?.onCreated?.(obj);
    points.length = 0;
  };

  /** Place a single vertex (extracted so it can be called from both mouseDown and mouseUp). */
  const placeVertex = (x: number, y: number) => {
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

  const handleMouseDown = (event: { scenePoint: Point2D }) => {
    // Drag-on-hold: defer first click to detect click vs drag
    if (dragEnabled && points.length === 0) {
      const snapped = snapping.snap(event.scenePoint.x, event.scenePoint.y);
      dragStartX = snapped.x;
      dragStartY = snapped.y;
      dragLastEndX = dragStartX;
      dragLastEndY = dragStartY;
      dragPending = true;
      snapping.clearSnapResult();
      return;
    }

    // Normal vertex placement with snapping
    let { x, y } = event.scenePoint;
    if (angleSnapEnabled && shiftTracker.held && points.length > 0) {
      const ref = points[points.length - 1];
      const angleSnapped = snapAngleToInterval({ x, y }, ref, angleInterval);
      ({ x, y } = snapAlongRay(angleSnapped, ref, (sx, sy) =>
        snapping.snap(sx, sy),
      ));
    } else {
      ({ x, y } = snapping.snap(x, y));
    }
    snapping.clearSnapResult();

    placeVertex(x, y);
  };

  const handleMouseMove = (event: { scenePoint: Point2D }) => {
    // Drag-on-hold: detect whether the gesture is a drag
    if (dragPending) {
      const dx = Math.abs(event.scenePoint.x - dragStartX);
      const dy = Math.abs(event.scenePoint.y - dragStartY);

      if (dx >= MIN_DRAG_SIZE || dy >= MIN_DRAG_SIZE) {
        isDragMode = true;
        dragPending = false;

        previousSelection = canvas.selection;
        canvas.selection = false;

        dragPreviewRect = new Rect({
          ...DEFAULT_GUIDELINE_SHAPE_STYLE,
          left: dragStartX,
          top: dragStartY,
          width: 0,
          height: 0,
          selectable: false,
          evented: false,
        });
        snapping.excludeSet.add(dragPreviewRect);
        canvas.add(dragPreviewRect);
      }
      return;
    }

    // Drag mode: update preview rect
    if (isDragMode && dragPreviewRect) {
      const { x: endX, y: endY } = snapping.snapWithGuidelines(
        event.scenePoint.x,
        event.scenePoint.y,
      );
      updateDragPreview(endX, endY);
      return;
    }

    // Normal draw mode: update tracking line
    if (points.length === 0) return;

    const lastPoint = points[points.length - 1];
    let { x, y } = event.scenePoint;
    if (angleSnapEnabled && shiftTracker.held) {
      const angleSnapped = snapAngleToInterval(
        { x, y },
        lastPoint,
        angleInterval,
      );
      ({ x, y } = snapAlongRay(angleSnapped, lastPoint, (sx, sy) =>
        snapping.snapWithGuidelines(sx, sy),
      ));
    } else {
      ({ x, y } = snapping.snapWithGuidelines(x, y));
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

  const handleMouseUp = () => {
    if (isDragMode && dragPreviewRect) {
      // Complete drag-to-create
      isDragMode = false;
      snapping.clearSnapResult();

      const { width, height } = computeDragDimensions(
        dragLastEndX,
        dragLastEndY,
      );

      snapping.excludeSet.delete(dragPreviewRect);
      canvas.remove(dragPreviewRect);
      dragPreviewRect = null;

      if (width < MIN_DRAG_SIZE && height < MIN_DRAG_SIZE) {
        // Drag too small — treat as click, place first vertex
        canvas.selection = previousSelection;
        canvas.requestRenderAll();
        placeVertex(dragStartX, dragStartY);
        return;
      }

      const obj = createPolygonFromVertices(
        canvas,
        [
          { x: dragStartX, y: dragStartY },
          { x: dragStartX + width, y: dragStartY },
          { x: dragStartX + width, y: dragStartY + height },
          { x: dragStartX, y: dragStartY + height },
        ],
        options?.style,
      );
      if (options?.data) {
        obj.data = options.data;
      }
      canvas.selection = previousSelection;
      canvas.requestRenderAll();

      restoreViewport(options?.viewport);
      options?.onCreated?.(obj);
      return;
    }

    if (dragPending) {
      // No significant drag — treat as click, place first vertex
      dragPending = false;
      placeVertex(dragStartX, dragStartY);
    }
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
  canvas.on('mouse:up', handleMouseUp);
  document.addEventListener('keydown', handleKeyDown, true);

  function cleanup(reason?: 'cancel') {
    if (exited) return;
    exited = true;

    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown, true);
    shiftTracker.cleanup();

    snapping.cleanup();
    removePreviewElements();

    // Clean up drag preview if interrupted mid-drag
    if (dragPreviewRect) {
      snapping.excludeSet.delete(dragPreviewRect);
      canvas.remove(dragPreviewRect);
      dragPreviewRect = null;
    }

    if (points.length > 0 || isDragMode || dragPending) {
      canvas.selection = previousSelection;
    }
    points.length = 0;
    dragPending = false;
    isDragMode = false;
    canvas.requestRenderAll();
    restoreViewport(options?.viewport);

    if (reason === 'cancel') {
      options?.onCancel?.();
    }
  }

  return () => cleanup();
}
