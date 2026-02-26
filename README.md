# Workplace Public Packages

Monorepo for shared public packages used across Biamp Workplace applications.

## Packages

| Package                                        | Description                            | Status |
| ---------------------------------------------- | -------------------------------------- | ------ |
| [`@bwp-web/styles`](./packages/styles)         | Shared MUI theme and styling utilities | Active |
| [`@bwp-web/components`](./packages/components) | Shared React components                | Active |
| [`@bwp-web/assets`](./packages/assets)         | Shared icons, image, and font assets   | Active |
| [`@bwp-web/canvas`](./packages/canvas)         | Interactive canvas editor and viewer    | Active |

## Getting Started

### Prerequisites

- Node.js >= 20
- npm 10.9.0

### Install

```bash
npm install
```

### Installing All Packages

```bash
npm install @bwp-web/assets @bwp-web/styles @bwp-web/components @bwp-web/canvas
```

### Updating Packages

The following example commands are for `@bwp-web/styles` but the same process applies to `@bwp-web/components` and `@bwp-web/assets`.

```bash
npm update @bwp-web/styles
npm install @bwp-web/styles@latest
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

- `@bwp-web/assets` >= 0.8.1
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@bwp-web/components` >= 0.8.1 (optional)

### Usage

```tsx
import { ThemeProvider, CssBaseline } from '@mui/material';
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

TypeScript augmentations for custom palette entries (`biamp`, `blue`, `purple`, `sidebar`, `dividers`) and component variants (`Button variant="overlay"`, `IconButton variant="transparent"`, etc.) are **included automatically** when you import from `@bwp-web/styles`.

### Styles Documentation

For the full color palette, typography variants, spacing scale, component overrides, theme customization, and TypeScript setup details, see [styles.md](./docs/styles.md).

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

| Component               | Description                                                                      | Docs                                        |
| ----------------------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| `BiampLayout`           | Full-page layout shell with optional header and sidebar slots                    | [biamp-layout.md](./docs/biamp-layout.md)   |
| `BiampWrapper`          | Full-page content wrapper with padding, rounded corners, and scrollable overflow | [biamp-wrapper.md](./docs/biamp-wrapper.md) |
| `BiampSidebar`          | Fixed-width vertical sidebar with Biamp logo                                     | [biamp-sidebar.md](./docs/biamp-sidebar.md) |
| `BiampSidebarIconList`  | Vertical list with 4px gaps for sidebar items                                    | [biamp-sidebar.md](./docs/biamp-sidebar.md) |
| `BiampSidebarIcon`      | Selectable 48×48px icon button for sidebar navigation                            | [biamp-sidebar.md](./docs/biamp-sidebar.md) |
| `BiampSidebarComponent` | 48×48px rounded box for arbitrary sidebar content                                | [biamp-sidebar.md](./docs/biamp-sidebar.md) |
| `BiampHeader`           | Horizontal header container with padding                                         | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampHeaderTitle`      | Title section with icon, optional title, and optional subtitle                   | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampHeaderSearch`     | Search input with leading search icon                                            | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampHeaderActions`    | Flex container for grouping action buttons and profile                           | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampHeaderButtonList` | Horizontal list with 4px gaps for header buttons                                 | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampHeaderButton`     | Selectable 40×40px icon button for header actions                                | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampHeaderProfile`    | Profile image button                                                             | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampAppPopover`       | Styled popover for the app-launcher dialog                                       | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampAppDialog`        | Rounded dialog container for app-launcher grid                                   | [biamp-header.md](./docs/biamp-header.md)   |
| `BiampAppDialogItem`    | Clickable app tile with children content and label                               | [biamp-header.md](./docs/biamp-header.md)   |

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

## Using `@bwp-web/canvas`

### Installation

```bash
npm install @bwp-web/canvas
```

### Peer Dependencies

- `react` >= 18.0.0
- `react-dom` >= 18.0.0
- `@mui/material` >= 7.0.0
- `@bwp-web/styles` >= 0.8.1

### Quick Start

**Edit canvas** — full editing with shape creation, selection, pan/zoom, alignment, and serialization:

```tsx
import { Canvas, useEditCanvas, enableDragToCreate, createRectangle } from '@bwp-web/canvas';

