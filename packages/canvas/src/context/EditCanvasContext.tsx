import { createContext, useContext, type ReactNode } from 'react';
import {
  useEditCanvas,
  type UseEditCanvasOptions,
} from '../hooks/useEditCanvas';

/** The full return value of {@link useEditCanvas}, exposed via context. */
export type EditCanvasContextValue = ReturnType<typeof useEditCanvas>;

const EditCanvasContext = createContext<EditCanvasContextValue | null>(null);

export interface EditCanvasProviderProps {
  /** Options forwarded to the underlying {@link useEditCanvas} hook. */
  options?: UseEditCanvasOptions;
  children: ReactNode;
}

/**
 * Calls {@link useEditCanvas} internally and provides the full canvas API
 * to all descendants via React context.
 *
 * Use {@link useEditCanvasContext} in any descendant to access `canvasRef`,
 * `isDirty`, `objects`, `isLoading`, `lockLightMode`, `viewport`,
 * `setMode`, `setBackground`, and every other value that `useEditCanvas`
 * returns — without prop drilling or bridge contexts.
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
 *   const { isDirty, resetDirty } = useEditCanvasContext();
 *   return <SaveButton disabled={!isDirty} onClick={() => { save(); resetDirty(); }} />;
 * }
 * ```
 */
export function EditCanvasProvider({
  options,
  children,
}: EditCanvasProviderProps) {
  const canvas = useEditCanvas(options);
  return (
    <EditCanvasContext.Provider value={canvas}>
      {children}
    </EditCanvasContext.Provider>
  );
}

/**
 * Access the full {@link useEditCanvas} API from any descendant of
 * {@link EditCanvasProvider}.
 *
 * Throws if called outside of a provider.
 */
export function useEditCanvasContext(): EditCanvasContextValue {
  const ctx = useContext(EditCanvasContext);
  if (ctx === null) {
    throw new Error(
      'useEditCanvasContext must be used within an <EditCanvasProvider>',
    );
  }
  return ctx;
}

/**
 * Like {@link useEditCanvasContext} but returns `null` instead of throwing
 * when called outside of an {@link EditCanvasProvider}.
 */
export function useEditCanvasContextSafe(): EditCanvasContextValue | null {
  return useContext(EditCanvasContext);
}
