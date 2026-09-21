# SOLAR Design System — Foundations Reference

SOLAR is Biamp's unified design system. This folder is the written-down, repo-local
reference for **SOLAR Foundations v1.0**, transcribed from the Figma file
`SOLAR Foundations [v1--2026]` on 2026-09-20, and cross-checked against the file's
actual variable collections, text styles and effect styles.

It exists so that humans and AI agents working in this repository can build the V2
`@bwp-web/*` packages on SOLAR without opening Figma for every question.

## How to read this folder

| If you are…                                     | Start with                                                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| New to SOLAR                                    | [01-introduction.md](01-introduction.md) then [02-tokens.md](02-tokens.md)                                                                             |
| Implementing tokens or CSS                      | [02-tokens.md](02-tokens.md), [14-theming.md](14-theming.md), [tokens/](tokens/README.md)                                                              |
| Building a component                            | [08-states-interaction.md](08-states-interaction.md), [03-accessibility.md](03-accessibility.md), [07-layering-elevation.md](07-layering-elevation.md) |
| An AI agent generating UI                       | [18-agent-reference.md](18-agent-reference.md) first, then the chapter for the property you are setting                                                |
| Checking a value the docs and Figma disagree on | [source-discrepancies.md](source-discrepancies.md)                                                                                                     |

## Chapters

The numbering mirrors the Figma table of contents. Chapters 05–10 are the sub-pages of
Visual Language; 11–12 are the sub-pages of Layout.

| #   | Chapter                                                   | Figma page(s)                                                  |
| --- | --------------------------------------------------------- | -------------------------------------------------------------- |
| 01  | [Introduction](01-introduction.md)                        | Introduction                                                   |
| 02  | [Tokens](02-tokens.md)                                    | Tokens                                                         |
| 03  | [Accessibility](03-accessibility.md)                      | Accessibility                                                  |
| 04  | [Visual Language](04-visual-language.md)                  | Visual Language                                                |
| 05  | [Color](05-color.md)                                      | Visual Language › Color, Primitives › Color                    |
| 06  | [Typography](06-typography.md)                            | Visual Language › Typography, Primitives › Typography          |
| 07  | [Layering & Elevation](07-layering-elevation.md)          | Visual Language › Layering & Elevation, Primitives › Elevation |
| 08  | [States & Interaction](08-states-interaction.md)          | Visual Language › States & Interaction                         |
| 09  | [Iconography](09-iconography.md)                          | Visual Language › Iconography                                  |
| 10  | [Data Visualization](10-data-visualization.md)            | Visual Language › Data Visualization                           |
| 11  | [Layout, Responsive & Grid](11-layout-responsive-grid.md) | Layout, Responsive, Grid, Primitives › Viewport                |
| 12  | [Spatial, Borders & Radius](12-spatial-borders-radius.md) | Spatial, Borders & Radius, Primitives › Spatial                |
| 13  | [Motion](13-motion.md)                                    | Motion, Primitives › Motion                                    |
| 14  | [Theming](14-theming.md)                                  | Theming                                                        |
| 15  | [UX Copy](15-ux-copy.md)                                  | UX Copy                                                        |
| 16  | [Governance & Validation](16-governance-validation.md)    | Governance, Lint Plugin, Changelog                             |
| 17  | [Implementation Pipeline](17-implementation-pipeline.md)  | Implementation Guidelines, Execution & Impact, Directory       |
| 18  | [Agent Reference](18-agent-reference.md)                  | Agentic Reference + every `@SOLAR:PAGE_CONTEXT` block          |
| —   | [Token inventory](tokens/README.md)                       | All four variable collections, text and effect styles          |
| —   | [Source discrepancies](source-discrepancies.md)           | Where the Figma prose disagrees with the Figma variables       |

## The system in one paragraph

