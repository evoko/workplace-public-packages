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
[the architecture](../../docs/engineering/architecture.md#invariants).

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

`spec/deviations.md` lists **every place code and Figma differ**: the tokens, the MUI theme, the
icons and every component finding, decided or open. It is the report SOLAR governance reads, so
every entry names an action for them. The count is whatever the data triggers, not a
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
   Then every other variant is checked against it, and a disagreement is recorded as a finding
   naming the variants, never averaged away: it is a Figma mistake or a real interaction between
   axes, and only a person can say which. A value bound to no variable is recorded too. An entry
   equal to the base is left out only where the lookup would still find the base, and one that
   follows some of the appearance axes is written under every full appearance key, since the
   emitters look entries up by the full key.
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
   What the recipe does with each kind of drawing (placed layers, glyphs, gradients, per-corner
   radii, per-side borders, dashes, composed children and the rest) is in
   [Recipe features, by topic](#recipe-features-by-topic).
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
4. **Apply the overlay** (`src/normalize/overlay.mjs`, `spec/overlay/<name>.yaml`; every rule kind,
   with a real example, is in the reference, [spec/overlay/README.md](../../spec/overlay/README.md),
   and `npm run solar:overlay:audit` lists what the overlays decide more than once). The only place
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
build. The table runs from the weakest state to the strongest — for Button hover, pressed, focus,
loading, disabled — since in CSS the later rule wins; Flutter's `statePrecedence` is the same list
reversed, strongest first, and reads each cell from the first state that has one. So a pressed
button that is also hovered draws pressed, and a disabled one draws disabled whatever else holds; the emitter refuses a table that orders the states the fold knows otherwise
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
underlined although tertiary hover is. Without it, Flutter drew hover's underline on a mouse press,
and hover's colours on a focused primary under the pointer.

**Recipe and shell.** The recipe is what a component looks like; it regenerates on every run and
is never edited. The shell — `packages/components/src/<Name>.tsx`: props, slots, loading,
accessibility — and its Flutter widget (`solar_flutter/lib/src/components/solar_<name>.dart`) are
files written by hand, TSX by a React engineer and Dart by a Flutter engineer
([architecture](../../docs/engineering/architecture.md#two-libraries-one-contract)); only its story
is generated (`src/shells/index.mjs`, which also checks
that both shells exist without the generated header). What the IR decides still reaches them with
no edit: the props types, the layer tree (`solar<Name>Tree`, `Solar<Name>Recipe.tree`) and the slot
names (`solar<Name>Slots`) are generated beside the recipe and imported, and the component-parity
test fails a shell that leaves an IR prop, slot or icon unreached (`src/shells/api.mjs`,
`src/shells/icons.mjs`), copies the tree, or reads its React props other than through the theme
(`useSolarProps`). A fix to a runtime helper (`components/src/internal/`, `solar_flutter/lib/src/`)
reaches every shell that imports it. A descriptor that still carries `templates` or `owned`
is refused. The rule of thumb for where a change goes:

> **The overlay for a decision about one component, the normalizer for a rule about the system,
> the shell for behaviour.**

**Reading the findings.** Every finding is in `spec/deviations.md` with its decision, or with
the question for SOLAR where it is open. Button's show the kinds: most of its unbound values are
`bind`s to the token of the same value (the icon widths, the zero paddings through the shared
default, the heights to `size.control.*`), a few are `allowLiteral`s where SOLAR has no token (the
counter's height, lg's width), and the backgrounds that change at `sm` and `lg` are open, drawn
as the reference variant draws them and listed in
[the design review](../../docs/solar-review-for-design.md). Every one of SOLAR Web's components
derives a recipe and builds an IR, the sets and the standalone components alike, except those
`spec/overlay/excluded.yaml` leaves out.

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

## Recipe features, by topic

What the normalizer, the emitters and the oracle each do with a kind of Figma drawing. Each rule
is applied the same way by the recipe and the oracle unless it says otherwise, and both visual
checks measure what it produces.

### Size and layout

- **Sizes no auto layout gives.** A root with no auto layout of its own (Checkbox's) and a layer
  its parent places by position (Node End's dot) are the size Figma draws them at, fixed, and the
  oracle measures them so; a glyph's size is its outline's, inside the glyph.
- **Hugging past the base.** A `HUG` in a later entry over a fixed size in the base (Tree Indent's
  0px depth 00) resets the MUI size to `auto`, since declaring nothing would leave the base's
  standing.
- **A text that fills its row.** Figma's FILL on a text is layout, and recorded (a card's title,
  its More at the row's end); where another variant's fills and this one's does not, it hugs. A
  text the root draws itself (Button's label) is given no size of its own, and a drawn icon or
  glyph keeps its size beside what fills (`drawnResets`).
- **Sizes that do not shrink.** On the web a fixed size inside a component is also its minimum,
  and a filling one's minimum is 0, as Figma's auto layout and Flutter's Expanded size them; a
  component's root keeps CSS's own, so it still fits a narrower page.
- **Grids.** A `GRID` layout (Date Picker Open's days) is the `direction` keyword `GRID`, its gap
  read from Figma's `gridRowGap` binding (`inset.2xs`); the MUI recipe draws it `display: grid`,
  the shell's resets give it its columns, and Flutter's SolarLayers stacks the rows a shell gives
  it (`content`) by the gap.
- **Composed children in a row.** `SolarLayers` boxes a composed child at the fixed size its
  parent's recipe gives it (a TableHeader's 240px SearchField) and lays one the recipe hugs in a
  row at its intrinsic width (a TableFooter's Dropdown); the Flutter check compares the box a
  composed child gives its own composed children, and a case may take a larger `surface`.

### Placement

- **Placed layers.** A layer its parent's auto layout does not place (a Toggle's thumb,
  StatusIndicator's `!` in its triangle) has `x` and `y` cells, from the position the fetcher
  records: part of the drawing, as a glyph is, so they follow every axis and raise no finding.
  Where another variant's auto layout places the layer, its `x` and `y` are `none`. The MUI recipe
  draws a placed box `absolute` at `left`/`top` in pixels (the drawing's coordinates, not
  spacing), with its parent `relative`, and keeps a placed glyph's position in the composition
  data with its outline. Flutter reads them as lengths. The oracle measures a placed box's `x`,
  `y`, `width` and `height` from its parent's edge, and records a glyph's position inside the
  glyph, unmeasured, as its outline is. A text placed by position (the double calendar's month
  labels) has `x` and `y` cells too.
- **The nearer edge.** A layer placed in a parent that grows keeps its distance from the nearer
  edge (`src/normalize/placement.mjs`): Text Area's send button is `right` 8, not `x` 240. Each
  layer is pinned the same way in every variant; placed from the far edge, the MUI recipe says
  `right` and `bottom`, stepped back by the parent's `--solar-placed-right` and
  `--solar-placed-bottom`, and Flutter's SolarLayers a `Positioned` from those edges, over the
  laid-out children where the parent has an auto layout. SolarLayers steps a placed layer back by
  its parent's edge side by side (Time Slot's top and left edges).
- **Figma's constraints.** The fetcher records a placed layer's constraint where it is not the
  left and the top (Table's fade, `RIGHT/TOP`), and placement pins the layer to that edge; a
  constraint that pins neither edge alone (CENTER, SCALE) leaves the place to decide. A placed
  layer that fills an axis spans to its parent's far edge.
- **Centre pins.** A placed layer Figma constrains to its parent's CENTER, in a parent that grows
  along the axis, is pinned there (`centerX`, `centerY`): Tooltip's arrow, Coachmark's title. An
  explicit constraint decides per variant, and a variant placing a layer from another edge than
  the next (Coachmark's connector) writes the edge it does not use `AUTO`: `left: auto` on the
  web, no edge in Flutter.
- **A child order per variant.** The fetcher records `order`, a layer's rank among the siblings a
  variant shares with the default, where it differs (Popover's tip, before its content where it
  points up); `resolveVariants` draws each variant in its own order, and `ordersOf` gives every
  laid-out child of a reordering parent an `order` cell, a flex item's `order` in CSS and the
  flow's order in SolarLayers. Both checks measure it along the parent's axis.

### Shape and edge

- **Corners of their own.** A radius whose corners differ (Popover's square corner by its arrow)
  has a cell per corner, clockwise from the top left as Figma records them, `radiusTopLeft` and
  the rest, each from its own binding; the MUI recipe writes `border<Corner>Radius`, the oracle a
  radius per corner, and both checks measure each.
- **Sides of their own.** A border whose sides differ (Button Group's divider) has a cell per
  side, `borderTopWidth` and the rest, from the weights the fetcher records per side; data fetched
  before it recorded them draws a side where it is bound and reports the layer `unrecorded`. A
  layer with no stroke paint has no border, whatever weight Figma keeps for it (it keeps the weight
  and its binding after the paint is removed).
- **Ellipses and booleans.** An ellipse with no outline of its own is a round box, `radius.pill`
  (marked `ellipse`); the oracle records its radius as half its size, and both checks compare a
  corner as drawn, no rounder than half its box, so a pill and an ellipse agree. A boolean
  operation is one shape, the outline Figma records on it: its operands are no layers of the
  component. A vector's corner radius is in its outline, so the MUI recipe draws none for it.
- **Arcs.** The fetcher records a partial ellipse's `arc` (its angles and hole), and the IR
  carries it (the donut's 0.6 hole, which the chart theme takes).
- **Dashed strokes.** The fetcher records a stroke's `dashes` (Figma's `strokeDashes`); the recipe
  carries them as `borderDash`, the web draws CSS's `dashed` (the lengths are the browser's)
  through a `--solar-border-style` its edges read, and Flutter paints Figma's pattern with
  `SolarDashedDecoration` over the box, its border clear. Both checks compare dashed against solid.
- **Lines.** A LINE is its stroke: the top edge of a box as long as the line and as tall as the
  stroke, not Figma's outline of it, so it spans its parent (Time Slot's half-hour rule).
- **Turned outlines.** REST gives a vector's path in the node's own coordinates; the fetcher
  (`docs/solar-web/raw/drawn-path.mjs`) turns each point by the node's transform and moves it back
  into its box, so Tooltip's side arrows point sideways, as Figma draws them.

### Paint

- **Stacked paints** (`src/normalize/paints.mjs`, which the oracle reads the same way) are their
  top paint where that one is an opaque colour, since it covers the rest; the covered paint is a
  `covered` finding for SOLAR (Insight Card's selected card, `surface/background` over
  `surface/base`), and a translucent top fails the
  build.
- **Gradients.** The fetcher records a linear gradient as its handles and its stops
  (`src/normalize/gradient.mjs` reads it); the recipe keeps each stop's colour token and place, a
  stop bound to `color.alpha.transparent` read as the colour beside it faded out (`alpha: 0`), so
  no primitive reaches the code and the fade is the surface's in Light and Dark. CSS draws a
  `linear-gradient`, Flutter a `LinearGradient` between Figma's handles, and the oracle and both
  checks compare one canonical form. A gradient that runs neither across nor down its box fails,
  naming the layer.
- **Opacity.** A translucent layer (Node End's halo) has an `opacity` cell, Figma's number, rounded
  clear of float noise; the overlay must allow it, since SOLAR has no opacity scale.
- **Image fills** are content, not design: the layer records `image` and the colour beside it is
  its background.
- **A colour the caller gives** (Avatar's) is an API prop of `type: 'color'`, a CSS colour on the
  web and a `Color` in Flutter, keying nothing in the recipe (the overlay's `caller`).
- **A colour bound to a variable that is not a colour** is `misbound`, reported and never painted.

### Glyphs and drawings

- **Glyphs.** A vector's recorded outline is a `glyph`, Figma's path data checked against
  `M L C H V Z`, in a cell class of its own that follows every axis. A glyph's stroke width may be
  an allowed literal (Sparkline's 1.5).
- **Drawings.** A component whose every variant is its own shape (StatusIndicator) is the
  overlay's `drawing`: every cell of every layer follows every axis, so its entries are keyed by
  size and appearance together. A layer can then be a glyph in one entry and a box in another
  (StatusIndicator's container: a vector circle for danger, a disc frame for neutral), so the MUI
  recipe decides per entry: where the entry draws a glyph, its colours are the SVG's
  `fill` and `stroke` (and the stroke outline's `fill`, `.SolarGlyph-stroke`), and a glyph takes
  no radius or shadow, which the emitter refuses rather than drops. The composition data
  (`Solar<Name>Parts`, exported per component) carries each layer's glyph and position for the
  shell. `allowLiteral` may name the `values` it allows, where a `bind` takes the rest
  (StatusIndicator's 8px dot, beside md and sm bound to the icon ladder).
- **Layers the control draws.** A layer the base control draws itself (Spinner's ring,
  CircularProgress's SVG circle) is the overlay's `controlDraws`, and the oracle excuses its box.

### Composition

- **A composed child's variant.** A composed child the reference variant hides records no variant,
  so which child it is (Icon Button's Spinner, drawn only while loading) is read from the first
  variant that draws it. An overlay `set` of a composed child's `variant.*` reaches a child Figma
  records no variant for (Stepper's first line+text step), and both checks take a standalone
  child (PaginationEllipsis) in its one variant.
- **What a child hides.** The fetcher (`docs/solar-web/raw/variant-diff.mjs`) records each hidden
  layer by path (`hiddenPaths`), a standalone component's too, so a composed child hides exactly
  its own layers (Autocomplete Open's field, its label and icons). The overlay's `hides` names the
  layers a child draws where older data records a hidden layer by name alone and two children
  share the name.
- **A layer one variant adds** sits where Figma draws it, from the added layer's recorded `index`;
  the overlay's `places` puts it back where older data recorded it after its siblings.
- **A detached or unbuilt child.** Where a variant detaches an instance (Card's loading Tag) or the
  child is no component of the library (Launch Card's App Icon, an asset), both checks measure its
  box alone; a parent's own layers are never read inside a composed child's element.
- **Layers the caller picks one of.** The overlay's `choice` makes layers Figma draws together
  (Interactive Card's Checkbox, Radio and Toggle) one prop picking one, or, with `content`, a
  choice the content makes; the oracle checks each Figma variant once per value, the layers not
  chosen expected undrawn (`unchosen`).
- **Sample content.** The overlay's `examples` names a layer whose children are Figma's sample of
  what the caller puts there (Split Dialog's panes, Drawer's content): none of them reaches the IR,
  the oracle or the recipe. `repeats` reads sibling copies Figma draws as sample content (a
  month's Day Cells) as their first.
- **Samples that drop the default variant.** Where the overlay's `samples` keeps a value other
  than Figma's default (Breadcrumbs keeps its 5-item trail), the variant the rest are read against
  is the kept one at every other axis's default. The oracle still keeps every variant, each
  reached by the content it samples.
- **An icon that follows one axis.** `iconsOf` gives a layer whose icon changes with one axis
  (PaginationNav's chevron, by its direction) `byAxis`, the icon at each value, which `reactIcon`
  and `dartIcon` choose by the prop; any other layer drawing two icons is refused.
- **An axis from another component.** The overlay's `tint` gives a component another's axis, its
  values recolouring it (`normalize/tint.mjs`, applied once every IR is built): Agenda Row and
  All-Day Bar take Event Chip's `category`, each value's colour family read from Event Chip's
  stripe.

### Text and states

- **Words, checked.** The oracle marks a text Figma draws words in (`words`), and both checks fail
  one drawn in its style with none (Status Card's value, its words never passed on).
- **A hover or focus Figma does not draw.** A `set` may add a hover a description asks for (Row's,
  on a pressable row) or a focus ring Figma draws none of.
- **Both modes.** `buildOracle` takes a `mode`; the stage writes Light with each variant's Dark
  differences beside it (`withDark`), and both visual checks measure both.

### Library components

A descriptor's `library: 'charts'` (Bar Chart, Line Chart, Donut Chart, Chart Axis, Chart
Gridlines) builds the IR and the oracle but no recipe, shell, case or story: a chart library draws
them. `src/emit/chart-theme.mjs` writes the chart theme from their cells (and Bar's and Chart
Tooltip's), `solarChartTheme` in `@bwp-web/styles/mui` and `SolarChartTheme` in `solar_flutter`,
checking the series orders against the IRs, so a Figma change to them fails the build. Their plots
are Figma's sample data, so an `accept` pattern (`component.bar chart.*`) decides their findings,
and `test/charts.test.mjs` checks the theme carries each cell.

### Runtime helpers the shells share

- On the web, `packages/components/src/internal/`: `layers.tsx` (`drawChildren`, the layer-tree
  renderer), `modal.tsx` (MUI's Dialog, SOLAR's Scrim its backdrop, or the surface in place),
  `float.tsx`, `theme.ts` (`useSolarProps`), and helpers for tables, calendars, clocks and charts.
- In Flutter, `packages/solar_flutter/lib/src/`: `SolarLayers` (with `clips`, `repeats`,
  `content`, `builders`, `composed`), `SolarTarget`, `SolarPressable`, `SolarOwnSize` and
  `SolarFill`, `SolarField`, `SolarMenuList` and `SolarMenuAnchor`, `showSolarDialog`,
  `showSolarDrawer` and an OverlayPortal for anchored surfaces, `SolarDashedDecoration`, and the
  button component themes. The Flutter check measures where a composed child's parent puts it, on
  the child's root, as the web check does.

### Tooling around the build

- **Overlay patterns and reason references** ([spec/overlay/README.md](../../spec/overlay/README.md)):
  a rule's layer may be a pattern, a `set`'s look `*`, and a reason another rule's.
- **The overlay audit**, `npm run solar:overlay:audit` (`src/report/overlay-audit.mjs`): what the
  overlays decide more than once, reasons written verbatim, literals a token now matches, and sets
  Figma now agrees with. Read-only, never part of the build.
- **The rule proposer.** `solar:explain … --propose <layer>.<cell>` (`src/explain/propose.mjs`):
  `bind`, `allowLiteral`, `follows` or `accept` from the finding, a `set` where none is open, one
  patterned rule for numbered siblings; its `TODO(reason)` fails the build until replaced.
- **The Node check.** Every CLI stops in one line on a Node older than `.nvmrc`
  (`src/util/require-node.mjs`), before anything loads.
- **Nothing written until everything is built.** `deferWrites` and `commitGenerated`
  (`src/util/write.mjs`) hold every output until every stage has emitted and the report is
  written, so a stage that throws rewrites nothing; each file is written beside itself and renamed
  over.
- **Two class name spaces.** `src/util/classes.mjs`: `Solar<Name>-<slot>` public,
  `Solar<Name>--<layer>` internal; `withLayerClasses` writes a layer named by a helper
  (`${P}-${layer}`) as its own, in the recipes and the shells.
- **The consumer's side.** The MUI theme holds both colour schemes in MUI's CSS-variables mode,
  switched by `data-theme` as the tokens are, with its breakpoints, spacing and motion from the
  tokens (`emit/mui.mjs`); `SolarProvider` in `@bwp-web/components` installs it;
  `npm run smoke:install` installs the packed packages in a clean app with React 18 and renders
  them on the server.

## Layout

```
bin/solar-codegen.mjs      the CLI: builds every stage, then emits, reports, prunes, formats
bin/solar-explain.mjs      why a component draws what it draws, cell by cell; writes nothing
bin/solar-triage.mjs       which components come next, and what each needs; writes nothing
src/stages/                one module per stage (tokens, icons, components): build(), emit()
src/shells/                the stories, the shells' check (index), how each platform reaches the
                           IR (api) and the icons a shell draws (icons)
src/components/            one descriptor per component, and in shared/ the MUI tables several
                           share (drawn, field, card, menu, picker, typed, slider, alert, target)
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
`spec/overlay/` is hand-written. The stories share their directory with hand-written files
(`solar.tsx`), so a stale story is found by its generated header instead and deleted the same way.

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
- **A component behaves wrong** → its shell, `packages/components/src/<Name>.tsx` or
  `solar_flutter/lib/src/components/solar_<name>.dart`, or the runtime helper it calls.
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
     needs them), its Flutter tables (`style` where its base takes a style object, `shared`,
     `states`), and its `api` table where a platform reaches a prop or slot by another name
     (`src/shells/api.mjs`: a member, `{ not }` for a negation, `{ group }`, or null). A component
     that draws its own layers has `slots: 'drawn'` (every IR layer, each with a class of its own)
     and `drawnResets`; the tables several components share are in `src/components/shared/`
     (`drawn`, `field`, `card`, `menu`, `picker`, `typed`, `slider`, `alert`, and `target`, the
     44 × 44 target that takes no room: `targetArea`, `targetInput`, and `TARGET`, SOLAR's
     `size.target.min`). A descriptor's `checkedAs`
     names the component a Figma component is the state of (Autocomplete Open, an open
     Autocomplete): it has a recipe, a case on each platform and a story, but no shells, and the
     barrels leave it out.
  2. Its overlay, `spec/overlay/<address>.yaml`.
  3. `npm run solar:codegen`, which writes its recipes (with its layer tree and slot names), its
     story, and every list the component is in, from the descriptors (`src/emit/registries.mjs`):
     both packages' barrels of shells (`packages/components/src/components.generated.ts`,
     `solar_flutter`'s `lib/src/components/components.dart`), the MUI theme's types
     (`components/src/theme.generated.ts`), the web case registry
     (`test/visual/cases/registry.generated.ts`), the Flutter one (`test/visual/cases/cases.dart`)
     and the variant builders' (`variants/lib/src/registry.dart`, and its library). It fails
     until both shells exist.
  4. Its two shells, by hand: start from the nearest component's (a drawn one from Counter's, a
     field from Text Input's, a card from Card's). A drawn shell hands the generated tree to the
     runtime helpers, `drawChildren` (`packages/components/src/internal/layers.tsx`) and
     `SolarLayers` (`solar_flutter`), whose options are the component's own: `text`, `icons`,
     `render`/`builders` (a layer drawn as an element of its own: SplitButton's halves),
     `composed` (another SOLAR component in a layer: Tag's StatusIndicator), `slots` (the caller's
     widget), `content` (the caller's children in place of Figma's examples), `repeat`/`repeats`
     (a layer the IR marks `repeat`, drawn once per item: the calendar's weekdays), `wraps`,
     `fields`, `truncates`, `clips`. A React shell reads its props through `useSolarProps`
     (`internal/theme.ts`), so an app themes it as it themes a stock MUI component. A Flutter
     control is disabled as Flutter's are (a null `onPressed` or `onChanged`, a field's
     `enabled`), pressed through `SolarPressable`, padded to its target by `SolarTarget`, and keeps
     its own size in a stretching parent through `SolarOwnSize`. `npx vitest run
test/component-parity.test.mjs` names whatever of the IR a shell does not reach yet.
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
`npm run solar:codegen` after touching this package and keep what it writes (the owner commits).

Generator code is ESM `.mjs` with no build step. Run the suites with `npx vitest run` from here
or from the repository root.
