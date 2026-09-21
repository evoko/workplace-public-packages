# Execution & Impact

> Verbatim text of the Figma page `Execution & Impact` (id `2023:1254`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `b13f75c56a1d`. Curated chapter: [17-implementation-pipeline.md](../../17-implementation-pipeline.md).

## Slide 1

### Execution & Impact

## Why & How We Measure

#### A design system without measurement drifts. Tracking adoption, quality, velocity, and cross-vertical reuse tells us whether SOLAR is accelerating teams or adding friction — and keeps the roadmap grounded in evidence, not assumptions.

##### Why We Measure

Metrics prove SOLAR is delivering value, expose adoption friction, and surface gaps — missing tokens, underused components, slow contribution cycles. They turn 'is the system working?' into a question we answer with data, and give every product vertical a shared, comparable picture of health.

##### Review & Reporting Cadence

KPIs are reviewed monthly by the SOLAR core team and reported quarterly to design leadership, covering adoption, quality, and the contribution pipeline. Targets are revisited annually as SOLAR matures. Product teams get continuous feedback through lint reports and design reviews, not just the quarterly cycle.

| Dimension | What it answers                   | Primary KPI                | Target        | Owner             | Cadence   |
| --------- | --------------------------------- | -------------------------- | ------------- | ----------------- | --------- |
| Adoption  | Are teams building on SOLAR?      | Token & component coverage | ≥ 90% / 80%   | Product teams     | Weekly    |
| Quality   | Is output accessible & correct?   | WCAG AA pass rate          | ≥ 95%         | Design leadership | Monthly   |
| Velocity  | Is SOLAR speeding delivery?       | Contribution cycle time    | Trending down | SOLAR core team   | Monthly   |
| Reach     | Is value shared across verticals? | Cross-vertical reuse       | ≥ 2 products  | SOLAR core team   | Quarterly |

## KPIs & Cross-Vertical Impact

#### These KPIs measure SOLAR's impact and efficacy — and, critically, the interaction between verticals. Adoption and quality show whether each product is on-system; reuse and graduation metrics show whether the system is genuinely shared rather than duplicated across teams.

##### Adoption & Quality

Token coverage and component adoption track how much of each product is built on SOLAR versus custom. Accessibility pass rate holds every vertical to the same WCAG AA bar on first review, so quality doesn't depend on which team shipped the screen.

##### Interaction Between Verticals

Cross-vertical metrics measure the system working as one: component reuse across products, pattern graduation rate (local → shared library once ≥ 2 products need it), and contribution flow between teams. Together they show whether verticals compound each other's work — the clearest signal of SOLAR's return on investment.

| Category | KPI                     | Description                                                   | Target        | Stakeholder            | Cadence     |
| -------- | ----------------------- | ------------------------------------------------------------- | ------------- | ---------------------- | ----------- |
| Adoption | Token coverage          | % of design files using semantic tokens vs. hard-coded values | ≥ 90%         | Product design teams   | Weekly      |
| Adoption | Component adoption      | % of UI surfaces built with SOLAR components vs. custom       | ≥ 80%         | Product engineering    | Per release |
| Quality  | Accessibility pass rate | % of components meeting WCAG AA on first review               | ≥ 95%         | Design leadership      | Monthly     |
| Velocity | Contribution cycle time | Time from proposal submission to release                      | Trending down | SOLAR core team        | Monthly     |
| Reach    | Cross-vertical reuse    | Products sharing each graduated component or pattern          | ≥ 2 products  | SOLAR core + verticals | Quarterly   |

## Stakeholders & Verticals

#### SOLAR's impact is a two-way exchange. The core team publishes tokens, components, and rules; product verticals consume them and feed back needs, gaps, and graduated patterns. Measuring that interaction — not just one-directional adoption — is what shows the system is genuinely shared.

##### Stakeholder Roles

Design teams consume components and raise gaps; engineering consumes tokens and Code Connect and reports implementation friction; design leadership sets priorities and reviews impact; the SOLAR core team curates the system and runs governance. Each has a defined channel into the contribution process.

##### Libraries & Graduation

SOLAR flows in dependency order: Foundations and Icons feed the platform libraries (Web and Native), and the domain libraries (Audio, Spatial, Flow) extend Web. When two or more products need the same pattern, it graduates from a local component into a shared library — the clearest evidence of cross-vertical reuse.

- Stakeholders
- Product design teams
- Product engineering
- Design leadership
- components, tokens →
- ← gaps, proposals
- SOLAR Core Team
- tokens · components · rules · governance
- tokens, components →
- ← graduated patterns
- SOLAR Libraries
- Web
- Native
- Audio
- Spatial
- Flow

## Instrumentation & Reporting

#### Every KPI has a defined data source and collection method, so numbers are reproducible rather than anecdotal. Most signals come straight from the lint agent's scheduled scans of Figma files, supplemented by Storybook coverage and contribution-pipeline timestamps.

##### How We Collect

The CI lint agent scans published Figma files on a schedule via the REST API, computing token and component coverage and accessibility pass rates directly from the source of truth. Contribution cycle time is derived from proposal-to-release timestamps; cross-vertical reuse is counted from shared-library consumers.

##### How We Report

Results surface where teams already work: Slack alerts for regressions, Figma comments on offending nodes, and an HTML dashboard for trends. The core team reviews monthly; a summary scorecard goes to design leadership each quarter. Targets are revisited annually as the system matures.

| KPI                     | Data source       | How collected                 | Frequency   | Reported via      | Owner             |
| ----------------------- | ----------------- | ----------------------------- | ----------- | ----------------- | ----------------- |
| Token coverage          | Figma files       | Lint agent scan (REST API)    | Weekly      | Dashboard + Slack | SOLAR core team   |
| Component adoption      | Figma + Storybook | Scan + story coverage         | Per release | Dashboard         | Engineering       |
| Accessibility pass rate | Figma files       | Lint rule A11Y-001 / 003      | Monthly     | Scorecard         | Design leadership |
| Contribution cycle time | Contribution log  | Proposal → release timestamps | Monthly     | Scorecard         | SOLAR core team   |
| Cross-vertical reuse    | Shared libraries  | Count of library consumers    | Quarterly   | Scorecard         | SOLAR core team   |
