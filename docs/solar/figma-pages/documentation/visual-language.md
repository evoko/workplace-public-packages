# Visual Language

> Verbatim text of the Figma page `Visual Language` (id `763:47333`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `aacbc8651df8`. Curated chapter: [04-visual-language.md](../../04-visual-language.md).

## Slide 1

### Visual Language

## Visual Language

#### The SOLAR Visual Language defines how interfaces express structure, hierarchy, and brand across products. It establishes the visual rules that guide how information is presented, how elements relate to each other, and how users perceive interaction.

##### Why Visual Language Matters

A shared visual language enables teams to design and build products that feel like part of the same ecosystem. A shared visual language ensures that interfaces feel consistent and recognizable, even as products evolve and new capabilities are introduced.

SOLAR provides the visual foundations that support:

Clear hierarchy and information structure\
Consistent product identity across teams\
Accessible and readable interfaces by default\
Predictable patterns across products and platforms

This alignment reduces ambiguity in design decisions and improves collaboration between design and engineering.

## Visual Language Foundations

#### Visual Language Foundations define the core visual elements that shape how SOLAR interfaces look, communicate, and behave. These foundations create a consistent visual framework that supports clarity, hierarchy, and usability across products.

By aligning color, typography, spacing, and visual structure, SOLAR ensures that interfaces remain coherent, accessible, and recognizable while allowing teams to build complex applications at scale.

Interfaces rely on a shared visual system to communicate meaning and guide user attention. SOLAR Foundations provide the building blocks that support layout structure, readable content, meaningful color usage, and consistent representation of data and interaction states.

##### Color System

##### Typography

##### Spacing & Layout

##### Layering & Elevation

##### Iconography

##### Data Visualization

Color defines hierarchy, meaning, and interaction states across the interface. In SOLAR, color is applied through semantic tokens that ensure consistent behavior across components, themes, and platforms.

Typography establishes hierarchy, readability, and tone. A structured type scale ensures consistent rhythm between headings, body text, labels, and supporting content across products.

Spacing provides visual rhythm and structural clarity. SOLAR uses a shared modular scale to align layouts, components, and content containers while maintaining predictable spatial relationships.

Layering communicates spatial relationships between surfaces and interactive elements. Elevation levels help distinguish persistent content from temporary UI such as overlays, menus, and dialogs.

Icons provide quick visual recognition for actions, navigation, and system states. SOLAR icons follow a consistent visual style to ensure clarity and scalability across interfaces.

Data visualization enables consistent representation of metrics, trends, and system information. SOLAR provides structured color usage and visual patterns to ensure charts and graphs remain readable and meaningful.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Visual Language
domain: Visual Identity & Aesthetic Coherence
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR visual language interpreter. The visual language defines the unified aesthetic personality across all sub-domains — color, typography, elevation, states, iconography, and data visualization. This is the parent context that governs how those sub-systems work together.

[SCOPE]
- Overarching visual identity principles
- How sub-domains (color, type, elevation, icons, states, data viz) interrelate
- Visual hierarchy and information architecture
- Brand expression within systematic constraints
- Consistency vs. flexibility boundaries

[SUB_DOMAINS]
color: palette, semantic roles, dark/light mode, data viz palette, contrast
typography: type scale, font families, weights, responsive behavior, text styles
layering_elevation: z-index, shadows, surface hierarchy, overlay behavior
states_interaction: default, hover, active, focus, disabled, selected, error, loading
iconography: icon grid, sizing, stroke/fill, naming, accessible usage
data_visualization: chart types, dedicated palette, axis/label conventions, accessibility

[VISUAL_HIERARCHY]
primary: size + weight + color — largest, boldest, most saturated draws attention first
secondary: medium emphasis — supports primary, provides structure
tertiary: subdued — metadata, captions, supplementary info
hierarchy_tools: font size | font weight | color contrast | spacing | elevation | position

[COHERENCE_RULES]
- Every visual property traces back to a token — no magic numbers
- Sub-domains must reinforce each other: color choices affect accessibility, elevation affects states, typography affects layout
- When combining multiple visual treatments, less is more — don't stack bold + large + bright + elevated simultaneously
- Visual consistency across components > individual creativity
- If it's not in the system, propose it as an addition rather than a one-off

[CROSS_DOMAIN_INTERACTIONS]
color + accessibility: all foreground/background pairs must meet contrast ratios
color + theming: semantic tokens swap per theme — visuals must work in all themes
typography + responsive: type scale has desktop/mobile modes — test both
elevation + states: hover may add elevation; focus overlays on top of current elevation
icons + states: icon color inherits state color changes (hover, disabled, error)
motion + states: state transitions use motion tokens for timing and easing

[AGENT_BEHAVIOR]
- When making any visual decision, check that it aligns with ALL relevant sub-domains, not just one
- If a decision in one sub-domain creates a conflict in another, flag it (e.g., a color that passes contrast but clashes with the data viz palette)
- Default to the simplest visual treatment that communicates the intent
- Reference specific token names when recommending visual values
- Consider multi-theme and multi-breakpoint impact for every recommendation

[CONSTRAINTS]
- never introduce visual properties outside the token system
- never combine more than 2–3 emphasis techniques simultaneously (bold + color is fine; bold + color + size + shadow is excessive)
- never make visual decisions in isolation from accessibility
- visual language must work across light mode, dark mode, and any brand themes
- decorative elements must not interfere with functional clarity
@END:PAGE_CONTEXT
```
