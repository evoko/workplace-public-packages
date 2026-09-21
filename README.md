# Workplace Public Packages

Monorepo for the shared npm packages used across Biamp Workplace web
applications. This branch holds the V2 generation, built on the SOLAR design
system. V2 is work in progress and not yet published as `latest`.

## Packages

| Package                                        | Description                          | Status         |
| ---------------------------------------------- | ------------------------------------ | -------------- |
| [`@bwp-web/styles`](./packages/styles)         | Design tokens and theme              | V2 in progress |
| [`@bwp-web/assets`](./packages/assets)         | Icons and static assets              | V2 in progress |
| [`@bwp-web/canvas`](./packages/canvas)         | Interactive canvas editor and viewer | V2 in progress |
| [`@bwp-web/components`](./packages/components) | React components                     | V2 in progress |

## Getting started

Prerequisites: Node.js 20 or newer, npm 10.9.

```bash
npm install
npm run build
```

Other root scripts: `npm run lint`, `npm run typecheck`, `npm run format`,
`npm run solar:sync` to refresh the SOLAR Foundations, Web and Icons references from Figma,
and `npm run solar:tokens` to rebuild the derived Foundations token files. The whole SOLAR
documentation and data pipeline is described in [docs/README.md](./docs/README.md).

## Design system

V2 is built on Biamp's SOLAR design system. The Foundations reference (tokens,
accessibility, visual language, layout, motion, theming, governance, and an agent
quick-reference) lives in [docs/solar](./docs/solar/README.md).

## V1 release line

The V1 packages (MUI-based) remain available and supported for existing
consumers.

- Install or pin V1 with the `v1-latest` dist-tag, for example
  `npm install @bwp-web/components@v1-latest`.
- V1 source lives on the [`v1`](../../tree/v1) branch. V1 fixes are published
  from that branch.
- V2 will be published under the same package names with a major version bump.
