# @bwp-web/styles

Shared MUI theme and styling utilities for the SOLAR Base UI design system. Provides pre-built light and dark MUI themes with semantic color tokens, typography scales, shadow effects, and component overrides.

## Installation

```bash
npm install @bwp-web/styles
```

### Peer Dependencies

- `@bwp-web/assets` >= 1.0.1
- `@mui/material` >= 7.0.0
- `@mui/x-date-pickers` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Usage

### Basic Setup

Wrap your application in MUI's `ThemeProvider` with one of the SOLAR themes and include `CssBaseline` for global resets:

```tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import { solarLightTheme, solarDarkTheme } from '@bwp-web/styles';

function App({ isDark }: { isDark: boolean }) {
  return (
    <ThemeProvider theme={isDark ? solarDarkTheme : solarLightTheme}>
      <CssBaseline />
      {/* your app */}
    </ThemeProvider>
  );
}
```

### Light and Dark Mode

Two pre-built theme objects are exported:

- **`solarLightTheme`** — Light color scheme
- **`solarDarkTheme`** — Dark color scheme

Switch between them by passing the appropriate theme to `ThemeProvider`.

## TypeScript

The theme extends MUI's default type definitions with a custom `neutral` palette entry. **These augmentations are included automatically** when you import from `@bwp-web/styles`:

```tsx
import { solarLightTheme } from '@bwp-web/styles';
// TypeScript now knows about theme.palette.neutral (with 50–900 scale)
```

If you have files that use `useTheme()` or `theme.palette` but don't import from `@bwp-web/styles` directly, add a global declaration file:

```ts
// src/global.d.ts
/// <reference types="@bwp-web/styles/mui-theme-augmentation" />
```

### Augmented Palette Types

| Type             | Added Properties                                |
| ---------------- | ----------------------------------------------- |
| `Palette`        | `neutral` (PaletteColor + 50–900 numeric scale) |
| `PaletteOptions` | `neutral` (PaletteColorOptions + 50–900 scale)  |

## Exports

| Export            | Type     | Description                                                                  |
| ----------------- | -------- | ---------------------------------------------------------------------------- |
| `solarLightTheme` | `Theme`  | Pre-built MUI theme for light mode                                           |
| `solarDarkTheme`  | `Theme`  | Pre-built MUI theme for dark mode                                            |
| `solarTypography` | `object` | Raw typography scale (display, title, body, label, helper, code, link)       |
| `solarShadows`    | `object` | Named shadow tokens (subtle, control, focus, danger, warning, modal, strong) |
| `solarPrimitives` | `object` | Primitive color palette (neutral, brand, red, orange, green, blue, alpha)    |

## Color System

### Semantic Token Architecture

Colors are organized as **semantic tokens** that map to primitive color scales. Each token has a light and dark mode value.

| Token Category | Examples                                                                                                     |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| `surface.*`    | `default`, `secondary`, `tertiary`, `overlay`, `inverse`, `brand`, `danger`, `warning`, `success`, `info`    |
| `text.*`       | `default`, `secondary`, `tertiary`, `disabled`, `inverse`, `brand`, `danger`, `link`                         |
| `icon.*`       | `default`, `secondary`, `tertiary`, `disabled`, `inverse`, `brand`, `danger`                                 |
| `border.*`     | `default`, `secondary`, `strong`, `inverse`, `brand`, `danger`, `warning`, `success`, `info`                 |
| `action.*`     | `primary.bg.*`, `primary.text.*`, `primary.icon.*`, `secondary.bg.*`, `secondary.text.*`, `secondary.icon.*` |
| `shadow.*`     | `default`, `focus`, `danger`                                                                                 |

### MUI Palette Mapping

| Key            | Light                   | Dark                    |
| -------------- | ----------------------- | ----------------------- |
| `primary.main` | Brand 600 (`#0284C7`)   | Brand 500 (`#0EA5E9`)   |
| `error.main`   | Red 500 (`#F5222D`)     | Red 500 (`#F5222D`)     |
| `warning.main` | Orange 500 (`#FA8C16`)  | Orange 500 (`#FA8C16`)  |
| `success.main` | Green 500 (`#52C41A`)   | Green 500 (`#52C41A`)   |
| `info.main`    | Blue 500 (`#1677FF`)    | Blue 500 (`#1677FF`)    |
| `divider`      | Neutral 200 (`#E4E7EC`) | Neutral 700 (`#344054`) |

### Primitive Color Scales

| Scale     | Range  | Description              |
| --------- | ------ | ------------------------ |
| `neutral` | 50–900 | Grey/neutral UI tones    |
| `brand`   | 50–900 | Primary brand (sky blue) |
| `red`     | 50–700 | Error/danger feedback    |
| `orange`  | 50–700 | Warning feedback         |
| `green`   | 50–700 | Success feedback         |
| `blue`    | 50–700 | Info feedback            |

