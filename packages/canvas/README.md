# @bwp-web/canvas

Interactive canvas editor and viewer for Biamp Workplace applications. Built on Fabric.js with React hooks, it provides shape creation, selection, pan/zoom, alignment guides, serialization, and DOM overlays out of the box.

## Installation

```bash
npm install @bwp-web/canvas
```

### Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@mui/material` >= 7.0.0
- `@bwp-web/styles` >= 1.0.1
- `fabric` >= 7.2.0

## Quick Start

### Edit Canvas

Full editing with shape creation, selection, pan/zoom, alignment, and serialization:

```tsx
import {
  Canvas,
  useEditCanvas,
  enableDragToCreate,
  createRectangle,
} from '@bwp-web/canvas';

function Editor() {
  const canvas = useEditCanvas();

  const startDragMode = () => {
    canvas.setMode((c, viewport) =>
      enableDragToCreate(
        c,
        (c, bounds) =>
          createRectangle(c, {
            left: bounds.startX + bounds.width / 2,
            top: bounds.startY + bounds.height / 2,
            width: bounds.width,
            height: bounds.height,
          }),
        { onCreated: () => canvas.setMode(null), viewport },
      ),
    );
  };

  return (
    <div>
      <button onClick={startDragMode}>Draw Rectangle</button>
      <Canvas onReady={canvas.onReady} width={800} height={600} />
    </div>
  );
}
```

### View Canvas

Read-only display with pan/zoom and object styling:

```tsx
import { Canvas, useViewCanvas, loadCanvas } from '@bwp-web/canvas';

function Viewer({ savedJson }: { savedJson: object }) {
  const canvas = useViewCanvas({
    onReady: (c) => loadCanvas(c, savedJson),
  });

  return <Canvas onReady={canvas.onReady} width={800} height={600} />;
}
```

## Hooks

### `useEditCanvas(options?)`

Full-featured editing hook with shape creation, selection, pan/zoom, alignment, vertex editing, keyboard shortcuts, and serialization.

```tsx
const canvas = useEditCanvas({
  canvasData: savedJson, // auto-load canvas data
  filter: (obj) => ids.includes(obj.data?.id),
  invertBackground: isDarkMode, // reactive background inversion
  enableAlignment: true, // object alignment guides
  scaledStrokes: true, // zoom-independent stroke widths
  keyboardShortcuts: true, // Delete/Backspace to remove selected
  vertexEdit: true, // double-click polygon to edit vertices
  panAndZoom: true, // scroll to zoom, Cmd/Ctrl+drag to pan
  rotationSnap: { interval: 15 }, // Shift+rotate snaps to 15°
  autoFitToBackground: true, // auto-fit viewport to background image
  backgroundResize: true, // auto-downscale large uploaded images
  trackChanges: true, // expose isDirty / resetDirty
  history: true, // undo/redo support
  onReady: (canvas) => {}, // called after canvasData load + features init
});
```

#### Return Value

| Property               | Type                           | Description                                                |
| ---------------------- | ------------------------------ | ---------------------------------------------------------- |
| `onReady`              | `(canvas) => void`             | Pass to `<Canvas onReady={...}>`                           |
| `canvasRef`            | `RefObject<FabricCanvas>`      | Direct access to the Fabric canvas                         |
| `zoom`                 | `number`                       | Current zoom level (reactive)                              |
| `objects`              | `FabricObject[]`               | Canvas objects (reactive, kept in sync)                    |
| `isLoading`            | `boolean`                      | Whether canvas data is currently being loaded              |
| `selected`             | `FabricObject[]`               | Currently selected objects (reactive)                      |
| `setMode`              | `(setup \| null) => void`      | Activate or deactivate an interaction mode                 |
| `setBackground`        | `(url, opts?) => Promise<...>` | Load a background image                                    |
| `isDirty`              | `boolean`                      | Whether canvas has been modified since last `resetDirty()` |
| `resetDirty`           | `() => void`                   | Reset the dirty flag after a successful save               |
| `markDirty`            | `() => void`                   | Manually mark the canvas as dirty                          |
| `undo`                 | `() => Promise<void>`          | Undo last change (requires `history: true`)                |
| `redo`                 | `() => Promise<void>`          | Redo previously undone change (requires `history: true`)   |
| `canUndo`              | `boolean`                      | Whether undo is available (reactive)                       |
| `canRedo`              | `boolean`                      | Whether redo is available (reactive)                       |
| `viewport.zoomIn`      | `(step?) => void`              | Zoom in toward center                                      |
| `viewport.zoomOut`     | `(step?) => void`              | Zoom out from center                                       |
| `viewport.reset`       | `() => void`                   | Reset viewport                                             |
| `viewport.panToObject` | `(object, options?) => void`   | Pan viewport to center on an object                        |
| `viewport.zoomToFit`   | `(object, options?) => void`   | Zoom and pan to fit a specific object                      |

