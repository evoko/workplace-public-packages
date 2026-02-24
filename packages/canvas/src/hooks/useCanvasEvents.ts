import { useEffect, useRef, type RefObject } from 'react';
import type { Canvas as FabricCanvas, CanvasEvents } from 'fabric';

/**
 * A map of Fabric canvas event names to their handler functions.
 *
 * Each key is a valid `CanvasEvents` event name and each handler receives the
 * correctly-typed event payload. Set a handler to `undefined` to skip it.
 *
 * Common events include:
 * - `'object:added'`, `'object:removed'`, `'object:modified'`
 * - `'mouse:over'`, `'mouse:out'`, `'mouse:down'`, `'mouse:up'`, `'mouse:move'`
 * - `'mouse:wheel'`, `'after:render'`
 * - `'selection:created'`, `'selection:updated'`, `'selection:cleared'`
 */
export type CanvasEventHandlers = {
  [K in keyof CanvasEvents]?: (event: CanvasEvents[K]) => void;
};

/**
 * Subscribe to Fabric canvas events with automatic cleanup.
 *
 * Handlers are stored in a ref so they always call the latest version without
 * re-subscribing. The hook subscribes once when the canvas becomes available
 * (child `<Canvas>` effects fire before parent effects) and cleans up on unmount.
 *
 * @example
 * ```tsx
 * useCanvasEvents(editor.canvasRef, {
 *   'object:added': (e) => updateList(),
 *   'object:modified': () => setDirty(true),
 *   'object:removed': () => updateList(),
 * });
 * ```
 */
export function useCanvasEvents(
  canvasRef: RefObject<FabricCanvas | null>,
  events: CanvasEventHandlers,
): void {
  const eventsRef = useRef(events);
  eventsRef.current = events;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    type EventName = keyof CanvasEvents;
    // Wrapper uses `unknown` because TypeScript can't correlate a dynamic key
    // with its matching handler type inside a loop (correlated-union limitation).
    // The public `CanvasEventHandlers` type is fully typed per-event.
    type EventCallback = (options: unknown) => void;
    const wrappers = new Map<EventName, EventCallback>();

    for (const key of Object.keys(eventsRef.current) as EventName[]) {
      if (!eventsRef.current[key]) continue;
      const wrapped: EventCallback = (options) => {
        (eventsRef.current[key] as EventCallback | undefined)?.(options);
      };
      canvas.on(key, wrapped);
      wrappers.set(key, wrapped);
    }

    return () => {
      wrappers.forEach((handler, name) => {
        canvas.off(name, handler);
      });
    };
  }, [canvasRef]);
}
