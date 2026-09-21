# Spatial

> Verbatim text of the Figma page `Spatial` (id `763:59204`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `2f5eb8cf2ed9`. Curated chapter: [12-spatial-borders-radius.md](../../12-spatial-borders-radius.md).

## Slide 1

### Spatial

## Spacing Principles

#### Spacing in SOLAR defines rhythm, separation, and containment. It ensures clarity and hierarchy by systemizing how elements relate to one another. Spacing is controlled through standardized tokens — not manual margin adjustments.

##### Spacing Creates Relationships

##### Consistent Rhythm Over Precision

##### Interaction-Aware Spacing

Spacing communicates what belongs together and what does not. Smaller spacing signals grouping and related content, while larger spacing creates separation and hierarchy. Spacing should make structure obvious without relying on borders or color.

Spacing follows a defined scale to create predictable visual rhythm. Values are chosen from tokens, not tuned per layout. Consistent rhythm improves scanability, reduces cognitive load, and keeps layouts cohesive across screens and platforms.

Spacing must account for interaction, not just layout. Touch targets, focus outlines, and interactive states require sufficient space to remain usable and accessible. If spacing breaks interaction or focus behavior, it is a system issue—not a layout exception.

## Spacing Hierarchy

#### Spacing in SOLAR is structured in layers. Each layer defines a different role — from page-level boundaries to element-level rhythm. Clear separation of these roles ensures consistency and prevents misuse of tokens.

###### Spatial Layers

```
Viewport
   ↓
Grid Margin
   ↓
Inset (inside containers)
   ↓
Stack (between siblings)
```

## Sizing Scale

#### The sizing scale defines the foundational measurement system for spacing and sizing in SOLAR. It is based on a 4px modular scale, creating a consistent spatial rhythm across layouts, components, and typography.

The scale is platform-agnostic, allowing products to implement the values in the units appropriate for their platform (px, rem, dp, pt, etc.). This ensures consistent proportions across web, mobile, and other environments.

###### Why SOLAR Uses a Modular Scale

Using a modular scale creates a consistent spatial rhythm across the interface.

Ensures proportional spacing across layouts\
Keeps typography, spacing, and layout aligned\
Improves visual consistency across products\
Enables predictable behavior across platforms

###### Primitive Source

Defined in: Primitives → spatial → scale. All semantic spacing tokens reference this scale.

Examples from the scale:\
scale-1 (4px)\
scale-2 (8px)\
scale-3 (12px)\
scale-4 (16px)

_[image: Screenshot 2026-03-13 at 15.35.42 1]_

## Stack

#### Stack defines vertical separation between sibling elements. It governs layout rhythm and grouping across pages and components.

###### Token Structure

Located in: Semantic — Size → stack.\*

Examples:\
stack.sm\
stack.md\
stack.lg

Each stack token maps to a rem value from size / scale.

Example:\
stack.md → 1rem\
stack.lg → 1.5rem

###### When to Use Stack

Use stack to separate:\
Sections\
Content groups\
Form fields\
Layout blocks

If two elements share the same parent and require spacing between them, use a stack token.

_[image: image 1]_

## Inset

#### Inset defines internal padding within containers. It creates breathing room between content and structural boundaries.

###### Token Structure

Located in: Semantic — Size → inset.\*

Examples:\
inset.sm\
inset.md\
inset.lg

Each inset token references a rem value from the sizing scale.

Example:\
inset.md → 1rem\
inset.lg → 1.5rem

###### When to Use Stack

Use inset inside:\
Cards\
Panels\
Sections\
Dialogs\
Page containers

Inset defines containment — not separation between siblings.

_[image: image 1]_

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Spatial
domain: Layout > Spacing System
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR spatial system specialist. Consistent spacing creates visual rhythm, hierarchy, and grouping. All spacing values must use spatial tokens — never arbitrary pixel values.

[SCOPE]
- Base unit and spacing scale
- Spatial token naming and usage types
- Padding, margin, and gap conventions
- Proximity principle and visual grouping
- Responsive spacing adjustments

[BASE_UNIT]
unit: 4px — all spacing values are multiples of 4
rationale: 4px base aligns with pixel grids, sub-pixel rendering, and standard display densities

[SPACING_SCALE]
space.0: 0px — no space
space.2xs: 2px — hairline gaps, divider offsets
space.xs: 4px — tightest grouping, inline icon gaps
space.sm: 8px — compact grouping, small component padding
space.md: 16px — default spacing, standard padding and gaps
space.lg: 24px — section separation, generous padding
space.xl: 32px — major section breaks
space.2xl: 48px — page-level section spacing
space.3xl: 64px — hero spacing, large section breaks
space.4xl: 96px — maximum spacing, page margins on wide screens

[USAGE_TYPES]
inline: horizontal spacing between sibling elements (e.g., icon + label gap)
stack: vertical spacing between stacked elements (e.g., heading → paragraph → button)
inset: padding inside a container (e.g., card padding, button padding)
squish_inset: asymmetric padding — tighter top/bottom, wider left/right (e.g., tags, chips)
stretch_inset: asymmetric padding — taller top/bottom, narrower left/right (e.g., list items)

[TOKEN_NAMING]
pattern: space.{scale} for general use
component_specific: {component}.space.{property} for component-level overrides
examples:
  space.md → 16px general purpose
  button.space.inline → gap between icon and label in a button
  card.space.inset → internal padding of a card

[PROXIMITY_PRINCIPLE]
tight: related items grouped with smaller spacing (space.xs to space.sm)
medium: sub-sections within a group (space.md)
loose: distinct sections separated with larger spacing (space.lg to space.2xl)
rule: spacing communicates relationship — closer = more related

[COMPONENT_SPACING]
internal_padding: inset tokens (e.g., card uses space.md inset)
between_components: stack/inline tokens (e.g., space.md between form fields)
section_spacing: larger tokens (e.g., space.xl between page sections)
rule: component internal spacing uses inset; between-component spacing uses stack/inline

[RESPONSIVE_SPACING]
mobile: spacing may tighten by one scale step (e.g., space.lg → space.md)
desktop: full spacing scale applies
mechanism: spatial tokens may have breakpoint-specific values, or layout rules specify tighter tokens on mobile
rule: maintain proportional rhythm — don't tighten some spacing while leaving others loose

[AGENT_BEHAVIOR]
- When recommending spacing, always provide the token name (e.g., "space.md") not a pixel value
- Use proximity principle: suggest tighter spacing for related items, looser for separate sections
- If a spacing value isn't in the scale, recommend the nearest token — never invent values
- Check that component internal padding uses inset tokens
- Verify responsive spacing maintains proportional rhythm
- Flag any hardcoded pixel spacing as a violation

[CONSTRAINTS]
- never use arbitrary pixel values for spacing — always a spatial token
- never use values outside the spacing scale without governance approval
- never mix spacing scales (e.g., 10px, 15px, 22px are not on the 4px grid)
- component internal spacing is separate from between-component spacing
- spacing tokens may differ per breakpoint — always specify context
- optical adjustments (±1–2px) are allowed in Figma but must be documented
@END:PAGE_CONTEXT
```
