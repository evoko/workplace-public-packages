import { useCallback, useRef, useState } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import {
  enablePanAndZoom,
  type PanAndZoomOptions,
  type ViewportController,
} from '../viewport';
import { enableScaledStrokes } from '../serialization';
import { fitViewportToBackground } from '../background';
import { createViewportActions, syncZoom } from './shared';

export interface UseViewCanvasOptions {
  /** Configure pan and zoom. Pass `false` to disable, or options to customize. Default: enabled. */
  panAndZoom?: boolean | PanAndZoomOptions;
  /**
   * Keep stroke widths visually constant as the user zooms in/out.
   * Pass `false` to disable. Default: enabled.
   */
  scaledStrokes?: boolean;
  /** Called after the canvas is initialized and viewport is set up. */
  onReady?: (canvas: FabricCanvas) => void | Promise<void>;
  /**
   * Automatically fit the viewport to the background image after `onReady`
   * completes, if a background image is present. Also applies when
   * `viewport.reset` is called while a background image is set.
   * Pass `false` to disable. Default: enabled.
   */
  autoFitToBackground?: boolean;
}

const VIEW_BORDER_RADIUS = 4;

/** Disable selection and interactivity on all objects, and apply view-only styles. */
function lockCanvas(canvas: FabricCanvas) {
  canvas.selection = false;
  canvas.forEachObject((obj) => {
    obj.selectable = false;
    obj.evented = false;
    if (
      obj instanceof Rect &&
      obj.shapeType !== 'circle' &&
      obj.data?.type !== 'DEVICE'
    ) {
      // Compensate for non-uniform scaling so corners appear circular.
      const rx = VIEW_BORDER_RADIUS / (obj.scaleX ?? 1);
      const ry = VIEW_BORDER_RADIUS / (obj.scaleY ?? 1);
      obj.set({ rx, ry });
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

      if (options?.scaledStrokes !== false) {
        enableScaledStrokes(canvas);
      }

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

      const onReadyResult = options?.onReady?.(canvas);
      if (options?.autoFitToBackground !== false) {
        Promise.resolve(onReadyResult).then(() => {
          if (canvas.backgroundImage) {
            fitViewportToBackground(canvas);
            syncZoom(canvasRef, setZoom);
          }
        });
      }
    },
    // onReady and panAndZoom are intentionally excluded — we only initialize once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { resetViewport, zoomIn, zoomOut } = createViewportActions(
    canvasRef,
    viewportRef,
    setZoom,
  );

  return {
    /** Pass this to `<Canvas onReady={...} />` */
    onReady,
    /** Ref to the underlying Fabric canvas instance. */
    canvasRef,
    /** Current zoom level (reactive). */
    zoom,
    /** Viewport controls. */
    viewport: {
      /** Reset viewport to default (no pan, zoom = 1), or fit to background if one is set. */
      reset: resetViewport,
      /** Zoom in toward the canvas center. Default step: 0.2. */
      zoomIn,
      /** Zoom out from the canvas center. Default step: 0.2. */
      zoomOut,
    },
  };
}
