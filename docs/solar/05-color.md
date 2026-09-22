---
solar:
  reviewed: 2026-09-22
  figmaVersion: '2402047167094879156'
  sources:
    documentation/color: c157f4a1cc5f
    primitives/color: d9f38cc14287
---

# 05 · Color

> Source: Figma pages "Visual Language › Color" (principles, OKLCH, lightness, chroma,
> hue, semantic / surface / border / feedback / action / data colors, color density,
> applying color in Figma), "Primitives › Color" (all palette and semantic tables) and
> the Color page's `@SOLAR:PAGE_CONTEXT`. Every value below is taken from the Figma
> variables; see [tokens/figma-variables.json](tokens/figma-variables.json).

## Principles

| Principle                           | Meaning                                                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Color has purpose**               | Every color communicates a role: primary content, secondary content, success, warning, error, interactive state. If it does not convey meaning, it should not exist as a token. |
| **Semantic over base**              | Always use semantic tokens. Base (primitive) colors exist only to support the system internally and may change without notice.                                                  |
| **Accessibility is non-negotiable** | Contrast, legibility, and state differentiation are validated at the token level. If a color fails accessibility it is a system issue, not a local exception.                   |

## How the palette is built: OKLCH

SOLAR uses OKLCH because it models human perception. Lightness, chroma and hue are
independent, so palettes stay visually balanced across hues.

**Lightness curve** (shared by every hue):

| Step | L    | Role                    |
| ---- | ---- | ----------------------- |
| 900  | 0.16 | Deep contrast / dark UI |
| 800  | 0.22 | Strong structural       |
| 700  | 0.37 | Dense UI surfaces       |
| 600  | 0.51 | Heavy brand support     |
| 500  | 0.58 | Brand anchor            |
| 400  | 0.66 | Emphasis                |
| 300  | 0.75 | Expressive              |
| 200  | 0.86 | Soft accent             |
| 100  | 0.92 | Light surface           |
| 50   | 0.98 | Luminous background     |

**Chroma scaling** is relative to each hue's 500 anchor (not identical across hues):

| Step | % of C500 | Purpose         |
| ---- | --------- | --------------- |
| 900  | 40 %      | Deep muted      |
| 800  | 55 %      | Controlled base |
| 700  | 80 %      | Strong tone     |
| 600  | 95 %      | Near anchor     |
| 500  | 100 %     | Brand anchor    |
| 400  | 115 %     | Emphasis bump   |
| 300  | 105 %     | Expressive      |
| 200  | 75 %      | Soft accent     |
| 100  | 50 %      | Gentle tint     |
| 50   | 20 %      | Surface glow    |

**Hue anchors** stay stable across steps to prevent drift:

| Hue       | ≈ Hue ° | Anchor (500) |
| --------- | ------- | ------------ |
| Red       | 23°     | `#E0032D`    |
| Orange    | 40°     | `#CF4700`    |
| Yellow    | 91°     | `#ECB600`    |
| Green     | 142°    | `#009600`    |
| Turquoise | 200°    | `#08B8C9`    |
| Blue      | 263°    | `#2569FD`    |
| Purple    | 283°    | `#7B3AFF`    |
| Pink      | 330°    | `#E136BC`    |

## Primitive palette (Primitives collection)

