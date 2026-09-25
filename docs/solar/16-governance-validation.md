---
solar:
  reviewed: 2026-09-25
  figmaVersion: '2403083104633531037'
  sources:
    documentation/governance: 2b399162762f
    meta/lint-plugin: f8b268dcd32d
    meta/changelog: 58839eb14d96
---

# 16 · Governance & Validation

> Source: Figma pages "Governance" (contribution model, proposal process, exception
> handling & quality standards, compliance validation rules, do's and don'ts, golden
> rules), "[Lint Plugin]", "[Changelog]" and the Governance `@SOLAR:PAGE_CONTEXT`.

## Golden rules

1. **Propose, don't improvise.** Every change to tokens, components or patterns goes
   through the proposal process. Verify the need is unmet, submit, wait for core-team
   review.
2. **Change tokens, not components.** Tokens are the source of truth; components are
   consumers. Follow the hierarchy Foundations → Icons → Web/Native → Domain → Product.
3. **Accessibility is non-negotiable.** WCAG 2.1 AA is the minimum for every
   contribution, including temporary exceptions.
4. **Document and version everything.** Every change ships with Semantic Versioning and
   a Changelog entry; exceptions are documented and time-limited; Figma and code ship
   together. "If it's not documented, it doesn't exist in SOLAR."

## Who can contribute

Any designer, engineer, or product team member at Biamp. All contributions are reviewed
and approved by the **SOLAR core team** before integration. Check existing tokens,
components and patterns first; a proposal should apply to more than one product.

| Type                  | Description                                          | Example                                 | Review by               | Approval   |
| --------------------- | ---------------------------------------------------- | --------------------------------------- | ----------------------- | ---------- |
| Token request         | New or modified token                                | Spacing token for compact data views    | SOLAR core team         | Required   |
| Component enhancement | Improving an existing library component              | Loading state on a dropdown             | SOLAR core team         | Required   |
| Pattern proposal      | New interaction or layout pattern                    | Inline editing for table cells          | Design Lead + core team | Required   |
| Bug report            | Inconsistency, accessibility issue, broken behaviour | Missing focus ring on a custom checkbox | SOLAR core team         | Fast-track |
| Documentation update  | Guidelines, examples, usage notes                    | —                                       | SOLAR core team         | Required   |

Change types recognised by the page context: new token, new component, component
modification, pattern addition, deprecation, breaking change, documentation.

## Proposal process

| Step         | Action                                                                                                                       | Owner                 | Output               | Reviewed by     | Versioning        |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------------- | --------------- | ----------------- |
| 1. Identify  | Verify the need is unmet, applies to > 1 product, and does not conflict with principles                                      | Proposer              | Validated need       | Self            | —                 |
| 2. Submit    | Proposal with description, affected tokens/components, solution + rationale, impact assessment, accessibility considerations | Proposer              | Formal proposal      | —               | —                 |
| 3. Review    | Evaluate system-level value, pattern consistency, accessibility, maintenance cost                                            | SOLAR core team       | Approval / rejection | SOLAR core team | —                 |
| 4. Implement | Build in Figma **and** code, update docs, pass accessibility validation                                                      | Proposer or core team | Figma + code assets  | SOLAR core team | MAJOR.MINOR.PATCH |
| 5. Release   | Publish versioned release with Changelog entry                                                                               | SOLAR core team       | Versioned release    | SOLAR core team | SemVer tag        |

Review requirements by change type: new token → naming review + theme coverage; new
component → design spec + token mapping + accessibility audit + code + docs; component
modification → impact analysis + backward-compatibility check; deprecation → migration
guide + sunset period; breaking change → major bump + migration guide + advance notice.
Cross-functional review (design, engineering, accessibility, product) is mandatory for
components. The core team owns final approval; escalation is to the Design Lead and Head
of Design with written justification, as a last resort.

## Quality standards

Every contribution must meet:

