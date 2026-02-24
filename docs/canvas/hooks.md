# Hooks

The primary hooks (`useEditCanvas`, `useViewCanvas`) are the entry points for using the canvas. Both return an `onReady` callback that must be passed to the `<Canvas>` component.

Additional utility hooks (`useCanvasEvents`, `useCanvasTooltip`, `useCanvasClick`) handle common patterns that would otherwise require manual event wiring.

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
  trackChanges: true,      // expose isDirty / resetDirty
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
| `setBackground` | `(url, opts?) => Promise<FabricImage>` | Load a background image (see below) |
| `isDirty` | `boolean` | Whether canvas has been modified since last `resetDirty()`. Requires `trackChanges: true` |
| `resetDirty` | `() => void` | Reset the dirty flag (e.g. after a successful save) |

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
| `trackChanges` | `boolean` | `false` | Track object mutations and expose `isDirty` / `resetDirty` |
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

### `setBackground` — background image replacement

```tsx
// Basic usage
await canvas.setBackground(url);

// Preserve the current opacity when replacing the image
await canvas.setBackground(url, { preserveOpacity: true });
```

When `preserveOpacity` is set, the current background opacity is saved before loading the new image and re-applied afterwards. This avoids the manual read-opacity / set-image / restore-opacity dance.

### Dirty tracking

Enable with `trackChanges: true`. The hook listens to `object:added`, `object:removed`, and `object:modified` events and sets `isDirty` to `true` on any change.

```tsx
const canvas = useEditCanvas({ trackChanges: true });

// After any object mutation:
canvas.isDirty; // true

// After saving:
canvas.resetDirty();
canvas.isDirty; // false
```

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

A thin React wrapper around a Fabric.js canvas element. By default, the canvas fills its parent container and resizes automatically.

```tsx
{/* Auto-fill mode (default) — fills 100% of parent width and height */}
<div style={{ width: 800, height: 600 }}>
  <Canvas onReady={canvas.onReady} />
</div>

{/* Fixed-size mode — pass both width and height */}
<Canvas
  onReady={canvas.onReady}
  width={800}
  height={600}
/>
```

### Sizing behavior

- **Auto-fill** (default): When `width` and `height` are omitted, the canvas wrapper gets `width: 100%; height: 100%` and a `ResizeObserver` keeps the Fabric canvas in sync with the container. The viewport transform (pan/zoom) is preserved across resize.
- **Fixed-size**: When both `width` and `height` are provided, the canvas uses those exact dimensions with no resize observer.

| Prop | Type | Default | Description |
|---|---|---|---|
| `onReady` | `(canvas: FabricCanvas) => void` | — | Called when the Fabric canvas is initialized |
| `width` | `number` | — | Canvas width in pixels. Omit for auto-fill |
| `height` | `number` | — | Canvas height in pixels. Omit for auto-fill |
| `className` | `string` | — | CSS class for the container div |
| `style` | `CSSProperties` | — | Inline styles for the container div |

---

## `useCanvasEvents(canvasRef, events)`

Subscribe to Fabric canvas events with automatic cleanup. Handlers are stored in a ref so the latest version is always called without re-subscribing.

```tsx
import { useCanvasEvents } from '@bwp-web/canvas';

useCanvasEvents(editor.canvasRef, {
  'object:added': (e) => updateList(),
  'object:modified': () => setDirty(true),
  'object:removed': () => updateList(),
});
```

### `CanvasEventHandlers`

A mapped type over Fabric's `CanvasEvents` — each key is a valid event name and each handler receives the correctly-typed event payload.

```typescript
type CanvasEventHandlers = {
  [K in keyof CanvasEvents]?: (event: CanvasEvents[K]) => void;
};
```

---

## `useCanvasTooltip<T>(canvasRef, options)`

Track mouse hover over canvas objects and return tooltip state. Handles `mouse:over`/`mouse:out`, viewport-aware position calculation, and position updates during pan/zoom.

```tsx
import { useCanvasTooltip } from '@bwp-web/canvas';

const tooltip = useCanvasTooltip(view.canvasRef, {
  getContent: (obj) =>
    obj.data ? { id: obj.data.id, type: obj.data.type } : null,
});

return (
  <>
    <Canvas onReady={view.onReady} />
    {tooltip.visible && (
      <div style={{ position: 'absolute', left: tooltip.position.x, top: tooltip.position.y }}>
        {tooltip.content?.id}
      </div>
    )}
  </>
);
```

### Return value (`CanvasTooltipState<T>`)

| Property | Type | Description |
|---|---|---|
| `visible` | `boolean` | Whether the tooltip is currently visible |
| `content` | `T \| null` | Content extracted from the hovered object |
| `position` | `{ x: number; y: number }` | Screen-space position relative to the canvas container |

### Options (`UseCanvasTooltipOptions<T>`)

| Option | Type | Description |
|---|---|---|
| `getContent` | `(obj: FabricObject) => T \| null` | Extract tooltip content from a hovered object. Return `null` to skip |

---

## `useCanvasClick(canvasRef, onClick, options?)`

Distinguish clicks from pan gestures on a canvas. On view-mode canvases where pan is always active, Fabric's `mouse:up` fires for both clicks and drag-to-pan. This hook tracks pointer movement and timing to determine whether the user intended a click.

```tsx
import { useCanvasClick } from '@bwp-web/canvas';

useCanvasClick(view.canvasRef, (target) => {
  if (target?.data?.id) {
    navigate(`/locations/${target.data.id}`);
  }
});
```

### Options (`UseCanvasClickOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `threshold` | `number` | `5` | Max movement in pixels before the gesture is treated as a pan |
| `maxDuration` | `number` | `300` | Max time in milliseconds for the gesture to count as a click |
