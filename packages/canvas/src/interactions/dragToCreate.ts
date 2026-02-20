import { Canvas as FabricCanvas, FabricObject, Point, Rect } from 'fabric';
import type { Point2D } from '../fabric';
import { DEFAULT_GUIDELINE_SHAPE_STYLE } from '../styles';
import { InteractionModeOptions, restoreViewport } from './shared';
import {
  drawCursorGuidelines,
  getSnapPoints,
  snapCursorPoint,
  type CursorSnapResult,
  type GuidelineStyle,
} from '../alignment';

export interface DragToCreateOptions extends InteractionModeOptions {
  /** Style applied to the preview rectangle shown during drag. */
  previewStyle?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    rx?: number;
    ry?: number;
  };
  /** When true, constrain the drag to a 1:1 aspect ratio (square). */
  constrainToSquare?: boolean;
  /** Enable cursor snapping during drag. Pass `true` for defaults or an options object. Default: enabled. */
  snapping?:
    | boolean
    | {
        /** Snap margin in screen pixels. Default: 6. */
        margin?: number;
        /** Custom guideline style. */
        guidelineStyle?: GuidelineStyle;
      };
  /**
   * Master toggle for alignment/snapping.
   * - `undefined`: uses the `snapping` prop (default: enabled).
   * - `true`: force-enable snapping.
   * - `false`: force-disable snapping.
   */
  enableAlignment?: boolean;
}

const MIN_DRAG_SIZE = 3;

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

  // Snapping setup — enabled by default; enableAlignment overrides when defined
  const snapEnabled =
    options?.enableAlignment !== undefined
      ? options.enableAlignment
      : options?.snapping !== false;
  const snapMargin =
    typeof options?.snapping === 'object' ? options.snapping.margin : undefined;
  const guidelineStyle =
    typeof options?.snapping === 'object'
      ? options.snapping.guidelineStyle
      : undefined;
  let cachedTargetPoints: Point[] | null = null;

  function getTargetPoints(): Point[] {
    if (cachedTargetPoints) return cachedTargetPoints;
    cachedTargetPoints = [];
    canvas.forEachObject((obj) => {
      if (!obj.visible) return;
      if (obj === previewRect) return;
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

    const result = snapCursorPoint(canvas, new Point(rawX, rawY), {
      margin: snapMargin,
      exclude: previewRect ? new Set<FabricObject>([previewRect]) : undefined,
      targetPoints: getTargetPoints(),
    });
    return { x: result.point.x, y: result.point.y };
  }

  // Store last snap result so guidelines can be drawn in after:render
  let lastSnapResult: CursorSnapResult | null = null;

  const afterRender = () => {
    if (lastSnapResult) {
      drawCursorGuidelines(canvas, lastSnapResult, guidelineStyle);
    }
  };

  if (snapEnabled) {
    canvas.on('after:render', afterRender);
  }

  options?.viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: Point2D }) => {
    isDrawing = true;

    const snapped = snapPoint(event.scenePoint.x, event.scenePoint.y);
    startX = snapped.x;
    startY = snapped.y;

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

  const handleMouseMove = (event: { scenePoint: Point2D }) => {
    if (!isDrawing || !previewRect) return;

    let endX: number;
    let endY: number;

    if (snapEnabled) {
      const targetPoints = getTargetPoints();
      lastSnapResult = snapCursorPoint(
        canvas,
        new Point(event.scenePoint.x, event.scenePoint.y),
        {
          margin: snapMargin,
          exclude: new Set<FabricObject>([previewRect]),
          targetPoints,
        },
      );
      endX = lastSnapResult.point.x;
      endY = lastSnapResult.point.y;
    } else {
      endX = event.scenePoint.x;
      endY = event.scenePoint.y;
      lastSnapResult = null;
    }

    let width = Math.max(0, endX - startX);
    let height = Math.max(0, endY - startY);

    if (options?.constrainToSquare) {
      const size = Math.max(width, height);
      width = size;
      height = size;
    }

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
    lastSnapResult = null;
    canvas.selection = previousSelection;

    let width = previewRect.width ?? 0;
    let height = previewRect.height ?? 0;

    if (options?.constrainToSquare) {
      const size = Math.max(width, height);
      width = size;
      height = size;
    }

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

    if (snapEnabled) {
      canvas.off('object:added', invalidateCache);
      canvas.off('object:removed', invalidateCache);
      canvas.off('after:render', afterRender);
    }

    lastSnapResult = null;

    if (isDrawing && previewRect) {
      canvas.remove(previewRect);
      canvas.requestRenderAll();
    }
    restoreViewport(options?.viewport);
  };
}
