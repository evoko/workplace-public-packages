# Hooks

The two hooks are the primary entry points for using the canvas. Both return an `onReady` callback that must be passed to the `<Canvas>` component.

## `useEditCanvas(options?)`

Full-featured editing hook with shape creation, selection, pan/zoom, alignment, vertex editing, keyboard shortcuts, and serialization.

```tsx
const canvas = useEditCanvas({
  enableAlignment: true,   // master toggle for all alignment/snapping
  scaledStrokes: true,     // zoom-independent stroke widths
  keyboardShortcuts: true, // Delete/Backspace to remove selected
  vertexEdit: true,        // double-click polygon to edit vertices
  panAndZoom: true,        // scroll to zoom, Cmd/Ctrl+drag to pan
  rotationSnap: { interval: 15 }, // Shift+rotate snaps to 15 degrees
  autoFitToBackground: true, // auto-fit viewport to background image
  backgroundResize: true,  // auto-downscale large uploaded images
  onReady: (canvas) => {}, // called after canvas is initialized
});
```

### Return value

| Property | Type | Description |
|---|---|---|
| `onReady` | `(canvas) => void` | Pass to `<Canvas onReady={...}>` |
| `canvasRef` | `RefObject<FabricCanvas>` | Direct access to the Fabric canvas |
| `zoom` | `number` | Current zoom level (reactive) |
| `selected` | `FabricObject[]` | Currently selected objects (reactive) |
| `isEditingVertices` | `boolean` | Whether vertex edit mode is active (reactive) |
| `viewport.mode` | `ViewportMode` | Current viewport mode (`'select'` or `'pan'`) |
| `viewport.setMode` | `(mode) => void` | Switch viewport mode |
| `viewport.reset` | `() => void` | Reset viewport (fits to background if present) |
| `viewport.zoomIn` | `(step?) => void` | Zoom in toward center |
| `viewport.zoomOut` | `(step?) => void` | Zoom out from center |
| `setMode` | `(setup \| null) => void` | Activate an interaction mode or deactivate |
| `setBackground` | `(url) => Promise<void>` | Load a background image |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enableAlignment` | `boolean` | `true` | Master toggle for all alignment guides and cursor snapping |
| `alignment` | `boolean \| ObjectAlignmentOptions` | `true` | Object alignment guides on move/scale |
| `rotationSnap` | `boolean \| RotationSnapOptions` | `true` | Shift+rotate angle snapping |
| `scaledStrokes` | `boolean` | `true` | Keep stroke widths constant at any zoom level |
| `keyboardShortcuts` | `boolean` | `true` | Delete/Backspace to remove selected objects |
| `vertexEdit` | `boolean` | `true` | Double-click polygon to edit vertices |
| `panAndZoom` | `boolean \| PanAndZoomOptions` | `true` | Pan and zoom controls |
| `autoFitToBackground` | `boolean` | `true` | Auto-fit viewport to background image after `onReady` |
| `backgroundResize` | `boolean \| ResizeImageOptions` | `true` | Auto-downscale large images on upload |
| `onReady` | `(canvas) => void \| Promise<void>` | — | Called after all canvas features are initialized |

### `setMode` — interaction mode lifecycle

```tsx
// Activate drag-to-create mode
canvas.setMode((c, viewport) =>
  enableDragToCreate(c, factory, { viewport, onCreated: () => canvas.setMode(null) }),
);

// Deactivate — automatically calls cleanup from the previous mode
canvas.setMode(null);
```

The `setMode` function accepts a `ModeSetup` — a function that receives `(canvas, viewport?)` and optionally returns a cleanup function. When a new mode is set, the previous mode's cleanup is called automatically.

---

## `useViewCanvas(options?)`

Read-only hook. Objects cannot be selected, created, edited, or deleted. The canvas is always in pan mode.

```tsx
const canvas = useViewCanvas({
  scaledStrokes: true,
  panAndZoom: true,
  autoFitToBackground: true,
  onReady: async (c) => {
    await loadCanvas(c, savedJson);
  },
});
```

### Return value

| Property | Type | Description |
|---|---|---|
| `onReady` | `(canvas) => void` | Pass to `<Canvas onReady={...}>` |
| `canvasRef` | `RefObject<FabricCanvas>` | Direct access to the Fabric canvas |
| `zoom` | `number` | Current zoom level (reactive) |
| `viewport.reset` | `() => void` | Reset viewport |
| `viewport.zoomIn` | `(step?) => void` | Zoom in |
| `viewport.zoomOut` | `(step?) => void` | Zoom out |
| `setObjectStyle` | `(id, style) => void` | Update one object by `data.id` |
| `setObjectStyles` | `(Record<id, style>) => void` | Batch-update multiple objects by `data.id` |
| `setObjectStyleByType` | `(type, style) => void` | Update all objects matching `data.type` |

### `ViewObjectStyle`

The style object accepted by the `setObjectStyle*` methods:

```typescript
interface ViewObjectStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  visible?: boolean;
}
```

### Styling objects

```tsx
// Single object by ID
canvas.setObjectStyle('room-42', { fill: '#ff0000' });

// Multiple objects by ID in one render pass
canvas.setObjectStyles({
  'room-42': { fill: '#ff0000' },
  'room-43': { fill: '#00ff00', opacity: 0.5 },
});

// All objects of a type
canvas.setObjectStyleByType('DESK', { fill: '#cccccc' });
```

---

## `<Canvas>` component

A thin React wrapper around a Fabric.js canvas element.

```tsx
<Canvas
  onReady={canvas.onReady}
  width={800}
  height={600}
  className="my-canvas"
  style={{ border: '1px solid #ccc' }}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `onReady` | `(canvas: FabricCanvas) => void` | — | Called when the Fabric canvas is initialized |
| `width` | `number` | `300` | Canvas width in pixels |
| `height` | `number` | `150` | Canvas height in pixels |
| `className` | `string` | — | CSS class for the container div |
| `style` | `CSSProperties` | — | Inline styles for the container div |
