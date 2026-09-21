---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/iconography: 149b8a944ed6
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
steps, or rotated/free-scaled after export. All glyphs are sourced from **Remix Icon**.

| Name | px  | Spatial token (Figma) | Use                                                                                          |
| ---- | --- | --------------------- | -------------------------------------------------------------------------------------------- |
| xs   | 12  | `icon/xs`             | Tight inline usage: status badges, meta labels. Intentionally chunkier stroke for legibility |
| sm   | 16  | `icon/sm`             | Compact controls: buttons, inputs, menu items. Minimum for body contexts                     |
| md   | 20  | `icon/md`             | **Default UI size**: buttons, toolbars, list items, nav items                                |
| lg   | 24  | `icon/lg`             | Prominent placement: section headers, card actions, top-bar icons                            |
| xl   | 32  | —                     | Feature callouts, illustrations, feature tiles                                               |
| xxl  | 40  | —                     | Hero placements: empty states, onboarding, error pages, marketing                            |

Inventory note: the Spatial collection currently defines `icon/xl` = **28 px** and
`icon/2xl` = **32 px**, which does not match the documented xl = 32 / xxl = 40 above.
Until the variables are reconciled, treat the six documented sizes as the design intent
and the variables as a governance gap (see [source-discrepancies.md](source-discrepancies.md)).
Documentation name: `icon.size.{size}`.

## Grid and construction

- Canvas matches the rendered size (12, 16, 20, 24, 32, 40 px); each size has its own
  live area inset from the canvas edge. At 24 px the live area is 20 × 20.
- Keyline shapes define target optical volume so icons feel equally sized: at 24 px,
  circle Ø 20, square 18 × 18, portrait rect 16 × 20, landscape rect 20 × 16.
- Pixel alignment: the **outside** of the stroke sits on the pixel grid; only one side
  may sit on a .5 px boundary. A centred stroke anti-aliases on both sides and looks
  fuzzy at small sizes.
- Each size is drawn for that size, never stretched from another.
- No sub-pixel paths in final exported icons.

## Stroke and geometry

- Stroke weight: sm, md, lg, xl, xxl share a baseline weight; xs runs chunkier by design.
- Terminators: round caps and round joins on all outline glyphs.
- Angles move in 15° steps; arcs follow perfect circles; no bezier drift.
- Integer-pixel measurements on every vertex and endpoint (except at the
  outside-of-stroke alignment boundary).
- All strokes are expanded to filled paths and combined before an icon enters the
  library.

## Outline vs solid

Every icon ships as an **Outline** (default) and a **Solid** variant with the same
metaphor, name and canvas, drawn independently (never an auto-fill of the outline).

- Outline is the default across surfaces: toolbars, inputs, list items, body content.
- Solid signals emphasis or state: selected tab, active nav item, filled status, hero
  illustration.
- Directional glyphs (chevron, arrow, caret, triangle) share one sharp, tall-narrow
  triangle silhouette for the solid variant, rotated 0°/90°/180°/270°.
- Library naming: Outline has no suffix; Solid uses the `/Solid` suffix
  (`Icon/Circle`, `Icon/Circle / Solid`).

## Naming

- Element first, modifier second: `chevron-right`, `arrow-up`, `circle-check`.
- Lowercase, hyphen-separated; no camelCase, no underscores, **no size suffixes**.
- Direction modifiers: `-up`, `-down`, `-left`, `-right`.
- State modifiers: `-filled`, `-open`, `-closed`, only when the state is a distinct
  glyph, not a colour variant.
- Solid suffix: `{name}/Solid`.
- The name is identical across xs…xxl; only the Size variant property changes.

(The page context describes a `{category}/{action-or-object}` scheme with categories
`navigation | action | status | content | communication | media | file | social`. The
library slides use the flat element–modifier grammar above; follow the slides.)

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
- The library is a Figma component set with Size and Style variants.
- Workflow: check the library first → intake (channel TBD; raise with the Gatekeeper) →
  Gatekeeper review against the acceptance checklist → promotion.
- Page status legend in the icon file: no emoji = not started, 🟡 WIP, 🟠 draft (pending
  review), 🟢 done (promoted by the Gatekeeper).

**Acceptance checklist** (every item must pass):

1. Sourced from Remix at every size; no Nova, no Phosphor, no custom SVGs.
2. Canvas matches the rendered size; live area respected.
3. Strokes expanded to filled paths; paths combined; integer pixels only.
4. Stroke and fill colour bound to semantic tokens (`color.icon.*` or
   `color.action.*.icon.*`), never hard-coded hex.
5. Outline and Solid pair present with the same name, canvas and optical volume.
6. Name follows element–modifier grammar and is identical across sizes.
7. Does not override, rename, or detach any existing protected icon.
8. Reviewed and approved by the SOLAR Gatekeeper.

## Do and don't

| Do                                               | Don't                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------- |
| Use icons from the SOLAR Icons library           | Resize icons between steps (a 20 px icon at 22 px renders blurry) |
| Provide accessible labels for every icon         | Recolor icons manually with hex values                            |
| Reference icons by system name with a size token | Mix outline and solid within one UI context                       |
