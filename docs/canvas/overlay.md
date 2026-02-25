# Overlay

React components for positioning DOM content over Fabric canvas objects. Overlays stay in sync with pan, zoom, move, scale, and rotate transforms, letting you render rich UI (icons, labels, badges) on top of canvas shapes.

The three components compose together:

1. **`ObjectOverlay`** — positions a container over a specific canvas object
2. **`OverlayContent`** — scales its children to fit within the overlay bounds
3. **`FixedSizeContent`** — keeps children at a constant screen size inside `OverlayContent`

---

## `ObjectOverlay`

A MUI `Stack` positioned absolutely over a Fabric canvas object, sized to the object's screen-space dimensions.

```tsx
import { ObjectOverlay } from '@bwp-web/canvas';

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
| `canvasRef` | `RefObject<FabricCanvas \| null>` | Yes | Ref to the Fabric canvas instance |
| `object` | `FabricObject \| null \| undefined` | Yes | The Fabric object to overlay. Nothing renders when `null`/`undefined` |
| `children` | `ReactNode` | No | Content to render inside the overlay |

### Default styles

`position: absolute`, `pointerEvents: none`, `alignItems: center`, `justifyContent: center`, `zIndex: 1`, `overflow: hidden`. All overridable via `sx`.

### How it works

The component subscribes to `after:render` and per-object `moving`/`scaling`/`rotating` events. On each update it computes the object's screen-space position, size, and rotation via `util.transformPoint` and applies them as inline styles.

---

## `OverlayContent`

Scales its children to fit within the parent's bounds (typically an `ObjectOverlay`). Content is measured at its natural size, then scaled down or up (capped at `maxScale`) to fill the available space while maintaining aspect ratio.

```tsx
import { OverlayContent } from '@bwp-web/canvas';

<ObjectOverlay canvasRef={canvasRef} object={obj}>
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

<ObjectOverlay canvasRef={canvasRef} object={obj}>
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
2. A `ResizeObserver` on the nearest overflow-hidden ancestor triggers a check on each resize
3. The check compares the container height to the cached total content height
4. If the container is too short, the element is hidden (`display: none`) — the cached height remains stable so the decision is deterministic
5. If the container grows large enough, the element is shown, re-measured, and verified to ensure it actually fits
6. The cache is kept fresh while the element is visible

This avoids feedback loops: hiding the element changes `OverlayContent`'s scale, but the cached height from the last visible state prevents oscillation.

---

## Composing overlays

A typical setup renders `ObjectOverlay` for each canvas object, with `OverlayContent` handling scaling and `FixedSizeContent` for labels:

```tsx
{objects.map((obj) => (
  <ObjectOverlay key={obj.data?.id} canvasRef={canvasRef} object={obj}>
    <OverlayContent>
      <Stack alignItems="center">
        <StatusIcon status={obj.data?.status} />
        <FixedSizeContent>
          <Typography noWrap variant="caption">
            {obj.data?.name}
          </Typography>
        </FixedSizeContent>
      </Stack>
    </OverlayContent>
  </ObjectOverlay>
))}
```

In this pattern:
- `StatusIcon` scales up/down with the object size
- The `Typography` label stays at a constant font size, truncates with ellipsis when too wide, and hides entirely when the object is too small to fit it vertically
