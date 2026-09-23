# Milestone 3a — the component spine, proven on Button

Builds the whole chain from Figma component data to a styled component on two platforms, on one
component only: the component IR, the overlay, the MUI and Flutter recipe emitters, one-time shell
scaffolding, and API parity.

Design: [the docs-to-code spec](../specs/2026-09-21-solar-docs-to-code-design.md), milestone 3,
sections 4.2 (component IR), 4.3 (overlay), 5 (emitters) and 7 (parity).

Milestone 3 is split into three plans because it commits to eleven distinct mechanisms and the
spec rates it high risk. This is the first:

| Plan   | Covers                                                                   |
| ------ | ------------------------------------------------------------------------ |
| **3a** | IR, overlay, both recipe emitters, scaffolding, API parity — Button only |
| 3b     | The other six components, and visual parity against Figma as the oracle  |
| 3c     | The developer loop: Storybook tweak panel, `explain`, `adopt`, `audit`   |

Button is deliberately the hardest case: 108 variants, four axes, seven slots, three composed
children, a boolean `danger` axis and a `loading` state. If the architecture survives Button it
survives the rest, and a design flaw shows up now rather than after six easy components.

## What the source data gives us, measured

The recipe is derivable **in token names, not values**, which is the finding that makes this
milestone possible. `docs/solar-web/raw/components/buttons/button.json` carries:

- **`defaultVariantTree`** — the full layer tree of the default variant, with `fills`, `strokes`,
  `effectStyle`, `radius`, `strokeWeight`, `layout` and, crucially, a **`vars`** map binding each
  geometric property to its Figma variable:

  ```
  radius: 6         vars.topLeftRadius   → Spatial:radius/control
  strokeWeight: 1   vars.strokeTopWeight → Spatial:border/default
  layout.gap: 8     vars.itemSpacing     → Spatial:inset/xs
  layout.pad        vars.paddingLeft     → Spatial:inset/sm
  ```

- **`variants[].overrides.changed[layerPath]`** — a structured per-layer diff against that tree.
  107 of Button's 108 variants carry one; the default carries none by definition.
- **`axes`**, **`props`**, **`slots`** and **`composes`** in `catalog.json` — the public API,
  the boolean and instance-swap props, and the child components.

**Read the layer tree and the per-layer overrides, never the flat `fills`/`textFills` arrays on a
variant.** Those arrays aggregate every layer in the variant, so they change when a child's
visibility changes and look non-orthogonal when nothing about the button's own colour moved. That
mistake costs an afternoon; it cost one here.

## The axis model, and how far the data actually supports it

Resolving all 108 variants and asking which axes each layer property genuinely depends on:

| Layer property                                     | Varies with               | Reading      |
| -------------------------------------------------- | ------------------------- | ------------ |
| `/.strokes`                                        | prio, state, danger       | as designed  |
| `/.layout`, `/.radius`, `/.strokeWeight`, `/.vars` | size                      | as designed  |
| `/Label.size`                                      | size                      | as designed  |
| `/Counter.fills`, `/Counter.variant`               | prio, state               | as designed  |
| `/Label.textStyle`, `/Label.vars`                  | size + prio, state, danger | partly wrong |
| `/.fills`, `/.effectStyle`, `/Label.fills`         | **size**, prio, state, danger | wrong    |

So the intended model holds — **geometry follows `size`, colour follows `prio` / `state` /
`danger`** — but the file does not obey it everywhere. Two confirmed examples:

- `secondary / default / false` has `fills: null` at `size=sm` and
  `{Color:action/secondary/bg/default}` at `md` and `xl`. The small secondary button has no
  background. Almost certainly a cleared fill, not a decision.
- `effectStyle` is `shadow/control` at `md` and `sm` and absent at `xl`, across every prio.

**The normalizer must not average these away.** It derives each recipe entry by holding the
non-relevant axes at their defaults, then checks every other combination agrees, and records a
deviation naming the exact variant where one does not. A disagreement is either a Figma mistake or
a real axis interaction, and both need a human. Expect Button to produce several on day one; they
are findings for the design review, not bugs in the generator.

## Decisions taken

