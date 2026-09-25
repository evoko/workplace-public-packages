# Overlays: the reference

An overlay (`spec/overlay/<component>.yaml`) holds the hand-written decisions about one SOLAR
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
share). Its file and classes take the new name.

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

`states.rename` respells a state value Figma spells otherwise; `states.compound` makes a state
that is others held at once (DatePicker's `error-focused`, `of: [error, focus]`): no prop, a state
the shell detects.

```yaml
states:
  compound:
    error-focused:
      of: [error, focus]
      reason: …
```

### `rename`

An axis's name in code (`to`), and its values (`values`, each Figma value to one in code;
`true`/`false` make it a boolean). An axis may keep its name and respell its values alone (File
Card's `type`: `File Card` → `file`, `New Asset Tile` → `create`). Applied last; every other
address still spells Figma's.

Which name to rename to follows one rule (docs/superpowers/specs/2026-09-25-two-libraries-one-contract.md,
rule 5; owner decision 2026-09-25): **SOLAR's word where SOLAR's description names the thing**
(`helper`, `mandatory`, `iconLeading`, which the fields' and Button's descriptions use), and
otherwise MUI's word on the web and Flutter's in Flutter, never one spelling forced on both. The
IR keeps one name; a platform's own spelling is its descriptor's `api` table, not a `rename`: a
Flutter field's `enabled` for the IR's `disabled` (`{ not: 'enabled' }`), a Flutter button's null
`onPressed`. One exception, decided 2026-09-25: Figma's `style` (Alert, Alert Small, Spinner) is
`variant` in code on both platforms, since `style` is React's inline-style prop and no component
can take it; the design review asks the designers to rename the property.

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
{ 16: icon.sm, 20: icon.md }`). A token of another value fails: a bind never redesigns.

### `set`

One entry changed: to a `token`, to `none` (the cell is not drawn by this layer: a composed
child's own size, a stray fill), or to a `keyword` (`FILL`, `HUG`, or a composed child's
`variant.*`). What Figma had is kept as `replaced`, and the oracle excuses the variants that draw
it. A `set` may add an entry the IR lacks: a state Figma draws as at rest (a focus ring), a look no
layer has where its axes are another look's and its values Figma's, `default` where no layer has
any, or a size.

### `allowLiteral`

A raw value there is no token for, carried as Figma's number and raised as a governance gap
(`values` limits it to those values, where a `bind` takes the rest). The reason names the gap.

### `controlDraws`

The stock control draws this layer itself (Spinner's ring, CircularProgress's arc): its box is the
control's, and the oracle excuses it; `cells` limits the excuse to those cells (a slider handle's
`x`).

### `shownBy`

A layer Figma hides in every variant, with no prop to show it, drawn where the caller fills a slot
(Segmented Control's `label`, by the `label` slot).

### `restyles`

A composed child the parent paints its own way (Toast's Tag on the toast's surface; Card's loading
Tag, a placeholder): its `cells` (`background`, `borderColor`) are read from the instance, and
checked there.

### `samples`

An axis whose values are samples of what the caller gives (Avatar's colours, Breadcrumbs' trail
lengths, a single-value axis such as Event Row's `density`): the API loses it, the recipe keeps
the values in `keep`, and the oracle still checks every variant with its sample as the caller's.

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

A composed child that draws these layers whatever names Figma records hidden in the variant:
Figma's record is by name alone in data fetched before 2026-09-25, and one child's hidden layer
may share a name with another's shown one (Device Card's Dropdown label and Tag words, both
`Label`). `not` lists the child's layers. Data fetched since records each hidden layer by path
(`hiddenPaths`), which tells them apart: a name the export no longer records hidden fails as
stale, and the rule is deleted.

### `defaults`

A prop's default in the API where Figma's default variant's is not the one a caller wants (Image
Card's `selected: false`).

### `caller`

A cell whose value is the caller's: `prop` names the colour prop it is (the API gains it), `from`
the prop it is derived from (Avatar's initials, from its colour).

### `accept`

A finding the code keeps its value for: Figma's difference is known and intended, or a slip the
design review lists. Addressed by the finding's token.

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

An axis that follows from what the caller gives, no prop (Tag's `type`, from its label, icon and
close button): `when` lists each value with the slots `given` and the shell `props` that make it,
first match wins.

### `layerNames`

A layer's IR name where Figma's gives none (Kbd's `/⌘K`, named after its sample), or two reduce
to one. Addressed by the Figma path.

### `places`

Where a layer one variant adds sits among its siblings: data fetched before 2026-09-25 records such
a layer after the others (Card's loading title placeholder, `before: /Content`). Data fetched
since records its place (the added layer's `index`), and a rule that moves a layer to where it
already is fails as stale.

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

Opt-in, never automatic (owner decision 2026-09-25, the pipeline review's item 1): siblings Figma
means to be distinct look the same to a rule that guesses. A rule that names a copy, or a layer
with no copies, fails. A shell draws a repeated text layer once per item with the runtime helpers'
`repeat` (web) and `repeats` (Flutter); a repeated layer whose children the caller gives (the day
grid) takes them through `content`.

### `same`

A layer Figma draws anew in some variants that is another: read as `as` (Insight Card Small's
`/Container`, the tile `/Icon` is elsewhere). A variant that has both fails.

### `composes`

The component in code an instance of a Figma component is, where Figma's name is two components'
(Date Picker Open's `Day Cell` is a Date Picker Day Cell).

## Beside the overlays

- **`defaults.yaml`** holds decisions for every component, applied after each overlay and never
  over a cell an overlay rules on: today, an unbound `0` padding is `inset.none`, and an unbound
  `0` gap the none of its direction's family (`inset.none` across, `stack.none` down). A default
  that matches nothing in one component is not an error. A repeated decision belongs here only
  where it holds for every component it would reach: the focus ring does not (the text fields draw
  theirs on the field, not the root), so each overlay that wants it says so in one patterned rule.
  Since 2026-09-25 Figma draws the ring itself on most controls, and fewer overlays need the rule.
- **`excluded.yaml`** names the components left out of the flow, with a reason (Cursor): the
  triage skips them and the build refuses them.

### Repeated, and not defaults

`npm run solar:overlay:audit` lists the decisions most overlays make. Besides the focus ring, four
lead it, and each stays one rule per overlay, for these reasons:

- **`set root.base.width = FILL`** (45 components) **and `set root.size.sm.width = FILL`** (11,
  the fields). A card, a row, a field or a panel spans what it is put in; Figma draws a sample
  width. A control does not: a Button, a Tag, a Checkbox hugs what it holds, and `defaults.yaml`
  cannot tell one from the other, since both are a root with a width Figma fixes. Where the width
  is the caller's is a decision about the component, made in its overlay.
- **`allowLiteral root.height = any`** **and `allowLiteral root.width = any`**. A size Figma
  leaves unbound: since 2026-09-25 a control's height on SOLAR's control steps (32, 40, 48) binds
  `size.control.*` instead (Button, Icon Button, the fields, the tabs), and what is left is sizes on
  no step (FAB's 44 and 56, a Checkbox's 16, a row's 36), one question in the design review. A
  default would allow an unbound size in every component the next sync brings, where each should be
  looked at (Insight Row's fixed 64 was a height to hug, not a size to carry), so each overlay
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
