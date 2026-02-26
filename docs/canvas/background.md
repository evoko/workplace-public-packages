# Background

Utilities for managing a background image on the canvas (e.g. a floor plan image).

## `setBackgroundImage(canvas, url, options?): Promise<FabricImage>`

Loads an image from a URL (or data URL) and sets it as the canvas background. Optionally resizes large images before applying. Fires `background:modified` on the canvas after the image is set.

```typescript
import { setBackgroundImage } from '@bwp-web/canvas';

// From a file input
const reader = new FileReader();
reader.onload = async (e) => {
  await setBackgroundImage(canvas, e.target.result as string);
};
reader.readAsDataURL(file);

// With resize options
await setBackgroundImage(canvas, url, { maxSize: 2000, minSize: 100 });

// Preserve contrast when replacing the background image
await setBackgroundImage(canvas, url, { preserveContrast: true });
```

> When using `useEditCanvas`, prefer `canvas.setBackground(url)` which handles resize options from the hook config.

### Options (`SetBackgroundImageOptions`)

Extends `ResizeImageOptions` with:

| Option | Type | Default | Description |
|---|---|---|---|
| `maxSize` | `number` | `4096` | Maximum dimension in pixels. Resize only triggers when `maxSize` or `minSize` are explicitly passed |
| `minSize` | `number` | `50` | Minimum dimension — throws if smaller. Resize only triggers when `maxSize` or `minSize` are explicitly passed |
| `preserveContrast` | `boolean` | `false` | Preserve the current background contrast when replacing the image. Does not trigger resize on its own |

When `preserveContrast` is `true`, the current background contrast is read before loading the new image and re-applied afterwards. Note that `preserveContrast` alone no longer triggers image resize — resize only occurs when `maxSize` or `minSize` are explicitly passed.

---

## `fitViewportToBackground(canvas, options?)`

Adjusts the viewport (pan + zoom) to frame the background image within the canvas, with optional padding.

```typescript
import { fitViewportToBackground } from '@bwp-web/canvas';

fitViewportToBackground(canvas, { padding: 20 });
```

### Options (`FitViewportOptions`)

| Option | Type | Default | Description |
|---|---|---|---|
| `padding` | `number` | `20` | Pixels of padding around the image |

> Automatically called by hooks when `autoFitToBackground` is enabled (default).

---

## `getBackgroundSrc(canvas): string | null`

Get the source URL of the canvas background image, or `null` if no background image is set.

```typescript
import { getBackgroundSrc } from '@bwp-web/canvas';

const src = getBackgroundSrc(canvas);
if (src?.startsWith('blob:')) {
  // handle blob URL background
}
```

---

## Contrast

### `setBackgroundContrast(canvas, value)`

Set the contrast of the background image.

- **0**: minimum contrast (flat grey).
- **1**: normal / unmodified (default).
- **2**: maximum contrast (darks are truly dark, lights truly light).

Value is clamped to the 0–2 range. Fires `background:modified` on the canvas when the contrast actually changes.

```typescript
setBackgroundContrast(canvas, 0.5);  // low contrast
setBackgroundContrast(canvas, 1);    // normal (default)
setBackgroundContrast(canvas, 1.8);  // high contrast
```

### `getBackgroundContrast(canvas): number`

Get the current contrast value (0–2 range, 1 = normal).

```typescript
const contrast = getBackgroundContrast(canvas); // e.g. 1.8
```

---

## Invert

### `setBackgroundInverted(canvas, inverted)`

Toggle a color inversion filter on the background image. Useful for dark floor plan images. Fires `background:modified` on the canvas when the invert state actually changes.

```typescript
setBackgroundInverted(canvas, true);  // apply invert filter
setBackgroundInverted(canvas, false); // remove invert filter
```

### `getBackgroundInverted(canvas): boolean`

Check whether the invert filter is currently applied.

```typescript
const isInverted = getBackgroundInverted(canvas); // true
```

---

## Image resizing

### `resizeImageUrl(url, options?): Promise<ResizeResult>`

Downscales an image if it exceeds `maxSize`, rejects if smaller than `minSize`. Returns a new data URL if resized, or the original if no resize was needed.

```typescript
import { resizeImageUrl } from '@bwp-web/canvas';

const result = await resizeImageUrl(dataUrl, {
  maxSize: 2000,  // max dimension in pixels
  minSize: 100,   // min dimension — throws if smaller
});

console.log(result.width, result.height); // actual dimensions
console.log(result.wasResized);           // true if downscaled
console.log(result.url);                  // data URL (possibly resized)
```

### `ResizeResult`

```typescript
interface ResizeResult {
  url: string;       // data URL (original or resized)
  width: number;     // actual width
  height: number;    // actual height
  wasResized: boolean; // true if downscaling occurred
}
```

### `ResizeImageOptions`

| Option | Type | Default | Description |
|---|---|---|---|
| `maxSize` | `number` | `4096` | Maximum dimension in pixels |
| `minSize` | `number` | `50` | Minimum dimension — throws if smaller |

---

## `background:modified` event

All background mutation functions (`setBackgroundImage`, `setBackgroundContrast`, `setBackgroundInverted`) fire a custom `background:modified` event on the canvas when the background actually changes. This event is used internally by `useEditCanvas` for dirty tracking and history, but consumers can also listen for it directly:

```typescript
canvas.on('background:modified', () => {
  console.log('Background was changed');
});
```

The event only fires when a real change occurs — for example, calling `setBackgroundContrast(canvas, 1)` when the contrast is already normal (no filter present) does not fire the event.
