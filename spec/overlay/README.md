# Overlays: the reference

An overlay (`spec/overlay/<address>.yaml`, named from the component's address, Figma's name or
`<section>/<name>`: `inputs-day-cell.yaml`) holds the hand-written decisions about one SOLAR
component, applied over its IR by `npm run solar:codegen`. It is the only place design-to-code
judgement lives, so it is strict about three things:

- **Every rule has a `reason`**, a sentence a reviewer can check, which the IR records
  (`overlay.rules`) and `spec/deviations.md` and `npm run solar:explain` show beside the cell.
- **Every rule must apply to something the IR has.** A rule left behind by a Figma change (a layer
  renamed, an axis gone, a value Figma fixed) fails the build, naming the file and the rule.
- **Order does not matter.** Sections apply in one fixed order, the order below, and every
  address is spelled in Figma's axis names and values, with `rename` applied last.

The parser is `parseOverlay` in `packages/codegen/src/normalize/overlay.mjs`. To decide a
finding, start with `npm run solar:explain -- "<Name>" --variant … --layer … --property …`: it
names the cell, Figma's value, the recipe's, and the rule or finding behind the difference. To see
what the overlays decide more than once, `npm run solar:overlay:audit`.

## Addresses

A rule names what it decides:

- a **layer** by its IR name (`root`, `label`, `iconMore`, `dayGridDayCell7`), as
  `spec/components/<name>.json` lists them under `layers`; or by its **Figma path** (`/Container`,
  `/⌘K`) in the sections about layers themselves (`layerNames`, `places`, `same`);
- a **cell** as `<layer>.<cell>`: `root.width`, `label.color`, `icon.height`;
- an **entry** of the recipe as `<layer>.<section>.<keys…>.<cell>`, where the section is `base`,
  `size.<size>`, `appearance.<look>.<state>` or `combined.<size>.<look>.<state>`, and a look is
  Figma's axis values, comma-separated in the IR's order (Card's focus ring at rest:
  `root.appearance.status=none, loading=false.focus.shadow`);
- a **finding** by its token, as `spec/deviations.md` spells it:
  `component.status card.title.align@status=warning, state=disabled, ghost=false`.

### Patterns

A rule's layer may be a pattern, `*` standing for any letters and digits, in `follows`, `bind`,
`set`, `allowLiteral`, `controlDraws` and `caller`. It is expanded once against the IR's layer
names, before anything reads the rule; a pattern that matches no layer fails as a stale rule does,
and an address given in full wins over a pattern on the same cell.

```yaml
set:
  dayGridDayCell*.base.width:
    none: true
    reason: >-
      A day is a Date Picker Day Cell, whose 36px is its own: the grid lays it out and never sizes
      it.
```

A `set`'s look may be `*` too: every look Figma draws (each combination of the axes the
component's looks are keyed by, or `default` where no layer has a look), a look given in full
winning. One rule then gives a card its focus ring in every status:

```yaml
set:
  root.appearance.*.focus.shadow:
    token: shadow.focus.default
    reason: >-
      Figma draws Status Card no focus state; a pressable card, focused on its title, draws
      SOLAR's focus ring, as Card's does; the design review asks SOLAR to draw it.
```

### Reason references

A reason may be another rule's: `{ as: "<section> <address>" }`, the section and address as the
file writes them. It is resolved to that rule's sentence as the file is read, so the IR and the
reports still show a full sentence; one naming no rule, or a chain back to itself, fails.

```yaml
dayGridDayCell*.base.height:
  none: true
  reason: { as: set dayGridDayCell*.base.width }
```

