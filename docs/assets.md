# Assets

Shared Biamp Workplace icons and image assets. All visual assets are centralised in this package so that `@bwp-web/components`, `@bwp-web/styles`, and consumer applications can import them from a single source.

## Installation

```bash
npm install @bwp-web/assets
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Icons

Every icon is a React component that wraps an inline SVG inside MUI's `SvgIcon`. They accept all standard `SvgIconProps` (e.g. `sx`, `fontSize`, `color`).

### Usage

```tsx
import { SearchIcon, BiampLogoIcon } from '@bwp-web/assets';

function Header() {
  return (
    <div>
      <BiampLogoIcon sx={{ width: 48, height: 15 }} />
      <SearchIcon />
    </div>
  );
}
```

### Component Icons

Icons used directly in Biamp Workplace components (header, sidebar, app launcher).

| Icon | Description |
|------|-------------|
| `BiampLogoIcon` | Biamp wordmark logo. Theme-aware — renders dark text in light mode and white text in dark mode |
| `SearchIcon` | 16×16 magnifying glass icon using `currentColor` |
| `AppsIcon` | 24×24 nine-dot grid icon with a fixed grey fill (#878787) |
| `AppsIconFilled` | 24×24 filled nine-dot grid icon using `currentColor` |

### Theme Icons

Icons used internally by the `@bwp-web/styles` theme for MUI component overrides (alerts, checkboxes, breadcrumbs, date picker, autocomplete).

| Icon | Description |
|------|-------------|
| `CheckedIcon` | 16×16 filled checkbox with a white checkmark |
| `UncheckedIcon` | 16×16 empty checkbox outline |
| `IndeterminateIcon` | 16×16 checkbox with a white horizontal dash |
| `BreadcrumbIcon` | 16×16 right-pointing arrow separator |
| `DatePickerIcon` | 24×24 calendar icon |
| `InputCloseIcon` | 24×24 close (×) icon for clearing inputs |
| `ErrorStatusIcon` | 14×14 circular error indicator with exclamation mark. Theme-aware colours and drop shadow |
| `WarningStatusIcon` | 16×14 triangular warning indicator with exclamation mark. Theme-aware colours and drop shadow |
| `InfoStatusIcon` | 14×14 circular info indicator with "i" mark. Theme-aware colours and drop shadow |
| `SuccessStatusIcon` | 14×14 circular success indicator with checkmark. Theme-aware colours and drop shadow |

### Sizing

All icons respect MUI's `sx` prop for sizing:

```tsx
<SuccessStatusIcon sx={{ width: 14, height: 14 }} />
<SuccessStatusIcon sx={{ width: 24, height: 24 }} />
<SuccessStatusIcon sx={{ width: 48, height: 48 }} />
```

## Images

### `biampRedLogo`

A named export that resolves to the Biamp red logo PNG image. During the build it is inlined as a data URL, so no additional asset pipeline is required.

| Export | Type | Description |
|--------|------|-------------|
| `biampRedLogo` | `string` | Data URL of the 24×24 Biamp red logo PNG |

#### Usage

```tsx
import { biampRedLogo } from '@bwp-web/assets';
import { Box } from '@mui/material';

function Logo() {
  return (
    <Box
      component="img"
      src={biampRedLogo}
      alt="Biamp"
      sx={{ width: 24, height: 24 }}
    />
  );
}
```

## Exports

### Icons

- `BiampLogoIcon` — Biamp wordmark logo (theme-aware).
- `SearchIcon` — Magnifying glass search icon.
- `AppsIcon` — Nine-dot grid icon (grey).
- `AppsIconFilled` — Nine-dot grid icon (filled, currentColor).
- `CheckedIcon` — Filled checkbox with checkmark.
- `UncheckedIcon` — Empty checkbox outline.
- `IndeterminateIcon` — Checkbox with horizontal dash.
- `BreadcrumbIcon` — Right-pointing arrow separator.
- `DatePickerIcon` — Calendar icon.
- `InputCloseIcon` — Close (×) icon.
- `ErrorStatusIcon` — Circular error status indicator.
- `WarningStatusIcon` — Triangular warning status indicator.
- `InfoStatusIcon` — Circular info status indicator.
- `SuccessStatusIcon` — Circular success status indicator.

### Images

- `biampRedLogo` — Biamp red logo PNG (data URL).
