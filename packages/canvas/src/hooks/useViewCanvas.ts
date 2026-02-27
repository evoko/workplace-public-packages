import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas as FabricCanvas, type FabricObject } from 'fabric';
import {
  enablePanAndZoom,
  type PanAndZoomOptions,
  type ViewportController,
} from '../viewport';
import {
  enableScaledStrokes,
  enableScaledBorderRadius,
  loadCanvas,
  type ScaledBorderRadiusOptions,
} from '../serialization';
import { fitViewportToBackground, setBackgroundInverted } from '../background';
import { useViewportActions, syncZoom } from './shared';
import type { CanvasJSON } from '../types';

/** Visual properties that can be updated on view-canvas objects. */
export interface ViewObjectStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  visible?: boolean;
}

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
  /**
   * Visual border radius applied to loaded Rects (via `loadCanvas`).
   * Pass a number to customize (default: 4), or `false` to disable.
   */
  borderRadius?: number | false;
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

/** Disable selection on all objects. Border radius is applied by loadCanvas. */
function lockCanvas(canvas: FabricCanvas) {
  canvas.selection = false;
  canvas.forEachObject((obj) => {
    obj.selectable = false;
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
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [zoom, setZoom] = useState(1);
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const onReady = useCallback(
    (canvas: FabricCanvas) => {
      canvasRef.current = canvas;
      const opts = optionsRef.current;

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

      if (opts?.panAndZoom !== false) {
        const panAndZoomOpts =
          typeof opts?.panAndZoom === 'object' ? opts.panAndZoom : {};

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

      // Show pointer cursor when hovering over objects
      canvas.hoverCursor = 'pointer';

      canvas.on('mouse:wheel', () => {
        setZoom(canvas.getZoom());
      });

      // Load canvasData if provided, then call user's onReady, then finalise
      const initPromise = (async () => {
        if (opts?.canvasData) {
          setIsLoading(true);
          try {
            const loaded = await loadCanvas(canvas, opts.canvasData, {
              filter: opts.filter,
              borderRadius: opts.borderRadius,
            });
            lockCanvas(canvas);
            setObjects(loaded);
          } finally {
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

        if (opts?.autoFitToBackground !== false && canvas.backgroundImage) {
          fitViewportToBackground(canvas);
          syncZoom(canvasRef, setZoom);
        }
      });
    },
    // onReady and panAndZoom are intentionally excluded — we only initialize once
    [],
  );

  // React to invertBackground changes after initial load
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || options?.invertBackground === undefined) return;
    setBackgroundInverted(canvas, options.invertBackground);
  }, [options?.invertBackground]);

  const { resetViewport, zoomIn, zoomOut, panToObject, zoomToFit } =
    useViewportActions(canvasRef, viewportRef, setZoom);

  /** Memoized viewport controls — only changes identity if methods change (they don't). */
  const viewport = useMemo(
    () => ({
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
    [resetViewport, zoomIn, zoomOut, panToObject, zoomToFit],
  );

  /** Find a canvas object by its `data.id`. */
  const findObject = (id: string): FabricObject | undefined => {
    const c = canvasRef.current;
    if (!c) return undefined;
    return c.getObjects().find((o) => o.data?.id === id);
  };

  /** Update a single object's visual style by its `data.id`. */
  const setObjectStyle = useCallback((id: string, style: ViewObjectStyle) => {
    const obj = findObject(id);
    if (!obj) return;
    obj.set(style);
    canvasRef.current!.requestRenderAll();
  }, []);

  /** Batch-update multiple objects' visual styles. Keyed by `data.id`. */
  const setObjectStyles = useCallback(
    (styles: Record<string, ViewObjectStyle>) => {
      const c = canvasRef.current;
      if (!c) return;
      const objects = c.getObjects();
      const idMap = new Map<string, FabricObject>();
      for (const obj of objects) {
        if (obj.data?.id) idMap.set(obj.data.id, obj);
      }
      let updated = false;
      for (const [id, style] of Object.entries(styles)) {
        const obj = idMap.get(id);
        if (obj) {
          obj.set(style);
          updated = true;
        }
      }
      if (updated) c.requestRenderAll();
    },
    [],
  );

  /** Apply a visual style to all objects whose `data.type` matches the given type. */
  const setObjectStyleByType = useCallback(
    (type: string, style: ViewObjectStyle) => {
      const c = canvasRef.current;
      if (!c) return;
      let updated = false;
      for (const obj of c.getObjects()) {
        if (obj.data?.type === type) {
          obj.set(style);
          updated = true;
        }
      }
      if (updated) c.requestRenderAll();
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
      /** Viewport controls. */
      viewport,
      /** Update a single object's visual style by its `data.id`. */
      setObjectStyle,
      /** Batch-update multiple objects' visual styles in one render. Keyed by `data.id`. */
      setObjectStyles,
      /** Apply a visual style to all objects whose `data.type` matches. */
      setObjectStyleByType,
    }),
    // Only reactive state in deps — refs and stable callbacks are omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zoom, objects, isLoading, viewport],
  );
}
