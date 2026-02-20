import { Canvas as FabricCanvas, FabricObject, Rect } from 'fabric';
import type { Point2D } from '../fabric';
import { DEFAULT_GUIDELINE_SHAPE_STYLE } from '../styles';
import { InteractionModeOptions, restoreViewport } from './shared';

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

  options?.viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: Point2D }) => {
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

  const handleMouseMove = (event: { scenePoint: Point2D }) => {
    if (!isDrawing || !previewRect) return;

    let width = Math.max(0, event.scenePoint.x - startX);
    let height = Math.max(0, event.scenePoint.y - startY);

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

    if (isDrawing && previewRect) {
      canvas.remove(previewRect);
      canvas.requestRenderAll();
    }
    restoreViewport(options?.viewport);
  };
}
