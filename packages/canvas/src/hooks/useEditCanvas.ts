import { useCallback, useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, type FabricObject, Polygon } from 'fabric';
import {
  enablePanAndZoom,
  resetViewport as resetViewportFn,
  type PanAndZoomOptions,
  type ViewportController,
  type ViewportMode,
} from '../viewport';
import {
  enableObjectAlignment,
  type ObjectAlignmentOptions,
} from '../alignment';
import {
  enableVertexEdit,
  setCanvasAlignmentEnabled,
  type VertexEditOptions,
} from '../interactions';
import { enableScaledStrokes } from '../serialization';
import { enableKeyboardShortcuts } from '../keyboard';
import type { ModeSetup } from '../types';

export interface UseEditCanvasOptions {
  /** Configure pan and zoom. Pass `false` to disable, or options to customize. Default: enabled. */
  panAndZoom?: boolean | PanAndZoomOptions;
  /** Enable alignment guidelines for object movement/scaling. Pass `false` to disable, or options to customize. Default: enabled. */
  alignment?: boolean | ObjectAlignmentOptions;
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
  onReady?: (canvas: FabricCanvas) => void;
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
  const modeCleanupRef = useRef<(() => void) | null>(null);
  const vertexEditCleanupRef = useRef<(() => void) | null>(null);
  const keyboardCleanupRef = useRef<(() => void) | null>(null);

  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<FabricObject[]>([]);
  const [viewportMode, setViewportModeState] = useState<ViewportMode>('select');
  const [isEditingVertices, setIsEditingVertices] = useState(false);

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

      const alignmentEnabled =
        options?.enableAlignment !== undefined
          ? options.enableAlignment
          : options?.alignment !== false;

      if (alignmentEnabled) {
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

      options?.onReady?.(canvas);
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

    const shouldEnable =
      options?.enableAlignment !== undefined
        ? options.enableAlignment
        : options?.alignment !== false;

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

  const resetViewport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    resetViewportFn(canvas);
    setZoom(1);
  }, []);

  const zoomIn = useCallback((step?: number) => {
    viewportRef.current?.zoomIn(step);
    const canvas = canvasRef.current;
    if (canvas) setZoom(canvas.getZoom());
  }, []);

  const zoomOut = useCallback((step?: number) => {
    viewportRef.current?.zoomOut(step);
    const canvas = canvasRef.current;
    if (canvas) setZoom(canvas.getZoom());
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
      /** Zoom in toward the canvas center. Default step: 0.2. */
      zoomIn,
      /** Zoom out from the canvas center. Default step: 0.2. */
      zoomOut,
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
  };
}
