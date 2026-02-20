import { Canvas as FabricCanvas, FabricObject, Point } from 'fabric';
import type { SnappableInteractionOptions } from '../types';
import {
  snapCursorPoint,
  getSnapPoints,
  drawCursorGuidelines,
  type CursorSnapResult,
  type GuidelineStyle,
} from '../alignment';

/** Context object for managing snapping within an interaction mode. */
export interface InteractionSnappingContext {
  /** Whether snapping is enabled. */
  enabled: boolean;
  /** Snap a raw point, returning the snapped coordinates. */
  snap(rawX: number, rawY: number): { x: number; y: number };
  /** Snap a raw point and store the result for guideline rendering on next frame. */
  snapWithGuidelines(rawX: number, rawY: number): { x: number; y: number };
  /** Clear the stored snap result (call when finalizing or on mouse-up). */
  clearSnapResult(): void;
  /** Objects to exclude from snap targets (e.g. preview elements). */
  excludeSet: Set<FabricObject>;
  /** Remove all event listeners and clear state. */
  cleanup(): void;
}

/**
 * Create a snapping context for an interaction mode.
 * Handles target point caching, snap calculations, and guideline rendering.
 *
 * @param getAdditionalTargets Optional callback that returns extra snap targets
 *   (e.g. placed polygon vertices for self-alignment in drawToCreate).
 */
export function createInteractionSnapping(
  canvas: FabricCanvas,
  options?: Pick<SnappableInteractionOptions, 'snapping' | 'enableAlignment'>,
  getAdditionalTargets?: () => Point[],
): InteractionSnappingContext {
  const snapEnabled =
    options?.enableAlignment !== undefined
      ? options.enableAlignment
      : options?.snapping !== false;

  const snapMargin =
    typeof options?.snapping === 'object' ? options.snapping.margin : undefined;
  const guidelineStyle: GuidelineStyle | undefined =
    typeof options?.snapping === 'object'
      ? options.snapping.guidelineStyle
      : undefined;

  const excludeSet = new Set<FabricObject>();
  let cachedTargetPoints: Point[] | null = null;
  let lastSnapResult: CursorSnapResult | null = null;

  function getTargetPoints(): Point[] {
    if (cachedTargetPoints) return cachedTargetPoints;
    cachedTargetPoints = [];
    canvas.forEachObject((obj) => {
      if (!obj.visible) return;
      if (excludeSet.has(obj)) return;
      cachedTargetPoints!.push(...getSnapPoints(obj));
    });
    return cachedTargetPoints;
  }

  function getAllTargetPoints(): Point[] {
    const base = getTargetPoints();
    if (!getAdditionalTargets) return base;
    const additional = getAdditionalTargets();
    return additional.length > 0 ? [...base, ...additional] : base;
  }

  const invalidateCache = () => {
    cachedTargetPoints = null;
  };

  const afterRender = () => {
    if (lastSnapResult) {
      drawCursorGuidelines(canvas, lastSnapResult, guidelineStyle);
    }
  };

  if (snapEnabled) {
    canvas.on('object:added', invalidateCache);
    canvas.on('object:removed', invalidateCache);
    canvas.on('after:render', afterRender);
  }

  function snap(rawX: number, rawY: number): { x: number; y: number } {
    if (!snapEnabled) return { x: rawX, y: rawY };

    const result = snapCursorPoint(canvas, new Point(rawX, rawY), {
      margin: snapMargin,
      exclude: excludeSet,
      targetPoints: getAllTargetPoints(),
    });
    return { x: result.point.x, y: result.point.y };
  }

  function snapWithGuidelines(
    rawX: number,
    rawY: number,
  ): { x: number; y: number } {
    if (!snapEnabled) {
      lastSnapResult = null;
      return { x: rawX, y: rawY };
    }

    lastSnapResult = snapCursorPoint(canvas, new Point(rawX, rawY), {
      margin: snapMargin,
      exclude: excludeSet,
      targetPoints: getAllTargetPoints(),
    });
    return { x: lastSnapResult.point.x, y: lastSnapResult.point.y };
  }

  return {
    enabled: snapEnabled,
    snap,
    snapWithGuidelines,
    clearSnapResult() {
      lastSnapResult = null;
    },
    excludeSet,
    cleanup() {
      if (snapEnabled) {
        canvas.off('object:added', invalidateCache);
        canvas.off('object:removed', invalidateCache);
        canvas.off('after:render', afterRender);
      }
      lastSnapResult = null;
    },
  };
}
