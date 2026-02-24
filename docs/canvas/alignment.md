# Alignment & Snapping

The canvas provides three alignment systems that work together:

1. **Object alignment** — guidelines when moving/scaling objects near other objects
2. **Cursor snapping** — snap cursor position to existing object points during creation
3. **Rotation snapping** — snap rotation angles to fixed increments when holding Shift

All three are enabled by default in `useEditCanvas` and can be controlled via the `enableAlignment` master toggle.

---

## Object alignment

### `enableObjectAlignment(canvas, options?): () => void`

Shows alignment guidelines when objects are moved or scaled near other objects' edges and centers.

```typescript
import { enableObjectAlignment } from '@bwp-web/canvas';

const cleanup = enableObjectAlignment(canvas, {
  margin: 6,              // snap distance in pixels
  scaleWithCanvasSize: true, // scale margin proportionally to canvas size
  color: '#ff0000',       // guideline color
  width: 1,               // guideline width
  xSize: 4,               // X-marker size at intersection points
});
```

> Usually managed by `useEditCanvas` — use directly only for custom setups.

### Options (`ObjectAlignmentOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `margin` | `number` | `6` | Snap distance in pixels |
| `scaleWithCanvasSize` | `boolean` | `true` | Scale margin with canvas size (useful for large floor plans) |
| `color` | `string` | `'#ff0000'` | Guideline color |
| `width` | `number` | `1` | Guideline width |
| `xSize` | `number` | `4` | Size of X markers at snap points |
| `lineDash` | `number[]` | — | Dashed line pattern |

---

## Cursor snapping

### `snapCursorPoint(canvas, point, options?): CursorSnapResult`

Snaps a cursor position to nearby object snap points. Used internally by interaction modes when `snapping` is enabled.

```typescript
import { snapCursorPoint } from '@bwp-web/canvas';

const result = snapCursorPoint(canvas, { x: 150, y: 200 }, {
  margin: 6,
  exclude: new Set([myObject]),  // objects to skip
  targetPoints: [{ x: 100, y: 100 }],  // additional points to snap to
  scaleWithCanvasSize: true,
});

if (result.snapped) {
  // result.point contains the snapped position
  console.log(result.point); // { x: 150, y: 200 } (adjusted)
}
```

### `CursorSnapResult`

```typescript
interface CursorSnapResult {
  point: Point;      // the (possibly snapped) position
  snapped: boolean;  // whether snapping occurred
  snapX: boolean;    // snapped on X axis
  snapY: boolean;    // snapped on Y axis
  alignTargetsX?: Point[]; // X-axis alignment targets (for guidelines)
  alignTargetsY?: Point[]; // Y-axis alignment targets (for guidelines)
}
```

### `CursorSnapOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `margin` | `number` | `6` | Snap distance in pixels |
| `exclude` | `Set<FabricObject>` | — | Objects to ignore for snapping |
| `targetPoints` | `Point[]` | — | Additional arbitrary points to snap to |
| `scaleWithCanvasSize` | `boolean` | `true` | Scale margin with canvas size |

---

## Rotation snapping

### `enableRotationSnap(canvas, options?): () => void`

When the user holds **Shift** while rotating an object, the angle snaps to fixed increments.

```typescript
import { enableRotationSnap } from '@bwp-web/canvas';

const cleanup = enableRotationSnap(canvas, { interval: 15 }); // snap to 15-degree steps
```

### Options (`RotationSnapOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `interval` | `number` | `15` | Angle increment in degrees |

---

## Snap points

### `getSnapPoints(object): Point[]`

Returns the snap points for a Fabric object. Built-in extractors provide:

- **Rectangle**: 4 corners + 4 edge midpoints + center (9 points)
- **Polygon**: all vertices + center

```typescript
import { getSnapPoints } from '@bwp-web/canvas';

const points = getSnapPoints(myRect); // 9 Points
```

### `registerSnapPointExtractor(matcher, extractor)`

Register a custom snap point extractor for specific object types.

```typescript
import { registerSnapPointExtractor } from '@bwp-web/canvas';

registerSnapPointExtractor(
  (obj) => obj.type === 'triangle',     // matcher
  (obj) => [/* custom snap points */],  // extractor
);
```

---

## Canvas-size scaling

Both object alignment and cursor snapping support `scaleWithCanvasSize`. When enabled (default), the snap margin scales proportionally to the canvas size relative to `BASE_CANVAS_SIZE` (1000px). This means:

- On a 2000px canvas, the effective snap margin is 2x the configured value
- On a 500px canvas, the effective snap margin is 0.5x

This keeps snapping consistent regardless of canvas/floor plan scale.
