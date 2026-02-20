import {
  Canvas as FabricCanvas,
  Circle,
  FabricObject,
  Line,
  Rect,
} from 'fabric';
import type { ViewportController } from './viewportActions';
import {
  createPolygonFromVertices,
  type PolygonStyleOptions,
} from './polygonActions';
import {
  DEFAULT_DRAG_SHAPE_STYLE,
  DEFAULT_GUIDELINE_SHAPE_STYLE,
  DEFAULT_SHAPE_STYLE,
} from './defaultStyles';

export interface InteractionModeOptions {
  onCreated?: (obj: FabricObject) => void;
  viewport?: ViewportController;
}

export interface DragToCreateOptions extends InteractionModeOptions {
  /** Style applied to the preview rectangle shown during drag. */
  previewStyle?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
  };
}

export interface DrawToCreateOptions {
  style?: PolygonStyleOptions;
  onCreated?: (polygon: ReturnType<typeof createPolygonFromVertices>) => void;
  viewport?: ViewportController;
}

/** Restore the viewport to select mode if a controller was provided. */
function restoreViewport(viewport?: ViewportController) {
  if (!viewport) return;
  viewport.setEnabled(true);
  viewport.setMode('select');
}

const MIN_DRAG_SIZE = 3;
const CLOSE_THRESHOLD = 10;

/**
 * Enable click-to-create mode.
 * Each click calls the factory with the canvas and the click point.
 * The factory creates and adds the object to the canvas, returning it.
 * Returns a cleanup function that disables the mode.
 */
export function enableClickToCreate(
  canvas: FabricCanvas,
  factory: (
    canvas: FabricCanvas,
    point: { x: number; y: number },
  ) => FabricObject,
  options?: InteractionModeOptions,
): () => void {
  options?.viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: { x: number; y: number } }) => {
    const obj = factory(canvas, event.scenePoint);
    restoreViewport(options?.viewport);
    options?.onCreated?.(obj);
  };

  canvas.on('mouse:down', handleMouseDown);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    restoreViewport(options?.viewport);
  };
}

/**
 * Enable drag-to-create mode.
 * A preview rectangle is shown while dragging. On mouse-up the factory
 * receives the drag bounds and creates the final object.
 * Returns a cleanup function that disables the mode.
 */
export function enableDragToCreate(
  canvas: FabricCanvas,
  factory: (
    canvas: FabricCanvas,
    bounds: { startX: number; startY: number; width: number; height: number },
  ) => FabricObject,
  options?: DragToCreateOptions,
): () => void {
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let previewRect: Rect | null = null;
  let previousSelection: boolean;

  options?.viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: { x: number; y: number } }) => {
    isDrawing = true;
    startX = event.scenePoint.x;
    startY = event.scenePoint.y;

    previousSelection = canvas.selection;
    canvas.selection = false;

    previewRect = new Rect({
      ...DEFAULT_GUIDELINE_SHAPE_STYLE,
      left: startX,
      top: startY,
      width: 0,
      height: 0,
      ...options?.previewStyle,
      selectable: false,
      evented: false,
    });
    canvas.add(previewRect);
  };

  const handleMouseMove = (event: { scenePoint: { x: number; y: number } }) => {
    if (!isDrawing || !previewRect) return;

    const width = Math.max(0, event.scenePoint.x - startX);
    const height = Math.max(0, event.scenePoint.y - startY);

    previewRect.set({
      left: startX + width / 2,
      top: startY + height / 2,
      width,
      height,
    });
    previewRect.setCoords();
    canvas.requestRenderAll();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !previewRect) return;

    isDrawing = false;
    canvas.selection = previousSelection;

    const width = previewRect.width ?? 0;
    const height = previewRect.height ?? 0;

    canvas.remove(previewRect);

    if (width < MIN_DRAG_SIZE && height < MIN_DRAG_SIZE) {
      canvas.requestRenderAll();
      previewRect = null;
      return;
    }

    const obj = factory(canvas, { startX, startY, width, height });
    restoreViewport(options?.viewport);
    options?.onCreated?.(obj);
    previewRect = null;
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);

    if (isDrawing && previewRect) {
      canvas.remove(previewRect);
      canvas.requestRenderAll();
    }
    restoreViewport(options?.viewport);
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
  const points: Array<{ x: number; y: number }> = [];
  const markers: Circle[] = [];
  const edgeLines: Line[] = [];
  let trackingLine: Line | null = null;
  let closingLine: Line | null = null;
  let previousSelection: boolean;

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
    }
    markers.length = 0;

    for (const line of edgeLines) {
      canvas.remove(line);
    }
    edgeLines.length = 0;

    if (trackingLine) {
      canvas.remove(trackingLine);
      trackingLine = null;
    }
    if (closingLine) {
      canvas.remove(closingLine);
      closingLine = null;
    }
  };

  const finalize = () => {
    removePreviewElements();

    const polygon = createPolygonFromVertices(canvas, points, options?.style);
    canvas.selection = previousSelection;
    canvas.requestRenderAll();

    restoreViewport(options?.viewport);
    options?.onCreated?.(polygon);
    points.length = 0;
  };

  const handleMouseDown = (event: { scenePoint: { x: number; y: number } }) => {
    const x = event.scenePoint.x;
    const y = event.scenePoint.y;

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
    canvas.add(marker);

    // Add edge line from previous vertex to this one
    if (points.length >= 2) {
      const prev = points[points.length - 2];
      const edge = new Line([prev.x, prev.y, x, y], lineStyle);
      edgeLines.push(edge);
      canvas.add(edge);
    }

    canvas.requestRenderAll();
  };

  const handleMouseMove = (event: { scenePoint: { x: number; y: number } }) => {
    if (points.length === 0) return;

    const lastPoint = points[points.length - 1];
    const x = event.scenePoint.x;
    const y = event.scenePoint.y;

    // Update tracking line from last vertex to cursor
    if (trackingLine) {
      canvas.remove(trackingLine);
    }
    trackingLine = new Line([lastPoint.x, lastPoint.y, x, y], {
      ...guideLineStyle,
      strokeDashArray: [5, 5],
    });
    canvas.add(trackingLine);

    // Show closing line from cursor to first vertex when 3+ points
    if (closingLine) {
      canvas.remove(closingLine);
      closingLine = null;
    }
    if (points.length >= 3) {
      closingLine = new Line([x, y, points[0].x, points[0].y], {
        ...guideLineStyle,
        strokeDashArray: [5, 5],
      });
      canvas.add(closingLine);
    }

    canvas.requestRenderAll();
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);

    removePreviewElements();
    if (points.length > 0) {
      canvas.selection = previousSelection;
    }
    points.length = 0;
    canvas.requestRenderAll();
    restoreViewport(options?.viewport);
  };
}
