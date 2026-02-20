import { Canvas as FabricCanvas, FabricObject } from 'fabric';
import type { Point2D, InteractionModeOptions } from '../types';
import { restoreViewport } from './shared';

/**
 * Enable click-to-create mode.
 * Each click calls the factory with the canvas and the click point.
 * The factory creates and adds the object to the canvas, returning it.
 * Returns a cleanup function that disables the mode.
 */
export function enableClickToCreate(
  canvas: FabricCanvas,
  factory: (canvas: FabricCanvas, point: Point2D) => FabricObject,
  options?: InteractionModeOptions,
): () => void {
  options?.viewport?.setEnabled(false);

  const handleMouseDown = (event: { scenePoint: Point2D }) => {
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
