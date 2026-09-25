---
solar:
  reviewed: 2026-09-22
  figmaVersion: '2402047167094879156'
  sources:
    documentation/layout: bb4e84ef17db
    documentation/responsive: b349eda36390
    documentation/grid: d28c16fdb34e
    primitives/viewport: 8aa9628ed0f8
---

# 11 · Layout, Responsive & Grid

> Source: Figma pages "Layout" (overview), "Layout › Responsive" (principles, viewport
> system, behaviour rules), "Layout › Grid" (grid system, mobile grid, desktop grid),
> "Primitives › Viewport", plus each page's `@SOLAR:PAGE_CONTEXT`. Viewport values
> verified against the Primitives collection.

## Layout philosophy

Layout defines how content is arranged, aligned, and distributed. It is the structural
framework that supports clarity, hierarchy, and responsiveness, so screens are built on
consistent spatial rules rather than one-off decisions.

Four sub-systems work together:

| Sub-system       | Governs                                                       | Chapter                                                      |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------------------------ |
| Responsive       | Breakpoints, adaptive behaviour, reflow and stacking patterns | this file                                                    |
| Grid             | Column structure, gutters, margins, content-width caps        | this file                                                    |
| Spatial          | Spacing scale, inset/stack tokens, rhythm and grouping        | [12-spatial-borders-radius.md](12-spatial-borders-radius.md) |
| Borders & radius | Border width and color tokens, corner radius, edge treatments | [12-spatial-borders-radius.md](12-spatial-borders-radius.md) |

Principles:

- **Mobile-first**: base styles target the smallest screen; enhance progressively.
- **Content priority**: the most important content is first in DOM and visual flow.
- **Proximity**: related items grouped tightly; sections separated generously.
- **Alignment**: content aligns to grid columns; consistent left edges create order.
- **Constraint**: a maximum content width prevents ultra-wide line lengths.

Composition model: **page** (grid + margins + max-width) → **section** (stack spacing
between sections) → **group** (inline/stack spacing within groups) → **component**
(inset padding inside component boundaries).

## Viewport tokens

Viewports are reference screen widths, not devices. Each is the **minimum width** at
which a layout transition may occur.

| Token         | px   | Grid columns | Gutter          | Margin          | Intent           |
| ------------- | ---- | ------------ | --------------- | --------------- | ---------------- |
| `viewport.xs` | 393  | 4            | 16 px (1rem)    | 16 px (1rem)    | Mobile baseline  |
| `viewport.sm` | 768  | 4            | 16 px (1rem)    | 16 px (1rem)    | Tablet portrait  |
| `viewport.md` | 1024 | 8            | 20 px (1.25rem) | 20 px (1.25rem) | Tablet landscape |
| `viewport.lg` | 1440 | 12           | 24 px (1.5rem)  | 24 px (1.5rem)  | Standard desktop |
| `viewport.xl` | 1920 | 12           | 32 px (2rem)    | 24 px (1.5rem)  | Large display    |

Figma: Primitives › `viewport/xs…xl`. CSS: `--solar-viewport-xs` etc. Gutter and margin
values sit on the spatial scale: 16 px = `spatial.scale.4`, 20 px = `spatial.scale.5`,
24 px = `spatial.scale.6`, 32 px = `spatial.scale.8`. Only `xl` differs between the two
— a 32 px gutter with a 24 px margin.

The **viewport** tokens are Foundations and platform-agnostic. The columns, gutters,
margins and breakpoints themselves live in SOLAR Web's **Layout** collection
(`layout.grid.columns.{bp}`, `layout.grid.gutter.{bp}`, `layout.grid.margin.{bp}`,
`layout.breakpoint.{bp}` → `--solar-layout-*`), where `breakpoint/{bp}` aliases
Foundations `viewport/{bp}`. Foundations defines the widths; SOLAR Web defines what the
grid does at them. The split is deliberate: SOLAR decided on 2026-09-22 that grid, margin and
breakpoint variables are web-specific and stay in SOLAR Web, keeping Foundations
platform-agnostic.

There are only these five named breakpoints. There is no 600 px or 1023 px boundary, no
mobile/tablet/desktop/wide band naming, and no `viewport.breakpoint.*` token.

## Responsive principles

