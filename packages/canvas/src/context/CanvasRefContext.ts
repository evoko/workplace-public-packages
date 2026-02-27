import { createContext, useContext, type RefObject } from 'react';
import type { Canvas as FabricCanvas } from 'fabric';

/**
 * Shared context for the canvas ref. Provided by both
 * {@link EditCanvasProvider} and {@link ViewCanvasProvider}.
 *
 * The value is a stable `RefObject` that never changes identity after
 * mount, so consumers of this context will **not** re-render when
 * canvas state (zoom, selection, etc.) changes.
 */
export const CanvasRefContext =
  createContext<RefObject<FabricCanvas | null> | null>(null);

/**
 * Read `canvasRef` from the nearest {@link CanvasRefContext} provider.
 * Returns `null` if no provider is present.
 */
export function useCanvasRefContext(): RefObject<FabricCanvas | null> | null {
  return useContext(CanvasRefContext);
}