| Requirement        | Standard                  | Applies to           | Verified by             | Exceptions           |
| ------------------ | ------------------------- | -------------------- | ----------------------- | -------------------- |
| Accessibility      | WCAG 2.1 AA, both modes   | All contributions    | Core team review        | None                 |
| Token compliance   | Semantic tokens only      | All contributions    | Automated lint + review | None                 |
| Cross-platform     | Web + App tested          | Components, patterns | Core team review        | Single-platform only |
| Documentation      | Usage + do/don't examples | All contributions    | Core team review        | None                 |
| Core team approval | ≥ 1 core team member      | All contributions    | SOLAR core team         | None                 |

Quality gates from the page context: complete design spec (variants, states,
responsive), token mapping (no hard-coded values), accessibility review, code with full
token and theme support, documentation (usage, do/don't, API), testing (visual
regression, unit, cross-browser/theme).

## Temporary exceptions

A product team may introduce a local exception with core-team approval when it cannot
wait for the standard process. Every exception must be:

- **Documented**: what and why.
- **Time-limited**: a resolution deadline set at approval.
- **Tracked**: logged in the SOLAR backlog.
- **Accessible**: WCAG 2.1 AA.
- **Namespaced**: a product prefix such as `--biamp-producto-*`; never `--solar-*`, and
  never a name that mimics a system token.

Unresolved exceptions escalate to the core team at their deadline; broadly useful ones
may be promoted to system tokens through the normal proposal process.

## Versioning and deprecation

- **SemVer**: PATCH = bug fix, token value tweak, typo; MINOR = new token, component or
  variant (backward compatible); MAJOR = removal, rename or restructure (may require
  migration). Consumers should pin to minor ranges.
- **Deprecation**: announce in docs and Figma with a visual indicator; sunset period of
  at least one major version cycle; step-by-step migration guide; lint rules flag
  deprecated usage; removal only in a major release after the sunset.
- **Changelog** columns: Component (name and link), Change (MAJOR/MINOR/PATCH), Date
  (YYYY-MM-DD), Description, Contributors.

The Changelog page's first entries, all dated 2026-09-25:

| Component         | Change | Description                                                                 |
| ----------------- | ------ | --------------------------------------------------------------------------- |
| Color variables   | MINOR  | Secondary actions: no background; danger hover keeps the red tint           |
| Color variables   | PATCH  | Dark primary icon hover/pressed follows the label; danger hovers pass 4.5:1 |
| Spatial variables | MINOR  | Added `size/control/sm`, `md`, `lg` and `size/target/min`                   |
| Guideline pages   | PATCH  | Action states, data scale and icon checklist corrected to the variables     |

