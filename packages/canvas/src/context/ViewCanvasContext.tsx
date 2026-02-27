import { createContext, useContext, type ReactNode } from 'react';
import {
  useViewCanvas,
  type UseViewCanvasOptions,
} from '../hooks/useViewCanvas';

/** The full return value of {@link useViewCanvas}, exposed via context. */
export type ViewCanvasContextValue = ReturnType<typeof useViewCanvas>;

const ViewCanvasContext = createContext<ViewCanvasContextValue | null>(null);

export interface ViewCanvasProviderProps {
  /** Options forwarded to the underlying {@link useViewCanvas} hook. */
  options?: UseViewCanvasOptions;
  children: ReactNode;
}

/**
 * Calls {@link useViewCanvas} internally and provides the full canvas API
 * to all descendants via React context.
 *
 * Use {@link useViewCanvasContext} in any descendant to access `canvasRef`,
 * `viewport`, `objects`, `isLoading`, `setObjectStyle`, and every other
 * value that `useViewCanvas` returns — without prop drilling or bridge
 * contexts.
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
 *   const { viewport } = useViewCanvasContext();
 *   return <ZoomControls onZoomIn={viewport.zoomIn} onZoomOut={viewport.zoomOut} />;
 * }
 * ```
 */
export function ViewCanvasProvider({
  options,
  children,
}: ViewCanvasProviderProps) {
  const canvas = useViewCanvas(options);
  return (
    <ViewCanvasContext.Provider value={canvas}>
      {children}
    </ViewCanvasContext.Provider>
  );
}

/**
 * Access the full {@link useViewCanvas} API from any descendant of
 * {@link ViewCanvasProvider}.
 *
 * Throws if called outside of a provider.
 */
export function useViewCanvasContext(): ViewCanvasContextValue {
  const ctx = useContext(ViewCanvasContext);
  if (ctx === null) {
    throw new Error(
      'useViewCanvasContext must be used within a <ViewCanvasProvider>',
    );
  }
  return ctx;
}

/**
 * Like {@link useViewCanvasContext} but returns `null` instead of throwing
 * when called outside of a {@link ViewCanvasProvider}.
 */
export function useViewCanvasContextSafe(): ViewCanvasContextValue | null {
  return useContext(ViewCanvasContext);
}
