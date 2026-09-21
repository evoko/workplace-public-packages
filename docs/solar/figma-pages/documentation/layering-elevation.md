# Layering & Elevation

> Verbatim text of the Figma page `Layering & Elevation` (id `763:52851`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `cf5b344c4df1`. Curated chapter: [07-layering-elevation.md](../../07-layering-elevation.md).

## Slide 1

### Visual Language Layering & Elevation

## Layering & Elevation

#### Layering and elevation help users understand spatial relationships between interface elements. In SOLAR, elevation is used to communicate hierarchy, interaction states, and temporary surfaces such as overlays and menus.

Clear layering helps users distinguish between persistent content and transient interaction elements. SOLAR uses a small set of predictable elevation levels combined with surface and shadow tokens. This approach keeps interfaces visually calm while providing enough depth cues for navigation, hierarchy, and interaction feedback.

##### Layer Hierarchy

##### Subtle Depth Cues

##### Consistent System Behavior

##### Token-driven Implementation

Interfaces are organized into predictable layers such as background surfaces, content containers, overlays, and dialog elements.

Elevation relies on minimal shadows and surface contrast to communicate depth without adding visual noise.

Elevation levels correspond to specific UI patterns such as cards, dropdowns, popovers, and dialogs.

Elevation and layering are defined through tokens in SOLAR Foundations and applied consistently across all SOLAR component libraries.

## Elevation Levels

#### SOLAR uses a set of elevation levels to represent different layers within the interface. Limiting the number of levels keeps depth predictable and prevents visual clutter.

Each elevation level corresponds to a specific category of interface elements. These levels help define the spatial hierarchy of the UI and ensure consistent layering across components and products.

By mapping UI patterns to specific elevation levels, the system maintains clarity and consistency across the ecosystem.

##### Typical elevation levels

Background — The lowest-level surface that sits behind all other content and containers.\
Base — Primary page surfaces and structural layout containers.\
Raised — Content containers such as cards and panes that sit slightly above the base surface.\
Overlay — Temporary interface elements including dropdown menus, tooltips, and popovers.\
Dialog — Blocking surfaces such as dialogs or system alerts that require user attention.\
Scrim — Semi-transparent backdrop that obscures underlying content when a dialog surface is active.

SOLAR also defines utility surfaces that are not part of the elevation hierarchy:

Muted — Recessed or subdued areas used to de-emphasize content regions.\
Inverse — Flipped contrast surface for elements that stand apart from the primary color scheme.

##### Feedback surfaces

Success — Background for positive confirmations and success states.\
Warning — Background for caution messages and non-critical alerts.\
Danger — Background for error states and destructive action warnings.\
Info — Background for informational messages and hints.\
Neutral — Background for general-purpose notices without specific sentiment.

_[image: image 2]_

## Elevation Tokens

#### Elevation in SOLAR is expressed through two token groups working together: surface tokens define the background color of each layer, and shadow tokens define the visual depth cue.

Elevated surfaces share a common color value by design — depth is communicated through shadows, not surface contrast. Not all shadow tokens communicate depth; shadow/control signals interactivity rather than elevation.

##### Surface / shadow pairings

surface/background — no shadow\
surface/base — shadow/none\
surface/raised — shadow/raised\
surface/overlay — shadow/overlay\
surface/dialog — shadow/dialog\
surface/scrim — no shadow\
surface/muted — no shadow\
surface/inverse — no shadow

##### Shadow scale

shadow/none — No shadow. Base-level surfaces.\
shadow/control — Subtle shadow signaling interactivity for input elements.\
shadow/raised — Light lift for content containers.\
shadow/overlay — Pronounced shadow for floating elements.\
shadow/dialog — Strongest shadow in the system.

_[image: image 1]_

## Elevation in Context

#### Each elevation level maps to specific components in the SOLAR ecosystem. This reference shows which SOLAR Web components occupy each layer.

Consistent mapping between elevation levels and components reduces cognitive load. Users learn to associate visual depth with interaction expectations — flat surfaces are persistent, elevated surfaces indicate temporary or blocking interactions.

##### Base

##### Raised

##### Overlay

##### Dialog

Page shell, navigation rail, sidebar, content area. These structural surfaces form the foundation of every screen and sit flat with no shadow.

Card, data table, content pane, tab panel. These containers group related content and use shadow/raised to separate from the base layer.

DropdownMenu, Tooltip, Popover, ContextMenu. These components appear on interaction, float above content with shadow/overlay, and dismiss when focus leaves.

Dialog, AlertDialog, system alert. These components block the underlying interface with shadow/dialog and require explicit dismissal. A scrim always accompanies the dialog surface.

## Stacking & Layering Rules

#### Predictable stacking behavior is essential for accessible and consistent interfaces. SOLAR defines clear rules for how elevation levels interact when multiple layers are present simultaneously.

When multiple elevated surfaces coexist, their stacking order must follow the elevation hierarchy. Higher elevation levels always render above lower ones. These rules apply globally across SOLAR products.

Stacking order follows elevation. Elements at a higher elevation level always appear above elements at a lower level. Never manually override z-index to break this hierarchy.

One dialog at a time. Only a single dialog surface may be active at any time. Stacking dialogs on top of dialogs creates confusion and must be avoided. If additional user input is required, use inline content within the active dialog.

Overlays dismiss before dialogs. When an overlay (such as a dropdown) is open and a dialog is triggered, the overlay must dismiss before the dialog surface appears.

Scrim usage. Dialog surfaces must always be accompanied by a scrim that obscures the underlying content. The scrim signals that the background is not interactive and helps direct focus to the dialog content.

## Elevation Do's and Don'ts

#### Consistent use of elevation keeps interfaces readable and predictable. These guidelines address common decisions teams face when applying depth and layering in SOLAR products.

Elevation should clarify interface structure, not decorate it. Every shadow and surface change must serve a functional purpose — distinguishing layers, signaling interactivity, or communicating temporary states. When elevation is applied inconsistently or used for purely visual reasons, it undermines the spatial model and makes interfaces harder to parse. These rules help teams stay aligned on how depth should and should not

_[image: Screenshot 2026-03-16 at 08.47.38 1]_

##### Do: Pair surface & shadow from the same level

A raised card uses surface/raised and shadow/raised together. Never mix levels — applying shadow/dialog to a card to make it "pop more" breaks the hierarchy.

##### Do: Use scrim with every dialog

Dialog surfaces must always include a scrim behind them. Without it, there's no clear signal that underlying content is inactive.

##### Don't: Nest dialogs within dialogs

If a dialog needs additional user input, add it inline within the existing dialog. Stacking dialogs creates disorienting depth and breaks focus management.

##### Don't: Add shadows for emphasis

If an element doesn't occupy an elevated layer, it shouldn't carry a shadow. Use color, border, or spacing for emphasis instead. Shadows are reserved for spatial relationships.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Layering & Elevation
domain: Visual Language > Depth & Surface Hierarchy
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR elevation and layering specialist. Elevation communicates visual hierarchy, interactive context, and spatial relationships between surfaces. All depth is expressed through shadow tokens and z-index bands — never arbitrary values.

[SCOPE]
- Z-index management and layer bands
- Shadow tokens per elevation level
- Surface layering model (base → raised → overlay → dialog → toast)
- Overlay and scrim behavior
- Dark mode elevation adjustments

[ELEVATION_LEVELS]
level/0-base: default page surface — no shadow, z-index 0
level/1-raised: cards, tiles, wells — subtle shadow, z-index 1–9
level/2-overlay: dropdowns, popovers, tooltips — medium shadow, z-index 100–199
level/3-dialog: dialogs, drawers, sheets — strong shadow, z-index 200–299
level/4-toast: notifications, snackbars — strongest shadow, z-index 300–399
level/5-system: skip-links, dev tools — reserved, z-index 900+

[SHADOW_TOKENS]
shadow.none: 0px — base surfaces
shadow.subtle: 0 1px 2px rgba — raised cards, containers
shadow.medium: 0 4px 8px rgba — dropdowns, popovers
shadow.strong: 0 8px 24px rgba — dialogs, drawers
shadow.strongest: 0 12px 32px rgba — toasts, floating actions
rule: never write raw box-shadow values — always use shadow tokens

[Z_INDEX_BANDS]
base: 0–9 — page-level content
sticky: 10–99 — sticky headers, fixed toolbars
overlay: 100–199 — dropdowns, menus, popovers, tooltips
dialog: 200–299 — dialogs, drawers, bottom sheets
toast: 300–399 — notifications, snackbars, banners
system: 900+ — skip links, focus traps, dev overlays
rule: components must sit in their prescribed band — never arbitrary z-index

[SURFACE_COLORS]
color.surface.default: base page background
color.surface.subtle: slightly recessed areas, wells, sidebars
color.surface.raised: cards, elevated containers
color.surface.overlay: dropdown/popover backgrounds
color.surface.inverse: high-contrast inverted surfaces
rule: elevated surfaces may use progressively lighter backgrounds in dark mode

[SCRIM_OVERLAY]
scrim_token: color.overlay.scrim — semi-transparent backdrop
opacity: typically 0.4–0.6 (token-defined)
usage: behind dialogs, drawers, and bottom sheets
interaction: clicking scrim dismisses the overlay (unless blocking dialog)
accessibility: scrim must trap focus within the dialog layer

[DARK_MODE_BEHAVIOR]
shadows: reduced intensity in dark mode — darker environment needs less shadow contrast
surfaces: elevation is communicated via lighter surface tints rather than shadow alone
rule: test elevation hierarchy in both light and dark themes

[AGENT_BEHAVIOR]
- When recommending elevation, specify both the shadow token and z-index band
- If a component doesn't fit an existing elevation level, flag it as a governance gap
- Always check that overlapping layers use correct z-index ordering
- Verify that overlays include a scrim when required (dialogs, drawers)
- Test elevation recommendations in both light and dark mode

[CONSTRAINTS]
- never use raw box-shadow or z-index values — always tokens
- never stack more than 2–3 elevation levels simultaneously
- never place content above the toast layer except system-level elements
- scrim is mandatory for dialog-level overlays
- focus must be trapped within the highest active elevation layer
- overlays must be dismissible via Escape key
@END:PAGE_CONTEXT
```
