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

## `loadCanvas(canvas, json): Promise<void>`

Loads a previously serialized canvas state. Restores control styles (selection handles) and circle constraints.

```typescript
import { loadCanvas } from '@bwp-web/canvas';

const json = JSON.parse(localStorage.getItem('canvas')!);
await loadCanvas(canvas, json);
```

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
- **Circle constraints**: Circles (Rects with `shapeType: 'circle'`) have their `rx`/`ry` constraints restored after loading.
- **Control styles**: Selection handle styles are restored to match the package's theme after loading.
