# Authoring guide

How to write the CSS source of truth so the compiler can read it. Every rule
here is enforced by `bwp-ds lint`; the error code in parentheses is what you
see when you break it. See `errors.md` for the full list.

## Configuration

`packages/styles-css/ds.config.json`:

| Field          | Required | Meaning                                                                                                      |
| -------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| `name`         | yes      | Display name of the design system. Used in Storybook and docs only.                                          |
| `prefix`       | yes      | Lowercase word that starts every custom property and class: `--<prefix>-…`, `.<prefix>-…`.                   |
| `modes`        | yes      | Color-scheme modes, for example `["light", "dark"]`.                                                         |
| `defaultMode`  | yes      | The mode whose values live on `:root`. Must be one of `modes`.                                               |
| `rootFontSize` | no       | Pixels per `rem`, used when a target needs absolute units. Default 16.                                       |
| `modeSelector` | no       | Selector for non-default modes with `{mode}` as placeholder. Default `:root[data-<prefix>-theme="{mode}"]`.  |
| `targets`      | no       | Per target id, `{ "outDir": "<path>" }` relative to the source root; default `../styles-<id>/src/generated`. |
| `coverageFile` | no       | Where `bwp-ds verify` writes the coverage report, relative to the source root; default `coverage.md`.        |

An invalid or missing config is `DS-E001`.

## Tokens

Location: `src/tokens/<category>.css`, one file per category. The file name is
the category (`DS-E017` otherwise). Non-CSS files such as `MAPPING.md` may
live in `src/tokens/`; the compiler ignores them.

Categories and the value each accepts:

| Category         | Accepts                                                                                                                                               | Example                          |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `color`          | any CSS color                                                                                                                                         | `#1863d3`, `rgb(0 0 0 / 50%)`    |
| `space`          | dimension                                                                                                                                             | `8px`, `0.5rem`                  |
| `radius`         | dimension                                                                                                                                             | `6px`                            |
| `font-family`    | family list                                                                                                                                           | `'Open Sans', Arial, sans-serif` |
| `font-size`      | dimension                                                                                                                                             | `1rem`                           |
| `font-weight`    | 1 to 1000, `normal`, `bold`                                                                                                                           | `600`                            |
| `line-height`    | number or dimension                                                                                                                                   | `1.5`, `24px`                    |
| `letter-spacing` | dimension                                                                                                                                             | `-0.02em`                        |
| `shadow`         | `none`, or one or more comma-separated `box-shadow` layers, each 2 to 4 lengths and a color (the color may be a `var()` reference to a `color` token) | `0 1px 2px rgba(0, 0, 0, 0.2)`   |
| `border-width`   | dimension                                                                                                                                             | `1px`                            |
| `duration`       | `ms` or `s`                                                                                                                                           | `150ms`                          |
| `easing`         | `cubic-bezier()`, or one of `linear`, `ease`, `ease-in`, `ease-out`, `ease-in-out` (`steps()` is not supported)                                       | `cubic-bezier(0.4, 0, 0.2, 1)`   |
| `opacity`        | number                                                                                                                                                | `0.4`                            |
| `z-index`        | number                                                                                                                                                | `1000`                           |
| `size`           | dimension                                                                                                                                             | `44px`                           |

Dimensions accept `px`, `rem`, `em`, `%`, and unitless `0`.

Rules:

- A token file may contain only `:root { … }` and one block per non-default
  mode using the configured mode selector. No at-rules, no other selectors, no
  nesting (`DS-E010`). A CSS syntax error in any source file is `DS-E061`.
- Every declaration is `--<prefix>-<category>-<path>` where `<category>` is the
  file's category and `<path>` is one or more lowercase kebab-case segments
  (`DS-E011`). Every hyphen in the path is a segment boundary:
  `--bwp-color-on-primary` has the path `on.primary`.
- A value is a literal of the category's type or `var(--<prefix>-…)` pointing
  to another token. No `calc()`, no `var()` fallback, no mixed content
  (`DS-E012`).
