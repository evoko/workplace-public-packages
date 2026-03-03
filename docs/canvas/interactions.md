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
    onCancel: () => canvas.setMode(null),  // called on Escape
    viewport,
    constrainToSquare: true,  // hold Shift to constrain to 1:1 ratio
    previewStyle: { ... },    // customize the dashed preview rectangle
    snapping: true,            // enable cursor snapping during drag
    enableAlignment: true,     // enable alignment guides
  },
);
```

**Factory signature:** `(canvas, bounds: DragBounds) => FabricObject`

### Click fallback with `clickFactory`

By default, a click without dragging does nothing. Pass `clickFactory` to create a default-sized shape at the click point:

```typescript
enableDragToCreate(
  canvas,
  (c, bounds) =>
    createRectangleAtPoint(c, { x: bounds.startX, y: bounds.startY }, {
      width: bounds.width, height: bounds.height,
    }),
  {
    clickFactory: (c, point) =>
      createRectangleAtPoint(c, point, { width: 60, height: 40 }),
    onCreated: () => canvas.setMode(null),
    viewport,
  },
);
```

When `clickFactory` is provided, the `onCreated` callback fires for both drag-created and click-created shapes.

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
| `onCancel` | `() => void` | — | Called when the user cancels the drag via Escape |
| `viewport` | `ViewportController` | — | Auto-switches to select mode during drag |
| `constrainToSquare` | `boolean \| { key? }` | `false` | Hold Shift to constrain aspect ratio to 1:1 |
| `previewStyle` | `object` | Dashed blue | Style for the drag preview rectangle |
| `clickFactory` | `(canvas, point: Point2D) => FabricObject` | — | Factory for click-without-drag. If provided, a single click (below `MIN_DRAG_SIZE`) creates a default-sized shape at the click point instead of being ignored |
| `snapping` | `SnappingOptions` | — | Enable cursor snapping |
| `enableAlignment` | `boolean` | — | Enable alignment guides |

---

## `enableDrawToCreate(canvas, options?)`

Vertex-by-vertex polygon drawing. Click to place vertices, click near the first vertex to close the polygon (requires 3+ vertices). Press **Escape** or **Backspace** to cancel. By default, pressing and dragging on the first interaction creates a rectangular polygon from the drag bounds.

```typescript
const cleanup = enableDrawToCreate(canvas, {
  onCreated: (polygon) => canvas.setMode(null),
  viewport,
  style: { fill: '#0066ff1a', stroke: '#0066ff' },
  data: { type: 'PLACE', id: 'new-place-id' },  // auto-set on created polygon
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
| `data` | `FabricObject['data']` | — | Metadata to attach to the created polygon (takes precedence over `style.data`) |
| `angleSnap` | `{ interval? }` | `{ interval: 15 }` | Shift+drag snaps to angle increments |
| `snapping` | `SnappingOptions` | — | Cursor snapping to existing objects |
| `enableAlignment` | `boolean` | — | Alignment guides |
| `onCancel` | `() => void` | — | Called when drawing is cancelled (Escape/Backspace) |
| `factory` | `(canvas, points: Point2D[]) => FabricObject` | — | Factory function to create the final object from placed vertices. Default: creates a polygon via `createPolygonFromVertices` |
| `dragOnHold` | `boolean` | `true` | When enabled, pressing and dragging on the first interaction creates a rectangular polygon from the drag bounds (exactly like `enableDragToCreate` for polygons). Shift constrains to a square. Once a vertex has been placed, normal draw behaviour applies. Pass `false` to disable |

### Drawing controls

- **Click** — place a vertex
- **Press and drag** — create a rectangular polygon from the drag bounds (when `dragOnHold` is enabled). Hold **Shift** to constrain to a square
- **Click near first vertex** — close the polygon (requires 3+ vertices)
- **Shift + move** — snap the next edge to 15-degree angle increments
- **Escape / Backspace** — cancel drawing

---

## `enableVertexEdit(canvas, polygon, options?)`

Edit individual vertices of a polygon. Drag handles appear over each vertex. This is typically triggered by double-clicking a polygon (enabled by default in `useEditCanvas`).

```typescript
const cleanup = enableVertexEdit(canvas, polygon, {
  handleRadius: 6,
  handleFill: '#ffffff',
  handleStroke: '#0066ff',
  handleStrokeWidth: 2,
  onExit: () => {
    // called when vertex edit mode exits
  },
});
```

> **Deprecation note:** The positional `onExit` parameter (`enableVertexEdit(canvas, polygon, options?, onExit?)`) still works but is deprecated. Pass `onExit` inside `options` instead.

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
| `onExit` | `() => void` | — | Called when vertex editing is exited (via Escape, empty-canvas click, or cleanup) |

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
