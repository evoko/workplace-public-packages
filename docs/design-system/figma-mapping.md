# Design file to source mapping

Deterministic rules for turning a design file (Figma or similar) into tokens
and components. Apply these rules; do not choose. Anything the rules do not
cover goes into the report as an ambiguity.

## Variables and styles to token categories

| In the design file                                             | Category                                                                                  |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Color variables and color styles                               | `color`                                                                                   |
| Number variables used for padding, gap, margin                 | `space`                                                                                   |
| Number variables used for corner radius                        | `radius`                                                                                  |
| Text style font family                                         | `font-family`                                                                             |
| Text style font size                                           | `font-size`                                                                               |
| Text style font weight                                         | `font-weight`                                                                             |
| Text style line height                                         | `line-height` (unitless when the design gives a percentage of font size; `px` when fixed) |
| Text style letter spacing                                      | `letter-spacing`                                                                          |
| Effect styles of type drop shadow or inner shadow              | `shadow` (inner shadow is `inset`)                                                        |
| Number variables used for stroke width                         | `border-width`                                                                            |
| Prototype transition durations                                 | `duration`                                                                                |
| Prototype easing curves                                        | `easing`                                                                                  |
| Layer opacity used as a design decision (for example disabled) | `opacity`                                                                                 |
| Stacking order values                                          | `z-index`                                                                                 |
| Fixed widths or heights of controls and icons                  | `size`                                                                                    |

Variable collections map to files only through the category of each variable;
a collection named "Brand" contributes to `color.css`, `space.css`, and so on.

## Modes

The design file's mode names map to `ds.config.json` `modes`. If the design has
"Light" and "Dark", the config has `["light", "dark"]`. A variable whose value
differs per mode is declared in `:root` and in every other mode block. A
variable that is the same in every mode is declared only in `:root`.

## Names

Design names use slashes and title case: `Color/Text/On Primary`. Token names
use the prefix, the category, and lowercase kebab-case segments:
`--bwp-color-text-on-primary`.

1. Drop the leading group when it repeats the category (`Color/…` for a color).
2. Lowercase everything.
3. Replace spaces and slashes with hyphens; collapse repeats.
4. Numeric scales keep the number: `Grey/900` becomes `--bwp-color-grey-900`;
   `Space/4` becomes `--bwp-space-4`.
5. State words stay as the last segment: `default`, `hover`, `active`,
   `disabled`.
6. Never encode a mode in the name (`--bwp-color-text-dark` is wrong; use the
   mode block).

Record each mapping as a row in `packages/styles-css/src/tokens/MAPPING.md`.

## Components

| In the design file                                               | In the manifest and CSS                                                                                                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Component or component set name                                  | `name` (kebab-case), `displayName`                                                                                                                     |
| Variant property with several options                            | an axis; its options are the axis `values`; the variant the design marks as default goes in the axis's `default` field (do not rename it to `default`) |
| Boolean property that shows or hides a layer                     | an `optional: true` slot                                                                                                                               |
| Boolean property that changes appearance                         | a `data-state` state                                                                                                                                   |
| Instance-swap property                                           | a slot                                                                                                                                                 |
| Interactive component states (hover, pressed, focused, disabled) | states `hover`, `active`, `focus-visible`, `disabled`                                                                                                  |
| Named layers inside the component (label, icon, indicator)       | slots, kebab-case                                                                                                                                      |
| Component that is activated by click or key                      | `slots.root.element = button` (or `a` when it navigates); an input-like component uses `input`, `select`, or `textarea`; anything else stays `div`     |
| Auto-layout padding, gap                                         | `padding-*`, `row-gap`, `column-gap` with `space` tokens                                                                                               |
| Fill                                                             | `background-color` with a `color` token                                                                                                                |
| Stroke                                                           | `border-*-width`, `border-*-style: solid`, `border-*-color`                                                                                            |
| Corner radius                                                    | `border-radius` with a `radius` token                                                                                                                  |
| Text style                                                       | `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing` tokens                                                                      |
| Effect                                                           | `box-shadow` with a `shadow` token                                                                                                                     |
| Fixed width or height                                            | `width`, `height`, `min-*` with `size` tokens                                                                                                          |

The default value of every axis is styled by the base rule. Only non-default
values get their own `[data-<axis>="<value>"]` rule.

## Values with no token

If a component uses a color, spacing, radius, font value, shadow, border
width, duration, or easing that no token provides, add the token to its
category file first, record the mapping, then reference it. Never write the
literal in the component.

## Never do

- Write a literal where a token is required.
- Create a category outside the fixed set.
- Put a state or axis on a slot selector.
- Edit `generated/` output or `design.ir.json`.
- Skip `bwp-ds lint` between files.
- Resolve an ambiguity silently. Write it in the report.
