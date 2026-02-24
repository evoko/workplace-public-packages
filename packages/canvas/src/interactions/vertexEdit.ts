import {
  Canvas as FabricCanvas,
  FabricObject,
  Point,
  Polygon,
  util,
} from 'fabric';
import type { Point2D } from '../types';
import {
  DEFAULT_VERTEX_HANDLE_RADIUS,
  DEFAULT_VERTEX_HANDLE_FILL,
  DEFAULT_VERTEX_HANDLE_STROKE,
  DEFAULT_VERTEX_HANDLE_STROKE_WIDTH,
} from '../constants';
import { createInteractionSnapping } from './interactionSnapping';

export interface VertexEditOptions {
  handleRadius?: number;
  handleFill?: string;
  handleStroke?: string;
  handleStrokeWidth?: number;
}

// --- Coordinate helpers ---

function localPointToScene(polygon: Polygon, point: Point2D): Point {
  const matrix = polygon.calcTransformMatrix();
  const localPoint = new Point(
    point.x - polygon.pathOffset.x,
    point.y - polygon.pathOffset.y,
  );
  return util.transformPoint(localPoint, matrix);
}

function scenePointToLocal(polygon: Polygon, scenePoint: Point): Point2D {
  const matrix = polygon.calcTransformMatrix();
  const invMatrix = util.invertTransform(matrix);
  const localPoint = util.transformPoint(scenePoint, invMatrix);
  return {
    x: localPoint.x + polygon.pathOffset.x,
    y: localPoint.y + polygon.pathOffset.y,
  };
}

// --- DOM handle helpers ---

function sceneToScreen(scenePoint: Point, canvas: FabricCanvas): Point {
  return util.transformPoint(scenePoint, canvas.viewportTransform!);
}

function screenToScene(
  screenX: number,
  screenY: number,
  canvas: FabricCanvas,
): Point {
  const inv = util.invertTransform(canvas.viewportTransform!);
  return util.transformPoint(new Point(screenX, screenY), inv);
}

function createHandleElement(
  radius: number,
  fill: string,
  stroke: string,
  strokeWidth: number,
): HTMLDivElement {
  const el = document.createElement('div');
  const size = radius * 2;
  el.style.cssText = [
    'position: absolute',
    `width: ${size}px`,
    `height: ${size}px`,
    `margin-left: ${-radius}px`,
    `margin-top: ${-radius}px`,
    'border-radius: 50%',
    `background: ${fill}`,
    `border: ${strokeWidth}px solid ${stroke}`,
    'box-sizing: border-box',
    'pointer-events: auto',
    'cursor: grab',
    'touch-action: none',
  ].join('; ');
  return el;
}

function positionHandle(
  handle: HTMLDivElement,
  scenePoint: Point,
  canvas: FabricCanvas,
): void {
  const screen = sceneToScreen(scenePoint, canvas);
  handle.style.left = `${screen.x}px`;
  handle.style.top = `${screen.y}px`;
}

// --- Main function ---

/**
 * Enable vertex editing on a polygon.
 * Creates draggable DOM circle handles at each vertex. Dragging a handle
 * updates the polygon's shape in real-time with cursor snapping support.
 *
 * Exit by pressing Escape or clicking on empty canvas.
 *
 * Returns a cleanup function that removes handles and exits edit mode.
 */
