# Color

> Verbatim text of the Figma page `Color` (id `763:50347`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `6cdc7fe02d26`. Curated chapter: [05-color.md](../../05-color.md).

## Slide 1

### Visual Language Color

## Color Principles

#### Color in SOLAR is never decorative. It exists to communicate meaning, hierarchy, and state, and must always be applied through semantic tokens rather than base colors or hex values. If a color choice cannot be explained in terms of intent or hierarchy, it does not belong.

##### Color has purpose

##### Semantic over base

##### Accessibility is non-negotiable

Every color in SOLAR communicates something. Colors are used to indicate roles such as primary content, secondary content, success, warning, error, or interactive state. Color should never be used purely for decoration or branding flair—if it does not convey meaning, it should not exist as a token.

Design and engineering should always use semantic color tokens. Base colors exist only to support the system internally and may change without notice. Semantic tokens protect intent, allow theming, and ensure consistency across products and platforms.

All color tokens in SOLAR are designed to meet accessibility requirements in their intended contexts. Contrast, legibility, and state differentiation must be validated at the token level, not fixed in components. If a color fails accessibility, it is a system issue—not a local exception.

## OKLCH

#### A perceptual color model for precise and consistent design. SOLAR uses OKLCH as the foundation of its color system because it reflects how humans perceive color. Unlike RGB or HSL, OKLCH separates brightness, intensity, and hue into independent dimensions, allowing us to build palettes that are visually balanced, scalable, and consistent across all colors.

##### L — Lightness

##### C — Chroma

##### H — Hue

Lightness defines how bright or dark a color appears to the human eye. In SOLAR, lightness creates the structural hierarchy of every palette, ensuring smooth tonal transitions and alignment across all color families.

Chroma controls the intensity or vividness of a color. Higher chroma feels energetic and expressive, while lower chroma feels softer and more neutral. SOLAR uses relative chroma scaling to maintain consistency without flattening personality.

Hue defines the color family — red, blue, green, etc. In SOLAR, hue remains stable across steps to preserve identity and prevent unwanted color drift, ensuring clarity and brand consistency.

###### Controls perceived brightness

###### Controls color intensity

###### Defines the color family

Defines visual hierarchy\
Ensures smooth tonal transitions\
Aligns structure across all palettes\
Shared lightness curve guarantees consistency

Higher chroma → more vivid and expressive\
Lower chroma → more neutral and subtle\
Scales relatively within each palette\
Enables controlled emphasis (400 bump)

Red, Orange, Yellow, Green, Blue, etc.\
Maintained consistently across steps\
Prevents color drift (e.g., blue turning cyan)\
Preserves brand identity

## Lightness

#### Lightness defines the structural foundation of every SOLAR palette. It controls perceived brightness and ensures visual hierarchy remains consistent across all colors.

Why it matters:\
Creates predictable tonal progression\
Aligns all palettes visually\
Enables consistent layering and emphasis\
Forms the backbone of accessibility evaluation

##### SOLAR Lightness Curve

| Step | Lightness (L) | Role                    |
| ---- | ------------- | ----------------------- |
| 900  | 0.16          | Deep contrast / dark UI |
| 800  | 0.22          | Strong structural       |
| 700  | 0.37          | Dense UI surfaces       |
| 600  | 0.51          | Heavy brand support     |
| 500  | 0.58          | Brand anchor            |
| 400  | 0.66          | Emphasis                |
| 300  | 0.75          | Expressive              |
| 200  | 0.86          | Soft accent             |
| 100  | 0.92          | Light surface           |
| 50   | 0.98          | Luminous background     |

_[image: SOLAR Lightness Curve 1]_

## Chroma

#### Chroma defines the intensity of a color. It determines how vivid or muted a color feels, without changing its brightness.

Why it matters:\
Controls emotional energy\
Prevents washed-out palettes\
Prevents neon over-saturation\
Enables controlled emphasis

SOLAR does not use identical chroma values across hues. Instead, it uses relative scaling from each palette’s 500 anchor.

##### SOLAR Chroma Scaling Logic

| Step | % of C500 | Purpose         |
| ---- | --------- | --------------- |
| 900  | 40%       | Deep muted      |
| 800  | 55%       | Controlled base |
| 700  | 80%       | Strong tone     |
| 600  | 95%       | Near anchor     |
| 500  | 100%      | Brand anchor    |
| 400  | 115%      | Emphasis bump   |
| 300  | 105%      | Expressive      |
| 200  | 75%       | Soft accent     |
| 100  | 50%       | Gentle tint     |
| 50   | 20%       | Surface glow    |

_[image: SOLAR Chroma Scaling Curve (Relative) 1]_

## Hue

#### Hue defines the color family and preserves identity across tonal variation. It ensures a color remains clearly recognizable as it scales.

Why it matters:

Maintains brand clarity\
Prevents color drift\
Keeps palettes disciplined\
Aligns identity across UI states

##### SOLAR Base Hue Anchors

| Color     | Hue (° approx) | Anchor Color |
| --------- | -------------- | ------------ |
| Red       | 23°            | #E0032D      |
| Orange    | 40°            | #CF4700      |
| Yellow    | 91°            | #ECB600      |
| Green     | 142°           | #009600      |
| Turquoise | 200°           | #08B8C9      |
| Blue      | 263°           | #2569FD      |
| Purple    | 283°           | #7B3AFF      |
| Pink      | 330°           | #E136BC      |

_[image: SOLAR Hue Distribution Across Core Palettes 1]_

## Semantic Colors

_[image: Table Container]_

#### Semantic colors are defined in SOLAR Web and SOLAR Native rather than in SOLAR Foundations. They translate primitive color values into functional interface roles such as text, surface, border, and interaction states.

SOLAR Foundations provides the primitive color scales that define the visual language of the system. SOLAR Web, SOLAR Native, and domain libraries build on these primitives by defining semantic tokens that map colors to their intended UI meaning.

This separation allows the same color foundations to be reused across platforms while enabling each library to define the appropriate semantic structure for its components and interaction patterns.

Semantic tokens always reference values from SOLAR Foundations, ensuring visual consistency while maintaining flexibility across products and technologies.

Examples:\
color.text.primary\
color.surface.background\
color.border.subtle\
color.icon.success

## Surface Colors

#### Surface colors define the visual layers of the interface. In SOLAR, surfaces create structure, separation, and depth, and must always be applied through semantic tokens rather than raw colors. Surface colors establish where content lives and how layers relate to each other across layouts and states.

Surface color tokens express the role of a surface, not its appearance. Tokens define whether a surface is a base background, a raised container, an overlay, or an interactive region, allowing surfaces to adapt consistently across themes, modes, and platforms.

Examples:\
color.surface.base\
color.surface.subtle\
color.surface.raised\
color.surface.overlay

Surface color tokens ensure visual hierarchy, predictable layering, and accessibility. Changes to surface contrast or theming should happen at the token level so all dependent layouts update consistently.

_[image: Screenshot 2026-02-24 at 13.46.23 1]_

## Border Colors

#### Border colors define separation, boundaries, and focus in the interface. In SOLAR, borders are used deliberately to clarify structure and interaction, not to decorate or outline everything by default. Border colors must always be applied through semantic tokens to ensure consistency and accessibility.

Border color tokens express the role of a boundary rather than its visual value. Tokens define whether a border separates content, indicates focus, signals interaction, or communicates state, allowing borders to adapt across themes, modes, and platforms.

Examples:\
color.border.subtle\
color.border.strong\
color.border.focus\
color.border.error

Border color tokens help maintain clear hierarchy, predictable interaction feedback, and accessible focus states. If a border does not communicate structure or state, it likely does not belong.

_[image: image 1]_

## Feedback Colors

#### Feedback colors communicate system status, validation results, and contextual meaning in the interface. In SOLAR, feedback colors are reserved for functional communication — not decoration. They signal success, warning, error, or informational states clearly and consistently across components, patterns, and platforms.

Feedback color tokens express semantic intent rather than specific hues. They define the role of the message (success, warning, error, info) and adapt automatically across light/dark modes and accessibility requirements.

Feedback tokens exist across multiple layers — surface, border, text, and icon — ensuring complete and coherent state communication.

Feedback colors must always be applied through semantic tokens to maintain consistency, hierarchy, and WCAG compliance.

Examples:\
color.surface.success\
color.text.error\
color.border.warning\
color.icon.info

Feedback colors create predictable, accessible state communication. If color implies meaning without a semantic feedback token, it bypasses the system.

_[image: Screenshot 2026-02-24 at 13.51.40 1]_

## Action Colors

#### Action colors define interactive intent in the interface. In SOLAR, they signal what the user can do — primary actions, secondary actions, and subtle or tertiary interactions. Unlike feedback colors (which communicate system state), action colors communicate affordance and priority.

Action color tokens are structured around interaction hierarchy, not specific hues.

They define:\
What is the primary call-to-action\
What is a secondary or supporting action\
What is a low-emphasis / tertiary action

Action tokens automatically handle:\
Light & dark modes\
Hover / focus / active / disabled states\
Brand alignment (e.g. Blue 500 for primary, Red 500 for destructive)\
Accessibility contrast requirements

Action tokens exist across multiple layers — surface, border, text, and icon — ensuring consistent interaction behavior across components.

Examples:\
color.action.primary.bg.default\
color.action.secondary.text.default\
color.action.primary-danger.border.default

_[image: Screenshot 2026-02-25 at 14.00.22 1]_

## Data Color

#### Data colors represent information in charts and dashboards. In SOLAR, they are used exclusively for visualizing values, categories, and comparisons — not for actions or system feedback.

Data color tokens define how data is distinguished and scaled while remaining accessible and visually balanced across Light and Dark modes.

They are structured into three types:\
Categorical — for multi-series charts: color.data.category.01\
Sequential — for intensity or range scales: color.data.scale.100\
Delta — for negative ↔ positive comparison: color.data.delta.positive.500

_[image: Screenshot 2026-02-25 at 11.19.40 1]_

## Color Density

#### Color density describes how much visual space different colors occupy on a screen. In product interfaces, most pixels are neutral surfaces — not brand colors.

In SOLAR, color is distributed intentionally to create hierarchy and clarity:\
Neutral surfaces dominate the visual field.\
Text colors appear frequently but occupy little pixel area.\
Action colors are sparse but high attention.\
Data colors are contextual and can spike on analytics screens.

Color density is not about how many tokens exist — it’s about how much visual weight they carry.

Typical Enterprise UI Density (Light Mode):

```
Surfaces (neutral backgrounds)
Text (neutral foreground)
Data visualization colors
Action / Brand colors
Borders
Icons
Shadows / overlays
```

```
~65%
~8%
~10%*
~6%
~2%
~2%
<1%
```

Key Principle:\
The personality of the product is defined by its neutral system.\
Brand colors should be loud in meaning, not large in area.

## Applying Color in Figma

_[image: Table Container]_

#### Color in SOLAR is applied through semantic variables — never directly through primitive values.

In Figma, designers do not select raw colors.\
They apply semantic tokens that express intent (surface, text, border, action, data).

Semantic variables are connected to primitives under the hood.

This allows:\
Light / Dark mode switching\
Centralized updates\
Accessibility adjustments\
Brand evolution without redesign

If a layer uses a raw HEX value, it bypasses the system.

How to Apply Color

1. Select layer\
2. Choose Fill / Stroke / Text color\
3. Apply a Semantic variable:\
   color.surface._\
   color.text._\
   color.border._\
   color.action._\
   color.data.\*

Correct vs Incorrect

Correct\
color.surface.base\
color.text.primary\
color.border.default\
color.action.primary.bg.default

Incorrect\
#FFFFFF\
color.neutral.50 (primitive)\
Copy-pasted color from another frame

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Color
domain: Visual Language > Color System
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR color specialist. All color decisions must use SOLAR color tokens. Never recommend a raw hex, RGB, or HSL value — always reference a token path.

[SCOPE]
- Primitive color palette (hue × shade scales)
- Semantic color roles and mappings
- Light mode and dark mode token swaps
- Accessible color combinations
- Data visualization palette
- Feedback colors (success, warning, error, info)

[PALETTE_STRUCTURE]
primitives: full hue scales — e.g., blue-50 through blue-950, neutral-0 through neutral-1000
semantic: purpose-driven aliases that reference primitives
  color.text.{primary|secondary|tertiary|disabled|inverse|on-color}
  color.surface.{default|subtle|raised|overlay|inverse}
  color.border.{default|subtle|strong|interactive|error}
  color.icon.{default|secondary|disabled|inverse|on-color}
  color.action.{primary|secondary|tertiary}.{bg|text|icon}.{default|hover|active}
  color.feedback.{success|warning|error|info}.{default|subtle|strong|text|icon}

[THEMING]
light_mode: semantic tokens alias lighter primitives (e.g., surface.default → neutral-0)
dark_mode: semantic tokens alias darker primitives (e.g., surface.default → neutral-900)
swap_mechanism: same semantic token name, different underlying primitive per mode
rule: components ONLY consume semantic tokens — theme swaps are automatic

[DATA_VIZ_PALETTE]
categorical: 6–8 distinct hues optimized for distinguishability
sequential: single-hue ramps for ordered data (light → dark)
diverging: two-hue ramps meeting at a neutral midpoint
colorblind_safe: all palettes tested for deuteranopia, protanopia, tritanopia
rule: data viz palette is separate from UI palette — never reuse semantic UI colors for data encoding

[CONTRAST_RULES]
text/normal: ≥ 4.5:1 against background
text/large: ≥ 3:1 (18px+ or 14px+ bold)
ui_components: ≥ 3:1 for borders, icons, form controls
focus_ring: ≥ 3:1 against both component and surrounding surface
feedback_colors: must pass contrast on both light and dark surfaces

[AGENT_BEHAVIOR]
- When asked "what color should X be?", respond with the semantic token path, not a hex value
- Always verify contrast ratio when pairing foreground/background tokens
- If a needed color role doesn't exist, draft a token proposal: name, category, alias target, rationale
- When reviewing designs, flag any raw color values as violations
- Test every color recommendation against both light and dark mode
- For data viz, recommend from the dedicated palette — never the UI palette

[CONSTRAINTS]
- never use primitive color tokens directly in UI — always semantic
- never introduce hues outside the primitive palette without governance approval
- never use feedback colors (success, warning, error, info) decoratively — semantic purpose only
- never pair foreground/background that fails WCAG AA contrast
- never assume a color works in dark mode without verifying the semantic token swap
- brand-specific color overrides must go through the theming system
@END:PAGE_CONTEXT
```
