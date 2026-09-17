# Target: Tailwind CSS

Status: generated. `bwp-ds generate --target tailwind` writes
`packages/styles-tailwind/src/generated/`, and `bwp-ds verify` checks drift,
round-trip, and coverage for it.

## What is emitted

Tailwind CSS 4.3.x, CSS-first. Three files, each starting with a one-line
header naming the compiler version and the IR's source hash:

- `theme.css`: one `@theme static { … }` block with every token as a CSS
  variable using the default mode's values, then one rule per other mode (the
  configured mode selector, `:root[data-bwp-theme="dark"]` by default) that
  overrides only the tokens whose value varies. Aliases stay aliases:
  `--color-bwp-text-default: var(--color-bwp-neutral-900);`.
- `components.css`: `@layer components { … }` with one rule per IR rule for
  every mapped component, in the compiler's cascade order, declarations sorted
  by property, values referencing the theme variables.
- `index.css`: imports both.

## Variable names

| Token category                                           | Tailwind variable                                | Utilities it feeds              |
| -------------------------------------------------------- | ------------------------------------------------ | ------------------------------- |
| `color`                                                  | `--color-<prefix>-<path>`                        | `bg-*`, `text-*`, `border-*`, … |
| `space`                                                  | `--spacing-<prefix>-<path>`                      | `p-*`, `m-*`, `gap-*`, `w-*`, … |
| `radius`                                                 | `--radius-<prefix>-<path>`                       | `rounded-*`                     |
| `font-family`                                            | `--font-<prefix>-<path>`                         | `font-*`                        |
| `font-size`                                              | `--text-<prefix>-<path>`                         | `text-*`                        |
| `font-weight`                                            | `--font-weight-<prefix>-<path>`                  | `font-*`                        |
| `line-height`                                            | `--leading-<prefix>-<path>`                      | `leading-*`                     |
| `letter-spacing`                                         | `--tracking-<prefix>-<path>`                     | `tracking-*`                    |
| `shadow`                                                 | `--shadow-<prefix>-<path>`                       | `shadow-*`                      |
| `easing`                                                 | `--ease-<prefix>-<path>`                         | `ease-*`                        |
| `border-width`, `duration`, `opacity`, `z-index`, `size` | `--<prefix>-<category>-<path>` (the source name) | none; reference with `var()`    |

Example: `--bwp-color-accent-default` in the source becomes
`--color-bwp-accent-default`, so `bg-bwp-accent-default` works in markup.

## Modes

Utilities compile to `var(--color-bwp-…)`, so `data-bwp-theme="dark"` on the
root element switches every mode-varying token at runtime with no extra
classes.

## Using the package

```css
@import 'tailwindcss';
@import '@bwp-web/styles-tailwind';
```

The package ships CSS source only; the consumer's Tailwind build compiles it.
Component classes (`.bwp-example`) work on plain HTML exactly as in
`@bwp-web/styles-css`.

## Manifest hints

`targets.tailwind` accepts `{}` or `{ "ignore": ["<property>", …] }`. Ignored
properties are left out of the generated CSS and of the round-trip comparison,
and coverage reports the component as `partial`. Every property in the
compiler's table has a Tailwind handler (the transform is identity), so
`ignore` is only for deliberate omissions.

## Round-trip

`reparse` rewrites the generated variable names back to source names, treats
`@theme` as `:root` and each mode rule as a mode block, groups
`@layer components` rules by root class, and runs the compiler's own token and
component parsers. The result is compared to the source IR structurally
(tokens, and the rules of every mapped component, ignoring `source`
locations). Any difference is `DS-E081` and points at a generator or reparser
bug, never at the output.

## Regenerating

`npm run ds -- generate` from the repo root. Never edit files under
`src/generated/`; `bwp-ds verify` and CI fail on any difference from a fresh
generation.