export function enableVertexEdit(
  canvas: FabricCanvas,
  polygon: Polygon,
  options?: VertexEditOptions,
  onExit?: () => void,
): () => void {
  let exited = false;
  let draggingIndex: number | null = null;

  const handleRadius = options?.handleRadius ?? DEFAULT_VERTEX_HANDLE_RADIUS;
  const handleFill = options?.handleFill ?? DEFAULT_VERTEX_HANDLE_FILL;
  const handleStroke = options?.handleStroke ?? DEFAULT_VERTEX_HANDLE_STROKE;
  const handleStrokeWidth =
    options?.handleStrokeWidth ?? DEFAULT_VERTEX_HANDLE_STROKE_WIDTH;

  // Save previous state so we can restore on cleanup
  const previousState = {
    selectable: polygon.selectable,
    evented: polygon.evented,
    hasControls: polygon.hasControls,
    canvasSelection: canvas.selection,
  };

  const prevObjectStates = new Map<
    FabricObject,
    { selectable: boolean; evented: boolean }
  >();

  // Disable polygon interaction and canvas selection
  polygon.selectable = false;
  polygon.evented = false;
  polygon.hasControls = false;
  canvas.selection = false;
  canvas.discardActiveObject();

  // Make all other objects non-interactive
  canvas.forEachObject((obj) => {
    if (obj !== polygon) {
      prevObjectStates.set(obj, {
        selectable: obj.selectable,
        evented: obj.evented,
      });
      obj.selectable = false;
      obj.evented = false;
    }
  });

  // Set up snapping — provides snap-to-object-points + guideline rendering.
  // Additional targets: the other vertices of this polygon (for self-alignment).
  const snapping = createInteractionSnapping(canvas, undefined, () => {
    if (draggingIndex === null) return [];
    return polygon.points
      .filter((_, i) => i !== draggingIndex)
      .map((pt) => localPointToScene(polygon, pt));
  });
  snapping.excludeSet.add(polygon);

  // Create handle container overlay
  const container = document.createElement('div');
  container.style.cssText =
    'position: absolute; inset: 0; pointer-events: none; overflow: hidden;';
  canvas.wrapperEl.appendChild(container);

  // Create DOM handles at each vertex
  const handles: HTMLDivElement[] = [];
  const points = polygon.points;

  for (let i = 0; i < points.length; i++) {
    const handle = createHandleElement(
      handleRadius,
      handleFill,
      handleStroke,
      handleStrokeWidth,
    );
    positionHandle(handle, localPointToScene(polygon, points[i]), canvas);
    container.appendChild(handle);
    handles.push(handle);

    // --- Pointer event handlers for dragging ---
    handle.addEventListener('pointerdown', (e: PointerEvent) => {
      if (exited) return;
      e.preventDefault();
      e.stopPropagation();
      draggingIndex = i;
      handle.setPointerCapture(e.pointerId);
      handle.style.cursor = 'grabbing';
    });

    handle.addEventListener('pointermove', (e: PointerEvent) => {
      if (draggingIndex !== i) return;

      // Convert pointer position to canvas-relative coordinates
      const wrapperRect = canvas.wrapperEl.getBoundingClientRect();
      const canvasRelX = e.clientX - wrapperRect.left;
      const canvasRelY = e.clientY - wrapperRect.top;

      // Convert to scene space
      const rawScene = screenToScene(canvasRelX, canvasRelY, canvas);

      // Apply snapping
      const snapped = snapping.snapWithGuidelines(rawScene.x, rawScene.y);
      const scenePoint = new Point(snapped.x, snapped.y);

      // Use a non-dragged vertex as an anchor to measure visual drift
      const anchorIdx = i === 0 ? 1 : 0;
      const anchorBefore = localPointToScene(
        polygon,
        polygon.points[anchorIdx],
      );

      const localPoint = scenePointToLocal(polygon, scenePoint);
      polygon.points[i] = localPoint;
      polygon.setDimensions();

      // setDimensions recalculates pathOffset, shifting all vertices visually.
      // Compensate by adjusting polygon position so the anchor stays in place.
      const anchorAfter = localPointToScene(polygon, polygon.points[anchorIdx]);
      polygon.left += anchorBefore.x - anchorAfter.x;
      polygon.top += anchorBefore.y - anchorAfter.y;
      polygon.dirty = true;
      polygon.setCoords();

      repositionAllHandles();
      canvas.requestRenderAll();
    });

    handle.addEventListener('pointerup', (e: PointerEvent) => {
      if (draggingIndex !== i) return;
      handle.releasePointerCapture(e.pointerId);
      draggingIndex = null;
      handle.style.cursor = 'grab';
      snapping.clearSnapResult();
      canvas.requestRenderAll();
    });
  }

  // Reposition all handles based on current polygon state
  function repositionAllHandles() {
    const pts = polygon.points;
    for (let j = 0; j < pts.length; j++) {
      positionHandle(handles[j], localPointToScene(polygon, pts[j]), canvas);
    }
  }

  // Reposition handles when viewport changes (zoom/pan)
  const afterRender = () => {
    if (draggingIndex === null) {
      repositionAllHandles();
    }
  };
  canvas.on('after:render', afterRender);

  // Exit on Escape (capture phase to prevent deletion shortcut)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      cleanup();
    }
  };
  document.addEventListener('keydown', handleKeyDown, true);

  // Exit on clicking empty canvas (clicks on DOM handles don't reach fabric)
  const handleMouseDown = () => {
    cleanup();
  };
  canvas.on('mouse:down', handleMouseDown);

  function cleanup() {
    if (exited) return;
    exited = true;

    snapping.cleanup();
    canvas.off('after:render', afterRender);
    canvas.off('mouse:down', handleMouseDown);
    document.removeEventListener('keydown', handleKeyDown, true);

    container.remove();

    polygon.selectable = previousState.selectable;
    polygon.evented = previousState.evented;
    polygon.hasControls = previousState.hasControls;
    canvas.selection = previousState.canvasSelection;

    prevObjectStates.forEach((state, obj) => {
      obj.selectable = state.selectable;
      obj.evented = state.evented;
    });

    canvas.discardActiveObject();
    canvas.requestRenderAll();

    onExit?.();
  }

  return cleanup;
}
