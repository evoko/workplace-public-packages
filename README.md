# Workplace Public Packages

Monorepo for shared public packages used across Biamp Workplace applications.

## Packages

| Package                                        | Description                            | README                                        |
| ---------------------------------------------- | -------------------------------------- | --------------------------------------------- |
| [`@bwp-web/styles`](./packages/styles)         | Shared MUI theme and styling utilities | [docs](./packages/styles/README.md)           |
| [`@bwp-web/components`](./packages/components) | Shared React components                | [docs](./packages/components/README.md)       |
| [`@bwp-web/assets`](./packages/assets)         | Shared icons, image, and font assets   | [docs](./packages/assets/README.md)           |
| [`@bwp-web/canvas`](./packages/canvas)         | Interactive canvas editor and viewer   | [docs](./packages/canvas/README.md)           |

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

## Storybook

A Storybook is included in this repo to browse and interact with every themed component, color, and typography variant without writing any code.

From the repo root:

```bash
npm run storybook
```

This starts Storybook at [http://localhost:6006](http://localhost:6006).

| Section                 | What you'll find                                                                                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Styles / Colors**     | Full color palette — primary, secondary, status colors, brand colors, grey scale, text, backgrounds, dividers, and action states                                                                             |
| **Styles / Typography** | Every typography variant with font family, size, and weight                                                                                                                                                  |
| **Components**          | Interactive demos of BiampLayout, BiampSidebar, BiampSidebarIcon, BiampHeader, BiampHeaderButton, BiampWrapper, Button, IconButton, Checkbox, Switch, TextField, Autocomplete, Dialog, Tabs, Alert, and more |

Use the **Color Mode** toggle in the Storybook toolbar to switch between light and dark themes.

## Detailed Documentation

Additional documentation lives in the [`/docs`](./docs) folder:

| Document                                                    | Contents                                                        |
| ----------------------------------------------------------- | --------------------------------------------------------------- |
| [packages/styles/README.md](./packages/styles/README.md)   | Full color palette, typography, spacing, component overrides    |
| [packages/assets/README.md](./packages/assets/README.md)   | Icons (220+), images, fonts                                     |
| [biamp-layout.md](./docs/biamp-layout.md)                   | BiampLayout — full-page layout shell                            |
| [biamp-wrapper.md](./docs/biamp-wrapper.md)                 | BiampWrapper — content wrapper                                  |
| [biamp-sidebar.md](./docs/biamp-sidebar.md)                 | BiampSidebar — vertical sidebar                                 |
| [biamp-header.md](./docs/biamp-header.md)                   | BiampHeader — header with app launcher                          |
| [biamp-banner.md](./docs/biamp-banner.md)                   | BiampBanner — notification banner                               |
| [biamp-table.md](./docs/biamp-table.md)                     | BiampTable — TanStack-based data table                          |
| [biamp-global-search.md](./docs/biamp-global-search.md)     | BiampGlobalSearch — global search component                     |
| [canvas/hooks.md](./docs/canvas/hooks.md)                   | `useEditCanvas`, `useViewCanvas`, providers, utility hooks      |
| [canvas/shapes.md](./docs/canvas/shapes.md)                 | `createRectangle`, `createCircle`, `createPolygon` and variants |
| [canvas/interactions.md](./docs/canvas/interactions.md)     | Click/drag/draw creation modes, vertex editing                  |
| [canvas/viewport.md](./docs/canvas/viewport.md)             | Pan and zoom controls, `ViewportController`                     |
| [canvas/alignment.md](./docs/canvas/alignment.md)           | Object alignment guides, cursor snapping, rotation snapping     |
| [canvas/serialization.md](./docs/canvas/serialization.md)   | Save/load canvas, scaled strokes and border radius              |
| [canvas/background.md](./docs/canvas/background.md)         | Background image management, contrast, invert, resize           |
| [canvas/keyboard.md](./docs/canvas/keyboard.md)             | Keyboard shortcuts, object deletion                             |
| [canvas/styles.md](./docs/canvas/styles.md)                 | Default style objects, constants, Fabric augmentation           |
| [canvas/overlay.md](./docs/canvas/overlay.md)               | DOM overlays on canvas objects                                  |

## Releasing

### Branch Strategy

| Branch | Tracks                      | npm dist-tag |
| ------ | --------------------------- | ------------ |
| `main` | Current major (e.g. 2.x.y) | `latest`     |
| `1.x`  | Previous major (1.x.y)      | `v1-latest`  |

Active development happens on `main`. When a new major version is released, create a maintenance branch for the previous major (e.g. `1.x`) before merging breaking changes into `main`. Cherry-pick or backport bug fixes and security patches to the maintenance branch as needed.

If you later need to maintain v2 while developing v3, the pattern extends naturally: `main` becomes v3, and you create a `2.x` branch.

### Tagging a Release

1. Update the `version` field in each package's `package.json` to the new version number.

2. Commit the version bump:

   ```bash
   git add .
   git commit -m "vX.Y.Z"
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

Tags follow the format `vX.Y.Z` (e.g., `v1.0.0`).

### Publishing to npm

After tagging, publish each changed package from the repo root. Use the correct dist-tag for the branch you're publishing from:

```bash
# From main (current major) — publish with the major dist-tag, then update latest
npm publish -w packages/canvas --access public --tag v2-latest
npm dist-tag add @bwp-web/canvas@2.2.0 latest

# From a maintenance branch (e.g. v1) — publish with the major dist-tag only
npm publish -w packages/canvas --access public --tag v1-latest
```

> **Warning:** Never publish from a maintenance branch without `--tag` or with `--tag latest`. This will overwrite `latest` and accidentally downgrade everyone running `npm install`.

#### Dist-tag conventions

| Dist tag       | Points to                  | Who updates it            |
| -------------- | -------------------------- | ------------------------- |
| `latest`       | Highest stable version     | Only from `main`          |
| `v1-latest`    | Highest stable 1.x.y       | From `v1` branch          |
| `v2-latest`    | Highest stable 2.x.y       | From `main` or `v2` branch |
| `v3-latest`    | Highest stable 3.x.y       | From `main` or `v3` branch |

#### Managing dist-tags

```bash
# View all dist-tags for a package
npm dist-tag ls @bwp-web/canvas

# Set a dist-tag to a specific version
npm dist-tag add @bwp-web/canvas@2.2.0 v2-latest
npm dist-tag add @bwp-web/canvas@2.2.0 latest

# Remove a dist-tag (e.g. cleaning up after a major goes EOL)
npm dist-tag rm @bwp-web/canvas v1-latest

# Fix latest if it was accidentally overwritten
npm dist-tag add @bwp-web/canvas@2.2.0 latest
```

#### Full publish example: v1 patch while v2 is current

```bash
# On the v1 branch, after bumping to 1.4.0:
git checkout v1
npm run build -w packages/canvas
npm publish -w packages/canvas --access public --tag v1-latest

# Verify: latest should still point to v2, not v1
npm dist-tag ls @bwp-web/canvas
# v1-latest: 1.4.0
# v2-latest: 2.2.0
# latest: 2.2.0   ← unchanged, correct
```

#### Full publish example: new v2 minor on main

```bash
# On main, after bumping to 2.3.0:
npm run build -w packages/canvas
npm publish -w packages/canvas --access public --tag v2-latest
npm dist-tag add @bwp-web/canvas@2.3.0 latest

# Verify
npm dist-tag ls @bwp-web/canvas
# v1-latest: 1.4.0
# v2-latest: 2.3.0
# latest: 2.3.0
```

#### Consumers

```bash
npm install @bwp-web/styles              # gets current major (latest)
npm install @bwp-web/styles@v1-latest    # gets newest stable 1.x
npm install @bwp-web/styles@v2-latest    # gets newest stable 2.x
npm install @bwp-web/styles@1            # gets newest 1.x via semver range
npm install @bwp-web/styles@1.3.0        # pins to exact version
```
