# Background

Utilities for managing a background image on the canvas (e.g. a floor plan image).

## `setBackgroundImage(canvas, url, options?): Promise<FabricImage>`

Loads an image from a URL (or data URL) and sets it as the canvas background. Optionally resizes large images before applying.

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

// Preserve opacity when replacing the background image
await setBackgroundImage(canvas, url, { preserveOpacity: true });
```

> When using `useEditCanvas`, prefer `canvas.setBackground(url)` which handles resize options from the hook config.

### Options (`SetBackgroundImageOptions`)

Extends `ResizeImageOptions` with:

| Option | Type | Default | Description |
|---|---|---|---|
| `maxSize` | `number` | `4096` | Maximum dimension in pixels |
| `minSize` | `number` | `50` | Minimum dimension — throws if smaller |
| `preserveOpacity` | `boolean` | `false` | Preserve the current background opacity when replacing the image |

When `preserveOpacity` is `true`, the current background opacity is read before loading the new image and re-applied afterwards. This avoids the manual 3-step pattern of read-opacity / set-image / restore-opacity.

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

## Opacity

### `setBackgroundOpacity(canvas, opacity)`

Set the background image opacity (0 = transparent, 1 = fully visible).

```typescript
setBackgroundOpacity(canvas, 0.5);
```

### `getBackgroundOpacity(canvas): number`

Get the current background image opacity.

```typescript
const opacity = getBackgroundOpacity(canvas); // 0.5
```

---

## Invert

### `setBackgroundInverted(canvas, inverted)`

Toggle a color inversion filter on the background image. Useful for dark floor plan images.

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
