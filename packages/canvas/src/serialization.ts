import {
  Canvas as FabricCanvas,
  FabricImage,
  Rect,
  type FabricObject,
  type TOriginX,
  type TOriginY,
} from 'fabric';
import { getBackgroundContrast, getBackgroundInverted } from './background';
import { restoreCircleConstraints } from './shapes/circle';
import { DEFAULT_CONTROL_STYLE } from './styles';
import type { CanvasJSON } from './types';

/**
 * Module-level map from FabricObject to its "base" (unscaled) stroke width.
 * Shared between enableScaledStrokes and serializeCanvas so they stay in sync
 * without leaking mutable state outside the module.
 */
const strokeBaseMap = new WeakMap<FabricObject, number>();

/**
 * Module-level map from Rect to its original rx/ry values before the
 * view border radius was applied. Used by serializeCanvas to strip
 * the visual-only border radius before saving.
 */
const borderRadiusBaseMap = new WeakMap<Rect, { rx: number; ry: number }>();

const DEFAULT_VIEW_BORDER_RADIUS = 4;

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
 * Keep border radii visually constant on Rects loaded via {@link loadCanvas}.
 *
 * On every render, each tracked Rect's `rx`/`ry` is recalculated as
 * `VIEW_BORDER_RADIUS / scale` so corners always appear circular regardless
 * of non-uniform scaling. The original rx/ry values are stored in an internal
 * WeakMap and automatically restored before serialization by
 * {@link serializeCanvas}.
 *
 * Returns a cleanup function that removes the listener and restores all
 * rx/ry values to their originals.
 */
export interface ScaledBorderRadiusOptions {
  /** Visual border radius in pixels. Default: 4. */
  radius?: number;
}

