# @bwp-web/components

SOLAR components for React, built on MUI: Button, Icon Button, Button Group, FAB, BackButton,
SplitButton, Link and Spinner, the display primitives (StatusIndicator, Counter, Kbd, Timestamp,
Avatar, Trend Badge, Divider, Skeleton, ProgressBar, Node End, RowExpand and Tree Indent), and the
selection controls (Checkbox, Radio, Toggle, Slider, Slider Range, DragHandle, Segmented Control
and its Item), the tags and messages (Tag, Alert, Alert Small, Banner, Toast and EmptyState),
the text fields (Text Input, Text Area, SearchField, GlobalSearch, Password Input, Number
Input, Inline Input, Token Input, PIN Input and FileUpload), and the menus and lists (Dropdown
Item, Dropdown Group Label, Dropdown Menu, Context Menu Item, Context Menu, Option Row, Options
List, ListItem and List), the pickers (Select, Dropdown, Autocomplete, DatePicker, Date Picker Open
and its Day Cell, TimePicker and TimePicker Dropdown), navigation (Tabs and Tab Item, Nav Item,
Section Nav Item and Group Header, Breadcrumbs and Breadcrumb Item, Tree Item), and paging and steps
(Pagination and its Item, Nav and Ellipsis, Page Navigator and its Button, Stepper, Step and Stepper
Indicator) so far.

## Getting started

```tsx
import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { Button, SolarProvider } from '@bwp-web/components';

export function App() {
  return (
    <SolarProvider>
      <Button prio="secondary">Continue</Button>
    </SolarProvider>
  );
}
```

That is the whole setup. For Dark, set `data-theme="dark"` on any element, the page's root or one
panel: the SOLAR components and every stock MUI component under it switch together.

**Requires** React 18 or newer and MUI 9 (`@mui/material` with its Emotion peers), which the app
provides; neither is bundled. The components look right without `SolarProvider`; it installs the
SOLAR MUI theme, so the stock MUI components beside them match, and takes the app's own theme
options (`<SolarProvider theme={…}>`), merged over SOLAR's. Apps that want only the tokens, or
Tailwind, use `@bwp-web/styles` alone.

## Theming

A SOLAR component reads its props through the app's MUI theme, as MUI's own do:
`components.SolarButton.defaultProps` fill what the caller leaves unset, and
`components.SolarButton.styleOverrides.root` styles its root over the recipe, under the caller's own
`sx`. The keys are typed (`Solar<Name>`, from each component's props), so the theme options
typecheck.

```tsx
<SolarProvider
  theme={{
    components: {
      SolarButton: { defaultProps: { size: 'sm' } },
      SolarCard: { styleOverrides: { root: { maxWidth: 480 } } },
    },
  }}
>
```

## Styling hooks

Style a component through its root, with `className`, `style` or `sx`, which every component
passes to its outer element. Inside it, the stable hooks are:

- `Solar<Name>-<slot>`, on each part the caller fills, by its slot's name, which is the prop's:
  `SolarTag-label`, `SolarCard-title`, `SolarTextInput-helper`;
- `Solar<Name>-<state>`, where a component marks a state itself: `SolarTextInput-error`,
  `SolarSplitButton-loading`.

Every other class is internal, and may change when SOLAR's Figma file does: `Solar<Name>--<layer>`
(two dashes), named after a Figma layer (`SolarTag--iconClose`), and the drawing's own markers
(`Solar<Name>-box`, `-text`, `-glyph`, `-drawnIcon`). The codegen writes the two name spaces
(`packages/codegen/src/util/classes.mjs`), and a test fails if a Figma layer's name is ever a
public class.

## Button

| Prop                          | Values                                | Default   |
| ----------------------------- | ------------------------------------- | --------- |
| `prio`                        | `primary` · `secondary` · `tertiary`  | `primary` |
| `size`                        | `md` · `sm` · `lg`                    | `md`      |
| `danger`                      | boolean, for destructive actions only | `false`   |
| `disabled`, `loading`         | boolean                               | `false`   |
| `iconLeading`, `iconTrailing` | an icon, e.g. from `@bwp-web/assets`  |           |
| `counter`                     | a count shown after the label         |           |

Hover, pressed and focus are not props: MUI tracks them, and the recipe styles each. While loading
the label is hidden but keeps its room, and the SOLAR Spinner shows in the variant Figma picks
(inverse on primary); a button both disabled and loading is disabled. Every other MUI Button prop
passes through, and `sx` applies on top of the recipe. An icon-only button needs an
`aria-label`; in development the component warns when one is missing.

`sm` is drawn 32px tall and `md` 40px, below the 44px WCAG touch target, and its hit area is
padded to 44 × 44 in code, as SOLAR's description asks: an invisible target around the drawn button,
which takes no room. Every control here has one. SOLAR publishes no variable for the target size, so
44 is the one raw value for it, in the codegen's `src/components/shared/target.mjs`, until SOLAR does (the
first question in [the design review](../../docs/solar-review-for-design.md)).

## Icon Button

```tsx
<IconButton icon={<IconDelete />} aria-label="Delete" prio="secondary" />
```

| Prop                  | Values                               | Default   |
| --------------------- | ------------------------------------ | --------- |
| `icon`                | the icon, required                   |           |
| `aria-label`          | the accessible name, required        |           |
| `prio`                | `primary` · `secondary` · `tertiary` | `primary` |
| `size`                | `sm` · `md` · `lg` (32, 40, 48px)    | `sm`      |
| `shape`               | `square` · `round`                   | `square`  |
| `disabled`, `loading` | boolean                              | `false`   |