### `useViewCanvas(options?)`

Read-only hook. Objects cannot be selected, created, or edited. The canvas is always in pan mode.

```tsx
const canvas = useViewCanvas({
  canvasData: savedJson,
  filter: (obj) => objectIds.includes(obj.data?.id),
  invertBackground: isDarkMode,
});

// Style objects dynamically
canvas.setObjectStyle('room-42', { fill: '#ff0000' });
canvas.setObjectStyles({
  'room-42': { fill: '#ff0000' },
  'room-43': { opacity: 0.5 },
});
canvas.setObjectStyleByType('DESK', { fill: '#cccccc' });
```

## Context Providers

When multiple sibling components need access to canvas state, use context providers instead of hooks directly. They expose the full API via React context with no prop drilling.

```tsx
import {
  EditCanvasProvider,
  useEditCanvasContext,
  useEditCanvasState,
  useEditCanvasViewport,
  Canvas,
} from '@bwp-web/canvas';

function App() {
  return (
    <EditCanvasProvider options={{ canvasData: savedJson, history: true }}>
      <MyCanvas />
      <SaveButton />
      <ZoomDisplay />
    </EditCanvasProvider>
  );
}

function MyCanvas() {
  const { onReady } = useEditCanvasContext();
  return <Canvas onReady={onReady} />;
}

function SaveButton() {
  // Does NOT re-render on zoom/scroll
  const { isDirty, resetDirty } = useEditCanvasState();
  return (
    <button disabled={!isDirty} onClick={resetDirty}>
      Save
    </button>
  );
}

function ZoomDisplay() {
  // Does NOT re-render on selection/dirty changes
  const { zoom } = useEditCanvasViewport();
  return <span>{Math.round(zoom * 100)}%</span>;
}
```

`ViewCanvasProvider` / `useViewCanvasContext` follow the same pattern for view-mode canvases.

## `<Canvas>` Component

A thin React wrapper around a Fabric.js canvas. By default it fills its parent container and resizes automatically.

```tsx
{
  /* Auto-fill mode (default) */
}
<div style={{ width: 800, height: 600 }}>
  <Canvas onReady={canvas.onReady} />
</div>;

{
  /* Fixed-size mode */
}
<Canvas onReady={canvas.onReady} width={800} height={600} />;
```

## Shapes

```tsx
import { createRectangle, createCircle, createPolygon } from '@bwp-web/canvas';

createRectangle(canvas, { left: 100, top: 100, width: 200, height: 150 });
createCircle(canvas, { left: 200, top: 200, radius: 50 });
createPolygon(canvas, {
  points: [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 50, y: 100 },
  ],
});
```

## Interaction Modes

```tsx
import {
  enableClickToCreate,
  enableDragToCreate,
  enableDrawToCreate,
  enableVertexEdit,
} from '@bwp-web/canvas';

// Single click to create a shape
canvas.setMode((c) => enableClickToCreate(c, factory, options));

// Drag to define bounds
canvas.setMode((c, viewport) => enableDragToCreate(c, factory, { viewport }));

// Vertex-by-vertex polygon drawing (click to add points, double-click to finish)
canvas.setMode((c, viewport) => enableDrawToCreate(c, factory, { viewport }));

// Edit polygon vertices (double-click a polygon to activate)
canvas.setMode((c) => enableVertexEdit(c, options));
```

## Serialization

