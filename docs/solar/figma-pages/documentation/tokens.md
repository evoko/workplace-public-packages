# Tokens

> Verbatim text of the Figma page `Tokens` (id `763:47331`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `890a13304be2`. Curated chapter: [02-tokens.md](../../02-tokens.md).

## Slide 1

Tokens

## Tokens

#### Tokens are the operational foundation of SOLAR. They turn design decisions — such as color, typography, spacing, motion, elevation, sizing, and responsiveness — into named, shared system values that align design and engineering across Biamp products. More than visual variables, tokens define structure, behavior, and accessibility at the system level.

##### Why tokens matter

Tokens enable SOLAR to function as a scalable system rather than a static UI kit.

They allow Biamp to:\
Create a shared contract between design and engineering\
Enforce consistency across products, platforms, and teams\
Centralize accessibility at the foundation\
Support theming, modes, and responsive behavior\
Version and evolve the system safely (Semantic Versioning)\
Make system-wide updates without refactoring components

Without tokens, consistency is manual. With tokens, consistency is systemic.

##### What tokens are not

Not component styles\
Not hard-coded values\
Not local design decisions\
Not visual decoration

Tokens are the layer beneath components — the layer that ensures change is intentional, traceable, and scalable.

- color.action.primary.border.default
- color.action.primary.bg.default
- radius.control
- Button label
- inset.md
- font.desktop.label.md
- shadow.subtle

## Primitive vs Semantic Tokens

#### SOLAR separates raw values from contextual intent. Primitive tokens define the system’s measurable foundation — colors, sizes, radius, motion — while semantic tokens define how those values are used in context. This separation keeps the foundation stable while allowing flexible, controlled application across products.

##### Primitive tokens

##### Semantic tokens

##### Component tokens (when needed)

Primitive tokens are raw, context-free values that define the visual foundation of SOLAR. They store things like colors, sizes, and numeric scales without any implied meaning, and are not used directly in UI. Base tokens exist to provide stability and consistency underneath all higher-level tokens.

Semantic tokens express intent and usage. They describe what a value is for—such as text, background, spacing, or focus—rather than what the value is. Semantic tokens are the primary interface between design and engineering, and are the tokens that should be used in products.

Component tokens allow controlled customization of individual components when semantic tokens are not sufficient. They are scoped, intentional overrides that still map back to semantic tokens wherever possible. Component tokens should be used sparingly to avoid fragmentation and design drift.

###### Raw, context-free values

###### Tokens with meaning and intent

###### Overrides scoped to a specific component

Example: blue-500, space-16, font-size-14\
Never used directly in UI\
Stable and rarely change

Example: color-text-primary, size-stack-md, radius-control\
Used by designers and engineers\
Map to base tokens under the hood

Example: ui-primary-default\
Used sparingly\
Should always map back to semantic tokens where possible

## Responsibilities

#### Clear ownership between design and engineering ensures that tokens in SOLAR remain intentional, consistent, and accessible as the system scales. Defining responsibilities upfront helps prevent visual drift, hard-coded values, and accessibility issues across platforms.

##### Design responsibility

##### Engineering responsibility

##### Accessibility and tokens

Design owns the meaning, structure, and intent of tokens in SOLAR. The goal is to define a clear, accessible system that scales across products without relying on component-level decisions.

Engineering owns the implementation, distribution, and runtime behavior of tokens. The goal is to ensure tokens work consistently across platforms and remain the single source of truth in code.

Accessibility is a system-level responsibility and starts with tokens. Tokens must be designed and validated so every component using them is accessible by default.

Define semantic token names and their intended usage\
Ensure tokens meet accessibility requirements (contrast, legibility, touch targets)\
Keep brand and layout decisions at the token level, not embedded in components\
Use tokens consistently in Figma via variables, styles, and modes\
Introduce new visual values only through tokens

Consume semantic tokens only—never raw values\
Map tokens correctly across Web, Desktop, Mobile, and Embedded platforms\
Support theming, modes, and system settings at runtime\
Enforce consistent token usage across components and codebases\
Avoid hard-coding values already represented by tokens

Ensure color tokens meet WCAG contrast requirements in intended contexts\
Define typography tokens with readable sizes and line heights\
Provide spacing tokens that support focus, touch, and interaction needs\
Make state tokens (hover, focus, disabled) explicit and testable\
Treat accessibility failures as token issues, not component exceptions

## Token Naming Grammar

#### SOLAR tokens follow a structured naming grammar. Understanding the grammar allows designers and engineers to predict token names without memorizing every one, and allows automated tools to validate token usage.

These examples illustrate the grammar in practice. Valid names follow the segment order and allowed values defined above; invalid names show common mistakes to avoid.

##### Valid examples

color.text.primary\
color.action.primary.bg.hover\
color.data.category.01\
spatial.border-radius.lg\
stack.md\
motion.duration.fast\
shadow.overlay

##### Invalid examples

color.primary.text (wrong order)\
color.button.background (component name in token)\
color.red.500 (primitive reference)

##### Color

color.{category}.{role}\
color.{category}.{modifier}.{role}\
color.action.{intent}.{property}.{state}\
color.data.{type}.{identifier}

| Segment             | Allowed Values                                                                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------- |
| category            | surface, text, border, icon, action, data                                                                   |
| role                | primary, secondary, tertiary, inverse, disabled, default, subtle, strong, base, raised, overlay, background |
| modifier (feedback) | success, warning, danger, info                                                                              |
| intent (action)     | primary, secondary, tertiary, primary-danger                                                                |
| property (action)   | bg, text, icon, border                                                                                      |
| state (action)      | default, hover, focus, active, disabled                                                                     |
| type (data)         | category, scale, delta                                                                                      |

##### Spatial

spatial.{type}.{size} — primitives (border-width, border-radius, viewport, scale)\
stack.{size} — vertical spacing between siblings\
inset.{size} — padding inside containers\
icon.size.{size} — icon dimensions

| Segment                 | Allowed Values                               |
| ----------------------- | -------------------------------------------- |
| type                    | scale, border-width, border-radius, viewport |
| size (spatial)          | none, sm, md, lg, xl, full                   |
| name (scale)            | Integer index: 0, 1, 2, 3, 4, ... 22         |
| name (viewport)         | xs, sm, md, lg, xl                           |
| size (stack/inset/icon) | none, 2xs, xs, sm, md, lg, xl, 2xl           |

##### Typography

typography.{property}.{scale}

| Segment  | Allowed Values                                                   |
| -------- | ---------------------------------------------------------------- |
| property | font-family, font-size, font-weight, line-height, letter-spacing |
| scale    | Numeric for size/height/spacing; named for family/weight         |

##### Motion

motion.{property}.{scale}

| Segment          | Allowed Values                                                       |
| ---------------- | -------------------------------------------------------------------- |
| property         | duration, easing                                                     |
| scale (duration) | instant (0), fast (100), normal (300), slow (600), slower (900)      |
| scale (easing)   | ease-out (entrances), ease-in (exits), ease-both (state transitions) |

##### Shadow

shadow.{category}.{variant} — functional (focus rings, feedback outlines)\
shadow.{level} — elevation

| Segment  | Allowed Values                   |
| -------- | -------------------------------- |
| category | focus, feedback                  |
| variant  | default, danger                  |
| level    | control, raised, overlay, dialog |

## CSS Implementation Contract

#### When SOLAR tokens are implemented in code, they must follow a consistent CSS custom property naming convention. This contract ensures portability across products and predictability for automated tooling. Resolved token values (Light and Dark mode) are documented in the Token Resolution Table in Chapter 07 — Theming.

##### Naming Convention

Every SOLAR token translates to a CSS custom property using a consistent formula: add the --solar- prefix and replace path separators with hyphens. This makes token-to-code mapping predictable and automatable.

##### Valid examples

color.surface.base → --solar-color-surface-base\
spatial.border-radius.lg → --solar-spatial-border-radius-lg\
motion.duration.normal → --solar-motion-duration-normal

##### Rules

All visual values in code must reference CSS custom properties — never raw hex, px, or rem values.\
The --solar- prefix is mandatory for all SOLAR tokens.\
Product-specific overrides must use a product prefix (e.g., --biamp-producto-custom-value) and must not redefine --solar- properties.\
Dark mode is handled via CSS custom property reassignment under a [data-theme="dark"] or prefers-color-scheme: dark context — component code never changes.

## Golden Rules

#### These rules translate accessibility requirements into everyday design and engineering decisions. They reduce ambiguity, standardize expectations, and make SOLAR components safe to reuse — so teams can move faster without re-litigating compliance each time.

##### Use semantic tokens, not raw values

##### Change tokens, not components

##### One meaning = one token

##### Accessibility is defined at the token level

Always reference semantic tokens when designing or building UI. Raw values bypass the system, create inconsistencies, and make change risky. Semantic tokens preserve intent and allow the system to scale safely.

When visual or behavioral updates are needed, update the token—not each individual component. Tokens are the source of truth; components are consumers. System-level changes must happen at the system level.

Each token represents a single, clearly defined role. If two tokens serve the same purpose, the system becomes ambiguous. Clear meaning ensures consistency, reuse, and predictable implementation.

Accessibility must be built into tokens from the start. If contrast, spacing, or typography fail at the token level, every component that uses them will fail as well. Fix the foundation, not the symptoms.
