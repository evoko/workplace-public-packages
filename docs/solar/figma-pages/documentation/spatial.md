# Spatial

> Verbatim text of the Figma page `Spatial` (id `763:59204`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `a9b6dfb289de`. Curated chapter: [12-spatial-borders-radius.md](../../12-spatial-borders-radius.md).

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

**Token**

**Base token**

**Value**

****stack/none****

****spatial/scale/0****

**0px**

****stack/2xs****

****spatial/scale/1****

**4px**

****stack/xs****

****spatial/scale/2****

**8px**

****stack/sm****

****spatial/scale/3****

**12px**

****stack/md****

****spatial/scale/4****

**16px**

****stack/lg****

****spatial/scale/5****

**20px**

****stack/xl****

****spatial/scale/6****

**24px**

****stack/2xl****

****spatial/scale/7****

**28px**

****stack/3xl****

****spatial/scale/10****

**40px**

#### Stack defines vertical separation between sibling elements. It governs layout rhythm and grouping across pages and components.

###### Token Structure

Located in: Semantic — Size → stack.\*

Examples:\
stack.sm\
stack.md\
stack.lg

Each stack token maps to a rem value from size / scale.

Example:\
stack.md → 1rem (16px)\
stack.lg → 1.25rem (20px)\
stack.xl → 1.5rem (24px)

###### When to Use Stack

Use stack to separate:\
Sections\
Content groups\
Form fields\
Layout blocks

If two elements share the same parent and require spacing between them, use a stack token.

## Inset

**Token**

**Base token**

**Value**

****inset/none****

****spatial/scale/0****

**0px**

****inset/2xs****

****spatial/scale/1****

**4px**

****inset/xs****

****spatial/scale/2****

**8px**

****inset/sm****

****spatial/scale/3****

**12px**

****inset/md****

****spatial/scale/4****

**16px**

****inset/lg****

****spatial/scale/5****

**20px**

****inset/xl****

****spatial/scale/6****

**24px**

****inset/2xl****

****spatial/scale/7****

**28px**

****inset/3xl****

****spatial/scale/10****

**40px**

#### Inset defines internal padding within containers. It creates breathing room between content and structural boundaries.

###### Token Structure

Located in: Semantic — Size → inset.\*

Examples:\
inset.sm\
inset.md\
inset.lg

Each inset token references a rem value from the sizing scale.

Example:\
inset.md → 1rem (16px)\
inset.lg → 1.25rem (20px)\
inset.xl → 1.5rem (24px)

###### When to Use Inset

Use inset inside:\
Cards\
Panels\
Sections\
Dialogs\
Page containers

Inset defines containment — not separation between siblings.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Spatial
domain: Layout > Spacing System
version: 1.0
updated: 2026-09-22

[ROLE]
You are the SOLAR spatial system specialist. Consistent spacing creates visual rhythm, hierarchy, and grouping. All spacing values must use spatial tokens — never arbitrary pixel values.

[SCOPE]
- Base unit and the spatial scale
- Semantic spacing families: inset and stack
- Padding and gap conventions
- Proximity principle and visual grouping
- Responsive spacing adjustments

[BASE_UNIT]
unit: 4px — all spacing values are multiples of 4
rationale: 4px base aligns with pixel grids, sub-pixel rendering, and standard display densities

[SPACING_SCALE]
primitive: spatial.scale.0–22 — 0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 64, 72, 80, 96, 112, 128, 144, 160px
semantic (inset.* and stack.* share these nine steps):
  none: 0px — spatial.scale.0
  2xs: 4px — spatial.scale.1 — tightest grouping, icon + label gaps
  xs: 8px — spatial.scale.2 — compact grouping, control padding
  sm: 12px — spatial.scale.3 — dense component padding
  md: 16px — spatial.scale.4 — default spacing, card padding
  lg: 20px — spatial.scale.5 — comfortable padding
  xl: 24px — spatial.scale.6 — section separation
  2xl: 28px — spatial.scale.7 — large containers
  3xl: 40px — spatial.scale.10 — page-level regions
rule: lg is 20px and xl is 24px — older docs that said 24/32 were wrong; there is no 2px, 48px or 64px semantic step

[USAGE_TYPES]
inset: padding inside a container (card padding, button padding) — inset.{size}
stack: vertical spacing between stacked siblings (heading → paragraph → button) — stack.{size}
gap: horizontal auto-layout gaps bind to the same scale via inset.{size}; there is no gap.* family
rule: only inset.* and stack.* exist — no space.*, inline, squish or stretch families

[TOKEN_NAMING]
pattern: inset.{size} | stack.{size} — docs use dots, Figma uses slashes (inset/md)
examples:
  inset.md → 16px card padding
  stack.xl → 24px between content sections
  inset.2xs → 4px between a button icon and its label
rule: no component-scoped spacing tokens — components bind directly to the semantic scale

[PROXIMITY_PRINCIPLE]
tight: related items grouped with smaller spacing (2xs to xs)
medium: sub-sections within a group (md)
loose: distinct sections separated with larger spacing (xl to 3xl)
rule: spacing communicates relationship — closer = more related

[COMPONENT_SPACING]
internal_padding: inset tokens (e.g., card uses inset.md)
between_components: stack tokens (e.g., stack.md between form fields)
section_spacing: larger tokens (e.g., stack.xl between page sections, stack.3xl between page regions)
rule: component internal spacing uses inset; between-component spacing uses stack

[RESPONSIVE_SPACING]
mobile: spacing may tighten by one scale step (e.g., inset.lg → inset.md)
desktop: full spacing scale applies
mechanism: spatial tokens may have breakpoint-specific values, or layout rules specify tighter tokens on mobile
rule: maintain proportional rhythm — don't tighten some spacing while leaving others loose

[AGENT_BEHAVIOR]
- When recommending spacing, always provide the token name (e.g., "inset.md") not a pixel value
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
