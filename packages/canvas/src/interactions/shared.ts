import { FabricObject } from 'fabric';
import type { ViewportController } from '../viewport';

export interface InteractionModeOptions {
  onCreated?: (obj: FabricObject) => void;
  viewport?: ViewportController;
}

/** Restore the viewport to select mode if a controller was provided. */
export function restoreViewport(viewport?: ViewportController) {
  if (!viewport) return;
  viewport.setEnabled(true);
  viewport.setMode('select');
}
