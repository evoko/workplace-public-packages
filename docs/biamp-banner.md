# BiampBanner

A full-width notification banner that slides in and out with an animated `Collapse`. Composed of four sub-components — `BiampBanner`, `BiampBannerIcon`, `BiampBannerContent`, and `BiampBannerActions` — that map to the icon, message, and action areas of the banner.

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/assets` >= 0.14.1
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `BiampBanner`

The root container. Renders as an `<aside>` wrapped in a MUI `Collapse` for animated show/hide. The background color is sourced from `palette.background[severity]` and a matching bottom border is applied automatically.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | — | Controls visibility; animates in/out via `Collapse` |
| `severity` | `'error' \| 'warning' \| 'success' \| 'info'` | — | Sets the background color and border color |
| `children` | `React.ReactNode` | — | Compose with `BiampBannerIcon`, `BiampBannerContent`, `BiampBannerActions` |

---

### `BiampBannerIcon`

The leading icon slot. Pass `severity` to render the matching status icon automatically, or pass `children` for a custom icon. Renders no DOM wrapper.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `severity` | `AlertColor` | — | Renders the matching default status icon |
| `children` | `React.ReactNode` | — | Custom icon; used when `severity` is not provided |

---

### `BiampBannerContent`

The center content slot. Renders a `Typography` (`variant="h3"`) with `textAlign="center"`. Extends `TypographyProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | Banner message text |
| _...rest_ | `TypographyProps` | — | All MUI `Typography` props are forwarded |

---

### `BiampBannerActions`

The trailing actions slot. Renders a horizontal flex row with 8px gap. Extends `BoxProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | — | Action elements (e.g. `Button`) |
| _...rest_ | `BoxProps` | — | All MUI `Box` props are forwarded |

---

## Usage

### Basic banner with dismiss

```tsx
import { useState } from 'react';
import { Button } from '@mui/material';
import {
  BiampBanner,
  BiampBannerIcon,
  BiampBannerContent,
  BiampBannerActions,
} from '@bwp-web/components';

function App() {
  const [show, setShow] = useState(true);

  return (
    <BiampBanner show={show} severity="info">
      <BiampBannerIcon severity="info" />
      <BiampBannerContent>
        Your session will expire in 5 minutes.
      </BiampBannerContent>
      <BiampBannerActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          onClick={() => setShow(false)}
        >
          Dismiss
        </Button>
      </BiampBannerActions>
    </BiampBanner>
  );
}
```

### Content only (no icon or actions)

```tsx
<BiampBanner show severity="info">
  <BiampBannerContent>
    Scheduled maintenance on Sunday, 2 AM – 4 AM UTC.
  </BiampBannerContent>
</BiampBanner>
```

### Multiple actions

```tsx
<BiampBanner show severity="warning">
  <BiampBannerIcon severity="warning" />
  <BiampBannerContent>
    A firmware update is ready to install. Reboot required.
  </BiampBannerContent>
  <BiampBannerActions>
    <Button size="small" variant="outlined" color="inherit">
      Update now
    </Button>
    <Button size="small" variant="outlined" color="inherit" onClick={dismiss}>
      Dismiss
    </Button>
  </BiampBannerActions>
</BiampBanner>
```

### Custom icon

```tsx
import MyCustomIcon from './MyCustomIcon';

<BiampBanner show severity="warning">
  <BiampBannerIcon>
    <MyCustomIcon />
  </BiampBannerIcon>
  <BiampBannerContent>Custom icon banner.</BiampBannerContent>
</BiampBanner>
```

## Design Details

- **Layout**: Horizontal flexbox, `align-items: center`, `justify-content: space-between`
- **Background**: `palette.background[severity]` (theme-driven per severity)
- **Border**: 0.6px bottom border using `palette[severity].main`
- **Min height**: 48px
- **Padding**: `16px` horizontal on xs, `20px` on sm+
- **Animation**: MUI `Collapse` with `unmountOnExit`
- **Semantic element**: Renders as `<aside>`

## Exports

- `BiampBanner` — Root banner container
- `BiampBannerIcon` — Leading icon slot
- `BiampBannerContent` — Center message slot
- `BiampBannerActions` — Trailing actions slot
- `BiampBannerProps` — TypeScript type for `BiampBanner`
- `BiampBannerIconProps` — TypeScript type for `BiampBannerIcon`