export function enableScaledBorderRadius(
  canvas: FabricCanvas,
  options?: ScaledBorderRadiusOptions,
): () => void {
  const radius = options?.radius ?? DEFAULT_VIEW_BORDER_RADIUS;

  function applyScaledBorderRadius() {
    canvas.forEachObject((obj) => {
      if (!(obj instanceof Rect)) return;
      if (!borderRadiusBaseMap.has(obj)) return;
      const rx = radius / (obj.scaleX ?? 1);
      const ry = radius / (obj.scaleY ?? 1);
      obj.set({ rx, ry });
    });
  }

  canvas.on('before:render', applyScaledBorderRadius);

  return () => {
    canvas.off('before:render', applyScaledBorderRadius);
    canvas.forEachObject((obj) => {
      if (!(obj instanceof Rect)) return;
      const base = borderRadiusBaseMap.get(obj);
      if (base !== undefined) {
        obj.set({ rx: base.rx, ry: base.ry });
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

// --- Serialization helpers ---
// Each helper temporarily mutates canvas/object state for serialization
// and returns a function that restores the original runtime state.

type SavedOrigin = {
  originX: TOriginX;
  originY: TOriginY;
  left: number;
  top: number;
};

/** Strip zoom-scaled stroke widths, restoring base values for serialization. */
function prepareStrokeWidths(canvas: FabricCanvas): () => void {
  const scaledWidths = new Map<FabricObject, number>();
  canvas.forEachObject((obj) => {
    const base = strokeBaseMap.get(obj);
    if (base !== undefined && obj.strokeWidth !== base) {
      scaledWidths.set(obj, obj.strokeWidth ?? 0);
      obj.strokeWidth = base;
    }
  });
  return () =>
    scaledWidths.forEach((scaled, obj) => {
      obj.strokeWidth = scaled;
    });
}

/** Strip visual-only border radii, restoring original rx/ry for serialization. */
function prepareBorderRadii(canvas: FabricCanvas): () => void {
  const appliedRadii = new Map<Rect, { rx: number; ry: number }>();
  canvas.forEachObject((obj) => {
    if (!(obj instanceof Rect)) return;
    const base = borderRadiusBaseMap.get(obj);
    if (base !== undefined) {
      appliedRadii.set(obj, { rx: obj.rx ?? 0, ry: obj.ry ?? 0 });
      obj.set({ rx: base.rx, ry: base.ry });
    }
  });
  return () =>
    appliedRadii.forEach((radii, obj) => {
      obj.set(radii);
    });
}

/** Convert objects from center/center to left/top origin for Fabric 6 compatibility. */
function prepareObjectOrigins(canvas: FabricCanvas): () => void {
  const savedOrigins = new Map<FabricObject, SavedOrigin>();
  canvas.forEachObject((obj) => {
    if (obj.originX === 'left' && obj.originY === 'top') return;
    savedOrigins.set(obj, {
      originX: obj.originX,
      originY: obj.originY,
      left: obj.left ?? 0,
      top: obj.top ?? 0,
    });
    const leftTop = obj.getPositionByOrigin('left', 'top');
    obj.set({
      originX: 'left',
      originY: 'top',
      left: leftTop.x,
      top: leftTop.y,
    });
  });
  return () =>
    savedOrigins.forEach((saved, obj) => {
      obj.set(saved);
    });
}

/** Convert background image from center/center to left/top origin. */
function prepareBackgroundOrigin(canvas: FabricCanvas): () => void {
  const bg = canvas.backgroundImage;
  if (
    !(bg instanceof FabricImage) ||
    (bg.originX === 'left' && bg.originY === 'top')
  ) {
    return () => {};
  }
  const saved: SavedOrigin = {
    originX: bg.originX,
    originY: bg.originY,
    left: bg.left ?? 0,
    top: bg.top ?? 0,
  };
  const leftTop = bg.getPositionByOrigin('left', 'top');
  bg.set({ originX: 'left', originY: 'top', left: leftTop.x, top: leftTop.y });
  return () => {
    bg.set(saved);
  };
}

/** Add strokeWidthBase to obj.data for backward compatibility with old canvas. */
function prepareStrokeWidthBaseData(canvas: FabricCanvas): () => void {
  const savedData = new Map<FabricObject, FabricObject['data']>();
  canvas.forEachObject((obj) => {
    const base = strokeBaseMap.get(obj) ?? obj.strokeWidth;
    if (base !== undefined && base !== 0 && obj.data) {
      savedData.set(obj, obj.data);
      (obj as unknown as { data: Record<string, unknown> }).data = {
        ...(obj.data as Record<string, unknown>),
        strokeWidthBase: base,
      };
    }
  });
  return () =>
    savedData.forEach((originalData, obj) => {
      (obj as unknown as { data: FabricObject['data'] }).data = originalData;
    });
}

// --- Public serialization API ---

/**
 * Serialize the canvas to a plain object, ready for `JSON.stringify`.
 *
 * The output uses Fabric 6 conventions (`originX: 'left'`, `originY: 'top'`,
 * `backgroundFilters`, `data.strokeWidthBase`) so saved data is readable by
 * both old (Fabric 6) and new (Fabric 7) canvas implementations.
 *
 * Internally, the canvas keeps `center/center` origins at runtime. This
 * function temporarily converts objects to `left/top` origin before calling
 * `toObject()`, then restores the runtime state immediately after.
 */
export function serializeCanvas(
  canvas: FabricCanvas,
  options?: SerializeOptions,
): CanvasJSON {
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

  // Temporarily mutate canvas state for backward-compatible serialization.
  // Each prepare* call returns a restore function to undo the mutation.
  const restoreStrokeWidths = prepareStrokeWidths(canvas);
  const restoreBorderRadii = prepareBorderRadii(canvas);
  const restoreOrigins = prepareObjectOrigins(canvas);
  const restoreBgOrigin = prepareBackgroundOrigin(canvas);
  const restoreData = prepareStrokeWidthBaseData(canvas);

  const json = canvas.toObject(properties) as CanvasJSON;

  // Strip backgroundColor — it's theme-dependent, not user data.
  delete json.backgroundColor;

  // Add backward-compatible canvas-level properties.
  (json as Record<string, unknown>).backgroundFilters = {
    opacity: getBackgroundContrast(canvas),
    inverted: getBackgroundInverted(canvas),
  };
  if (canvas.lockLightMode !== undefined) {
    (json as Record<string, unknown>).lockLightMode = canvas.lockLightMode;
  }

  // Restore all runtime state.
  restoreStrokeWidths();
  restoreBorderRadii();
  restoreOrigins();
  restoreBgOrigin();
  restoreData();

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
  /**
   * Visual border radius applied to loaded Rects (excluding circles and DEVICE objects).
   * Pass a number to customize, or `false` to skip entirely. Default: `4`.
   */
  borderRadius?: number | false;
}

/**
 * Load a canvas from a previously serialized JSON object (from {@link serializeCanvas}).
 *
 * Clears the canvas and restores all objects, then requests a re-render.
 * The returned promise resolves once the canvas is fully loaded.
 */
export async function loadCanvas(
  canvas: FabricCanvas,
  json: CanvasJSON | object,
  options?: LoadCanvasOptions,
): Promise<FabricObject[]> {
  await canvas.loadFromJSON(json);

  // Strip backgroundColor restored from old canvas data —
  // background color is a runtime/theme concern, not persisted data.
  // Mirrors serializeCanvas which already deletes backgroundColor on save.
  canvas.backgroundColor = '';

  // Strip legacy `backgroundFilters` custom property from old canvas data.
  // The old implementation stored contrast/inversion state as a custom canvas
  // property; the new canvas reads actual Fabric filters on the image directly.
  delete (canvas as unknown as Record<string, unknown>).backgroundFilters;

  // Restore lockLightMode from serialized data. Fabric's loadFromJSON sets
  // unknown top-level properties on the canvas instance, so we read and
  // re-assign it to the typed augmented property.
  const rawCanvas = canvas as unknown as Record<string, unknown>;
  if (rawCanvas.lockLightMode !== undefined) {
    canvas.lockLightMode = rawCanvas.lockLightMode as boolean;
  }

  // Normalize background image origin: old data (Fabric 6) uses originX/Y
  // 'left'/'top' while the new canvas uses 'center'/'center'. Compute the
  // visual center before switching so the image stays in the same position.
  const bg = canvas.backgroundImage;
  if (bg instanceof FabricImage) {
    if (bg.originX !== 'center' || bg.originY !== 'center') {
      const center = bg.getCenterPoint();
      bg.set({
        originX: 'center',
        originY: 'center',
        left: center.x,
        top: center.y,
      });
      bg.setCoords();
    }
  }

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
    // Strip legacy `strokeWidthBase` from obj.data — the old canvas stored the
    // base stroke width by mutating data. The new canvas uses internal WeakMaps.
    const data = obj.data as Record<string, unknown> | undefined;
    if (data?.strokeWidthBase !== undefined) {
      delete data.strokeWidthBase;
    }
    // Control styling (borderColor, cornerColor, etc.) is absent from Fabric's
    // default toObject output, so we restore it explicitly for all objects.
    obj.set(DEFAULT_CONTROL_STYLE);
    // Circle-specific constraints (control visibility, lock flags).
    if (obj.shapeType === 'circle' && obj instanceof Rect) {
      restoreCircleConstraints(obj);
    }
    // Apply visual border radius to Rects (excluding circles and DEVICE objects).
    // Compensate for non-uniform scaling so corners appear circular.
    // Original values are stored so serializeCanvas can strip them before saving.
    const borderRadius = options?.borderRadius ?? DEFAULT_VIEW_BORDER_RADIUS;
    if (
      borderRadius !== false &&
      obj instanceof Rect &&
      obj.shapeType !== 'circle' &&
      obj.data?.type !== 'DEVICE'
    ) {
      borderRadiusBaseMap.set(obj, { rx: obj.rx ?? 0, ry: obj.ry ?? 0 });
      const rx = borderRadius / (obj.scaleX ?? 1);
      const ry = borderRadius / (obj.scaleY ?? 1);
      obj.set({ rx, ry });
    }
  });
  canvas.requestRenderAll();

  return canvas.getObjects() as FabricObject[];
}
