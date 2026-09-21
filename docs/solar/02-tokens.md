---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/tokens: dfb943521b08
---

# 02 · Tokens

> Source: Figma page "Tokens" (Tokens, Primitive vs Semantic Tokens, Responsibilities,
> Token Naming Grammar, CSS Implementation Contract, Golden Rules), cross-checked with
> the four variable collections. The exact inventory is in
> [tokens/figma-variables.json](tokens/figma-variables.json).

## Why tokens

Tokens are the operational foundation of SOLAR. They turn design decisions (color,
typography, spacing, motion, elevation, sizing, responsiveness) into named, shared
system values that align design and engineering across Biamp products. More than
visual variables, tokens define structure, behaviour, and accessibility at the system
level.

Tokens let Biamp:

- Create a shared contract between design and engineering
- Enforce consistency across products, platforms, and teams
- Centralize accessibility at the foundation
- Support theming, modes, and responsive behaviour
- Version and evolve the system safely (Semantic Versioning)
- Make system-wide updates without refactoring components

"Without tokens, consistency is manual. With tokens, consistency is systemic."

**Tokens are not** component styles, hard-coded values, local design decisions, or
visual decoration. They are the layer beneath components, the layer that ensures change
is intentional, traceable, and scalable.

## Three tiers

| Tier                        | What it is                                                                                                             | Examples                                                   | Who uses it                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| **Primitive** (base)        | Raw, context-free values: palettes, sizes, numeric scales. Stable, rarely change.                                      | `color/blue/500`, `spatial/scale/4`, `type/font-size/14`   | Only other tokens. **Never used directly in UI.**     |
| **Semantic**                | Intent and usage: what a value is _for_. Map to primitives under the hood.                                             | `color.text.primary`, `stack.md`, `radius.control`         | Designers and engineers. **The tokens products use.** |
| **Component** (when needed) | Scoped, intentional overrides for one component when semantics are not enough. Must still map back to semantic tokens. | `ui-primary-default` (illustrative), `button.space.inline` | Sparingly, to avoid fragmentation and drift.          |

In the Figma file this maps to four collections:

| Collection     | Tier      | Modes           | Count | Contents                                                                                                                                          |
| -------------- | --------- | --------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Primitives** | primitive | Mode 1          | 265   | `color/*` palettes and alphas, `type/*` sizes, line heights, families, weights, `spatial/*` scale, border widths, radii, `viewport/*`, `motion/*` |
| **Color**      | semantic  | Light, Dark     | 287   | `surface/*`, `text/*`, `icon/*`, `border/*`, `shadow/*` (colors), `action/*`, `data/*`, `brand/*`, `meter/*`, `control/*`                         |
| **Spatial**    | semantic  | Default         | 34    | `inset/*`, `stack/*`, `radius/*`, `border/*` (widths), `icon/*` (sizes)                                                                           |
| **Type**       | semantic  | Desktop, Mobile | 41    | `size/{role}/{size}` and `line-height/{role}/{size}`                                                                                              |

Text styles (60) and effect styles (9) sit on top of these variables and are how
typography and shadows are actually applied in Figma.

## Naming grammar

SOLAR token names follow a structured grammar so that designers and engineers can
predict names without memorizing them, and so tooling can validate usage.

### Separators by context

| Context        | Separator                  | Example                                  |
| -------------- | -------------------------- | ---------------------------------------- |
| Figma variable | `/`                        | `surface/base` (in the Color collection) |
| Documentation  | `.`                        | `color.surface.base`                     |
| CSS            | `-` with `--solar-` prefix | `--solar-color-surface-base`             |

Never mix separator styles within one context. Note that Figma variable names omit the
collection category: `surface/base` in the Color collection is documented as
`color.surface.base`; `inset/md` in the Spatial collection is documented as `inset.md`.

### Color

```
color.{category}.{role}
color.{category}.{modifier}.{role}
color.action.{intent}.{property}.{state}
color.data.{type}.{identifier}
```

