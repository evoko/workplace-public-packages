# Hooks & Context

The primary hooks (`useEditCanvas`, `useViewCanvas`) are the entry points for using the canvas. Both return an `onReady` callback that must be passed to the `<Canvas>` component.

For apps where multiple sibling components need access to canvas state, **context providers** (`EditCanvasProvider`, `ViewCanvasProvider`) wrap the hooks and expose the full API via React context — no bridge context or prop drilling needed.

Additional utility hooks (`useCanvasEvents`, `useCanvasTooltip`, `useCanvasClick`, `useObjectOverlay`) handle common patterns that would otherwise require manual event wiring.

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
| `viewport.panToObject` | `(object, options?) => void` | Pan viewport to center on an object |
| `viewport.zoomToFit` | `(object, options?) => void` | Zoom and pan to fit a specific object |
| `setMode` | `(setup \| null) => void` | Activate an interaction mode or deactivate |
| `setBackground` | `(url, opts?) => Promise<FabricImage>` | Load a background image (see below) |
| `isDirty` | `boolean` | Whether canvas has been modified since last `resetDirty()`. Requires `trackChanges: true` |
| `resetDirty` | `() => void` | Reset the dirty flag (e.g. after a successful save) |
| `markDirty` | `() => void` | Manually mark the canvas as dirty (e.g. after a custom operation) |
| `undo` | `() => Promise<void>` | Undo last change (requires `history: true`) |
| `redo` | `() => Promise<void>` | Redo previously undone change (requires `history: true`) |
| `canUndo` | `boolean` | Whether undo is available (reactive, requires `history: true`) |
| `canRedo` | `boolean` | Whether redo is available (reactive, requires `history: true`) |

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `enableAlignment` | `boolean` | `true` | Master toggle for all alignment guides and cursor snapping |
| `alignment` | `boolean \| ObjectAlignmentOptions` | `true` | Object alignment guides on move/scale |
| `rotationSnap` | `boolean \| RotationSnapOptions` | `true` | Shift+rotate angle snapping |
| `scaledStrokes` | `boolean` | `true` | Keep stroke widths constant at any zoom level |

