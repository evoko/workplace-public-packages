import {
  Canvas as FabricCanvas,
  Circle,
  FabricObject,
  Point,
  Polygon,
  util,
} from 'fabric';
import type { Point2D } from '../fabric';

export interface VertexEditOptions {
  handleRadius?: number;
  handleFill?: string;
  handleStroke?: string;
  handleStrokeWidth?: number;
}

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

/**
 * Enable vertex editing on a polygon.
 * Creates draggable circle handles at each vertex. Dragging a handle
 * updates the polygon's shape in real-time.
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
  const handles: Circle[] = [];
  const handleIndexMap = new Map<Circle, number>();
  let exited = false;

  // Save previous state
  const prevSelectable = polygon.selectable;
  const prevEvented = polygon.evented;
  const prevHasControls = polygon.hasControls;
  const prevCanvasSelection = canvas.selection;

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

  // Create handles at each vertex
  const points = polygon.points;
  for (let i = 0; i < points.length; i++) {
    const scenePos = localPointToScene(polygon, points[i]);
    const handle = new Circle({
      left: scenePos.x,
      top: scenePos.y,
      radius: options?.handleRadius ?? 6,
      fill: options?.handleFill ?? '#ffffff',
      stroke: options?.handleStroke ?? '#2196f3',
      strokeWidth: options?.handleStrokeWidth ?? 2,
      originX: 'center',
      originY: 'center',
      hasBorders: false,
      hasControls: false,
    });
    handleIndexMap.set(handle, i);
    handles.push(handle);
    canvas.add(handle);
  }

  canvas.requestRenderAll();

  // Reposition all handles based on current polygon state
  function repositionAllHandles() {
    const pts = polygon.points;
    for (let i = 0; i < pts.length; i++) {
      const scenePos = localPointToScene(polygon, pts[i]);
      handles[i].set({ left: scenePos.x, top: scenePos.y });
      handles[i].setCoords();
    }
  }

  // Handle dragging
  const handleObjectMoving = (e: { target: FabricObject }) => {
    const target = e.target;
    const index = handleIndexMap.get(target as Circle);
    if (index === undefined) {
      return;
    }

    // Use a non-dragged vertex as an anchor to measure visual drift
    const anchorIdx = index === 0 ? 1 : 0;
    const anchorBefore = localPointToScene(polygon, polygon.points[anchorIdx]);

    const scenePoint = new Point(target.left, target.top);
    const localPoint = scenePointToLocal(polygon, scenePoint);

    polygon.points[index] = localPoint;
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
  };

  canvas.on('object:moving', handleObjectMoving);

  // Exit on Escape (capture phase to prevent deletion shortcut)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      cleanup();
    }
  };
  document.addEventListener('keydown', handleKeyDown, true);

  // Exit on clicking empty canvas
  const handleMouseDown = (e: { target?: FabricObject | null }) => {
    if (e.target && handles.includes(e.target as Circle)) {
      return;
    }
    cleanup();
  };
  canvas.on('mouse:down', handleMouseDown);

  function cleanup() {
    if (exited) {
      return;
    }
    exited = true;

    canvas.off('object:moving', handleObjectMoving);
    canvas.off('mouse:down', handleMouseDown);
    document.removeEventListener('keydown', handleKeyDown, true);

    for (const handle of handles) {
      canvas.remove(handle);
    }
    handles.length = 0;

    polygon.selectable = prevSelectable;
    polygon.evented = prevEvented;
    polygon.hasControls = prevHasControls;
    canvas.selection = prevCanvasSelection;

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