MUI's IconButton, restyled by the recipe. An icon alone is not a name, so the types require an
`aria-label` or an `aria-labelledby` (and in development it warns without one, for JavaScript
callers). The icon fills a box the recipe sizes from the icon ladder. While loading, the icon gives
way to the Spinner Figma picks for the variant; disabled wins over loading. Figma draws some
variants inconsistently with Button (primary's border, a focus ring on press, disabled borders);
they are drawn as Figma draws them and listed in [the design review](../../docs/solar-review-for-design.md),
section 8. Its hit area is padded to 44 × 44, as Button's is.

## Button Group

```tsx
<ButtonGroup type="full-width">
  <Button prio="secondary" size="lg">
    Cancel
  </Button>
  <Button size="lg">Save</Button>
</ButtonGroup>
```

| Prop          | Values                                                   | Default      |
| ------------- | -------------------------------------------------------- | ------------ |
| `orientation` | `horizontal` · `vertical`                                | `horizontal` |
| `type`        | `regular` · `full-width`: a flush bar with a top divider | `regular`    |
| `children`    | two to five Buttons, of one size                         |              |

A box of the caller's Buttons, which it never changes: each fills an equal share of a row, or the
width of a column, and keeps its own height. Figma draws no vertical full-width group, so the types
refuse `orientation="vertical"` with `type="full-width"` (`ButtonGroupLayout`). In development it warns when
its buttons mix sizes. Figma's description also asks for one priority, but every group it draws
mixes secondary and primary, so that is not checked; the design review lists the disagreement.

## FAB

| Prop       | Values            | Default  |
| ---------- | ----------------- | -------- |
| `size`     | `sm` · `md`       | `sm`     |
| `disabled` | boolean           | `false`  |
| `loading`  | boolean           | `false`  |
| `icon`     | the action's icon | required |
| `children` | the label         | none     |

The screen's one most important action, on MUI's Button (MUI's Fab has no loading state). It is
extended when it has a label and an icon alone otherwise, which then needs an `aria-label`: Figma's
`type` follows from the label. Loading keeps its size. SOLAR's focus ring is drawn, where Figma
draws none. Where it floats is the app's.

## BackButton

| Prop       | Values                           | Default |
| ---------- | -------------------------------- | ------- |
| `size`     | `sm` · `md`                      | `md`    |
| `disabled` | boolean                          | `false` |
| `loading`  | boolean                          | `false` |
| `children` | where it goes back to, or `null` | `Back`  |

A tertiary button with SOLAR's ArrowLeft, one per view, top left. `null` shows the arrow alone,
named "Back"; `href` makes it a link.

## SplitButton

| Prop         | Values                  | Default        |
| ------------ | ----------------------- | -------------- |
| `prio`       | `primary` · `secondary` | `primary`      |
| `size`       | `sm` · `md`             | `md`           |
| `disabled`   | boolean                 | `false`        |
| `loading`    | boolean                 | `false`        |
| `children`   | the action's label      | required       |
| `onClick`    | the action              | none           |
| `items`      | the action's variants   | none           |
| `onMenuOpen` | opens the menu          | none           |
| `menuOpen`   | boolean                 | `false`        |
| `menuLabel`  | the chevron's name      | `More options` |

The dominant action and a chevron that opens a menu of its variants: two buttons in one joined
control, drawn from its layers. The whole control takes the states of whichever half is hovered,
pressed or focused, as Figma draws them. The chevron says it opens a menu (`aria-haspopup`,
`aria-expanded`), and Alt+Down on the action opens it too. Given `items`, it opens them in a
Dropdown Menu of its own; without them, the menu is the caller's (`onMenuOpen`, `menuOpen`).

## Link

| Prop           | Values             | Default  |
| -------------- | ------------------ | -------- |
| `size`         | `xs` · `sm` · `md` | `md`     |
| `disabled`     | boolean            | `false`  |
| `children`     | the words          | required |
| `leadingIcon`  | an icon: internal  | none     |
| `trailingIcon` | an icon: outbound  | none     |

MUI's Link, an `<a>`, in the `link/*` text styles, underlined on hover, with SOLAR's focus ring. A
disabled link loses its `href` and says it is disabled. For navigation; an action is a Button.

## Spinner

| Prop      | Values                | Default   |
| --------- | --------------------- | --------- |
| `size`    | `sm` · `md` · `lg`    | `sm`      |
| `variant` | `default` · `inverse` | `default` |

MUI's CircularProgress with its track, restyled by the recipe; the motion is MUI's, since SOLAR has
no token for a spinner's rotation. Figma calls `variant` `style`, which is React's inline-style prop,
so the web cannot take it; the one exception to SOLAR's words, raised with the designers (the
design review asks Figma to rename it).
Give it an `aria-label` saying what is loading.

## StatusIndicator

| Prop    | Values                                                                     | Default   |
| ------- | -------------------------------------------------------------------------- | --------- |
| `type`  | `success` · `info` · `warning` · `danger` · `neutral` · `help` · `private` | `success` |
| `size`  | `md` · `sm` · `xs`                                                         | `md`      |
| `label` | a string                                                                   | none      |

A drawn mark: each type is Figma's own drawing, a disc or a triangle with its mark, and `xs` is the
dot alone. The shell walks Figma's layer tree and draws each layer as a glyph (an SVG of Figma's
outline, filled in the recipe's colours) or as a box, where the recipe places it. Decorative, and
hidden from assistive technology, unless given a `label`, which it then announces as an image; say
the status in words beside a decorative one.

The display primitives below draw Figma's layer tree themselves, from the recipe
(`src/internal/layers.tsx`): a glyph as Figma's outline, a SOLAR icon, a text, or a box, each with
a class of its own and placed where the recipe says. Only Avatar, Skeleton and ProgressBar wrap an
MUI control.

## Counter

| Prop       | Values                                     | Default   |
| ---------- | ------------------------------------------ | --------- |
| `type`     | `regular` · `danger` · `inverted` · `idle` | `regular` |
| `disabled` | boolean                                    | `false`   |
| `count`    | a number                                   | required  |
| `max`      | a number                                   | `99`      |

A count on a pill. At 0 or below it draws nothing, and above `max` it reads `99+`, as SOLAR asks.
It takes the states of the control it sits in, so in a Button's `counter` slot it follows the
Button's hover, press and disabled colours, as Figma draws it; given `onClick`, it is a `<button>`
of its own.

## Kbd

| Prop       | Values                   | Default   |
| ---------- | ------------------------ | --------- |
| `type`     | `default` · `top-search` | `default` |
| `children` | the key's label          | required  |

A key cap, drawn as `<kbd>`. One key per Kbd: a chord is several, with a separator between them.

## Timestamp

| Prop       | Values                               | Default    |
| ---------- | ------------------------------------ | ---------- |
| `format`   | `relative` · `absolute` · `combined` | `relative` |
| `size`     | `sm` · `md`                          | `sm`       |
| `emphasis` | `default` · `subtle`                 | `default`  |
| `dateTime` | a `Date` or an ISO string            | required   |
| `children` | the words                            | required   |
| `detail`   | the absolute time, for `combined`    | none       |

A time in words, drawn as `<time datetime>`. The words are the app's, formatted in the user's
locale and timezone (owner decision, 2026-09-24): `format` says which they are and changes nothing
drawn. For `combined`, `detail` is shown on hover.

## Avatar

| Prop        | Values                             | Default     |
| ----------- | ---------------------------------- | ----------- |
| `size`      | `lg` · `md` · `sm` · `xs`          | `lg`        |
| `type`      | `text` · `photo` · `logo`          | `text`      |
| `color`     | any CSS colour                     | none        |
| `name`      | who or what it is                  | required    |
| `children`  | the initials                       | from `name` |
| `textColor` | any CSS colour                     | derived     |
| `src`       | the photo or logo, for those types | none        |

MUI's Avatar. Its colour is the caller's, any colour (design team, 2026-09-24): seed it from a
stable hash of the person's ID, never at random. The initials take that colour's hue at a lightness
that reads at WCAG AA (`src/internal/ink.ts`, owner decision 2026-09-24), unless `textColor` gives
theirs; a colour the rule cannot read (a `var()`) needs one. With no colour it is SOLAR's neutral
avatar. A photo fills the circle; a logo sits whole in a rounded square. Always named by `name`.

## Trend Badge

| Prop    | Values                            | Default   |
| ------- | --------------------------------- | --------- |
| `type`  | `incline` · `decline` · `neutral` | `incline` |
| `size`  | `md` · `sm` · `xs`                | `md`      |
| `label` | a string                          | none      |

An arrow or a dash on a disc, and a dot alone at `xs`, drawn as StatusIndicator is. Decorative
unless given a `label`.

## Divider

| Prop          | Values                          | Default      |
| ------------- | ------------------------------- | ------------ |
| `orientation` | `horizontal` · `vertical`       | `horizontal` |
| `type`        | `full` · `inset` · `with-label` | `full`       |
| `children`    | the label, for `with-label`     | none         |

A 1px rule, an inset one, or a label between two rules; a separator to a screen reader. It fills
what it separates: a horizontal one the width it is given, a vertical one the height. Drawn from
its layers rather than MUI's Divider, which draws its rules as a border and pseudo-elements.

## Skeleton

| Prop              | Values                            | Default |
| ----------------- | --------------------------------- | ------- |
| `type`            | `text` · `circle` · `rectangular` | `text`  |
| `size`            | `sm` · `md` · `lg`                | `sm`    |
| `width`, `height` | the real content's size           | Figma's |

MUI's Skeleton, always its rectangular variant (its text variant scales the box to 60%), with MUI's
pulse, removed where motion is reduced. Decorative: mark the loading region `aria-busy`.

## ProgressBar

| Prop       | Values                                                | Default   |
| ---------- | ----------------------------------------------------- | --------- |
| `feedback` | `neutral` · `info` · `success` · `warning` · `danger` | `neutral` |
| `value`    | 0 to 100                                              | required  |

MUI's determinate LinearProgress, which fills its container. Name it (`aria-label`) and say the
number beside it.

## Node End, RowExpand and Tree Indent

Building blocks, decorative: Node End is the dot at the end of a Coachmark's connector (`halo`);
RowExpand an expandable table row's chevron or connector (`type`); Tree Indent a tree row's indent,
16px per level (`depth`, `00` to `10`; Figma's `.Tree Indent`). The rows and trees that use them
carry the semantics.

## Checkbox

| Prop             | Values  | Default |
| ---------------- | ------- | ------- |
| `checked`        | boolean | `false` |
| `mixed`          | boolean | `false` |
| `disabled`       | boolean | `false` |
| `defaultChecked` | boolean | none    |
| `onChange`       | MUI's   | none    |

One choice of many, committed on click: MUI's Checkbox, a native input, with Figma's box, tick and
dash drawn inside it. `mixed` draws the dash, for a parent whose children are partly checked, and
is announced so. Name it with a `<label>` (which toggles it) or an `aria-label`. The box is 16px,
its native input the 44 × 44 target around it.

## Radio

| Prop       | Values                   | Default |
| ---------- | ------------------------ | ------- |
| `value`    | what it stands for       | none    |
| `checked`  | boolean, outside a group | none    |
| `disabled` | boolean                  | `false` |

One choice of a group of two to five: put them in MUI's RadioGroup, which checks the one whose
`value` is its own, names them all, and lets the arrow keys move between them. MUI's Radio, a
native input, with Figma's ring and dot drawn inside. A radio alone is a bug, SOLAR says.

## Toggle

| Prop              | Values                      | Default |
| ----------------- | --------------------------- | ------- |
| `selected`        | boolean                     | `false` |
| `disabled`        | boolean                     | `false` |
| `defaultSelected` | boolean                     | none    |
| `onChange`        | `(event, selected) => void` | none    |

A setting that takes effect at once, on MUI's Switch, a native input announced as a switch, its
root drawn as Figma's track and the recipe's thumb in its thumb slot. SOLAR's focus ring is drawn,
where Figma draws none.

## Slider and Slider Range

| Prop               | Values                      | Default |
| ------------------ | --------------------------- | ------- |
| `disabled`         | boolean                     | `false` |
| `filled` · `error` | boolean (Slider)            | `false` |
| `value`            | a number, or a pair (Range) | none    |
| `onChange`         | MUI's                       | none    |

MUI's Slider, on 0 to 100 by default, which drags, takes the arrow keys and is announced as a
slider: name it with `aria-label`, or each thumb of a range with `getAriaLabel`. It fills its
container. `filled` and `error` are drawn as at rest, as Figma draws them, until SOLAR draws them
otherwise (`error` is announced). Show a range's two values beside it.

## DragHandle

| Prop         | Values      | Default   |
| ------------ | ----------- | --------- |
| `size`       | `sm` · `md` | `sm`      |
| `disabled`   | boolean     | `false`   |
| `aria-label` | what moves  | `Reorder` |

A grip of six dots that marks a row or card as one to reorder: focusable, announced as a drag
handle, and drawn pressed while held (or while the caller's drag sets `aria-pressed`). It does
nothing itself: spread the drag and drop library's handle props over it, and give the list the
keyboard's Space to lift, arrows to move, Space to drop.

## Segmented Control and Segmented Control Item

| Prop (Control) | Values                     | Default  |
| -------------- | -------------------------- | -------- |
| `size`         | `md` · `sm`                | `md`     |
| `value`        | the chosen segment's value | required |
| `onChange`     | `(event, value) => void`   | required |
| `label`        | names the group            | none     |
| `mandatory`    | stars the label            | `false`  |
| `helper`       | more, below it             | none     |
| `children`     | two to five Items          | required |

| Prop (Item)                    | Values             | Default  |
| ------------------------------ | ------------------ | -------- |
| `value`                        | what it stands for | required |
| `size`                         | `md` · `sm`        | `md`     |
| `children`                     | the words          | required |
| `iconLeading` · `iconTrailing` | an icon            | none     |

A radio group of two to five choices, one always chosen: each segment is a `<label>` around a
native radio input of the group's name, so the arrow keys move between them and a form sends the
value. Give the Items the Control's size. The label shows where given, though Figma hides it; SOLAR's
focus ring is drawn on a segment, where Figma draws none. For six or more choices, or navigation,
use Tabs; for on and off, a Toggle.

## Tag

| Prop        | Values                                                | Default   |
| ----------- | ----------------------------------------------------- | --------- |
| `status`    | `success` · `neutral` · `warning` · `danger` · `info` | `success` |
| `invert`    | boolean                                               | `false`   |
| `indicator` | shows the status dot (not when inverted)              | `false`   |
| `icon`      | an icon, before the words or alone                    | none      |
| `onClose`   | shows a close button                                  | none      |
| `children`  | the words, one to three                               | none      |

A compact label, drawn from its layers. Figma's five types follow from what it is given: the
dot, a close button (named "Remove" and the words), an icon before the words, an icon alone
(which then needs an `aria-label`), or the words alone. The types refuse an inverted tag with a
dot, which Figma does not draw.

## Alert and Alert Small

| Prop          | Values                                                | Default   |
| ------------- | ----------------------------------------------------- | --------- |
| `type`        | `default` · `info` · `success` · `warning` · `danger` | `success` |
| `variant`     | `filled` · `outlined` (Figma's `style`)               | `filled`  |
| `title`       | what happened                                         | none      |
| `description` | what it means                                         | none      |
| `action`      | the one action's words, which call `onAction`         | none      |

A callout in the page, beside the StatusIndicator of its type; Alert Small is the compact one for
cards and panels. Each part shows where it is given. It is announced as it appears
(`role="alert"` for a warning or a danger, `status` otherwise). It fills its container.

## Banner

| Prop                                | Values                                                | Default   |
| ----------------------------------- | ----------------------------------------------------- | --------- |
| `type`                              | `neutral` · `info` · `success` · `warning` · `danger` | `neutral` |
| `description`                       | the message, one line                                 | required  |
| `primaryButton` · `secondaryButton` | a SOLAR Button at sm                                  | none      |
| `action`                            | the text action's words, which call `onAction`        | none      |
| `onClose`                           | shows a close button, named "Dismiss"                 | none      |

A bold, full-width message for a page or the app, with SOLAR's icon for its type, cut short where
it runs out of room. Offer at most one action, a Button or the text one.

## Toast

| Prop      | Values                                                | Default   |
| --------- | ----------------------------------------------------- | --------- |
| `status`  | `neutral` · `success` · `warning` · `danger` · `info` | `success` |
| `message` | what happened                                         | required  |
| `tag`     | what it is about, in a Tag                            | none      |
| `action`  | the action's words ("Undo"), which call `onAction`    | none      |
| `chevron` | a chevron after the action                            | `false`   |

A passing message about something done in the background, never an error that needs a decision.
Its Tag is a SOLAR Tag drawn on the toast's surface and edge, as Figma draws it. Where it appears
and for how long is the app's: show it in MUI's Snackbar.

## EmptyState

| Prop          | Values                          | Default |
| ------------- | ------------------------------- | ------- |
| `icon`        | what is empty                   | none    |
| `title`       | why it is empty                 | none    |
| `description` | what to do next                 | none    |
| `action`      | a SOLAR Button, secondary at sm | none    |

A placeholder for a view with nothing to show, a centred stack whose words wrap. For something
still loading, use a Skeleton or a Spinner.

## Text Input

| Prop                           | Values                                           | Default |
| ------------------------------ | ------------------------------------------------ | ------- |
| `size`                         | `md` · `sm`                                      | `md`    |
| `disabled`                     | boolean                                          | `false` |
| `error`                        | boolean                                          | `false` |
| `label`                        | what it asks for, above it                       | none    |
| `mandatory`                    | stars the label, and makes the input required    | `false` |
| `helper`                       | more, below it; in `error`, what is wrong        | none    |
| `leadingIcon` · `trailingIcon` | an icon, or after the words a small IconButton   | none    |
| every InputBase prop           | `value` · `defaultValue` · `onChange` · `type` … | —       |

Single-line text. The field is MUI's InputBase, so its native input takes the value, autofill, the
caret and an `inputComponent`; the label is a `<label>` for it and the helper describes it, by id.
It is drawn filled where it holds a value, controlled or not, and focused while the input has the
focus (Figma's `pressed`). It fills its container, and its field has a 44 × 44 target under its
words. A placeholder never replaces the label; validate on blur.

## Text Area

| Prop                 | Values                                            | Default |
| -------------------- | ------------------------------------------------- | ------- |
| `size`               | `md` · `sm`                                       | `md`    |
| `disabled` · `error` | boolean                                           | `false` |
| `label` · `helper`   | as Text Input's                                   | none    |
| `mandatory`          | stars the label, and makes the textarea required  | `false` |
| `charCount`          | counts the characters, against `maxLength`        | `false` |
| `maxLength`          | the most characters it takes                      | none    |
| `cta` · `attachment` | an IconButton at sm, in the bottom right and left | none    |
| every InputBase prop | `value` · `defaultValue` · `onChange` …           | —       |

Text of many lines, in a field of Figma's height whose words scroll within it. Its buttons are the
caller's, pinned in the field's bottom corners: Figma places them 8px in from the edges, which they
keep however wide the field is. It is drawn filled where it holds a value. One focus ring is drawn,
the field's, where Figma draws a second around the whole component.

## SearchField

| Prop                 | Values                                          | Default |
| -------------------- | ----------------------------------------------- | ------- |
| `size`               | `md` · `sm`                                     | `md`    |
| `disabled` · `error` | boolean                                         | `false` |
| `filter`             | after the query: an IconButton (filters, clear) | none    |
| every InputBase prop | `value` · `defaultValue` · `onChange` …         | —       |

A search of the list or table beside it: SOLAR's search icon, a native search input named
"Search" unless its `inputProps` say more, and the caller's filter. Drawn filled where it holds a
query. Debounce the filtering, and announce the count of results.

## GlobalSearch

| Prop          | Values                                    | Default  |
| ------------- | ----------------------------------------- | -------- |
| `size`        | `md` · `sm`                               | `md`     |
| `error`       | boolean                                   | `false`  |
| `placeholder` | what it searches                          | `Search` |
| `query`       | the query the app's search holds (filled) | none     |
| `shortcut`    | the key that opens it, in a Kbd ("⌘K")    | none     |
| `onClick`     | opens the app's search overlay            | —        |

A trigger drawn as a field, not a field (owner decision): a button, named by its words, that opens
the app's search. Binding its shortcut is the app's.

## Password Input

| Prop                             | Values                                     | Default            |
| -------------------------------- | ------------------------------------------ | ------------------ |
| `size` · `disabled` · `error`    | as Text Input's                            |                    |
| `label` · `mandatory` · `helper` | as Text Input's                            |                    |
| `forgotPassword`                 | a link to the reset flow, below the helper | none               |
| `autoComplete`                   | `current-password` · `new-password`        | `current-password` |
| every InputBase prop but `type`  | `value` · `onChange` …                     | —                  |

A native password input a password manager fills, with SOLAR's eye to show or hide its words: a
toggle that leaves the focus in the field. The link shows where given, in every state; Figma draws
it only while focused, which could not be clicked.

## Number Input

| Prop                             | Values                                         | Default  |
| -------------------------------- | ---------------------------------------------- | -------- |
| `size` · `disabled` · `error`    | as Text Input's                                |          |
| `stepper`                        | `inline` (− and +) · `side` (a chevron column) | `inline` |
| `value` · `defaultValue`         | a number, or null                              | null     |
| `onChange`                       | `(value: number \| null) => void`              | —        |
| `min` · `max` · `step`           | its range and step                             | 1 step   |
| `label` · `mandatory` · `helper` | as Text Input's                                |          |

A spinbutton: its input takes only a number, the arrow keys step it, and so do its buttons, which
are out of the tab order. Inline, the field is as wide as its digits.

## Inline Input

| Prop                 | Values                                            | Default |
| -------------------- | ------------------------------------------------- | ------- |
| `disabled` · `error` | boolean                                           | `false` |
| `value`              | the value shown, and edited                       | —       |
| `onConfirm`          | Enter or Confirm; returning false keeps it open   | —       |
| `onCancel`           | Esc or Cancel                                     | none    |
| `defaultEditing`     | starts it open                                    | `false` |
| `label`              | names the input and the edit button ("Edit name") | none    |

A value edited where it is shown, which holds its own mode (owner decision): read, its words with
an edit button on hover or focus; open, an input with Confirm and Cancel. Figma's filled is the
open mode with the focus on its buttons.

## Token Input

| Prop                             | Values                                        | Default |
| -------------------------------- | --------------------------------------------- | ------- |
| `size` · `disabled` · `error`    | as Text Input's                               |         |
| `readonly`                       | shows the entries, which cannot be changed    | `false` |
| `value` · `defaultValue`         | its entries, `string[]`                       | `[]`    |
| `onChange`                       | `(value: string[]) => void`                   | —       |
| `inputValue` · `onInputChange`   | the draft                                     | —       |
| `maxVisible`                     | how many are drawn; the rest a Counter counts | all     |
| `getTagProps`                    | more props for each entry's Tag               | none    |
| `label` · `mandatory` · `helper` | as Text Input's                               |         |

A field of entries it holds (owner decision), each a neutral SOLAR Tag with a close button: Enter
adds the draft, Backspace in the empty input removes the last. Figma's active is its draft being
typed; read-only and disabled Tags have no close button.

## PIN Input

| Prop                             | Values                                         | Default |
| -------------------------------- | ---------------------------------------------- | ------- |
| `size` · `disabled` · `error`    | as Text Input's                                |         |
| `length`                         | `4` · `5` · `6`                                | `6`     |
| `value` · `defaultValue`         | the digits                                     | `''`    |
| `onChange` · `onComplete`        | with the digits; once every cell holds one     | —       |
| `errorMessage`                   | what is wrong, in the helper's place, in error | none    |
| `label` · `mandatory` · `helper` | as Text Input's                                |         |

A one-time code, one digit per cell (owner decision: 4 to 6). One native input holds it, invisible
over the cells (the code a phone offers, a paste, the numeric keyboard); the cell the next digit
goes in is drawn as Figma's first, which takes the hover, the focus and the caret.

## FileUpload

| Prop                             | Values                                 | Default |
| -------------------------------- | -------------------------------------- | ------- |
| `disabled` · `error`             | boolean                                | `false` |
| `value` · `defaultValue`         | the files, `File[]`                    | `[]`    |
| `onChange`                       | `(files: File[]) => void`              | —       |
| `accept` · `multiple` · `name`   | the file input's                       | —       |
| `placeholder` · `browseLabel`    | its words                              | Figma's |
| `label` · `mandatory` · `helper` | as Text Input's; the helper its limits |         |

A drop zone with a real `<input type="file">`, opened by Browse, a SOLAR Button; chosen, the
file's name with replace and remove, SOLAR Icon Buttons. The app checks sizes and types.

## Dropdown Item

| Prop                    | Values                                                  | Default    |
| ----------------------- | ------------------------------------------------------- | ---------- |
| `size`                  | `md` · `sm`; in a menu, the menu's                      | `md`       |
| `selected` · `disabled` | boolean                                                 | `false`    |
| `checkbox`              | a checkbox before the words, checked where selected     | `false`    |
| `icon` · `helper`       | an icon before the words; a second line                 | none       |
| `role`                  | `menuitemradio` (single choice), `option` (a listbox's) | `menuitem` |

One row of a Dropdown Menu, on MUI's MenuItem: the menu's arrow keys move the focus from row to
row, and a focused row draws Figma's hover (owner decision: real focus, hover look). With a
checkbox it is a menuitemcheckbox, announced checked; its box is an inert SOLAR Checkbox that takes
the row's hover.

## Dropdown Group Label

A section's heading in a Dropdown Menu ("Recent"), presentational, so the menu's keyboard passes
over it; in a menu it takes the menu's size. SOLAR: only where a menu has three or more kinds of
row.

## Dropdown Menu

| Prop                            | Values                                         | Default  |
| ------------------------------- | ---------------------------------------------- | -------- |
| `size`                          | `md` · `sm`, which its rows take               | `md`     |
| `anchorEl` · `open` · `onClose` | floats it under its trigger while open         | in place |
| `anchorPosition`                | floats it at a point instead (`{ top, left }`) | none     |

The surface of Dropdown Items and Group Labels around MUI's MenuList (owner decision: a surface
that floats where it is anchored). Floating, it is MUI's Popover: Escape, a click outside or Tab
close it, the focus is held in it and returns to the trigger, and its first row takes the focus as
it opens. Without an anchor it draws in place, as the checks and the pickers draw it. Past 300px
its rows scroll (owner decision: SOLAR's ~300, one flagged value, `MENU_MAX_HEIGHT`). Name it with
`aria-labelledby`.

## Context Menu Item and Context Menu

| Prop                           | Values                                           | Default |
| ------------------------------ | ------------------------------------------------ | ------- |
| `disabled` · `destructive`     | boolean; destructive for what cannot be undone   | `false` |
| `leadingIcon` · `trailingIcon` | an icon either side of the words                 | none    |
| `shortcut`                     | its keyboard shortcut, as the platform writes it | none    |

An object's actions, opened at the pointer: a Context Menu is a Dropdown Menu's surface floated at
`anchorPosition` (a right-click's or a long press's), Context Menu Items with Dividers between
their groups (`<Divider component="li" />`). A focused row draws Figma's focus. Figma draws a
destructive row at rest alone; its hover, focus and disabled look are the other rows'.

## Option Row and Options List

| Prop                                       | Values                                        | Default    |
| ------------------------------------------ | --------------------------------------------- | ---------- |
| `control`                                  | `checkbox` · `radio` · `toggle`               | `checkbox` |
| `checked` · `defaultChecked` · `mixed`     | the control's                                 | —          |
| `disabled` · `onChange` · `name` · `value` | the control's; a radio's `value` in its group | —          |
| `supportingText`                           | a second line, describing the control         | none       |

A `<label>` around a SOLAR Checkbox, Radio or Toggle: the whole row is its target and names it,
and hovering the row hovers it. An Options List is the `<fieldset>` around rows of one question,
named by `label`, its legend, which a screen reader reads and Figma does not draw (owner decision).
Radios go in MUI's RadioGroup inside it.

## ListItem and List

| Prop                                | Values                                                       | Default |
| ----------------------------------- | ------------------------------------------------------------ | ------- |
| `selected` · `disabled` · `compact` | boolean; in a List, the list's compactness                   | `false` |
| `icon` · `avatar`                   | an icon, or a SOLAR Avatar (an avatar row), before the words | none    |
| `helper` · `trailing`               | a second line; an icon after (a chevron)                     | none    |
| `inCard` (List)                     | Figma's in-card list: edged, its rows padded                 | `true`  |
| `dividers` (List)                   | a Divider between each two rows                              | `true`  |

A ListItem is a row a user chooses, MUI's ListItemButton, its focus Figma's ring; a selected row
is announced as the current one, or as selected in a listbox (`role="option"`). A List is drawn as
Figma draws it (owner decision): its in-card list has the edge, the other none, its rows compact,
though the description says the opposite; the design review asks SOLAR.

SplitButton takes `items` too (`{ label, onSelect, disabled?, icon? }`): the chevron, or Alt+Down
on the action, opens them in a Dropdown Menu of its size under it.

## Select and Dropdown

| Prop                                      | Values                                             | Default |
| ----------------------------------------- | -------------------------------------------------- | ------- |
| `size`                                    | `md` · `sm`, which its rows take                   | `md`    |
| `disabled` · `error`                      | boolean                                            | `false` |
| `label` · `mandatory` · `helper`          | as a Text Input's                                  | none    |
| `placeholder`                             | what the field says before a choice                | none    |
| `value` · `defaultValue` · `onChange`     | the chosen row's `value`; `onChange(event, value)` | `''`    |
| `open` · `onOpen` · `onClose`             | its panel, where the caller keeps it               | closed  |
| `leadingIcon` · `trailingIcon` (Dropdown) | an icon either side of the choice                  | none    |
| children                                  | DropdownItems, each with a `value`                 | —       |

One choice from a short list, on MUI's Select over InputBase: a click, Enter or the arrow keys open
its panel, where the arrow keys move, a typed letter finds a row, Enter chooses and Escape closes.
The two are one control in two looks (owner decision): Select draws its own panel, as Figma draws
it, as wide as the field; Dropdown's is a Dropdown Menu, and its chevron turns up while open.
Figma draws Dropdown no focus; it takes Select's. Beyond about seven choices, use an Autocomplete.

## Autocomplete

| Prop                             | Values                                                         | Default      |
| -------------------------------- | -------------------------------------------------------------- | ------------ |
| `size` · `disabled` · `error`    | as a Text Input's                                              | `md` · false |
| `label` · `mandatory` · `helper` | as a Text Input's                                              | none         |
| `leadingIcon` · `trailingIcon`   | an icon either side of the words (a search icon, a clear)      | none         |
| `noOptionsText`                  | what the suggestions say where none match                      | `No matches` |
| `menuProps`                      | more of the suggestions' Dropdown Menu's props                 | none         |
| every `useAutocomplete` option   | `options` · `value` · `onChange` · `inputValue` · `freeSolo` … | —            |

A field that suggests matching options as the user types, on MUI's useAutocomplete, its field a
Text Input's. Its suggestions are a Dropdown Menu floating under the field without taking the
focus: the input keeps it, and the arrow keys move the highlight, which draws a row's hover (owner
decision: no highlight look of its own). Figma's Autocomplete Open is its open state, checked as
one, and exported as nothing of its own.

## DatePicker, Date Picker Open and Date Picker Day Cell

| Prop (DatePicker)                     | Values                                              | Default      |
| ------------------------------------- | --------------------------------------------------- | ------------ |
| `size` · `disabled` · `error`         | as a Text Input's                                   | `md` · false |
| `label` · `mandatory` · `helper`      | as a Text Input's                                   | none         |
| `value` · `defaultValue` · `onChange` | the date, ISO (`2026-04-24`), or null               | null         |
| `locale`                              | the figures' order, the months' and weekdays' names | the page's   |
| `min` · `max` · `isDateDisabled`      | the dates the calendar refuses                      | none         |
| `weekStartsOn`                        | 0 (Sunday) to 6                                     | the locale's |
| `open` · `onOpen` · `onClose`         | its calendar, where the caller keeps it             | closed       |
| `calendarProps`                       | more of the calendar's props                        | none         |

A date, typed or picked (owner decision). The words are the date in the locale's figures
(`24/04/2026`, `04/24/2026` in the US), read on Enter and as the focus leaves; words that are no
date leave the value as it was, for the caller to flag with `error`. The calendar button (Figma's
calendar icon), or the down arrow, opens a Date Picker Open under the field, a dialog, the focus on
the chosen day. One date is chosen (owner decision: single dates); Figma's `error-focused` is drawn
as error while focused.

Date Picker Open is the calendar on its own, or in the page (`inline`): the month, its previous and
next, the weekdays from the locale's first day (owner decision), and a grid of Date Picker Day
Cells as many weeks as the month spans, the days either side disabled. The arrow keys move the
focus a day or a week, Home and End to the week's ends, Page Up and Down a month (with Shift, a
year); Enter or a click chooses. `type="double"` shows the next month beside it in the page, as
Figma draws it; a floating one shows one month. `today` and `dayProps` serve tests and tooltips.
A Day Cell is a grid cell announced selected, as today's date or disabled; its `rangeRole` draws a
range's part as Figma does, for when ranges come. Dates are the platform's own calendar
(`internal/calendar.ts`), not a picker library's.

## TimePicker and TimePicker Dropdown

| Prop (TimePicker)                     | Values                                   | Default      |
| ------------------------------------- | ---------------------------------------- | ------------ |
| `size` · `disabled` · `error`         | as a Text Input's                        | `md` · false |
| `label` · `mandatory` · `helper`      | as a Text Input's                        | none         |
| `value` · `defaultValue` · `onChange` | the time, `HH:mm` (`09:30`), or null     | null         |
| `locale`                              | its clock, 12- or 24-hour, and its words | the page's   |
| `step` · `min` · `max`                | the times the list offers                | 30 · the day |
| `open` · `onOpen` · `onClose`         | its list, where the caller keeps it      | closed       |
| `dropdownProps`                       | more of the list's props                 | none         |

A time of day, typed or picked, as a DatePicker's date: typed on either clock (`9:30 AM`, `21:30`,
`2130`), written on the locale's, and picked from a TimePicker Dropdown under the field. The
dropdown is one list of times a step apart (owner decision: not Figma's description's hour and
minute columns, which its drawing does not draw), each a Dropdown Item, the chosen one selected and
scrolled into sight, a listbox the arrow keys move along. For a date and a time, put a DatePicker
beside it.

## Tabs and Tab Item

| Prop                                     | Values                                                   | Default |
| ---------------------------------------- | -------------------------------------------------------- | ------- |
| `size` (Tabs)                            | `sm` · `md`, which its tabs take                         | `sm`    |
| `value` · `defaultValue` · `onChange`    | the selected tab's `value` (its index where it has none) | none    |
| `label` (Tab Item)                       | the tab's words                                          | —       |
| `leadingIcon` · `trailingIcon` · `count` | an icon either side, a SOLAR Counter                     | none    |
| `selected` · `disabled` (Tab Item)       | boolean; in a Tabs, the strip says which is selected     | `false` |

Two to seven tabs, MUI's Tabs and Tab, a tablist: the arrow keys move the focus, Enter or Space
selects (owner decision: the arrows move the focus, as SOLAR's description says, since a selected
tab is the routed one). Each tab draws its own underline, MUI's moving indicator hidden; a focused
tab draws Figma's focus, the underline and the ring (owner decision: as drawn). A tab's Counter is
drawn in the variant Figma draws for the tab's state, at rest in every state. The strip does not
scroll: a scroll would clip the focused tab's ring. A Tab Item lives in a Tabs (MUI's Tab needs
one).

## Nav Item, Section Nav Item and Section Nav Group Header

| Prop                              | Values                                                | Default  |
| --------------------------------- | ----------------------------------------------------- | -------- |
| `label`                           | where it goes, its name                               | —        |
| `iconOutline` · `iconSolid` (Nav) | its icon, and the solid one drawn while selected      | —        |
| `icon` (Section Nav Item)         | its icon                                              | —        |
| `selected`                        | the current page (`aria-current="page"`)              | `false`  |
| `expanded` (Nav Item)             | its label shown beside its icon, spanning the sidebar | `false`  |
| `disabled` (Section Nav Item)     | boolean                                               | `false`  |
| `href` · every ButtonBase prop    | a link where it has one, a button otherwise           | a button |
| `level` (Group Header)            | its heading level                                     | `3`      |

A sidebar's destinations (Nav Item) and a settings rail's (Section Nav Item, grouped under Section
Nav Group Headers, headings). Collapsed, a Nav Item is its icon alone, named by its label. Figma
draws a Nav Item no focus; it draws SOLAR's ring (owner decision). A Section Nav Item spans its rail
and has no padded target, since the items touch, as a menu's rows.

## Breadcrumbs and Breadcrumb Item

| Prop                                     | Values                                               | Default |
| ---------------------------------------- | ---------------------------------------------------- | ------- |
| children (Breadcrumbs)                   | BreadcrumbItems, the page's ancestors, then the page | —       |
| `maxItems` · `expandLabel` (Breadcrumbs) | the longest trail shown whole; the ellipsis's name   | `5`     |
| `href` · `onClick` (Breadcrumb Item)     | a link, or a button                                  | none    |
| `type` · `disabled` (Breadcrumb Item)    | `link` · `current`; a disabled link is text          | `link`  |

A page's place in its site, in a `nav` named "Breadcrumb" and an ordered list, a chevron between
each two, hidden from a screen reader, the last the current page (`aria-current="page"`, no link).
Past five, its middle collapses to an ellipsis, a button that opens a Dropdown Menu of the pages it
hides, as SOLAR's description says. Drawn, not MUI's Breadcrumbs, whose collapse expands in place.
A focused link draws SOLAR's ring, which Figma draws none of.

## Tree Item

| Prop                                            | Values                                             | Default |
| ----------------------------------------------- | -------------------------------------------------- | ------- |
| `label` · `depth`                               | its words; how deep it is, 0 to 10                 | — · `0` |
| `selected` · `expanded` · `edit`                | boolean                                            | `false` |
| `expandable` · `onExpandedChange`               | its chevron (a leaf keeps its room)                | `true`  |
| `onSelect`                                      | a click, Enter or Space                            | none    |
| `checked` · `onCheckedChange`                   | a checkbox                                         | none    |
| `leadingIcon` · `trailingIcon`                  | an icon either side                                | none    |
| `status` · `tag` · `count`                      | a StatusIndicator's type, a Tag, a Counter's count | none    |
| `onMore` · `onAdd`                              | its actions, shown on hover and while selected     | none    |
| `onRenameStart` · `onRename` · `onRenameCancel` | F2; Enter in the rename field; Escape              | none    |

One row of a tree, `role="treeitem"` at its level. The arrow keys expand and collapse it. `edit`
draws its words as a text field, an inline rename (owner decision), and a keyboard-focused row
draws edit's edge and ring, as its description says edit "doubles as the focus treatment". The tree
around it, the arrow keys across its rows, is the Tree Navigation Panel pattern's, later.

## Pagination, PaginationItem, PaginationNav and PaginationEllipsis

| Prop                                | Values                                        | Default |
| ----------------------------------- | --------------------------------------------- | ------- |
| `count`                             | how many pages                                | —       |
| `page` · `defaultPage` · `onChange` | the current page, from 1                      | `1`     |
| `hrefOf`                            | each page's address: the pages are then links | none    |

A list's pages, in a `nav` named "Pagination" and a list: the previous arrow, the pages, the next
arrow, disabled at the ends. The pages shown are Figma's (owner decision): the first, the last, the
current ± 1, and three at the end the current is near, `1 2 3 … 12`; a gap of one page shows the
page, a longer one an ellipsis, which is no control. The current page is `aria-current="page"`.
One page draws nothing. Each item's own 24 × 24 box is its target (owner decision: they sit 4px
apart). `pagesOf(page, count)` is exported.

## PageNavigator and PageNavButton

| Prop                            | Values                                             | Default     |
| ------------------------------- | -------------------------------------------------- | ----------- |
| `count` · `page` · `onChange`   | the sequence's length and the current page, from 1 | `1`         |
| `indicator`                     | where the reader is, in words                      | `"3 of 10"` |
| `direction` · children (Button) | `prev` · `next`; its words                         | "Previous"  |

A linear pager for a sequence walked start to end: its buttons disabled at the ends, where the
reader is announced as it changes (`aria-live`). A button hugs its words and arrow (Figma fixes it
at 112px), mirrored right to left.

## Stepper, Step and Stepper Indicator

| Prop                   | Values                                             | Default      |
| ---------------------- | -------------------------------------------------- | ------------ |
| `type`                 | `with label` · `no label` · `line` · `line+text`   | `with label` |
| `steps` · `activeStep` | two to five labels; the active one's index, from 0 | —            |
| `errorStep`            | a step in error                                    | none         |
| `onStepClick`          | completed Steps become buttons that go back        | none         |

A linear flow's progress (owner decision: labels and an active index; completed steps pressable
where `onStepClick` is given). Steps before the active one are complete, it active
(`aria-current="step"`), those after upcoming. Where a type draws no words (`no label`, `line`),
each step's label is read, not drawn. Each part is drawn in the layer Figma draws for its status.