An address with commas in it (a finding's variant, a look) is written in the block form, since a
comma ends a value in the braces:

```yaml
component.insight row.title.width@severity=info, state=hover, ghost=true:
  reason:
    as: accept component.insight row.title.width@severity=info, state=default, ghost=true
```

## The rules, in the order they apply

### `codeName`

The component's name in code, where Figma's is not one (a leading dot, a name two components
share). It is the name from the recipe on: its files, its classes and its findings' tokens. Figma's
name stays in the IR's `provenance.figmaName`, and the stage refuses two components generated
under one name.

A component is addressed `<section>/<name>` where two share a name (Figma's two `Day Cell`s,
`calendar/Day Cell` and `inputs/Day Cell`); a bare name is then an error naming both. Its overlay
is `spec/overlay/<address>.yaml` (`calendar-day-cell.yaml`), and its `codeName` gives each its
name in code (`Calendar Day Cell`, `Date Picker Day Cell`).

```yaml
codeName:
  name: Tree Indent
  reason: >-
    The leading dot is Figma's mark for a building block kept out of the assets panel (Tree Item
    nests it); in code the component is Tree Indent.
```

### `base`

The stock control each platform wraps (`mui: ButtonBase`, `flutter: FilledButton`), or none, and
why: most components are drawn from their layer tree (`slots: 'drawn'` in the descriptor), and
`base` says why no stock control fits.

### `drawing`

Every variant is its own drawing: every cell of every layer follows every axis (StatusIndicator,
each type a different mark). Use it only where no cell is shared across variants.

### `states`

`states.rename` respells a state value Figma spells otherwise, before the recipe, as `follows` is.
`states.compound` makes a state that is others held at once (DatePicker's `error-focused`,
`of: [error, focus]`): no prop, a state the shell detects, as a platform state. The MUI state table
gives it a selector (`&.SolarDatePicker-error:has(… .Mui-focused)`), `flutter.states` its test,
and the oracle reaches it by setting its prop parts and reaching its platform one.

```yaml
states:
  compound:
    error-focused:
      of: [error, focus]
      reason: …
```

### `rename`

An axis's name in code (`to`), and its values (`values`, each Figma value to one in code;
`true`/`false` make it a boolean, which no overlay uses today). List's `in-card` is `inCard`. An
axis may keep its name and respell its values alone (File Card's `type`: `File Card` → `file`,
`New Asset Tile` → `create`). Applied last; every other address still spells Figma's.

