# Implementation Guidelines

> Verbatim text of the Figma page `Implementation Guidelines` (id `2023:1253`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `6e76ace59937`. Curated chapter: [17-implementation-pipeline.md](../../17-implementation-pipeline.md).

## Slide 1

### Implementation Guidelines

## Design-to-Code Pipeline

#### SOLAR runs on a token-first pipeline. Every visual decision is authored once as a semantic token in Figma, exported to JSON, and consumed directly by code — so design and production share the same source of truth at every stage.

##### Single Source of Truth

Figma Variables are the origin of all visual values — color, type, spacing, radius, elevation, and motion. The SOLAR core team authors semantic tokens in Figma; a build step exports them to JSON and generates CSS custom properties (--solar-\*). Product code consumes these variables and never hard-codes hex, px, or rem.

##### Automated & Continuous

The pipeline is scripted end-to-end. Token export, CSS generation, and component builds run through npm scripts and CI. The SOLAR Lint plugin validates files inside Figma in real time; the CI lint agent scans published files on a schedule and reports drift as Slack alerts, Figma comments, and a dashboard.

- 01
- Token authoring
- SOLAR core team · Figma Variables
- →
- 02
- Token export
- Core team · JSON export
- →
- 03
- CSS generation
- Engineering · build-tokens
- →
- 04
- Implementation
- Product eng · Lint + CI

## Ways of Working & Handoff

#### Seamless handoff depends on shared expectations. Design, engineering, and the SOLAR core team each own a clear slice of the pipeline, and no work crosses a boundary until it meets the definition of done for that stage.

##### Handoff Readiness

Before handoff, a design file binds every visual property to a SOLAR token — no raw values. Redlines reference token names, not pixels; spacing uses spatial tokens (inset.md, stack.lg). Any value not backed by a token needs a contribution proposal before implementation. Engineers never implement an un-tokenised value.

##### Definition of Done

A surface is done when it is built from SOLAR components and CSS variables, passes SOLAR Lint with zero errors, meets WCAG AA, is documented in Storybook, and is mapped to its Figma component via Code Connect. Exceptions follow the governed exception path and are logged for review.

| Activity        | Design | Engineering | SOLAR Core | Output                    | Gate                     |
| --------------- | ------ | ----------- | ---------- | ------------------------- | ------------------------ |
| Token authoring | C      | I           | R · A      | Semantic tokens           | Core team review         |
| Component spec  | R · A  | C           | C          | Figma component + doc     | Design QA                |
| Handoff         | R · A  | C           | I          | Tokenised file + redlines | Lint pass, no raw values |
| Implementation  | C      | R · A       | I          | Production UI             | Lint + CI + WCAG AA      |

## Consumption by Platform

#### The same tokens and component contracts flow to every platform. Web consumes CSS custom properties and React components; Native maps the same semantic tokens to Flutter or React Native; domain libraries (Audio, Spatial, Flow) extend Web. Code Connect links each Figma component to its coded counterpart.

##### Shared Contract, Native Output

Foundations tokens are platform-agnostic. Web generates --solar-\* CSS variables; Native resolves the same semantic names into Flutter or React Native theme objects. Because token names are identical across platforms, a colour or spacing decision made once in Figma lands consistently everywhere.

##### Design-to-Code Links

Code Connect maps every published Figma component to its code snippet, so engineers open a component in Dev Mode and see the exact import and props. Storybook hosts the reference implementation for Web. Domain patterns graduate into shared libraries once two or more products need them.

| Library         | Platform      | Token format        | Component source | Reference                | Status      |
| --------------- | ------------- | ------------------- | ---------------- | ------------------------ | ----------- |
| Foundations     | All           | Figma vars → JSON   | —                | Foundations docs         | Published   |
| Web             | React / CSS   | --solar-\* CSS vars | SOLAR Web        | Storybook + Code Connect | Published   |
| Native          | Flutter / RN  | Theme objects       | SOLAR Native     | Code Connect             | WIP         |
| Audio · Spatial | Web (extends) | --solar-\* CSS vars | Domain libraries | Storybook                | WIP         |
| Flow            | Web (extends) | --solar-\* CSS vars | SOLAR Flow       | Storybook                | In progress |

## Validation & Tooling

#### Compliance is enforced by tooling, not memory. A Figma plugin lints files as designers work; a CI agent scans published files on a schedule; build scripts generate tokens; and Code Connect plus Storybook keep the coded implementation honest against the design.

##### Real-Time & Continuous Checks

The SOLAR Lint plugin runs 22 machine-checkable rules inside Figma across colour, spacing, components, icons, typography, and accessibility — classified as error (must fix) or warning (should fix). The CI lint agent re-runs the same rules headlessly and reports drift as Slack alerts, Figma comments, and an HTML dashboard.

##### Deterministic for Humans & Agents

The same rule IDs power manual review checklists and AI-agent self-validation. CLAUDE.md is the single instruction layer defining token grammar, banned patterns, and separators, so any agent produces on-system output. build-tokens converts JSON to CSS; Storybook is the living reference.

| Tool              | Purpose                  | When it runs           | Output                    | Owner           | Blocking |
| ----------------- | ------------------------ | ---------------------- | ------------------------- | --------------- | -------- |
| SOLAR Lint plugin | Validate files in Figma  | As you design          | Inline issues             | SOLAR core team | No       |
| CI lint agent     | Headless file scan       | Scheduled (9am wkdays) | Slack + Figma + dashboard | SOLAR core team | No       |
| build-tokens      | JSON → CSS variables     | On token change / CI   | --solar-\* CSS            | Engineering     | Yes      |
| Code Connect      | Map Figma → code         | On component change    | Dev Mode snippet          | Engineering     | No       |
| Storybook         | Reference implementation | On build               | Component stories         | Engineering     | No       |