## Cards: what they share

Every card of the family (Card, Status Card, the Insight parts, Event Row, Option Card, File Card,
Image Card, Action Card, Interactive Card, Device Card, Launch Card) is pressable where it is given
`onClick` or `href` (owner decision): its title is then the button or link, and its hit area the
whole card (the title's `::after`), so its own controls (a More menu, Buttons, a Checkbox) stay
reachable above it; the card is hovered and focused only then, and draws SOLAR's focus ring, which
Figma draws none of. A card with a More glyph takes `moreItems` (`{ label, onSelect, disabled,
icon }`, the exported `CardMoreItem`): a "More actions" button (`moreLabel`) with a 44 × 44 target,
opening a Dropdown Menu. `loading` (Figma's `ghost` in Status Card and the Insight parts) draws
Figma's placeholders, `aria-busy`, and keeps a pressable card pressable, its title then its
action's name alone. Each fills the space it is put in (Figma's widths are samples).

## Card

| Prop                     | Values                                             | Default |
| ------------------------ | -------------------------------------------------- | ------- |
| `title`                  | what the card is                                   | —       |
| `status`                 | `none` · `danger` · `warning` · `success` · `info` | `none`  |
| `disabled` · `loading`   | booleans; either draws no status, as Figma does    | `false` |
| `icon` · `helper`        | before and after the title                         | none    |
| `description` · children | the content's words, in Figma's look, then yours   | none    |
| `tag`                    | a Tag's words, in the status's look                | none    |

The raised surface of the family. Loading, its Tag is a placeholder of the Tag's size.

## Container and Split Dropdown

A Container groups content inside a larger surface (`type`: `default`, no paint; `outlined`, on
the raised surface with an edge); a Split Dropdown is a box of two zones, `top` (the control) and
`lower` (its details), cut to its corners. Neither is a control.

## Status Card, Insight Card, Insight Card Small and Insight Row

| Prop                                                  | Values                                             | Default   |
| ----------------------------------------------------- | -------------------------------------------------- | --------- |
| `status` (Status Card)                                | `success` · `neutral` · `danger` · `warning`       | `success` |
| `severity` (Insight parts)                            | `danger` · `warning` · `info` · `success`          | `success` |
| `statusLabel` · `severityLabel`                       | the word the StatusIndicator or the bar is read as | its word  |
| `selected` (Insight Card)                             | the current one of its set (`aria-current`)        | `false`   |
| `title` · `value` · `description` · `meta` · `action` | their words; Insight Row's Button                  | —         |

The status or severity is read as well as seen: the StatusIndicator (or Insight Row's bar, colour
alone in Figma) is named by its word. Figma draws the Insight parts loading at info alone, which
they are drawn as whatever the severity.

## Expandable Card and Accordion

| Prop                                                | Values                                | Default |
| --------------------------------------------------- | ------------------------------------- | ------- |
| `title`                                             | the header's words, its button's name | —       |
| `expanded` · `defaultExpanded` · `onExpandedChange` | whether the content shows             | `false` |
| `description` · children                            | the content                           | none    |
| `disabled` (Accordion)                              | boolean                               | `false` |

A disclosure: the header is the button (`aria-expanded`, `aria-controls`), the content under it.
Expanded, an Accordion draws its header as the collapsed item is, as Figma nests it, its chevron
turned up; the card's look follows its header's hover and focus.

## Event Row

`leading` (an Avatar, md), `title`, `product`, `meta`, `timestamp` with `dateTime` (a `<time>`),
and a More menu: one event of an activity feed, which the feed lists in order. Its single-value
`density` is gone (a sample, until SOLAR draws another).

## Option Card, File Card and Image Card

Tiles of a grid, each as Figma draws it (owner decision). An Option Card is a create tile, a Plus
over its `label`, `selected` the current one. A File Card is a file (`thumbnail` or `fileIcon`,
`title`, `meta`, a More menu) or, `type="create"`, the tile that adds one. An Image Card is an
`image` with its `title` and `subtitle` and a More menu; given `onSelectedChange` it is selectable
by a Checkbox (`selectLabel`), shown where it is `selected` and while the pointer or the keyboard is
on it; not `filled`, it is the tile that adds one.

## Action Card

| Prop                                        | Values                                                       | Default   |
| ------------------------------------------- | ------------------------------------------------------------ | --------- |
| `status`                                    | `default` · `done` · `danger`                                | `default` |
| `primaryAction` · `secondaryAction`         | your Buttons (sm); once done or in danger, the primary alone | none      |
| `icon` · `title` · `description` · children | as Card's                                                    | —         |

## Interactive Card

| Prop                                            | Values                                                    | Default |
| ----------------------------------------------- | --------------------------------------------------------- | ------- |
| `control`                                       | `none` · `checkbox` · `radio` · `toggle` (owner decision) | `none`  |
| `selected` · `onSelectedChange` · `selectLabel` | the control's value, change and name                      | `false` |
| `dragHandle` · `dragging`                       | shows a DragHandle; draws it lifted, as it moves          | `false` |
| `actions`                                       | your Icon Buttons (sm)                                    | none    |

## Device Card

| Prop                         | Values                                             | Default   |
| ---------------------------- | -------------------------------------------------- | --------- |
| `type`                       | `single` · `batch`, each drawn from its own layers | `single`  |
| `name` · `details` · `count` | a device's name and details, a batch's count       | —         |
| `tag` · `tagStatus`          | its health: a Tag's words and status               | `success` |
| `action` · `devices`         | your Button ("Try again"); a batch's Dropdown (md) | none      |

## Launch Card and Launch Card Full Screen

A Launch Card is an app to open: `image`, `appIcon` (an App Icon of `@bwp-web/assets`, an `<img>`),
`name`, `tag`, `body`, and your `actions` (a Button Group; owner decision: `access` is gone, its
words yours), its `favourite` (your Icon Button) on the image, or beside the name without one. A
Launch Card Full Screen is its page (owner decision: built with slots): `image`, `appIcon`,
`favourite`, `name`, `intro`, up to three `features`, and your `action`.

## Checked against Figma

`npm run test:visual` renders every variant of every component here in Chromium, puts each into
its state as a user would, and compares what the browser computes with what Figma draws
(`spec/verify/`). See [test/visual/README.md](test/visual/README.md).

To look at them instead, `npm run storybook` from the repository root: every Figma variant of
every component, its state forced, in Light and Dark, beside a playground with a control per prop.
It is built from the same cases and oracles as the check. See [stories/README.md](stories/README.md).

## Generated look, owned behaviour

A component here is two parts, with a hard line between them:

- **The recipe** — what it looks like — is `solarButtonStyle` in `@bwp-web/styles/mui`, generated
  from Figma by `npm run solar:codegen`. It is never edited; a design change arrives through it.
- **The shell** — props, slots, loading, accessibility — is `src/Button.tsx`, written by hand in
  TSX. It never holds a design value, and what the IR decides of its drawing it imports: its props
  type, its layer tree (`solarButtonTree`) and its slot names (`solarButtonSlots`), so a layer
  Figma adds reaches it, and a prop, slot or icon it leaves unreached fails the component-parity
  test.

The rule of thumb: **the overlay for a decision about one component, the normalizer for a rule
about the system, the shell for behaviour.**
