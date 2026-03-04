import { useCallback, useEffect, useRef } from 'react';

/** Default debounce delay (ms) shared across all BiampTable components. */
export const BIAMP_TABLE_DEBOUNCE_DELAY = 300;

/**
 * Returns a debounced version of the given callback.
 * The debounced function delays invocation until `delay` ms after
 * the last call. The pending timer is cleared on unmount.
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number = BIAMP_TABLE_DEBOUNCE_DELAY,
): (...args: Args) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref fresh without restarting timers.
  callbackRef.current = callback;

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    };
  }, []);

  return useCallback(
    (...args: Args) => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => callbackRef.current(...args),
        delay,
      );
    },
    [delay],
  );
}