Which name to choose, and where a platform's own spelling goes (the descriptor's `api` table,
never here), is [architecture.md, rule 5](../../docs/engineering/architecture.md#two-libraries-one-contract).

### `follows`

A cell that follows other axes than its class says (geometry follows size, paint appearance and
state): Accordion's `root.direction` follows `expanded`. Use it where Figma's variant is right;
where it is a slip, `accept` the finding instead.

```yaml
follows:
  root.direction:
    axes: [expanded]
    reason: >-
      Collapsed, the item is its header, a row of its title and chevron; expanded, a column of its
      header over its content, as Figma draws each.
```

### `bind`

A raw value to the token of the same value (`literal`, `token`), or one per size (`tokens:
{ 16: icon.sm, 20: icon.md }`), each checked to equal its value. A token of another value fails (a
bind never redesigns), and so does a bind that would leave a raw value in the cell.

### `set`

One entry changed: to a `token`, to `none` (the cell is not drawn by this layer: a composed
child's own size, a stray fill), to a sizing `keyword` (`FILL`, `HUG`), or to a `literal`, a size
Figma draws but does not record (ConfirmationDialog's 400: Figma records its frame hugging, where
everything in it fills), which the cell's `allowLiteral` must allow as well, as any raw value. A
look is named by Figma's axes, before a `rename` (All-Day Bar's `style=solid, span=end`, which the
IR then calls `variant=solid, span=end`).

A composed child's `variant.*` takes a keyword of the child's own (Toast's Tag: `status`, where
Figma names a type Tag does not have); the oracle then checks the child in that variant, keeping
Figma's beside it as `figmaVariant`.

A `set` settles a raw-value finding once no raw value is left in the cell. It decides an axis
finding when it reaches every variant the finding names and each draws its value there (a raw value
counting as the token of its value). What Figma had is kept as `replaced`, and the oracle excuses
the value it changed (a shadow it removes) in exactly the variants that draw what it replaced, and
no others. Where several `set`s decide one finding (Text Input's width, the base's and sm's), each
variant's excuse names the rule that reaches it.

A `set` may add an entry the IR lacks:

- a state Figma draws as at rest (FAB's and Link's focus, given SOLAR's ring), under an appearance
  the IR has and for a state the component has;
- a focus or a hover Figma draws none of (Toggle's and Segmented Control Item's focus; Row's hover,
  which its description asks for), which then joins the component's states;
- a look the layer lacks and another layer has (Slider Range's root);
- a look no layer has, keyed by another look's axes at values Figma draws (File Card's file tile),
  or `default` where no layer has a look;
- a size the layer lacks (SearchField's icons, whose sm entry Figma's resting sm variant leaves as
  md's).

Anything else is refused as a stale rule. An added entry's `replaced` is the value the resting
lookup found there; the oracle excuses it in each state with no value of its own there. A
component with states and no appearance axis (BackButton, Link) keys them under `default` on both
platforms.

### `allowLiteral`

A raw value there is no token for, carried as Figma's number and raised as a governance gap
(`values` limits it to those values, where a `bind` takes the rest). The reason names the gap.

### `controlDraws`

The stock control draws this layer itself (Spinner's track and arc, drawn by CircularProgress;
ProgressBar's bar, moved by LinearProgress): its box and raw sizes are the control's, and the MUI
recipe declares nothing of its place or size. The oracle excuses its box and its roundness. `cells`
names the only cells the control decides (a slider's fill: `x` and `width`; its handle: `x`), and
the rest are drawn and checked.

### `shownBy`

A layer Figma hides in every variant, with no prop to show it, drawn where the caller fills a slot
(Segmented Control's `label`, by the `label` slot). The oracle treats it, and the slot's own layer,
as shown by a prop. The rule is refused where Figma shows the layer anywhere.

### `restyles`

A composed child the parent paints its own way (Toast's Tag on the toast's surface and edge; Card's
loading Tag, a placeholder): the recipe reads its `cells` (`background`, `borderColor`) from the
instance, and the MUI recipe writes them on the child's own root (`& > *` of its layer). The checks
compare them, and the child's box, against the parent's entry, and the rest against the child's
own oracle.

### `samples`

An axis whose values are samples of what the caller gives (Avatar's colours, Breadcrumbs' trail
lengths, a single-value axis such as Event Row's `density`): the API loses it, and the recipe
keeps the variants at the values in `keep`. `keep` must give one variant per combination of the
rest, or the build fails. Where it keeps a value other than Figma's default (Breadcrumbs' 5-item
trail), the variant the rest are read against is the kept one at every other axis's default. The
oracle keeps every variant, each reached with its sample as the caller's.

### `choice`

Layers Figma draws together that the caller picks one of: the API gains the prop, its values the
keys of `layers` (and `none`, where given), and the oracle checks each Figma variant once per value,
the layers not chosen expected undrawn. With `content`, a slot, the choice follows from whether the
caller fills it, and there is no prop (Launch Card's favourite, on its image or beside its name).

```yaml
choice:
  control:
    layers:
      checkbox: checkbox
      radio: radioButton
      toggle: toggle
    none: true
    reason: …
```

### `hides`

A composed child that draws the layers `not` lists, whatever names Figma records hidden in the
variant. Data without `hiddenPaths` records a hidden layer by name alone, and one child's hidden
layer may share a name with another's shown one (Device Card's Dropdown label and Tag words, both
`Label`). Data with `hiddenPaths` records each by path, which tells them apart: a name the data does
not record hidden fails as stale, and the rule is deleted.

### `defaults`

A prop's default in the API where Figma's default variant's is not the one a caller wants (Image
Card's `selected: false`).

### `caller`

A colour cell whose value is the caller's. `prop` names the colour prop that gives it, which the
API gains (`type: 'color'`; Avatar's background); `from` names the prop the shell derives it from
(Avatar's initials, from `color`). Where the caller gives none, the recipe's value is drawn. The
oracle reaches each variant with the colour Figma samples there as the prop, and excuses a `from`
cell, since it is the shell's rule, not Figma's sample.

### `accept`

A finding the code keeps its value for: Figma's difference is known and intended, or a slip the
design review lists. Addressed by the finding's token, or by a pattern (`component.bar chart.*`),
which decides every open finding it matches after the rules that name one: a chart library's sample
plot. A pattern that matches none fails.

```yaml
accept:
  component.status card.title.align@status=warning, state=disabled, ghost=false:
    reason: >-
      The disabled warning card packs its title row to the start, where every other variant spreads
      it: a slip in one of sixteen. The code spreads it in all; the design review lists it.
```

### `slots`

A layer the caller fills where Figma records no prop: `name` (the slot, and the layer's name from
then on) and `type` (`text`, `icon`, `component`, `content`, `instance`).

### `derive`

An axis that follows from what the caller gives, no prop (FAB's `type`, from whether it has a
label; Tag's, from its label, icon and close button): `when` lists each value with the slots
`given` and the shell `props` that make it, first match wins. Both shells must take the `props` a
`when` names (Tag's `indicator` and `onClose`).

The API loses the axis, but both emitters still key the recipe by it (the MUI recipe through
`Solar<Name>RecipeProps`, Flutter's props class through a field the widget sets), so the shell
passes what it derived. The oracle reaches each variant by filling the slots (its `content`).

A state value the IR makes a boolean prop may be derived too, `true` or `false` (a field's
`filled`, from its `value`; Token Input's `active`, from its draft): the oracle reaches its variant
by the content that makes it true, and every other by the content that makes it false.

### `layerNames`

A layer's IR name where Figma's gives none (Kbd's `/⌘K`, named after its sample; PIN Input's `|`,
a glyph), or two reduce to one (Tree Item's `Label` and `|Label`); either fails the build until
named here. Addressed by the Figma path. A slot's layer keeps its slot's name.

### `places`

Where a layer one variant adds sits among its siblings: data without a recorded `index` records
such a layer after the others (Card's loading title placeholder, `before: /Content`). Data with an
`index` records its place, and a rule that moves a layer to where it already is fails as stale.

### `repeats`

Sibling copies of one layer that Figma draws as a component's sample content, read as their first:
Date Picker Open's grids hold 35 copies of one Date Picker Day Cell (`/DayGrid/Day Cell`,
`/DayGrid/Day Cell#2`…) and its rows seven weekday texts, which the shell draws from its data, not
Figma's samples. The first stands for the copies, and the IR marks it `repeat: <count>`; the other
copies, and what they hold, are no layers, so the recipe, the oracle and the tree carry one of
each. The first is checked as Figma draws it, and what the copies drew differently (the selected
day among the disabled ones) is sample content, checked where it is the component's own (Date
Picker Day Cell's every state). The key names the first by its IR name, or firsts by a pattern:

```yaml
repeats:
  '*DayCell':
    reason: …
  '*Weekday':
    reason: …
```

Opt-in, never automatic (owner decision): siblings Figma means to be distinct look the same to a
rule that guesses. A rule that names a copy, or a layer with no copies, fails. A shell draws a
repeated text layer once per item with the runtime helpers' `repeat` (web) and `repeats` (Flutter);
a repeated layer whose children the caller gives (the day grid) takes them through `content`.

### `same`

A layer Figma draws anew in some variants that is really a sibling, read as that sibling (`as`):
Insight Card Small's `/Container`, the tile `/Icon` is elsewhere; Inline Input's Confirm and
Cancel, framed again in each edit state. Its path, and those inside it, take the other's before the
recipe and the oracle read them, so one layer stands where Figma drew several. A variant that has
both fails.

### `examples`

A layer, by Figma path, whose children are Figma's sample of what the caller puts there (Split
Dialog's panes, their title, words and Text Input; Drawer's content): none of them is a layer of
the component, in the IR, the oracle or the recipe, and the layer is the caller's slot of content.
A path no variant has, or one that holds nothing, fails.

```yaml
examples:
  /Body/right:
    reason: >-
      The right pane's words ("Supporting panel") are Figma's sample of what it holds: the caller's
      content replaces them.
```

### `tint`

An axis another component has, its values recolouring this one where Figma draws it in one of them
alone: Agenda Row and All-Day Bar take Event Chip's `category` (owner decision). `from`
names the component, `cell` the cell whose token each value draws there (`stripe.background`: red
is `color.data.category.01`), and `default` the value Figma draws here. The API gains the axis; the
recipe keeps Figma's tokens, and each value swaps the default's colour family for its own. Applied
once every IR is built (`normalize/tint.mjs`).

```yaml
tint:
  category:
    from: Event Chip
    cell: stripe.background
    default: blue
    reason: …
```

### `composes`

The component in code an instance of a Figma component is, where Figma's name is two components'
(Date Picker Open's `Day Cell` is a Date Picker Day Cell). The oracle checks the child against that
component's oracle.

## Beside the overlays

- **`defaults.yaml`** holds decisions for every component, each with a reason, applied by
  `applyDefaults` after each overlay and never over a cell the component's own `bind`, `set` or
  `allowLiteral` names. There are two:
  - `zero-insets`: an unbound `0` padding is `inset.none`;
  - `zero-gaps`: an unbound `0` gap is the none of its direction's family (`inset.none` across,
    `stack.none` down). A GRID's gap has no rule, and is left to its component.

  Each works in every layer, and decides the finding once every raw value Figma left in that cell
  is `0`, even one only a variant the recipe does not keep draws. Its decisions are recorded among
  the IR's rules with `from: spec/overlay/defaults.yaml`, and the deviations report names them. A
  default that matches nothing in one component is not an error. A repeated decision belongs here
  only where it holds for every component it would reach: the focus ring does not (the text fields
  draw theirs on the field, not the root), so each overlay that wants it says so in one patterned
  rule. Figma draws the ring itself on most controls, so few overlays need the rule.

- **`excluded.yaml`** names the components left out of the flow, with a reason (Cursor): the
  triage lists none as a candidate, and the build refuses a descriptor for one.

### Repeated, and not defaults

`npm run solar:overlay:audit` lists the decisions most overlays make. Besides the focus ring, four
lead it, and each stays one rule per overlay, for these reasons:

- **`set root.base.width = FILL`** (45 components) **and `set root.size.sm.width = FILL`** (11,
  the fields). A card, a row, a field or a panel spans what it is put in; Figma draws a sample
  width. A control does not: a Button, a Tag, a Checkbox hugs what it holds, and `defaults.yaml`
  cannot tell one from the other, since both are a root with a width Figma fixes. Where the width
  is the caller's is a decision about the component, made in its overlay.
- **`allowLiteral root.height = any`** **and `allowLiteral root.width = any`**. A size Figma
  leaves unbound: a control's height on SOLAR's control steps (32, 40, 48) binds
  `size.control.*` instead (Button, Icon Button, the fields, the tabs), and what is left is sizes on
  no step (FAB's 44 and 56, a Checkbox's 16, a row's 36), one question in the design review. A
  default would allow an unbound size in every component the next sync brings, where each should be
  looked at (Insight Row's fixed 64 is a height to hug, not a size to carry), so each overlay
  allows its own, and the audit counts them.

## Glossary

The overlays, the reasons and the READMEs share a vocabulary:

- **the caller's**: what the app using the component gives (its words, a colour, an Icon Button),
  as opposed to what the recipe draws.
- **as Figma draws it**: the code reproduces Figma's drawing, even where the description says
  otherwise; the difference goes to the design review.
- **a sample**: a value Figma draws to show the component (a width, a trail length, lorem words),
  not a design value; the code takes the caller's or fills its space.
- **its own**: a composed child's size or look is the child's recipe's, never the parent's; the
  parent places it (`set … none`).
- **hugs** and **fills**: Figma's `HUG` (as big as what it holds) and `FILL` (the room its parent
  leaves).
- **reaches**: a rule or an excuse applies to the variants it reaches, by its address.
- **excuses**: the oracle does not compare a cell a finding or a decision covers; the check reports
  it as a gap instead, and fails if an excuse is never reached.
- **a finding**: a disagreement the normalizer records between Figma's variants and the recipe it
  derives (`axis`, `unbound`, `sparse`, `covered`…), open until an overlay decides it.
- **a slip**: a finding that looks like an accident in Figma; decided by `accept`, and listed for
  the design team.
- **a governance gap**: a value SOLAR has no token for; carried by `allowLiteral` and raised with
  SOLAR, never invented.