### Background

| Key                  | Light                  | Dark                    |
| -------------------- | ---------------------- | ----------------------- |
| `background.default` | White (`#FFFFFF`)      | Neutral 900 (`#101828`) |
| `background.paper`   | Neutral 50 (`#F9FAFB`) | Neutral 800 (`#1D2939`) |

### Text

| Key              | Light                   | Dark                    |
| ---------------- | ----------------------- | ----------------------- |
| `text.primary`   | Neutral 900 (`#101828`) | Neutral 50 (`#F9FAFB`)  |
| `text.secondary` | Neutral 700 (`#344054`) | Neutral 300 (`#D0D5DD`) |
| `text.disabled`  | Neutral 300 (`#D0D5DD`) | Neutral 500 (`#667085`) |

## Typography

The **Inter** font family is the primary typeface; **JetBrains Mono** is used for code.

### MUI Variant Mapping

| MUI Variant | SOLAR Scale | Size     | Weight |
| ----------- | ----------- | -------- | ------ |
| `h1`        | display/lg  | 3.75rem  | 700    |
| `h2`        | display/md  | 3rem     | 700    |
| `h3`        | display/sm  | 2.25rem  | 700    |
| `h4`        | title/lg    | 1.875rem | 600    |
| `h5`        | title/md    | 1.5rem   | 600    |
| `h6`        | title/sm    | 1.25rem  | 600    |
| `subtitle1` | title/xs    | 1.125rem | 600    |
| `subtitle2` | label/md    | 0.875rem | 500    |
| `body1`     | body/md     | 1rem     | 400    |
| `body2`     | body/sm     | 0.875rem | 400    |
| `caption`   | helper/sm   | 0.75rem  | 400    |
| `overline`  | label/sm    | 0.75rem  | 500    |
| `button`    | label/md    | 0.875rem | 500    |

### Extended Typography (via `solarTypography`)

The full SOLAR typography scale is available as a standalone export for use with `sx` or `styled`:

```tsx
import { solarTypography } from '@bwp-web/styles';

// Use in sx prop
<Box sx={{ ...solarTypography.codeMd }} />
<Box sx={{ ...solarTypography.linkSm }} />
```

Available tokens: `displayLg`, `displayMd`, `displaySm`, `titleLg`, `titleMd`, `titleSm`, `titleXs`, `bodyMdRegular`/`Medium`/`Semibold`/`Bold`, `bodySmRegular`/`Medium`/`Semibold`/`Bold`, `bodyXsRegular`/`Medium`/`Semibold`/`Bold`, `labelMd`, `labelSm`, `helperMd`, `helperSm`, `linkMd`, `linkSm`, `linkXs`, `codeMd`, `codeSm`.

## Shadows

Named shadow tokens from the design system's effect styles:

| Token     | Description                       |
| --------- | --------------------------------- |
| `subtle`  | Minimal elevation (cards)         |
| `control` | Form controls (inputs, selects)   |
| `focus`   | Focus ring (blue glow)            |
| `danger`  | Error focus ring (red glow)       |
| `warning` | Warning focus ring (orange glow)  |
| `modal`   | Dialogs and modals                |
| `strong`  | High elevation (dropdowns, menus) |

```tsx
import { solarShadows } from '@bwp-web/styles';

<Box sx={{ boxShadow: solarShadows.modal }} />;
```

## Spacing

The theme uses an 8px base spacing unit (`theme.spacing(1) = 8px`).

## Component Overrides

The theme includes style overrides for the following MUI components, applied automatically:

- **Button** — `contained`, `outlined`, `text` variants with semantic action token colors. Sizes: `small`, `medium`, `large`.
- **OutlinedInput / TextField** — Border, focus ring, error states using semantic tokens.
- **Card** — Border, subtle shadow, surface background.
- **Chip** — Compact with outlined variant styling.
- **Dialog** — Modal shadow, border, rounded corners (12px).
- **Alert** — Standard variant with feedback surface/border/text colors for error, warning, success, info.
- **Table** — Header/cell styling with typography tokens.
- **Checkbox / Radio / Switch** — Brand color on checked state.
- **Tooltip** — Dark background with body/sm typography.
- **Tabs** — Brand indicator with border-bottom.
- **Breadcrumbs** — Link styling with brand color.
- **Link** — Brand color with underline.
- **Skeleton** — Tertiary surface color.
- **Divider** — Border default color.
- **Select** — Secondary icon color.
- **FormLabel / FormHelperText** — Semantic text colors with error states.
- **CssBaseline** — Global body, code, and pre styling.

### DatePicker & TimePicker

`DatePicker` and `TimePicker` are styled but require a `LocalizationProvider` wrapper:

```tsx
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

function MyComponent() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker label="Date" />
    </LocalizationProvider>
  );
}
```