| Segment             | Allowed values                                                                                                                      |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| category            | `surface`, `text`, `border`, `icon`, `action`, `data`                                                                               |
| role                | `primary`, `secondary`, `tertiary`, `inverse`, `disabled`, `default`, `subtle`, `strong`, `base`, `raised`, `overlay`, `background` |
| modifier (feedback) | `success`, `warning`, `danger`, `info` (the inventory also has `neutral`)                                                           |
| intent (action)     | `primary`, `secondary`, `tertiary`, `primary-danger`                                                                                |
| property (action)   | `bg`, `text`, `icon`, `border`                                                                                                      |
| state (action)      | `default`, `hover`, `focus`, `active`, `disabled`                                                                                   |
| type (data)         | `category`, `scale`, `delta`                                                                                                        |

How the grammar is realised in the actual variables:

- Feedback colors carry an explicit `feedback` segment: `text/feedback/danger`,
  `surface/feedback/success/subtle`, `border/feedback/focus/strong`.
- The destructive action intent is stored as a `danger` segment after the property:
  `action/primary/bg/danger/hover`. The docs write the same token as
  `color.action.primary-danger.bg.hover`. Both refer to the same variable.
- `focus` is not an action state variable; focus is expressed by
  `border/feedback/focus/*` and the `shadow/focus/*` effect styles.
- Data categories are two-digit and have `strong`/`subtle` tones:
  `data/category/01/strong`.

### Spatial

```
spatial.{type}.{size}   — primitives: scale, border-width, border-radius, viewport
stack.{size}            — vertical spacing between siblings
inset.{size}            — padding inside containers
icon.size.{size}        — icon dimensions
```

| Segment                   | Allowed values                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| type                      | `scale`, `border-width`, `border-radius`, `viewport`                                          |
| size (spatial primitives) | `none`, `sm`, `md`, `lg`, `xl`, `full`                                                        |
| name (scale)              | integer index `0`…`22`                                                                        |
| name (viewport)           | `xs`, `sm`, `md`, `lg`, `xl`                                                                  |
| size (stack/inset/icon)   | `none`, `2xs`, `xs`, `sm`, `md`, `lg`, `xl`, `2xl` (inventory also has `3xl` for inset/stack) |

Semantic radius and border width are named by role, not size: `radius.none`,
`radius.subtle`, `radius.control`, `radius.container`, `radius.dialog`, `radius.pill`;
`border.none`, `border.default`, `border.strong`, `border.emphasis`. Icon sizes are
stored as `icon/xs`…`icon/2xl` in the Spatial collection (the grammar slide writes
`icon.size.{size}`).

### Typography

```
typography.{property}.{scale}
```

| Segment  | Allowed values                                                             |
| -------- | -------------------------------------------------------------------------- |
| property | `font-family`, `font-size`, `font-weight`, `line-height`, `letter-spacing` |
| scale    | numeric for size/height/spacing; named for family/weight                   |

In Figma the primitives are `type/font-size/16`, `type/line-height/24`,
`type/font-family/inter`, `type/font-weight/500`; the semantic Type collection is
`size/body/md` and `line-height/body/md` with Desktop/Mobile modes; the composed text
styles are `body/md/regular` etc. The Typography chapter refers to composed styles as
`font.desktop.body.md.regular` / `font.mobile.…`. See [06-typography.md](06-typography.md).

### Motion

```
motion.{property}.{scale}
```

| Segment          | Allowed values                                                             |
| ---------------- | -------------------------------------------------------------------------- |
| property         | `duration`, `easing` (Figma: `motion/duration/*`, `motion/ease/*`)         |
| scale (duration) | `instant` (0), `fast` (100), `normal` (300), `slow` (600), `slower` (900)  |
| scale (easing)   | `ease-out` (entrances), `ease-in` (exits), `ease-both` (state transitions) |

### Shadow

```
shadow.{category}.{variant}   — functional: focus rings, feedback outlines
shadow.{level}                — elevation
```

| Segment  | Allowed values                           |
| -------- | ---------------------------------------- |
| category | `focus`, `feedback`                      |
| variant  | `default`, `danger`                      |
| level    | `control`, `raised`, `overlay`, `dialog` |

Shadows exist twice in Figma: as **color variables** (`shadow/subtle`, `shadow/strong`,
`shadow/feedback/{focus,danger,warning,success,info,neutral}`) that switch with Light/Dark,
and as **effect styles** (`shadow/control`, `shadow/raised`, `shadow/overlay`,
`shadow/dialog`, `shadow/strong`, `shadow/focus/default`, `shadow/focus/danger`,
`shadow/danger`, `shadow/warning`) that compose offset, blur, spread and a bound shadow
color. In CSS, the effect styles become the `--solar-shadow-*` composites.

