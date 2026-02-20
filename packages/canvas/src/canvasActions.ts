import { Canvas as FabricCanvas, FabricObject } from 'fabric';

/**
 * Remove one or more objects from the canvas.
 */
export function deleteObjects(
  canvas: FabricCanvas,
  ...objects: FabricObject[]
): void {
  canvas.remove(...objects);
  canvas.requestRenderAll();
}
