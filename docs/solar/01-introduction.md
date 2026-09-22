---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/introduction: 28f6f1b3fc1b
    meta/table-of-contents: a63be7072ba6
---

# 01 · Introduction

> Source: Figma page "Introduction" (About SOLAR, Principles, Mission, Architecture,
> Foundations, Component Libraries, Product Modules, Asset Libraries, System Dependency
> Model) and the Table of Contents page.

## What SOLAR is

SOLAR is Biamp's unified design system and foundational framework for digital
products. It defines the standards, tokens, and structural rules that guide how
interfaces are designed and built across platforms.

**SOLAR provides**

- A shared token architecture for consistency across design and code
- A comprehensive icon library covering every interface need
- A scalable layout system (responsive, grid, spacing)
- A cohesive visual language (color, typography)
- Production-ready libraries for web, native, and specialized product domains
- Governance to ensure long-term maintainability

**How SOLAR operates**

- Defined once, implemented everywhere
- Maintained centrally, adopted across teams
- Continuously evolved, not periodically replaced

**What SOLAR is not**

- A static style guide
- A collection of isolated components
- A theme layer applied at the end of a project
- A one-time deliverable

SOLAR is a living system.

## Mission

SOLAR exists to unify how Biamp designs and builds products, enabling speed,
consistency, accessibility, and long-term scalability.

- **Designers** move faster with a unified, approved system, reducing rework and
  ensuring consistent, production-ready outcomes.
- **Developers** implement with confidence through shared tokens, styles, and
  components, reducing ambiguity and increasing reliability.
- **Product teams** operate from a complete, trusted foundation, accelerating delivery
  without sacrificing quality or accessibility.
- **Biamp** gains scalable reuse, cross-team alignment, and sustainable product
  evolution as SOLAR matures.

## Design principles

SOLAR's principles are derived from Biamp's brand attributes (quality, consistency,
reliability, directness, professionalism, and a pursuit of the extraordinary).

| Principle                         | Meaning                                                                                                                                           |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Consistency builds confidence** | Interfaces behave predictably across products and platforms. Shared tokens, components and patterns create a unified experience users can trust.  |
| **Clarity over complexity**       | Interfaces communicate their purpose immediately: direct interactions, clear hierarchy, purposeful visual language, less cognitive load.          |
| **Quality in every detail**       | Every element, from spacing to typography to interaction, reflects craftsmanship and precision: refined rhythm, accessibility, thoughtful design. |
| **Purposeful innovation**         | The interface evolves thoughtfully while maintaining system integrity. New patterns elevate the experience without compromising clarity.          |

## Architecture: four layers

SOLAR is a layered system that separates foundational design language, platform UI
components, and product-specific modules.

| Layer                   | Libraries                                       | Contains                                                                                                                                                                                                                                                                                                                            |
| ----------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foundations**         | SOLAR Foundations                               | Primitive tokens, color system, typography system, motion principles, layout and spacing, accessibility guidelines. Platform-agnostic and stable. Defines **no components**.                                                                                                                                                        |
| **Component libraries** | SOLAR Web (browser), SOLAR Native (iOS/Android) | Semantic tokens, core UI components, interaction states and behaviours, layout primitives and patterns. Each handles platform-specific behaviour. Both consume **SOLAR Icons**, a platform-agnostic sibling of Foundations.                                                                                                         |
| **Product modules**     | SOLAR Audio, SOLAR Spatial, SOLAR Flow          | Domain libraries that **extend SOLAR Web** with specialized controls: audio mixing and signal flow (Audio), floor-plan and space authoring (Spatial), node and wire authoring (Flow). They compose SOLAR Web primitives; they must not redefine foundational styles. Product-specific composition lives in each product's own file. |
| **Asset libraries**     | Icons, illustrations, media, brand graphics     | Supporting visual resources, not interactive building blocks. They follow the SOLAR visual language and can be used at every layer.                                                                                                                                                                                                 |

The Foundations file also ships some **domain-flavoured semantic tokens** that
technically belong to higher layers but live in the shared Color collection today:
`meter/*` (audio level meters), `control/{neutral,mute,solo,phantom,phase}/*` (audio
channel-strip controls) and the `color/flow-accent/*` primitives (SOLAR Flow wire
accents). See [05-color.md](05-color.md#domain-tokens-that-live-in-foundations).

## System dependency model

```
SOLAR Foundations · SOLAR Icons
        ↓
SOLAR Web · SOLAR Native
        ↓
SOLAR Audio · SOLAR Spatial · SOLAR Flow
        ↓
Product Files
```

Rules:

- Upper layers may depend on lower layers.
- Lower layers must never depend on higher layers.
- Product modules must not redefine foundational tokens.

This structure ensures consistency and prevents fragmentation of the system.

## Chapter map of SOLAR Foundations

The Figma file is organised as twelve numbered chapters. "Each chapter builds upon the
previous one, from foundational logic to visual expression, structure, and behaviour."

| #   | Chapter         | #   | Chapter                   |
| --- | --------------- | --- | ------------------------- |
| 01  | Introduction    | 07  | Theming                   |
| 02  | Tokens          | 08  | UX Copy                   |
| 03  | Accessibility   | 09  | Governance                |
| 04  | Visual Language | 10  | Implementation Guidelines |
| 05  | Layout          | 11  | Execution & Impact        |
| 06  | Motion          | 12  | Agentic Reference         |

Slide cross-references follow this numbering: the Tokens page points at the "Token
Resolution Table in Chapter 07 — Theming" and the Accessibility page at "Ch.09 Compliance
Validation Rules" (the rules live in the Governance chapter). The 2026-09-22 revision
brought the last mismatched reference into line.

## Versioning and changelog

SOLAR follows Semantic Versioning (`MAJOR.MINOR.PATCH`):

- **MAJOR**: breaking or incompatible changes that require product teams to update
  implementations.
- **MINOR**: new functionality or tokens added in a backward-compatible way.
- **PATCH**: backward-compatible fixes, refinements, or small improvements.

The Changelog page records, per change: component, change type, date, description,
contributors. The file is at version **1.0**. See
[16-governance-validation.md](16-governance-validation.md) for the full versioning and
deprecation policy.
