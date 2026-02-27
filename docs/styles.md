# Styles

Shared MUI theme and styling utilities for Biamp Workplace applications. Provides a fully configured MUI theme with light and dark color schemes, typography, spacing, and component overrides that match the Biamp Workplace design system.

## Installation

```bash
npm install @bwp-web/styles
```

### Peer Dependencies

- `@bwp-web/assets` >= 0.9.1
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Usage

### Basic Setup

Wrap your application in MUI's `ThemeProvider` with the Biamp theme and include `CssBaseline` to inject the font-face declarations and global resets:

```tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
import { biampTheme } from '@bwp-web/styles';

const theme = biampTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* your app */}
    </ThemeProvider>
  );
}
```

### Overriding the Theme

Pass any valid `createTheme` options to `biampTheme()` and they will be merged on top of the defaults:

```tsx
const theme = biampTheme({
  defaultColorScheme: 'light',
  colorSchemes: { dark: false },
});
```

### Light and Dark Mode

The theme includes both `light` and `dark` color schemes. MUI will select the scheme based on the `defaultColorScheme` option or the CSS class on the root element (controlled by `cssVariables.colorSchemeSelector: 'class'`).

To create separate theme objects for each mode (useful in Storybook or togglable UIs):

```tsx
const lightTheme = biampTheme({
  defaultColorScheme: 'light',
  colorSchemes: { dark: false },
});

const darkTheme = biampTheme({
  defaultColorScheme: 'dark',
  colorSchemes: { light: false },
});
```

## TypeScript

The theme extends MUI's default type definitions with custom palette entries, typography variants, and component props. **These augmentations are included automatically** when you import from `@bwp-web/styles` — no extra configuration needed:

```tsx
import { biampTheme } from '@bwp-web/styles';
// TypeScript now knows about theme.palette.biamp, theme.palette.blue, etc.
```

If you have files that use `useTheme()` or `theme.palette` but don't import from `@bwp-web/styles` directly (e.g. standalone component files), add a single global declaration file to your project:

```ts
// src/global.d.ts
/// <reference types="@bwp-web/styles/mui-theme-augmentation" />
```

This makes the augmented types available to every file in your project without needing per-file imports.

### Augmented Palette Types

| Type | Added Properties |
|------|-----------------|
| `Palette` | `sidebar`, `biamp`, `blue`, `purple`, `dividers` |
| `TypeBackground` | `success`, `warning`, `error`, `info` |
| `TypeText` | `sidebar` |
| `TypographyVariants` | `h0`, `sidebar` |

### Augmented Component Props

| Component | Override |
|-----------|---------|
| `Button` | `color="biamp"`, `variant="overlay"` |
| `Checkbox` | `color="biamp"` |
| `Fab` | `color="biamp"` |
| `Typography` | `variant="h0"`, `variant="sidebar"` |
| `IconButton` | `variant="none"`, `variant="transparent"`, `variant="outlined"` |
| `Alert` | `filled` and `outlined` variants disabled (only `standard` is available) |

## Color Palette

### Standard MUI Palette

| Key | Light | Dark | Description |
|-----|-------|------|-------------|
| `primary.main` | `#111111` | `#FFFFFF` | Primary UI color — dark in light mode, white in dark mode |
| `secondary.main` | `#FFFFFF` | `#FFFFFF` | Secondary UI color |
| `success.main` | `#008A05` | `#00E941` | Success signal |
| `warning.main` | `#E06C00` | `#FFB800` | Warning signal |
| `error.main` | `#E0002D` | `#FF1744` | Error/critical signal |
| `info.main` | `#1863D3` | `#1863D3` | Informational signal |

### Custom Palette Entries

These are unique to the Biamp theme and available via `theme.palette.*`:

| Key | Value | Description |
|-----|-------|-------------|
| `biamp.main` | `#d22730` | Biamp brand red |
| `blue.main` | `#1863D3` | Action/link blue (same as `info.main`) |
| `purple.main` | `#5B00EF` | Facility/scheduling purple |
| `sidebar.main` | `#E0E0E0` | Sidebar UI color |
| `dividers.primary` | `#111111` @ 15% alpha | Standard divider |
| `dividers.secondary` | `#111111` @ 40% alpha | Button/border divider |

### Background

| Key | Light | Dark |
|-----|-------|------|
| `background.default` | `#F5F5F5` | `#111111` |
| `background.paper` | `#FFFFFF` | `#111111` |
| `background.success` | `#EAFEF0` | `#093615` |
| `background.warning` | `#FFF4D9` | `#41320E` |
| `background.error` | `#FFEDF0` | `#2E1016` |
| `background.info` | `#EBF7FF` | `#101C25` |

