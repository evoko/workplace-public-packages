import type { RefObject } from 'react';
import type { Canvas as FabricCanvas } from 'fabric';
import { useCanvasRefContext } from './CanvasRefContext';

/**
 * Read `canvasRef` from the nearest {@link ViewCanvasProvider} or
 * {@link EditCanvasProvider}.
 *
 * Returns `null` if neither provider is present in the tree.
 *
 * This hook reads from the shared {@link CanvasRefContext}, which holds a
 * stable `RefObject` that never changes identity. Consumers of this hook
 * will **not** re-render when canvas state (zoom, selection, etc.) changes
 * — only when the provider mounts/unmounts.
 */
export function useCanvasRef(): RefObject<FabricCanvas | null> | null {
  return useCanvasRefContext();
}
