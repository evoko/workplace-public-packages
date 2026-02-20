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
import { restoreViewport } from './shared';
import { createInteractionSnapping } from './interactionSnapping';

export interface DrawToCreateOptions extends SnappableInteractionOptions {
  /** Style applied to the polygon being drawn. */
  style?: PolygonStyleOptions;
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
    const { x, y } = snapping.snap(event.scenePoint.x, event.scenePoint.y);
    snapping.clearSnapResult();

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
    const { x, y } = snapping.snapWithGuidelines(
      event.scenePoint.x,
      event.scenePoint.y,
    );

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

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);

    snapping.cleanup();
    removePreviewElements();

    if (points.length > 0) {
      canvas.selection = previousSelection;
    }
    points.length = 0;
    canvas.requestRenderAll();
    restoreViewport(options?.viewport);
  };
}
