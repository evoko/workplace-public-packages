import { Canvas as FabricCanvas } from 'fabric';
import { serializeCanvas, loadCanvas } from './serialization';
import type { CanvasJSON } from './types';

export interface HistoryOptions {
  /** Maximum number of snapshots to keep. Oldest are dropped when exceeded. Default: 50. */
  maxSize?: number;
  /** Debounce delay in milliseconds before capturing a snapshot after a change. Default: 300. */
  debounce?: number;
}

export interface HistoryTracker {
  /** Undo the last change. No-op if at the beginning of history. */
  undo: () => Promise<void>;
  /** Redo a previously undone change. No-op if at the end of history. */
  redo: () => Promise<void>;
  /** Whether an undo operation is available. */
  canUndo: () => boolean;
  /** Whether a redo operation is available. */
  canRedo: () => boolean;
  /** Manually push the current canvas state as a snapshot. */
  pushSnapshot: () => void;
  /** Remove all event listeners and clear history. */
  cleanup: () => void;
}

/**
 * Create a snapshot-based undo/redo tracker for a canvas.
 *
 * Listens to `object:added`, `object:modified`, and `object:removed` events
 * and captures a serialized snapshot of the canvas state (debounced).
 *
 * `undo()` and `redo()` load adjacent snapshots via `loadCanvas`.
 * During undo/redo operations, event-triggered captures are suppressed.
 */
export function createHistoryTracker(
  canvas: FabricCanvas,
  options?: HistoryOptions,
): HistoryTracker {
  const maxSize = options?.maxSize ?? 50;
  const debounceMs = options?.debounce ?? 300;

  const snapshots: CanvasJSON[] = [];
  let currentIndex = -1;
  let isUndoRedo = false;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  function captureSnapshot() {
    if (isUndoRedo) return;

    const snapshot = serializeCanvas(canvas);

    // Drop any redo history beyond current position
    if (currentIndex < snapshots.length - 1) {
      snapshots.length = currentIndex + 1;
    }

    snapshots.push(snapshot);

    // Enforce max size
    if (snapshots.length > maxSize) {
      snapshots.shift();
    }

    currentIndex = snapshots.length - 1;
  }

  function debouncedCapture() {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      captureSnapshot();
    }, debounceMs);
  }

  const onChange = () => {
    if (!isUndoRedo) debouncedCapture();
  };

  canvas.on('object:added', onChange);
  canvas.on('object:modified', onChange);
  canvas.on('object:removed', onChange);

  async function loadSnapshot(index: number) {
    if (index < 0 || index >= snapshots.length) return;

    isUndoRedo = true;
    currentIndex = index;

    try {
      await loadCanvas(canvas, snapshots[index]);
    } finally {
      isUndoRedo = false;
    }
  }

  return {
    async undo() {
      if (currentIndex <= 0) return;
      await loadSnapshot(currentIndex - 1);
    },

    async redo() {
      if (currentIndex >= snapshots.length - 1) return;
      await loadSnapshot(currentIndex + 1);
    },

    canUndo() {
      return currentIndex > 0;
    },

    canRedo() {
      return currentIndex < snapshots.length - 1;
    },

    pushSnapshot() {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      captureSnapshot();
    },

    cleanup() {
      if (debounceTimer !== null) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
      canvas.off('object:added', onChange);
      canvas.off('object:modified', onChange);
      canvas.off('object:removed', onChange);
      snapshots.length = 0;
      currentIndex = -1;
    },
  };
}