- An alias must point to an existing token (`DS-E013`) whose value type is
  accepted by this category (`DS-E014`). `radius` may alias `space` because
  both are dimensions; `space` may not alias `color`.
- A token is either mode-invariant (declared only in `:root`) or declared in
  every mode (`DS-E015`). Declaring it twice in one mode is `DS-E016`.

Conventions the compiler does not enforce but every target relies on:

- **Mode blocks redefine semantic tokens, not primitives.** Keep the raw
  palette (`neutral-900`, `accent-500`) the same in every mode and switch the
  semantic layer (`text-default`, `surface-default`, `border-default`) per
  mode. A consumer who reads a primitive directly must get the same color in
  every mode.
- **No token path may be a prefix of another token's path.** `text-on` and
  `text-on-accent` cannot coexist because targets that nest tokens (Dart
  classes, Tailwind namespaces) cannot represent both. Prefer `text-inverse`.

Example:

```css
:root {
  --bwp-color-neutral-0: #ffffff;
  --bwp-color-neutral-900: #111111;
  --bwp-color-text-default: var(--bwp-color-neutral-900);
  --bwp-color-surface-default: var(--bwp-color-neutral-0);
}

:root[data-bwp-theme='dark'] {
  --bwp-color-text-default: var(--bwp-color-neutral-0);
  --bwp-color-surface-default: var(--bwp-color-neutral-900);
}
```

The primitives stay mode-invariant; `text-default` and `surface-default` are
declared in `:root` and in `dark`, so they are mode-varying with an alias per
mode.

## Components

Location: `src/components/<name>/<name>.css` and `<name>.manifest.json`. Both
must exist (`DS-E060`) and `manifest.name` must equal `<name>` (`DS-E021`).

### Selector grammar

```
.<prefix>-<name>                     root, default axis values, no state
.<prefix>-<name>[data-<axis>="<v>"]  one axis value (repeatable for several axes)
.<prefix>-<name>:<state>             a state (repeatable)
.<prefix>-<name> .<prefix>-<name>__<slot>   a slot, reached by one descendant space
```

Parts combine: `.bwp-button[data-variant="outline"][data-size="sm"]:hover .bwp-button__icon`.

States and how to write them:

| State           | Write                                                                                                                                                                                                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hover`         | `:hover`                                                                                                                                                                                                  |
| `active`        | `:active`                                                                                                                                                                                                 |
| `focus-visible` | `:focus-visible`                                                                                                                                                                                          |
| `disabled`      | `:disabled`, `[disabled]`, or `[aria-disabled="true"]`. `:disabled` and `[disabled]` match only form controls; a `div` root needs `[aria-disabled="true"]` and a manifest `slots.root.element` that fits. |
| `pressed`       | `[aria-pressed="true"]`                                                                                                                                                                                   |
| `selected`      | `[aria-selected="true"]`                                                                                                                                                                                  |
| `expanded`      | `[aria-expanded="true"]`                                                                                                                                                                                  |
| `checked`       | `[aria-checked="true"]`                                                                                                                                                                                   |
| any other name  | `[data-state="<name>"]`                                                                                                                                                                                   |

Rules:

- Axes and their values must be declared in the manifest (`DS-E031`); slots
  too (`DS-E032`); states too (`DS-E033`).
- Anything outside the grammar is `DS-E030`: extra classes, unknown
  pseudo-classes, unknown attributes.
- Forbidden outright (`DS-E034`): element selectors, ids, `*`, `&`,
  pseudo-elements, combinators other than one descendant space, more than one
  descendant step, `!important`, nesting, any at-rule, states or axes on the
  slot compound.
- The compiler orders rules itself: root before slots, fewer axes first, axis
  values in manifest order, fewer states first, then `hover`,
  `focus-visible`, `active`, `pressed`, `selected`, `expanded`, `checked`,
  `disabled`, then other states alphabetically. Source order does not matter.
  Two rules with the same slot, axes, and states merge; setting one property
  to two different values, within one rule or across rules, is `DS-E046`. A
  shorthand followed by one of its longhands with a different value counts
  (`padding: … ; padding-top: …`). Rules with no declarations are dropped.

### Declarations

The compiler knows a fixed table of properties (`DS-E040` for any other). Each
property is one of three kinds:

**Token-required.** The value must be `var(--<prefix>-<category>-…)` from an
allowed category (`DS-E041` for a literal, `DS-E043` for an unknown token,
`DS-E044` for the wrong category). A few escape-hatch keywords are allowed:

| Properties                                                                                                               | Categories       | Escape hatches                           |
| ------------------------------------------------------------------------------------------------------------------------ | ---------------- | ---------------------------------------- |
| `color`, `background-color`, `border-*-color`, `outline-color`, `caret-color`, `text-decoration-color`, `fill`, `stroke` | `color`          | `transparent`, `currentColor`, `inherit` |
| `padding-*`, `row-gap`, `column-gap`, `outline-offset`                                                                   | `space`          | `0`                                      |
| `margin-*`                                                                                                               | `space`          | `0`, `auto`                              |
| `top`, `right`, `bottom`, `left`                                                                                         | `space`, `size`  | `0`, `auto`                              |
| `border-*-radius`                                                                                                        | `radius`         | `0`                                      |
| `border-*-width`, `outline-width`                                                                                        | `border-width`   | `0`                                      |
| `text-decoration-thickness`                                                                                              | `border-width`   | `auto`, `from-font`                      |
| `text-underline-offset`                                                                                                  | `space`          | `auto`                                   |
| `font-family`                                                                                                            | `font-family`    |                                          |
| `font-size`                                                                                                              | `font-size`      |                                          |
| `font-weight`                                                                                                            | `font-weight`    |                                          |
| `line-height`                                                                                                            | `line-height`    | `normal`                                 |
| `letter-spacing`                                                                                                         | `letter-spacing` | `normal`                                 |
| `box-shadow`                                                                                                             | `shadow`         | `none`                                   |
| `transition-duration`, `transition-delay`                                                                                | `duration`       |                                          |
| `transition-timing-function`                                                                                             | `easing`         |                                          |

**Keyword.** Only listed keywords (`DS-E042` otherwise): `display`, `position`,
`box-sizing`, `align-*`, `justify-*`, `flex-direction`, `flex-wrap`,
`overflow`, `overflow-x`, `overflow-y`, `visibility`, `object-fit`,
`border-collapse`, `list-style-type`,
`background-image` (`none` only), `border-*-style`, `outline-style`,
`font-style`, `text-align`, `vertical-align`, `text-transform`,
`text-decoration-line`, `text-decoration-style`, `white-space`,
`text-overflow`, `cursor`, `appearance`, `pointer-events`, `user-select`,
`resize`. The exact keyword lists are in
`packages/ds-compiler/src/components/properties.ts`.

**Free.** A token from the listed categories or a free literal of the listed
kinds: `width`, `height`, `min-*`, `max-*`, `flex-basis` (`size` or `space`
token, any dimension, `auto`, `none`, `fit-content`, `max-content`,
`min-content`); `flex-grow`, `flex-shrink`, `order` (number); `opacity`
(`opacity` token or number); `z-index` (`z-index` token, number, `auto`);
`stroke-width` (`border-width` token, number, dimension);
`transition-property` (comma-separated identifiers, `none`, `all`).

Shorthands: `padding`, `margin`, `border-width`, `border-style`,
`border-color`, `border-radius`, and `gap` are expanded to their longhands
(1 to 4 values, `gap` 1 to 2). `border`, `border-top`, `border-right`,
`border-bottom`, `border-left`, `border-block`, `border-inline`, `background`,
`font`, `transition`, `outline`, `flex`, `inset`, `animation`,
`text-decoration`, `place-items`, `place-content`, `grid`, `grid-template`,
`grid-area`, `columns`, `list-style`, `overflow-block`, `overflow-inline` are
forbidden (`DS-E045`); write the longhands. Any property not in the table is
`DS-E040`, not `DS-E045`.

### Baseline

The base root rule (no axes, no states) should declare `appearance`,
`box-sizing`, `background-color`, `color`, `font-family`, `font-size`,
`line-height`, and all four `border-*-style` (or `border-style`). Missing any
is warning `DS-W001`. Set `"baseline": false` in the manifest to opt out, or
`"baseline": ["display", "color"]` to use your own list.

## Manifest

```json
{
  "$schema": "../../../../ds-compiler/schemas/manifest.schema.json",
  "name": "button",
  "displayName": "Button",
  "description": "Triggers an action.",
  "axes": {
    "variant": { "values": ["solid", "outline"], "default": "solid" },
    "size": { "values": ["sm", "md"], "default": "md" }
  },
  "states": ["hover", "focus-visible", "disabled"],
  "slots": {
    "root": { "element": "button" },
    "icon": { "element": "span", "optional": true },
    "label": { "element": "span" }
  },
  "preview": { "label": "Button", "icon": "plus" },
  "baseline": ["display", "color"],
  "targets": {
    "tailwind": {},
    "mui": { "excluded": "not mapped yet" }
  }
}
```

| Field         | Required | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | yes      | Kebab-case, equals the directory name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `displayName` | yes      | Human name.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `description` | no       | One sentence.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `axes`        | no       | Each axis: `values` (lowercase letters and digits, hyphen-separated, may start with a digit like `2xl`) and `default` (one of the values). The default is styled by the base rule.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `states`      | no       | The states the CSS may use.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `slots`       | no       | Named parts. `root` is implicit and always present; its element defaults to `div` and it cannot be optional. Other slots have `element` (default `span`) and `optional` (default false).                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `preview`     | no       | Free-form `string: string` map for Storybook. Keys are conventionally slot names but are not validated against `slots`; values are plain text, or an icon name for an icon slot. Nothing here affects the CSS or the targets.                                                                                                                                                                                                                                                                                                                                                                            |
| `baseline`    | no       | `false` or a list of supported properties; see Baseline. An unknown property name is `DS-E020`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `targets`     | no       | Per target id: `{}` maps the component, `{ "excluded": "<reason>" }` leaves it out on purpose, and a registered target may accept hints (`tailwind` and `mui`: `{ "ignore": [<property>…] }`, validated against the property table; `mui: {}` generates a React component for the component; `mui` also accepts `component`, `axisMap`, `slotMap`, and `defaultProps` to map the component onto one of MUI's own components instead — see `docs/design-system/targets/mui.md#mapped-components`). A component with no entry for a registered target is `unmapped` and fails `bwp-ds verify` (`DS-E082`). |

