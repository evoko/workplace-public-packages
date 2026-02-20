import type { ViewportController } from '../viewport';

/** Restore the viewport to select mode if a controller was provided. */
export function restoreViewport(viewport?: ViewportController) {
  if (!viewport) return;
  viewport.setEnabled(true);
  viewport.setMode('select');
}
