# Responsive

> Verbatim text of the Figma page `Responsive` (id `763:57247`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `e05f7f27e5f6`. Curated chapter: [11-layout-responsive-grid.md](../../11-layout-responsive-grid.md).

## Slide 1

### Layout Responsive

## Responsive principles

#### Responsive design in SOLAR defines how layout behavior changes across breakpoints. It governs when structure expands, when components reflow, and how density adapts to available space. Responsive is not about resizing — it is about controlled structural transitions driven by breakpoint tokens.

##### Adapt Structure, Not Just Size

##### Content Drives Layout

##### Maintain Usability Across Contexts

Responsive design should reorganize content to maintain hierarchy and usability. Stacking, collapsing, and prioritizing content is preferred over simply scaling everything down.

Breakpoints and layout decisions must be driven by content and usability—not device categories. If content becomes cramped or unclear, the layout must adapt.

Touch targets, readable text sizes, and spacing must remain accessible at all viewport sizes. If responsiveness compromises clarity or interaction, the system—not the screen size—must be reconsidered.

## Viewport System

#### The viewport system defines the reference screen widths used across SOLAR. These viewport tokens provide a consistent set of layout thresholds that help products adapt across different screen sizes.

Viewports do not represent specific devices. Instead, they establish common ranges used to design responsive layouts across Biamp products.

By defining viewport sizes at the system level, SOLAR ensures that responsive behavior remains predictable and consistent across platforms.

###### Defined Viewports

SOLAR defines five viewport sizes used across product interfaces:\
xs — 393px\
sm — 768px\
md — 1024px\
lg — 1440px\
xl — 1920px

Each viewport represents the minimum screen width where layout transitions may occur.

###### Role in the Design System

Viewport tokens act as structural reference points used by layout systems and component libraries.

They provide a shared foundation for:

Responsive layout transitions\
Grid and container systems\
Adaptive component behavior

Viewport tokens are defined in SOLAR Foundations and consumed by SOLAR Web and domain libraries.

_[image: Screenshot 2026-03-13 at 16.25.51 1]_

## Responsive Behavior Rules

#### Responsive behavior in SOLAR defines how layout and components adapt across breakpoints. While the grid provides structure, responsive rules govern how navigation, panels, density, and content organization evolve. These behaviors ensure usability and hierarchy remain consistent across contexts.

##### Principle

Responsive behavior adapts structure and density without redefining visual language or component identity.

Navigation expands progressively with available space.\
Sidebars do not change grid structure — they alter available content width.\
Layout evolves from sequential to distributed.\
Filters and toolbars may collapse at smaller sizes and expand at larger ones.

| Breakpoint | Navigation                      | Sidebar & Panels                        | Content Layout                   | Data & Controls                        |
| ---------- | ------------------------------- | --------------------------------------- | -------------------------------- | -------------------------------------- |
| xs         | Collapsed or overlay navigation | Overlay or hidden by default            | Stacked (single-column dominant) | Tables convert to stacked/card formats |
| sm → md    | Expandable navigation           | Optional persistent panel               | Two-column layouts emerge        | Condensed tables with wrapping         |
| lg → xl    | Persistent navigation           | Persistent sidebar / multi-panel layout | Multi-panel distribution         | Full table layouts                     |

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Responsive
domain: Layout > Breakpoints & Adaptive Behavior
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR responsive design specialist. All interfaces must adapt gracefully across defined breakpoints using a mobile-first strategy. Breakpoints are tokenized — never use arbitrary media query values.

[SCOPE]
- Named breakpoint definitions and tokens
- Mobile-first progressive enhancement
- Responsive behavior patterns (reflow, stack, collapse, hide)
- Fluid vs. snapped behavior
- Content adaptation strategies per breakpoint

[BREAKPOINTS]
mobile: 0–599px — single column, stacked layout, collapsed nav
tablet: 600–1023px — 8-column grid, side-by-side possible, condensed nav
desktop: 1024–1439px — full 12-column grid, expanded nav, multi-panel layouts
wide: 1440px+ — 12-column grid with max-width cap, centered content

tokens:
  viewport.breakpoint.sm: 600px
  viewport.breakpoint.md: 1024px
  viewport.breakpoint.lg: 1440px
rule: use only named breakpoints — never custom media query values

[MOBILE_FIRST]
strategy: base CSS = mobile layout → @media (min-width) adds tablet/desktop enhancements
rationale: ensures core content and functionality works on the most constrained device first
rule: every feature must be functional at the mobile breakpoint before adding desktop enhancements

[RESPONSIVE_PATTERNS]
reflow: multi-column → fewer columns (e.g., 3-col → 2-col → 1-col)
stack: side-by-side elements → vertical stack on smaller screens
collapse: complex UI → simplified version (e.g., data table → card list)
hide: secondary content hidden on mobile, revealed via expand/toggle
reveal: progressive disclosure — more detail shown at larger breakpoints
switch: component variant swaps (e.g., horizontal tabs → bottom nav on mobile)

[FLUID_BEHAVIOR]
between_breakpoints: layout is fluid (percentage-based or flex) within each breakpoint range
typography: type scale modes (Desktop/Mobile) swap at the tablet breakpoint
spacing: spatial tokens may tighten on mobile breakpoints
images: max-width: 100% — never overflow container
content_width: capped at max-width on wide screens to maintain readability

[CONTENT_ADAPTATION]
navigation: full horizontal nav (desktop) → hamburger or bottom nav (mobile)
tables: full table (desktop) → card list or horizontal scroll (mobile)
forms: multi-column forms (desktop) → single-column stacked (mobile)
dialogs: centered dialog (desktop) → full-screen sheet (mobile)
sidebars: persistent sidebar (desktop) → drawer overlay (mobile)

[TESTING]
breakpoint_testing: verify layout at every named breakpoint boundary
between_testing: check fluid behavior between breakpoints (not just at snap points)
orientation: test both portrait and landscape on tablet/mobile
touch: verify touch targets ≥ 44px on mobile/tablet breakpoints
content: test with realistic content lengths — short and long text, missing images

[AGENT_BEHAVIOR]
- Always specify which breakpoints a layout recommendation applies to
- Start recommendations from mobile and build up
- When proposing a layout, describe its behavior at each breakpoint
- Flag any component that only works at desktop as incomplete
- Verify no horizontal scrolling occurs at any breakpoint
- Check that content priority matches reading order at all sizes

[CONSTRAINTS]
- never use custom breakpoint values — only named/tokenized breakpoints
- never design desktop-only — every feature must work at mobile
- never cause horizontal overflow at any breakpoint
- never rely on hover for functionality (mobile has no hover)
- touch targets must meet 44×44px minimum at mobile/tablet breakpoints
- images and media must be responsive — no fixed pixel widths
@END:PAGE_CONTEXT
```
