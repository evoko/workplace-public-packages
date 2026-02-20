import { Canvas as FabricCanvas } from 'fabric';

/**
 * Enable default keyboard shortcuts on the canvas.
 * - Escape / Delete / Backspace: delete selected objects.
 *
 * Returns a cleanup function that removes the listener.
 */
export function enableKeyboardShortcuts(canvas: FabricCanvas): () => void {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Delete' || e.key === 'Backspace') {
      const active = canvas.getActiveObjects();
      if (active.length > 0) {
        canvas.discardActiveObject();
        canvas.remove(...active);
        canvas.requestRenderAll();
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}
