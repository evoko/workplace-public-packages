# @bwp-web/components

SOLAR components for React, built on MUI: Button, Icon Button, Button Group, FAB, BackButton,
SplitButton, Link and Spinner, and the display primitives (StatusIndicator, Counter, Kbd, Timestamp, Avatar, Trend Badge, Divider,
Skeleton, ProgressBar, Node End, RowExpand and Tree Indent) so far.

```tsx
import '@bwp-web/styles/tokens.css';
import '@bwp-web/styles/fonts.css';
import { Button } from '@bwp-web/components';

<Button variant="secondary" size="sm" iconLeading={<IconArrowLeft />}>
  Back
</Button>;
```

**Requires** React 18 or newer and MUI 9 (`@mui/material` with its Emotion peers), which the app
provides; neither is bundled. The components look right with or without the SOLAR MUI theme
installed, but installing it (`createSolarThemeOptions` from `@bwp-web/styles/mui`) makes stock
MUI components match them.

## Button

| Prop                          | Values                                | Default   |
| ----------------------------- | ------------------------------------- | --------- |
| `variant`                     | `primary` · `secondary` · `tertiary`  | `primary` |
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

`sm` is drawn 32px tall and `md` 40px, below the 44px WCAG touch target. SOLAR asks for the hit
area to be padded in code but publishes no token for the target size, and the descriptions in
Figma give 36px and 44px where the components are drawn 32px and 40px, so this is not done yet: it
is the first question in [the design review](../../docs/solar-review-for-design.md).

## Icon Button

```tsx
<IconButton icon={<IconDelete />} aria-label="Delete" variant="secondary" />
```

| Prop                  | Values                               | Default   |
| --------------------- | ------------------------------------ | --------- |
| `icon`                | the icon, required                   |           |
| `aria-label`          | the accessible name, required        |           |
| `variant`             | `primary` · `secondary` · `tertiary` | `primary` |
| `size`                | `sm` · `md` · `lg` (32, 40, 48px)    | `sm`      |
| `shape`               | `square` · `round`                   | `square`  |
| `disabled`, `loading` | boolean                              | `false`   |

MUI's IconButton, restyled by the recipe. An icon alone is not a name, so the types require an
`aria-label` or an `aria-labelledby` (and in development it warns without one, for JavaScript
callers). The icon fills a box the recipe sizes from the icon ladder. While loading, the icon gives
way to the Spinner Figma picks for the variant; disabled wins over loading. Figma draws some
variants inconsistently with Button (primary's border, a focus ring on press, disabled borders);
they are drawn as Figma draws them and listed in [the design review](../../docs/solar-review-for-design.md),
section 8. The 44px hit area waits on the same token as Button's.

## Button Group

```tsx
<ButtonGroup fullWidth>
  <Button variant="secondary" size="lg">
    Cancel
  </Button>
  <Button size="lg">Save</Button>
</ButtonGroup>
```

| Prop          | Values                                  | Default      |
| ------------- | --------------------------------------- | ------------ |
| `orientation` | `horizontal` · `vertical`               | `horizontal` |
| `fullWidth`   | boolean: a flush bar with a top divider | `false`      |
| `children`    | two to five Buttons, of one size        |              |

A box of the caller's Buttons, which it never changes: each fills an equal share of a row, or the
width of a column, and keeps its own height. Figma draws no vertical full-width group, so the types
refuse `orientation="vertical"` with `fullWidth` (`ButtonGroupLayout`). In development it warns when
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
| `variant`    | `primary` · `secondary` | `primary`      |
| `size`       | `sm` · `md`             | `md`           |
| `disabled`   | boolean                 | `false`        |
| `loading`    | boolean                 | `false`        |
| `children`   | the action's label      | required       |
| `onClick`    | the action              | none           |
| `onMenuOpen` | opens the menu          | none           |
| `menuOpen`   | boolean                 | `false`        |
| `menuLabel`  | the chevron's name      | `More options` |

The dominant action and a chevron that opens a menu of its variants: two buttons in one joined
control, drawn from its layers. The whole control takes the states of whichever half is hovered,
pressed or focused, as Figma draws them. The chevron says it opens a menu (`aria-haspopup`,
`aria-expanded`), and Alt+Down on the action opens it too; the menu is the caller's until
Dropdown.

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
no token for a spinner's rotation. Figma calls `variant` `style`, which is React's inline-style prop.
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
- **The shell** — props, slots, loading, accessibility — is `src/Button.tsx`, written once by
  `npm run solar:scaffold Button` and owned by developers from then on. The scaffolder refuses to
  overwrite it without `--force`, so behaviour someone added is never lost to a design change.

The rule of thumb: **the overlay for a decision about one component, the normalizer for a rule
about the system, the shell for behaviour.**