```tsx
import { serializeCanvas, loadCanvas } from '@bwp-web/canvas';

// Save
const json = serializeCanvas(canvas);

// Load
await loadCanvas(canvas, json);

// Load with object filter
await loadCanvas(canvas, json, { filter: (obj) => obj.data?.type === 'DESK' });
```

## Utility Hooks

| Hook                                            | Description                                                                       |
| ----------------------------------------------- | --------------------------------------------------------------------------------- |
| `useCanvasEvents(events)`                       | Subscribe to Fabric canvas events with automatic cleanup                          |
| `useCanvasTooltip({ getContent })`              | Track hover over canvas objects, returns `{ visible, content, position, ref }`    |
| `useCanvasClick(onClick, options?)`             | Distinguish clicks from pan gestures; fires only on genuine clicks                |
| `useObjectOverlay(canvasRef, object, options?)` | Position a DOM element over a Fabric object, kept in sync with pan/zoom/transform |

When used inside a provider, all utility hooks read `canvasRef` from context automatically — no need to pass it explicitly.

## API Reference

| Module        | Contents                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Hooks         | `useEditCanvas`, `useViewCanvas`, `Canvas`, `useCanvasEvents`, `useCanvasTooltip`, `useCanvasClick`                                     |
| Context       | `EditCanvasProvider`, `ViewCanvasProvider`, `useEditCanvasContext`, `useViewCanvasContext`                                              |
| Shapes        | `createRectangle`, `createCircle`, `createPolygon` and point/drag variants                                                              |
| Interactions  | `enableClickToCreate`, `enableDragToCreate`, `enableDrawToCreate`, `enableVertexEdit`                                                   |
| Viewport      | `enablePanAndZoom`, `resetViewport`, `ViewportController`                                                                               |
| Alignment     | `enableObjectAlignment`, `snapCursorPoint`, `enableRotationSnap`                                                                        |
| Serialization | `serializeCanvas`, `loadCanvas`, `enableScaledStrokes`                                                                                  |
| Background    | `setBackgroundImage`, `fitViewportToBackground`, `getBackgroundSrc`, `setBackgroundContrast`, `setBackgroundInverted`, `resizeImageUrl` |
| Keyboard      | `enableKeyboardShortcuts`, `deleteObjects`                                                                                              |
| Overlay       | `OverlayContainer`, `ObjectOverlay`, `OverlayContent`, `FixedSizeContent`, `OverlayBadge`                                               |

## Full Documentation

Detailed reference docs are available in the repository's [`/docs/canvas`](../../docs/canvas) folder (GitHub links):

| Document                                               | Contents                                                                                                  |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| [hooks.md](../../docs/canvas/hooks.md)                 | `useEditCanvas`, `useViewCanvas`, context providers, utility hooks — full options and return value tables |
| [shapes.md](../../docs/canvas/shapes.md)               | `createRectangle`, `createCircle`, `createPolygon` and all point/drag variants                            |
| [interactions.md](../../docs/canvas/interactions.md)   | `enableClickToCreate`, `enableDragToCreate`, `enableDrawToCreate`, `enableVertexEdit` — all options       |
| [viewport.md](../../docs/canvas/viewport.md)           | `enablePanAndZoom`, `resetViewport`, `ViewportController` — all methods and options                       |
| [alignment.md](../../docs/canvas/alignment.md)         | Object alignment guides, cursor snapping, rotation snapping, snap point extractors                        |
| [serialization.md](../../docs/canvas/serialization.md) | `serializeCanvas`, `loadCanvas`, scaled strokes, scaled border radius                                     |
| [background.md](../../docs/canvas/background.md)       | `setBackgroundImage`, contrast, invert, resize — all options                                              |
| [keyboard.md](../../docs/canvas/keyboard.md)           | `enableKeyboardShortcuts`, `deleteObjects`                                                                |
| [styles.md](../../docs/canvas/styles.md)               | Default style objects, configuration constants, Fabric type augmentation                                  |
| [overlay.md](../../docs/canvas/overlay.md)             | `OverlayContainer`, `ObjectOverlay`, `OverlayContent`, `FixedSizeContent`, `OverlayBadge` — full API      |
