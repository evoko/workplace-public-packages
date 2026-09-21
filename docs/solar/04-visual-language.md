---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/visual-language: aacbc8651df8
---

# 04 · Visual Language

> Source: Figma page "Visual Language" (About, Visual Language Foundations) and its
> `@SOLAR:PAGE_CONTEXT` block. This is the parent chapter for Color, Typography,
> Layering & Elevation, States & Interaction, Iconography and Data Visualization.

## Purpose

The SOLAR Visual Language defines how interfaces express structure, hierarchy, and
brand across products. It establishes the visual rules that guide how information is
presented, how elements relate to each other, and how users perceive interaction.

A shared visual language lets teams build products that feel like one ecosystem, and
keeps interfaces consistent and recognizable as products evolve. It supports:

- Clear hierarchy and information structure
- Consistent product identity across teams
- Accessible and readable interfaces by default
- Predictable patterns across products and platforms

## The six foundations

| Foundation               | Role                                                                                                                 | Chapter                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **Color system**         | Hierarchy, meaning, and interaction states, applied through semantic tokens across components, themes, and platforms | [05-color.md](05-color.md)                                             |
| **Typography**           | Hierarchy, readability, and tone through a structured type scale                                                     | [06-typography.md](06-typography.md)                                   |
| **Spacing & layout**     | Visual rhythm and structural clarity through a shared modular scale                                                  | [11](11-layout-responsive-grid.md), [12](12-spatial-borders-radius.md) |
| **Layering & elevation** | Spatial relationships between surfaces; distinguishes persistent content from temporary UI                           | [07-layering-elevation.md](07-layering-elevation.md)                   |
| **Iconography**          | Quick recognition for actions, navigation, and system states, in one consistent visual style                         | [09-iconography.md](09-iconography.md)                                 |
| **Data visualization**   | Consistent representation of metrics, trends, and system information                                                 | [10-data-visualization.md](10-data-visualization.md)                   |

States & Interaction ([08](08-states-interaction.md)) is the sixth sub-page in Figma and
governs how the others respond to input.

## Visual hierarchy

| Level     | Treatment                                                                      |
| --------- | ------------------------------------------------------------------------------ |
| Primary   | Size + weight + color: largest, boldest, most saturated; draws attention first |
| Secondary | Medium emphasis: supports primary, provides structure                          |
| Tertiary  | Subdued: metadata, captions, supplementary info                                |

Hierarchy tools, in order of preference: font size, font weight, color contrast,
spacing, elevation, position.

## Coherence rules

- Every visual property traces back to a token; no magic numbers.
- Sub-domains must reinforce each other: color affects accessibility, elevation
  affects states, typography affects layout.
- When combining treatments, less is more. Bold + color is fine; bold + color + size +
  shadow is excessive. Never stack more than 2–3 emphasis techniques.
- Visual consistency across components beats individual creativity.
- If it is not in the system, propose it as an addition rather than a one-off.

## Cross-domain interactions to check

| Combination             | What to verify                                                          |
| ----------------------- | ----------------------------------------------------------------------- |
| color + accessibility   | Every foreground/background pair meets contrast                         |
| color + theming         | Semantic tokens swap per theme; visuals work in Light and Dark          |
| typography + responsive | Type scale has Desktop and Mobile modes; test both                      |
| elevation + states      | Hover may add elevation; focus overlays on top of the current elevation |
| icons + states          | Icon color inherits state color changes (hover, disabled, error)        |
| motion + states         | State transitions use motion tokens for timing and easing               |

## Agent behaviour (from the page context)

- Check every visual decision against all relevant sub-domains, not just one, and flag
  cross-domain conflicts (for example a color that passes contrast but clashes with
  the data-viz palette).
- Default to the simplest treatment that communicates the intent.
- Reference specific token names when recommending values.
- Consider multi-theme and multi-breakpoint impact for every recommendation.
- Never introduce visual properties outside the token system; never make visual
  decisions in isolation from accessibility; decorative elements must not interfere
  with functional clarity.
