# Workplace Public Packages

Monorepo for shared public packages used across Biamp Workplace applications.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@bwp-web/styles`](./packages/styles) | Shared MUI theme and styling utilities | Active |
| [`@bwp-web/components`](./packages/components) | Shared React components | Active |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm 10.9.0

### Install

```bash
npm install
```

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

### `BiampSidebar`

A fixed-width (48px) vertical sidebar that renders its children as navigation items with the Biamp logo automatically placed at the bottom. Extends MUI `StackProps`.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | Sidebar content — typically a list of `BiampSidebarIcon` components |
| `sx` | `SxProps` | MUI system styles passed to the root `Stack` |
| _...rest_ | `StackProps` | All other MUI `Stack` props are forwarded |

#### Basic Usage

```tsx
import { BiampSidebar, BiampSidebarIcon } from '@bwp-web/components';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import HomeIcon from '@mui/icons-material/Home';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SettingsIcon from '@mui/icons-material/Settings';

function AppShell() {
  const [selected, setSelected] = useState(0);

  return (
    <BiampSidebar>
      <BiampSidebarIcon
        selected={selected === 0}
        icon={<HomeOutlinedIcon />}
        selectedIcon={<HomeIcon />}
        onClick={() => setSelected(0)}
      />
      <BiampSidebarIcon
        selected={selected === 1}
        icon={<SettingsOutlinedIcon />}
        selectedIcon={<SettingsIcon />}
        onClick={() => setSelected(1)}
      />
    </BiampSidebar>
  );
}
```

### `BiampSidebarIcon`

A 48×48px icon button designed for use inside `BiampSidebar`. Supports an optional `selectedIcon` that is shown when the icon is selected, which is useful for swapping between outlined and filled icon variants. Extends MUI `ListItemButtonProps`.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `JSX.Element` | _(required)_ | Icon shown in the default (unselected) state |
| `selectedIcon` | `JSX.Element` | Same as `icon` | Icon shown when `selected` is `true`. Falls back to `icon` if not provided |
| `selected` | `boolean` | `false` | Whether the icon is in the selected state |
| `sx` | `SxProps` | — | MUI system styles passed to the underlying `ListItemButton` |
| _...rest_ | `ListItemButtonProps` | — | All other MUI `ListItemButton` props (e.g. `disabled`, `onClick`) are forwarded |

#### Using `selectedIcon`

When `selectedIcon` is provided, the component automatically swaps between the two icons based on the `selected` state:

```tsx
{/* Icon changes from outlined → filled when selected */}
<BiampSidebarIcon
  selected={isActive}
  icon={<HomeOutlinedIcon />}
  selectedIcon={<HomeIcon />}
  onClick={handleClick}
/>

{/* Without selectedIcon — same icon is used for both states */}
<BiampSidebarIcon
  selected={isActive}
  icon={<HomeIcon />}
  onClick={handleClick}
/>
```

### Exports

- `BiampSidebar` — Vertical sidebar container with Biamp logo.
- `BiampSidebarIcon` — Selectable icon button for sidebar navigation.

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
| **Components** | Interactive demos of BiampSidebar, BiampSidebarIcon, Button, IconButton, Checkbox, Switch, TextField, Autocomplete, Dialog, Tabs, Alert, and more |

Use the **Color Mode** toggle in the Storybook toolbar to switch between light and dark themes and see how each component and color adapts.
