import { type RefObject, useMemo } from 'react';
import { Canvas as FabricCanvas, type FabricObject } from 'fabric';
import {
  resetViewport as resetViewportFn,
  type PanToObjectOptions,
  type ViewportController,
  type ZoomToFitOptions,
} from '../viewport';
import { fitViewportToBackground } from '../background';

/** Sync React zoom state with the canvas zoom level. */
export function syncZoom(
  canvasRef: RefObject<FabricCanvas | null>,
  setZoom: (z: number) => void,
): void {
  const canvas = canvasRef.current;
  if (canvas) setZoom(canvas.getZoom());
}

/**
 * Create memoized viewport action callbacks shared between
 * useEditCanvas and useViewCanvas. The returned object is referentially
 * stable across renders.
 */
export function useViewportActions(
  canvasRef: RefObject<FabricCanvas | null>,
  viewportRef: RefObject<ViewportController | null>,
  setZoom: (z: number) => void,
) {
  return useMemo(() => {
    const resetViewport = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (canvas.backgroundImage) {
        fitViewportToBackground(canvas);
      } else {
        resetViewportFn(canvas);
      }
      setZoom(canvas.getZoom());
    };

    const zoomIn = (step?: number) => {
      viewportRef.current?.zoomIn(step);
      syncZoom(canvasRef, setZoom);
    };

    const zoomOut = (step?: number) => {
      viewportRef.current?.zoomOut(step);
      syncZoom(canvasRef, setZoom);
    };

    const panToObject = (
      object: FabricObject,
      panOpts?: PanToObjectOptions,
    ) => {
      viewportRef.current?.panToObject(object, panOpts);
    };

    const zoomToFit = (object: FabricObject, fitOpts?: ZoomToFitOptions) => {
      viewportRef.current?.zoomToFit(object, fitOpts);
      syncZoom(canvasRef, setZoom);
    };

    return { resetViewport, zoomIn, zoomOut, panToObject, zoomToFit };
    // Refs are stable — this only runs once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Resolve whether alignment should be enabled based on the master toggle
 * and the per-feature alignment prop.
 */
export function resolveAlignmentEnabled(
  enableAlignment: boolean | undefined,
  alignmentProp: boolean | object | undefined,
): boolean {
  if (enableAlignment !== undefined) return enableAlignment;
  return alignmentProp !== false;
}