SOLAR is a **token-first**, layered system. **Primitive tokens** (raw palettes, a 4 px
spatial scale, a type scale, durations) are defined once in SOLAR Foundations.
**Semantic tokens** (`color.text.primary`, `inset.md`, `radius.control`…) give those
values meaning and are the only tokens products may use. Light/Dark mode and
Desktop/Mobile type are handled by **swapping the primitive behind a semantic token**,
never by component logic. Every token becomes a CSS custom property with the `--solar-`
prefix. Components (SOLAR Web, SOLAR Native), domain libraries (Audio, Spatial, Flow)
and product files sit above Foundations in a strict dependency order and may never
redefine what is below them. WCAG 2.1 AA is the floor, enforced at the token level.
Compliance is checked by tooling (SOLAR Lint in Figma, a CI lint agent, `build-tokens`)
rather than memory, and every gap goes through governance rather than a one-off fix.

## Precedence when sources disagree

The Figma file contains prose slides, per-page `@SOLAR:PAGE_CONTEXT` blocks written for
agents, and the actual variable collections. They do not always agree. This folder
applies the following precedence, and [source-discrepancies.md](source-discrepancies.md)
lists every case found:

1. **Figma variables, text styles and effect styles** (captured verbatim in
   [tokens/figma-variables.json](tokens/figma-variables.json)) are the source of truth
   for names and values.
2. **The Agentic Reference page and the chapter prose** for rules, rationale and
   usage guidance.
3. **`@SOLAR:PAGE_CONTEXT` blocks** for agent behaviour and constraints. Where a block
   quotes token names or values that do not exist in the inventory, treat them as
   illustrative, not canonical.

## How SOLAR maps onto this repository (orientation only)

Nothing below is decided yet; it is the obvious mapping and is recorded so the V2
design work has a starting point.

| SOLAR layer                                       | Likely home in this repo |
| ------------------------------------------------- | ------------------------ |
| Foundations tokens → `--solar-*` CSS, theme modes | `@bwp-web/styles`        |
| SOLAR Icons (Remix-sourced, outline + solid)      | `@bwp-web/assets`        |
| SOLAR Web components                              | `@bwp-web/components`    |
| SOLAR Spatial domain library (floor plans, CAD)   | `@bwp-web/canvas`        |

## Keeping this folder in sync with Figma

`npm run solar:sync` refreshes both SOLAR Figma files over the REST API without any agent
involvement. For Foundations it writes [raw/](raw/README.md) (one JSON per Figma page) and
renders [figma-pages/](figma-pages/INDEX.md): the verbatim text of every page, its tables,
its variable-bound swatches and its `@SOLAR:PAGE_CONTEXT` block. Those generated pages are
the material the curated chapters in this folder were written from. Each chapter's front
matter names its source pages and the content hash it was reviewed against;
[review-status.md](review-status.md) is regenerated on every sync and lists which chapters
are behind Figma. Reviewing a flagged chapter means reading the changed page in
`figma-pages/`, reconciling the chapter (the variables still win), and stamping it with
`node docs/solar/build-docs.mjs --mark-reviewed <chapter-file>`. Nothing rewrites chapters
automatically. The token JSON in [tokens/](tokens/README.md) is not touched by the sync
either; it is the declared source of truth and is recaptured deliberately.

## Provenance

- Figma file: Biamp's `SOLAR Foundations [v1--2026]`, key `Y21OGpk2z6ig9cRMc5cl9L`. The
  generated pages under [figma-pages/](figma-pages/INDEX.md) are fetched from it; the token
  inventory in [tokens/](tokens/README.md) was captured on 2026-09-20 at the same content
  version.
- Documentation pages carry `version: 1.0`, `updated: 2026-03-23` (Agentic Reference:
  2026-03-27).
- Ownership sits with the SOLAR core team (Head of Design, Design Lead). The file's Contacts
  page is deliberately excluded from this repository; ask the design team for it.
- Sibling libraries referenced: SOLAR Web, SOLAR Native, SOLAR Icons, SOLAR Audio,
  SOLAR Spatial, SOLAR Flow, SOLAR Storybook Web, Biamp Brand.
