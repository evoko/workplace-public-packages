# @bwp-web/components

SOLAR components for React, built on MUI: Button, Icon Button, Button Group, Spinner and
StatusIndicator so far.

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
