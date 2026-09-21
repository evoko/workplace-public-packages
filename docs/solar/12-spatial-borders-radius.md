---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/spatial: 2f5eb8cf2ed9
    documentation/borders-radius: 008a48773d80
    primitives/spatial: f11777fc454c
---

# 12 · Spatial, Borders & Radius

> Source: Figma pages "Layout › Spatial" (spacing principles, hierarchy, sizing scale,
> stack, inset), "Layout › Borders & Radius", "Primitives › Spatial" and both pages'
> `@SOLAR:PAGE_CONTEXT`. Every value verified against the Primitives and Spatial
> collections.

## Spacing principles

| Principle                            | Meaning                                                                                                                                 |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Spacing creates relationships**    | Smaller spacing signals grouping; larger spacing creates separation and hierarchy. Structure should be obvious without borders or color |
| **Consistent rhythm over precision** | Values come from tokens, not per-layout tuning. Consistent rhythm improves scanability and reduces cognitive load                       |
| **Interaction-aware spacing**        | Touch targets, focus outlines and interactive states need room. If spacing breaks interaction or focus, it is a system issue            |

Spacing is controlled through standardized tokens, never manual margin adjustments.

## Spatial hierarchy

```
Viewport
   ↓
Grid margin
   ↓
Inset  (inside containers)
   ↓
Stack  (between siblings)
```

Each layer has a different role, from page boundaries to element rhythm. Use the layer
that matches the relationship: inset for containment, stack for separation between
siblings.

## Sizing scale (primitive)

A 4 px modular scale, platform-agnostic (px, rem, dp, pt as appropriate).
Figma: Primitives › `spatial/scale/0…22`. Documentation: `spatial.scale.N`.

| Index | px  | Index | px  | Index | px  | Index | px  |
| ----- | --- | ----- | --- | ----- | --- | ----- | --- |
| 0     | 0   | 6     | 24  | 12    | 48  | 18    | 96  |
| 1     | 4   | 7     | 28  | 13    | 52  | 19    | 112 |
| 2     | 8   | 8     | 32  | 14    | 56  | 20    | 128 |
| 3     | 12  | 9     | 36  | 15    | 64  | 21    | 144 |
| 4     | 16  | 10    | 40  | 16    | 72  | 22    | 160 |
| 5     | 20  | 11    | 44  | 17    | 80  |       |     |

All semantic spacing tokens (stack, inset, radius, borders, grid spacing) reference this
scale. Values off the 4 px grid (10, 15, 22 px) are never used.

## Stack and inset (semantic, Spatial collection)

| Size   | Scale index | px  | rem  | `stack.*` (vertical gap between siblings) | `inset.*` (padding inside a container) |
| ------ | ----------- | --- | ---- | ----------------------------------------- | -------------------------------------- |
| `none` | 0           | 0   | 0    | `stack.none`                              | `inset.none`                           |
| `2xs`  | 1           | 4   | 0.25 | `stack.2xs`                               | `inset.2xs`                            |
| `xs`   | 2           | 8   | 0.5  | `stack.xs`                                | `inset.xs`                             |
| `sm`   | 3           | 12  | 0.75 | `stack.sm`                                | `inset.sm`                             |
| `md`   | 4           | 16  | 1    | `stack.md`                                | `inset.md`                             |
| `lg`   | 5           | 20  | 1.25 | `stack.lg`                                | `inset.lg`                             |
| `xl`   | 6           | 24  | 1.5  | `stack.xl`                                | `inset.xl`                             |
| `2xl`  | 7           | 28  | 1.75 | `stack.2xl`                               | `inset.2xl`                            |
| `3xl`  | 10          | 40  | 2.5  | `stack.3xl`                               | `inset.3xl`                            |

Figma: Spatial › `stack/md`, `inset/md` (scope GAP). CSS: `--solar-stack-md`,
`--solar-inset-md`.

