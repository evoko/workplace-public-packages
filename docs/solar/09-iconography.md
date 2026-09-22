---
solar:
  reviewed: 2026-09-22
  figmaVersion: '2402047167094879156'
  sources:
    documentation/iconography: 5332d7846a42
---

# 09 · Iconography

> Source: Figma page "Visual Language › Iconography" (overview, sizing, grid &
> construction, stroke & geometry, outline vs solid, color, usage principles, naming,
> library & contribution, acceptance checklist, do's and don'ts) and its
> `@SOLAR:PAGE_CONTEXT`. Icon sizes verified against the Spatial collection.

## Position

Icons reinforce meaning, improve scannability, and support interaction in compact
spaces. SOLAR uses **one cohesive icon set** across all Biamp products (the SOLAR Icons
library, a platform-agnostic sibling of Foundations). Icons are always secondary to
text: they clarify, they never replace labels unless the meaning is universally
understood.

| Principle                    | Meaning                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Clarity over decoration**  | Every icon communicates a clear, recognizable concept; decorative or ambiguous icons are not permitted |
| **Consistent visual weight** | Same stroke weight, optical sizing and level of detail across the set                                  |
| **Token-driven color**       | Icon color comes from semantic tokens (icon, action, or feedback), never hard-coded                    |
| **Accessible by default**    | Never the sole means of conveying information; always paired with visible text or an accessible label  |

## Sizes

Six fixed sizes tied to the spatial scale. Icons are never stretched, scaled between
steps, or rotated/free-scaled after export.

| Name | px  | Spatial token (Figma) | Use                                                                    |
| ---- | --- | --------------------- | ---------------------------------------------------------------------- |
| xs   | 12  | `icon/xs`             | Tight inline usage: status badges, meta labels, dense table cells      |
| sm   | 16  | `icon/sm`             | Badges, inputs, menu items; inline with body text                      |
| md   | 20  | `icon/md`             | **Default UI size**: buttons, toolbars, list items, nav items          |
| lg   | 24  | `icon/lg`             | Prominent placement: section headers, card actions, top-bar icons      |
| xl   | 28  | `icon/xl`             | Large controls and feature callouts. Not yet used by a component       |
| 2xl  | 32  | `icon/2xl`            | Empty states, onboarding, hero placements. Not yet used by a component |

There is **no 40 px or 48 px icon size**, and no `xxl` step. Documentation name:
`icon.size.{size}`. The rendered size always comes from an `icon/*` variable, never from
a resized copy of the glyph.

## Grid and construction

- Every glyph is drawn **once, on a 24 × 24 px canvas**; the rendered size comes from the
  `icon/*` variables. The live area is inset from the canvas edge — at 24 px it is
  20 × 20.
- Keyline shapes define target optical volume so icons feel equally sized: at 24 px,
  circle Ø 20, square 18 × 18, portrait rect 16 × 20, landscape rect 20 × 16.
- Pixel alignment: the **outside** of the stroke sits on the pixel grid; only one side
  may sit on a .5 px boundary. A centred stroke anti-aliases on both sides and looks
  fuzzy at small sizes.
- No rotation or free-scaling of finished icons. Check legibility at 12 px, the smallest
  rendered size, before release.
- No sub-pixel paths in final exported icons.

## Stroke and geometry

- Stroke weight: one baseline weight across the whole set. Glyphs are not redrawn per
  size.
- Terminators: round caps and round joins on all outline glyphs.
- Angles move in 15° steps; arcs follow perfect circles; no bezier drift.
- Integer-pixel measurements on every vertex and endpoint (except at the
  outside-of-stroke alignment boundary).
- All strokes are expanded to filled paths and combined before an icon enters the
  library.

## Outline vs solid

Every icon ships as an **outline** (default) and a **solid** twin with the same metaphor,
name and canvas, drawn independently (never an auto-fill of the outline). Both live on
**one component set** behind a `solid` boolean: `solid=false` is the base, `solid=true`
the filled twin.

- Outline is the default across surfaces: toolbars, inputs, list items, body content.
- Solid signals emphasis or state: selected tab, active nav item, filled status, hero
  illustration.
- Directional glyphs (chevron, arrow, caret, triangle) share one sharp, tall-narrow
  triangle silhouette for the solid variant, rotated 0°/90°/180°/270°.

## Naming

- `Icon/{PascalCaseName}`, element first, modifier second: `Icon/ChevronRight`,
  `Icon/ArrowUp`, `Icon/CircleCheck`.