| Family    | 900       | 800       | 700       | 600       | 500       | 400       | 300       | 200       | 100       | 50        |
| --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- | --------- |
| neutral   | `#111111` | `#222222` | `#333333` | `#484848` | `#646464` | `#878787` | `#A8A8A8` | `#C9C9C9` | `#E0E0E0` | `#F5F5F5` |
| red       | `#280000` | `#410001` | `#7E000F` | `#C00024` | `#E0032D` | `#F61D3C` | `#FF5F64` | `#FF9691` | `#FFC5BF` | `#FFE4DF` |
| orange    | `#240000` | `#3E0000` | `#790D00` | `#B33200` | `#CF4700` | `#FB5800` | `#FF8535` | `#FFAC73` | `#FFCDA5` | `#FFEEDA` |
| yellow    | `#271E00` | `#392C01` | `#836500` | `#C39900` | `#ECB600` | `#FFCD07` | `#FFDF4B` | `#FFEE7B` | `#FFF5A8` | `#FFFBD5` |
| green     | `#001300` | `#002400` | `#084D03` | `#24791D` | `#009600` | `#00B600` | `#51D845` | `#86EE7C` | `#B2FBAA` | `#ECFFE9` |
| turquoise | `#021A1E` | `#033238` | `#065F6A` | `#0896A6` | `#08B8C9` | `#0AD4E6` | `#3DE6F2` | `#8EF4FA` | `#C9FBFD` | `#F0FFFF` |
| blue      | `#01082D` | `#03144B` | `#0E3294` | `#2658D5` | `#2569FD` | `#3E7CFF` | `#6B9CFF` | `#9EC1FF` | `#C9DEFF` | `#E9F2FF` |
| purple    | `#140028` | `#24004B` | `#451091` | `#6226D1` | `#7B3AFF` | `#8E4BFF` | `#A777FF` | `#C5A9FF` | `#E2D2FF` | `#F4EDFF` |
| pink      | `#2A0021` | `#4A003D` | `#87006F` | `#C21AA7` | `#E136BC` | `#FF52CB` | `#FF86DA` | `#FFB3E7` | `#FFD6F2` | `#FFF1FA` |

Other primitive groups:

- `color/brand/*`: red `#D22730`, black `#000000`, white `#FFFFFF`, teal `#03768A`,
  light-blue `#85CCD3`, sand `#E5D4C0`, saffron `#FEBF0F`, plum `#7E2F7C`.
- `color/mono/*`: black `#000000`, white `#FFFFFF`.
- `color/alpha/*`: `black-05…90` and `white-05…90` in 10-point steps (plus 05),
  `transparent`, and tinted alphas `red|orange|green|turquoise|blue-{05,10,20,50}`,
  `dark-{red,orange,green,turquoise}-50`, `light-{red,orange,green,turquoise}-50`.
- `color/flow-accent/*`: teal `#008793`, green `#00BF72`, lime `#A8EB12`, cyan
  `#00FFF0`, blue `#0083FE`, red `#FF0000`, amber `#FDCF58`, magenta `#FC00FF`, aqua
  `#00DBDE`. Scoped to fills and strokes; used by SOLAR Flow wire/port accents.

Primitives are **never used directly in UI**.

## Semantic color (Color collection, Light | Dark)

Semantic tokens express the role of a color. The same name resolves to a different
primitive per mode. All tables list `Light → Dark`.

### Brand

| Token                   | Light       | Dark        | Usage                                             |
| ----------------------- | ----------- | ----------- | ------------------------------------------------- |
| `color.brand.primary`   | brand/red   | brand/red   | Key brand moments, highlights, brand-aligned UI   |
| `color.brand.secondary` | brand/black | brand/black | Supporting brand accents                          |
| `color.brand.tertiary`  | brand/white | brand/white | Branded surfaces needing a lighter brand presence |

Brand colors are used intentionally and sparingly, not for general UI structure. Brand
red is **not** the error color; use `color.text.feedback.danger`.

### Surface

| Token                      | Light          | Dark           | Usage                                                     |
| -------------------------- | -------------- | -------------- | --------------------------------------------------------- |
| `color.surface.background` | neutral/50     | neutral/900    | The base application canvas                               |
| `color.surface.base`       | mono/white     | neutral/800    | Primary content containers and default component surfaces |
| `color.surface.raised`     | mono/white     | neutral/800    | Cards, panels                                             |
| `color.surface.overlay`    | mono/white     | neutral/800    | Floating and temporary elements (dropdowns, popovers)     |
| `color.surface.dialog`     | mono/white     | neutral/800    | Dialogs, drawers, modal overlays                          |
| `color.surface.scrim`      | alpha/black-20 | alpha/black-20 | Semi-transparent backdrop behind modals and drawers       |
| `color.surface.muted`      | neutral/100    | neutral/700    | Subdued, de-emphasized content areas                      |
| `color.surface.inverse`    | neutral/900    | neutral/50     | High-contrast or inverted contexts                        |
| `color.surface.hover`      | alpha/black-05 | alpha/white-05 | Interactive surface highlight on pointer hover            |
| `color.surface.active`     | alpha/black-10 | alpha/white-10 | Persistent active/selected state on interactive surfaces  |

