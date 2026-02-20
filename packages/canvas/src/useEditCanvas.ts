import { useCallback, useRef, useState } from 'react';
import { Canvas as FabricCanvas, type FabricObject } from 'fabric';
import {
  enablePanAndZoom,
  resetViewport as resetViewportFn,
  type PanAndZoomOptions,
  type ViewportController,
  type ViewportMode,
} from './viewport';
import {
  enableObjectAlignment,
  type ObjectAlignmentOptions,
} from './alignment';

export interface UseEditCanvasOptions {
  /** Configure pan and zoom. Pass `false` to disable, or options to customize. Default: enabled. */
  panAndZoom?: boolean | PanAndZoomOptions;
  /** Enable alignment guidelines for object movement/scaling. Pass `false` to disable, or options to customize. Default: enabled. */
  alignment?: boolean | ObjectAlignmentOptions;
  /** Called after the canvas is initialized and viewport is set up. */
  onReady?: (canvas: FabricCanvas) => void;
}

type ModeSetup = (
  canvas: FabricCanvas,
  viewport: ViewportController | undefined,
) => (() => void) | void;

/**
 * Hook that provides a batteries-included canvas experience with full
 * editing capabilities (create, edit, delete, select, pan, zoom).
 *
 * Handles canvas ref management, viewport setup (pan/zoom), reactive state
 * (zoom level, selected objects), and interaction mode lifecycle.
 *
 * @example
 * ```tsx
 * const canvas = useEditCanvas();
 *
 * // Activate a creation mode:
 * canvas.setMode((c, viewport) =>
 *   enableClickToCreate(c, factory, { viewport, onCreated: () => canvas.setMode(null) })
 * );
 *
 * // Return to select mode:
 * canvas.setMode(null);
 *
 * return <Canvas onReady={canvas.onReady} width={800} height={600} />;
 * ```
 */
export function useEditCanvas(options?: UseEditCanvasOptions) {
  const canvasRef = useRef<FabricCanvas | null>(null);
  const viewportRef = useRef<ViewportController | null>(null);
  const alignmentCleanupRef = useRef<(() => void) | null>(null);
  const modeCleanupRef = useRef<(() => void) | null>(null);

  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<FabricObject[]>([]);
  const [viewportMode, setViewportModeState] = useState<ViewportMode>('select');

  /**
   * Activate an interaction mode, or pass `null` to return to select mode.
   *
   * When a setup function is provided, the hook automatically:
   * - Cleans up the previous mode
   * - Disables object selectability
   * - Calls `setup(canvas, viewport)` and stores its cleanup
   *
   * When `null` is passed, selectability is restored.
   */
  const setMode = useCallback((setup: ModeSetup | null) => {
    modeCleanupRef.current?.();
    modeCleanupRef.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;

    if (setup === null) {
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        obj.selectable = true;
        obj.evented = true;
      });
    } else {
      canvas.selection = false;
      canvas.forEachObject((obj) => {
        obj.selectable = false;
        obj.evented = false;
      });
      const cleanup = setup(canvas, viewportRef.current ?? undefined);
      if (cleanup) {
        modeCleanupRef.current = cleanup;
      }
    }
  }, []);

  const onReady = useCallback(
    (canvas: FabricCanvas) => {
      canvasRef.current = canvas;

      if (options?.panAndZoom !== false) {
        viewportRef.current = enablePanAndZoom(
          canvas,
          typeof options?.panAndZoom === 'object'
            ? options.panAndZoom
            : undefined,
        );
      }

      if (options?.alignment !== false) {
        alignmentCleanupRef.current = enableObjectAlignment(
          canvas,
          typeof options?.alignment === 'object'
            ? options.alignment
            : undefined,
        );
      }

      canvas.on('mouse:wheel', () => {
        setZoom(canvas.getZoom());
      });

      canvas.on('selection:created', (e) => {
        setSelected(e.selected ?? []);
      });

      canvas.on('selection:updated', (e) => {
        setSelected(e.selected ?? []);
      });

      canvas.on('selection:cleared', () => {
        setSelected([]);
      });

      options?.onReady?.(canvas);
    },
    // onReady and panAndZoom are intentionally excluded — we only initialize once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const setViewportMode = useCallback((mode: ViewportMode) => {
    viewportRef.current?.setMode(mode);
    setViewportModeState(mode);
  }, []);

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
    /** Currently selected objects (reactive). */
    selected,
    /** Viewport controls. */
    viewport: {
      /** Current viewport mode (reactive). */
      mode: viewportMode,
      /** Switch between 'select' and 'pan' viewport modes. */
      setMode: setViewportMode,
      /** Reset viewport to default (no pan, zoom = 1). */
      reset: resetViewport,
    },
    /**
     * Activate an interaction mode or return to select mode.
     *
     * Pass a setup function to activate a creation mode:
     * ```ts
     * canvas.setMode((c, viewport) =>
     *   enableClickToCreate(c, factory, { viewport })
     * );
     * ```
     *
     * Pass `null` to deactivate and return to select mode:
     * ```ts
     * canvas.setMode(null);
     * ```
     */
    setMode,
  };
}
