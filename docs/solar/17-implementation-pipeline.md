---
solar:
  reviewed: 2026-09-21
  figmaVersion: '2397931579128493119'
  sources:
    documentation/implementation-guidelines: 6e76ace59937
    documentation/execution-impact: b13f75c56a1d
    meta/directory: 58b95920a8aa
---

# 17 · Implementation Pipeline

> Source: Figma pages "Implementation Guidelines" (design-to-code pipeline, ways of
> working & handoff, consumption by platform, validation & tooling), "Execution &
> Impact" (why and how we measure, KPIs, stakeholders, instrumentation) and
> "[Directory]".

## Token-first pipeline

Every visual decision is authored **once** as a semantic token in Figma, exported to
JSON, and consumed directly by code, so design and production share the same source of
truth at every stage.

```
01 Token authoring      02 Token export        03 CSS generation         04 Implementation
SOLAR core team         Core team              Engineering               Product engineering
Figma Variables    →    Figma → JSON      →    build-tokens         →    SOLAR components + CSS vars
                        tokens/*.json          --solar-* custom props    Lint + CI
Validation:             Diff review            Automated                 SOLAR Lint + CI
core team review
```

| Stage              | Action                                           | Owner               | Output            | Tooling                  | Validation       |
| ------------------ | ------------------------------------------------ | ------------------- | ----------------- | ------------------------ | ---------------- |
| 1. Token authoring | Define semantic tokens in Figma Variables        | SOLAR core team     | Token definitions | Figma Variables          | Core team review |
| 2. Token export    | Export Figma variables to JSON                   | SOLAR core team     | `tokens/*.json`   | Figma → JSON export      | Diff review      |
| 3. CSS generation  | Generate `--solar-*` custom properties from JSON | Engineering         | CSS variables     | `build-tokens` script    | Automated        |
| 4. Implementation  | Build UI with SOLAR components and CSS variables | Product engineering | Product UI        | Storybook, product repos | SOLAR Lint + CI  |

Product code consumes the variables and never hard-codes hex, px or rem. The pipeline is
scripted end-to-end through npm scripts and CI.

In this repository, [tokens/figma-variables.json](tokens/figma-variables.json) is the
stage-2 artefact until an automated export exists; `@bwp-web/styles` is the natural home
for stage 3.

## Ways of working and handoff

**Handoff readiness**: before handoff a design file binds every visual property to a
SOLAR token. Redlines reference token names, not pixels; spacing uses `inset.*` and
`stack.*`. Any value not backed by a token needs a contribution proposal before
implementation. Engineers never implement an un-tokenised value.

**Definition of done for a surface**: built from SOLAR components and CSS variables;
passes SOLAR Lint with zero errors; meets WCAG AA; documented in Storybook; mapped to
its Figma component via Code Connect. Exceptions follow the governed exception path.

RACI (R responsible, A accountable, C consulted, I informed):

| Activity        | Design | Engineering | SOLAR core | Output                    | Gate                     |
| --------------- | ------ | ----------- | ---------- | ------------------------- | ------------------------ |
| Token authoring | C      | I           | R · A      | Semantic tokens           | Core team review         |
| Component spec  | R · A  | C           | C          | Figma component + doc     | Design QA                |
| Handoff         | R · A  | C           | I          | Tokenised file + redlines | Lint pass, no raw values |
| Implementation  | C      | R · A       | I          | Production UI             | Lint + CI + WCAG AA      |

## Consumption by platform

Foundations tokens are platform-agnostic. Web generates `--solar-*` CSS variables; Native
resolves the same semantic names into Flutter or React Native theme objects. Because
names are identical, a decision made once in Figma lands consistently everywhere.

| Library         | Platform      | Token format         | Component source | Reference                | Status      |
| --------------- | ------------- | -------------------- | ---------------- | ------------------------ | ----------- |
| Foundations     | All           | Figma vars → JSON    | —                | Foundations docs         | Published   |
| Web             | React / CSS   | `--solar-*` CSS vars | SOLAR Web        | Storybook + Code Connect | Published   |
| Native          | Flutter / RN  | Theme objects        | SOLAR Native     | Code Connect             | WIP         |
| Audio · Spatial | Web (extends) | `--solar-*` CSS vars | Domain libraries | Storybook                | WIP         |
| Flow            | Web (extends) | `--solar-*` CSS vars | SOLAR Flow       | Storybook                | In progress |