Elevated surfaces (base, raised, overlay, dialog) deliberately share one color; depth
is communicated by shadow, not surface contrast. See
[07-layering-elevation.md](07-layering-elevation.md).

### Feedback surfaces

Five sentiments (`success`, `warning`, `danger`, `info`, `neutral`) × four tones.

| Tone           | success (Light → Dark)         | warning                          | danger                     | info                                   | neutral                   |
| -------------- | ------------------------------ | -------------------------------- | -------------------------- | -------------------------------------- | ------------------------- |
| `subtle`       | green/50 → green/800           | orange/50 → orange/800           | red/50 → red/800           | turquoise/50 → turquoise/800           | neutral/50 → neutral/800  |
| `subtle-alpha` | light-green-50 → dark-green-50 | light-orange-50 → dark-orange-50 | light-red-50 → dark-red-50 | light-turquoise-50 → dark-turquoise-50 | black-05 → white-05       |
| `medium`       | green/200 → green/600          | orange/200 → orange/600          | red/200 → red/600          | turquoise/200 → turquoise/600          | neutral/200 → neutral/600 |
| `strong`       | green/500 → green/400          | orange/500 → orange/400          | red/500 → red/400          | turquoise/500 → turquoise/400          | neutral/500 → neutral/400 |

Token form: `color.surface.feedback.{sentiment}.{tone}`. Subtle tones are for inline
alerts, banners, notifications; strong tones for high-emphasis badges, tags and status
indicators. Note that **info is turquoise**, not blue, and **warning is orange**, not
yellow.

### Text

| Token                         | Light          | Dark           | Usage                                               |
| ----------------------------- | -------------- | -------------- | --------------------------------------------------- |
| `color.text.primary`          | neutral/900    | neutral/50     | Main content                                        |
| `color.text.secondary`        | neutral/500    | neutral/300    | Supporting or contextual information                |
| `color.text.tertiary`         | neutral/300    | neutral/500    | Metadata, hints, non-critical details, placeholders |
| `color.text.disabled`         | alpha/black-20 | alpha/white-20 | Inactive or unavailable content                     |
| `color.text.inverse`          | brand/white    | neutral/900    | Text on dark or high-contrast surfaces              |
| `color.text.feedback.success` | green/600      | green/400      | Positive status, confirmation                       |
| `color.text.feedback.warning` | orange/600     | orange/400     | Caution                                             |
| `color.text.feedback.danger`  | red/600        | red/300        | Errors, critical issues, destructive outcomes       |
| `color.text.feedback.info`    | turquoise/700  | turquoise/400  | Neutral informational messages                      |
| `color.text.feedback.neutral` | neutral/500    | neutral/300    | Neutral feedback                                    |
| `color.text.link.default`     | blue/600       | blue/300       | Hyperlinks                                          |
| `color.text.link.hover`       | blue/500       | blue/200       | Hovered links                                       |
| `color.text.link.active`      | blue/600       | blue/300       | Pressed links                                       |
| `color.text.link.disabled`    | neutral/400    | neutral/600    | Disabled links                                      |

### Icon

Icon tokens mirror text tokens one-for-one so an icon beside a label matches
automatically:

