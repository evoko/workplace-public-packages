import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, type FabricObject, Polygon } from 'fabric';
import {
  enablePanAndZoom,
  type PanAndZoomOptions,
  type ViewportController,
  type ViewportMode,
} from '../viewport';
import {
  createViewportActions,
  resolveAlignmentEnabled,
  syncZoom,
} from './shared';
import {
  enableObjectAlignment,
  type ObjectAlignmentOptions,
  enableRotationSnap,
  type RotationSnapOptions,
} from '../alignment';
import {
  enableVertexEdit,
  setCanvasAlignmentEnabled,
  type VertexEditOptions,
} from '../interactions';
import { enableScaledStrokes } from '../serialization';
import { enableKeyboardShortcuts } from '../keyboard';
import {
  fitViewportToBackground,
  setBackgroundImage as setBackgroundImageFn,
  type ResizeImageOptions,
  type SetBackgroundImageOptions,
} from '../background';
import type { ModeSetup } from '../types';

export interface UseEditCanvasOptions {
  /** Configure pan and zoom. Pass `false` to disable, or options to customize. Default: enabled. */
  panAndZoom?: boolean | PanAndZoomOptions;
  /** Enable alignment guidelines for object movement/scaling. Pass `false` to disable, or options to customize. Default: enabled. */
  alignment?: boolean | ObjectAlignmentOptions;
  /**
   * Snap rotation to angle intervals when Shift is held. Pass `false` to
   * disable, or `{ interval }` to change the snap interval. Default: enabled at 15° intervals.
   */
  rotationSnap?: boolean | RotationSnapOptions;
  /**
   * Master toggle for all alignment and snapping functionality.
   * - `undefined`: each feature uses its own prop (default).
   * - `true`: all alignment/snapping is force-enabled.
   * - `false`: all alignment/snapping is force-disabled.
   */
  enableAlignment?: boolean;
  /**
   * Enable double-click-to-vertex-edit on polygons.
   * Pass `false` to disable, or a `VertexEditOptions` object to customize handle appearance.
   * Default: enabled.
   */
  vertexEdit?: boolean | VertexEditOptions;
  /**
   * Keep stroke widths visually constant as the user zooms in/out.
   * Pass `false` to disable. Default: enabled.
   */
  scaledStrokes?: boolean;
  /**
   * Enable keyboard shortcuts (Delete/Backspace to delete selected objects).
   * Pass `false` to disable. Default: enabled.
   */
  keyboardShortcuts?: boolean;
  /** Called after the canvas is initialized and viewport is set up. */
  onReady?: (canvas: FabricCanvas) => void | Promise<void>;
  /**
   * Automatically fit the viewport to the background image after `onReady`
   * completes, if a background image is present. Also applies when
   * `viewport.reset` is called while a background image is set.
   * Pass `false` to disable. Default: enabled.
   */
  autoFitToBackground?: boolean;
  /**
   * Automatically resize background images when set via `setBackground`.
   * Images exceeding `maxSize` are downscaled to fit; images smaller than
   * `minSize` on both dimensions are rejected with an error.
   * Pass `false` to disable. Default: enabled (maxSize: 4096, minSize: 480).
   */
  backgroundResize?: boolean | ResizeImageOptions;
  /**
   * Track object add/remove/modify events and expose an `isDirty` flag.
   * Call `resetDirty()` after a successful save to clear the flag.
   * Default: disabled.
   */
  trackChanges?: boolean;
}

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
  const rotationSnapCleanupRef = useRef<(() => void) | null>(null);
  const modeCleanupRef = useRef<(() => void) | null>(null);
  const vertexEditCleanupRef = useRef<(() => void) | null>(null);
  const keyboardCleanupRef = useRef<(() => void) | null>(null);

  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<FabricObject[]>([]);
  const [viewportMode, setViewportModeState] = useState<ViewportMode>('select');
  const [isEditingVertices, setIsEditingVertices] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

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
    // Exit any active vertex edit session before switching modes
    vertexEditCleanupRef.current?.();
    vertexEditCleanupRef.current = null;
    setIsEditingVertices(false);

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

      if (options?.scaledStrokes !== false) {
        enableScaledStrokes(canvas);
      }

      if (options?.keyboardShortcuts !== false) {
        keyboardCleanupRef.current = enableKeyboardShortcuts(canvas);
      }

      // Set canvas-level alignment state so interaction modes inherit it
      setCanvasAlignmentEnabled(canvas, options?.enableAlignment);

      if (options?.panAndZoom !== false) {
        viewportRef.current = enablePanAndZoom(
          canvas,
          typeof options?.panAndZoom === 'object'
            ? options.panAndZoom
            : undefined,
        );
      }

      const alignmentEnabled = resolveAlignmentEnabled(
        options?.enableAlignment,
        options?.alignment,
      );

      if (alignmentEnabled) {
        alignmentCleanupRef.current = enableObjectAlignment(
          canvas,
          typeof options?.alignment === 'object'
            ? options.alignment
            : undefined,
        );
      }

      if (options?.rotationSnap !== false) {
        rotationSnapCleanupRef.current = enableRotationSnap(
          canvas,
          typeof options?.rotationSnap === 'object'
            ? options.rotationSnap
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

      // Dirty tracking — mark canvas as modified on any object mutation
      if (options?.trackChanges) {
        canvas.on('object:added', () => setIsDirty(true));
        canvas.on('object:removed', () => setIsDirty(true));
        canvas.on('object:modified', () => setIsDirty(true));
      }

      // Auto-setup vertex edit on double-click for polygons
      if (options?.vertexEdit !== false) {
        const vertexOpts =
          typeof options?.vertexEdit === 'object'
            ? options.vertexEdit
            : undefined;

        canvas.on('mouse:dblclick', (e) => {
          if (e.target && e.target instanceof Polygon) {
            vertexEditCleanupRef.current?.();
            vertexEditCleanupRef.current = enableVertexEdit(
              canvas,
              e.target,
              vertexOpts,
              () => {
                vertexEditCleanupRef.current = null;
                setIsEditingVertices(false);
              },
            );
            setIsEditingVertices(true);
          }
        });
      }

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

  // React to enableAlignment changes — tear down or set up object alignment,
  // and update the canvas-level alignment state for interaction modes.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Keep canvas-level alignment state in sync
    setCanvasAlignmentEnabled(canvas, options?.enableAlignment);

    const shouldEnable = resolveAlignmentEnabled(
      options?.enableAlignment,
      options?.alignment,
    );

    if (shouldEnable && !alignmentCleanupRef.current) {
      alignmentCleanupRef.current = enableObjectAlignment(
        canvas,
        typeof options?.alignment === 'object' ? options.alignment : undefined,
      );
    } else if (!shouldEnable && alignmentCleanupRef.current) {
      alignmentCleanupRef.current();
      alignmentCleanupRef.current = null;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options?.enableAlignment]);

  const setViewportMode = useCallback((mode: ViewportMode) => {
    viewportRef.current?.setMode(mode);
    setViewportModeState(mode);
  }, []);

  const { resetViewport, zoomIn, zoomOut, panToObject } = createViewportActions(
    canvasRef,
    viewportRef,
    setZoom,
  );

  const setBackground = useCallback(
    async (url: string, bgOpts?: { preserveOpacity?: boolean }) => {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not ready');

      const resizeOpts: SetBackgroundImageOptions | undefined =
        options?.backgroundResize !== false
          ? typeof options?.backgroundResize === 'object'
            ? { ...options.backgroundResize, ...bgOpts }
            : { ...bgOpts }
          : bgOpts?.preserveOpacity
            ? { preserveOpacity: true }
            : undefined;

      const img = await setBackgroundImageFn(canvas, url, resizeOpts);

      if (options?.autoFitToBackground !== false) {
        fitViewportToBackground(canvas);
        syncZoom(canvasRef, setZoom);
      }

      return img;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

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
      /** Reset viewport to default (no pan, zoom = 1), or fit to background if one is set. */
      reset: resetViewport,
      /** Zoom in toward the canvas center. Default step: 0.2. */
      zoomIn,
      /** Zoom out from the canvas center. Default step: 0.2. */
      zoomOut,
      /** Pan the viewport to center on a specific object. */
      panToObject,
    },
    /** Whether vertex edit mode is currently active (reactive). */
    isEditingVertices,
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
    /**
     * Set a background image from a URL. Automatically resizes if the image
     * exceeds the configured limits (opt out via `backgroundResize: false`),
     * and fits the viewport after setting if `autoFitToBackground` is enabled.
     *
     * Pass `{ preserveOpacity: true }` to keep the current background opacity
     * when replacing the image.
     */
    setBackground,
    /** Whether the canvas has been modified since the last `resetDirty()` call. Requires `trackChanges: true`. */
    isDirty,
    /** Reset the dirty flag (e.g., after a successful save). */
    resetDirty: useCallback(() => setIsDirty(false), []),
  };
}