function Editor() {
  const canvas = useEditCanvas();

  const startDragMode = () => {
    canvas.setMode((c, viewport) =>
      enableDragToCreate(
        c,
        (c, bounds) =>
          createRectangle(c, {
            left: bounds.startX + bounds.width / 2,
            top: bounds.startY + bounds.height / 2,
            width: bounds.width,
            height: bounds.height,
          }),
        { onCreated: () => canvas.setMode(null), viewport },
      ),
    );
  };

  return (
    <div>
      <button onClick={startDragMode}>Draw Rectangle</button>
      <Canvas onReady={canvas.onReady} width={800} height={600} />
    </div>
  );
}
```

**View canvas** — read-only display with pan/zoom and object styling:

```tsx
import { Canvas, useViewCanvas, loadCanvas } from '@bwp-web/canvas';

function Viewer({ savedJson }: { savedJson: object }) {
  const canvas = useViewCanvas({
    onReady: (c) => loadCanvas(c, savedJson),
  });

  return <Canvas onReady={canvas.onReady} width={800} height={600} />;
}
```

### Canvas Documentation

| Document | Contents |
|---|---|
| [Hooks](./docs/canvas/hooks.md) | `useEditCanvas`, `useViewCanvas` — the primary entry points |
| [Shapes](./docs/canvas/shapes.md) | `createRectangle`, `createCircle`, `createPolygon` and variants |
| [Interactions](./docs/canvas/interactions.md) | `enableClickToCreate`, `enableDragToCreate`, `enableDrawToCreate`, `enableVertexEdit` |
| [Viewport](./docs/canvas/viewport.md) | `enablePanAndZoom`, `resetViewport`, `ViewportController` |
| [Alignment & Snapping](./docs/canvas/alignment.md) | Object alignment guides, cursor snapping, rotation snapping, snap points |
| [Serialization](./docs/canvas/serialization.md) | `serializeCanvas`, `loadCanvas`, scaled strokes |
| [Background](./docs/canvas/background.md) | `setBackgroundImage`, opacity, invert, resize |
| [Keyboard](./docs/canvas/keyboard.md) | `enableKeyboardShortcuts`, `deleteObjects` |
| [Styles & Constants](./docs/canvas/styles.md) | Default style objects, configuration constants, Fabric augmentation |

## Storybook

A Storybook is included in this repo so you can browse and interact with every themed component, color, and typography variant without writing any code.

### Running Storybook

From the repo root:

```bash
npm run storybook
```

This starts Storybook at [http://localhost:6006](http://localhost:6006).

### What's Inside

| Section                 | What you'll find                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Styles / Colors**     | Full color palette — primary, secondary, status colors, brand colors, grey scale, text, backgrounds, dividers, and action states                                                                             |
| **Styles / Typography** | Every typography variant with font family, size, and weight                                                                                                                                                  |
| **Components**          | Interactive demos of BiampLayout, BiampSidebar, BiampSidebarIcon, BiampHeader, BiampHeaderButton, BiampWrapper, Button, IconButton, Checkbox, Switch, TextField, Autocomplete, Dialog, Tabs, Alert, and more |

Use the **Color Mode** toggle in the Storybook toolbar to switch between light and dark themes and see how each component and color adapts.

## Releasing

### Tagging a Release

1. Update the `version` field in each package's `package.json` to the new version number.

2. Commit the version bump:

   ```bash
   git add .
   git commit -m "Commit message here"
   ```

3. Create an annotated git tag:

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   ```

4. Push the commit and tag:

   ```bash
   git push
   git push --tags
   ```

Tags follow the format `vX.Y.Z` (e.g., `v0.0.0`).

### Publishing to npm

After tagging, publish all packages from the repo root:

```bash
npm publish -w packages/assets -w packages/styles -w packages/components -w packages/canvas --access public
```
