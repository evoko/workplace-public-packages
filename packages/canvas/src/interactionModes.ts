import { Canvas as FabricCanvas, Circle, Line, Polygon, Rect } from 'fabric';
import type { ViewportController } from './viewportActions';

export interface CreateModeDefaults {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

/** Restore the viewport to select mode if a controller was provided. */
function restoreViewport(viewport?: ViewportController) {
  if (!viewport) return;
  viewport.setEnabled(true);
  viewport.setMode('select');
}

/**
 * Enable click-to-place mode.
 * Each click on the canvas creates a rectangle of preset size at the clicked position.
 * Returns a cleanup function that disables the mode.
 */
export function enableClickToCreate(
  canvas: FabricCanvas,
  defaults: CreateModeDefaults & { width: number; height: number },
  onCreated?: (rect: Rect) => void,
  viewport?: ViewportController,
): () => void {
  const { width, height, ...style } = defaults;

  viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: { x: number; y: number } }) => {
    const rect = new Rect({
      left: event.scenePoint.x,
      top: event.scenePoint.y,
      width,
      height,
      ...style,
    });
    canvas.add(rect);
    canvas.requestRenderAll();
    restoreViewport(viewport);
    onCreated?.(rect);
  };

  canvas.on('mouse:down', handleMouseDown);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    restoreViewport(viewport);
  };
}

const MIN_DRAG_SIZE = 3;

/**
 * Enable drag-to-draw mode.
 * User holds mouse down and drags to define the rectangle dimensions.
 * Returns a cleanup function that disables the mode.
 */
export function enableDragToCreate(
  canvas: FabricCanvas,
  defaults?: CreateModeDefaults,
  onCreated?: (rect: Rect) => void,
  viewport?: ViewportController,
): () => void {
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let activeRect: Rect | null = null;
  let previousSelection: boolean;

  viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: { x: number; y: number } }) => {
    isDrawing = true;
    startX = event.scenePoint.x;
    startY = event.scenePoint.y;

    previousSelection = canvas.selection;
    canvas.selection = false;

    activeRect = new Rect({
      left: startX,
      top: startY,
      width: 0,
      height: 0,
      ...defaults,
      selectable: false,
      evented: false,
    });
    canvas.add(activeRect);
  };

  const handleMouseMove = (event: { scenePoint: { x: number; y: number } }) => {
    if (!isDrawing || !activeRect) {
      return;
    }

    const currentX = event.scenePoint.x;
    const currentY = event.scenePoint.y;

    const width = Math.max(0, currentX - startX);
    const height = Math.max(0, currentY - startY);

    activeRect.set({
      left: startX + width / 2,
      top: startY + height / 2,
      width,
      height,
    });
    activeRect.setCoords();
    canvas.requestRenderAll();
  };

  const handleMouseUp = () => {
    if (!isDrawing || !activeRect) {
      return;
    }

    isDrawing = false;
    canvas.selection = previousSelection;

    const width = activeRect.width ?? 0;
    const height = activeRect.height ?? 0;

    if (width < MIN_DRAG_SIZE && height < MIN_DRAG_SIZE) {
      canvas.remove(activeRect);
      canvas.requestRenderAll();
      activeRect = null;
      return;
    }

    activeRect.set({ selectable: true, evented: true });
    activeRect.setCoords();
    canvas.requestRenderAll();

    restoreViewport(viewport);
    onCreated?.(activeRect);
    activeRect = null;
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);

    if (isDrawing && activeRect) {
      canvas.remove(activeRect);
      canvas.requestRenderAll();
    }
    restoreViewport(viewport);
  };
}

/**
 * Enable click-to-place mode for polygons.
 * Each click on the canvas creates a rectangular polygon of preset size at the clicked position.
 * Returns a cleanup function that disables the mode.
 */
