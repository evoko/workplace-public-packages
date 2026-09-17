# Target: Tailwind CSS

Status: designed, not yet generated. Plan 2 adds the plugin and the
`@bwp-web/styles-tailwind` package.

## What it will emit

Tailwind 4.x, CSS-first. Under `packages/styles-tailwind/src/generated/`:

- `theme.css`: an `@theme` block mapping tokens into Tailwind namespaces
  (`color` to `--color-<prefix>-…`, `space` to `--spacing-<prefix>-…`, `radius`
  to `--radius-<prefix>-…`, font categories to `--font-…`, `shadow` to
  `--shadow-<prefix>-…`), with per-mode values through the mode selector.
- `components.css`: `@layer components { .<prefix>-<name> { … } }` for every
  rule in the IR, values referencing the theme variables.
- `index.css`: imports both.

Consumers write `@import "tailwindcss"; @import "@bwp-web/styles-tailwind";`.

## Manifest hints

`targets.tailwind` accepts `{}` today. No hints are defined yet; the plugin
registers its own schema when it lands.
