# Workplace Public Packages

Monorepo for the shared packages used across Biamp Workplace web and mobile applications. This
branch holds the V2 generation, built on Biamp's SOLAR design system: a React library on MUI and a
Flutter library, both generated from the SOLAR Figma files and checked against them. V2 is not yet
published (every package is `2.0.0-alpha.0`).

## Packages

| Package                                        | What it is                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| [`@bwp-web/styles`](./packages/styles)         | SOLAR tokens as CSS, an MUI theme and a Tailwind 4 stylesheet               |
| [`@bwp-web/assets`](./packages/assets)         | the 340 SOLAR icons as React components and SVG files, the logos, app icons |
| [`@bwp-web/components`](./packages/components) | every SOLAR Web component for React, on MUI 9                               |
| [`solar_flutter`](./packages/solar_flutter)    | the same tokens, icons and components for Flutter (a Dart package, by git)  |
| [`@bwp-web/canvas`](./packages/canvas)         | interactive canvas editor and viewer: an empty skeleton, not started        |

Private to the repository: [`@bwp-web/codegen`](./packages/codegen), the generator that writes
`spec/` and every generated target from the SOLAR data in [`docs/`](./docs/README.md);
`@bwp-web/eslint-config`; and [`@bwp-web/storybook`](./packages/storybook), which builds the
Storybook for its Vercel deployment.

## Getting started

Node 22 (`.nvmrc`) and Flutter 3.47.5 build the repository; a Figma token is needed only to
refresh the data from Figma. The published packages support Node 20 and newer.

```bash
nvm use && npm install && npm run build
npm run storybook           # the React components
npm run widgetbook          # the Flutter widgets (needs Chrome)
```

The full setup, every command and every check CI runs:
[docs/engineering/workflows.md](./docs/engineering/workflows.md).

## Where to read next

- [docs/engineering/architecture.md](./docs/engineering/architecture.md): how the pipeline works,
  its invariants, and the contract between the two libraries.
- [docs/engineering/workflows.md](./docs/engineering/workflows.md): setting up, verifying, adding
  a component, fixing a failing check, syncing from Figma.
- [docs/engineering/decisions.md](./docs/engineering/decisions.md) and
  [open-work.md](./docs/engineering/open-work.md): why things are as they are, and what is left.
- [docs/README.md](./docs/README.md): every input and output of the SOLAR data pipeline.
- [docs/solar/](./docs/solar/README.md): the SOLAR Foundations reference (tokens, accessibility,
  visual language, layout, motion, theming, governance, and an agent quick-reference).
- Agents start with [CLAUDE.md](./CLAUDE.md).

## V1 release line

The V1 packages (MUI-based) remain available and supported for existing consumers.

- Install or pin V1 with the `v1-latest` dist-tag, for example
  `npm install @bwp-web/components@v1-latest`.
- V1 source lives on the [`v1`](../../tree/v1) branch. V1 fixes are published from that branch.
- V2 will be published under the same package names with a major version bump.
