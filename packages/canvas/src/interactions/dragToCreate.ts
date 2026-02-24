import { Canvas as FabricCanvas, FabricObject, Rect } from 'fabric';
import type {
  DragBounds,
  Point2D,
  ShapeStyleOptions,
  SnappableInteractionOptions,
} from '../types';
import { DEFAULT_GUIDELINE_SHAPE_STYLE } from '../styles';
import { MIN_DRAG_SIZE } from '../constants';
import { restoreViewport, createShiftKeyTracker } from './shared';
import { createInteractionSnapping } from './interactionSnapping';

export interface DragToCreateOptions extends SnappableInteractionOptions {
  /** Style applied to the preview rectangle shown during drag. */
  previewStyle?: ShapeStyleOptions & { rx?: number; ry?: number };
  /** When true, constrain the drag to a 1:1 aspect ratio (square). */
  constrainToSquare?: boolean;
  /**
   * Factory called when the user clicks without dragging (below MIN_DRAG_SIZE).
   * Receives the canvas and the click point. If not provided, clicks are ignored.
   */
  clickFactory?: (canvas: FabricCanvas, point: Point2D) => FabricObject;
  /** Called when the user cancels the drag via Escape. */
  onCancel?: () => void;
}

/**
 * Enable drag-to-create mode.
 * A preview rectangle is shown while dragging. On mouse-up the factory
 * receives the drag bounds and creates the final object.
 * Holding Shift during drag constrains the shape to a 1:1 aspect ratio.
 * Returns a cleanup function that disables the mode.
 */
export function enableDragToCreate(
  canvas: FabricCanvas,
  factory: (canvas: FabricCanvas, bounds: DragBounds) => FabricObject,
  options?: DragToCreateOptions,
): () => void {
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let lastEndX = 0;
  let lastEndY = 0;
  let previewRect: Rect | null = null;
  let previousSelection: boolean;

  const snapping = createInteractionSnapping(canvas, options);
  const shiftTracker = createShiftKeyTracker(() => {
    updatePreview(lastEndX, lastEndY);
  });

  options?.viewport?.setEnabled(false);

  const shouldConstrain = () =>
    !!(options?.constrainToSquare || shiftTracker.held);

  const computeDimensions = (
    endX: number,
    endY: number,
  ): { width: number; height: number } => {
    let width = Math.max(0, endX - startX);
    let height = Math.max(0, endY - startY);
    if (shouldConstrain()) {
      const size = Math.max(width, height);
      width = size;
      height = size;
    }
    return { width, height };
  };

  const updatePreview = (endX: number, endY: number) => {
    lastEndX = endX;
    lastEndY = endY;
    if (!isDrawing || !previewRect) return;

    const { width, height } = computeDimensions(endX, endY);
    previewRect.set({
      left: startX + width / 2,
      top: startY + height / 2,
      width,
      height,
    });
    previewRect.setCoords();
    canvas.requestRenderAll();
  };

  const handleMouseDown = (event: { scenePoint: Point2D }) => {
    isDrawing = true;

    const snapped = snapping.snap(event.scenePoint.x, event.scenePoint.y);
    startX = snapped.x;
    startY = snapped.y;
    lastEndX = startX;
    lastEndY = startY;

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
    updatePreview(endX, endY);
  };

  const handleMouseUp = () => {
    if (!isDrawing || !previewRect) return;

    isDrawing = false;
    snapping.clearSnapResult();
    canvas.selection = previousSelection;

    const { width, height } = computeDimensions(lastEndX, lastEndY);

    snapping.excludeSet.delete(previewRect);
    canvas.remove(previewRect);

    if (width < MIN_DRAG_SIZE && height < MIN_DRAG_SIZE) {
      canvas.requestRenderAll();
      previewRect = null;

      if (options?.clickFactory) {
        const obj = options.clickFactory(canvas, { x: startX, y: startY });
        restoreViewport(options?.viewport);
        options?.onCreated?.(obj);
      }
      return;
    }

    const obj = factory(canvas, { startX, startY, width, height });
    restoreViewport(options?.viewport);
    options?.onCreated?.(obj);
    previewRect = null;
  };

  // Cancel drag on Escape (capture phase to prevent other handlers)
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopImmediatePropagation();
      e.preventDefault();
      cleanup('cancel');
    }
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);
  document.addEventListener('keydown', handleKeyDown, true);

  let exited = false;

  function cleanup(reason?: 'cancel') {
    if (exited) return;
    exited = true;

    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
    document.removeEventListener('keydown', handleKeyDown, true);
    shiftTracker.cleanup();

    snapping.cleanup();

    if (isDrawing && previewRect) {
      snapping.excludeSet.delete(previewRect);
      canvas.remove(previewRect);
      canvas.selection = previousSelection;
      canvas.requestRenderAll();
    }
    restoreViewport(options?.viewport);

    if (reason === 'cancel') {
      options?.onCancel?.();
    }
  }

  return () => cleanup();
}
