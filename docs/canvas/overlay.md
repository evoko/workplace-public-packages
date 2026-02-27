# Overlay

React components for positioning DOM content over Fabric canvas objects. Overlays stay in sync with pan, zoom, move, scale, and rotate transforms, letting you render rich UI (icons, labels, badges) on top of canvas shapes.

The four components compose together:

1. **`ObjectOverlay`** — positions a container over a specific canvas object
2. **`OverlayContent`** — scales its children to fit within the overlay bounds
3. **`FixedSizeContent`** — keeps children at a constant screen size inside `OverlayContent`
4. **`OverlayBadge`** — an absolutely-positioned badge with baseline-relative scaling

---

## `ObjectOverlay`

A MUI `Stack` positioned absolutely over a Fabric canvas object, sized to the object's screen-space dimensions.

```tsx
import { ObjectOverlay } from '@bwp-web/canvas';

// Inside a ViewCanvasProvider or EditCanvasProvider — canvasRef is read from context:
<ObjectOverlay object={deskObj}>
  <OverlayContent>
    <MyLabel>{desk.name}</MyLabel>
  </OverlayContent>
</ObjectOverlay>

// Or pass canvasRef explicitly (e.g. when used outside a provider):
<ObjectOverlay canvasRef={canvasRef} object={deskObj}>
  <OverlayContent>
    <MyLabel>{desk.name}</MyLabel>
  </OverlayContent>
</ObjectOverlay>
```

Must be rendered inside a container that is `position: relative` and wraps the `<Canvas>` component.

### Props (`ObjectOverlayProps`)

Extends MUI `StackProps`.

| Prop | Type | Required | Description |
|---|---|---|---|
| `canvasRef` | `RefObject<FabricCanvas \| null>` | No | Ref to the Fabric canvas instance. Optional when used inside a `ViewCanvasProvider` or `EditCanvasProvider` — the ref is read from context automatically. If provided, takes precedence over context |
| `object` | `FabricObject \| null \| undefined` | Yes | The Fabric object to overlay. Nothing renders when `null`/`undefined` |
| `children` | `ReactNode` | No | Content to render inside the overlay |

### Default styles

`position: absolute`, `pointerEvents: none`, `alignItems: center`, `justifyContent: center`, `zIndex: 1`. All overridable via `sx`.

### How it works

The component subscribes to `after:render` and per-object `moving`/`scaling`/`rotating` events. On each update it computes the object's screen-space position, size, and rotation via `util.transformPoint` and applies them as inline styles.

---

## `OverlayContent`

Scales its children to fit within the parent's bounds (typically an `ObjectOverlay`). Content is measured at its natural size, then scaled down or up (capped at `maxScale`) to fill the available space while maintaining aspect ratio.

```tsx
import { OverlayContent } from '@bwp-web/canvas';

<ObjectOverlay object={obj}>
  <OverlayContent padding={4} maxScale={2}>
    <MyBadge>{label}</MyBadge>
  </OverlayContent>
</ObjectOverlay>
```

### Props (`OverlayContentProps`)

Extends MUI `StackProps`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Content to render |
| `padding` | `number` | `4` | Padding in pixels between the content and the parent bounds |
| `maxScale` | `number` | `2` | Maximum scale factor applied to the content |

### CSS custom property: `--overlay-scale`

`OverlayContent` sets a `--overlay-scale` CSS custom property on its inner element with the current computed scale value. This allows child components (like `FixedSizeContent`) to counter-scale and maintain constant screen size.

### How it works

A `ResizeObserver` watches both the outer container and the inner content wrapper. When either changes size:

1. The inner content's natural size is measured via `scrollWidth`/`scrollHeight` (unaffected by CSS transforms)
2. The scale is calculated as `min(containerW / (natW + padding*2), containerH / (natH + padding*2), maxScale)`
3. A CSS `transform: scale(...)` is applied to the inner wrapper
4. The `--overlay-scale` property is updated

The observer watches the inner wrapper too, so it recalculates when children toggle visibility (e.g. `FixedSizeContent` collapsing via `display: none`).

---

## `FixedSizeContent`

Keeps children at their natural CSS pixel size inside an `OverlayContent`, counter-scaling against `OverlayContent`'s fit-to-container transform. Icons and other siblings still scale to fill the object bounds as usual, while content wrapped in `FixedSizeContent` stays at a constant screen size.

```tsx
import { ObjectOverlay, OverlayContent, FixedSizeContent } from '@bwp-web/canvas';

<ObjectOverlay object={obj}>
  <OverlayContent>
    <Stack alignItems="center">
      <MyIcon />                      {/* scales to fit */}
      <FixedSizeContent>
        <Typography noWrap>Always 14px, truncates</Typography>
      </FixedSizeContent>
    </Stack>
  </OverlayContent>
</ObjectOverlay>
```

### Props (`FixedSizeContentProps`)

Extends MUI `StackProps`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Content to render at fixed size |
| `hideOnOverflow` | `boolean` | `true` | Collapse element (`display: none`) when showing it would cause `OverlayContent` to shrink below its natural size vertically |
| `truncationPadding` | `number` | `4` | Horizontal padding in pixels subtracted from the available width when calculating the truncation `maxWidth` |

### Behavior

