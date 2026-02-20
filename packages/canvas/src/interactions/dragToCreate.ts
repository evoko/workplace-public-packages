import { Canvas as FabricCanvas, FabricObject, Rect } from 'fabric';
import type {
  Point2D,
  ShapeStyleOptions,
  SnappableInteractionOptions,
} from '../types';
import { DEFAULT_GUIDELINE_SHAPE_STYLE } from '../styles';
import { restoreViewport } from './shared';
import { createInteractionSnapping } from './interactionSnapping';

export interface DragToCreateOptions extends SnappableInteractionOptions {
  /** Style applied to the preview rectangle shown during drag. */
  previewStyle?: ShapeStyleOptions & { rx?: number; ry?: number };
  /** When true, constrain the drag to a 1:1 aspect ratio (square). */
  constrainToSquare?: boolean;
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

  const snapping = createInteractionSnapping(canvas, options);

  options?.viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: Point2D }) => {
    isDrawing = true;

    const snapped = snapping.snap(event.scenePoint.x, event.scenePoint.y);
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
    snapping.excludeSet.add(previewRect);
    canvas.add(previewRect);
  };

  const handleMouseMove = (event: { scenePoint: Point2D }) => {
    if (!isDrawing || !previewRect) return;

    const { x: endX, y: endY } = snapping.snapWithGuidelines(
      event.scenePoint.x,
      event.scenePoint.y,
    );

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
    snapping.clearSnapResult();
    canvas.selection = previousSelection;

    let width = previewRect.width ?? 0;
    let height = previewRect.height ?? 0;

    if (options?.constrainToSquare) {
      const size = Math.max(width, height);
      width = size;
      height = size;
    }

    snapping.excludeSet.delete(previewRect);
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

    snapping.cleanup();

    if (isDrawing && previewRect) {
      canvas.remove(previewRect);
      canvas.requestRenderAll();
    }
    restoreViewport(options?.viewport);
  };
}
