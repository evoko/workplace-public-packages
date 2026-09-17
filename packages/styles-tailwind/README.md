# @bwp-web/styles-tailwind

The design system as a Tailwind CSS v4 layer: every token as a theme variable
in Tailwind's namespaces, and every component rule under `@layer components`.
Generated from `@bwp-web/styles-css` by the compiler; only `src/generated/` is
generated, everything else in this package is hand-written.

## Install

```bash
npm install tailwindcss @bwp-web/styles-tailwind
```

## Use

```css
@import 'tailwindcss';
@import '@bwp-web/styles-tailwind';
```

Then use the design system in markup either way:

```html
<button class="bwp-example" data-tone="accent">Save</button>
<div class="bg-bwp-accent-default text-bwp-md p-bwp-2 rounded-bwp-md">…</div>
```

Set the color mode on the root element: `<html data-bwp-theme="dark">`. The
default mode needs no attribute. Every utility reads the theme variable at
runtime, so the switch needs no extra classes.

## What is inside

| File                           | Content                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| `src/index.css`                | Entry point; imports the generated files.                          |
| `src/generated/theme.css`      | `@theme static` with every token, plus one override rule per mode. |
| `src/generated/components.css` | `@layer components` with every component rule.                     |
| `src/generated/index.css`      | Imports the two above.                                             |

Variable names follow Tailwind's namespaces with the design-system prefix
inserted: `--bwp-color-accent-default` in the CSS source becomes
`--color-bwp-accent-default` here, so `bg-bwp-accent-default` works. The full
table is in `docs/design-system/targets/tailwind.md`.

## Regenerate

From the repository root: `npm run ds -- generate --target tailwind`, then
`npm run verify`. CI fails when the committed output differs from a fresh
generation.