- **Counter-scaling**: Uses `transform: scale(calc(1 / var(--overlay-scale, 1)))` to cancel out `OverlayContent`'s scaling, so children render at their native CSS size regardless of zoom.
- **Horizontal truncation**: Text that overflows horizontally is truncated with an ellipsis. The available width is the overlay container width minus `truncationPadding * 2`.
- **Vertical overflow hiding**: When `hideOnOverflow` is `true` (default), the element is collapsed (`display: none`) as soon as the overlay container is too short to fit both the fixed-size content and its siblings at their natural size. Once there is enough room again (e.g. zooming in), the element reappears. This frees layout space for siblings so `OverlayContent` recalculates its scale using only the remaining content.
- **Fallback**: When used outside `OverlayContent` (e.g. directly inside `ObjectOverlay`), the `--overlay-scale` fallback of `1` means no counter-scaling is applied and children render at their natural size.

### How the vertical hide/show works

1. On mount, the total parent content height (siblings + this element) is cached
2. A `ResizeObserver` on the nearest overflow-hidden ancestor (OverlayContent outer Stack) triggers a check on each resize
3. The check compares the container height to the cached total content height
4. If the container is too short, the element is hidden (`display: none`) — the cached height remains stable so the decision is deterministic
5. If the container grows large enough, the element is shown, re-measured, and verified to ensure it actually fits
6. The cache is kept fresh while the element is visible

This avoids feedback loops: hiding the element changes `OverlayContent`'s scale, but the cached height from the last visible state prevents oscillation.

---

## `OverlayBadge`

An absolutely-positioned element (icon, status dot, badge) anchored to a specific position within an `ObjectOverlay`. Unlike `OverlayContent` which scales content to fit, `OverlayBadge` uses **baseline-relative scaling** — it captures the overlay's initial dimensions and scales proportionally as the overlay grows or shrinks with zoom.

```tsx
import { ObjectOverlay, OverlayContent, OverlayBadge } from '@bwp-web/canvas';

<ObjectOverlay object={obj}>
  <OverlayContent>
    <MyIcon />
    <FixedSizeContent>
      <Typography>Label</Typography>
    </FixedSizeContent>
  </OverlayContent>
  <OverlayBadge top={-5} right={-5}>
    <StatusDot />
  </OverlayBadge>
</ObjectOverlay>
```

### Props (`OverlayBadgeProps`)

Extends MUI `StackProps`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Content to render |
| `maxScale` | `number` | `2` | Maximum scale factor |
| `minScale` | `number` | `0.75` | Minimum scale factor |
| `top` | `number \| string` | — | Top offset (number → px, string → CSS value) |
| `right` | `number \| string` | — | Right offset |
| `bottom` | `number \| string` | — | Bottom offset |
| `left` | `number \| string` | — | Left offset |
| `circular` | `boolean` | `false` | Position on the inscribed ellipse instead of the rectangle edge |

### Behavior

- **Baseline-relative scaling**: On first render, the overlay's dimensions are captured as the baseline. As the overlay grows (zoom in), the badge scales up; as it shrinks (zoom out), the badge scales down. The scale is clamped to `[minScale, maxScale]`.
- **Center-origin scaling**: The badge always scales from its center, so it stays visually centered at its anchor point regardless of scale.
- **Circular positioning**: When `circular` is `true`, the badge is placed on the inscribed ellipse of the overlay bounds rather than at the rectangle edge. The angle is derived from which anchor props are specified (`top` + `right` → 45°, `top` alone → 90°, etc.) and the anchor values are applied as pixel offsets from the ellipse point. This is useful for circular or elliptical canvas objects where the rectangle corner would be far from the visible shape edge.
- **Counter-scaling inside `OverlayContent`**: When placed inside `OverlayContent`, the badge automatically reads `--overlay-scale` and counter-scales to maintain its own independent size.
- **Pointer events**: Defaults to `pointerEvents: 'auto'`, re-enabling interaction since `ObjectOverlay` sets `pointerEvents: 'none'`. Override via `sx` if needed.
- **Overflow**: The badge can visually overflow outside the `ObjectOverlay` bounds (e.g. negative offsets for corner badges). `ObjectOverlay` does not clip its children.

### How it works

1. A `ResizeObserver` watches the parent element (typically `ObjectOverlay`'s Stack)
2. The first valid measurement is stored as the baseline dimensions
3. On each resize, the ratio `min(currentW / baseW, currentH / baseH)` is computed
4. The scale is clamped to `[minScale, maxScale]` and applied via `transform: scale(...)`
5. If `--overlay-scale` is present (inside `OverlayContent`), the badge divides by it to counter-scale

---

## Composing overlays

A typical setup renders `ObjectOverlay` for each canvas object, with `OverlayContent` handling scaling, `FixedSizeContent` for labels, and `OverlayBadge` for status indicators:

```tsx
{objects.map((obj) => (
  <ObjectOverlay key={obj.data?.id} object={obj}>
    <OverlayContent>
      <StatusIcon status={obj.data?.status} />
      <FixedSizeContent>
        <Typography noWrap sx={{ fontSize: 12, fontWeight: 600 }}>
          {obj.data?.name}
        </Typography>
        <Typography noWrap sx={{ fontSize: 10, color: 'text.secondary' }}>
          {obj.data?.subtitle}
        </Typography>
      </FixedSizeContent>
    </OverlayContent>
    <OverlayBadge top={-5} right={-5}>
      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'green' }} />
    </OverlayBadge>
  </ObjectOverlay>
))}
```

In this pattern:
- `StatusIcon` scales up/down with the object size
- The `Typography` labels stay at constant font sizes (12px / 10px), truncate with ellipsis when too wide, and hide entirely when the object is too small to fit them vertically
- The `OverlayBadge` dot stays anchored at the top-right corner and scales proportionally with zoom
