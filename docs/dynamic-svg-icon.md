# DynamicSvgIcon

A component that fetches an SVG from a URL and renders it as a MUI `SvgIcon`. While the SVG is loading, a MUI `Skeleton` placeholder is shown. If the fetch fails, a required fallback element is displayed instead. The `width` and `height` props are enforced across all three states so the layout never shifts.

Fetched SVGs are cached in-memory — the same URL is only fetched once per page session.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Props

### DynamicSvgIcon

| Prop                | Type                                     | Default      | Description                                            |
| ------------------- | ---------------------------------------- | ------------ | ------------------------------------------------------ |
| `url`               | `string`                                 | —            | URL of the SVG to fetch (any URL supported by `fetch`) |
| `fallback`          | `React.ReactNode`                        | **required** | Element shown when loading fails                       |
| `width`             | `number`                                 | `24`         | Width in pixels for icon, skeleton, and fallback       |
| `height`            | `number`                                 | `24`         | Height in pixels for icon, skeleton, and fallback      |
| `replaceColors`     | `boolean`                                | `false`      | Replace all fill/stroke colors (except `"none"` and `"currentColor"`) with `"currentColor"` for full theming support |
| `skeletonVariant`   | `'circular' \| 'rectangular' \| 'rounded'` | `'circular'` | Skeleton shape during loading                          |
| `skeletonAnimation` | `'pulse' \| 'wave' \| false`            | `'pulse'`    | Skeleton animation type                                |
| `onLoad`            | `() => void`                             | —            | Called when the SVG loads successfully                  |
| `onError`           | `(error: string) => void`                | —            | Called when loading fails                               |
| `sx`                | `SxProps`                                | —            | MUI `sx` style overrides (forwarded to `SvgIcon`)      |
| `...`               | `SvgIconProps`                           | —            | All other MUI `SvgIcon` props are forwarded             |

### useDynamicSvgIcon (hook)

For custom rendering logic, the underlying hook is also exported.

```ts
function useDynamicSvgIcon(
  url: string,
  options?: UseDynamicSvgIconOptions,
): UseDynamicSvgIconResult;
```

**Options:**

| Field           | Type                          | Default | Description                                                                                             |
| --------------- | ----------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| `replaceColors` | `boolean`                     | `false` | Replace all fill/stroke colors (except `"none"` and `"currentColor"`) with `"currentColor"` for theming |
| `onLoad`        | `() => void`                  | —       | Called when the SVG loads                                                                                |
| `onError`       | `(error: string) => void`     | —       | Called when loading fails                                                                                |

**Result:**

| Field        | Type             | Description                                    |
| ------------ | ---------------- | ---------------------------------------------- |
| `loading`    | `boolean`        | Whether the SVG is currently being fetched      |
| `error`      | `string \| null` | Error message if fetching failed                |
| `svgContent` | `string \| null` | The inner SVG markup (paths, groups, etc.)      |
| `svgViewBox` | `string \| null` | The viewBox extracted from the source SVG       |

### clearDynamicSvgIconCache

Utility function to clear the in-memory SVG cache. Useful for testing or forcing a refetch.

```ts
import { clearDynamicSvgIconCache } from '@bwp-web/components';

clearDynamicSvgIconCache();
```

## Basic Usage

```tsx
import { DynamicSvgIcon } from '@bwp-web/components';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

function DeviceIcon({ iconUrl }: { iconUrl: string }) {
  return (
    <DynamicSvgIcon
      url={iconUrl}
      width={32}
      height={32}
      fallback={<BrokenImageIcon />}
    />
  );
}
```

## Custom Dimensions

Width and height can be set independently for non-square containers:

```tsx
<DynamicSvgIcon
  url="https://example.com/wide-badge.svg"
  width={64}
  height={32}
  fallback={<BrokenImageIcon />}
/>
```

## Skeleton Customization

Control the skeleton shape and animation during loading:

```tsx
<DynamicSvgIcon
  url={iconUrl}
  width={48}
  height={48}
  skeletonVariant="rounded"
  skeletonAnimation="wave"
  fallback={<BrokenImageIcon />}
/>
```

Available variants: `circular` (default), `rectangular`, `rounded`.
Available animations: `pulse` (default), `wave`, `false` (disabled).

## Error Handling with Callbacks

```tsx
<DynamicSvgIcon
  url={iconUrl}
  width={24}
  height={24}
  fallback={<BrokenImageIcon />}
  onLoad={() => console.log('Icon loaded')}
  onError={(msg) => console.warn('Icon failed:', msg)}
/>
```

## Color Theming

By default, the SVG's original colors are preserved. Set `replaceColors` to override all hard-coded fill and stroke values with `currentColor`, so the icon inherits its color from CSS:

```tsx
<DynamicSvgIcon
  url={iconUrl}
  width={32}
  height={32}
  replaceColors
  sx={{ color: 'primary.main' }}
  fallback={<BrokenImageIcon />}
/>
```

`fill="none"` and `stroke="none"` are preserved — only actual color values are replaced.

## Using the Hook Directly

For advanced use cases where you need full control over rendering:

```tsx
import { useDynamicSvgIcon } from '@bwp-web/components';

function CustomIcon({ url }: { url: string }) {
  const { loading, error, svgContent, svgViewBox } = useDynamicSvgIcon(url);

  if (loading) return <span>Loading...</span>;
  if (error) return <span>Error: {error}</span>;

  return (
    <svg viewBox={svgViewBox ?? '0 0 24 24'} width={24} height={24}>
      <g dangerouslySetInnerHTML={{ __html: svgContent! }} />
    </svg>
  );
}
```

## How It Works

1. **Fetch** — The SVG is fetched via the Fetch API. Data URLs, blob URLs, and remote URLs are all supported.
2. **Validate** — The response is checked for `<svg` content or an SVG content-type header.
3. **Parse** — The viewBox is extracted from the root `<svg>` element. The inner content (paths, groups, etc.) is extracted and rendered inside a MUI `SvgIcon`.
4. **Cache** — The parsed content and viewBox are stored in an in-memory `Map`. Subsequent renders with the same URL skip the fetch entirely.
5. **Render** — By default, colors and viewBox are preserved as-is from the source SVG. Paths without an explicit `fill` attribute inherit `currentColor` from MUI SvgIcon's CSS. When `replaceColors` is `true`, all fill and stroke values (except `"none"` and `"currentColor"`) are replaced with `"currentColor"`, making the icon fully themeable via CSS `color`.

## Storybook

Interactive demos are available in Storybook under **Components / DynamicSvgIcon**:

- **Playground** — tweak all props via controls
- **Sizes** — square icons from 16px to 96px
- **NonSquareDimensions** — independent width and height
- **StatesOverview** — loading, error, and success side by side
- **SkeletonVariants** — circular, rectangular, and rounded
- **SkeletonAnimations** — pulse, wave, and disabled
- **FallbackTypes** — MUI icons, colored icons, text, disabled icons
- **ReplaceColors** — original vs. themed colors side by side
- **Callbacks** — onLoad and onError firing in real time
