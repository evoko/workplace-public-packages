# Serialization

Save and load canvas state as JSON. Handles stroke width restoration, control styles, and circle constraints automatically.

## `serializeCanvas(canvas, options?): object`

Serializes the entire canvas (objects + background) to a JSON-compatible object. Temporarily restores base stroke widths before serializing so the saved data is zoom-independent.

```typescript
import { serializeCanvas } from '@bwp-web/canvas';

const json = serializeCanvas(canvas);
localStorage.setItem('canvas', JSON.stringify(json));
```

### Options (`SerializeOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `properties` | `string[]` | — | Additional custom properties to include in the JSON |

---

## `loadCanvas(canvas, json, options?): Promise<FabricObject[]>`

Loads a previously serialized canvas state. Restores control styles (selection handles) and circle constraints. Returns the loaded objects array, already typed as `FabricObject[]`.

```typescript
import { loadCanvas } from '@bwp-web/canvas';

const json = JSON.parse(localStorage.getItem('canvas')!);
const objects = await loadCanvas(canvas, json);
// objects is FabricObject[] — no need for canvas.getObjects() cast
```

### Filtering objects on load

Pass a `filter` function to exclude objects during loading. Objects for which the filter returns `false` are removed from the canvas before control styles are applied.

```typescript
// Only keep objects whose IDs exist in the current data set
await loadCanvas(canvas, json, {
  filter: (obj) => validIds.has(obj.data?.id),
});
```

### Options (`LoadCanvasOptions`)

| Option | Type | Description |
|---|---|---|
| `filter` | `(obj: FabricObject) => boolean` | If provided, objects for which this returns `false` are removed after loading |

---

## `enableScaledStrokes(canvas): () => void`

Keeps stroke widths visually constant as the user zooms in and out. Without this, strokes would become thicker when zooming in and thinner when zooming out.

```typescript
import { enableScaledStrokes } from '@bwp-web/canvas';

const cleanup = enableScaledStrokes(canvas);
```

> Enabled by default in both `useEditCanvas` and `useViewCanvas`.

Internally, this stores the original ("base") stroke width in a WeakMap and adjusts the rendered stroke on each zoom change.

---

## `enableScaledBorderRadius(canvas): () => void`

Keeps border radii (`rx`/`ry`) visually uniform on Rects loaded via `loadCanvas`, even when objects are non-uniformly scaled. Without this, corners would appear stretched when a rectangle is wider than it is tall (or vice versa).

```typescript
import { enableScaledBorderRadius } from '@bwp-web/canvas';

const cleanup = enableScaledBorderRadius(canvas);
```

> Enabled by default in both `useEditCanvas` and `useViewCanvas`.

On each render, tracked Rects have their `rx`/`ry` recalculated as `VIEW_BORDER_RADIUS / scaleX` and `VIEW_BORDER_RADIUS / scaleY`. The original values are stored in a WeakMap and automatically restored before serialization so the saved data is unaffected.

Only Rects loaded via `loadCanvas` are tracked (excluding circles and DEVICE objects). Newly created shapes are not affected.

---

## `getBaseStrokeWidth(obj): number`

Returns the original stroke width of an object before zoom scaling was applied. Useful when you need the "design-time" stroke width rather than the current zoom-adjusted value.

```typescript
import { getBaseStrokeWidth } from '@bwp-web/canvas';

const baseWidth = getBaseStrokeWidth(myRect); // e.g. 2
```

---

## Serialization details

- **`data` property**: Objects' `data` property (containing `type` and `id`) is automatically included in serialization. This preserves object identity across save/load cycles.
- **Background images**: Background images are serialized as part of the canvas JSON and restored on load.
- **Background color**: `serializeCanvas` strips `backgroundColor` from the output — it's a runtime/theme concern, not user data. `loadCanvas` also clears any `backgroundColor` restored from old data for symmetry.
- **Circle constraints**: Circles (Rects with `shapeType: 'circle'`) have their `rx`/`ry` constraints restored after loading.
- **Control styles**: Selection handle styles are restored to match the package's theme after loading.
- **Border radius**: `loadCanvas` applies a visual border radius to loaded Rects (excluding circles and DEVICE objects) and registers them with `enableScaledBorderRadius`. The original `rx`/`ry` values are restored before serialization.
- **Origin normalization**: `loadCanvas` migrates legacy objects from `originX: 'left'` / `originY: 'top'` to `'center'` / `'center'`. Coordinates are adjusted so objects remain in the same visual position.