**Stack** separates sections, content groups, form fields, layout blocks: if two
elements share a parent and need space between them, use stack. **Inset** goes inside
cards, panels, sections, dialogs, page containers: containment, not separation.

Inventory caution: the prose slides say `stack.lg → 1.5rem` (24 px) and the Theming
chapter says `inset.lg = 24px`; the Spatial variables resolve `lg` to **20 px** and `xl`
to 24 px. The Primitives › Spatial tables list seven inset/stack values (0, 4, 8, 12, 16,
24, 32) rather than the nine variables. The variables are authoritative; the naming
overlap is logged in [source-discrepancies.md](source-discrepancies.md).

The Spatial page context also describes `space.{scale}`, `inline`, `squish_inset` and
`stretch_inset` usage types and component-level `{component}.space.{property}` overrides.
None of these exist as variables; `stack` and `inset` are the shipped semantics. The
proximity principle still applies: tight (`2xs`–`xs`) for related items, medium (`md`)
within a group, loose (`xl`–`3xl`) between sections. Spacing may tighten one step on
mobile while keeping proportional rhythm. Optical adjustments of ±1–2 px are allowed in
Figma only if documented.

## Border width

| Semantic (Spatial) | Primitive                   | px  | Use                                            |
| ------------------ | --------------------------- | --- | ---------------------------------------------- |
| `border.none`      | `spatial.border-width.none` | 0   | No border                                      |
| `border.default`   | `spatial.border-width.sm`   | 1   | Standard containment, dividers, input outlines |
| `border.strong`    | `spatial.border-width.md`   | 2   | Focus rings, emphasized borders, active states |
| `border.emphasis`  | `spatial.border-width.lg`   | 4   | Accent bars, heavy dividers                    |

Border width supports clarity, not decoration; it does not vary arbitrarily between
components. Border _color_ comes from `color.border.*` (see [05-color.md](05-color.md#border)).
Dividers: 1 px (`border.default`) in `color.border.subtle`, sitting within existing
spacing (no extra margin). Borders that convey meaning meet ≥ 3:1 contrast.

## Border radius

| Semantic (Spatial) | Primitive                    | px   | Use                                                                            |
| ------------------ | ---------------------------- | ---- | ------------------------------------------------------------------------------ |
| `radius.none`      | `spatial.border-radius.none` | 0    | Sharp corners                                                                  |
| `radius.subtle`    | `spatial.border-radius.sm`   | 4    | Compact structural elements, badges, tags, tooltips, inputs (per page context) |
| `radius.control`   | `spatial.border-radius.md`   | 6    | Buttons and controls (all button sizes)                                        |
| `radius.container` | `spatial.border-radius.lg`   | 8    | Cards, panels, containers                                                      |
| `radius.dialog`    | `spatial.border-radius.xl`   | 12   | Dialogs, drawers, elevated surfaces                                            |
| `radius.pill`      | `spatial.border-radius.full` | 9999 | Pills, avatars, circular elements only; never rectangular containers           |

Rules for applying radius:

- Components of the same type share the same radius; do not adjust per instance.
- Nested elements do not exceed the parent's curvature. Concentric rule: inner radius =
  outer radius − padding (a `radius.container` card with `inset.md` padding wants
  `radius.none` or `radius.subtle` inside).
- Structural containers keep consistent edge logic; radius hierarchy feels intentional.

The Borders page context lists an eight-step radius scale (`xs` 2 px, `2xl` 16 px, etc.)
and eight border color roles (`interactive`, `error`, `focus`…). Those are illustrative;
the six radius steps and the `color.border.*` roles above are what exists.

## Agent behaviour (from the page contexts)

- Provide token names (`stack.md`, `inset.lg`, `radius.control`), never pixel values; if
  a value is off-scale recommend the nearest token, never invent one.
- Component internal padding uses inset; between-component spacing uses stack.
- When recommending borders, give both the width token and the color token; verify the
  concentric radius rule for nested containers.
- Flag any hard-coded spacing, border, or radius as a violation.
