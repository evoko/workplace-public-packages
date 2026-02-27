import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  useViewCanvas,
  type UseViewCanvasOptions,
} from '../hooks/useViewCanvas';
import { CanvasRefContext } from './CanvasRefContext';

/** The full return value of {@link useViewCanvas}, exposed via context. */
export type ViewCanvasContextValue = ReturnType<typeof useViewCanvas>;

/** Viewport slice — changes on every zoom/scroll. */
export type ViewCanvasViewportValue = Pick<
  ViewCanvasContextValue,
  'zoom' | 'viewport'
>;

/** State slice — everything except canvasRef and viewport. */
export type ViewCanvasStateValue = Omit<
  ViewCanvasContextValue,
  'canvasRef' | 'zoom' | 'viewport'
>;

// --- Internal sub-contexts (not exported) ---

const ViewViewportContext = createContext<ViewCanvasViewportValue | null>(null);
const ViewStateContext = createContext<ViewCanvasStateValue | null>(null);

export interface ViewCanvasProviderProps {
  /** Options forwarded to the underlying {@link useViewCanvas} hook. */
  options?: UseViewCanvasOptions;
  children: ReactNode;
}

/**
 * Calls {@link useViewCanvas} internally and provides the full canvas API
 * to all descendants via React context.
 *
 * Internally splits state into three contexts (ref, viewport, state) so
 * that helper hooks like {@link useCanvasRef} and components like
 * {@link ObjectOverlay} do not re-render on unrelated state changes.
 *
 * Use {@link useViewCanvasContext} in any descendant to access the full
 * combined value, or use the fine-grained hooks
 * {@link useViewCanvasViewport} / {@link useViewCanvasState} for better
 * performance.
 *
 * Descendant components can also use {@link ObjectOverlay},
 * {@link useCanvasEvents}, {@link useCanvasTooltip}, and
 * {@link useCanvasClick} without passing `canvasRef` explicitly — they
 * read it from the nearest provider automatically.
 *
 * @example
 * ```tsx
 * <ViewCanvasProvider options={{
 *   canvasData: savedJson,
 *   invertBackground: isDarkMode,
 *   scaledStrokes: true,
 * }}>
 *   <MyCanvas />
 *   <MyToolbar />
 * </ViewCanvasProvider>
 *
 * function MyCanvas() {
 *   const { onReady, objects, isLoading } = useViewCanvasContext();
 *   return <Canvas onReady={onReady} />;
 * }
 *
 * function MyToolbar() {
 *   const { viewport } = useViewCanvasViewport();
 *   return <ZoomControls onZoomIn={viewport.zoomIn} onZoomOut={viewport.zoomOut} />;
 * }
 * ```
 */
export function ViewCanvasProvider({
  options,
  children,
}: ViewCanvasProviderProps) {
  const canvas = useViewCanvas(options);

  const viewportValue = useMemo<ViewCanvasViewportValue>(
    () => ({ zoom: canvas.zoom, viewport: canvas.viewport }),
    [canvas.zoom, canvas.viewport],
  );

  const stateValue = useMemo<ViewCanvasStateValue>(
    () => ({
      onReady: canvas.onReady,
      objects: canvas.objects,
      isLoading: canvas.isLoading,
      setObjectStyle: canvas.setObjectStyle,
      setObjectStyles: canvas.setObjectStyles,
      setObjectStyleByType: canvas.setObjectStyleByType,
    }),
    // Only reactive state — stable callbacks omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvas.objects, canvas.isLoading],
  );

  return (
    <CanvasRefContext.Provider value={canvas.canvasRef}>
      <ViewViewportContext.Provider value={viewportValue}>
        <ViewStateContext.Provider value={stateValue}>
          {children}
        </ViewStateContext.Provider>
      </ViewViewportContext.Provider>
    </CanvasRefContext.Provider>
  );
}

/**
 * Access the full {@link useViewCanvas} API from any descendant of
 * {@link ViewCanvasProvider}.
 *
 * This subscribes to all three internal contexts, so the component will
 * re-render on any state change. For better performance, prefer
 * {@link useViewCanvasViewport} or {@link useViewCanvasState}.
 *
 * Throws if called outside of a provider.
 */
export function useViewCanvasContext(): ViewCanvasContextValue {
  const canvasRef = useContext(CanvasRefContext);
  const viewport = useContext(ViewViewportContext);
  const state = useContext(ViewStateContext);

  if (canvasRef === null || viewport === null || state === null) {
    throw new Error(
      'useViewCanvasContext must be used within a <ViewCanvasProvider>',
    );
  }

  return useMemo(
    () => ({ canvasRef, ...viewport, ...state }) as ViewCanvasContextValue,
    [canvasRef, viewport, state],
  );
}

/**
 * Like {@link useViewCanvasContext} but returns `null` instead of throwing
 * when called outside of a {@link ViewCanvasProvider}.
 */
export function useViewCanvasContextSafe(): ViewCanvasContextValue | null {
  const canvasRef = useContext(CanvasRefContext);
  const viewport = useContext(ViewViewportContext);
  const state = useContext(ViewStateContext);

  // useMemo must be called unconditionally (Rules of Hooks).
  // ViewStateContext is the discriminator — only non-null inside ViewCanvasProvider.
  return useMemo(
    () =>
      state !== null && canvasRef !== null && viewport !== null
        ? ({ canvasRef, ...viewport, ...state } as ViewCanvasContextValue)
        : null,
    [canvasRef, viewport, state],
  );
}

/**
 * Access only the viewport slice (zoom level and viewport controls) from
 * the nearest {@link ViewCanvasProvider}.
 *
 * This subscribes only to viewport changes — the component will **not**
 * re-render when objects or loading state changes.
 *
 * Throws if called outside of a provider.
 */
export function useViewCanvasViewport(): ViewCanvasViewportValue {
  const ctx = useContext(ViewViewportContext);
  if (ctx === null) {
    throw new Error(
      'useViewCanvasViewport must be used within a <ViewCanvasProvider>',
    );
  }
  return ctx;
}

/**
 * Access only the non-viewport state slice from the nearest
 * {@link ViewCanvasProvider}.
 *
 * This subscribes only to state changes (objects, loading, etc.) —
 * the component will **not** re-render on zoom/scroll changes.
 *
 * Throws if called outside of a provider.
 */
export function useViewCanvasState(): ViewCanvasStateValue {
  const ctx = useContext(ViewStateContext);
  if (ctx === null) {
    throw new Error(
      'useViewCanvasState must be used within a <ViewCanvasProvider>',
    );
  }
  return ctx;
}
