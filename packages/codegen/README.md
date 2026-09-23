# @bwp-web/codegen

Turns the SOLAR design system in [`docs/`](../../docs/README.md) into code. Private to this
repository: it is a build tool, not something we publish.

One command does everything:

```bash
npm run solar:codegen
```

It reads the committed Figma data and writes three contracts — `spec/tokens.json`,
`spec/icons.json` and `spec/components/*.json` — then emits the tokens to four targets, the icons
to three and each component's recipe to two. It needs no Figma token and no network.

## The one invariant

**The generator never writes to `docs/`.** `docs/` mirrors Figma; if generated code looks wrong,
the fix belongs in this package, never in the mirror. Every write goes through
[`writeGenerated`](src/util/write.mjs), which refuses a path under `docs/` outright, and CI
re-checks it after each run. This is invariant 1 of
[the design spec](../../docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md).

## What it produces

`spec/tokens.json` is the contract: 710 tokens in [DTCG](https://tr.designtokens.org/) format —
647 variables, 9 shadows, 47 text styles and the 7-level z-index ladder. Modes live under
`$extensions["com.biamp.solar"].modes`. Every token target is generated from this one file.

| Target     | Output                                                        | Covers                                                                      |
| ---------- | ------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `css`      | `packages/styles/src/generated/css/tokens.css`                | 663 — everything except the typography composites                           |
| `mui`      | `packages/styles/src/generated/tokens.ts`, `.../mui/theme.ts` | 710: the agnostic token data, and the MUI theme apart from it               |
| `tailwind` | `packages/styles/src/generated/tailwind/theme.css`            | 370 — the semantic layer, plus `motion.*` and font families, for Tailwind 4 |
| `flutter`  | `packages/solar_flutter/lib/src/generated/tokens.dart`        | 710                                                                         |

The four are independent emitters reading one normalized spec. They are **not** transpiled from
each other: a Dart file is not a translation of a stylesheet, and pretending otherwise is how
the two drift apart.

`spec/deviations.md` lists the **29 places code and Figma differ**: 14 from the tokens, 1 from the
MUI theme, 3 from the icons and 11 from Button. It is the report SOLAR governance
reads, so every entry names an action for them. The count is whatever the data triggers, not a
list someone maintains: a rule fires only when its defect is present.

The MUI row is the one decision SOLAR does not make at all. Stock MUI components read
`palette.primary.main`, `body1`, `button` and so on, so `MUI_PALETTE` and `MUI_TYPOGRAPHY` in
[`src/emit/mui.mjs`](src/emit/mui.mjs) map those names to the SOLAR roles used the same way —
`action.*.bg` for the button fills, `surface.feedback.*.strong` for the feedback fills, display and
title for `h1`–`h6`. A name in either table that is not a token fails the build.

## How the targets are kept in agreement

Each emitter's render function returns a manifest alongside its output recording, per token,
`{emitted, normalized, modes}` — the literal it produced, that literal parsed back to a
canonical form, and the same per mode. Manifests are held in memory, never written to disk.
[`test/parity.test.mjs`](test/parity.test.mjs) asserts across all four that they agree with each
other **and** with the spec, in every mode.
Agreement alone is not enough: four targets can be uniformly wrong, so the spec is the oracle.

Two subtleties worth knowing before changing an emitter:

- **Canonicalization absorbs unit differences, not mistakes.** Alpha is quantized to 8 bits
  because Dart's `Color(0xAARRGGBB)` has only one byte for it, and letter spacing is compared as
  a fraction of the font size because Figma states it in percent, CSS needs a length and Flutter
  needs pixels. A one-step error in either still fails.
- **A manifest is a claim about the output, so parity checks it against the real artifact.** The
  last assertion re-reads the stylesheet, the MUI data and the Dart source, because an emitter
  that recorded a mode it forgot to emit would otherwise pass.

## Icons

`spec/icons.json` is the second contract, built from `docs/solar-icons/`: 340 icon sets in
outline and solid, 3 logo sets, each variant reduced to `{viewBox, paths}` and each path to its
`d` string and fill rule. Three targets are emitted from it.

| Target    | Output                                                              | Covers                                            |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `react`   | `packages/assets/src/generated/icons/`, `.../logos/`                | 340 icon components, 2 logo components, 5 rasters |
| `svg`     | `packages/assets/src/generated/svg/`                                | 685 standalone files: 680 icon variants, 5 marks  |
| `flutter` | `packages/solar_flutter/lib/src/generated/icons.dart`, `logos.dart` | 680 icon and 4 logo `SolarVector` constants       |

The path data reaches all three byte for byte, so agreement is a property of the data rather
than of three formatters happening to concur. [`test/icon-parity.test.mjs`](test/icon-parity.test.mjs)
proves it the hard way: it opens the generated TSX, the generated SVG and the generated Dart,
extracts the geometry back out and compares it to the spec, never to a manifest.

The app icons are raster, so their bytes are not in `spec/icons.json` — only a SHA-256 of each
file. The logo emitter reads the PNG from `docs/` and refuses bytes that do not match, so a
changed image changes the spec and the spec guard sees it.

Two contracts make icons different from tokens, and each is asserted in both directions:

- **No icon carries a colour.** Every icon in SOLAR is drawn `#111111`; the normalizer asserts
  that and drops the fill, so a React path is `fill="currentColor"`, an SVG file's path is too,
  and a Dart path's `fill` is null and takes the widget's colour. The colour comes from
  `color.icon.*` at the point of use. A token's whole content is its value; an icon must have
  none, so the suite checks both the absence of any hex, `Color(` or `rgb(` and the presence of
  the inheritance that replaces it.
- **Every logo carries one.** A brand mark is not an icon with a tint, so a logo path keeps its
  own `#rrggbb`, an inherited one is an error, and `currentColor` appears in no generated logo
  artifact at all. The React and Flutter types omit a colour prop, so the compiler refuses a
  tinted mark rather than a comment asking nicely.

The one asset the vector IR cannot represent is the Teams mark — 12 gradient fills and every
`fill-opacity` in the corpus. React and the raw SVG ship it verbatim; Flutter omits it. The
emitter asserts that is the _only_ variant it skipped, and the parity suite asserts it is the
only divergence between the targets, so a second unrepresentable asset fails the build instead
of disappearing.

## Components

A component set under `docs/solar-web/` becomes `spec/components/<name>.json`, in four steps.

1. **Resolve** (`src/normalize/component-layers.mjs`). Figma stores one full layer tree for the
   default variant and, for every other variant, only a diff against it. Resolution reverses the
   diff, so each variant is a map of layer path to that layer's properties, with each variable
   binding kept beside the value it binds: `radius: 6` with `Spatial:radius/control`.
2. **Derive the recipe** (`src/normalize/recipe.mjs`). SOLAR's model is that **geometry follows
   size, paint follows appearance and state**. Each style cell — a background, a padding, a label's
   type — is read from the one variant that holds every other axis at its default, in token names.
   Then every other variant is checked against it, and a disagreement is recorded as a deviation
   naming the variants, never averaged away: it is a Figma mistake or a real interaction between
   axes, and only a person can say which. A value bound to no variable is recorded too. An image
   fill is content, not design: the layer records `image` and the colour beside it is its background.
   A vector's recorded outline is a `glyph`, Figma's path data checked against `M L C H V Z`, in a
   cell class of its own that follows every axis.
   A colour bound to a variable that is not a colour is `misbound`, reported and never painted.
3. **Build the IR** (`src/normalize/components.mjs`): the public API (Figma's `state` axis is
   demoted — hover, pressed and focus become platform states, disabled and loading stay props;
   states drawn as `false/true` axes of their own, as Checkbox's are, are first folded into one
   `state` axis, and a variant with two at once is read as the stronger and reported),
   the slots from the layer tree's prop bindings in every variant (a frame one prop shows and the
   text inside it another fills are one slot; the layers one prop drives, moving by variant or
   drawn together, are one slot with `alternates`; a Figma `SLOT` layer is a content slot), the layers by name, and the recipe. A layer is named by its slot
   or its own name; two that would share one are qualified by their parents until they differ
   (`/Field/Label` is `fieldLabel` beside `/Label`), and repeated siblings keep Figma's order
   (`tabItem`, `tabItem2`). Names depend on the set of paths alone, never on the order seen.