> **Border radius scaling** is automatically enabled in both `useEditCanvas` and `useViewCanvas`. Objects loaded via `loadCanvas` get a visual border radius that stays uniform regardless of non-uniform scaling. See [Serialization — `enableScaledBorderRadius`](./serialization.md#enablescaledborderradiuscanvas---void).
| `keyboardShortcuts` | `boolean` | `true` | Delete/Backspace to remove selected objects |
| `vertexEdit` | `boolean` | `true` | Double-click polygon to edit vertices |
| `panAndZoom` | `boolean \| PanAndZoomOptions` | `true` | Pan and zoom controls |
| `autoFitToBackground` | `boolean` | `true` | Auto-fit viewport to background image after `onReady` |
| `backgroundResize` | `boolean \| ResizeImageOptions` | `true` | Auto-downscale large images on upload |
| `trackChanges` | `boolean` | `false` | Track canvas mutations (object + background changes) and expose `isDirty` / `resetDirty` / `markDirty` |
| `borderRadius` | `number \| false` | `4` | Visual border radius for loaded Rects. Pass `false` to disable |
| `history` | `boolean \| HistoryOptions` | `false` | Enable snapshot-based undo/redo |
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

> `setMode` now saves per-object selectability before disabling it, and restores it when returning to select mode. Objects added during the mode default to selectable.

### `setBackground` — background image replacement

```tsx
// Basic usage
await canvas.setBackground(url);

// Preserve the current contrast when replacing the image
await canvas.setBackground(url, { preserveContrast: true });
```

When `preserveContrast` is set, the current background contrast is saved before loading the new image and re-applied afterwards.

### Dirty tracking

Enable with `trackChanges: true`. The hook listens to `object:added`, `object:removed`, `object:modified`, and `background:modified` events and sets `isDirty` to `true` on any change. This covers object create/edit/delete as well as background image, contrast, and invert changes.

```tsx
const canvas = useEditCanvas({ trackChanges: true });

// After any object or background mutation:
canvas.isDirty; // true

// After saving:
canvas.resetDirty();
canvas.isDirty; // false

// For custom operations not tracked automatically:
canvas.markDirty();
canvas.isDirty; // true
```

### Undo/redo

Enable with `history: true` (or pass `{ maxSize: 50 }` to customize). The hook listens to object mutations and captures serialized snapshots (debounced at 300ms).

```tsx
const canvas = useEditCanvas({ history: true });

canvas.undo();    // restore previous state
canvas.redo();    // restore next state
canvas.canUndo;   // boolean (reactive)
canvas.canRedo;   // boolean (reactive)
```

An initial snapshot is captured after `onReady` resolves, so loaded data is included as the baseline state.

---

## `useViewCanvas(options?)`

Read-only hook. Objects cannot be selected, created, edited, or deleted. The canvas is always in pan mode.

```tsx
const canvas = useViewCanvas({
  scaledStrokes: true,
  panAndZoom: true,
  autoFitToBackground: true,
  borderRadius: 4,  // visual border radius for loaded Rects
  onReady: async (c) => {
    await loadCanvas(c, savedJson);
  },
});
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `borderRadius` | `number \| false` | `4` | Visual border radius for loaded Rects. Pass `false` to disable |

### Return value

| Property | Type | Description |
|---|---|---|
| `onReady` | `(canvas) => void` | Pass to `<Canvas onReady={...}>` |
| `canvasRef` | `RefObject<FabricCanvas>` | Direct access to the Fabric canvas |
| `zoom` | `number` | Current zoom level (reactive) |
| `viewport.reset` | `() => void` | Reset viewport |
| `viewport.zoomIn` | `(step?) => void` | Zoom in |
| `viewport.zoomOut` | `(step?) => void` | Zoom out |
| `viewport.panToObject` | `(object, options?) => void` | Pan viewport to center on an object |
| `viewport.zoomToFit` | `(object, options?) => void` | Zoom and pan to fit a specific object |
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

## Context providers

When multiple sibling components need access to canvas state (dirty flag, viewport controls, selected objects, etc.), use the context providers instead of calling `useEditCanvas` / `useViewCanvas` directly. The providers call the hooks internally and expose the full return value via React context.

### `EditCanvasProvider`

```tsx
import {
  EditCanvasProvider,
  useEditCanvasContext,
  Canvas,
} from '@bwp-web/canvas';

function App() {
  return (
    <EditCanvasProvider options={{ trackChanges: true, history: true }}>
      <MyCanvas />
      <BottomAppBar />
      <BackgroundPanel />
    </EditCanvasProvider>
  );
}

function MyCanvas() {
  const { onReady } = useEditCanvasContext();
  return <Canvas onReady={onReady} />;
}

function BottomAppBar() {
  const { isDirty, resetDirty } = useEditCanvasContext();
  return <SaveButton disabled={!isDirty} onClick={() => { save(); resetDirty(); }} />;
}

function BackgroundPanel() {
  const { setBackground, markDirty } = useEditCanvasContext();
  // ...
}
```

`useEditCanvasContext()` returns the same object as `useEditCanvas()` — all properties listed in the [return value table](#return-value) are available. Throws if called outside of an `EditCanvasProvider`.

### `ViewCanvasProvider`

```tsx
import {
  ViewCanvasProvider,
  useViewCanvasContext,
  Canvas,
} from '@bwp-web/canvas';

function App() {
  return (
    <ViewCanvasProvider options={{ scaledStrokes: true }}>
      <MyCanvas />
      <MyToolbar />
    </ViewCanvasProvider>
  );
}

function MyCanvas() {
  const { onReady } = useViewCanvasContext();
  return <Canvas onReady={onReady} />;
}

function MyToolbar() {
  const { viewport } = useViewCanvasContext();
  return <ZoomControls onZoomIn={viewport.zoomIn} onZoomOut={viewport.zoomOut} />;
}
```

### Using utility hooks and overlay components with context

Utility hooks and overlay components accept `canvasRef` as a prop. Read it from context:

```tsx
function MyTooltipLayer() {
  const { canvasRef } = useEditCanvasContext();
  const tooltip = useCanvasTooltip(canvasRef, {
    getContent: (obj) => obj.data,
  });
  // ...
}

function MyOverlays({ objects }) {
  const { canvasRef } = useEditCanvasContext();
  return objects.map((obj) => (
    <ObjectOverlay key={obj.data?.id} canvasRef={canvasRef} object={obj}>
      <OverlayContent>...</OverlayContent>
    </ObjectOverlay>
  ));
}
```

### When to use hooks vs context

| Pattern | Use when |
|---|---|
| `useEditCanvas()` directly | Single component owns the canvas, no sibling access needed |
| `<EditCanvasProvider>` | Multiple sibling components need canvas state or actions |

The hooks and providers are interchangeable — the provider simply wraps the hook in React context. Both support the same options.

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
| `keyboardShortcuts` | `boolean` | `false` | Enable Delete/Backspace shortcuts. Set to `true` when using `<Canvas>` standalone without `useEditCanvas` |
| `fabricOptions` | `Record<string, unknown>` | — | Additional options passed to the Fabric.js Canvas constructor |

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

---

## `useObjectOverlay(canvasRef, object, options?)`

Position a DOM element over a Fabric canvas object, kept in sync with pan, zoom, move, scale, and rotate transforms. Returns a ref to attach to the overlay container element.

The container must be positioned absolutely within a relative-positioned parent that wraps the `<Canvas>` component.

```tsx
import { useObjectOverlay } from '@bwp-web/canvas';

const overlayRef = useObjectOverlay(canvasRef, object, {
  textSelector: '.desk-text',
});

return (
  <div ref={overlayRef} style={{ position: 'absolute', pointerEvents: 'none' }}>
    <CanvasDeskIcon />
    <span className="desk-text">{name}</span>
  </div>
);
```

### Options (`UseObjectOverlayOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `autoScaleContent` | `boolean` | `true` | Scale the overlay container to the object's actual dimensions (canvas units) and apply a CSS `scale(zoom)` transform so content inside lays out relative to the real object size. Pass `false` to opt out and receive screen-space pixel dimensions instead. Also sets a `--overlay-scale` CSS variable. |
| `textSelector` | `string` | — | CSS selector for text elements to hide when the scale drops below `textMinScale` |
| `textMinScale` | `number` | `0.5` | Minimum content scale at which `textSelector` elements remain visible |

### How it works

The hook subscribes to `after:render` and per-object `moving`/`scaling`/`rotating` events. On each update it:

1. Computes the object's screen-space position via `util.transformPoint`
2. When `autoScaleContent` is enabled (default): sizes the container to the object's actual canvas-unit dimensions and applies a CSS `scale(zoom)` transform (with rotation folded in). Content inside the container lays out relative to the real object size.
3. When `autoScaleContent` is `false`: sizes the container to screen-space pixel dimensions with no CSS scale transform.
4. Sets a `--overlay-scale` CSS custom property with the current zoom level.
5. If `textSelector` is provided, hides matched elements when the zoom drops below `textMinScale`.
