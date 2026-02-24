# Styles & Constants

Default style objects and configuration constants. All style objects are exported for customization or reference.

## Default styles

### `DEFAULT_CONTROL_STYLE`

Styling for selection handles (corner resize handles, rotation handle, borders). Applied to all objects created by the shape factories.

### `DEFAULT_SHAPE_STYLE`

Default fill and stroke for rectangles and polygons:
- Fill: semi-transparent blue (`#0066ff1a`)
- Stroke: blue (`#0066ff`)
- Stroke width: `2`

### `DEFAULT_CIRCLE_STYLE`

Default fill for circles:
- Fill: opaque blue (`#0066ff`)

### `DEFAULT_DRAG_SHAPE_STYLE`

Preview rectangle shown during drag-to-create:
- Fill: very transparent (`0.1` alpha)
- Stroke: dashed blue

### `DEFAULT_GUIDELINE_SHAPE_STYLE`

Preview polygon shown during draw-to-create:
- Fill: very transparent (`0.1` alpha)
- Stroke: semi-transparent (`0.5` alpha), dashed

### `DEFAULT_ALIGNMENT_STYLE`

Alignment guideline appearance:
- Color: red (`#ff0000`)
- Width: `1`
- X-marker size: `4`

---

## Configuration constants

These are used internally but documented here for reference.

| Constant | Value | Description |
|---|---|---|
| `DEFAULT_MIN_ZOOM` | `0.2` | Minimum zoom level |
| `DEFAULT_MAX_ZOOM` | `10` | Maximum zoom level |
| `DEFAULT_ZOOM_FACTOR` | `1.03` | Scroll zoom sensitivity (multiplier per wheel tick) |
| `DEFAULT_ZOOM_STEP` | `1.2` | Programmatic zoom factor (multiplicative, 20% per click) |
| `DEFAULT_VIEWPORT_PADDING` | `0.05` | Padding fraction (5% on each side) when fitting to background |
| `BASE_CANVAS_SIZE` | `1000` | Reference size for canvas-scaled snapping |
| `DEFAULT_SNAP_MARGIN` | `6` | Default snap distance in pixels |
| `DEFAULT_ANGLE_SNAP_INTERVAL` | `15` | Default rotation snap angle (degrees) |
| `MIN_DRAG_SIZE` | `3` | Minimum drag distance (scene units) to create a shape |
| `POLYGON_CLOSE_THRESHOLD` | `10` | Distance to first vertex to auto-close polygon |
| `DEFAULT_IMAGE_MAX_SIZE` | `4096` | Max image dimension before auto-downscale |
| `DEFAULT_IMAGE_MIN_SIZE` | `480` | Min image dimension (rejects smaller on both axes) |
| `DEFAULT_VERTEX_HANDLE_RADIUS` | `6` | Vertex edit handle radius |
| `DEFAULT_VERTEX_HANDLE_FILL` | `'#ffffff'` | Vertex edit handle fill color |
| `DEFAULT_VERTEX_HANDLE_STROKE` | `'#2196f3'` | Vertex edit handle stroke color |
| `DEFAULT_VERTEX_HANDLE_STROKE_WIDTH` | `2` | Vertex edit handle stroke width |

---

## Fabric augmentation

Importing `@bwp-web/canvas` automatically augments Fabric.js types with:

```typescript
type ObjectDataType = 'PLACE' | 'DEVICE' | 'DESK' | 'PARKING_SPACE' | 'FACILITY';

interface FabricObject {
  shapeType?: 'circle';
  data?: {
    type: ObjectDataType;
    id: string;
  };
}

interface Canvas {
  lockLightMode?: boolean;
}
```

`ObjectDataType` is exported from the package and can be imported directly:

```typescript
import { ObjectDataType } from '@bwp-web/canvas';
```

This augmentation is applied automatically — no manual `declare module 'fabric'` needed by consumers.

---

## Fabric re-exports

The package re-exports commonly used Fabric types so consumers can import from a single source. This avoids type boundary mismatches that occur when the consumer and the package resolve different copies of `fabric`.

```typescript
import {
  FabricCanvas,   // Fabric's Canvas class (aliased to avoid conflict with the React component)
  FabricObject,
  FabricImage,
  Rect,
  Polygon,
  Point,           // Fabric's Point class for coordinate math
  util,            // Fabric utilities (transformPoint, invertTransform, etc.)
} from '@bwp-web/canvas';
```

> `fabric` is a peer dependency — install it alongside `@bwp-web/canvas`. The package does not bundle its own copy.
