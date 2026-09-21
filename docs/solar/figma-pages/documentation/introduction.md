# Introduction

> Verbatim text of the Figma page `Introduction` (id `1000:5125`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `28f6f1b3fc1b`. Curated chapter: [01-introduction.md](../../01-introduction.md).

## Slide 1

### Introduction About SOLAR

## About SOLAR®

_[image: Rectangle 5]_

#### SOLAR is Biamp’s unified design system and foundational framework for digital products. It defines the standards, tokens, and structural rules that guide how interfaces are designed and built across platforms.

##### What SOLAR Provides

A shared token architecture for consistency across design and code\
A comprehensive icon library covering every interface need\
A scalable layout system (responsive, grid, spacing)\
A cohesive visual language (color, typography)\
Production-ready libraries for web, native, and specialized product domains\
Governance to ensure long-term maintainability

##### How SOLAR Operates

Defined once, implemented everywhere\
Maintained centrally, adopted across teams\
Continuously evolved, not periodically replaced

##### What SOLAR Is Not

A static style guide\
A collection of isolated components\
A theme layer applied at the end of a project\
A one-time deliverable

SOLAR is a living system.

## SOLAR Principles

#### SOLAR’s design principles are inspired by Biamp’s brand attributes —quality, consistency, reliability, directness, professionalism, and a pursuit of the extraordinary—translating them into clear guidelines for digital interfaces.

##### Consistency Builds Confidence

##### Clarity Over Complexity

##### Quality in Every Detail

##### Purposeful Innovation

Interfaces should behave predictably across products and platforms. SOLAR establishes shared tokens, components, and patterns to ensure a unified experience that users can trust.

Interfaces should communicate their purpose immediately.\
SOLAR favors direct interactions, clear hierarchy, and purposeful use of visual language to reduce cognitive load.

Every element — from spacing to typography to interaction — should reflect craftsmanship and precision.\
SOLAR emphasizes refined visual rhythm, accessibility, and thoughtful system design.

SOLAR encourages thoughtful evolution of the interface while maintaining system integrity.\
New patterns and capabilities should elevate the experience without compromising clarity or consistency.

## Mission

SOLAR exists to unify how Biamp designs and builds products — enabling speed, consistency, accessibility, and long-term scalability.

Designers move faster with a unified, approved system — reducing rework and ensuring consistent, production-ready outcomes.

Developers implement with confidence through shared tokens, styles, and components — reducing ambiguity and increasing reliability.

Product teams operate from a complete, trusted foundation — accelerating delivery without sacrificing quality or accessibility.

As SOLAR matures, it enables scalable reuse, cross-team alignment, and sustainable product evolution across Biamp.

## SOLAR Architecture

#### SOLAR is structured as a layered design system that separates foundational design language, platform UI components, and product-specific modules. This layered approach ensures consistency, scalability, and flexibility across Biamp products.

_[image: Cover 1]_

_[image: Cover 1]_

_[image: Cover 1]_

_[image: Cover 1]_

##### Foundations

##### Component Libraries

##### Product Modules

##### Asset Libraries

SOLAR Foundations define the core visual language and fundamental rules of the system, including primitive tokens, design principles, and foundational guidelines used across all interfaces.

SOLAR Web and SOLAR Native translate the foundations into reusable interface components and semantic tokens, providing the core building blocks for product interfaces across web and native mobile platforms. Both libraries consume SOLAR Icons, a platform-agnostic sibling of SOLAR Foundations.

SOLAR Domain Libraries (Audio, Spatial, Flow) extend SOLAR Web with specialized components and interaction patterns for specific product domains. Product files compose these libraries into final app-specific interfaces.

SOLAR Asset Libraries provide shared visual resources such as icons, illustrations, and media assets that support the interface while remaining consistent with the SOLAR design language.

## Foundations

_[image: Rectangle 5]_

#### The Foundations layer defines the core design language of SOLAR. It establishes the primitive tokens, visual scales, and design rules that govern all interfaces.

This layer does not define components or product patterns. Instead, it provides the raw design primitives used throughout the system.

##### Includes

Primitive tokens\
Color system\
Typography system\
Motion principles\
Layout and spacing\
Accessibility guidelines

Foundations remain platform-agnostic and stable over time.

## Component Libraries

_[image: Rectangle 5]_

#### SOLAR Web and SOLAR Native translate the foundational design language into reusable interface building blocks used across products. Both consume SOLAR Icons for every interface glyph.

This layer defines how primitives are applied in real interface elements and provides semantic tokens that represent contextual meaning rather than raw values.

##### Includes

Semantic tokens\
Core UI components\
Interaction states and behaviors\
Layout primitives and patterns

SOLAR Web serves browser-based products; SOLAR Native serves iOS/Android. Each handles platform-specific behavior.

## Product Modules

#### Domain Libraries extend SOLAR Web with specialized interaction patterns and controls for specific product domains — audio mixing, spatial design, signal-flow authoring.

These libraries compose SOLAR Web primitives into higher-level functional interfaces tailored to domain needs.

##### Examples

Audio controls and signal flow (SOLAR Audio)\
Spatial and floor-plan tools (SOLAR Spatial)\
Node and wire authoring (SOLAR Flow)\
Product-specific interaction patterns

Domain libraries must build on SOLAR Web primitives and tokens rather than redefining foundational styles. Product-specific composition lives in each product's file.

_[image: Cover 2]_

## Asset Libraries

#### Asset Libraries provide shared visual resources used across the system.

Unlike UI components, assets are supporting interface elements rather than interactive building blocks.

##### Includes

Icon libraries\
Illustrations\
Media assets\
Brand graphics

Assets follow the SOLAR visual language and can be used across all system layers.

_[image: Cover 2]_

## System Dependency Model

#### SOLAR layers follow a strict dependency hierarchy.

SOLAR Foundations · SOLAR Icons\
↓\
SOLAR Web · SOLAR Native\
↓\
SOLAR Audio · SOLAR Spatial · SOLAR Flow\
↓\
Product Files

##### Rules

Upper layers may depend on lower layers\
Lower layers must never depend on higher layers\
Product modules must not redefine foundational tokens

This structure ensures consistency and prevents fragmentation of the system.