| Token                                             | Light                                     | Dark                                      |
| ------------------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| `color.icon.primary`                              | neutral/900                               | neutral/50                                |
| `color.icon.secondary`                            | neutral/500                               | neutral/300                               |
| `color.icon.tertiary`                             | neutral/300                               | neutral/500                               |
| `color.icon.disabled`                             | alpha/black-20                            | alpha/white-20                            |
| `color.icon.inverse`                              | brand/white                               | neutral/900                               |
| `color.icon.feedback.success`                     | green/600                                 | green/400                                 |
| `color.icon.feedback.warning`                     | orange/600                                | orange/400                                |
| `color.icon.feedback.danger`                      | red/600                                   | red/400                                   |
| `color.icon.feedback.info`                        | turquoise/700                             | turquoise/400                             |
| `color.icon.feedback.neutral`                     | neutral/500                               | neutral/400                               |
| `color.icon.link.{default,hover,active,disabled}` | blue/600, blue/500, blue/600, neutral/400 | blue/300, blue/200, blue/300, neutral/600 |

### Border

| Token                         | Light          | Dark           | Usage                                          |
| ----------------------------- | -------------- | -------------- | ---------------------------------------------- |
| `color.border.subtle`         | alpha/black-10 | alpha/white-10 | Low-emphasis separators and dividers           |
| `color.border.medium`         | alpha/black-20 | alpha/white-20 | Hover-state border, between subtle and strong  |
| `color.border.strong`         | alpha/black-80 | alpha/white-80 | High-emphasis structural separation            |
| `color.border.disabled`       | alpha/black-20 | alpha/white-20 | Inactive elements                              |
| `color.border.inverse`        | neutral/500    | neutral/300    | Borders on dark or contrasting surfaces        |
| `color.border.inverse.subtle` | alpha/white-20 | alpha/black-20 | Subtle border on inverted surfaces             |
| `color.border.inverse.strong` | mono/white     | mono/black     | Strong border on inverted surfaces             |
| `color.border.surface`        | neutral/50     | neutral/900    | Flush border that blends with the page surface |
| `color.border.highlight`      | mono/white     | neutral/900    | Highlight edge                                 |

Feedback borders: `color.border.feedback.{focus|success|warning|danger|info|neutral}.{subtle|medium|strong}`.

| Sentiment | subtle (L → D)                | medium                        | strong                        |
| --------- | ----------------------------- | ----------------------------- | ----------------------------- |
| focus     | blue/100 → blue/800           | blue/300 → blue/600           | blue/500 → blue/400           |
| success   | green/100 → green/800         | green/300 → green/600         | green/500 → green/400         |
| warning   | orange/100 → orange/800       | orange/300 → orange/600       | orange/500 → orange/400       |
| danger    | red/100 → red/800             | red/300 → red/600             | red/500 → red/400             |
| info      | turquoise/100 → turquoise/800 | turquoise/300 → turquoise/600 | turquoise/500 → turquoise/400 |
| neutral   | neutral/100 → neutral/800     | neutral/300 → neutral/600     | neutral/500 → neutral/400     |

There is **no `color.border.default`** variable; use `subtle`, `medium` or `strong`
(what the Theming slide used to call "color.border.default = alpha-black-20" is
`color.border.medium`). There is also no `color.border.interactive`,
`color.border.focus` or `color.border.error`; use `color.border.medium`,
`color.border.feedback.focus.strong` and `color.border.feedback.danger.strong`. Borders
on interactive controls come from `color.action.{intent}.border.{state}`.

### Shadow colors

| Token                           | Light              | Dark               |
| ------------------------------- | ------------------ | ------------------ |
| `color.shadow.subtle`           | alpha/black-05     | alpha/black-50     |
| `color.shadow.strong`           | alpha/black-20     | alpha/black-70     |
| `color.shadow.feedback.focus`   | alpha/blue-20      | alpha/blue-20      |
| `color.shadow.feedback.danger`  | alpha/red-20       | alpha/red-20       |
| `color.shadow.feedback.warning` | alpha/orange-20    | alpha/orange-20    |
| `color.shadow.feedback.success` | alpha/green-20     | alpha/green-20     |
| `color.shadow.feedback.info`    | alpha/turquoise-20 | alpha/turquoise-20 |
| `color.shadow.feedback.neutral` | alpha/black-20     | alpha/white-20     |