Code Connect maps every published Figma component to its code snippet so engineers see
the exact import and props in Dev Mode. Storybook hosts the Web reference
implementation. Domain patterns graduate into shared libraries once two or more products
need them.

## Validation and tooling

Compliance is enforced by tooling, not memory.

| Tool              | Purpose                     | When it runs              | Output                             | Owner           | Blocking |
| ----------------- | --------------------------- | ------------------------- | ---------------------------------- | --------------- | -------- |
| SOLAR Lint plugin | Validate files inside Figma | As you design             | Inline issues                      | SOLAR core team | No       |
| CI lint agent     | Headless file scan          | Scheduled (9 am weekdays) | Slack + Figma comments + dashboard | SOLAR core team | No       |
| `build-tokens`    | JSON → CSS variables        | On token change / CI      | `--solar-*` CSS                    | Engineering     | **Yes**  |
| Code Connect      | Map Figma → code            | On component change       | Dev Mode snippet                   | Engineering     | No       |
| Storybook         | Reference implementation    | On build                  | Component stories                  | Engineering     | No       |

The same rule IDs power manual review checklists and AI-agent self-validation.
**`CLAUDE.md` is the single instruction layer** defining token grammar, banned patterns
and separators so any agent produces on-system output (see
[18-agent-reference.md](18-agent-reference.md)).

## Execution and impact: how SOLAR is measured

A design system without measurement drifts. KPIs are reviewed **monthly** by the core
team, reported **quarterly** to design leadership, with targets revisited **annually**.
Product teams get continuous feedback through lint reports and design reviews.

| Dimension | Question                          | KPI                     | Description                                                  | Target        | Stakeholder            | Cadence     | Data source / method                      |
| --------- | --------------------------------- | ----------------------- | ------------------------------------------------------------ | ------------- | ---------------------- | ----------- | ----------------------------------------- |
| Adoption  | Are teams building on SOLAR?      | Token coverage          | % of design files using semantic tokens vs hard-coded values | ≥ 90 %        | Product design teams   | Weekly      | Figma files; lint agent scan via REST API |
| Adoption  | Are teams building on SOLAR?      | Component adoption      | % of UI surfaces built with SOLAR components vs custom       | ≥ 80 %        | Product engineering    | Per release | Figma + Storybook; scan + story coverage  |
| Quality   | Is output accessible and correct? | Accessibility pass rate | % of components meeting WCAG AA on first review              | ≥ 95 %        | Design leadership      | Monthly     | Lint rules A11Y-001 / A11Y-003            |
| Velocity  | Is SOLAR speeding delivery?       | Contribution cycle time | Proposal submission → release                                | Trending down | SOLAR core team        | Monthly     | Contribution log timestamps               |
| Reach     | Is value shared across verticals? | Cross-vertical reuse    | Products sharing each graduated component or pattern         | ≥ 2 products  | SOLAR core + verticals | Quarterly   | Count of shared-library consumers         |

Cross-vertical metrics (reuse, pattern graduation rate local → shared once ≥ 2 products
need it, contribution flow between teams) are the clearest signal of return on
investment. Results surface where teams already work: Slack alerts for regressions,
Figma comments on offending nodes, an HTML dashboard for trends, a quarterly scorecard.

Stakeholder exchange: product design and engineering teams consume components, tokens
and Code Connect and feed back gaps, proposals and friction; design leadership sets
priorities and reviews impact; the SOLAR core team curates tokens, components, rules
and governance; graduated patterns flow back into the libraries (Web, Native, Audio,
Spatial, Flow).

## Directory of SOLAR resources

| Resource                        | Description                                                                        |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| SOLAR Guidelines & Fundamentals | Core principles, foundations and primitive tokens (this Figma file)                |
| SOLAR Web                       | Web component library and semantic tokens for browser applications                 |
| SOLAR Native                    | Application component library and semantic tokens for native interfaces            |
| SOLAR Icons                     | Central icon library                                                               |
| SOLAR Audio                     | Faders, meters, matrix mixers, channel strips for browser-based DSP control        |
| SOLAR Spatial                   | Furnishings, walls, floors, room elements for floor-plan and space-authoring tools |
| SOLAR Flow                      | Nodes, ports, wires, node-authoring surfaces for routing and DSP graph editors     |
| SOLAR Storybook Web             | Interactive documentation and implementation reference for SOLAR Web               |
| Biamp Brand                     | Official brand guidelines: logo, typography, color standards, visual identity      |
