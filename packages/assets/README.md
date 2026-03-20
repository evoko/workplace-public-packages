# @bwp-web/assets

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

### Layout Icons

Icons used in the Biamp Workplace shell (header, sidebar, app launcher).

| Icon               | Description                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------- |
| `BiampLogoIcon`    | Biamp wordmark logo. Theme-aware — renders dark text in light mode and white text in dark mode |
| `SearchIcon`       | 16×16 magnifying glass icon using `currentColor`                                               |
| `AppsIcon`         | 24×24 nine-dot grid icon with a fixed grey fill (#878787)                                      |
| `AppsIconFilled`   | 24×24 filled nine-dot grid icon using `currentColor`                                           |
| `KeyArrowDownIcon` | Keyboard arrow-down key visual for search/navigation hints                                     |
| `KeyArrowUpIcon`   | Keyboard arrow-up key visual for search/navigation hints                                       |

### Theme Icons

Icons used internally by the `@bwp-web/styles` theme for MUI component overrides (alerts, checkboxes, radio buttons). Status icons are theme-aware and adapt to dark/light mode.

| Icon                | Description                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------- |
| `CheckedIcon`       | 16×16 filled checkbox with a white checkmark                                                  |
| `UncheckedIcon`     | 16×16 empty checkbox outline                                                                  |
| `IndeterminateIcon` | 16×16 checkbox with a white horizontal dash                                                   |
| `ErrorStatusIcon`   | 14×14 circular error indicator with exclamation mark. Theme-aware colours and drop shadow     |
| `WarningStatusIcon` | 16×14 triangular warning indicator with exclamation mark. Theme-aware colours and drop shadow |
| `InfoStatusIcon`    | 14×14 circular info indicator with "i" mark. Theme-aware colours and drop shadow              |
| `SuccessStatusIcon` | 14×14 circular success indicator with checkmark. Theme-aware colours and drop shadow          |

### Icon Sizes

Icons are organised into size-based groups. Each group corresponds to a fixed pixel size:

| Variant | Size |
| ------- | ---- |
| `xxxxs` | 6px  |
| `xxxs`  | 8px  |
| `xxs`   | 12px |
| `xs`    | 16px |
| `sm`    | 20px |
| `md`    | 24px |
| `lg`    | 32px |
| `xl`    | 40px |
| `xxl`   | 56px |
| `xxxl`  | 72px |

Icons that appear in multiple sizes are exported as a single component that accepts a `variant` prop. The default variant is `md` (24px).

```tsx
import { CloseIcon, BadgeLiveIcon } from '@bwp-web/assets';

// Single-size icon (no variant prop)
<BadgeLiveIcon />  // always 6px (xxxxs)

// Multi-size icon — default is md (24px)
<CloseIcon />

// Multi-size icon — explicit variant
<CloseIcon variant="xs" />  // 16px
<CloseIcon variant="xxs" /> // 12px
```

All icons respect MUI's `sx` prop for sizing:

```tsx
<SuccessStatusIcon sx={{ width: 14, height: 14 }} />
<SuccessStatusIcon sx={{ width: 24, height: 24 }} />
```

There are 220+ icon exports in total. See Storybook (**Assets > Icons > Icon Groups**) for the full catalog.

## Images

All images are inlined as data URLs during the build, so no additional asset pipeline is required.

### `BiampRedLogo`

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

| Export         | Description                      |
| -------------- | -------------------------------- |
| `BiampRedLogo` | Biamp red logo PNG (data URL)    |
| `BookingApp`   | Biamp Booking application icon   |
| `CommandApp`   | Biamp Command application icon   |
| `ConnectApp`   | Biamp Connect application icon   |
| `DesignerApp`  | Biamp Designer application icon  |
| `WorkplaceApp` | Biamp Workplace application icon |

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

All font files used by the Biamp Workplace theme are bundled as data URLs. Fonts are embedded directly in the JavaScript bundle — no need to configure static file serving or copy font files.

### Usage with the Biamp Theme (Recommended)

If you are using `biampTheme()` from `@bwp-web/styles` with MUI's `<CssBaseline />`, **fonts are loaded automatically**. No extra imports or configuration needed.

### Standalone Usage

```tsx
import { OpenSansRegular, MontserratBold } from '@bwp-web/assets';

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

### Included Fonts

**Open Sans** (woff2) — default body font:

| Export                    | Weight | Style  |
| ------------------------- | ------ | ------ |
| `OpenSansRegular`         | 400    | normal |
| `OpenSansRegularItalic`   | 400    | italic |
| `OpenSansSemiBold`        | 600    | normal |
| `OpenSansSemiBoldItalic`  | 600    | italic |
| `OpenSansBold`            | 700    | normal |
| `OpenSansBoldItalic`      | 700    | italic |
| `OpenSansExtraBold`       | 800    | normal |
| `OpenSansExtraBoldItalic` | 800    | italic |

**Montserrat** (ttf) — headings (h0, h1, h2, h4):

| Export               | Weight | Style  |
| -------------------- | ------ | ------ |
| `MontserratMedium`   | 500    | normal |
| `MontserratSemiBold` | 600    | normal |
| `MontserratBold`     | 700    | normal |
