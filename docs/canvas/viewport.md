# Viewport

Controls for panning and zooming the canvas. Enabled by default in both `useEditCanvas` and `useViewCanvas`.

## `enablePanAndZoom(canvas, options?): ViewportController`

Sets up pan and zoom controls on the canvas and returns a `ViewportController`.

```typescript
import { enablePanAndZoom } from '@bwp-web/canvas';

const controller = enablePanAndZoom(canvas, {
  minZoom: 0.1,
  maxZoom: 10,
  zoomFactor: 0.999,    // scroll sensitivity
  initialMode: 'select', // 'select' or 'pan'
});
```

> Typically you don't call this directly — `useEditCanvas` and `useViewCanvas` handle it. Use this for custom setups without hooks.

### Input controls

| Input | Action |
|---|---|
| Scroll wheel | Zoom in/out toward cursor |
| Cmd/Ctrl + drag | Pan (in select mode) |
| Middle mouse drag | Pan (in any mode) |
| Pinch gesture | Zoom (touch devices) |
| Click + drag | Pan (in pan mode) or select (in select mode) |

### Options (`PanAndZoomOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `minZoom` | `number` | `0.1` | Minimum zoom level |
| `maxZoom` | `number` | `10` | Maximum zoom level |
| `zoomFactor` | `number` | `0.999` | Scroll zoom sensitivity |
| `initialMode` | `ViewportMode` | `'select'` | Starting mode |

---

## `ViewportController`

Returned by `enablePanAndZoom`. Also available through the hooks' `viewport` property.

| Method | Description |
|---|---|
| `setMode(mode)` | Switch between `'select'` and `'pan'` mode |
| `getMode()` | Get current mode |
| `setEnabled(enabled)` | Enable/disable all viewport input |
| `zoomIn(step?)` | Zoom in toward canvas center (default step: `0.2`) |
| `zoomOut(step?)` | Zoom out from canvas center (default step: `0.2`) |
| `cleanup()` | Remove all event listeners |

---

## `resetViewport(canvas)`

Resets the canvas viewport to default state (zoom = 1, no pan offset).

```typescript
import { resetViewport } from '@bwp-web/canvas';

resetViewport(canvas);
```

> When using hooks, prefer `canvas.viewport.reset()` which also fits to background if one is set.

---

## `ViewportMode`

```typescript
type ViewportMode = 'select' | 'pan';
```

- **`select`** — click to select objects, Cmd/Ctrl+drag or middle-mouse to pan
- **`pan`** — click and drag to pan (used in `useViewCanvas`)
