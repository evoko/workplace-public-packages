import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  useEditCanvas,
  type UseEditCanvasOptions,
} from '../hooks/useEditCanvas';
import { CanvasRefContext } from './CanvasRefContext';

/** The full return value of {@link useEditCanvas}, exposed via context. */
export type EditCanvasContextValue = ReturnType<typeof useEditCanvas>;

/** Viewport slice — changes on every zoom/scroll. */
export type EditCanvasViewportValue = Pick<
  EditCanvasContextValue,
  'zoom' | 'viewport'
>;

/** State slice — everything except canvasRef and viewport. */
export type EditCanvasStateValue = Omit<
  EditCanvasContextValue,
  'canvasRef' | 'zoom' | 'viewport'
>;

// --- Internal sub-contexts (not exported) ---

const EditViewportContext = createContext<EditCanvasViewportValue | null>(null);
const EditStateContext = createContext<EditCanvasStateValue | null>(null);

export interface EditCanvasProviderProps {
  /** Options forwarded to the underlying {@link useEditCanvas} hook. */
  options?: UseEditCanvasOptions;
  children: ReactNode;
}

/**
 * Calls {@link useEditCanvas} internally and provides the full canvas API
 * to all descendants via React context.
 *
 * Internally splits state into three contexts (ref, viewport, state) so
 * that helper hooks like {@link useCanvasRef} and components like
 * {@link ObjectOverlay} do not re-render on unrelated state changes.
 *
 * Use {@link useEditCanvasContext} in any descendant to access the full
 * combined value, or use the fine-grained hooks
 * {@link useEditCanvasViewport} / {@link useEditCanvasState} for better
 * performance.
 *
 * Descendant components can also use {@link ObjectOverlay},
 * {@link useCanvasEvents}, {@link useCanvasTooltip}, and
 * {@link useCanvasClick} without passing `canvasRef` explicitly — they
 * read it from the nearest provider automatically.
 *
 * @example
 * ```tsx
 * <EditCanvasProvider options={{
 *   canvasData: savedJson,
 *   invertBackground: isDarkMode,
 *   trackChanges: true,
 *   history: true,
 * }}>
 *   <MyCanvas />
 *   <MySidebar />
 *   <MyToolbar />
 * </EditCanvasProvider>
 *
 * function MyCanvas() {
 *   const { onReady } = useEditCanvasContext();
 *   return <Canvas onReady={onReady} />;
 * }
 *
 * function MySidebar() {
 *   const { isDirty, resetDirty } = useEditCanvasState();
 *   return <SaveButton disabled={!isDirty} onClick={() => { save(); resetDirty(); }} />;
 * }
 * ```
 */
export function EditCanvasProvider({
  options,
  children,
}: EditCanvasProviderProps) {
  const canvas = useEditCanvas(options);

  const viewportValue = useMemo<EditCanvasViewportValue>(
    () => ({ zoom: canvas.zoom, viewport: canvas.viewport }),
    [canvas.zoom, canvas.viewport],
  );

  const stateValue = useMemo<EditCanvasStateValue>(
    () => ({
      onReady: canvas.onReady,
      objects: canvas.objects,
      isLoading: canvas.isLoading,
      selected: canvas.selected,
      isEditingVertices: canvas.isEditingVertices,
      setMode: canvas.setMode,
      setBackground: canvas.setBackground,
      isDirty: canvas.isDirty,
      resetDirty: canvas.resetDirty,
      markDirty: canvas.markDirty,
      undo: canvas.undo,
      redo: canvas.redo,
      canUndo: canvas.canUndo,
      canRedo: canvas.canRedo,
      lockLightMode: canvas.lockLightMode,
      setLockLightMode: canvas.setLockLightMode,
    }),
    // Only reactive state — stable callbacks omitted
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      canvas.objects,
      canvas.isLoading,
      canvas.selected,
      canvas.isEditingVertices,
      canvas.isDirty,
      canvas.canUndo,
      canvas.canRedo,
      canvas.lockLightMode,
    ],
  );

  return (
    <CanvasRefContext.Provider value={canvas.canvasRef}>
      <EditViewportContext.Provider value={viewportValue}>
        <EditStateContext.Provider value={stateValue}>
          {children}
        </EditStateContext.Provider>
      </EditViewportContext.Provider>
    </CanvasRefContext.Provider>
  );
}

/**
 * Access the full {@link useEditCanvas} API from any descendant of
 * {@link EditCanvasProvider}.
 *
 * This subscribes to all three internal contexts, so the component will
 * re-render on any state change. For better performance, prefer
 * {@link useEditCanvasViewport} or {@link useEditCanvasState}.
 *
 * Throws if called outside of a provider.
 */
export function useEditCanvasContext(): EditCanvasContextValue {
  const canvasRef = useContext(CanvasRefContext);
  const viewport = useContext(EditViewportContext);
  const state = useContext(EditStateContext);

  if (canvasRef === null || viewport === null || state === null) {
    throw new Error(
      'useEditCanvasContext must be used within an <EditCanvasProvider>',
    );
  }

  return useMemo(
    () => ({ canvasRef, ...viewport, ...state }) as EditCanvasContextValue,
    [canvasRef, viewport, state],
  );
}

/**
 * Like {@link useEditCanvasContext} but returns `null` instead of throwing
 * when called outside of an {@link EditCanvasProvider}.
 */
export function useEditCanvasContextSafe(): EditCanvasContextValue | null {
  const canvasRef = useContext(CanvasRefContext);
  const viewport = useContext(EditViewportContext);
  const state = useContext(EditStateContext);

  // useMemo must be called unconditionally (Rules of Hooks).
  // EditStateContext is the discriminator — only non-null inside EditCanvasProvider.
  return useMemo(
    () =>
      state !== null && canvasRef !== null && viewport !== null
        ? ({ canvasRef, ...viewport, ...state } as EditCanvasContextValue)
        : null,
    [canvasRef, viewport, state],
  );
}

/**
 * Access only the viewport slice (zoom level and viewport controls) from
 * the nearest {@link EditCanvasProvider}.
 *
 * This subscribes only to viewport changes — the component will **not**
 * re-render when selection, dirty state, or other non-viewport state changes.
 *
 * Throws if called outside of a provider.
 */
export function useEditCanvasViewport(): EditCanvasViewportValue {
  const ctx = useContext(EditViewportContext);
  if (ctx === null) {
    throw new Error(
      'useEditCanvasViewport must be used within an <EditCanvasProvider>',
    );
  }
  return ctx;
}

/**
 * Access only the non-viewport state slice from the nearest
 * {@link EditCanvasProvider}.
 *
 * This subscribes only to state changes (selection, dirty, history, etc.) —
 * the component will **not** re-render on zoom/scroll changes.
 *
 * Throws if called outside of a provider.
 */
export function useEditCanvasState(): EditCanvasStateValue {
  const ctx = useContext(EditStateContext);
  if (ctx === null) {
    throw new Error(
      'useEditCanvasState must be used within an <EditCanvasProvider>',
    );
  }
  return ctx;
}
