import type { Canvas } from 'fabric';
import type { TransformEvent } from './objectAlignmentUtils';

export interface RotationSnapOptions {
  /**
   * Snap angle to multiples of this interval (degrees) when Shift is held.
   * Default: 15.
   */
  interval?: number;
}

function snapToInterval(angle: number, interval: number): number {
  return Math.round(angle / interval) * interval;
}

/**
 * Enable rotation snapping on a Fabric canvas.
 * When Shift is held while rotating an object via its rotation handle,
 * the angle snaps to the nearest multiple of `interval` degrees (default: 15°).
 * Returns a cleanup function.
 */
export function enableRotationSnap(
  canvas: Canvas,
  options?: RotationSnapOptions,
): () => void {
  const interval = options?.interval ?? 15;

  const onRotating = (e: TransformEvent) => {
    if (!(e.e as MouseEvent).shiftKey) return;
    e.target.angle = snapToInterval(e.target.angle as number, interval);
  };

  canvas.on('object:rotating', onRotating);
  return () => canvas.off('object:rotating', onRotating);
}
