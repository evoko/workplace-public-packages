# Interactions

Interaction modes define how the user creates shapes on the canvas. Each returns a cleanup function and is typically activated via `useEditCanvas.setMode()`.

## Usage pattern

All interaction modes follow the same pattern with `setMode`:

```tsx
const canvas = useEditCanvas();

canvas.setMode((c, viewport) =>
  enableDragToCreate(c, factory, { viewport, onCreated: () => canvas.setMode(null) }),
);
```

The `setMode` callback receives:
- `c` — the Fabric canvas instance
- `viewport` — the `ViewportController` (if pan/zoom is enabled)

Return the cleanup function from the interaction to let `setMode` manage its lifecycle.

---

## `enableClickToCreate(canvas, factory, options?)`

Each click on the canvas creates a shape at the cursor position.

```typescript
const cleanup = enableClickToCreate(
  canvas,
  (c, point) => createRectangleAtPoint(c, point, { width: 100, height: 80 }),
  {
    onCreated: (obj) => { /* shape created */ },
    viewport,  // pass to auto-switch from pan to select mode
  },
);
```

**Factory signature:** `(canvas, point: Point2D) => FabricObject`

---

## `enableDragToCreate(canvas, factory, options?)`

Click and drag to define a bounding rectangle, then a shape is created from those bounds. A dashed preview rectangle is shown during the drag.

```typescript
const cleanup = enableDragToCreate(
  canvas,
  (c, bounds) =>
    createRectangle(c, {
      left: bounds.startX + bounds.width / 2,
      top: bounds.startY + bounds.height / 2,
      width: bounds.width,
      height: bounds.height,
    }),
  {
    onCreated: () => canvas.setMode(null),
    viewport,
    constrainToSquare: true,  // hold Shift to constrain to 1:1 ratio
    previewStyle: { ... },    // customize the dashed preview rectangle
    snapping: true,            // enable cursor snapping during drag
    enableAlignment: true,     // enable alignment guides
  },
);
```

**Factory signature:** `(canvas, bounds: DragBounds) => FabricObject`

### `DragBounds`

```typescript
interface DragBounds {
  startX: number;
  startY: number;
  width: number;
  height: number;
}
```

### Options (`DragToCreateOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `onCreated` | `(obj) => void` | — | Called after shape is created |
| `viewport` | `ViewportController` | — | Auto-switches to select mode during drag |
| `constrainToSquare` | `boolean \| { key? }` | `false` | Hold Shift to constrain aspect ratio to 1:1 |
| `previewStyle` | `object` | Dashed blue | Style for the drag preview rectangle |
| `snapping` | `SnappingOptions` | — | Enable cursor snapping |
| `enableAlignment` | `boolean` | — | Enable alignment guides |

---

## `enableDrawToCreate(canvas, options?)`

Vertex-by-vertex polygon drawing. Click to place vertices, double-click or click near the first vertex to close the polygon. Press **Escape** or **Backspace** to cancel.

```typescript
const cleanup = enableDrawToCreate(canvas, {
  onCreated: (polygon) => canvas.setMode(null),
  viewport,
  style: { fill: '#0066ff1a', stroke: '#0066ff' },
  angleSnap: { interval: 15 },  // hold Shift to snap angles to 15 degrees
  snapping: true,
  enableAlignment: true,
  onCancel: () => canvas.setMode(null),
});
```

### Options (`DrawToCreateOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `onCreated` | `(polygon) => void` | — | Called after polygon is closed |
| `viewport` | `ViewportController` | — | Auto-switches to select mode |
| `style` | `ShapeStyleOptions` | `DEFAULT_GUIDELINE_SHAPE_STYLE` | Fill/stroke during drawing |
| `angleSnap` | `{ interval? }` | `{ interval: 15 }` | Shift+drag snaps to angle increments |
| `snapping` | `SnappingOptions` | — | Cursor snapping to existing objects |
| `enableAlignment` | `boolean` | — | Alignment guides |
| `onCancel` | `() => void` | — | Called when drawing is cancelled (Escape/Backspace) |

### Drawing controls

- **Click** — place a vertex
- **Double-click** or **click near first vertex** — close the polygon
- **Shift + move** — snap the next edge to 15-degree angle increments
- **Escape / Backspace** — cancel drawing

---

## `enableVertexEdit(canvas, polygon, options?, onExit?)`

Edit individual vertices of a polygon. Drag handles appear over each vertex. This is typically triggered by double-clicking a polygon (enabled by default in `useEditCanvas`).

```typescript
const cleanup = enableVertexEdit(canvas, polygon, {
  handleRadius: 6,
  handleFill: '#ffffff',
  handleStroke: '#0066ff',
  handleStrokeWidth: 2,
}, () => {
  // called when vertex edit mode exits
});
```

### Exit behavior

- **Escape** — exits vertex edit mode
- **Click on empty canvas** — exits vertex edit mode

### Options (`VertexEditOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `handleRadius` | `number` | `6` | Radius of vertex handles (screen pixels) |
| `handleFill` | `string` | `'#ffffff'` | Handle fill color |
| `handleStroke` | `string` | `'#0066ff'` | Handle stroke color |
| `handleStrokeWidth` | `number` | `2` | Handle stroke width |

---

## Common options

### `InteractionModeOptions`

Base options shared by all interaction modes:

```typescript
interface InteractionModeOptions {
  onCreated?: (obj: FabricObject) => void;
  viewport?: ViewportController;
}
```

### `SnappableInteractionOptions`

Extends `InteractionModeOptions` with snapping support:

```typescript
interface SnappableInteractionOptions extends InteractionModeOptions {
  snapping?: SnappingOptions;
  enableAlignment?: boolean;
}
```

### `SnappingOptions`

```typescript
type SnappingOptions = boolean | {
  margin?: number;           // snap distance in pixels
  guidelineStyle?: GuidelineStyle;  // customize guideline appearance
};
```
