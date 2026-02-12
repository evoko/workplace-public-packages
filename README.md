# Workplace Public Packages

Monorepo for shared public packages used across Biamp Workplace applications.

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| [`@evoko/styles`](./packages/styles) | Shared MUI theme and styling utilities | Active |
| [`@evoko/components`](./packages/components) | Shared React components | Placeholder |

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

## Using `@evoko/styles`

### Installation

```bash
npm install @evoko/styles
```

### Peer Dependencies

- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@evoko/components` >= 0.1.0 (optional)

### Usage

```tsx
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { biampCustomTheme } from '@evoko/styles';

const theme = biampCustomTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app */}
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
    "node_modules/@evoko/styles/mui-theme-augmentation.d.ts"
  ]
}
```

Or add a triple-slash directive in a project `.d.ts` file:

```ts
/// <reference types="@evoko/styles/mui-theme-augmentation" />
```

### Exports

- `biampCustomTheme(overrideOptions?)` - Creates the Biamp Workplace MUI theme. Accepts optional theme override options.
- `appBarHeight` - Standard app bar height constant (64px).
