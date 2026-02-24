import type { ViewportController } from '../viewport';

/** Restore the viewport to select mode if a controller was provided. */
export function restoreViewport(viewport?: ViewportController) {
  if (!viewport) return;
  viewport.setEnabled(true);
  viewport.setMode('select');
}

/**
 * Track whether the Shift key is currently held.
 * Optionally calls `onChange` whenever the state changes (useful for
 * triggering preview updates while a drag is in progress).
 */
export function createShiftKeyTracker(onChange?: (held: boolean) => void): {
  readonly held: boolean;
  cleanup: () => void;
} {
  let shiftHeld = false;
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Shift' && !shiftHeld) {
      shiftHeld = true;
      onChange?.(true);
    }
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === 'Shift' && shiftHeld) {
      shiftHeld = false;
      onChange?.(false);
    }
  };
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  return {
    get held() {
      return shiftHeld;
    },
    cleanup() {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    },
  };
}