### Text

| Key | Light | Dark |
|-----|-------|------|
| `text.primary` | `#111111` | `#FFFFFF` |
| `text.secondary` | `#878787` | `#878787` |
| `text.disabled` | `#111111` @ 40% | `#FFFFFF` @ 40% |
| `text.sidebar` | `#E0E0E0` | `#E0E0E0` |

### Grey Scale

| Key | Value |
|-----|-------|
| `grey.50` | `#fafafa` |
| `grey.100` | `#f5f5f5` |
| `grey.200` | `#eeeeee` |
| `grey.300` | `#c9c9c9` |
| `grey.400` | `#878787` |
| `grey.500` | `#646464` |
| `grey.600` | `#484848` |
| `grey.700` | `#333333` |
| `grey.800` | `#222222` |
| `grey.900` | `#111111` |

## Typography

Two font families are loaded automatically via `CssBaseline`:

- **Open Sans** (400, 600, 700, 800) — body text, buttons, labels
- **Montserrat** (500, 600, 700) — headings

### Variants

| Variant | Font | Size | Weight | Letter Spacing |
|---------|------|------|--------|----------------|
| `h0` | Montserrat | 3.5rem | 500 | -0.105rem |
| `h1` | Montserrat | 1.75rem | 500 | -0.07rem |
| `h2` | Montserrat | 1.25rem | 600 | -0.025rem |
| `h3` | Open Sans | 1rem | 600 | -0.02rem |
| `h4` | Montserrat | 1rem | 600 | -0.02rem |
| `body1` | Open Sans | 1rem | 400 | -0.02rem |
| `body2` | Open Sans | 0.875rem | 400 | -0.018rem |
| `caption` | Open Sans | 0.75rem | 400 | -0.015rem |
| `subtitle1` | Open Sans | 0.875rem | 400 | — |
| `subtitle2` | Open Sans | 0.75rem | 400 | — |
| `button` | Open Sans | 0.875rem | 600 | -0.018rem |
| `sidebar` | Open Sans | 0.563rem | 700 | -0.013rem |

`h0` and `sidebar` are custom variants added by the theme augmentations:

```tsx
<Typography variant="h0">Large heading</Typography>
<Typography variant="sidebar">Sidebar label</Typography>
```

## Spacing

The theme uses an 8px base spacing unit (`theme.spacing(1) = 8px`):

| `theme.spacing(n)` | Result |
|---------------------|--------|
| `0` | 0px |
| `0.5` | 4px |
| `1` | 8px |
| `1.5` | 12px |
| `2` | 16px |
| `2.5` | 20px |
| `3` | 24px |
| `3.5` | 28px |
| `4` | 32px |
| `5` | 40px |

## Component Overrides

The theme includes style overrides for the following MUI components. These are applied automatically — no extra configuration needed.

### Button

Three variants are available: `contained` (default), `outlined`, and `overlay`.

- **`variant="overlay"`** — Full-width, zero-border-radius button for overlay/bottom-bar UIs. Height is fixed at 48px.
- **`color="biamp"`** — Biamp brand red button.
- **`size="medium"`** (default) — 44px height, 6px border-radius.
- **`size="small"`** — 32px height, 4px border-radius.

### IconButton

- **`variant="transparent"`** (default) — Hover/active background tint on a transparent base.
- **`variant="outlined"`** — 32x32 with a bordered outline.
- **`variant="none"`** — Bare 28x28 icon, no hover/active background.

### Alert

Only the `standard` variant is enabled. MUI's `filled` and `outlined` variants are disabled.

### Other Components

Styled overrides are included for: `Breadcrumbs`, `Checkbox`, `Dialog`, `Divider`, `Drawer`, `Fab`, `FormControlLabel`, `FormHelperText`, `FormLabel`, `InputBase`, `InputLabel`, `Menu`, `MenuItem`, `OutlinedInput`, `Radio`, `Slider`, `Switch`, `Tab`, `Tabs`, `Tooltip`, `TextField`, `Autocomplete`, `DatePicker`, `PickersTextField`, `PickersInputBase`, `PickersOutlinedInput`.

## Exports

| Export | Type | Description |
|--------|------|-------------|
| `biampTheme(options?)` | `function` | Creates a configured MUI theme. Accepts optional `createTheme` options to override defaults. |
| `appBarHeight` | `number` | Standard app bar height (`64`) |
