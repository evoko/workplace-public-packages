import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas as FabricCanvas, type FabricObject, Polygon } from 'fabric';
import {
  enablePanAndZoom,
  type PanAndZoomOptions,
  type ViewportController,
  type ViewportMode,
} from '../viewport';
import {
  useViewportActions,
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
import {
  enableScaledStrokes,
  enableScaledBorderRadius,
  loadCanvas,
  type ScaledBorderRadiusOptions,
} from '../serialization';
import { enableKeyboardShortcuts } from '../keyboard';
import {
  fitViewportToBackground,
  setBackgroundImage as setBackgroundImageFn,
  setBackgroundInverted,
  type ResizeImageOptions,
  type SetBackgroundImageOptions,
} from '../background';
import {
  createHistoryTracker,
  type HistoryOptions,
  type HistoryTracker,
} from '../history';
import type { ModeSetup, CanvasJSON } from '../types';

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
   * Track canvas mutations and expose an `isDirty` flag.
   * Listens for `object:added`, `object:removed`, `object:modified`, and
   * `background:modified` events. Call `resetDirty()` after a successful
   * save to clear the flag, or `markDirty()` to set it manually.
   * Pass `false` to disable. Default: enabled.
   */
  trackChanges?: boolean;
  /**
   * Visual border radius applied to loaded Rects (via `loadCanvas`).
   * Pass a number to customize (default: 4), or `false` to disable.
   */
  borderRadius?: number | false;
  /**
   * Enable snapshot-based undo/redo. Pass `true` for defaults, or an options
   * object to customize `maxSize` (default: 50) and `debounce` (default: 300ms).
   * Default: disabled.
   */
  history?: boolean | HistoryOptions;
  /**
   * Canvas data to load automatically after initialisation.
   * When provided, `loadCanvas` is called internally before the user's
   * `onReady` callback, and the resulting objects are available via the
   * returned `objects` array.
   */
  canvasData?: CanvasJSON | object;
  /**
   * Filter function for loaded objects. Passed to `loadCanvas` as
   * `options.filter`. Only relevant when `canvasData` is provided.
   */
  filter?: (obj: FabricObject) => boolean;
  /**
   * Whether the background image should have an Invert filter applied.
   * Reactive — changes are applied automatically without remounting.
   */
  invertBackground?: boolean;
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
  const historyRef = useRef<HistoryTracker | null>(null);
  const isInitialLoadRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // WeakMap to save per-object selectability before entering a mode
  const savedSelectabilityRef = useRef(
    new WeakMap<FabricObject, { selectable: boolean; evented: boolean }>(),
  );

  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<FabricObject[]>([]);
  const [viewportMode, setViewportModeState] = useState<ViewportMode>('select');
  const [isEditingVertices, setIsEditingVertices] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lockLightMode, setLockLightModeState] = useState<boolean | undefined>(
    undefined,
  );

  /**
   * Activate an interaction mode, or pass `null` to return to select mode.
   *
   * When a setup function is provided, the hook automatically:
   * - Cleans up the previous mode
   * - Saves and disables object selectability
   * - Calls `setup(canvas, viewport)` and stores its cleanup
   *
   * When `null` is passed, saved selectability is restored.
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
      // Restore saved selectability, defaulting to true for objects added during mode
      canvas.selection = true;
      canvas.forEachObject((obj) => {
        const saved = savedSelectabilityRef.current.get(obj);
        obj.selectable = saved?.selectable ?? true;
        obj.evented = saved?.evented ?? true;
      });
    } else {
      // Save current selectability before disabling
      canvas.forEachObject((obj) => {
        savedSelectabilityRef.current.set(obj, {
          selectable: obj.selectable,
          evented: obj.evented,
        });
      });
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
      const opts = optionsRef.current;

      setupFeatures();
      setupEventListeners();
      invokeOnReady();

      // --- Feature setup (strokes, viewport, alignment, etc.) ---

      function setupFeatures() {
        if (opts?.scaledStrokes !== false) {
          enableScaledStrokes(canvas);
        }

        if (opts?.borderRadius !== false) {
          const borderRadiusOpts: ScaledBorderRadiusOptions | undefined =
            typeof opts?.borderRadius === 'number'
              ? { radius: opts.borderRadius }
              : undefined;
          enableScaledBorderRadius(canvas, borderRadiusOpts);
        }

        if (opts?.keyboardShortcuts !== false) {
          keyboardCleanupRef.current = enableKeyboardShortcuts(canvas);
        }

        setCanvasAlignmentEnabled(canvas, opts?.enableAlignment);

        if (opts?.panAndZoom !== false) {
          viewportRef.current = enablePanAndZoom(
            canvas,
            typeof opts?.panAndZoom === 'object' ? opts.panAndZoom : undefined,
          );
        }

        const alignmentEnabled = resolveAlignmentEnabled(
          opts?.enableAlignment,
          opts?.alignment,
        );
        if (alignmentEnabled) {
          alignmentCleanupRef.current = enableObjectAlignment(
            canvas,
            typeof opts?.alignment === 'object' ? opts.alignment : undefined,
          );
        }

        if (opts?.rotationSnap !== false) {
          rotationSnapCleanupRef.current = enableRotationSnap(
            canvas,
            typeof opts?.rotationSnap === 'object'
              ? opts.rotationSnap
              : undefined,
          );
        }

        if (opts?.history) {
          const historyOpts =
            typeof opts.history === 'object' ? opts.history : undefined;
          historyRef.current = createHistoryTracker(canvas, historyOpts);
        }
      }

      // --- Event listeners (selection, zoom, dirty tracking, vertex edit) ---

      function setupEventListeners() {
        canvas.on('mouse:wheel', () => setZoom(canvas.getZoom()));

        canvas.on('selection:created', (e) => setSelected(e.selected ?? []));
        canvas.on('selection:updated', (e) => setSelected(e.selected ?? []));
        canvas.on('selection:cleared', () => setSelected([]));

        if (opts?.trackChanges !== false) {
          const markDirtyIfNotLoading = () => {
            if (!isInitialLoadRef.current) setIsDirty(true);
          };
          canvas.on('object:added', markDirtyIfNotLoading);
          canvas.on('object:removed', markDirtyIfNotLoading);
          canvas.on('object:modified', markDirtyIfNotLoading);
          canvas.on('background:modified', markDirtyIfNotLoading);
        }

        if (opts?.history) {
          const syncHistoryState = () => {
            const h = historyRef.current;
            if (!h) return;
            setTimeout(() => {
              setCanUndo(h.canUndo());
              setCanRedo(h.canRedo());
            }, 350);
          };
          canvas.on('object:added', syncHistoryState);
          canvas.on('object:removed', syncHistoryState);
          canvas.on('object:modified', syncHistoryState);
          canvas.on('background:modified', syncHistoryState);
        }

        if (opts?.vertexEdit !== false) {
          const vertexOpts =
            typeof opts?.vertexEdit === 'object' ? opts.vertexEdit : undefined;
          canvas.on('mouse:dblclick', (e) => {
            if (e.target && e.target instanceof Polygon) {
              vertexEditCleanupRef.current?.();
              vertexEditCleanupRef.current = enableVertexEdit(
                canvas,
                e.target,
                {
                  ...vertexOpts,
                  onExit: () => {
                    vertexEditCleanupRef.current = null;
                    setIsEditingVertices(false);
                  },
                },
              );
              setIsEditingVertices(true);
            }
          });
        }
      }

      // --- Load canvasData, invoke consumer onReady, then finalise ---

      function invokeOnReady() {
        const initPromise = (async () => {
          if (opts?.canvasData) {
            setIsLoading(true);
            isInitialLoadRef.current = true;
            try {
              const loaded = await loadCanvas(canvas, opts.canvasData, {
                filter: opts.filter,
                borderRadius: opts.borderRadius,
              });
              setObjects(loaded);
            } finally {
              isInitialLoadRef.current = false;
              setIsLoading(false);
            }
          }
        })();

        initPromise.then(async () => {
          const onReadyResult = opts?.onReady?.(canvas);
          await Promise.resolve(onReadyResult);

          if (opts?.invertBackground !== undefined) {
            setBackgroundInverted(canvas, opts.invertBackground);
          }

          if (canvas.lockLightMode !== undefined) {
            setLockLightModeState(canvas.lockLightMode);
          }

          if (opts?.autoFitToBackground !== false && canvas.backgroundImage) {
            fitViewportToBackground(canvas);
            syncZoom(canvasRef, setZoom);
          }
          historyRef.current?.pushSnapshot();
        });
      }
    },
    // Dependency array intentionally empty — we only initialize once on mount
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

  // React to invertBackground changes after initial load
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || options?.invertBackground === undefined) return;
    setBackgroundInverted(canvas, options.invertBackground);
  }, [options?.invertBackground]);

  const setLockLightMode = useCallback((value: boolean) => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.lockLightMode = value;
    }
    setLockLightModeState(value);
  }, []);

  const setViewportMode = useCallback((mode: ViewportMode) => {
    viewportRef.current?.setMode(mode);
    setViewportModeState(mode);
  }, []);

  const { resetViewport, zoomIn, zoomOut, panToObject, zoomToFit } =
    useViewportActions(canvasRef, viewportRef, setZoom);

  /** Memoized viewport controls — only changes when viewportMode changes. */
  const viewport = useMemo(
    () => ({
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
      /** Zoom and pan to fit a specific object in the viewport. */
      zoomToFit,
    }),
    [
      viewportMode,
      setViewportMode,
      resetViewport,
      zoomIn,
      zoomOut,
      panToObject,
      zoomToFit,
    ],
  );

  const resetDirty = useCallback(() => setIsDirty(false), []);
  const markDirty = useCallback(() => setIsDirty(true), []);

  const undo = useCallback(async () => {
    const h = historyRef.current;
    if (!h) return;
    await h.undo();
    setCanUndo(h.canUndo());
    setCanRedo(h.canRedo());
  }, []);

  const redo = useCallback(async () => {
    const h = historyRef.current;
    if (!h) return;
    await h.redo();
    setCanUndo(h.canUndo());
    setCanRedo(h.canRedo());
  }, []);

  const setBackground = useCallback(
    async (url: string, bgOpts?: { preserveContrast?: boolean }) => {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not ready');

      const opts = optionsRef.current;
      const resizeOpts: SetBackgroundImageOptions | undefined =
        opts?.backgroundResize !== false
          ? typeof opts?.backgroundResize === 'object'
            ? { ...opts.backgroundResize, ...bgOpts }
            : { ...bgOpts }
          : bgOpts?.preserveContrast
            ? { preserveContrast: true }
            : undefined;

      const img = await setBackgroundImageFn(canvas, url, resizeOpts);

      if (opts?.autoFitToBackground !== false) {
        fitViewportToBackground(canvas);
        syncZoom(canvasRef, setZoom);
      }

      return img;
    },
    [],
  );

  return useMemo(
    () => ({
      /** Pass this to `<Canvas onReady={...} />` */
      onReady,
      /** Ref to the underlying Fabric canvas instance. */
      canvasRef,
      /** Current zoom level (reactive). */
      zoom,
      /** Loaded objects (reactive). Populated when `canvasData` is provided. */
      objects,
      /** Whether canvas data is currently being loaded. */
      isLoading,
      /** Currently selected objects (reactive). */
      selected,
      /** Viewport controls. */
      viewport,
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
       * Pass `{ preserveContrast: true }` to keep the current background contrast
       * when replacing the image.
       */
      setBackground,
      /** Whether the canvas has been modified since the last `resetDirty()` call. Enabled by default (disable via `trackChanges: false`). */
      isDirty,
      /** Reset the dirty flag (e.g., after a successful save). */
      resetDirty,
      /** Manually mark the canvas as dirty (e.g., after a custom operation not tracked automatically). */
      markDirty,
      /** Undo the last change. Requires `history: true`. */
      undo,
      /** Redo a previously undone change. Requires `history: true`. */
      redo,
      /** Whether an undo operation is available (reactive). Requires `history: true`. */
      canUndo,
      /** Whether a redo operation is available (reactive). Requires `history: true`. */
      canRedo,
      /** Whether the canvas is locked to light mode. Read from loaded canvas data. */
      lockLightMode,
      /** Update lockLightMode on both the canvas instance and React state. */
      setLockLightMode,
    }),
    // Only reactive state in deps — refs and stable callbacks are omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      zoom,
      objects,
      isLoading,
      selected,
      viewport,
      isEditingVertices,
      isDirty,
      canUndo,
      canRedo,
      lockLightMode,
    ],
  );
}