export function enablePolygonClickToCreate(
  canvas: FabricCanvas,
  defaults: CreateModeDefaults & { width: number; height: number },
  onCreated?: (polygon: Polygon) => void,
  viewport?: ViewportController,
): () => void {
  const { width, height, ...style } = defaults;

  viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: { x: number; y: number } }) => {
    const polygon = new Polygon(
      [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height },
      ],
      {
        left: event.scenePoint.x,
        top: event.scenePoint.y,
        ...style,
      },
    );
    canvas.add(polygon);
    canvas.requestRenderAll();
    restoreViewport(viewport);
    onCreated?.(polygon);
  };

  canvas.on('mouse:down', handleMouseDown);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    restoreViewport(viewport);
  };
}

/**
 * Enable drag-to-draw mode for polygons.
 * User holds mouse down and drags to define a rectangular polygon.
 * Uses a Rect preview during drag, then creates a Polygon on release.
 * Returns a cleanup function that disables the mode.
 */
export function enablePolygonDragToCreate(
  canvas: FabricCanvas,
  defaults?: CreateModeDefaults,
  onCreated?: (polygon: Polygon) => void,
  viewport?: ViewportController,
): () => void {
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let previewRect: Rect | null = null;
  let previousSelection: boolean;

  viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: { x: number; y: number } }) => {
    isDrawing = true;
    startX = event.scenePoint.x;
    startY = event.scenePoint.y;

    previousSelection = canvas.selection;
    canvas.selection = false;

    previewRect = new Rect({
      left: startX,
      top: startY,
      width: 0,
      height: 0,
      ...defaults,
      selectable: false,
      evented: false,
    });
    canvas.add(previewRect);
  };

  const handleMouseMove = (event: { scenePoint: { x: number; y: number } }) => {
    if (!isDrawing || !previewRect) {
      return;
    }

    const currentX = event.scenePoint.x;
    const currentY = event.scenePoint.y;

    const width = Math.max(0, currentX - startX);
    const height = Math.max(0, currentY - startY);

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
    if (!isDrawing || !previewRect) {
      return;
    }

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

    const polygon = new Polygon(
      [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height },
      ],
      {
        left: startX + width / 2,
        top: startY + height / 2,
        ...defaults,
      },
    );
    canvas.add(polygon);
    canvas.requestRenderAll();

    restoreViewport(viewport);
    onCreated?.(polygon);
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
    restoreViewport(viewport);
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
export function enablePolygonDrawToCreate(
  canvas: FabricCanvas,
  defaults?: CreateModeDefaults,
  onCreated?: (polygon: Polygon) => void,
  viewport?: ViewportController,
): () => void {
  const points: Array<{ x: number; y: number }> = [];
  const markers: Circle[] = [];
  const edgeLines: Line[] = [];
  let trackingLine: Line | null = null;
  let closingLine: Line | null = null;
  let previousSelection: boolean;

  viewport?.setEnabled(false);

  const lineStyle = {
    stroke: defaults?.stroke ?? '#999999',
    strokeWidth: defaults?.strokeWidth ?? 1,
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

    const polygon = new Polygon(
      points.map((p) => ({ x: p.x, y: p.y })),
      { ...defaults },
    );
    canvas.add(polygon);
    canvas.selection = previousSelection;
    canvas.requestRenderAll();

    restoreViewport(viewport);
    onCreated?.(polygon);
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

    // Add vertex marker (first vertex is larger to indicate close target)
    const isFirst = points.length === 1;
    const marker = new Circle({
      left: x,
      top: y,
      radius: isFirst ? 6 : 4,
      fill: isFirst ? '#ff4444' : '#4444ff',
      stroke: '#ffffff',
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
    if (points.length === 0) {
      return;
    }

    const lastPoint = points[points.length - 1];
    const x = event.scenePoint.x;
    const y = event.scenePoint.y;

    // Update tracking line from last vertex to cursor
    if (trackingLine) {
      canvas.remove(trackingLine);
    }
    trackingLine = new Line([lastPoint.x, lastPoint.y, x, y], {
      ...lineStyle,
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
        ...lineStyle,
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
    restoreViewport(viewport);
  };
}
