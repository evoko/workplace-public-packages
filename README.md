# Workplace Public Packages

Monorepo for shared public packages used across Biamp Workplace applications.

## Packages

| Package                                                  | Description                                                                                                                                  | README                                          |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| [`@bwp-web/styles-css`](./packages/styles-css)           | Design-system source of truth: CSS tokens, components, and the IR                                                                            | [docs](./packages/styles-css/README.md)         |
| [`@bwp-web/styles-tailwind`](./packages/styles-tailwind) | Generated Tailwind CSS v4 theme and component layer                                                                                          | [docs](./packages/styles-tailwind/README.md)    |
| [`@bwp-web/styles-mui`](./packages/styles-mui)           | Generated MUI theme and React components, some (e.g. `Button`) mapped onto MUI's own components                                              | [docs](./packages/styles-mui/README.md)         |
| [`@bwp-web/ds-compiler`](./packages/ds-compiler)         | Private compiler: lint, build, scaffold, generate, verify (Tailwind and MUI targets implemented; Flutter and the story generator come later) | [docs](./docs/design-system/authoring-guide.md) |
| [`@bwp-web/components`](./packages/components)           | Shared React components (empty during the V2 rebuild)                                                                                        | [docs](./packages/components/README.md)         |
| [`@bwp-web/assets`](./packages/assets)                   | Shared icons, image, and font assets (empty during the V2 rebuild)                                                                           | [docs](./packages/assets/README.md)             |
| [`@bwp-web/canvas`](./packages/canvas)                   | Interactive canvas editor and viewer (empty during the V2 rebuild)                                                                           | [docs](./packages/canvas/README.md)             |

## Getting Started

### Prerequisites

- Node.js >= 22 (`nvm use` reads `.nvmrc`)
- npm 10.9.0

### Install

```bash
npm install
```

### Installing All Packages

```bash
npm install @bwp-web/assets @bwp-web/styles-css @bwp-web/components @bwp-web/canvas
```

### Updating Packages

```bash
npm update @bwp-web/styles-css
npm install @bwp-web/styles-css@latest
```

### Build

```bash
# Build all packages
npx turbo run build

# Build a specific package
cd packages/styles-css && npm run build
```

## Storybook

The Storybook is being rebuilt for the V2 design system. See `AGENTS.md` and `docs/design-system/` for the current state.

## Detailed Documentation

| Document                                                                    | Contents                                                  |
| --------------------------------------------------------------------------- | --------------------------------------------------------- |
| [AGENTS.md](./AGENTS.md)                                                    | Invariants, package map, commands, procedures for agents  |
| [design-system/authoring-guide.md](./docs/design-system/authoring-guide.md) | Tokens, components, manifests, scaffolding, the lint loop |
| [design-system/figma-mapping.md](./docs/design-system/figma-mapping.md)     | Deterministic rules from a design file to tokens and CSS  |
| [design-system/ir.md](./docs/design-system/ir.md)                           | The compiled intermediate representation                  |
| [design-system/errors.md](./docs/design-system/errors.md)                   | Every `DS-E` and `DS-W` code with cause and fix           |
| [design-system/verification.md](./docs/design-system/verification.md)       | What each check proves and how to read diagnostics        |
| [design-system/targets/](./docs/design-system/targets)                      | Tailwind, MUI, and Flutter target plans                   |
| [design-system/coverage.md](./docs/design-system/coverage.md)               | Generated: which components each target covers            |
| [packages/styles-css/README.md](./packages/styles-css/README.md)            | Installing and using the CSS package                      |
| [packages/assets/README.md](./packages/assets/README.md)                    | Icons, images, fonts (empty during the V2 rebuild)        |

The full design is in
[docs/superpowers/specs/2026-09-16-solar-multi-target-infrastructure-design.md](./docs/superpowers/specs/2026-09-16-solar-multi-target-infrastructure-design.md).

## Releasing

### Branch Strategy

| Branch | Tracks                     | npm dist-tag |
| ------ | -------------------------- | ------------ |
| `main` | Current major (e.g. 2.x.y) | `latest`     |
| `1.x`  | Previous major (1.x.y)     | `v1-latest`  |

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

| Dist tag    | Points to              | Who updates it             |
| ----------- | ---------------------- | -------------------------- |
| `latest`    | Highest stable version | Only from `main`           |
| `v1-latest` | Highest stable 1.x.y   | From `v1` branch           |
| `v2-latest` | Highest stable 2.x.y   | From `main` or `v2` branch |
| `v3-latest` | Highest stable 3.x.y   | From `main` or `v3` branch |

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
