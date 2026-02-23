import { Canvas as FabricCanvas, type FabricObject } from 'fabric';

/**
 * Module-level map from FabricObject to its "base" (unscaled) stroke width.
 * Shared between enableScaledStrokes and serializeCanvas so they stay in sync
 * without leaking mutable state outside the module.
 */
const strokeBaseMap = new WeakMap<FabricObject, number>();

/**
 * Enable zoom-independent stroke widths on a canvas.
 *
 * On every render, each object's `strokeWidth` is set to `base / zoom` so
 * strokes always appear as one visual pixel regardless of zoom level. The
 * original (base) stroke width is stored in an internal WeakMap and is
 * automatically restored before serialization by {@link serializeCanvas}.
 *
 * Returns a cleanup function that removes the listener and restores all
 * stroke widths to their base values.
 */
export function enableScaledStrokes(canvas: FabricCanvas): () => void {
  function applyScaledStrokes() {
    const zoom = canvas.getZoom();
    canvas.forEachObject((obj) => {
      if (!obj.strokeWidth && obj.strokeWidth !== 0) return;
      if (!strokeBaseMap.has(obj)) {
        // Record the base value on first encounter
        strokeBaseMap.set(obj, obj.strokeWidth ?? 0);
      }
      const base = strokeBaseMap.get(obj)!;
      if (base === 0) return;
      obj.strokeWidth = base / zoom;
    });
  }

  canvas.on('after:render', applyScaledStrokes);

  return () => {
    canvas.off('after:render', applyScaledStrokes);
    // Restore all objects to their base stroke widths on cleanup
    canvas.forEachObject((obj) => {
      const base = strokeBaseMap.get(obj);
      if (base !== undefined) {
        obj.strokeWidth = base;
      }
    });
  };
}

/**
 * Options for {@link serializeCanvas}.
 */
export interface SerializeOptions {
  /**
   * Additional Fabric object properties to include in the JSON output.
   * The `'data'` property is always included.
   * Default: `['data']`.
   */
  properties?: string[];
}

/**
 * Return the base (unscaled) stroke width for an object.
 *
 * When {@link enableScaledStrokes} is active, `obj.strokeWidth` is a
 * zoom-adjusted value. This function returns the original intended width that
 * was recorded before any zoom adjustment was applied. Falls back to the
 * object's current `strokeWidth` if the object has never been seen by
 * `enableScaledStrokes` (e.g. if the feature is disabled).
 */
export function getBaseStrokeWidth(obj: FabricObject): number {
  return strokeBaseMap.get(obj) ?? obj.strokeWidth ?? 0;
}

/**
 * Serialize the canvas to a plain object, ready for `JSON.stringify`.
 *
 * - Always includes the `'data'` custom property (for shape IDs and types).
 * - If {@link enableScaledStrokes} is active, temporarily restores all stroke
 *   widths to their base values before serializing, then reapplies the
 *   zoom-scaled values. This ensures the saved JSON always contains the
 *   intended visual stroke width, not the zoom-adjusted one.
 */
export function serializeCanvas(
  canvas: FabricCanvas,
  options?: SerializeOptions,
): object {
  const properties = ['data', ...(options?.properties ?? [])];

  // Save any currently scaled stroke widths and restore base values
  const scaledWidths = new Map<FabricObject, number>();
  canvas.forEachObject((obj) => {
    const base = strokeBaseMap.get(obj);
    if (base !== undefined && obj.strokeWidth !== base) {
      scaledWidths.set(obj, obj.strokeWidth ?? 0);
      obj.strokeWidth = base;
    }
  });

  const json = canvas.toObject(properties);

  // Reapply the zoom-scaled values
  scaledWidths.forEach((scaled, obj) => {
    obj.strokeWidth = scaled;
  });

  return json;
}

/**
 * Load a canvas from a previously serialized JSON object (from {@link serializeCanvas}).
 *
 * Clears the canvas and restores all objects, then requests a re-render.
 * The returned promise resolves once the canvas is fully loaded.
 */
export async function loadCanvas(
  canvas: FabricCanvas,
  json: object,
): Promise<void> {
  await canvas.loadFromJSON(json);
  canvas.requestRenderAll();
}
