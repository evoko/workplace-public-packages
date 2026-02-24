import { Canvas as FabricCanvas, Rect, type FabricObject } from 'fabric';
import { restoreCircleConstraints } from './shapes/circle';
import { DEFAULT_CONTROL_STYLE } from './styles';

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

  canvas.on('before:render', applyScaledStrokes);

  return () => {
    canvas.off('before:render', applyScaledStrokes);
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
   * The `'data'` and `'shapeType'` properties are always included.
   * Default: `['data', 'shapeType']`.
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
 * - Always includes the `'data'` and `'shapeType'` custom properties.
 * - If {@link enableScaledStrokes} is active, temporarily restores all stroke
 *   widths to their base values before serializing, then reapplies the
 *   zoom-scaled values. This ensures the saved JSON always contains the
 *   intended visual stroke width, not the zoom-adjusted one.
 */
export function serializeCanvas(
  canvas: FabricCanvas,
  options?: SerializeOptions,
): object {
  const properties = [
    'data',
    'shapeType',
    // Control styling — absent from Fabric's default toObject output
    'borderColor',
    'cornerColor',
    'cornerStrokeColor',
    'transparentCorners',
    // Interaction locks — absent from Fabric's default toObject output
    'lockRotation',
    'lockUniScaling',
    ...(options?.properties ?? []),
  ];

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

  // Strip backgroundColor — it's theme-dependent, not user data. The
  // container's CSS background should control the canvas background color.
  delete json.backgroundColor;

  // Reapply the zoom-scaled values
  scaledWidths.forEach((scaled, obj) => {
    obj.strokeWidth = scaled;
  });

  return json;
}

/**
 * Options for {@link loadCanvas}.
 */
export interface LoadCanvasOptions {
  /**
   * If provided, objects for which this function returns `false` are removed
   * from the canvas after loading. Useful for filtering out objects whose IDs
   * no longer exist in the application's data model.
   */
  filter?: (obj: FabricObject) => boolean;
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
  options?: LoadCanvasOptions,
): Promise<FabricObject[]> {
  await canvas.loadFromJSON(json);

  // Strip backgroundColor restored from old canvas data —
  // background color is a runtime/theme concern, not persisted data.
  // Mirrors serializeCanvas which already deletes backgroundColor on save.
  canvas.backgroundColor = '';

  // Filter out non-matching objects before applying styles
  if (options?.filter) {
    const toRemove: FabricObject[] = [];
    canvas.forEachObject((obj) => {
      if (!options.filter!(obj)) toRemove.push(obj);
    });
    for (const obj of toRemove) canvas.remove(obj);
  }

  // Normalize legacy origin: old data uses originX/Y 'left'/'top', but the
  // new canvas expects 'center'/'center'. Compute the visual center before
  // switching origins so objects stay in the same position.
  canvas.forEachObject((obj) => {
    if (obj.originX === 'center' && obj.originY === 'center') return;
    const center = obj.getCenterPoint();
    obj.set({
      originX: 'center',
      originY: 'center',
      left: center.x,
      top: center.y,
    });
    obj.setCoords();
  });

  // Re-apply per-object state that Fabric does not persist through serialization.
  canvas.forEachObject((obj) => {
    // Control styling (borderColor, cornerColor, etc.) is absent from Fabric's
    // default toObject output, so we restore it explicitly for all objects.
    obj.set(DEFAULT_CONTROL_STYLE);
    // Circle-specific constraints (control visibility, lock flags).
    if (obj.shapeType === 'circle' && obj instanceof Rect) {
      restoreCircleConstraints(obj);
    }
  });
  canvas.requestRenderAll();

  return canvas.getObjects() as FabricObject[];
}