Shadow alpha rises in dark mode (5 % → 50 %, 20 % → 70 %) because dark surfaces swallow
low-alpha shadows.

### Action

Action tokens describe interactive intent (`primary`, `secondary`, `tertiary`) × property
(`bg`, `text`, `icon`, `border`) × state (`default`, `hover`, `active`, `disabled`), each
with a `danger` (destructive) variant. Documentation writes the destructive intent as
`primary-danger`; Figma stores it as `action/primary/{property}/danger/{state}`.

⚠️ The revised Color and Borders page contexts write the state set as
`{default|hover|focus|pressed|disabled}`. The Color collection ships
`{default|hover|active|disabled}` — there is no `focus` or `pressed` state variable.
Use the variable spelling; the focus ring is `shadow/focus/*` plus
`color.border.feedback.focus.strong`, not an action state.

**Primary** (filled, high emphasis). Brand-neutral: black in Light, near-white in Dark.
Blue is reserved for links and focus rings and is never an action fill; `primary-danger`
is the only chromatic intent.

| Property | default (L → D)           | hover                    | active                    | disabled                        |
| -------- | ------------------------- | ------------------------ | ------------------------- | ------------------------------- |
| bg       | neutral/900 → neutral/50  | neutral/700 → mono/white | neutral/900 → neutral/50  | neutral/100 → neutral/800       |
| text     | mono/white → neutral/900  | mono/white → neutral/900 | mono/white → neutral/900  | neutral/400 → neutral/300       |
| icon     | mono/white → neutral/900  | mono/white → mono/white  | mono/white → mono/white   | neutral/300 → neutral/300       |
| border   | neutral/900 → neutral/100 | neutral/800 → mono/white | neutral/900 → neutral/100 | alpha/black-20 → alpha/white-20 |

**Primary danger**

| Property | default            | hover             | active            | disabled                        |
| -------- | ------------------ | ----------------- | ----------------- | ------------------------------- |
| bg       | red/500 → red/500  | red/400 → red/600 | red/500 → red/500 | neutral/100 → neutral/800       |
| text     | mono/white (both)  | mono/white (both) | mono/white (both) | neutral/400 → neutral/300       |
| icon     | brand/white (both) | mono/white (both) | mono/white (both) | neutral/300 → neutral/300       |
| border   | red/600 → red/600  | red/500 → red/700 | red/600 → red/600 | alpha/black-20 → alpha/white-20 |

**Secondary** (outlined, medium emphasis)

| Property | default                         | hover                           | active                          | disabled                        |
| -------- | ------------------------------- | ------------------------------- | ------------------------------- | ------------------------------- |
| bg       | mono/white → neutral/900        | neutral/50 → neutral/800        | mono/white → neutral/900        | neutral/100 → neutral/800       |
| text     | neutral/900 → neutral/50        | neutral/900 → neutral/50        | neutral/900 → neutral/50        | neutral/300 → neutral/500       |
| icon     | neutral/900 → neutral/50        | neutral/900 → neutral/50        | neutral/900 → neutral/50        | neutral/300 → neutral/500       |
| border   | alpha/black-20 → alpha/white-20 | alpha/black-30 → alpha/white-30 | alpha/black-30 → alpha/white-30 | alpha/black-10 → alpha/white-10 |

Secondary danger: bg `mono/white → neutral/900` (hover `red/50 → red/800`), text
`red/500 → red/300`, icon `red/500` (disabled `alpha/black-10 → alpha/white-10`),
border `red/100 → red/800` (disabled `alpha/black-10 → alpha/white-10`).

**Tertiary** (text-only, low emphasis: "Cancel", "Learn more"). Same bg/text/icon as
secondary; **all borders are `alpha/transparent`** in every state.

### Data

Reserved for charts and dashboards; never for actions or feedback. See
[10-data-visualization.md](10-data-visualization.md).