| Question                                    | Decision                                                                                                                                                                                                                       |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| What happens to Figma's `state` axis?       | Demoted, per spec §4.2. `hover`, `pressed` and `focus` become platform states — CSS pseudo-classes, Flutter `WidgetState`. `disabled` and `loading` stay **props**, because neither is something the platform derives on its own. |
| What is the public API?                     | `prio` is renamed to `variant` in the overlay, matching the spec's own example. `size` and `danger` keep their names.                                                                                                           |
| Wrap MUI or build our own?                  | Recorded per component in the overlay, not decided globally. Button starts as a wrap of MUI `Button` and Flutter `FilledButton`; if the recipe cannot express what SOLAR draws, the overlay flips it to bespoke and says why.    |
| Where does the recipe live?                 | `spec/components/<name>.json`, beside `spec/tokens.json` and `spec/icons.json`, and guarded the same way — the committed file must equal what the emitters were handed.                                                          |
| How does a web recipe reference a token?    | As `var(--solar-*)`, the way the Tailwind preset already does, never as a resolved literal. `tokens.css` is then the one runtime source: a `[data-theme='dark']` subtree re-themes an MUI Button with no JavaScript, and there is one dark-mode switch rather than MUI's `palette.mode` beside `data-theme`. The MUI *theme palette* stays literal, because MUI runs `alpha()` and `darken()` on it; the recipe does not go through the palette. |
| Are shells generated?                       | Scaffolded **once**, then owned by developers forever. The recipe beside them regenerates every run. This is the boundary that lets a look change flow in without ever clobbering behaviour.                                     |

## Notes for whoever executes this

- **The repository owner handles all version control.** No git write commands.
- `docs/` is read-only to the generator. `writeGenerated` enforces it.
- Node 22, Flutter pinned 3.24.4. Latest stable for anything new, with the milestone-1 caps.
- Run `npm run solar:codegen` and commit its output after touching the generator.
- The CLI is built from stage modules (`src/stages/`). The component stage in Task 9 is a third
  module exporting `name`, `build()` and `emit()`, not new inline code in the CLI.
- The CLI prunes whatever it did not write under the three generated directories. A component
  output that moves or is renamed therefore disappears from its old path on the next run, which
  is intended.
- The MUI theme already fills MUI's palette slots and built-in variants from SOLAR (the
  `mui.theme` deviation), so an unstyled MUI `Button` renders as SOLAR primary before Task 5
  adds anything. The recipe overrides what differs; it does not have to replace MUI's defaults.
- Flutter has `SolarTheme.resolve(brightness:, width:)`, which switches to the Mobile type scale
  below `viewport.sm`. Task 6 reads the label style from the ambient `SolarTheme`, never from
  `SolarTypography.desktop` directly, so Button follows the viewport on both platforms.

---

### Task 1: Resolve variants into a layer model

**Files:** create `packages/codegen/src/normalize/component-layers.mjs` and its test.

`resolveVariants(componentSet)` returns, for every variant, a map of layer path to resolved
properties: start from `defaultVariantTree`, apply `overrides.changed`, keep `vars` alongside the
literal values so a token name survives to the recipe.

Tests on Button: 108 variants; the default resolves to the tree unchanged; `/` on
`prio=secondary` carries the secondary background; a layer that no override touches keeps the
tree's value; `vars` survives resolution.

Run: `npx vitest run packages/codegen/test/component-layers.test.mjs`

---

### Task 2: Classify axes and derive the recipe

**Files:** create `packages/codegen/src/normalize/recipe.mjs` and its test.

For each layer property, determine which axes it depends on, then emit
`base` + `size.<v>` + `variant.<v>.<state>` entries, preferring the token name from `vars` over the
literal value. Every entry must carry provenance: the variant it was read from.

Then **verify**: for each derived entry, check every other axis combination agrees. Collect
disagreements as deviations of the shape already used by `ICON_DEVIATIONS`, naming the layer,
property and the exact variant.

Tests: the recipe's `base.radius` is `radius.control`, not `6px`; `size.sm` carries its own
padding; `variant.primary.hover` reads the hover background; the `fills: null` at
`secondary / sm` is reported as a deviation rather than silently winning; a synthetic orthogonal
component produces no deviations.

---

### Task 3: The component IR

**Files:** create `packages/codegen/src/normalize/components.mjs`, its test, extend
`packages/codegen/test/spec.test.mjs`.

`buildComponentSpec(catalog, raw)` produces the §4.2 shape: `component`, `base`, `api`, `states`,
`slots`, `style`, `provenance`. Written to `spec/components/button.json` by the CLI in Task 9, and
guarded by `spec.test.mjs` the way the token and icon specs are.

Tests: `api.variant` has the three prio values with `primary` as default; `api.size` is
`md | sm | xl` defaulting to `md`; `states` excludes `disabled` and `loading`, which appear in
`api` instead; `slots` names the seven from the catalog.

