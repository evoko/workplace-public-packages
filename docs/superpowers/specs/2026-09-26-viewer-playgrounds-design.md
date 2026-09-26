# Viewer playgrounds: design

**Status:** agreed with the owner on 2026-09-26; not yet planned or built. Grouping the viewers'
sidebars by Figma's sections is set aside for now.

## Why

Storybook and Widgetbook show every component in a Playground whose controls are only the IR's
axes and booleans, drawn through the visual-check cases: every slot is filled with a fixed probe,
and the component is never wired to state, so clicking a checkbox does nothing. Testers, designers
and developers want to try a component the way an app uses it: change its words and icons, show or
hide its parts, see how it grows and shrinks, and interact with it. Not every lever there could be,
but enough to play with. Both viewers get exactly the same improvements.

## What a tester gets

Each component's **Playground**, in Storybook and in Widgetbook alike. The **Variants** story or
use case is unchanged.

**Controls**, generated from the component's IR:

| IR                        | Control                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| an axis                   | a select of its values, at its default                                                                                                            |
| a boolean                 | a toggle, at its default                                                                                                                          |
| a colour the caller gives | a colour, at the variant's sample                                                                                                                 |
| a text slot               | a text field, at Figma's words (`label: Label`), or the extras table's sample words where Figma records none; clearing an optional one removes it |
| an icon slot              | `_none`, the builder's `_sample`, or any SOLAR icon, outline or solid (`chevron-right solid`), at what Figma shows (hidden → `_none`)             |
| a component slot          | a show/hide toggle (Figma's visibility), and a text field for the child's main words (`primaryButton label`)                                      |
| a content slot            | a show/hide toggle for a neutral placeholder                                                                                                      |
| every component           | **width**: auto, or a width for the box the component sits in                                                                                     |
| a component's own extra   | text, number, integer, boolean or select, at the extras table's default                                                                           |

A component slot names its child where the IR knows it (Button's `counter` is a Counter; a card's
call to action is the caller's, unnamed). Its words control is the child's main text slot, read
from the child's own IR (its `label` slot, or else its first text slot), at the child's default.
Where the child has no text slot (Counter's count is a number its shell takes) or the IR names no
child, the slot gets its toggle alone, and the extras table may give the component a control of its
own (Button's `counter count`).

The icons are every icon in `spec/icons.json`, in both styles.

A component's **own extra controls** hold the values the IR does not: a Text Input's typed
`value`, a Slider's `value`, a Select's or Dropdown's choice, a DatePicker's date, a TimePicker's
time, a Pagination's `page`, a Tree Item's or Accordion's expansion where the IR has none, and an
overlay's `open`. They live in one hand-written table in the generator,
`packages/codegen/src/playground/extras.mjs` (component → `{ name, kind, default, options?, min?,
max?, step? }`, with a comment per component saying why), which the derivation appends after the
width, so both viewers carry the same extras by construction (owner, 2026-09-26). An extra whose
name repeats an IR control's, or an entry for a component with no Playground, fails the build.

**Live and two-way.** The component works as it does in an app, and the controls follow it:
clicking a checkbox ticks it and flips `checked`; typing in a Text Input updates `value`; picking a
page moves `page`; changing a control changes the component. All four kinds are live:

- on/off: Checkbox, Toggle, Radio (in its group), Segmented Control, Tabs, Accordion, Expandable
  Card, Icon Button's `active`, selectable cards and rows, Tree Item;
- typing: Text Input, Text Area, Password, Number, PIN, Search, Token Input, Inline Input;
- choosing: Select, Dropdown, Autocomplete, DatePicker, TimePicker, Slider, Slider Range,
  Pagination, Page Navigator;
- opening: Dialog, Confirmation Dialog, Split Dialog, Drawer, Tooltip, Popover, Coachmark, Context
  Menu, Dropdown Menu, each with a small trigger button ("Open") and an `open` control.

A disabled component stays inert, as in an app.

**Around the component:** a **Reset** button above it, a SOLAR Button (tertiary, `sm`), returns
every control to its default; an **event log** below it, in a SOLAR text style, shows the last five
callbacks it fired (`onClick`, `onChange: true`, `onChange: "abc"`): the event's name, and its
detail in JSON unless the detail is null. Event names are each platform's own callback names (web
`onClick`, `onChange`; Flutter `onPressed`, `onChanged`), not unified (owner, 2026-09-26).
Storybook's Actions panel receives them too. The width box's spacing is SOLAR's spacing tokens.

## How it is built

### Control derivation, shared

`packages/codegen/src/playground/controls.mjs`: a pure function from a component's IR (and the IRs
it composes, for a child's words, and the icon names) to its control list:
`[{ name, kind, default, options? }]`, where `kind` is `select`, `boolean`, `color`, `text`,
`icon`, `child`, `childText`, `content` or `width`, or an extra's `text`, `number`, `integer`,
`boolean` or `select`, in a fixed order (the IR's API, then its slots in the IR's order, then
width, then the extras). A slot type or an axis it has no control for fails the build. It imports
nothing outside Node's `fs` and the generator's pure modules, so it runs where no npm packages are
installed. The fixed values both adapters use (the icon control's `_none`, `_sample` and ` solid`,
the widths, the log's length) are in one dependency-free module,
`packages/codegen/src/playground/values.mjs`.

- **Storybook** receives it through the `virtual:solar` module `.storybook/main.ts` serves
  (`PLAYGROUND`: the controls, the icon stems, each icon's `@bwp-web/assets` component, the fixed
  values).
- **Widgetbook** receives it as a generated, committed Dart file,
  `widgetbook/lib/playground/controls.dart` (`playgroundControls`), which `solar:codegen` writes
  from the IRs it has just built, beside `icons.dart` (the icon names, and each icon control value,
  `chevron-right` or `chevron-right solid`, to its vector); the app and its tests read it directly,
  so nothing depends on npm packages at build time. Each select there also carries `dartOptions`,
  its options as the Flutter enum emitter names them (`full-width` → `fullWidth`, `default` →
  `$default`), and the fixed values are constants (`playgroundIconNone`, `playgroundIconSample`,
  `playgroundIconSolid`, `playgroundWidths`, `playgroundLogLength`).

Both viewers draw the same controls from the same list.

### A builder per component and platform, hand-written

- Web: `packages/components/stories/playground/<slug>.tsx`, default export
  `{ render(p: Playground): ReactNode }`. `render` runs inside a component of its own (the
  adapter's `BuilderHost`), so a web builder may use hooks (in practice in a small component it
  returns, which the hooks lint accepts).
- Flutter: `packages/solar_flutter/widgetbook/lib/playground/<snake>.dart`, a top-level
  `SolarPlaygroundBuilder` with its `build`.

A builder declares no controls: its extras are the table's.

The interface a builder receives, the same on both platforms and independent of either viewer:

| Member                | Gives                                                                  |
| --------------------- | ---------------------------------------------------------------------- |
| `flag(name)`          | a boolean, a component slot's toggle or a content toggle               |
| `text(name)`          | a text control's words, `''` where it holds none                       |
| `words(name)`         | a text control's words, or nothing where empty (an optional text slot) |
| `whole(name)`         | a number or integer control as a whole number within its bounds        |
| `choice(name)`        | a select's value, one of its options                                   |
| `value(name)`         | a control's current value, for a kind no accessor covers (a colour)    |
| `set(name, value)`    | sets a control (the component's change reaches the panel)              |
| `log(event, detail?)` | adds a line to the event log (and Storybook's Actions)                 |
| `icon(slot)`          | the chosen SOLAR icon, as the platform's icon element, or nothing      |
| `child(slot)`         | `{ shown, text }` for a component slot                                 |

Every member throws for a name that is not one of the component's controls, and the accessors,
`icon` and `child` for a control of another kind. `set` checks the value against the control: a
boolean for a toggle, a string for words, a string or null for a colour, one of a select's options,
an integer within an integer's bounds. An unknown icon name gives nothing rather than failing.

A builder renders the real component from these, wires its callbacks to `set` and `log`, and
handles what is particular to it: a Radio in its group, an overlay's trigger, a Flutter label that
is a `String` or a widget, a disabled control's null callback. Example, web Checkbox:

```tsx
export default {
  render: (p) => (
    <Checkbox
      checked={p.flag('checked')}
      mixed={p.flag('mixed')}
      disabled={p.flag('disabled')}
      onChange={(_, checked) => {
        p.set('checked', checked);
        p.log('onChange', checked);
      }}
      slotProps={{ input: { 'aria-label': 'Option' } }}
    />
  ),
} satisfies PlaygroundBuilder;
```

`npm run solar:codegen` writes both registries from the component list (`src/emit/registries.mjs`),
so a component with no builder fails the typecheck or `flutter analyze`. Flutter cannot look an
icon up by name, so codegen also writes a Widgetbook-only map of icon names to `SolarVector`s
(`widgetbook/lib/playground/icons.dart`).

### One adapter per viewer, hand-written

Each turns the control list and a builder into the Playground:

- **Storybook** (`stories/playground/adapter.tsx`, over the viewer-free
  `stories/playground/core.tsx` the tests use too): the controls as argTypes (a number or integer
  with its `min`, `max` and `step`); `set` is `useArgs`' `updateArgs`, through a local copy of the
  args the builder reads, so a controlled input is not put back while the round trip runs (a value
  stays pending until the args carry it); Reset updates every arg to its default; the log is local
  state, and each call also goes to Storybook's `action()`.
- **Widgetbook** (`widgetbook/lib/playground/adapter.dart`): the controls as knobs; `set` writes
  the knob's value into the URL's knob query group,
  `WidgetbookState.of(context).updateQueryField(group: 'knobs', …)`, encoded as the knob's own
  field does (Widgetbook 3.25 has no `updateKnobValue`); Reset sets every knob to its default.

Both draw the width box, Reset and the log the same way. The visual-check cases and the variant
builders are untouched: the playground never changes what the checks measure.

## Tests

- **Control derivation** (`packages/codegen/test/playground-controls.test.mjs`): Button's `size`
  and `prio` selects, its booleans, `label` at `Label`, `iconLeading` and `iconTrailing` at
  `_none` with every icon among the options, `counter` as its toggle alone (its count is the
  builder's `counter count`); Banner's `primaryButton label` at Button's `Label`; a content slot's
  toggle; the width control; the same twice, in order.
- **Every builder renders** with the controls' defaults, through a fake of the interface: on the
  web a server render, in Flutter a widget test. On the web each builder also **reads every
  control** but the width: rendered at the defaults and with every toggle flipped, a recording
  Playground sees each control read.
- **The core** (`packages/components/test/playground-core.test.mjs`): each kind's argType, a
  child's words, the log's lines and length, an unknown name and a wrong kind thrown, the args'
  local copy.
- **Interaction, on both platforms**, one component of each kind: tap the Checkbox, type in the
  Text Input, pick a Pagination page, open the Dialog; each checks the component changed and `set`
  received the new value. Flutter: widget tests. Web: a Playwright test reusing the visual check's
  page setup (the unit tests only server-render), one builder per page (`#<slug>`); and every
  overlay (an `open` extra) opens from its trigger and closes on Escape without an error.
- **The registries**: a missing builder fails the typecheck or `flutter analyze`; both viewers keep
  building in CI.

## Docs, in the same change

- `docs/engineering/workflows.md`, "Add a component": a step to write its two playground builders.
- `packages/components/stories/README.md`, `packages/solar_flutter/widgetbook/README.md`: what the
  Playground offers and where the builders live.
- `packages/codegen/README.md`: `src/playground/controls.mjs`; the playground registries and icon
  map among the generated files.
- `docs/engineering/decisions.md`: two-way sync; every icon; a component slot as a toggle and its
  words; all four kinds of interaction live; width, event log and Reset; builders hand-written per
  component and platform, controls generated. Owner, 2026-09-26.

## Build order

The shared parts first (derivation, both adapters, the builder interface) with a handful of
builders that exercise every control kind and interaction kind (Button, Checkbox, Text Input,
Pagination, Dialog), then the rest family by family, each batch tested and reviewed. 128 components
on each platform, so 256 builders.

## Out of scope

- Grouping the sidebars by Figma's sections (set aside).
- A child component's own controls beyond its words (its size, priority).
- Recording a playground's state as a shareable preset.
