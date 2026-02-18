# Workplace Public Packages

Monorepo for shared public packages used across Biamp Workplace applications.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@bwp-web/styles`](./packages/styles) | Shared MUI theme and styling utilities | Active |
| [`@bwp-web/components`](./packages/components) | Shared React components | Active |
| [`@bwp-web/assets`](./packages/assets) | Shared icons, image, and font assets | Active |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm 10.9.0

### Install

```bash
npm install
```

### Updating Packages

The packages `@bwp-web/styles`, `@bwp-web/components`, and `@bwp-web/assets` follow the same update process.

If the installed version uses a caret range (e.g., `^0.1.1`), you can pull in the latest compatible version with:

```bash
npm update @bwp-web/styles
```

To update all three packages at once:

```bash
npm update @bwp-web/styles @bwp-web/components @bwp-web/assets
```

If the new version is outside the caret range (e.g., `0.2.0` or `1.0.0`), you'll need to install the latest explicitly:

```bash
npm install @bwp-web/styles@latest
```

To install the latest version of all three packages at once:

```bash
npm install @bwp-web/styles@latest @bwp-web/components@latest @bwp-web/assets@latest
```

Replace `@bwp-web/styles` with `@bwp-web/components` or `@bwp-web/assets` as needed for individual updates.

### Build

```bash
# Build all packages
npx turbo run build

# Build a specific package
cd packages/styles && npm run build
```

## Using `@bwp-web/styles`

### Installation

```bash
npm install @bwp-web/styles
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@bwp-web/components` >= 0.1.0 (optional)

### Usage

```tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { biampTheme } from '@bwp-web/styles';

const theme = biampTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Customizing the Theme

`biampTheme` accepts an optional theme options object that is deep-merged on top of the base Biamp theme, just like overriding any default MUI theme. You can override palette colors, typography, component default props, style overrides, spacing, breakpoints -- anything MUI's `createTheme` supports.

```tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { biampTheme } from '@bwp-web/styles';

const theme = biampTheme({
  // Override palette colors
  palette: {
    primary: {
      main: '#ff0000',
    },
  },
  // Override typography
  typography: {
    fontFamily: '"Inter", sans-serif',
  },
  // Override component defaults and styles
  components: {
    MuiButton: {
      defaultProps: {
        size: 'small',
      },
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app with customized theme */}
    </ThemeProvider>
  );
}
```

### Theme Augmentation

Full TypeScript support for the custom palette colors (`biamp`, `blue`, `purple`, `sidebar`, etc.) and component variant overrides is **automatically included** when you import from `@bwp-web/styles` — no extra configuration needed.

If you need the augmentations without importing the theme (rare), you can reference the file directly in your `tsconfig.json`:

```json
{
  "include": [
    "src",
    "node_modules/@bwp-web/styles/mui-theme-augmentation.d.ts"
  ]
}
```

Or add a triple-slash directive in a project `.d.ts` file:

```ts
/// <reference types="@bwp-web/styles/mui-theme-augmentation" />
```

### Exports

- `biampTheme(overrideOptions?)` - Creates the Biamp Workplace MUI theme. Accepts optional theme override options.
- `appBarHeight` - Standard app bar height constant (64px).

## Using `@bwp-web/components`

### Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

### Component Documentation

| Component | Description | Docs |
|-----------|-------------|------|
| `BiampSidebar` | Fixed-width vertical sidebar with Biamp logo | [biamp-sidebar.md](./docs/biamp-sidebar.md) |
| `BiampSidebarIconList` | Vertical list with 4px gaps for sidebar items | [biamp-sidebar.md](./docs/biamp-sidebar.md) |
| `BiampSidebarIcon` | Selectable 48×48px icon button for sidebar navigation | [biamp-sidebar.md](./docs/biamp-sidebar.md) |
| `BiampSidebarComponent` | 48×48px rounded box for arbitrary sidebar content | [biamp-sidebar.md](./docs/biamp-sidebar.md) |
| `BiampHeader` | Horizontal header container with padding | [biamp-header.md](./docs/biamp-header.md) |
| `BiampHeaderTitle` | Title section with icon and H4 text | [biamp-header.md](./docs/biamp-header.md) |
| `BiampHeaderSearch` | Search input with leading search icon | [biamp-header.md](./docs/biamp-header.md) |
| `BiampHeaderActions` | Flex container for grouping action buttons and profile | [biamp-header.md](./docs/biamp-header.md) |
| `BiampHeaderButtonList` | Horizontal list with 4px gaps for header buttons | [biamp-header.md](./docs/biamp-header.md) |
| `BiampHeaderButton` | Selectable 40×40px icon button for header actions | [biamp-header.md](./docs/biamp-header.md) |
| `BiampHeaderProfile` | Profile image button | [biamp-header.md](./docs/biamp-header.md) |
| `BiampAppPopover` | Styled popover for the app-launcher dialog | [biamp-header.md](./docs/biamp-header.md) |
| `BiampAppDialog` | Rounded dialog container for app-launcher grid | [biamp-header.md](./docs/biamp-header.md) |
| `BiampAppDialogItem` | Clickable app tile with children content and label | [biamp-header.md](./docs/biamp-header.md) |

## Using `@bwp-web/assets`

### Installation

```bash
npm install @bwp-web/assets
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

### Fonts

All font files (Open Sans and Montserrat) required by the Biamp Workplace theme are bundled as data URLs in the assets package. If you are using `biampTheme()` with `<CssBaseline />`, **fonts load automatically** — no extra imports or configuration needed.

For standalone use or custom `@font-face` rules, fonts can be imported directly:

```tsx
import { OpenSansRegular, MontserratBold } from '@bwp-web/assets';
```

### Asset Documentation

For further asset documentation, go to [assets.md](./docs/assets.md)

## Storybook

A Storybook is included in this repo so you can browse and interact with every themed component, color, and typography variant without writing any code.

### Running Storybook

From the repo root:

```bash
npm run storybook
```

This starts Storybook at [http://localhost:6006](http://localhost:6006).

### What's Inside

| Section | What you'll find |
|---------|-----------------|
| **Styles / Colors** | Full color palette — primary, secondary, status colors, brand colors, grey scale, text, backgrounds, dividers, and action states |
| **Styles / Typography** | Every typography variant with font family, size, and weight |
| **Components** | Interactive demos of BiampSidebar, BiampSidebarIcon, BiampHeader, BiampHeaderButton, Button, IconButton, Checkbox, Switch, TextField, Autocomplete, Dialog, Tabs, Alert, and more |

Use the **Color Mode** toggle in the Storybook toolbar to switch between light and dark themes and see how each component and color adapts.

## Releasing

### Tagging a Release

1. Update the `version` field in each package's `package.json` to the new version number.

2. Commit the version bump:

   ```bash
   git add .
   git commit -m "Version to X.Y.Z"
   ```

3. Create an annotated git tag:

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   ```

4. Push the commit and tag:

   ```bash
   git push origin main
   git push origin vX.Y.Z
   ```

Tags follow the format `vX.Y.Z` (e.g., `v0.3.0`).

### Publishing to npm

After tagging, publish each package from its directory:

```bash
cd packages/styles && npm publish --access public
cd packages/components && npm publish --access public
cd packages/assets && npm publish --access public
```
