# Workplace Public Packages

Monorepo for shared public packages used across Biamp Workplace applications.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@bwp-web/styles`](./packages/styles) | Shared MUI theme and styling utilities | Active |
| [`@bwp-web/components`](./packages/components) | Shared React components | Placeholder |

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

To get full TypeScript support for the custom palette colors (`biamp`, `blue`, `purple`, `sidebar`, etc.) and component variant overrides, include the augmentation file in your `tsconfig.json`:

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