4. **Apply the overlay** (`src/normalize/overlay.mjs`, `spec/overlay/<name>.yaml`). The only place
   judgement lives: the stock control to wrap, renames, a cell that follows more axes than the
   model says, a raw value bound to the token of the same value, an allowed literal, an accepted
   finding. Every rule needs a reason, and a rule that no longer matches the IR fails the build. A state
   value Figma spells otherwise (`states.rename`) is renamed before the recipe, as `follows` is.

Two emitters generate from the IR, and neither imports its framework:

| Target    | Output                                                            | What it is                                                           |
| --------- | ----------------------------------------------------------------- | -------------------------------------------------------------------- |
| `mui`     | `packages/styles/src/generated/mui/components/<name>.ts`          | style data for `sx` keyed by MUI's classes, and `solar<Name>Style()` |
| `flutter` | `packages/solar_flutter/lib/src/generated/components/<name>.dart` | token names, a state resolver, and a `ButtonStyle` via `WidgetState` |

Both resolve states in one order — disabled, loading, focus, pressed, hover — which the Flutter
emitter imports from the MUI one reversed, because in CSS the later rule wins. What MUI draws that
SOLAR does not (Button's 64px minimum width, its upper-case label) is undone by `MUI_RESETS` in the
emitter, so a component looks right with or without the SOLAR MUI theme installed. CSS states
overlap where Figma's do not — a pressed button is hovered too — so the emitter restates, in each
later state, whatever an earlier one it overlaps (`OVERLAPS`) sets and it does not: tertiary
pressed is not underlined although tertiary hover is. Flutter resolves one state at a time and
needs no such step.

**Recipe and shell.** The recipe is what a component looks like; it regenerates on every run and
is never edited. The shell — `packages/components/src/<Name>.tsx`: props, slots, loading,
accessibility — is written once by `npm run solar:scaffold <Name>` (`src/scaffold/`), and its Flutter widget
(`solar_flutter/lib/src/components/solar_<name>.dart`) by `npm run solar:scaffold -- --flutter <Name>`;
both are then owned by developers; the scaffolder refuses to overwrite it without `--force`, and it never runs in CI.
The rule of thumb for where a change goes:

> **The overlay for a decision about one component, the normalizer for a rule about the system,
> the shell for behaviour.**

**What Button's findings mean.** Button produced 11 findings (36 in the whole report, with Spinner's). Eight
carry an overlay decision and stay in the report beside it: five bind a raw value to the token of
the same value (vertical padding, lg's gap, the icon heights), and three allow a literal SOLAR has
no token for (the fixed heights, lg's width, the counter's height). Two more decisions removed
findings outright, by declaring an axis interaction: tertiary hover's link style and lg's flat
look are drawn as Figma draws them. Three findings are open and are genuine Figma defects:
secondary loses its background at `sm`, the backgrounds change inconsistently at `lg` (Figma's `xl` until 2026-09-23), and the
`lg` disabled label uses the danger colour. They are in
[the design review](../../docs/solar-review-for-design.md), section 8. Run over the whole corpus,
115 of SOLAR Web's 119 component sets derive a recipe; the four that do not throw on shapes the
recipe does not model yet (one side bound to two variables, stacked paints), which is milestone 3b-2.

[`test/component-parity.test.mjs`](test/component-parity.test.mjs) reads the generated TypeScript
and Dart and the shell back from disk and proves the two platforms expose the same API, style the
same states in the same order, and hold every IR entry at its own place.

**The oracle** (`src/verify/oracle.mjs`, written to `spec/verify/<name>.json`) is what Figma draws
for every variant, measured independently of the recipe: per layer, the background, text or icon
colour, border colour and width, radius, padding and gap, the text style's parts, the shadow, and a
box size where Figma fixes one, resolved to Light and Desktop. It reads the resolved Figma layers
and uses the IR only for its layer names and API, so a wrong recipe shows as a difference rather
than agreeing with itself; a test scrambles the recipe and checks the oracle does not move. Where
the code is known to differ, the entry keeps Figma's value and is marked `excused` with the
finding and its decision, if any: Button's three open findings excuse 18 entries, and Spinner's
unreadable indicator colour is excused by its overlay `set`. It also lists each component's
slots, so a check can tell a layer a prop hides from one a state removes. The visual checks
(`packages/components/test/visual/`, `packages/solar_flutter/test/visual/`) render both platforms
and compare every entry that is not excused. It is Figma,
not the other platform, because two platforms agreeing on a mistake would pass a cross-check.

## Layout

```
bin/solar-codegen.mjs      the CLI: builds every stage, then emits, reports, prunes, formats
bin/solar-scaffold.mjs     writes a component's hand-owned shell, once
src/stages/                one module per stage (tokens, icons, components): build(), emit()
src/scaffold/              the React and Flutter shell templates, written once
src/normalize/             css-contract.json -> the DTCG spec, solar-icons/ -> the icon spec,
                           solar-web/ -> the component IR (layers, recipe, overlay), the SVG
                           reader, and the recorded deviations
src/emit/                  one file per emitter, plus the manifest entries and canonical values
src/report/                spec/deviations.md
src/verify/                the oracle, spec/verify/<name>.json
src/util/                  paths, the docs/ write guard and pruning, sorting, naming, digests,
                           SVG markup scanning
test/                      unit suites per module, token parity across four targets, icon
                           parity across three, component parity across two, and the
                           packaging checks
```

Every stage is built before any is emitted, so a normalizer that throws stops the run before a
single target has been rewritten. A new stage is a module exporting `name`, `build()` and
`emit(built)`, where `emit` returns `{counts, deviations}`, added to `STAGES` in the CLI.

**Stale output is deleted.** After every stage has written, the CLI removes anything under the
generated directories (`packages/styles/src/generated`, `packages/assets/src/generated`,
`packages/solar_flutter/lib/src/generated`, `spec/components` and `spec/verify`) that the run did not write, and
says so. Without it, an icon removed in Figma would keep its generated module forever,
regenerating to the same bytes and invisible to CI. Nothing outside those directories is pruned:
`spec/overlay/` and the component shells are hand-written.

## Changing it

- **A value is wrong in every target** → the normalizer, `src/normalize/`.
- **A value is wrong in one target** → that emitter, `src/emit/`.
- **Figma itself is wrong** → add a rule to `src/normalize/deviations.mjs` so it is applied
  consistently and reported to SOLAR governance in `spec/deviations.md`. Do not edit `docs/`.
- **A new token appeared in Figma** → nothing here; re-run `npm run solar:tokens`, and the
  normalizer picks it up. An unknown token _type_ fails loudly rather than guessing.
- **A component looks wrong on one platform** → that platform's emitter, and its table
  (`MUI_SLOTS`, `MUI_RESETS`, `FLUTTER_STYLE`).
- **A component looks wrong, and Figma is right for it alone** → its overlay in `spec/overlay/`.
- **A component behaves wrong** → its shell in `packages/components/src/`, which is yours.
- **A new component** → add it to `COMPONENTS` in `src/stages/components.mjs`, give the emitters
  its slot and style tables and the scaffolder a React and a Flutter template, then
  `npm run solar:scaffold <Name>` and `npm run solar:scaffold -- --flutter <Name>`. A composed
  child the shell draws (Button's Spinner) comes from the recipe's `compose` lookup, never by hand.
- **A new icon appeared in Figma** → nothing here either; re-run `npm run solar:icons`, and
  `src/normalize/icons.mjs` picks it up. An SVG feature the IR cannot represent — a gradient, a
  stroke, an arc — fails naming the file rather than being quietly dropped.

Everything generated is committed, and CI regenerates it and fails on any difference, so run
`npm run solar:codegen` and commit the result after touching this package.

Generator code is ESM `.mjs` with no build step. Run the suites with `npx vitest run` from here
or from the repository root.
