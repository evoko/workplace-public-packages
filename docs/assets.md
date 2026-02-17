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

All images are inlined as data URLs during the build, so no additional asset pipeline is required.

### `BiampRedLogo`

| Export | Type | Description |
|--------|------|-------------|
| `BiampRedLogo` | `string` | Data URL of the 24×24 Biamp red logo PNG |

#### Usage

```tsx
import { BiampRedLogo } from '@bwp-web/assets';
import { Box } from '@mui/material';

function Logo() {
  return (
    <Box
      component="img"
      src={BiampRedLogo}
      alt="Biamp"
      sx={{ width: 24, height: 24 }}
    />
  );
}
```

### App Images

PNG images for the app-launcher dialog tiles. Each export is a `string` that resolves to a data URL.

| Export | Description |
|--------|-------------|
| `BookingApp` | Biamp Booking application icon |
| `CommandApp` | Biamp Command application icon |
| `ConnectApp` | Biamp Connect application icon |
| `DesignerApp` | Biamp Designer application icon |
| `WorkplaceApp` | Biamp Workplace application icon |

#### Usage

```tsx
import { BookingApp, DesignerApp, ConnectApp } from '@bwp-web/assets';
import { BiampAppDialog, BiampAppDialogItem } from '@bwp-web/components';
import { Box } from '@mui/material';

function AppLauncher() {
  const apps = [
    { image: BookingApp, name: 'Booking' },
    { image: DesignerApp, name: 'Designer' },
    { image: ConnectApp, name: 'Connect' },
  ];

  return (
    <BiampAppDialog>
      {apps.map((app) => (
        <BiampAppDialogItem key={app.name} name={app.name}>
          <Box
            component="img"
            src={app.image}
            alt={app.name}
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </BiampAppDialogItem>
      ))}
    </BiampAppDialog>
  );
}
```

## Fonts

All font files used by the Biamp Workplace theme are bundled as data URLs, just like images. This means fonts are embedded directly in the JavaScript bundle — no need to configure static file serving, copy font files to a public directory, or set up any additional asset pipeline.

### Included Fonts

**Open Sans** (woff2) — used as the default body font:

| Export | Weight | Style |
|--------|--------|-------|
| `OpenSansRegular` | 400 | normal |
| `OpenSansRegularItalic` | 400 | italic |
| `OpenSansSemiBold` | 600 | normal |
| `OpenSansSemiBoldItalic` | 600 | italic |
| `OpenSansBold` | 700 | normal |
| `OpenSansBoldItalic` | 700 | italic |
| `OpenSansExtraBold` | 800 | normal |
| `OpenSansExtraBoldItalic` | 800 | italic |

**Montserrat** (ttf) — used for headings (h0, h1, h2, h4):

| Export | Weight | Style |
|--------|--------|-------|
| `MontserratMedium` | 500 | normal |
| `MontserratSemiBold` | 600 | normal |
| `MontserratBold` | 700 | normal |

### Usage with the Biamp Theme (Recommended)

If you are using `biampTheme()` from `@bwp-web/styles` with MUI's `<CssBaseline />`, **fonts are loaded automatically**. The theme's CSS baseline injects `@font-face` declarations that reference the embedded font data URLs. No extra imports or configuration needed.

```tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { biampTheme } from '@bwp-web/styles';

const theme = biampTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Fonts are loaded here automatically */}
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Standalone Usage

If you need to use the font files outside of the Biamp theme (e.g. custom `@font-face` rules or non-MUI projects), you can import them directly. Each export is a `string` containing a `data:` URL.

```tsx
import { OpenSansRegular, MontserratBold } from '@bwp-web/assets';

// Use in a custom @font-face declaration
const fontFaceCSS = `
  @font-face {
    font-family: 'Open Sans';
    font-weight: 400;
    font-style: normal;
    src: url(${OpenSansRegular}) format('woff2');
  }

  @font-face {
    font-family: 'Montserrat';
    font-weight: 700;
    font-style: normal;
    src: url(${MontserratBold}) format('truetype');
  }
`;
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

- `BiampRedLogo` — Biamp red logo PNG (data URL).
- `BookingApp` — Biamp Booking app icon PNG (data URL).
- `CommandApp` — Biamp Command app icon PNG (data URL).
- `ConnectApp` — Biamp Connect app icon PNG (data URL).
- `DesignerApp` — Biamp Designer app icon PNG (data URL).
- `WorkplaceApp` — Biamp Workplace app icon PNG (data URL).

### Fonts

- `OpenSansRegular` — Open Sans 400 normal (woff2 data URL).
- `OpenSansRegularItalic` — Open Sans 400 italic (woff2 data URL).
- `OpenSansSemiBold` — Open Sans 600 normal (woff2 data URL).
- `OpenSansSemiBoldItalic` — Open Sans 600 italic (woff2 data URL).
- `OpenSansBold` — Open Sans 700 normal (woff2 data URL).
- `OpenSansBoldItalic` — Open Sans 700 italic (woff2 data URL).
- `OpenSansExtraBold` — Open Sans 800 normal (woff2 data URL).
- `OpenSansExtraBoldItalic` — Open Sans 800 italic (woff2 data URL).
- `MontserratMedium` — Montserrat 500 normal (ttf data URL).
- `MontserratSemiBold` — Montserrat 600 normal (ttf data URL).
- `MontserratBold` — Montserrat 700 normal (ttf data URL).
