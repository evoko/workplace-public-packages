import { useEffect, useState } from 'react';

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

  // Synchronous transitions driven by `loading` happen during render.
  if (loading && status === 'idle') {
    setStatus('delaying');
  } else if (!loading && (status === 'delaying' || status === 'ending')) {
    setStatus('idle');
  }

  // Timed transitions: delaying → loading after `delay`, loading → ending after
  // `minDuration`. The cleanup cancels a pending timer when status changes.
  useEffect(() => {
    if (status !== 'delaying' && status !== 'loading') return;
    const timeout = setTimeout(
      () => setStatus(status === 'delaying' ? 'loading' : 'ending'),
      status === 'delaying' ? delay : minDuration,
    );
    return () => clearTimeout(timeout);
  }, [status, delay, minDuration]);

  return status === 'loading' || status === 'ending';
}