Unknown fields and invalid shapes are `DS-E020`. A `$schema` field is allowed
and ignored. The JSON schema is `packages/ds-compiler/schemas/manifest.schema.json`.

## Entry file

`src/index.css` is generated. `bwp-ds build` and both scaffold commands write
it: one `@import` per token file in alphabetical order, then one per component
in alphabetical order. `bwp-ds lint` reports `DS-E070` when it is missing,
unreadable, or does not match the files on disk; run `bwp-ds build` to fix it.
Never edit it by hand. The PostCSS bundle `dist/styles.css` is built from it.

## Scaffolding and the lint loop

`bwp-ds scaffold tokens <category>` and
`bwp-ds scaffold component <name> --axis a=v1,v2 [--axis b=w1,w2 ...] --state s1,s2 --slot x --root-element button`
write files that satisfy every rule above and leave `TODO` markers where you
fill in values. Repeat `--axis` once per axis. `--state` and `--slot` each
take one comma-separated list. A remaining `TODO` in any token file, component
CSS file, or manifest is `DS-E050`, so a half-filled scaffold cannot pass.
Scaffold never overwrites an existing file (the entry file is the one
exception, it is regenerated), rejects duplicate axis names, axis values, and
slot names, and takes the first value of each axis as its default.
`--root-element <element>` sets `slots.root.element` (default `div`) and
decides how the `disabled` state is written: `:disabled` for form controls,
`[aria-disabled="true"]` otherwise. Lint warns `DS-W003` when hand-written CSS
uses `:disabled` or `[disabled]` on a root that is not a form control.

Loop: edit one file, run `bwp-ds lint`, fix every error, move on. Finish with
`bwp-ds build`.
