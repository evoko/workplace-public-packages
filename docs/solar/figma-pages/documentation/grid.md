# Grid

> Verbatim text of the Figma page `Grid` (id `763:58215`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `d28c16fdb34e`. Curated chapter: [11-layout-responsive-grid.md](../../11-layout-responsive-grid.md).

## Slide 1

### Layout Grid

## Grid System

#### The SOLAR grid system defines the horizontal structure of layout. It organizes content into columns, establishes alignment, and creates consistent rhythm across pages and products. The grid provides order and predictability, independent of visual styling or responsive behavior.

###### Purpose

The grid system:\
Structures horizontal layout\
Aligns content across screens\
Defines consistent composition rules\
Scales across breakpoints\
Supports complex layouts such as dashboards and admin tools

The grid is the structural foundation of interface layout.

###### Core Elements

The grid consists of three components:\
Columns — structural divisions of layout\
Gutter — space between columns\
Margin — outer boundary between grid and viewport

These elements work together to create consistent horizontal balance.

## Grid on Mobile (xs — 393px)

_[image: Table Container]_

#### At the mobile breakpoint (xs), the grid simplifies to support clarity, readability, and vertical flow. The structure prioritizes stacking and full-width content while maintaining alignment and horizontal rhythm.

###### Column Structure

4-column grid\
Columns primarily function as alignment guides\
Most content spans full width (4/4)\
Multi-column compositions are minimal

Mobile grid supports simplicity and hierarchy.

###### Gutter

Reduced gutter width\
Prevents visual crowding\
Maintains rhythm between structural divisions\
Gutter ensures horizontal breathing room without fragmenting layout.

###### Margin

Grid margin defines outer boundary from viewport edge\
Prevents edge-to-edge content\
Maintains safe touch area and visual balance\
Margin is horizontal only and applies to the entire grid container.

| Breakpoint | Min Width | Columns | Gutter      | Margin      | Intent          |
| ---------- | --------- | ------- | ----------- | ----------- | --------------- |
| xs         | 393px     | 4       | 1rem / 16px | 1rem / 16px | Mobile baseline |

## Grid on Desktop (sm → xl)

_[image: Table Container]_

#### Desktop breakpoints expand layout structure rather than simply increasing width. From sm (768px) through xl (1920px), SOLAR progressively unlocks grid complexity, panel distribution, and content density while maintaining consistent hierarchy and accessibility.

###### Structural Expansion

Desktop layouts introduce hierarchy and simultaneous visibility.

Multi-column compositions appear\
Side navigation expands or persists\
Panels align horizontally\
Data density increases\
Secondary content becomes visible

###### Wide Screens (lg / xl)

Wide layouts enhance productivity without breaking rhythm.

Content may be constrained with container max-width\
Dashboards can expand horizontally\
Layout improves scannability rather than stretching content\
Spacing scales proportionally through stack and inset tokens

| Breakpoint | Min Width | Columns | Gutter         | Margin         | Intent           |
| ---------- | --------- | ------- | -------------- | -------------- | ---------------- |
| sm         | 768px     | 4       | 1rem / 16px    | 1rem / 16px    | Tablet portrait  |
| md         | 1024px    | 8       | 1.25rem / 20px | 1.25rem / 20px | Tablet landscape |
| lg         | 1440px    | 12      | 1.5rem / 24px  | 1.5rem / 24px  | Standard desktop |
| xl         | 1920px    | 12      | 2rem / 32px    | 1.5rem / 24px  | Large display    |

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Grid
domain: Layout > Column Grid System
version: 1.0
updated: 2026-09-22

[ROLE]
You are the SOLAR grid system specialist. The grid provides the structural backbone for page layouts. All page-level and section-level content aligns to the column grid — never arbitrary widths.

[SCOPE]
- Column grid specifications per breakpoint
- Gutter and margin tokens
- Content width caps
- Grid usage patterns and column spanning
- Nested grids and exceptions

[GRID_PER_BREAKPOINT]
xs (393px): 4 columns | gutter 16px | margin 16px
sm (768px): 4 columns | gutter 16px | margin 16px
md (1024px): 8 columns | gutter 20px | margin 20px
lg (1440px): 12 columns | gutter 24px | margin 24px
xl (1920px): 12 columns | gutter 32px | margin 24px
rule: values verified against the Layout collection 2026-09-22 — older docs saying tablet 8/24/24 and desktop margin 40px were wrong

[GRID_TOKENS]
grid/columns/{xs|sm|md|lg|xl}: column count per breakpoint (4, 4, 8, 12, 12)
grid/gutter/{bp}: gap between columns — aliases spatial/scale/{4|4|5|6|8}
grid/margin/{bp}: page-edge margin — aliases spatial/scale/{4|4|5|6|6}
breakpoint/{bp}: aliases Foundations viewport/{bp}
location: Layout collection, local to SOLAR Web (web-specific; Foundations stays platform-agnostic)
rule: gutters and margins are variables — never hardcoded px values

[COLUMN_SPANNING]
full_width: 12/12 (desktop) — hero sections, full-bleed content
two_thirds: 8/12 (desktop) — primary content area
half: 6/12 (desktop) — side-by-side equal panels
one_third: 4/12 (desktop) — sidebar, secondary content
one_quarter: 3/12 (desktop) — cards in a 4-up grid
rule: always express widths as column spans, not percentages or pixels

[COMMON_LAYOUTS]
single_column: 8/12 centered — articles, forms, focused content
sidebar_content: 3/12 + 9/12 or 4/12 + 8/12 — navigation + main content
equal_split: 6/12 + 6/12 — comparison layouts
card_grid: 3/12 × 4 or 4/12 × 3 — product listings, dashboards
asymmetric: 5/12 + 7/12 — text + media layouts

[NESTED_GRIDS]
rule: nested grids are allowed but must align to parent grid rhythm
inner_columns: subdivide the parent span (e.g., a 6-col container can have its own 6-col inner grid)
inner_gutters: use the same gutter token as the parent grid
alignment: inner grid edges should align with parent grid lines where possible

[FULL_BLEED]
definition: content that extends beyond the grid margins to the viewport edge
usage: hero images, color bands, section backgrounds
rule: full-bleed is a documented exception — content within full-bleed areas still aligns to the inner grid

[AGENT_BEHAVIOR]
- When recommending layout, specify column spans (e.g., "8/12 on desktop, 12/12 on mobile")
- Always describe grid behavior at each breakpoint
- Verify content aligns to grid columns — flag misaligned elements
- Check that gutters use the system gutter token
- For nested layouts, verify inner grid aligns to parent grid
- Flag any hardcoded width values as violations

[CONSTRAINTS]
- never hardcode pixel widths for layout — use column spans
- never modify gutter width per component — use the system gutter token
- never exceed max-width on wide screens
- content within full-bleed sections still aligns to the inner grid
- small elements (icons, badges) don't need to snap to columns — grid is for structure
- grid columns are guides for alignment, not rigid constraints for every element
@END:PAGE_CONTEXT
```
