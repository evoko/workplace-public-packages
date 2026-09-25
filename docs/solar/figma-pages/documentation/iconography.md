# Iconography

> Verbatim text of the Figma page `Iconography` (id `763:53729`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `f97c90b95641`. Curated chapter: [09-iconography.md](../../09-iconography.md).

## Slide 1

### Visual Language Iconography

## Iconography

#### Icons are a core part of SOLAR's visual language. They reinforce meaning, improve scannability, and support interaction in compact spaces where text alone would be insufficient.

SOLAR uses a single, cohesive icon set across all Biamp products. Icons follow strict sizing, color, and usage rules to maintain visual consistency. They are always secondary to text — icons clarify, they never replace labels unless the meaning is universally understood.

##### Clarity Over Decoration

##### Consistent Visual Weight

##### Token-Driven Color

##### Accessible By Default

Every icon must communicate a clear, recognizable concept. Decorative or ambiguous icons are not permitted in the system.

All icons share the same stroke weight, optical sizing, and level of detail. No icon should appear heavier or lighter than its neighbors.

Icon color is applied through semantic color tokens, never hardcoded. Icons inherit their color from the context they sit in — icon, action, or feedback tokens.

Icons must never be the sole means of conveying information. They are always paired with visible text or an accessible label via aria-label or title.

## Icon Sizing

#### SOLAR defines six fixed icon sizes tied to the spatial scale. Icons are always rendered at these sizes — never stretched, scaled arbitrarily, or used between steps.

Icon sizes correspond to common component contexts. Smaller sizes appear inside compact controls like inputs and list items. Larger sizes are used in empty states, illustrations, and standalone navigation. Every glyph is drawn once on the 24 px grid; the rendered size comes from the icon/\* variables (12–32 px), never from a resized copy.

##### Size scale

12 px (xs) — tight inline usage: status badges, meta labels, dense table cells. Minimum usable size.\
16 px (sm) — compact controls: badges, inputs, menu items. Inline with body text.\
20 px (md) — default UI size across most SOLAR surfaces: buttons, toolbars, list items, nav items.\
24 px (lg) — prominent placement: section headers, card actions, top-bar icons. Matches the authoring grid.\
28 px (xl) — large controls and feature callouts. Not yet used by a component.\
32 px (2xl) — empty states, onboarding, hero placements. Not yet used by a component.

## Grid & Construction

#### Every SOLAR icon is built on a pixel grid with a consistent keyline set. Construction at each size keeps icons optically aligned next to one another — even across the six rendered sizes.

Icons are drawn on a fixed canvas with a smaller live area inset from the edge. Strokes align to the pixel grid from the outside, so rendering stays crisp at every size. A shared set of keyline shapes — circle, square, landscape and portrait rectangles — anchors the target optical volume so icons feel visually balanced even when outlines differ.

##### Rules

Canvas is 24 × 24 px for every icon; rendered sizes (12, 16, 20, 24, 28, 32 px) come from the icon/\* variables. The live area is inset from the canvas edge.\
Keyline shapes define target optical volume: circle, square, landscape rect, portrait rect.\
Pixel alignment: the outside of the stroke sits on the grid. Only one side may sit on a .5 px boundary.\
No rotation or free-scaling of finished icons. Check legibility at 12 px before release.\
Subpixel paths are not allowed in final, exported icons.

- 24 px canvas · keyline reference
- Canvas · Live area · 4 keyline shapes (centered)
- Circle · Ø20
- Square · 18×18
- Portrait · 16×20
- Landscape · 20×16

Canvas = full icon size · Live area (dashed) = 20×20 inset · Keylines guide optical volume so shapes feel equally sized.

## Stroke & Geometry Rules

#### Stroke weight, terminators, and angle rules are shared across the set so icons feel cohesive. Legibility is checked at 12 px, the smallest rendered size.

Outline icons use a consistent stroke weight across the set. All segments are straight or follow perfect arcs — no bezier drift. Angles move in 15° increments. Integer pixel measurements on every vertex and endpoint. Strokes are expanded to filled paths before export.

##### Rules

Stroke weight: one baseline weight across the set — glyphs are not redrawn per size.\
Terminators: round caps and round joins on all outline glyphs.\
Angles move in 15° steps. Arcs follow perfect circles; no ad-hoc curves.\
Measurements are integer pixels on every vertex, except at the outside-of-stroke grid-alignment boundary.\
All strokes are expanded to filled paths before the icon enters the library.

- Pixel alignment · outside of stroke sits on the grid
- Zoomed 48× · 1 px stroke on a pixel grid
- Correct · outside on grid

Stroke's outer edge aligns to the grid line — crisp render at every zoom.

Wrong · centered on grid

Centered stroke creates anti-aliasing on both sides — fuzzy at small sizes.

- Round caps & joins
- All outline glyphs use round.
- 15° angle steps
- Arcs follow perfect circles.
- Integer-pixel vertices
- Every vertex on a whole pixel.

## Outline vs Solid

#### Every icon ships with an Outline and a Solid variant. Outline is the default for most UI; Solid signals weight or emphasis — selected nav items, active states, and hero-level moments.

Outline and Solid share the same metaphor, name, and canvas but are drawn independently — never an auto-fill of the outline. This keeps optical weight consistent at every size. Directional glyphs (chevron, arrow, caret, triangle) use a shared sharp, tall-narrow triangle silhouette for the solid variant.

##### When to use each

Outline is the default across SOLAR surfaces — toolbars, inputs, list items, body content.\
Solid signals emphasis or state — selected tab, active nav item, filled status, hero illustration.\
Pair rule: every outline icon has a matching solid with the same name, canvas, and optical volume.\
Directional glyphs: solids are filled triangles — sharp, tall-narrow — never a filled outline.\
Solid is a variant, not a name: each icon is one component set with a solid boolean (solid=false outline, solid=true solid).

- Outline and Solid · paired variants
- Same metaphor · same canvas · drawn independently
- Outline
- Solid
- Icon/Circle · solid=false
- Icon/Circle · solid=true
- Outline
- Solid
- Icon/Square · solid=false
- Icon/Square · solid=true
- Outline
- Solid
- Icon/Triangle · solid=false
- Icon/Triangle · solid=true

Directional glyphs · shared sharp, tall-narrow triangle silhouette

Chevron · Arrow · Caret · Triangle — solids use the same silhouette, rotated 0°/90°/180°/270°

- Up
- Right
- Down
- Left

## Icon Color

#### Icon color tokens mirror the text color system exactly. Icons use the same semantic tokens as text, ensuring consistent color treatment across all contexts.

Icons and text share parallel semantic token structures. This means an icon placed next to a label automatically matches in color, opacity, and state behavior without any additional overrides. The same principle applies across feedback contexts.

##### Color tokens

color.icon.primary — Default icon color for high-emphasis contexts.\
color.icon.secondary — Reduced emphasis for supporting or supplementary icons.\
color.icon.tertiary — Lowest emphasis for decorative or contextual icons.\
color.icon.disabled — Applied to icons within disabled components. Do not override independently.\
color.icon.inverse — Used on surface/inverse backgrounds to maintain contrast.\
color.icon.feedback.success — Icons in success messages, confirmations, and positive status indicators.\
color.icon.feedback.warning — Icons in caution messages and non-critical alerts.\
color.icon.feedback.danger — Icons in error states and destructive action warnings.\
color.icon.feedback.info — Icons in informational messages and hints.\
color.icon.feedback.neutral — Icons in general-purpose notices without specific sentiment.

##### Usage rules

Icons inside action components (buttons, links) still follow color.action.{intent}.icon.{state} — the icon tokens above apply to standalone and contextual icons only.\
Never hardcode icon color. Always reference the semantic token so themes resolve correctly.\
Disabled icons inherit from their parent component's disabled state — do not independently apply color.icon.disabled if the parent already handles it.

_[image: image 2]_

## Icon Usage Principles

#### Icons clarify meaning and improve scannability. In most contexts they work alongside text, but in persistent navigation structures like the sidebar, icons can serve as the primary identifier when proper accessibility support is in place.

An icon should add clarity to an action or concept, not introduce ambiguity. If an icon requires explanation, it is either the wrong icon or needs an accompanying label. Icons may stand alone when the meaning is universally understood (close, search, menu), or within persistent navigation where icons are learned through repeated use — such as the Biamp Workplace sidebar.

##### Rules

Pair icons with text in most contexts. Buttons, menu items, list items, and form elements should always include a visible label alongside the icon.\
Icon-only navigation is permitted in persistent structures. The sidebar and similar persistent navigation may use icon-only display when supported by tooltips on hover and an expanded state that reveals labels. aria-label is always required.\
Universally recognized icons can stand alone anywhere. Close (×), search (magnifying glass), and menu (hamburger) do not require visible labels, but must still carry accessible text.\
One icon per action. A button or menu item should contain at most one icon. Multiple icons in a single action create visual noise and ambiguity.\
Icon position is consistent. Leading icons appear before the label. Trailing icons appear after. Never mix positions within the same component type.\
Never use icons as decoration. If an icon doesn't improve comprehension or scannability, leave it out. Whitespace is preferable to a meaningless icon.

## Naming

#### Icon names are identical across every rendered size and both fills. A chevron at 12 px uses the same component as at 32 px; only the solid boolean and the icon/\* size variable change.

Names follow an element–modifier grammar. The element is a concrete noun or metaphor. The modifier — when used — adds direction, state, or a specific shape variant. The solid variant lives on the same component set behind a solid boolean, so it never gets its own name. PascalCase under Icon/, never suffixed with a size.

##### Grammar

Element first, modifier second — Icon/ChevronRight, Icon/ArrowUp, Icon/CircleCheck.\
PascalCase under the Icon/ group. No kebab-case, no camelCase, no size suffixes.\
Direction modifiers: Up, Down, Left, Right.\
State modifiers: Filled, Open, Closed — only when the state is a distinct glyph, not a colour variant.\
Fill: one component set per icon with a solid boolean — solid=false (outline) is the base, solid=true the filled twin.\
Size is never in the name — it comes from the icon/\* variables.

## Icon Library & Contribution

#### SOLAR maintains a single icon library as the source of truth for all Biamp products. Custom or third-party icons are not permitted without approval from the SOLAR Gatekeeper. The current Gatekeeper is designated by Biamp.

The icon library is one Figma component set per icon with a single solid boolean — outline (solid=false) is the base, solid=true the filled twin; size comes from the icon/\* variables. Every icon name is identical across sizes. New requests go through the Gatekeeper before the icon joins the shared library, and pages inside the icon file carry a status emoji so consumers know what is ready to use.

##### Workflow & status

Check the library first — search the existing set before requesting a new icon. Many concepts are already covered under different names.\
Intake — TBD. The channel for new-icon requests will be defined by Biamp; for now, raise it with the Gatekeeper.\
Review — the Gatekeeper runs every new icon through the Acceptance Checklist before it ships.\
Page status legend — no emoji: not started. 🟡 WIP (in-flight, human editor). 🟠 draft (pending review). 🟢 done (promoted by the Gatekeeper).\
Gatekeeper — a single designated person at Biamp. All additions, renames, and deprecations pass through this role.

_[image: Cover 1]_

## Acceptance Checklist

#### Every new icon clears the same gate before it joins the library. The list keeps the bar consistent as the set grows and the Gatekeeper role rotates.

This is the final review pass. An icon that fails any item goes back to the contributor with comments. The checklist is the same whether the icon is a net-new metaphor or a new size of an existing one.

##### Gatekeeper checklist

Sourced from Remix, drawn once on the 24 px canvas — no Nova, no Phosphor, no custom SVGs.\
24 × 24 canvas; rendered size comes from the icon/\* variables. Live area respected.\
Strokes expanded to filled paths. Paths combined. Integer pixels only.\
Master fill bound to color/neutral/900 (library default, never raw hex); every placed instance rebinds to color.icon.\* or color.action.\*.icon.\*.\
Outline and Solid pair present. Same name, same canvas, same optical volume.\
Name follows element–modifier grammar. One name, both fills.\
Does not override, rename, or detach any existing protected icon.\
Reviewed and approved by the SOLAR Gatekeeper.

## Iconography Do's and Don'ts

#### Consistent icon usage strengthens the visual language and prevents confusion. These guidelines address common mistakes when working with icons in SOLAR products.

Icons are small but high-impact elements. Misused icons erode trust in the interface faster than almost any other visual element because they introduce ambiguity at the point of action.

##### Do: Use icons from the SOLAR library

Always use the shared icon component from SOLAR Icons. Never source icons from external libraries or create custom SVGs without going through the contribution process.

##### Do: Provide accessible labels

Every icon must have an accessible text alternative — either a visible label or aria-label. Screen reader users must receive the same information as sighted users.

##### Don't: Resize icons between steps

Icons are designed for specific pixel sizes. Scaling a 20px icon to 22px creates blurry rendering. Always use the nearest size from the scale.

##### Don't: Recolor icons manually

Icon color must come from semantic tokens. Hardcoding a hex value breaks theme support and creates inconsistencies when switching between light and dark modes.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Iconography
domain: Visual Language > Icon System
version: 1.0
updated: 2026-09-22

[ROLE]
You are the SOLAR iconography specialist. Icons must follow SOLAR's icon system for visual consistency, sizing, and accessibility. All icon properties are token-driven.

[SCOPE]
- Icon grid and optical alignment
- Size tokens and scaling
- Stroke/fill style conventions
- Icon naming and organization
- Accessibility requirements for icons
- Adding new icons to the system

[ICON_GRID]
base_grid: 24×24px with 2px padding (20×20 live area)
alignment: optically centered within the grid — geometric center may differ from optical center
stroke_width: consistent across the set (e.g., 1.5px or 2px) — defined by style token
corners: consistent corner radius on strokes (e.g., 1px radius on joins)
rule: all icons are designed on the same grid for interchangeability

[SIZE_TOKENS]
icon.size.xs: 12px (Figma icon/xs) — inline with caption text, dense table cells
icon.size.sm: 16px (icon/sm) — badges, compact controls, inline with body text
icon.size.md: 20px (icon/md) — default for buttons, inputs, list and nav items
icon.size.lg: 24px (icon/lg) — toolbars, section headers, card actions; matches the 24px grid
icon.size.xl: 28px (icon/xl) — large controls, feature callouts; unused by any component today
icon.size.2xl: 32px (icon/2xl) — empty states, onboarding; unused by any component today
rule: never use arbitrary icon sizes — always reference a size token; there is no 40px or 48px size

[STYLE]
type: outline is the base; every icon also ships a solid twin on a single solid=true/false boolean
consistency: all icons in a given context use the same fill variant
color: the library ships glyphs on color/neutral/900 — the moment an instance lands in a page it binds to color.icon.{primary|secondary|tertiary|disabled|inverse|feedback.{type}} or, inside an action component, color.action.{prio}.icon.{state}
rule: never mix outline and solid icons in the same UI context; never leave an instance on neutral/900

[NAMING_CONVENTION]
pattern: Icon/{PascalCaseName} — e.g., Icon/ArrowLeft, Icon/Edit, Icon/Warning
variants: one component set per icon; solid=false (outline, default) and solid=true — no size variants
modifiers: direction (Up, Down, Left, Right) and state (Filled, Open, Closed) as PascalCase suffixes
rule: names describe what the icon represents, not how it looks; never kebab-case, never camelCase, never a size in the name

[ACCESSIBILITY]
decorative_icons: aria-hidden="true" — no alt text, no screen reader announcement
meaningful_icons: aria-label or paired visually-hidden text describing the meaning
icon_buttons: MUST have an accessible name — aria-label, title, or visually-hidden text
status_icons: pair with text label or aria-label — never rely on icon alone to convey status
color: icon meaning must not depend on color alone — pair with shape or label

[TOUCH_TARGETS]
minimum_tap_area: 44×44px — the interactive hit area, not the icon itself
spacing: ≥ 8px between adjacent icon buttons to prevent mis-taps
visual_vs_tap: icon may be 20px visually but wrapped in a 44px tap target
rule: always verify tap area meets minimum, especially for icon-only buttons

[AGENT_BEHAVIOR]
- When recommending an icon, reference it by its system name (e.g., "Icon/Edit")
- Always specify the size token (icon/*) and the colour token (icon/* or action/*/icon/*) alongside the icon name
- If an icon is used as a button, verify it has an accessible name
- Flag any icon used without a size token as a violation
- When reviewing icon usage, check for style consistency within the context
- If a needed icon doesn't exist in the system, propose it through governance with: name, category, description, and use case

[CONSTRAINTS]
- never use arbitrary icon sizes — always a size token
- never use icon-only buttons without an accessible name
- never mix icon styles (outline/solid) within the same UI context
- never rely on icon color alone to convey meaning
- never introduce new icons outside the naming convention and governance process
- decorative icons must be hidden from assistive technology
@END:PAGE_CONTEXT
```