- PascalCase under the `Icon/` group; no kebab-case, no camelCase, no underscores, and
  **never a size in the name**.
- Direction modifiers: `Up`, `Down`, `Left`, `Right`.
- State modifiers: `Filled`, `Open`, `Closed`, only when the state is a distinct glyph,
  not a colour variant.
- Fill is the `solid` boolean, not a name: there is no `/Solid` suffix and no size
  variant property.

Two slides on the page still describe the retired scheme — a `/Solid` suffix and a
component set "with Size and Style variants". The Naming slide and the page context
supersede them, and the shipped library agrees: see
[../solar-icons/catalog.json](../solar-icons/catalog.json), where every entry is a single
24 × 24 set with `outline` and `solid` variants under a PascalCase name.

## Color

Icon color tokens mirror text color tokens exactly (see [05-color.md](05-color.md#icon)):
`color.icon.{primary,secondary,tertiary,disabled,inverse}`,
`color.icon.feedback.{success,warning,danger,info,neutral}`,
`color.icon.link.{default,hover,active,disabled}`.

- Icons inside action components follow `color.action.{intent}.icon.{state}`; the
  standalone icon tokens apply to contextual icons only.
- Never hard-code icon color.
- Disabled icons inherit the parent's disabled state; do not independently apply
  `color.icon.disabled` when the parent already handles it.

## Usage rules

- Pair icons with text in most contexts (buttons, menu items, list items, forms).
- Icon-only navigation is permitted in persistent structures (e.g. the Biamp Workplace
  sidebar) when supported by tooltips on hover and an expanded state that reveals
  labels; `aria-label` is always required.
- Universally recognized icons (close ×, search, hamburger menu) may stand alone but
  must still carry accessible text.
- One icon per action; leading icons before the label, trailing after; never mix
  positions within one component type.
- Never use icons as decoration; whitespace beats a meaningless icon.
- Touch: the tap area is ≥ 44 × 44 px even when the glyph is 20 px; ≥ 8 px between
  adjacent icon buttons.

## Accessibility

| Icon type   | Requirement                                                                     |
| ----------- | ------------------------------------------------------------------------------- |
| Decorative  | `aria-hidden="true"`; no alt text                                               |
| Meaningful  | `aria-label` or paired visually-hidden text describing the meaning              |
| Icon button | Accessible name mandatory (`aria-label`, `title`, or visually-hidden text)      |
| Status icon | Pair with text label or `aria-label`; never rely on the icon or its color alone |

## Library and contribution

- SOLAR Icons is the single source of truth. Custom or third-party icons are not
  permitted without approval from the **SOLAR Gatekeeper**, a single designated person
  at Biamp who handles all additions, renames and deprecations.
- The library is a set of Figma component sets, one per icon, with a `solid` boolean and
  no size variant.
- Workflow: check the library first → intake (channel TBD; raise with the Gatekeeper) →
  Gatekeeper review against the acceptance checklist → promotion.
- Page status legend in the icon file: no emoji = not started, 🟡 WIP, 🟠 draft (pending
  review), 🟢 done (promoted by the Gatekeeper).

**Acceptance checklist** (every item must pass). The Gatekeeper-checklist slide still
carries the pre-2026-09 wording — "at every size", "canvas matches the rendered size",
"identical across sizes" — which the Sizing, Grid and Naming slides retired; read it
against the single 24 × 24 canvas:

1. Sourced from the approved source set; no Nova, no Phosphor, no custom SVGs.
2. Drawn on the 24 × 24 canvas; live area respected.
3. Strokes expanded to filled paths; paths combined; integer pixels only.
4. Stroke and fill colour bound to semantic tokens (`color.icon.*` or
   `color.action.*.icon.*`), never hard-coded hex.
5. Outline and solid pair present on one component set, with the same name, canvas and
   optical volume.
6. Name follows the `Icon/{PascalCaseName}` element–modifier grammar and carries no size.
7. Does not override, rename, or detach any existing protected icon.
8. Reviewed and approved by the SOLAR Gatekeeper.

## Do and don't

| Do                                                               | Don't                                                             |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| Use icons from the SOLAR Icons library                           | Resize icons between steps (a 20 px icon at 22 px renders blurry) |
| Provide accessible labels for every icon                         | Recolor icons manually with hex values                            |
| Reference icons by system name with a size token                 | Mix outline and solid within one UI context                       |
| Bind every instance to `color.icon.*` or `color.action.*.icon.*` | Leave an instance on the library's `neutral/900` authoring fill   |
