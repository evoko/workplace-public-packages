import { Canvas as FabricCanvas, Rect } from 'fabric';

export interface CreateModeDefaults {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
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
): () => void {
  const { width, height, ...style } = defaults;

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
    onCreated?.(rect);
  };

  canvas.on('mouse:down', handleMouseDown);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
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
): () => void {
  let isDrawing = false;
  let startX = 0;
  let startY = 0;
  let activeRect: Rect | null = null;
  let previousSelection: boolean;

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

    const left = Math.min(startX, currentX);
    const top = Math.min(startY, currentY);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);

    activeRect.set({ left, top, width, height });
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
  };
}
