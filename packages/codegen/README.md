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
     What F7 (the pickers) added:
   - **Grids.** A `GRID` layout (Date Picker Open's days) is the `direction` keyword `GRID`, its
     gap read from Figma's `gridRowGap` binding (`inset.2xs`); the MUI recipe draws it
     `display: grid`, the shell's resets give it its columns, and Flutter's SolarLayers stacks the
     rows a shell gives it (`content`) by the gap.
   - **A text placed by position** (the double calendar's month labels) has `x` and `y` cells, as
     any placed layer; before, a text's position was dropped, though the oracle measured it.
     What F8 (navigation) added:
   - **Samples that drop the default variant.** Where the overlay's `samples` keeps a value other
     than Figma's default (Breadcrumbs keeps its 5-item trail, not its default "multiple"), the
     variant the rest are read against is the kept one at every other axis's default. The oracle
     still keeps every variant, each reached by the content it samples (as many pages).
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
   A state value that is two others at once (`states.compound`: DatePicker's `error-focused`,
   `of: [error, focus]`) is no prop but a state its shell detects, as a platform state: the MUI
   state table gives it a selector (`&.SolarDatePicker-error:has(… .Mui-focused)`), `flutter.states`
   its test, and the oracle reaches it by setting its prop parts and reaching its platform one.
   `composes` names the component a Figma instance is in code where Figma's name is two
   components' (Date Picker Open's `Day Cell` is `Date Picker Day Cell`); the oracle checks the
   child against that one's oracle. A composed child's oracle entry says which of the child's
   layers the instance hides (`hides`, from the variant's hidden layers: a Select's rows, their
   checkbox, icon and helper), and both checks fail where the child draws one.
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
   oracle excuses its box and its roundness. With `cells` it names the only ones the control
   decides (a slider's fill: `x` and `width`; its handle: `x`), and the rest are drawn and checked.
   `restyles` names a composed child whose fill and edge the parent draws its own way (Toast's
   Tag, on the toast's surface and edge): the recipe reads them from the instance, the MUI recipe
   writes them on the child's own root (`& > *` of its layer), and the checks compare them, and
   the child's box, against the parent's entry, the rest against the child's own oracle. A `set`
   may give a composed child's `variant.*` a keyword of the child's own (Toast's Tag: `status`,
   where Figma names a type Tag no longer has); the oracle then checks the child in that variant,
   keeping Figma's beside it as `figmaVariant`.
   `shownBy` names a layer Figma hides in every variant, with no prop to show it, that is drawn
   where the caller fills a slot (Segmented Control's label); the oracle treats it, and the slot's
   own layer, as shown by a prop, and the rule is refused where Figma shows the layer anywhere.
   A `set` may also add a state's entry where the IR keeps none because Figma draws the state as
   at rest (FAB's and Link's focus, given SOLAR's ring), under an appearance the IR has and for a
   state the component has, or focus where Figma draws none at all (Toggle's, Segmented Control
   Item's), which then joins the component's states; under an appearance another layer of the
   component has, it adds that too (Slider Range's root). Anything else is refused as a stale
   rule. What it `replaced` is then the value the resting lookup found there, and the oracle
   excuses it in each state that holds no value of its own there. A component with states and no appearance axis
   (BackButton, Link) keys them under `default` on both platforms.
   `derive` makes an axis follow from content (FAB's `type`, from whether it has a label; Tag's
   from its words, its icon, and its shell's `indicator` and `onClose`, the `props` a `when` may
   name beside its slots, which both shells must take): the API
   loses it, and both emitters still key the recipe by it, the MUI recipe through
   `Solar<Name>RecipeProps` and Flutter's props class through a field the widget sets, so the
   shell passes what it derived. The oracle reaches such a variant by filling the slots (its
   `content`). A state value the IR makes a boolean prop may be derived too, `true` or `false`
   (a field's `filled`, from its `value`; Token Input's `active`, from its draft): the oracle
   reaches its variant by the content that makes it true, and every other by the content that
   makes it false. A `set` may add a size's entry a layer lacks (SearchField's icons, whose sm
   entry Figma's resting sm variant leaves as md's), and decides an axis finding whose every
   variant draws, where the set reaches, what it now draws (a raw value counts as the token of
   its value). `same` reads a layer Figma draws anew in some variants as another, a sibling
   (Inline Input's Confirm and Cancel, framed again in each edit state): its path, and those
   inside it, take the other's before the recipe and the oracle read them, so one layer stands
   where Figma drew several.
   A layer Figma places by position in a parent that grows keeps its distance from the nearer
   edge (`src/normalize/placement.mjs`, read by the recipe and the oracle alike): Text Area's
   send button is `right` 8, not `x` 240, so it stays in its corner however wide the field. Each
   layer is pinned the same way in every variant; placed from the far edge, the MUI recipe says
   `right` and `bottom`, stepped back by the parent's `--solar-placed-right` and
   `--solar-placed-bottom`, and Flutter's SolarLayers a `Positioned` from those edges, over the
   laid-out children where the parent has an auto layout.
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
accessibility — its Flutter widget (`solar_flutter/lib/src/components/solar_<name>.dart`) and its
story are generated too, on every run, from the two templates in the component's descriptor
(`src/shells/index.mjs`). The templates are the hand-written behaviour: functions of the IR, so a
slot or prop Figma adds reaches the shells, and a fix to a shared helper (`src/shells/drawn.mjs`,
`field.mjs`, `target.mjs`) reaches every component that uses it, both proven by the rebuild CI
runs. A generated shell's first line names its descriptor; it is never edited. A component whose
shell must be edited as a file has `owned: true` in its descriptor and no templates: its shells are
left alone, and must exist without the generated header, so taking one over is deliberate
(remove the header, delete the templates, set `owned`). A stale generated shell, a component
removed, is deleted by its header. Until 2026-09-24 the shells were written once by a
`solar:scaffold` command and then hand-owned; every one was still exactly its template's output, so
they became generated with no change but the header.
The rule of thumb for where a change goes:

> **The overlay for a decision about one component, the normalizer for a rule about the system,
> the shell's template for behaviour.**

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
unreadable indicator colour is excused by its overlay `set`. Where several `set` rules decide one
finding (Text Input's width, the base's and sm's), each variant's excuse names the rule that
reaches it. It also lists each component's
slots, so a check can tell a layer a prop hides from one a state removes. The visual checks
(`packages/components/test/visual/`, `packages/solar_flutter/test/visual/`) render both platforms
and compare every entry that is not excused. It is Figma,
not the other platform, because two platforms agreeing on a mistake would pass a cross-check.

## Layout

```
bin/solar-codegen.mjs      the CLI: builds every stage, then emits, reports, prunes, formats
bin/solar-explain.mjs      why a component draws what it draws, cell by cell; writes nothing
bin/solar-triage.mjs       which components come next, and what each needs; writes nothing
src/stages/                one module per stage (tokens, icons, components): build(), emit()
src/shells/                the shells, rendered from the descriptors' templates, and the helpers
                           the templates share (drawn, field, alert, slider, target)
src/explain/               solar:explain: the recipe lookup, the rows, the report reading
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
regenerating to the same bytes and invisible to CI. Nothing else in them is pruned:
`spec/overlay/` is hand-written. The component shells share their directories with hand-written
files (the package entry, `internal/`, an owned shell), so a stale shell is found by its generated
header instead and deleted the same way.

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
- **A component behaves wrong** → its shell's template, `templates.react` or `templates.flutter` in
  its descriptor (or the shared helper it calls), then `npm run solar:codegen`; the shell itself
  is generated. An `owned` component's shell is the file itself.
- **A visual check fails, or a value looks wrong** → `npm run solar:explain -- "<Name>"` lists the
  variants, every excused difference and the last runs' failures; `--variant <n | name |
axis=value, …>` gives each layer and property of those variants as a chain: Figma's value, the
  recipe entry that wins and where it sits (base, size, appearance, combined), its token and that
  token's value, where the entry was read from (a Figma variant, the defaults, the overlay) and
  why, the rules on the cell, the excuse, and what the web and Flutter checks drew in their last
  runs (their reports, `test/visual/.out/` and `build/visual/`). `--layer` and `--property` narrow
  it; `--full` expands every row, not only those that differ. It builds from the current sources
  in memory and writes nothing. Its lookup is the recipe's own precedence, and a test proves it:
  wherever nothing excuses a difference, the entry it finds resolves to Figma's value, in every
  variant of every component.
- **A new component** → new files only; no list is edited by hand.
  1. Its descriptor, `src/components/<name>.mjs`. The index finds it, and `COMPONENTS` is the
     descriptors found. It holds the component's `name` (and its `address`, where that differs),
     its MUI tables (`slots`, and `resets`, `svgLayers`, `states`, `overlaps`, `restates` as it
     needs them), its Flutter tables (`style` where its base takes a style object, `BUILDERS`, and
     `shared`), and its two shell templates, `templates.react` and `templates.flutter`. Shared
     template helpers are in `src/shells/helpers.mjs`. A component that draws its own layers
     (the display primitives) has `slots: 'drawn'` (every IR layer, each with a class of its own,
     `slotsOf`), `drawnResets`, and templates from `src/shells/drawn.mjs` (`drawnReact`,
     `drawnFlutter`), which hand the layer tree to the shells' shared runtime helpers
     (`packages/components/src/internal/layers.tsx`, `solar_flutter`'s `SolarLayers`) and draw a
     SOLAR icon layer with its component from the assets. A shell may draw a layer as an element
     of its own (`render` on the web, `builders` in Flutter: SplitButton's halves are buttons),
     draw a layer that is another SOLAR component (Tag's StatusIndicator: `render` on the web, in
     the layer's element; `composed` in Flutter, which the measure recognises by its keyed root),
     let a text wrap (`wraps`), take a composing component's colours (`restyle`),
     fill a slot with the caller's widget (`slots`: Link's icons), and hold the caller's children in
     a layer in place of Figma's examples (`content`: Segmented Control's segments). A placed layer
     is set in from its parent's outer edge, as Figma measures it: the recipe says each placing
     layer's border as `--solar-placed-left` and `--solar-placed-top`, which its children step back
     by. `drawnFlutter`'s `control` makes a widget a control always (Checkbox, Toggle), announced by
     `SolarPressable` as a checkbox or a switch, and `values` gives the recipe a prop's value where
     it is not the prop as given (a mixed box is drawn checked). Where a group decides a prop in
     Flutter (Radio's `checked`, its RadioGroup's), `flutter.groupDecides` says so, and the widget
     does not take it. `flutter.states` is a platform state's own test where it is not its
     `WidgetState` alone, the Flutter side of `mui.states` (a Dropdown Item's hover holds while it
     has the focus, as its web selector matches `.Mui-focusVisible`). A control that is a part of
     another (a Dropdown Item's checkbox) is drawn in the other's states, inert: `control.drawnIn`
     names the parameter that gives them in Flutter, and on the web the part's hover selector
     also matches under a `SolarStatesScope` ancestor (`.SolarStatesScope:hover &`), the class the
     row sets, as Flutter's `SolarStatesScope` shares a control's states. `content` (both helpers)
     holds the caller's children in a layer in place of Figma's examples, and `before` (React)
     draws something ahead of the layers (Options List's legend). The menus share
     `src/shells/menu.mjs`: `menuReact`, their surface around MUI's MenuList floating where it is
     anchored (`components/src/internal/float.tsx`), and `menuResets` with `MENU_MAX_HEIGHT`, the
     one raw menu height, a governance gap; `menuReact` also builds rows of its own (`rowsFrom`:
     TimePicker Dropdown's times, with `props`, `own`, `prelude`, a list `role` and `listRef`) and
     gives its rows another menu's size (`sizedBy: 'DropdownMenuSizeContext'`). The pickers share
     `src/shells/picker.mjs` (Select and Dropdown: MUI's Select on InputBase, the panel the
     component's own layer or a Dropdown Menu; a drawn field under `SolarMenuAnchor` in Flutter)
     and `src/shells/typed.mjs` (DatePicker and TimePicker: a field whose words are read back as
     the value, its icon a button opening the panel, `error-focused` compound); `fieldFlutter`
     takes `typeParams` and `around`, what the widget builds around its field (Autocomplete's
     RawAutocomplete). Their dates and times are hand-written runtime helpers, not a picker
     library: `components/src/internal/calendar.ts` and `clock.ts`, and `solar_flutter`'s
     `lib/src/solar_time.dart` beside MaterialLocalizations. A descriptor's `checkedAs` names the
     component a Figma component is the state of (Autocomplete Open, an open Autocomplete): it
     has a recipe, a case on each platform and a story, but no shells, and the barrels leave it
     out. `shells.slots` says how both shells name a slot they name otherwise (`required:
'mandatory'`, `{react, flutter}`), or `null` where the shell fills it itself (Select's
     chevron, the calendar's month). `drawnFlutter`'s `control` takes `focusNode` (a calendar's
     day, which the arrow keys move to) and `target: false` (days that touch, as rows do). F8's
     strip and rail share `solar_flutter`'s `lib/src/solar_tabs.dart` (`SolarTabsScope`, the strip's
     size and choice, which a tab reads; `SolarTabList`, the tab bar and its arrow keys). A Counter
     in a tab takes none of the tab's states (its selectors skip a `[role="tab"]` button, and in
     Flutter it sits in a `SolarStatesScope` of its own). A drawn icon is marked `<prefix>-drawnIcon` on the
     web, a class no layer is named, so a layer named `icon` (ListItem's) styles itself alone.
     Every control's recipe gives it a 44 × 44 target that takes no room
     (`src/shells/target.mjs`: `targetArea`, a pseudo-element, and `targetInput`, a native input
     enlarged), and its widget a `SolarTarget`; `TARGET` there is the one raw target size, a
     governance gap, until SOLAR publishes a variable for it. A value that is no Dart identifier
     (`top-search`, `Default White`, `00`) is respelled for its enum (`dartEnumValue`), which then
     carries Figma's spelling.
  2. Its overlay, `spec/overlay/<address>.yaml`.
  3. `npm run solar:codegen`, which also writes every list the component is in, from the
     descriptors (`src/emit/registries.mjs`): both packages' barrels of shells
     (`packages/components/src/components.generated.ts`, `solar_flutter`'s
     `lib/src/components/components.dart`), the web case registry
     (`test/visual/cases/registry.generated.ts`), the Flutter one (`test/visual/cases/cases.dart`)
     and the variant builders' (`variants/lib/src/registry.dart`, and its library).
  4. Nothing: that run also wrote the shells and the story from the templates (step 1).
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
