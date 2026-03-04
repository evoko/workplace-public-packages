import { useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'delaying' | 'loading' | 'ending';

/**
 * Delays showing a loading indicator so that fast loads don't cause a flicker.
 *
 * State machine:
 *   idle ──(loading=true)──▶ delaying ──(delay ms)──▶ loading ──(minDuration ms)──▶ ending
 *     ▲                        │                                                      │
 *     └──(loading=false)───────┘                        └────────(loading=false)──────┘
 *
 * - Waits `delay` ms before showing the indicator.
 * - Once shown, keeps it visible for at least `minDuration` ms.
 * - If loading finishes before the delay, no indicator is shown at all.
 */
export function useLoadingDelay(
  loading: boolean,
  { delay = 150, minDuration = 500 } = {},
): boolean {
  const [status, setStatus] = useState<Status>('idle');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPending() {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  useEffect(() => {
    if (loading && status === 'idle') {
      clearPending();

      // After the initial delay, show the indicator and schedule end.
      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = setTimeout(() => {
          setStatus('ending');
        }, minDuration);

        setStatus('loading');
      }, delay);

      setStatus('delaying');
    }

    if (!loading && status !== 'loading') {
      clearPending();
      setStatus('idle');
    }
  }, [loading, delay, minDuration, status]);

  useEffect(() => clearPending, []);

  return status === 'loading' || status === 'ending';
}
