# Shapes

Shape factory functions create Fabric objects and add them to the canvas. Each shape type has three variants:

- **`create*`** — create at explicit coordinates
- **`create*AtPoint`** — create centered at a scene-space point (useful with `enableClickToCreate`)
- **`edit*`** — modify an existing shape's properties

All creation functions return the created Fabric object. All functions require the canvas as the first argument.

## Rectangle

```typescript
import {
  createRectangle,
  createRectangleAtPoint,
  editRectangle,
} from '@bwp-web/canvas';
```

### `createRectangle(canvas, options): Rect`

```typescript
const rect = createRectangle(canvas, {
  left: 100,        // center x
  top: 80,          // center y
  width: 140,       // width
  height: 90,       // height
  rx: 4,            // border radius x (optional)
  ry: 4,            // border radius y (optional)
  fill: '#0066ff1a',  // optional — uses DEFAULT_SHAPE_STYLE if omitted
  stroke: '#0066ff',  // optional
  strokeWidth: 2,     // optional
});
```

### `createRectangleAtPoint(canvas, point, options): Rect`

Creates a rectangle centered at the given point. Used with `enableClickToCreate`.

```typescript
const rect = createRectangleAtPoint(canvas, { x: 200, y: 150 }, {
  width: 100,
  height: 80,
});
```

### `editRectangle(canvas, rect, changes)`

Updates an existing rectangle's properties and re-renders.

```typescript
editRectangle(canvas, rect, { width: 200, height: 120, left: 50 });
```

---

## Circle

Circles are implemented as Fabric `Rect` objects with `shapeType: 'circle'` and equal `rx`/`ry` (fully rounded corners). This ensures consistent serialization and selection behavior.

```typescript
import {
  createCircle,
  createCircleAtPoint,
  editCircle,
} from '@bwp-web/canvas';
```

### `createCircle(canvas, options): Rect`

```typescript
const circle = createCircle(canvas, {
  left: 200,    // center x
  top: 150,     // center y
  size: 80,     // diameter
  fill: '#0066ff',  // optional — uses DEFAULT_CIRCLE_STYLE if omitted
});
```

### `createCircleAtPoint(canvas, point, options): Rect`

```typescript
const circle = createCircleAtPoint(canvas, { x: 200, y: 150 }, { size: 80 });
```

### `editCircle(canvas, rect, changes)`

Updates a circle. Automatically recalculates `rx`/`ry` when `size` changes.

```typescript
editCircle(canvas, circle, { size: 120 });
```

---

## Polygon

```typescript
import {
  createPolygon,
  createPolygonAtPoint,
  createPolygonFromDrag,
  createPolygonFromVertices,
  editPolygon,
} from '@bwp-web/canvas';
```

### `createPolygon(canvas, options): Polygon`

Create from explicit vertex points.

```typescript
const poly = createPolygon(canvas, {
  points: [
    { x: 0, y: 0 },
    { x: 80, y: -30 },
    { x: 120, y: 20 },
    { x: 100, y: 80 },
    { x: 20, y: 80 },
  ],
  left: 300,  // optional offset
  top: 180,
});
```

### `createPolygonAtPoint(canvas, point, options): Polygon`

Creates a rectangular polygon centered at a point (4 vertices).

```typescript
const poly = createPolygonAtPoint(canvas, { x: 200, y: 150 }, {
  width: 100,
  height: 80,
});
```

### `createPolygonFromDrag(canvas, start, end, style?): Polygon`

Creates a rectangular polygon from two corner points (used with `enableDragToCreate`).

```typescript
const poly = createPolygonFromDrag(
  canvas,
  { x: 100, y: 100 },
  { x: 250, y: 200 },
);
```

### `createPolygonFromVertices(canvas, points, style?): Polygon`

Creates a polygon from an array of vertices (used with `enableDrawToCreate`).

```typescript
const poly = createPolygonFromVertices(canvas, [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
]);
```

### `editPolygon(canvas, polygon, changes)`

Updates a polygon. Handles internal dimension recalculation.

```typescript
editPolygon(canvas, polygon, { left: 50, top: 100 });
```

---

## Style options

All shape creation functions accept optional style properties:

```typescript
interface ShapeStyleOptions {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}
```

When omitted, shapes use the default styles from `DEFAULT_SHAPE_STYLE` (rectangles/polygons) or `DEFAULT_CIRCLE_STYLE` (circles).