| Token                                     | Light → Dark                                                          |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `color.data.category.01.{strong,subtle}`  | red/500 → red/400 · red/50 → red/800                                  |
| `color.data.category.02.*`                | orange/500 → orange/400 · orange/50 → orange/800                      |
| `color.data.category.03.*`                | yellow/500 → yellow/400 · yellow/50 → yellow/800                      |
| `color.data.category.04.*`                | green/500 → green/400 · green/50 → green/800                          |
| `color.data.category.05.*`                | turquoise/500 → turquoise/400 · turquoise/50 → turquoise/800          |
| `color.data.category.06.*`                | blue/500 → blue/400 · blue/50 → blue/800                              |
| `color.data.category.07.*`                | purple/500 → purple/400 · purple/50 → purple/800                      |
| `color.data.category.08.*`                | pink/500 → pink/400 · pink/50 → pink/800                              |
| `color.data.scale.100…900`                | purple/100…900 in Light; **inverted** (purple/900…100) in Dark        |
| `color.data.delta.neutral`                | neutral/300 (both)                                                    |
| `color.data.delta.negative-{100,300,500}` | red/100 → red/800 · red/300 → red/700 · red/500 → red/500             |
| `color.data.delta.positive-{100,300,500}` | green/100 → green/800 · green/300 → green/700 · green/500 → green/500 |

## Domain tokens that live in Foundations

These belong to domain libraries conceptually but are defined in the shared Color
collection today.

**Audio meters**: `color.meter.nominal` green/500, `color.meter.warning` yellow/400,
`color.meter.peak` red/500 (same in both modes).

**Channel-strip controls**: `color.control.{neutral|mute|solo|phantom|phase}.{bg|border|icon}.{default|hover|active|disabled}`.
Default/hover/disabled states are neutral for all five; the **active** state carries the
control's identity:

| Control | active bg (L → D)        | active border                   | active icon              |
| ------- | ------------------------ | ------------------------------- | ------------------------ |
| neutral | neutral/50 → neutral/900 | alpha/black-10 → alpha/white-10 | neutral/900 → mono/white |
| mute    | red/50 → red/800         | red/100 → red/700               | red/500 (both)           |
| solo    | yellow/50 → yellow/800   | yellow/100 → yellow/700         | yellow/500 (both)        |
| phantom | purple/50 → purple/800   | purple/100 → purple/700         | purple/500 (both)        |
| phase   | blue/500 (both)          | blue/500 (both)                 | mono/white (both)        |

## Color density

In enterprise UI most pixels are neutral. Typical Light-mode distribution: surfaces
≈ 65 %, data-viz colors ≈ 10 %, text ≈ 8 %, action/brand ≈ 6 %, borders ≈ 2 %, icons
≈ 2 %, shadows/overlays < 1 %. "The personality of the product is defined by its
neutral system. Brand colors should be loud in meaning, not large in area."

## Applying color

In Figma: select layer → Fill / Stroke / Text color → apply a **semantic variable**
(`color.surface.*`, `color.text.*`, `color.border.*`, `color.action.*`, `color.data.*`).
Semantic variables are connected to primitives under the hood, which is what enables
Light/Dark switching, centralized updates, accessibility adjustments, and brand
evolution without redesign.

| Correct                           | Incorrect                            |
| --------------------------------- | ------------------------------------ |
| `color.surface.base`              | `#FFFFFF`                            |
| `color.text.primary`              | `color.neutral.50` (primitive)       |
| `color.action.primary.bg.default` | Color copy-pasted from another frame |

Feedback colors are never decorative. Data-viz colors are never reused for UI, and UI
semantic colors are never used for data encoding.

## Agent behaviour (from the page context)

- Answer "what color should X be?" with a semantic token path, never a hex.
- Verify contrast for every foreground/background pairing, in both modes.
- If a needed role does not exist, draft a token proposal (name, category, alias
  target, rationale); never introduce hues outside the primitive palette without
  governance.
- Flag raw color values and primitive references in components as violations.
- Brand-specific overrides go through the theming system.