The values are in [05-color.md](05-color.md#action) and
[18-agent-reference.md](18-agent-reference.md#spatial-system-verified).

## Compliance validation rules

Machine-checkable rules with stable IDs, used by the SOLAR Lint plugin, the CI lint
agent, agent self-validation and manual checklists. Classified **Error** (must fix) or
**Warning** (should fix). The Governance page counts 42 rules (31 errors, 11 warnings)
across ten categories.

| Category      | IDs          | Scope                                                                                                                                                                |
| ------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Color         | CLR-001…006  | No raw hex; no primitive references in components; WCAG AA contrast for text (CLR-003) and non-text (CLR-004)                                                        |
| Spacing       | SPC-001…004  | No raw px for spacing, border radius, border width; spatial tokens only                                                                                              |
| Typography    | TYP-001…005  | Named text styles only; no manual overrides; sequential heading hierarchy; approved font families                                                                    |
| Accessibility | A11Y-001…008 | 44 × 44 touch targets (`size.target.min`); visible focus rings (A11Y-003); focus not clipped; correct ARIA; color not the sole differentiator; dialog focus trapping |
| Elevation     | ELV-001…003  | No raw z-index; shadow token matches elevation level; no sibling z-index conflicts                                                                                   |
| Motion        | MOT-001…003  | Token durations and easings; respect `prefers-reduced-motion`                                                                                                        |
| Component     | CMP-001…004  | Correct HTML elements; required props; valid variant values                                                                                                          |
| Responsive    | RSP-001…003  | Correct breakpoint tokens; proper nav transformation; no horizontal overflow                                                                                         |
| Theming       | THM-001…003  | No mode-specific values; all tokens resolve in both modes; custom surfaces use semantic surface tokens                                                               |
| Naming        | NAM-001…003  | `--solar-` prefix; grammar-conformant names                                                                                                                          |

Individual rules named in the source:

| ID       | What it flags                                              | Severity | Action                   |
| -------- | ---------------------------------------------------------- | -------- | ------------------------ |
| CLR-001  | Solid fill without a variable binding                      | Error    | Bind to a semantic token |
| CLR-003  | Text contrast below WCAG AA                                | Error    | Fix contrast             |
| CLR-004  | Non-text contrast below WCAG AA                            | Error    | Fix contrast             |
| A11Y-001 | Text contrast below AA (lint plugin's accessibility check) | Error    | Fix contrast ratio       |
| A11Y-003 | Focus ring not visible                                     | Error    | Add visible focus ring   |
| CMP-005  | Instance uses an older version of a published component    | Warning  | Update to latest         |
| DET-001  | Frame named like a DS component but not an instance        | Error    | Swap to DS instance      |
| TYP-006  | Text node with no bound text style                         | Warning  | Apply a DS text style    |
| THM-001  | Mode-specific color value in a component                   | Error    | Use semantic token       |
| THM-002  | Semantic token does not resolve in both modes              | Error    | Complete the mapping     |
| THM-003  | Custom surface not using a semantic surface token          | Error    | Use `color.surface.*`    |

(The Lint Plugin page adds a **Detached** category, DET-\*, and numbers some typography
rules beyond TYP-005; the exact rule catalog lives with the plugin.)

## SOLAR Lint (Figma plugin)

"ESLint for your Figma files." It scans a page, selection or whole file and flags every
deviation at design time.

- 22+ rules across 7 categories: Tokens, Components, Detached instances, Library
  sources, Icons, Typography, Accessibility.
- Three steps: **Scan** (pick page, selection or all pages; the plugin resolves every
  instance to its library source and evaluates each rule), **Review** (findings grouped
  by severity and category, a coverage bar for how much of the scope is bound to SOLAR,
  a table filterable by rule), **Fix** (click a finding to select the node; re-scan to
  confirm the count drops to zero).
- Component coverage tracking; scan history with diff (new vs resolved); CSV export;
  SOLAR-branded dark UI.
- Severity: Error (must fix), Warning (should fix), Info (recommendation).

| Category      | Checks                                                                                                |
| ------------- | ----------------------------------------------------------------------------------------------------- |
| Tokens        | Hard-coded fills, strokes, spacing, padding, radius; primitive vs semantic misuse; banned token names |
| Components    | Broken links, outdated instances, hard-coded overrides, naming violations                             |
| Detached      | Frames matching DS component names that are not instances                                             |
| Libraries     | Components and variables sourced from non-DS libraries                                                |
| Icons         | Non-standard sizes, non-DS sources, hard-coded icon colors                                            |
| Typography    | Missing text styles, non-DS fonts, off-scale font sizes                                               |
| Accessibility | WCAG AA contrast failures, touch targets below 44 × 44 px                                             |

The same rules run headlessly in the **CI lint agent** (see
[17-implementation-pipeline.md](17-implementation-pipeline.md)).

## Do and don't

| Do                                                           | Don't                                                                |
| ------------------------------------------------------------ | -------------------------------------------------------------------- |
| Submit proposals through the designated channel              | Introduce local tokens without core-team approval                    |
| Include accessibility considerations in every proposal       | Skip the process for "small" changes                                 |
| Follow the library hierarchy                                 | Use hard-coded values in place of tokens                             |
| Namespace exception tokens clearly, time-limited and tracked | Create exception tokens that mimic system token names                |
| Update the Changelog for every release                       | Ship without Figma and code aligned; ignore accessibility validation |

Agents: flag gaps as governance requests (name, category, rationale, use case,
suggested spec); never invent one-off solutions; flag deprecated tokens and recommend
the replacement; urgent requests are high-priority but still go through governance.