### Valid and invalid examples

Valid: `color.text.primary`, `color.action.primary.bg.hover`, `color.data.category.01`,
`spatial.border-radius.lg`, `stack.md`, `motion.duration.fast`, `shadow.overlay`.

Invalid: `color.primary.text` (wrong order), `color.button.background` (component name
in token), `color.red.500` (primitive reference in UI).

## CSS implementation contract

Every SOLAR token translates to a CSS custom property with one formula: **add the
`--solar-` prefix and replace path separators with hyphens.**

```
color.surface.base          → --solar-color-surface-base
spatial.border-radius.lg    → --solar-spatial-border-radius-lg
motion.duration.normal      → --solar-motion-duration-normal
```

Rules:

1. All visual values in code must reference CSS custom properties, never raw hex, px,
   or rem values.
2. The `--solar-` prefix is mandatory for all SOLAR tokens.
3. Product-specific overrides must use a product prefix (e.g.
   `--biamp-producto-custom-value`) and must not redefine `--solar-` properties.
4. Dark mode is handled via CSS custom property reassignment under a
   `[data-theme="dark"]` or `prefers-color-scheme: dark` context. Component code never
   changes.

Resolved Light and Dark values for every semantic token are in
[tokens/figma-variables.json](tokens/figma-variables.json) and summarised in
[14-theming.md](14-theming.md).

## Responsibilities

| Design owns                                                                | Engineering owns                                                        | Accessibility (shared, starts with tokens)                                               |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Meaning, structure and intent of tokens                                    | Implementation, distribution and runtime behaviour of tokens            | Tokens are designed and validated so every component using them is accessible by default |
| Define semantic token names and intended usage                             | Consume semantic tokens only, never raw values                          | Color tokens meet WCAG contrast in intended contexts                                     |
| Ensure tokens meet accessibility (contrast, legibility, touch targets)     | Map tokens correctly across Web, Desktop, Mobile and Embedded platforms | Typography tokens have readable sizes and line heights                                   |
| Keep brand and layout decisions at token level, not embedded in components | Support theming, modes and system settings at runtime                   | Spacing tokens support focus, touch and interaction needs                                |
| Use tokens consistently in Figma via variables, styles and modes           | Enforce consistent token usage across components and codebases          | State tokens (hover, focus, disabled) are explicit and testable                          |
| Introduce new visual values only through tokens                            | Avoid hard-coding values already represented by tokens                  | Accessibility failures are token issues, not component exceptions                        |

## Golden rules

1. **Use semantic tokens, not raw values.** Raw values bypass the system, create
   inconsistencies, and make change risky.
2. **Change tokens, not components.** Tokens are the source of truth; components are
   consumers. System-level changes happen at the system level.
3. **One meaning = one token.** If two tokens serve the same purpose the system becomes
   ambiguous.
4. **Accessibility is defined at the token level.** If contrast, spacing, or typography
   fail at the token level, every component that uses them fails too. Fix the
   foundation, not the symptoms.

## Worked example: one button, six tokens

The Tokens page annotates a single desktop button to show how tokens compose:

| Property      | Token (as annotated)                  | Actual Figma variable / style                                |
| ------------- | ------------------------------------- | ------------------------------------------------------------ |
| Background    | `color.action.primary.bg.default`     | Color › `action/primary/bg/default`                          |
| Border        | `color.action.primary.border.default` | Color › `action/primary/border/default`                      |
| Label type    | `font.desktop.label.md`               | Text style `label/md` (Type mode Desktop)                    |
| Padding       | `size.inset.md`                       | Spatial › `inset/md` (16 px)                                 |
| Corner radius | `size.radius.control`                 | Spatial › `radius/control` (6 px)                            |
| Shadow        | `shadow.subtle`                       | Effect style `shadow/control` bound to color `shadow/subtle` |

(The annotation uses a `size.` prefix for spatial tokens that the naming grammar and
the Theming chapter do not; treat `inset.md` / `radius.control` as canonical.)
