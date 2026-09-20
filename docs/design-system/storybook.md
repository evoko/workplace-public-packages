# Storybook

`packages/storybook` is the one Storybook for the whole repository. It shows
every token and every component rendered by each web target side by side, and
the same stories are what `bwp-ds verify --rendered` replays in a headless
browser to prove the targets compute identical styles.

## What it is

Six sections. Titles must start with one of them; `npm run lint` in the
package enforces it (`scripts/lint-story-titles.mjs`).

| Section        | Source                                                     | Contents                                                                                                            |
| -------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `Introduction` | `src/Introduction.mdx` (hand-written)                      | How to read a compare grid; the design system's name comes from the generated config, not from the prose.           |
| `Foundations`  | `src/generated/foundations/` (generated)                   | One compare story per token category present in the IR, one row per token.                                          |
| `Styles`       | `src/generated/styles/` (generated), plus `Styles/Harness` | One compare story per design-system component. `Styles/Harness` is a hand-written smoke test of the harness itself. |
| `Components`   | `packages/components/src/**/*.stories.tsx`                 | Hand-written component stories. Empty during the V2 rebuild.                                                        |
| `Canvas`       | `packages/canvas/src/**/*.stories.tsx`                     | Hand-written canvas stories. Empty during the V2 rebuild.                                                           |
| `Assets`       | reserved                                                   | Icons, images, and fonts. No stories yet; `packages/assets` is not in the Storybook globs.                          |

The generated stories hold data only — a `CompareSpec` or a `TokenSpec[]`,
plus one render function for the MUI cell — and call the hand-written harness
in `src/harness/`. Regenerate them, never edit them.

## Compare grids

A compare grid is a table. Columns are targets, `css` first and always: it is
the reference every other column is compared against. A column appears only
when the component's manifest maps it for that target, so a component
excluded everywhere but CSS still gets a gallery entry with nothing to
compare. Rows are every axis permutation in manifest order times
`[base, ...states]`.

Each cell is a `<div>` host with an open shadow root (`ShadowCell`). Inside it
are the freeze stylesheet, that target's stylesheet, and the cell's markup.
Component rules cannot cross a shadow boundary, so no target's CSS can reach
another's cell.

- **Token variables live inside each cell, not on the document.** Every
  non-MUI target's stylesheet is injected into the cell with each `:root`
  selector rewritten to `:host` (and `:root<compound>` to
  `:host(<compound>)`; `hostScoped` in `src/harness/styles.ts`). The CSS
  package and the compiled Tailwind sheet spell ten `--bwp-*` names
  identically (border-width, duration, opacity, size, z-index; Tailwind has
  no theme namespace for those categories), so document-level variables would
  have let one target read the other's declaration and five token categories
  would have been compared against themselves. Nothing design-system-related
  is injected into the document: a hand-written story that renders
  design-system markup in the light DOM must import the stylesheet itself.
  MUI is the exception by construction — its `ThemeProvider` writes the theme
  variables to the document head, and no MUI cell carries a CSS or Tailwind
  sheet, so nothing can collide.
- **Modes reach the hosts.** `applyMode`/`clearMode` set the mode attribute or
  class on `document.documentElement` _and_ on every `[data-parity-cell]`
  host, and a freshly mounted cell copies the document's current mode.
- **Transitions are frozen.** Every cell starts with
  `*, *::before, *::after { transition: none !important; animation: none !important; }`,
  so a computed value is never read mid-transition. The four `transition-*`
  longhands would then agree by construction, so the reader switches that one
  stylesheet off, reads them, and switches it back on inside the same
  synchronous call; nothing animatable changes in between, so no transition
  starts.

Two toolbars drive the grids:

| Toolbar   | Global      | Effect                                                                             |
| --------- | ----------- | ---------------------------------------------------------------------------------- |
| `Mode`    | `dsMode`    | Applies a configured color mode to the document and every cell.                    |
| `Targets` | `dsTargets` | `all`, or one target shown next to the `css` reference (`css`, `tailwind`, `mui`). |

## Rendered parity

Every compare story has a play function, `parityPlay(context, spec, config)`.
For every configured mode and every row it puts the `css` cell into the row's
state, reads the computed value of every property in the compiler's property
table (97 longhands today, emitted into `src/generated/config.ts` as
`parityProperties`) on the root and on each slot, does the same for every
other cell, and records every difference. One aggregated error at the end
lists them all; whatever mode was in force before the play is restored either
way.

Interaction states are driven by Playwright through Vitest browser commands —
`parityHover`, `parityMouseDown`, `parityMouseUp`, `parityFocusFrom` (focus a
hidden sentinel next to the cell, then press `Tab`) — because synthetic events
do not make `:hover` or `:focus-visible` match. After entering a state the
harness asserts the root really matches the pseudo-class, so no row can pass
vacuously.

Values are compared token by token:

| Value                                                                                      | Rule             |
| ------------------------------------------------------------------------------------------ | ---------------- |
| A number with a `px` unit                                                                  | Equal within 0.5 |
| Any other number (seconds, opacity, `line-height`, `z-index`, percentages, color channels) | Exact            |
| Anything else, and the shape of the value                                                  | Exact            |

The epsilon exists for sub-pixel layout rounding, the only difference one
browser legitimately produces between two cells of the same design. A
unit-blind tolerance hid `0.15s` against `0.25s` and an opacity of `0.4`
against `0.85`, which is why it is `px`-only.

A failure prints one line per difference, sorted, headed by the count, capped
at 200 lines plus `… and N more`, and closed by a trailer repeating the total.
The trailer exists because `verify --rendered` keeps only the tail of the
run's output, where a header hundreds of lines further up would be cut:

```
1 rendered difference against the css cell:
button | variant=filled size=md base | light | mui | root | text-transform: css none vs mui uppercase
1 rendered difference in total
```

Read it as
`component | row | mode | target | element | property: css <expected> vs <target> <actual>`.
The row is the axis values and the state (`base` when there is none);
`element` is `root` or a slot name. Past 200 differences only the trailer is
guaranteed to fall inside `verify --rendered`'s 200-line tail, so read the
count there first and re-run `npm run storybook:test` for the full list —
every difference line names its own component, so nothing is ambiguous.

Fix the target plugin under `packages/ds-compiler/src/targets/<id>/`, or the
harness under `packages/storybook/src/harness/` — never the generated
stories.

A property that genuinely cannot match is excluded per story, with the reason
next to it:

```ts
play: (context) =>
  parityPlay(context, spec, storiesConfig, {
    // <target> renders an extra wrapper, so the root's intrinsic width differs.
    ignore: ['width'],
  }),
```

No story needs one today. A generated story cannot carry an `ignore`; the
exception belongs in the generator or in a hand-written story.

## Foundations

A foundations story renders one sample element per target per token, each
consuming that target's own variable name for the token (`cssVar`,
`tailwindVar`, `muiVar`, all three from the compiler). `tokenParityPlay`
compares one property per category, in every mode, so the token layer of each
target is proven and not only the components.

| Category         | Compared property            |
| ---------------- | ---------------------------- |
| `color`          | `background-color`           |
| `space`          | `width`                      |
| `size`           | `width`                      |
| `radius`         | `border-top-left-radius`     |
| `border-width`   | `border-top-width`           |
| `font-family`    | `font-family`                |
| `font-size`      | `font-size`                  |
| `font-weight`    | `font-weight`                |
| `line-height`    | `line-height`                |
| `letter-spacing` | `letter-spacing`             |
| `shadow`         | `box-shadow`                 |
| `opacity`        | `opacity`                    |
| `z-index`        | `z-index`                    |
| `duration`       | `transition-duration`        |
| `easing`         | `transition-timing-function` |

One property per category is enough: a category consumed through several
properties (space through `padding` and `gap`) is also covered by the
component grids.

## Running it

Install Chromium once:

```bash
npx playwright install chromium
```

| Command                   | What it does                                                                                                                     |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `npm run storybook`       | The Storybook UI on port 6006.                                                                                                   |
| `npm run storybook:test`  | `turbo run test:rendered --filter=@bwp-web/storybook`: rebuilds the target packages, then runs every story in headless Chromium. |
| `npm run verify:rendered` | `bwp-ds verify --rendered`: lint, drift, round-trip, coverage, then `npm run storybook:test` as a fifth step.                    |

The rendered run takes about 10 seconds for the 18 stories once the packages
are built. It runs from the repo root through Turbo on purpose: the harness
imports `@bwp-web/styles-css/dist/styles.css` and `@bwp-web/styles-mui` from
`dist`, so running `npm run test:rendered` inside `packages/storybook`
directly would prove whatever was built last, not the current sources. The
Turbo task's `^build` dependency closes that hole.

`verify --rendered` runs the browser step only when lint, drift, round-trip,
and coverage all passed. A non-zero exit is `DS-E087` carrying the last 200
lines of the run's output, with ANSI colour stripped; `ds.config.json`
without a `rendered` entry is `DS-W005` and the step is `skipped`.

CI (`.github/workflows/main.yml`) caches `~/.cache/ms-playwright` by lockfile
hash, installs Chromium with `--with-deps`, runs `npm run verify:rendered`,
and includes `packages/storybook/src/generated` in the generated-files diff.

## Regenerating

```bash
npm run ds -- generate --target stories
```

`stories` is an auxiliary target: it is drift-checked like any other, but it
has nothing to round-trip and no column in `docs/design-system/coverage.md`.
Its output directory comes from `targets.stories.outDir` and the MUI import
specifier from `targets.stories.options.muiPackage` in
`packages/styles-css/ds.config.json`. Everything under `src/generated/` is
committed, excluded from Prettier, and must never be hand-edited; a wrong
story is a bug in `packages/ds-compiler/src/targets/stories/`.

## Adding hand-written stories

- Title must start with `Introduction`, `Foundations`, `Styles`, `Components`,
  `Canvas`, or `Assets`. `node scripts/lint-story-titles.mjs` (part of the
  package's `lint`) scans every `*.stories.*` and `*.mdx` under
  `packages/storybook/src`, `packages/components/src`, and
  `packages/canvas/src`.
- Component and canvas stories live next to their source in those packages;
  `.storybook/main.ts` picks them up.
- A hand-written compare story imports `CompareGrid`, `parityPlay`, and the
  `CompareSpec` type from `src/harness`. `Styles/Harness` is the worked
  example.

## Limits

- **The Storybook UI skips interaction rows.** Playwright is not available
  there, so `parityPlay` compares only the base row and attribute states, in
  both modes, and logs how many rows it skipped. The full proof runs under
  Vitest.
- **Chromium only.** Computed values differ between engines in places (font
  fallback, shadow rendering); cross-browser parity would need per-browser
  tolerances.
- **Fonts are not tested.** All cells share one document, so a missing web
  font falls back identically everywhere and parity holds even when the font
  is wrong.
- **No design-system stylesheet reaches the document.** A hand-written story
  that renders design-system markup in the light DOM must import the
  stylesheet itself, or render inside the harness.
- **No Flutter column and no screenshots.** Flutter cells arrive with Plan 5;
  pixel comparison is deliberately out of scope.
