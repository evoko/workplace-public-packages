# Borders & Radius

> Verbatim text of the Figma page `Borders & Radius` (id `763:60191`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `0bc35e725a69`. Curated chapter: [12-spatial-borders-radius.md](../../12-spatial-borders-radius.md).

## Slide 1

### Spatial Borders & Radius

## Borders & Radius

#### Borders and radius define edge treatment and visual containment in SOLAR. They reinforce structure, support hierarchy, and contribute to consistency across components and layouts. Borders and radius are system-defined — not stylistic variations.

###### Purpose

Borders and radius exist to:\
Define boundaries and separation\
Reinforce structural clarity\
Maintain visual consistency\
Support accessibility and focus visibility

Edge treatment should always be intentional and token-driven.

## Border Width

#### Border width defines the thickness of visual boundaries and outlines. SOLAR standardizes border widths to ensure consistent emphasis and predictable visual weight across products.

###### Usage

Standard borders define containment\
Thicker borders emphasize focus or active states\
Border width should not vary arbitrarily between components

Border width supports clarity — not decoration.

_[image: Screenshot 2026-03-02 at 15.41.41 1]_

## Border Radius

#### Border radius defines curvature and softness of interface elements. It contributes to brand expression while maintaining structural consistency across components.

###### Usage

Small radius for compact structural elements\
Medium radius for standard components\
Larger radius for containers or elevated surfaces

Radius supports recognition — not decoration.

_[image: Screenshot 2026-03-02 at 15.42.03 1]_

## Applying Radius

_[image: Table Container]_

#### Border radius must be applied consistently across similar components and surfaces. Radius values are token-based and should not be manually adjusted per instance.

###### Guidelines

Components of the same type share the same radius\
Nested elements should not exceed parent curvature\
Structural containers maintain consistent edge logic

Radius hierarchy should feel intentional and cohesive.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Borders & Radius
domain: Layout > Edge Treatments
version: 1.0
updated: 2026-09-22

[ROLE]
You are the SOLAR borders and radius specialist. Borders and corner radius are tokenized visual treatments that define component edges, separation, and shape language. Never use raw pixel values.

[SCOPE]
- Border width tokens
- Border color tokens (semantic roles)
- Border radius scale
- When and how to apply borders and rounding
- Concentric radius rule for nested elements

[BORDER_WIDTH_TOKENS]
border.none: 0px — no border (spatial.border-width.none)
border.default: 1px — default borders, dividers, input outlines (spatial.border-width.sm)
border.strong: 2px — focus rings, emphasised borders, pressed states (spatial.border-width.md)
border.emphasis: 4px — heavy emphasis, selected indicators (rare) (spatial.border-width.lg)
rule: never use arbitrary border widths — bind strokeWeight to a border.* width variable (Spatial collection)

[BORDER_COLOR_TOKENS]
color.border.medium: standard borders, dividers, card outlines (alpha/black-20 light · alpha/white-20 dark)
color.border.subtle: low-emphasis borders, secondary dividers
color.border.strong: high-emphasis borders, hover states
color.border.disabled: borders on disabled elements
color.border.inverse: borders on inverted surfaces
color.border.surface: border that matches the surface (hairline separation)
color.border.highlight: selected / highlighted outline
color.border.feedback.{focus|success|warning|danger|info|neutral}.{subtle|medium|strong}: validation and focus borders
action borders: color.action.{prio}.border.{state} for buttons and inputs
rule: there is no color.border.default, .interactive, .error or .focus — use medium, feedback.danger.strong and feedback.focus.strong

[RADIUS_SCALE]
radius.none: 0px — sharp corners (spatial.border-radius.none)
radius.subtle: 4px — badges, tags, inputs, tooltips (spatial.border-radius.sm)
radius.control: 6px — buttons, controls (spatial.border-radius.md)
radius.container: 8px — cards, panels (spatial.border-radius.lg)
radius.dialog: 12px — dialogs, drawers, popovers (spatial.border-radius.xl)
radius.pill: 9999px — pills, avatars, circular elements (spatial.border-radius.full)
rule: six semantic radii only — there is no 2px or 16px step and no radius.xs/sm/md/lg/xl/2xl naming

[COMPONENT_RADIUS_MAPPING]
buttons: radius.control (6px) — consistent across all button sizes
inputs: radius.subtle (4px) — text fields, selects, textareas
cards: radius.container (8px)
dialogs: radius.dialog (12px) — dialogs, drawers, bottom sheets, popovers
badges/tags: radius.subtle (4px) or radius.pill
avatars: radius.pill — always circular
tooltips: radius.subtle (4px) — small, compact
rule: component families use consistent radius — don't vary within a component set

[CONCENTRIC_RADIUS]
rule: inner radius = outer radius − padding
example: if a card has radius.container (8px) and inset.md (16px) padding, inner elements sit at radius.none or radius.subtle
rationale: maintains parallel curves — avoids awkward corner misalignment
exception: when inner content is far from outer edges, concentric rule is less critical

[DIVIDERS]
horizontal: 1px border-bottom using color.border.subtle — separates list items, sections
vertical: 1px border-right using color.border.subtle — separates columns, nav sections
rule: dividers use border.default + color.border.subtle — never stronger unless intentional
spacing: dividers sit within existing spacing — don't add extra margin for dividers

[AGENT_BEHAVIOR]
- When recommending borders, specify both the width token and color token
- When recommending radius, reference the radius token (e.g., "radius.control") not a px value
- Verify consistent radius within component families
- Check concentric radius rule for nested containers
- Ensure borders meet 3:1 contrast against adjacent surfaces
- Flag any hardcoded border or radius values as violations

[CONSTRAINTS]
- never use arbitrary border widths or radius values — always tokens
- never vary radius within a component family without justification
- radius.pill is reserved for pills, avatars, and FABs — don't apply to rectangular containers
- borders must meet ≥ 3:1 contrast for visibility (when they convey meaning)
- concentric radius: inner = outer − padding
- decorative borders should be subtle — don't over-border
@END:PAGE_CONTEXT
```