---

### Task 4: The overlay

**Files:** create `packages/codegen/src/normalize/overlay.mjs`, its test, and
`spec/overlay/button.yaml`.

Loads and merges the hand-written overlay over the IR: `base`, `api.rename`, `style` setters and
`deviations`. Merging is explicit and order-independent, and every overlay rule must name a
`reason`, because an unexplained override is how a design system drifts.

Tests: the `prio → variant` rename reaches the IR; an overlay style setter wins over the derived
value and is marked as overlay-sourced in provenance; a rule without a reason fails loudly; an
overlay naming a property the IR does not have fails rather than being ignored.

---

### Task 5: MUI recipe emitter

**Files:** create `packages/codegen/src/emit/mui-component.mjs` and its test.

Writes `packages/styles/src/generated/mui/components/button.ts`: the recipe as plain data plus the
prop types, importing nothing from MUI, exactly as the token theme does. States render as the
pseudo-selectors MUI's `styleOverrides` expects.

Every token reference is emitted as `var(--solar-…)`, per the decision above; a value in the recipe
that is not one is a failure, not a fallback.

Tests: every value is a `var(--solar-…)` reference naming a token that exists in `tokens.css`,
never a literal — the same contract the token emitters hold; the three variants and three sizes
are present; `disabled` and `loading` appear as props and `hover` does not.

---

### Task 6: Flutter recipe emitter

**Files:** create `packages/codegen/src/emit/flutter-component.mjs`, its test, and a Dart test.

Writes `packages/solar_flutter/lib/src/generated/components/button.dart`: the recipe as a `const`
structure plus a `WidgetStateProperty` resolver, so hover, pressed, focus and disabled resolve the
way Flutter expects rather than through an if-ladder in the widget.

Tests, both sides: the resolver returns the hover background for `WidgetState.hovered`; disabled
wins over hover when both are set, matching CSS specificity; every colour is a `SolarColors` field
rather than a literal.

---

### Task 7: Scaffold the shell, once

**Files:** create `packages/codegen/src/scaffold/`, its test, and `packages/components/src/Button.tsx`;
modify `packages/components/package.json`.

`@bwp-web/components` is still an empty skeleton with no React dependency, so it needs the same
treatment `@bwp-web/assets` got in milestone 2: `react` and `@types/react` as devDependencies for
typecheck and `"react": ">=18"` as the one peer dependency.

`npm run solar:scaffold Button` writes a hand-owned shell that consumes the recipe, and **refuses
to overwrite an existing file** unless `--force` is passed. The shell holds behaviour: prop
plumbing, the loading spinner, slot rendering, accessibility.

Tests: scaffolding twice does not clobber; the generated shell typechecks; it imports the recipe
rather than inlining any value.

---

### Task 8: API parity

**Files:** create `packages/codegen/test/component-parity.test.mjs`.

Both platforms expose the same variants, sizes, states, slots and defaults, with the same names —
read from the **artifacts**, not the manifests, for the reason milestone 1 documented. Also assert
the thing that makes components different from tokens: **every recipe value is a token reference**,
so a raw hex or px in a component recipe fails.

---

### Task 9: CLI and wiring

**Files:** modify `packages/codegen/bin/solar-codegen.mjs`, add `bin/solar-scaffold.mjs`, root
`package.json`.

`solar:codegen` gains a component stage after icons: write `spec/components/*.json`, run both
recipe emitters, fold the component deviations into the one report. `solar:scaffold` is separate,
because scaffolding is a one-time human action and must never run in CI.

Verify determinism by running twice and hashing, and confirm nothing is written under `docs/`.

---

### Task 10: Documentation

**Files:** modify `packages/codegen/README.md`, `docs/README.md`, `CLAUDE.md` and
`packages/components/README.md`, which exists as a two-line placeholder.

Say what a recipe is, where the boundary between generated recipe and owned shell sits, and the
rule of thumb from the spec: **overlay for a decision about one component, normalizer for a rule
about the system, shell for behaviour.** Record how many deviations Button produced and what they
mean.

---

## Done when

- `spec/components/button.json` exists, is guarded, and carries the recipe in token names.
- An MUI app and a Flutter app both render a SOLAR Button from the same spec, and the API parity
  suite proves they expose the same surface.
- Scaffolding Button twice does not overwrite the shell.
- Every disagreement between the axis model and the Figma data is a recorded deviation naming the
  variant, and none is silently averaged away.
- `npm run solar:codegen` stays deterministic and writes nothing under `docs/`.
