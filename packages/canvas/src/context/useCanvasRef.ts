import type { RefObject } from 'react';
import type { Canvas as FabricCanvas } from 'fabric';
import { useViewCanvasContextSafe } from './ViewCanvasContext';
import { useEditCanvasContextSafe } from './EditCanvasContext';

/**
 * Read `canvasRef` from the nearest {@link ViewCanvasProvider} or
 * {@link EditCanvasProvider}.
 *
 * Returns `null` if neither provider is present in the tree.
 *
 * Both context hooks are called unconditionally (Rules-of-Hooks compliant).
 * In practice only one provider will be active at a time.
 */
export function useCanvasRef(): RefObject<FabricCanvas | null> | null {
  const viewCtx = useViewCanvasContextSafe();
  const editCtx = useEditCanvasContextSafe();
  return viewCtx?.canvasRef ?? editCtx?.canvasRef ?? null;
}