| Principle                              | Meaning                                                                                                                       |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Adapt structure, not just size**     | Reorganize content to keep hierarchy and usability: stack, collapse, prioritize, rather than scale everything down            |
| **Content drives layout**              | Breakpoints and layout decisions are driven by content and usability, not device categories                                   |
| **Maintain usability across contexts** | Touch targets, readable text and spacing stay accessible at every size; if responsiveness compromises clarity, fix the system |

Responsive is not about resizing; it is about controlled structural transitions driven
by breakpoint tokens. Layout is fluid (percentage or flex) between breakpoints; the
type scale swaps Desktop/Mobile modes at `sm` (768 px); images are `max-width:
100%`; content width is capped on wide screens.

## Responsive behaviour rules

Responsive behaviour adapts structure and density without redefining visual language or
component identity. Navigation expands progressively; sidebars do not change grid
structure, they alter available content width; layout evolves from sequential to
distributed; filters and toolbars may collapse at small sizes.

| Breakpoint | Navigation                      | Sidebar & panels                        | Content layout                  | Data & controls                        |
| ---------- | ------------------------------- | --------------------------------------- | ------------------------------- | -------------------------------------- |
| xs         | Collapsed or overlay navigation | Overlay or hidden by default            | Stacked, single-column dominant | Tables convert to stacked/card formats |
| sm → md    | Expandable navigation           | Optional persistent panel               | Two-column layouts emerge       | Condensed tables with wrapping         |
| lg → xl    | Persistent navigation           | Persistent sidebar / multi-panel layout | Multi-panel distribution        | Full table layouts                     |

Responsive patterns: **reflow** (3-col → 2-col → 1-col), **stack** (side-by-side →
vertical), **collapse** (data table → card list), **hide** (secondary content behind a
toggle), **reveal** (progressive disclosure at larger sizes), **switch** (horizontal tabs
→ bottom nav). Common adaptations: full nav → hamburger/bottom nav; multi-column forms →
single column; centered dialog → full-screen sheet; persistent sidebar → drawer overlay.

Testing: verify at every breakpoint boundary and between them; portrait and landscape on
tablet/mobile; touch targets ≥ 44 px on mobile/tablet; realistic content lengths.

## Grid system

The grid defines horizontal structure: columns (structural divisions), gutter (space
between columns), margin (outer boundary between grid and viewport). It provides order
independent of visual styling or responsive behaviour and scales from mobile to
dashboards and admin tools.

**Mobile (xs, 393 px)**: 4 columns primarily as alignment guides; most content spans
4/4; reduced gutter; margin is horizontal only and applies to the whole grid container.

**Desktop (sm → xl)**: structure expands rather than merely widening. Multi-column
compositions appear, side navigation persists, panels align horizontally, data density
increases, secondary content becomes visible. On lg/xl, content may be constrained by a
container max-width; dashboards can expand horizontally; spacing scales through stack
and inset tokens.

Column spans (12-column desktop): full 12/12 for hero and full-bleed; two-thirds 8/12
for primary content; half 6/12 for equal panels; one-third 4/12 for sidebars; one-quarter
3/12 for 4-up card grids. Common layouts: single column 8/12 centered; sidebar + content
3/12 + 9/12 or 4/12 + 8/12; equal split 6/12 + 6/12; card grid 3/12 × 4 or 4/12 × 3;
asymmetric 5/12 + 7/12.

Rules:

- Express widths as column spans, never percentages or pixels.
- Gutters and margins are variables (`layout.grid.gutter.{bp}` / `layout.grid.margin.{bp}`,
  aliasing the spatial scale); never hard-code them and never modify gutter width per
  component.
- Nested grids are allowed but subdivide the parent span and reuse the parent gutter.
- Full-bleed (content past the margins to the viewport edge) is a documented exception;
  content inside still aligns to the inner grid.
- Small elements (icons, badges) need not snap to columns; the grid is for structure.
- Never exceed max-width on wide screens; never cause horizontal scrolling at any
  breakpoint; reading order must match visual order.

## Agent behaviour (from the page contexts)

- Specify spacing as tokens, widths as column spans, borders as tokens.
- Design mobile-first; describe behaviour at each breakpoint; flag desktop-only
  components as incomplete.
- Verify content priority matches reading order at all sizes.
- Flag hard-coded pixel values for spacing, width, or borders as violations.
