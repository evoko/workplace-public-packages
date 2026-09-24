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
   A component is addressed by its Figma name, or `<section>/<name>` where two share one: Figma
   has two `Day Cell`s, `calendar/Day Cell` and `inputs/Day Cell`, and a bare `Day Cell` is an
   error naming both. Its overlay is `spec/overlay/<address>.yaml` (`calendar-day-cell.yaml`), and
   its `codeName` rule (`Calendar Day Cell`, `Date Picker Day Cell`) is its name from the recipe
   on: its files, its classes and its findings' tokens. Figma's name stays in the IR's
   `provenance.figmaName`, and the stage refuses two components generated under one name.
   Layer names come from Figma's, or a slot's; a layer Figma names by a glyph (PIN Input's `|`)
   or two whose names reduce to one (Tree Item's `Label` and `|Label`) fail the build until the
   overlay names them (`layerNames`, by Figma path; a slot's layer keeps its slot's name).
   A standalone component, one Figma drew with no variants (Drawer, Scrim, Pagination, 13 in all),
   is loaded by `componentOf` as the set of its one variant, named `''`, with no axes: its recipe is
   all base, it has no axis findings, and its oracle has one variant. A real set with no axes is
   still refused, as a fetch gone wrong.
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
   A layer with no stroke paint has no border, whatever weight Figma keeps for it (it keeps the
   weight and its binding after the paint is removed). A composed child the reference variant
   hides records no variant, so which child it is (Icon Button's Spinner, drawn only while loading)
   is read from the first variant that draws it. An entry equal to the base is left out only where
   the lookup would still find the base, and one that follows some of the appearance axes is
   written under every full appearance key, since the emitters look entries up by the full key.
   A stack of paints (`src/normalize/paints.mjs`, which the oracle reads the same way) is its top
   paint where that one is an opaque colour, since it covers the rest; the covered paint is a
   `covered` finding for SOLAR (Insight Card's selected card, `surface/background` over
   `surface/base`), and a translucent top fails the build. A radius whose corners differ
   (Popover's square corner by its arrow) has a cell per corner, clockwise from the top left as
   Figma records them, `radiusTopLeft` and the rest, each from its own binding; the MUI recipe
   writes `border<Corner>Radius`, the oracle a radius per corner, and both checks measure each.
   A layer its parent's auto layout does not place (a Toggle's thumb, StatusIndicator's `!` in its
   triangle) has `x` and `y` cells, from the position the fetcher records: part of the drawing, as
   a glyph is, so they follow every axis and raise no finding. Where another variant's auto layout
   places the layer, its `x` and `y` are `none`. The MUI recipe draws a placed box `absolute` at
   `left`/`top` in pixels (the drawing's coordinates, not spacing), with its parent `relative`,
   and keeps a placed glyph's position in the composition data with its outline. Flutter reads
   them as lengths. The oracle measures a placed box's `x`, `y`, `width` and `height` from its
   parent's edge, and records a glyph's position inside the glyph, unmeasured, as its outline is.
   A layer the base control draws itself (Spinner's ring, CircularProgress's SVG circle) is the
   overlay's `controlDraws`, and the oracle excuses its box.
   A **drawing** (StatusIndicator, whose every type is its own shape from other layers) is the
   overlay's `drawing`: every cell of every layer follows every axis, so its entries are keyed by
   size and appearance together. A layer can then be a glyph in one entry and a box in another
   (StatusIndicator's container: a vector circle for danger, a disc frame for neutral), so the MUI
   recipe decides per entry: where the entry draws a glyph, its colours are the SVG's `fill` and
   `stroke` (and the stroke outline's `fill`, `.SolarGlyph-stroke`), and a glyph takes no radius or
   shadow, which the emitter refuses rather than drops. The composition data (`Solar<Name>Parts`,
   exported per component) carries each layer's glyph and position for the shell. `allowLiteral`
   may name the `values` it allows, where a `bind` takes the rest (StatusIndicator's 8px dot, beside
   md and sm bound to the icon ladder).
   A border whose sides differ (Button Group's divider) has a cell per side, `borderTopWidth` and
   the rest, read from the weights the fetcher records per side; data fetched before it recorded
   them draws a side where it is bound and reports the layer `unrecorded` until a sync.
   A cell one variant of a layer has and another lacks is never skipped. Where the absence has a
   meaning it is written as that first: no auto-layout is a layout of `none` (the emitters draw
   no gap or padding, `inset.none`, and restate no flex direction), no recorded sizing is the
   size the layer is drawn at, and one border width where another variant has sides is that
   width on every side. What is left is an axis finding, `no value` against the other's value.
   A composed child's variant is the one exception, since Figma records none on a hidden instance.
   A layer the reference variant does not draw at all (Divider's label, added in `with-label`
   alone) has no value there to differ from, so each of its cells is read where it is drawn, as a
   hidden child's variant is; only its presence is the reference's own. A cell that follows no
   axis then lands in the base, where the emitters find it, rather than being dropped unreported.
   What F1 (the display primitives) added:
   - **Sizes no auto layout gives.** A root with no auto layout of its own (Checkbox's) and a
     layer its parent places by position (Node End's dot) are the size Figma draws them at, fixed,
     and the oracle measures them so; a glyph's size is its outline's, inside the glyph.
   - **Ellipses and booleans.** An ellipse with no outline of its own is a round box,
     `radius.pill` (marked `ellipse`); the oracle records its radius as half its size, and both
     checks compare a corner as drawn, no rounder than half its box, so a pill and an ellipse
     agree. A boolean operation is one shape, the outline Figma records on it: its operands are no
     layers of the component (`resolveVariants`). A vector's corner radius is in its outline, so
     the MUI recipe draws none for it.
   - **Opacity.** A translucent layer (Node End's halo) has an `opacity` cell, Figma's number,
     rounded clear of float noise; the overlay must allow it, since SOLAR has no opacity scale. The
     oracle records it, and both checks compare it.
   - **Hugging past the base.** A `HUG` in a later entry over a fixed size in the base (Tree
     Indent's 0px depth 00) resets the MUI size to `auto`, since declaring nothing would leave the
     base's standing.
   - **A colour the caller gives** (Avatar's): an API prop of `type: 'color'`, a CSS colour on the
     web and a `Color` in Flutter, keying nothing in the recipe (the overlay's `caller`, below).
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
   `bind` takes one literal and its token, or `tokens` mapping several (Icon Button's icon is
   `{ 12: icon.xs, 16: icon.sm, 20: icon.md }`), each checked value for value; a bind that would leave a raw value in the cell fails.
   `rename` may map values too, and one whose values become `true` and `false` makes the prop a
   boolean (Button Group's `type: regular | full-width` is `fullWidth`). `set` takes a sizing
   `keyword` (`FILL`, `HUG`) as well as a token or none, and settles a raw-value finding once no raw
   value is left in the cell; the oracle then excuses Figma's value there, as for any decision.
   A `set` keeps what Figma had beside the decision (`replaced`), so the oracle excuses a measured
   value it changed (a shadow it removes) in exactly the variants that draw what it
   replaced, and no others.
   `controlDraws` decides the raw sizes of the layer the control draws, and the MUI recipe then
   declares nothing of its place or size (ProgressBar's bar, moved by LinearProgress itself); the
   oracle excuses its box and its roundness.
   A `set` may also add a state's entry where the IR keeps none because Figma draws the state as
   at rest (FAB's and Link's focus, given SOLAR's ring), under an appearance the IR has and for a
   state the component has; anything else is refused as a stale rule. What it `replaced` is then
   the value the resting lookup found there. A component with states and no appearance axis
   (BackButton, Link) keys them under `default` on both platforms.
   `derive` makes an axis follow from content (FAB's `type`, from whether it has a label): the API
   loses it, and both emitters still key the recipe by it, the MUI recipe through
   `Solar<Name>RecipeProps` and Flutter's props class through a field the widget sets, so the
   shell passes what it derived. The oracle reaches such a variant by filling the slots (its
   `content`).
   `spec/overlay/excluded.yaml` names the components left out of the flow by decision (Cursor):
   the triage lists none of them, and the build refuses a descriptor for one.
   `samples` names an axis whose values are samples of what the caller gives (Avatar's `color` and
   `shade`, colours Figma draws for show): the API loses it, and the recipe keeps the variants at
   the values `keep` lists, one per combination of the rest, or the build fails. `caller` names a
   cell whose value is the caller's: `prop` makes it a colour prop of the API (Avatar's
   background), and `from` a cell the shell derives from that prop (the initials' ink). The
   recipe's own value there is what is drawn when the caller gives none. The oracle keeps every
   variant: each is reached with the colour Figma samples there as the prop, and compared, and a
   `from` cell is excused, since it is the shell's rule, not Figma's sample.
   Then the **shared defaults** (`spec/overlay/defaults.yaml`, `applyDefaults`), decisions that
   hold for every component, each with a reason. There are two: `zero-insets` binds a padding Figma
   leaves unbound at `0` to `inset.none`, and `zero-gaps` a gap to the none of its layout's
   direction, `inset.none` horizontal and `stack.none` vertical, as SOLAR binds gaps (a GRID's gap
   has no rule, and is left to its component). Each works in every layer and decides the finding
   once every raw value Figma left in that cell is `0`, even one only a variant the recipe does
   not keep draws.
   A cell the component's own `bind`, `set` or `allowLiteral` names is left to it, and a default
   that finds nothing to do in a component is not an error. Its decisions are recorded among the
   IR's rules with `from: spec/overlay/defaults.yaml`, and the deviations report names them.

Two emitters generate from the IR, and neither imports its framework:

| Target    | Output                                                            | What it is                                                                                            |
| --------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `mui`     | `packages/styles/src/generated/mui/components/<name>.ts`          | style data for `sx` keyed by MUI's classes, and `solar<Name>Style()`                                  |
| `flutter` | `packages/solar_flutter/lib/src/generated/components/<name>.dart` | token names, a state resolver, and the base control's style object (`ButtonStyle`) where it takes one |

Each component says how its states are marked, in the MUI emitter's `STATE_SELECTORS` (keyed like
`MUI_SLOTS`): the pseudo-class or the class MUI sets (`Mui-focusVisible`, `Mui-disabled`,
`MuiButton-loading`), or, where MUI has none, a class the shell sets (`Solar<Name>-<state>`). A
component with no table has no states, and a state the IR styles that its table lacks fails the
build. The table's order is the order both platforms resolve two states in — for Button disabled,
loading, focus, pressed, hover, strongest last in CSS, where the later rule wins — and Flutter
reads it reversed; the emitter refuses a table that orders the states the fold knows otherwise
than `BOOLEAN_STATES`. Flutter detects each state the same way for every component: a platform
state is its `WidgetState`, a prop state its prop. What MUI draws that SOLAR does not (Button's 64px
minimum width, its upper-case label) is undone by `MUI_RESETS` in the emitter, so a component looks
right with or without the SOLAR MUI theme installed. What an MUI control draws by itself in a state
is restated there at the recipe's value (`MUI_STATE_RESTATES`): IconButton marks a loading button
disabled, and its own disabled rule would clear the background. On Flutter, the base control's
style builder (`BUILDERS`) emits what the component's `FLUTTER_STYLE` table names: an icon button's
`ButtonStyle` has no text style.

States overlap where Figma's do not: a pointer pressing a button is over it, so a pressed button is
hovered too, in CSS and in Flutter's `WidgetState`s alike. Both platforms blend per property, CSS by
the cascade and Flutter by reading each cell from the strongest state that has one, so both emitters
read the style through `restateOverlaps`, which restates in each later state whatever an earlier
one it overlaps (`OVERLAPS`, per component) sets and it does not: tertiary pressed is not
underlined although tertiary hover is. Flutter was missing this until 3b-2 Task A5, and drew
hover's underline on a mouse press, and hover's colours on a focused primary under the pointer.

**Recipe and shell.** The recipe is what a component looks like; it regenerates on every run and
is never edited. The shell — `packages/components/src/<Name>.tsx`: props, slots, loading,
accessibility — is written once by `npm run solar:scaffold <Name>` (`src/scaffold/`), and its Flutter widget
(`solar_flutter/lib/src/components/solar_<name>.dart`) by `npm run solar:scaffold -- --flutter <Name>`;
both are then owned by developers; the scaffolder refuses to overwrite it without `--force`, and it never runs in CI.
The rule of thumb for where a change goes:

> **The overlay for a decision about one component, the normalizer for a rule about the system,
> the shell for behaviour.**

**What Button's findings mean.** Button produced 11 findings (46 in the whole report, with Spinner's and Icon Button's, whose ten are all decided). Eight
carry an overlay decision and stay in the report beside it: five bind a raw value to the token of
the same value (vertical padding, lg's gap, the icon heights), and three allow a literal SOLAR has
no token for (the fixed heights, lg's width, the counter's height). Two more decisions removed
findings outright, by declaring an axis interaction: tertiary hover's link style and lg's flat
look are drawn as Figma draws them. Three findings are open and are genuine Figma defects:
secondary loses its background at `sm`, the backgrounds change inconsistently at `lg` (Figma's `xl` until 2026-09-23), and the
`lg` disabled label uses the danger colour. They are in
[the design review](../../docs/solar-review-for-design.md), section 6 (the components we build, variant by variant). Run over the whole corpus,
every one of SOLAR Web's 132 components derives a recipe and builds an IR: the 119 sets and the
13 standalone components (milestone 4's Task M4), since Task M5 gave stacked paints, corners of
their own and overlay-named layers a rule. PIN Input, Password Input and Tree Item build with the
overlays that name their glyph-named layers.

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
- **A component looks wrong on one platform** → that platform's emitter, or the component's own
  tables in its descriptor, `src/components/<name>.mjs` (`mui.slots`, `resets`, `states`,
  `flutter.style`…), which the emitters read as `MUI_SLOTS`, `MUI_RESETS`, `STATE_SELECTORS` and
  `FLUTTER_STYLE`.
- **A component looks wrong, and Figma is right for it alone** → its overlay in `spec/overlay/`.
- **A component behaves wrong** → its shell in `packages/components/src/`, which is yours.
- **A new component** → new files only; no list is edited by hand.
  1. Its descriptor, `src/components/<name>.mjs`. The index finds it, and `COMPONENTS` is the
     descriptors found. It holds the component's `name` (and its `address`, where that differs),
     its MUI tables (`slots`, and `resets`, `svgLayers`, `states`, `overlaps`, `restates` as it
     needs them), its Flutter tables (`style` where its base takes a style object, `BUILDERS`, and
     `shared`), and its two shell templates, `templates.react` and `templates.flutter`. Shared
     template helpers are in `src/scaffold/helpers.mjs`. A component that draws its own layers
     (the display primitives) has `slots: 'drawn'` (every IR layer, each with a class of its own,
     `slotsOf`), `drawnResets`, and templates from `src/scaffold/drawn.mjs` (`drawnReact`,
     `drawnFlutter`), which hand the layer tree to the shells' shared runtime helpers
     (`packages/components/src/internal/layers.tsx`, `solar_flutter`'s `SolarLayers`) and draw a
     SOLAR icon layer with its component from the assets. A shell may draw a layer as an element
     of its own (`render` on the web, `builders` in Flutter: SplitButton's halves are buttons), and
     fill a slot with the caller's widget (`slots`: Link's icons). A value that is no Dart identifier
     (`top-search`, `Default White`, `00`) is respelled for its enum (`dartEnumValue`), which then
     carries Figma's spelling.
  2. Its overlay, `spec/overlay/<address>.yaml`.
  3. `npm run solar:codegen`, which also writes every list the component is in, from the
     descriptors (`src/emit/registries.mjs`): both packages' barrels of shells
     (`packages/components/src/components.generated.ts`, `solar_flutter`'s
     `lib/src/components/components.dart`), the web case registry
     (`test/visual/cases/registry.generated.ts`), the Flutter one (`test/visual/cases/cases.dart`)
     and the variant builders' (`variants/lib/src/registry.dart`, and its library).
  4. `npm run solar:scaffold <Name>` and `npm run solar:scaffold -- --flutter <Name>`, for the
     shells and the story.
  5. A visual case on each platform, in the files the registries name:
     `packages/components/test/visual/cases/<slug>.tsx`, a builder in `solar_flutter/variants/lib/src/`
     and a case in `solar_flutter/test/visual/cases/`. Until they exist, the typecheck and
     `flutter analyze` fail on the registries naming them.

  A composed child the shell draws (Button's Spinner) comes from the recipe's `compose` lookup,
  never by hand. Both review surfaces then show the component with no more work.

- **Choosing which components come next** → `npm run solar:triage` (`bin/solar-triage.mjs`,
  `src/report/triage.mjs`). It builds every SOLAR Web component's IR in memory and prints, per
  component: whether it builds (and why not), its API, states and slots, what it composes and at
  which level, the features it needs (`glyph`, `image`, `text`, per-side `sides`), and its findings
  before any overlay, split into axis, zero-inset, boundable to a token, and no token. `-- --json`
  gives the rows, `-- --all` adds patterns and views. It writes nothing and is not part of
  `solar:codegen`.
- **A new icon appeared in Figma** → nothing here either; re-run `npm run solar:icons`, and
  `src/normalize/icons.mjs` picks it up. An SVG feature the IR cannot represent — a gradient, a
  stroke, an arc — fails naming the file rather than being quietly dropped.

Everything generated is committed, and CI regenerates it and fails on any difference, so run
`npm run solar:codegen` and commit the result after touching this package.

Generator code is ESM `.mjs` with no build step. Run the suites with `npx vitest run` from here
or from the repository root.
