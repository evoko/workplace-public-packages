import { useCallback, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import {
  enablePanAndZoom,
  resetViewport as resetViewportFn,
  type PanAndZoomOptions,
  type ViewportController,
} from './viewportActions';

export interface UseViewCanvasOptions {
  /** Configure pan and zoom. Pass `false` to disable, or options to customize. Default: enabled. */
  panAndZoom?: boolean | PanAndZoomOptions;
  /** Called after the canvas is initialized and viewport is set up. */
  onReady?: (canvas: FabricCanvas) => void;
}

/** Disable selection and interactivity on all objects, and apply view-only styles. */
function lockCanvas(canvas: FabricCanvas) {
  canvas.selection = false;
  canvas.forEachObject((obj) => {
    obj.selectable = false;
    obj.evented = false;
    if (
      obj instanceof Rect &&
      (obj.shapeType !== 'circle' || obj.data?.type !== 'DEVICE')
    ) {
      obj.set({ rx: 4, ry: 4 });
    }
  });
}

/**
 * Hook that provides a view-only canvas experience.
 *
 * Like {@link useEditCanvas} but without create, edit, delete, or selection
 * capabilities. The canvas is always in pan mode — click and drag to pan,
 * scroll to zoom.
 *
 * @example
 * ```tsx
 * const canvas = useViewCanvas();
 *
 * return <Canvas onReady={canvas.onReady} width={800} height={600} />;
 * ```
 */
export function useViewCanvas(options?: UseViewCanvasOptions) {
  const canvasRef = useRef<FabricCanvas | null>(null);
  const viewportRef = useRef<ViewportController | null>(null);

  const [zoom, setZoom] = useState(1);

  const onReady = useCallback(
    (canvas: FabricCanvas) => {
      canvasRef.current = canvas;

      if (options?.panAndZoom !== false) {
        const panAndZoomOpts =
          typeof options?.panAndZoom === 'object' ? options.panAndZoom : {};

        viewportRef.current = enablePanAndZoom(canvas, {
          ...panAndZoomOpts,
          initialMode: 'pan',
        });
      }

      lockCanvas(canvas);

      // Lock any objects added after initialisation
      canvas.on('object:added', () => {
        lockCanvas(canvas);
      });

      canvas.on('mouse:wheel', () => {
        setZoom(canvas.getZoom());
      });

      options?.onReady?.(canvas);
    },
    // onReady and panAndZoom are intentionally excluded — we only initialize once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const resetViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resetViewportFn(canvas);
    setZoom(1);
  }, []);

  return {
    /** Pass this to `<Canvas onReady={...} />` */
    onReady,
    /** Ref to the underlying Fabric canvas instance. */
    canvasRef,
    /** Current zoom level (reactive). */
    zoom,
    /** Viewport controls. */
    viewport: {
      /** Reset viewport to default (no pan, zoom = 1). */
      reset: resetViewport,
    },
  };
}
