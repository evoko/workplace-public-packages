# Theming

> Verbatim text of the Figma page `Theming` (id `1114:9360`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `fd9f62704592`. Curated chapter: [14-theming.md](../../14-theming.md).

## Slide 1

### Theming

## Designing for Themes

#### Both designers and engineers must follow theming rules to ensure SOLAR interfaces work correctly in all display modes. The core principle is the same: consume semantic tokens only. Never reference primitives or hard-coded values.

##### Rules for Designers

Always design using semantic tokens — never primitive colors or hex values.\
Validate designs in both Light and Dark modes before handoff.\
Do not use surface or background assumptions (e.g., "this is white") — use the semantic role (color.surface.base).\
Check contrast in both modes: a combination passing AA in light mode may fail in dark mode if tokens are incorrectly applied.\
Use Figma's variable modes to preview both themes during design.\
Never override a semantic token with a primitive — this breaks theming.

##### Rules for Engineers

Consume semantic tokens only — never reference primitive values or hard-coded colors.\
Theme switching must be handled at the system or app shell level, not per component.\
Respect prefers-color-scheme media query for automatic system-level mode detection.\
Provide a manual toggle for users to override system preference.\
Test all components in both modes as part of acceptance criteria.\
Use CSS custom properties with the --solar- prefix for all token references.

_[image: image 1]_

## What Changes Between Modes

#### Understanding what changes and what stays constant between Light and Dark modes is critical. Token names, spacing, typography, and component structure remain identical — only color mappings shift.

##### What Changes

Surface and background colors invert\
Text and icon colors invert\
Border colors shift to maintain separation\
Action colors invert (neutral/900 → neutral/50)\
Shadow intensity may increase in dark mode

##### What Does NOT Change

Token names remain identical\
Typography (size, weight, line height) stays the same\
Spacing and layout tokens stay the same\
Component structure and behavior stay the same\
Motion durations and easing stay the same

##### Feedback Tokens

Feedback colors (success, warning, danger, info) use shifted steps between modes. For example, success uses green/500 in both modes for text, but green/50 in light and green/800 in dark for surfaces. The semantic meaning is always preserved.

| Feedback Surface         | Light Primitive | Dark Primitive | Light Hex | Dark Hex | Shift    |
| ------------------------ | --------------- | -------------- | --------- | -------- | -------- |
| surface.feedback.success | green/50        | green/800      | #ECFFE9   | #002400  | 50 → 800 |
| surface.feedback.warning | yellow/50       | yellow/900     | #FFFBD5   | #271E00  | 50 → 900 |
| surface.feedback.danger  | red/50          | red/900        | #FFE4DF   | #280000  | 50 → 900 |
| surface.feedback.info    | blue/50         | blue/900       | #E9F2FF   | #01082D  | 50 → 900 |

## Accessibility and Theming

#### All color token pairs (text on surface, border on surface) must meet WCAG AA contrast in both modes. Dark mode is not a decorative preference — it is an accessibility feature for users sensitive to brightness.

##### Contrast Requirements

Normal text: 4.5:1 minimum contrast ratio\
Large text (18px+ or bold 14px+): 3:1 minimum\
UI components and graphical objects: 3:1 minimum\
Focus indicators must remain clearly visible in both modes\
Reduced motion preferences apply equally in both themes

##### Validation Rules

THM-001 — No mode-specific color values in components\
THM-002 — All semantic tokens resolve in both modes\
THM-003 — Custom surfaces use semantic surface tokens\
CLR-003 — Text contrast meets WCAG AA\
CLR-004 — Non-text contrast meets WCAG AA

| Check                   | Light Mode | Dark Mode | Rule ID  | Severity | Status   |
| ----------------------- | ---------- | --------- | -------- | -------- | -------- |
| Text contrast ≥ 4.5:1   | Pass       | Verify    | CLR-003  | Error    | Required |
| Non-text contrast ≥ 3:1 | Pass       | Pass      | CLR-004  | Error    | Required |
| Focus ring visible      | Pass       | Verify    | A11Y-003 | Error    | Required |

## How Theming Works

#### Theming operates at the semantic token layer. Primitive tokens remain constant — they define the raw palette. Semantic tokens change their mapping based on the active theme. Components never change; only the values behind their tokens change.

##### Token Resolution Flow

SOLAR supports Light and Dark modes as system-level themes, controlled through semantic token mappings rather than component overrides.

Component → Semantic Token → [Theme Mode] → Primitive Token → Raw Value

This architecture means a single component definition works in all themes. Mode switching is handled at the system or app shell level, not per component.

##### Purpose

Enable consistent Light and Dark mode support across all products.\
Ensure accessibility requirements are met in every theme.\
Allow mode switching without component-level changes.\
Provide a foundation for future theme extensions (e.g., high contrast).

| Semantic Token                  | Light Mode     | Dark Mode      | Light Hex       | Dark Hex              | Category |
| ------------------------------- | -------------- | -------------- | --------------- | --------------------- | -------- |
| color.text.primary              | neutral/900    | neutral/50     | #111111         | #F5F5F5               | Text     |
| color.surface.base              | mono/white     | neutral/800    | #FFFFFF         | #222222               | Surface  |
| color.border.default            | alpha/black-20 | alpha/white-20 | rgba(0,0,0,0.2) | rgba(255,255,255,0.2) | Border   |
| color.action.primary.bg.default | neutral/900    | neutral/50     | #111111         | #F5F5F5               | Action   |

## Non-Color Tokens and Theming

#### Spatial tokens — border width, border radius, inset (padding), and stack (vertical spacing) — do not change between themes. They exist in a single mode and remain constant regardless of Light or Dark mode.

###### Border Radius Tokens

radius.none → 0px\
radius.control → 6px (border-radius/md)\
radius.container → 8px (border-radius/lg)\
radius.dialog → 12px (border-radius/xl)\
radius.pill → 9999px (border-radius/full)

###### Border Width Tokens

border.none → 0px\
border.default → 1px (border-width/sm)\
border.strong → 2px (border-width/md)

###### Shadow Color Variables

shadow.subtle → alpha/black-05 (light) \| alpha/black-90 (dark)\
shadow.strong → alpha/black-20 (light) \| mono/black (dark)\
shadow.feedback.focus → alpha/blue-20 (both modes)\
shadow.feedback.danger → alpha/red-20 (both modes)

| Inset Token | Value | Stack Token | Value | Themed? | Notes            |
| ----------- | ----- | ----------- | ----- | ------- | ---------------- |
| inset.md    | 16px  | stack.md    | 16px  | No      | Single mode only |
| inset.sm    | 12px  | stack.sm    | 12px  | No      | Single mode only |
| inset.lg    | 24px  | stack.lg    | 24px  | No      | Single mode only |

## Theming Do's and Don'ts

#### Correct theming depends on consistently using semantic tokens and validating in both modes. These rules prevent the most common theming mistakes that cause contrast failures and visual inconsistencies.

##### Do

Use color.text.primary for body text — it resolves to dark text on light backgrounds and light text on dark backgrounds automatically.\
Test feedback colors (success, warning, danger) in both modes — the shifted step ensures consistent meaning.\
Use Figma variable modes to preview both themes during design.\
Add conditional light/dark logic in components — tokens handle this automatically.

##### Don't

Use color/neutral/900 directly for text — this produces dark-on-dark in dark mode.\
Assume brand red (#D22730) is the error color in all contexts — use color.text.feedback.danger which adapts per mode.\
Add conditional light/dark logic in components — tokens handle this automatically.\
Hard-code hex values like #FFFFFF for surfaces — use color.surface.base instead.

##### Common Mistakes

Hardcoding hex values instead of using semantic tokens\
Using surface assumptions like "this is white"\
Not validating contrast in dark mode before handoff\
Mixing primitive references with semantic tokens in the same component

| Scenario             | Do                         | Don't               | Why                 | Rule    | Severity |
| -------------------- | -------------------------- | ------------------- | ------------------- | ------- | -------- |
| Body text color      | color.text.primary         | color/neutral/900   | Breaks in dark mode | THM-001 | Error    |
| Error feedback color | color.text.feedback.danger | brand red (#D22730) | Not mode-aware      | THM-001 | Error    |
| Surface background   | color.surface.base         | #FFFFFF hard-coded  | White in dark mode  | THM-003 | Error    |

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Theming
domain: Theme Architecture & Multi-Brand Support
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR theming specialist. Theming enables the system to support multiple visual expressions — light/dark modes and brand variants — through token swapping. Components never contain theme-specific logic; they consume semantic tokens that the theme resolves.

[SCOPE]
- Theme architecture and token swapping model
- Light/dark mode implementation
- Brand theming and white-labeling
- How themes interact with Figma variable modes
- Theme creation and governance

[THEME_ARCHITECTURE]
definition: a theme is a complete set of semantic token values that map to primitives
mechanism: switching themes swaps the underlying primitive values while semantic token names stay stable
layers: primitive palette (fixed) → semantic tokens (theme-resolved) → component tokens (optional overrides)
rule: components ONLY reference semantic tokens — this is what makes theming work

[LIGHT_DARK_MODE]
light: semantic tokens alias lighter primitives (e.g., surface.default → neutral-0, text.primary → neutral-900)
dark: semantic tokens alias darker primitives (e.g., surface.default → neutral-900, text.primary → neutral-50)
swap: same semantic name, different underlying value per mode
surfaces: dark mode uses progressively lighter surfaces for elevation (not just inverted)
shadows: reduced shadow intensity in dark mode — darker environment needs less contrast
borders: may need increased opacity/strength in dark mode for visibility
rule: dark mode ≠ inverted colors — it requires intentional design of every token mapping

[FIGMA_VARIABLE_MODES]
structure: semantic variable collection with Light and Dark modes
switching: toggle mode in Figma to preview both themes
binding: all components bind to semantic variables — mode switch is automatic
rule: Figma variable mode names must match code theme identifiers

[BRAND_THEMING]
concept: multiple brands share the same component architecture but differ in visual expression
brand_overrides: different primitive palettes (brand colors), different type stacks, different radius scales
scoped_tokens: brand-specific theme file overrides semantic token values
shared: component structure, spacing, interaction patterns remain constant across brands
rule: brand themes override visual tokens only — never structural or behavioral properties

[THEME_FILE_STRUCTURE]
base_theme: default semantic token values (typically light mode)
dark_theme: dark mode overrides extending base
brand_theme: brand-specific overrides extending base
brand_dark_theme: brand + dark mode combined
rule: themes cascade — brand extends base, brand-dark extends brand + dark

[CREATING_NEW_THEMES]
process: governance proposal → full token mapping → design review → Figma mode setup → code implementation → QA
requirements: every semantic token must have a value — no gaps allowed
testing: all components rendered in new theme + light/dark modes
deliverables: theme token file (JSON/YAML), Figma variable mode, migration guide if replacing existing theme

[AGENT_BEHAVIOR]
- When recommending any visual value, verify it works across ALL supported themes
- If a design looks good in light mode, explicitly check dark mode and any brand themes
- Never recommend primitive tokens in components — always semantic (this breaks theming)
- Flag components with hardcoded colors, shadows, or borders as theme-breaking violations
- When proposing a new color or visual treatment, provide values for all theme modes
- Test edge cases: subtle backgrounds, borders, and shadows are the most common dark mode failures

[CONSTRAINTS]
- components must ONLY reference semantic tokens — never primitives
- theme switching must be instant — CSS custom property swap or class toggle, no layout shift
- every semantic token must have a value in every supported theme — no undefined tokens
- dark mode requires intentional surface/elevation hierarchy — not a simple inversion
- new themes require governance approval and a full token mapping
- brand overrides are limited to visual tokens — structural behavior stays constant
@END:PAGE_CONTEXT
```
