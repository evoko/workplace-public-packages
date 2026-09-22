# Governance

> Verbatim text of the Figma page `Governance` (id `1114:10348`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `2b399162762f`. Curated chapter: [16-governance-validation.md](../../16-governance-validation.md).

## Slide 1

### Governance

## Exception Handling & Quality Standards

#### Sometimes a product team needs a value, pattern, or behavior that does not exist in SOLAR and cannot wait for the standard contribution process. SOLAR provides a controlled exception path and enforces minimum quality standards for all contributions.

##### Temporary Exceptions

Product teams may introduce a local exception with approval from the SOLAR core team. All exceptions must meet these requirements:\
Documented — a clear description of the exception and why it is needed\
Time-limited — a resolution deadline must be set at the time of approval\
Tracked — logged in the SOLAR backlog for future resolution or promotion to a system token\
Accessible — must comply with SOLAR accessibility standards (WCAG 2.1 AA)\
Namespaced — must use a product prefix (e.g., --biamp-producto-\*) to avoid confusion with --solar-\* system tokens

Exceptions that are not resolved by their deadline are escalated to the SOLAR core team for review. If the exception proves broadly useful, it may be promoted to a system-level token through the standard proposal process.

##### Quality Standards & Escalation

All contributions must meet five quality requirements before they can be merged into SOLAR:\
Accessibility — WCAG 2.1 Level AA minimum, validated in both light and dark modes\
Token compliance — all visual values must reference semantic tokens; no hard-coded hex values, pixel sizes, or raw font properties\
Cross-platform — tested on both Web and App platforms where applicable\
Documentation — usage guidance, do/don't examples, and token references must be included\
Review — approved by at least one member of the SOLAR core team

Escalation path: If a proposal is rejected and the team believes it is essential, they may escalate to the Design Lead and Head of Design for final resolution. Escalation is a last resort and requires written justification explaining why the standard process was insufficient.

## Proposal Process

#### All changes to SOLAR follow a five-step process: identify the need, submit a proposal, review, implement, and release. This ensures every change is evaluated for system-level value, consistency, accessibility, and maintenance cost before it enters the system.

##### Step 1–3: Identify, Submit, Review

Before proposing, verify the need is not already addressed, applies to more than one product, and does not conflict with SOLAR principles.\
Proposals include a description, affected tokens/components, proposed solution with rationale, impact assessment, and accessibility considerations.\
The SOLAR core team reviews on a regular cadence for system-level value, pattern consistency, accessibility compliance, and maintenance cost.

##### Step 4–5: Implement and Release

Approved changes are implemented by the SOLAR core team or the proposing team under SOLAR guidance.\
All changes must follow the library hierarchy (Foundations → Icons → Web/Native → Domain → Product), include both Figma and code implementation, include documentation updates, and pass accessibility validation.\
Changes are released following Semantic Versioning (MAJOR.MINOR.PATCH) and documented in the Changelog.

##### Proposal Requirements

Every proposal must include a clear description and context, list of affected tokens, components, or patterns, a proposed solution with rationale, an impact assessment identifying which products or teams are affected, and accessibility considerations for the change.

| Step         | Action                                                                | Owner                 | Output                | Review by       | Versioning        |
| ------------ | --------------------------------------------------------------------- | --------------------- | --------------------- | --------------- | ----------------- |
| 1. Identify  | Verify need is unmet and doesn't conflict with SOLAR principles       | Proposer              | Validated need        | Self-review     | N/A               |
| 2. Submit    | Write proposal with rationale, affected tokens, and impact assessment | Proposer              | Formal proposal       | N/A             | N/A               |
| 3. Review    | Evaluate for system-level value, consistency, and accessibility       | SOLAR core team       | Approval or rejection | SOLAR core team | N/A               |
| 4. Implement | Build in Figma and code, update docs, pass accessibility validation   | Proposer or Core team | Figma + code assets   | SOLAR core team | MAJOR.MINOR.PATCH |
| 5. Release   | Publish versioned release with Changelog entry                        | SOLAR core team       | Versioned release     | SOLAR core team | SemVer tag        |

## Compliance Validation Rules

#### SOLAR defines machine-checkable rules across ten categories. Each rule has a unique ID for reference in tooling and reports. Rules are classified as Error (must fix) or Warning (should fix). These rules can be used for automated linting, agent self-validation, or manual review checklists.

##### Visual Rules (CLR, SPC, TYP)

Color (CLR-001–006): No raw hex values, no primitive references in components, WCAG AA contrast for text and non-text.\
Spacing (SPC-001–004): No raw pixel values for spacing, border-radius, or border-width — all must use spatial tokens.\
Typography (TYP-001–005): All text must use named text styles, no manual overrides, sequential heading hierarchy, approved font families only.

##### Accessibility & Elevation (A11Y, ELV)

Accessibility (A11Y-001–008): Touch targets 44×44px minimum, visible focus rings, focus not clipped by overflow, correct ARIA roles and attributes, color not sole differentiator, dialog focus trapping.\
Elevation (ELV-001–003): No raw z-index values, shadow tokens must match elevation level, no sibling z-index conflicts.

##### System Rules (MOT, CMP, RSP, THM, NAM)

Motion (MOT-001–003): Token-based durations and easings, respect prefers-reduced-motion.\
Component (CMP-001–004): Correct HTML elements, required props, valid variant values.\
Responsive (RSP-001–003): Correct breakpoint tokens, proper nav transformation, no horizontal overflow.\
Theming (THM-001–003): No mode-specific values, all tokens resolve in both modes.\
Naming (NAM-001–003): --solar- prefix, grammar-conformant names.

| Category      | Rule IDs        | Rules    | Severity         | Errors | Warnings |
| ------------- | --------------- | -------- | ---------------- | ------ | -------- |
| 10 categories | CLR through NAM | 42 total | Error or Warning | 31     | 11       |

## Contribution Model

#### SOLAR is a living design system — it evolves through structured contributions from any team at Biamp. This page outlines who can contribute, what types of contributions are accepted, and how each is reviewed and approved before entering the system.

##### Who Can Contribute

Any designer, engineer, or product team member at Biamp can propose changes to SOLAR. All contributions are reviewed and approved by the SOLAR core team before integration. Contributors should check existing tokens, components, and patterns before proposing new ones.

##### Types of Contributions

Contributions fall into five categories: token requests (new or modified tokens), component enhancements (improving existing SOLAR library components), pattern proposals (new interaction or layout patterns), bug reports (inconsistencies, accessibility issues, broken behavior), and documentation updates. Each follows the same review process.

| Type                  | Description                                                         | Example                                  | Owner    | Review by               | Approval   |
| --------------------- | ------------------------------------------------------------------- | ---------------------------------------- | -------- | ----------------------- | ---------- |
| Token request         | Proposing a new token or modifying an existing one                  | New spacing token for compact data views | Any team | SOLAR core team         | Required   |
| Component enhancement | Improving an existing SOLAR library component                       | Adding a loading state to a dropdown     | Any team | SOLAR core team         | Required   |
| Pattern proposal      | Suggesting a new interaction or layout pattern                      | Inline editing pattern for table cells   | Any team | Design Lead + Core team | Required   |
| Bug report            | Reporting an inconsistency, accessibility issue, or broken behavior | Focus ring missing on custom checkbox    | Any team | SOLAR core team         | Fast-track |

## Governance Do's and Don'ts

#### A quick-reference guide for teams working within the SOLAR governance framework. These rules help maintain system integrity while keeping the contribution process efficient and accessible to all teams.

##### Do

Submit proposals through the designated channel.\
Include accessibility considerations in every proposal.\
Follow the library hierarchy (Foundations → Icons → Web/Native → Domain → Product).\
Namespace exception tokens clearly.\
Document all temporary exceptions with a time limit.\
Update the Changelog for every release.

##### Don't

Don't introduce local tokens without SOLAR core team approval.\
Don't skip the proposal process for "small" changes — all changes go through review.\
Don't use hard-coded values in place of tokens.\
Don't create exception tokens that mimic system token names.\
Don't ship without Figma and code implementation aligned.\
Don't ignore accessibility validation.

##### Process Tips

Check existing tokens, components, and patterns before proposing something new.\
Ensure your proposal applies to more than one product or use case.\
If rejected, try revising before escalating.\
Keep exception tokens time-limited and tracked.\
All contributions require approval by at least one SOLAR core team member.

| Requirement        | Standard                  | Applies to           | Mandatory | Verified by             | Exceptions?          |
| ------------------ | ------------------------- | -------------------- | --------- | ----------------------- | -------------------- |
| Accessibility      | WCAG 2.1 AA               | All contributions    | Yes       | Core team review        | None                 |
| Token compliance   | Semantic tokens only      | All contributions    | Yes       | Automated lint + review | None                 |
| Cross-platform     | Web + App tested          | Components, patterns | Yes       | Core team review        | Single-platform only |
| Documentation      | Usage + do/don't examples | All contributions    | Yes       | Core team review        | None                 |
| Core team approval | ≥1 core team member       | All contributions    | Yes       | SOLAR core team         | None                 |

## Implementation Guidelines

#### SOLAR operates on a token-first pipeline. Design decisions in Figma are expressed as semantic tokens, exported to JSON, and consumed directly by code — ensuring the source of truth is the same object at every stage from design to production.

##### Design-to-Code Pipeline

Figma variables are the origin of all visual values. The SOLAR core team authors semantic tokens in Figma, exports them as JSON, and engineering generates CSS custom properties (--solar-\*) via build scripts. Components consume these variables — never raw hex, px, or rem values. Validation runs through the SOLAR Lint plugin and CI agent.

##### Handoff & Consistency Rules

Design files must use SOLAR tokens for all visual properties before handoff. Redline annotations reference token names, not raw values. Spacing specs use spatial tokens (inset.md, stack.lg). Any deviation from SOLAR library primitives requires a contribution proposal before implementation begins. Engineers must not implement values not backed by a token.

| Stage              | Action                                          | Owner               | Output            | Tooling                   | Validation       |
| ------------------ | ----------------------------------------------- | ------------------- | ----------------- | ------------------------- | ---------------- |
| 1. Token authoring | Define semantic tokens in Figma Variables       | SOLAR core team     | Token definitions | Figma Variables           | Core team review |
| 2. Token export    | Export Figma variables to JSON                  | SOLAR core team     | tokens/\*.json    | Figma → JSON export       | Diff review      |
| 3. CSS generation  | Generate --solar-\* custom properties from JSON | Engineering         | CSS variables     | Build scripts             | Automated        |
| 4. Implementation  | Build UI using SOLAR components and CSS vars    | Product engineering | Product UI        | Storybook / product repos | SOLAR Lint + CI  |

## Execution & Impact Strategy

#### Measuring SOLAR’s impact ensures the system is delivering value, identifies adoption friction, and informs prioritisation. These KPIs are reviewed monthly by the SOLAR core team and reported quarterly to design leadership.

##### Why We Measure

A design system without measurement drifts. Tracking adoption, quality, and velocity tells us whether SOLAR is accelerating teams or creating friction. Metrics also surface where the system has gaps — missing tokens, underused components, or slow contribution cycles — so the roadmap stays grounded in evidence, not assumptions.

##### Review & Reporting

KPIs are reviewed monthly by the SOLAR core team. A summary report is shared with design leadership each quarter covering adoption trends, quality metrics, and contribution pipeline status. Metric targets are revisited annually as SOLAR matures. Product teams receive adoption feedback through lint reports and design reviews.

| Category | KPI                     | Description                                                   | Target        | Stakeholder          | Cadence             |
| -------- | ----------------------- | ------------------------------------------------------------- | ------------- | -------------------- | ------------------- |
| Adoption | Token coverage          | % of design files using semantic tokens vs. hard-coded values | ≥ 90%         | Product design teams | Weekly review       |
| Adoption | Component adoption rate | % of UI surfaces built with SOLAR components vs. custom       | ≥ 80%         | Product engineering  | Triaged in 2 days   |
| Quality  | Accessibility pass rate | % of components meeting WCAG AA on first review               | ≥ 95%         | Design leadership    | Monthly + quarterly |
| Velocity | Contribution cycle time | Time from proposal submission to release                      | Trending down | SOLAR core team      | Monthly review      |

## Golden Rules

#### These four principles define how SOLAR is maintained, extended, and protected. Every contribution, exception, and release decision should be evaluated against these rules. They are the foundation of SOLAR governance.

##### Propose, Don't Improvise

##### Change Tokens, Not Components

##### Accessibility Is Non-Negotiable

##### Document And Version Everything

Every change to SOLAR — tokens, components, patterns — must go through the proposal process. No ad-hoc modifications. Verify the need is unmet, submit a proposal, and wait for core team review before implementing.

When updates are needed, change the token — not each component. Tokens are the source of truth; components are consumers. System-level changes must happen at the system level, following the hierarchy: Foundations → Icons → Web/Native → Domain → Product.

WCAG 2.1 Level AA is the minimum bar for every contribution — no exceptions. Accessibility must be part of the proposal, validated during review, and tested before release. Even temporary exceptions must meet accessibility standards.

Every change is released with Semantic Versioning and logged in the Changelog. Exceptions are documented and time-limited. Both Figma and code must ship together. If it's not documented, it doesn't exist in SOLAR.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Governance
domain: Contribution Model & Change Management
version: 1.0
updated: 2026-03-23

[ROLE]
You are the SOLAR governance advisor. The design system is a shared product with a structured change process. When the system has a gap, the correct response is a governance request — never a one-off workaround.

[SCOPE]
- Contribution and change request process
- Change types and review requirements
- Semantic versioning policy
- Deprecation and migration procedures
- Roles and responsibilities
- Quality gates for system additions

[CONTRIBUTION_FLOW]
1_request: anyone can propose additions or changes — file a request with rationale and use case
2_triage: DS team reviews for alignment, feasibility, and priority
3_design: spec created — includes tokens, variants, states, accessibility, responsive behavior
4_review: cross-functional review — design, engineering, accessibility, product
5_approval: DS team grants final approval
6_implementation: built in Figma + code with full parity
7_release: published with documentation, changelog, and migration guide (if applicable)
rule: no addition ships without completing all gates

[CHANGE_TYPES]
new_token: adding a new primitive, semantic, or component token
new_component: adding a new component to the library
component_modification: adding variants, props, or states to an existing component
pattern_addition: documenting a new composition pattern
deprecation: marking a token/component for removal with a sunset timeline
breaking_change: removing or renaming tokens/components — requires migration guide
documentation: updating guidelines, examples, or usage notes

[REVIEW_REQUIREMENTS]
new_token: token naming review + theme coverage check
new_component: design spec + token mapping + accessibility audit + code implementation + documentation
component_modification: impact analysis on existing usage + backward compatibility check
deprecation: migration guide + sunset period (minimum 1 major version cycle)
breaking_change: requires major version bump + migration guide + advance notice

[VERSIONING]
model: semantic versioning (SemVer) — MAJOR.MINOR.PATCH
patch: bug fix, token value tweak, typo correction — backward compatible
minor: new addition (token, component, variant) — backward compatible
major: breaking change (removal, rename, restructure) — may require migration
rule: consumers should pin to minor version ranges for stability

[DEPRECATION_PROCESS]
announce: mark deprecated in documentation and Figma (visual indicator)
sunset_period: minimum one major version cycle before removal
migration_guide: provide step-by-step replacement instructions
tooling: lint rules flag deprecated token/component usage in code
removal: only in a major version release after sunset period expires

[ROLES]
ds_team: owns the system, triages requests, maintains quality, publishes releases
designers: propose additions, create specs, review visual consistency
engineers: implement components, validate token parity, maintain tooling
accessibility: reviews all additions for WCAG compliance
product: validates that additions serve real user/product needs
agents: flag gaps, propose additions through governance, never bypass

[QUALITY_GATES]
design_spec: complete Figma spec with all variants, states, and responsive behavior
token_mapping: all visual values traced to tokens — no hardcoded values
accessibility_review: WCAG 2.1 AA compliance verified — keyboard, screen reader, contrast
code_implementation: component built with full token and theme support
documentation: usage guidelines, do/don't examples, API reference
testing: visual regression tests, unit tests, cross-browser/theme verification

[AGENT_BEHAVIOR]
- When identifying a gap in the system (missing token, component, or pattern), document it as a governance request
- Never invent one-off solutions — always propose through the governance process
- Include in proposals: name, category, rationale, use case, suggested token/component spec
- Flag deprecated tokens or components when encountered — recommend the replacement
- When reviewing designs, check that all elements use system-approved tokens and components
- If a request is urgent, flag it as high-priority but still route through governance

[CONSTRAINTS]
- never bypass governance for expediency — one-offs create tech and design debt
- breaking changes require a major version bump and migration guide
- deprecated items must have a sunset period — never remove without notice
- all additions must include: design spec, token mapping, accessibility review, documentation
- cross-functional review is mandatory for components — no single-function approval
- the DS team owns final approval — escalation path exists for disputes
@END:PAGE_CONTEXT
```
