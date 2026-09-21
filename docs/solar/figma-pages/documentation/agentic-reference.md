# Agentic Reference

> Verbatim text of the Figma page `Agentic Reference` (id `1251:578`, section documentation, status done), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `c5d73d846622`. Curated chapter: [18-agent-reference.md](../../18-agent-reference.md).

## Slide 1

### Agentic Reference

## Agentic Implementation

#### SOLAR is designed to be consumed by AI agents with the same precision as human designers and engineers — structured documentation, machine-readable specifications, and validation tooling form an integrated agentic layer.

##### Not a Bolt-On

The agentic layer is not an afterthought. Token naming grammars, component specifications, and validation rules are authored with both human and agent consumption in mind from the start.

##### Deterministic Output

Structured references, explicit constraints, and enumerated options reduce ambiguity. An agent consuming SOLAR produces consistent results regardless of prompt variation — the system's rules are the spec, not the conversation.

##### Governed Equally

Agents are subject to the same compliance rules as human implementers. Token naming, accessibility requirements, and theming constraints apply uniformly — no separate standard for generated output.

##### What Agentic Implementation Is Not

Not autonomous design decision-making. Not a replacement for design review. Not permission to invent tokens or bypass governance. Agents execute within the system's boundaries — they do not extend them.

## The Instruction Layer

#### CLAUDE.md is the single instruction file that governs how AI agents operate within SOLAR — it defines token naming rules, banned patterns, separator conventions, and validation requirements in one deterministic reference.

##### Token Naming Grammar

Every token follows a strict grammar with defined segments and allowed values. The grammar is explicit enough that an agent can construct valid token names from rules alone — category, role, modifier, state — without relying on examples or pattern-matching.

##### Separator Conventions

Dot in documentation and code. Slash in Figma. Hyphen with --solar- prefix in CSS custom properties. Context determines the separator — agents must never mix conventions within a single output.

##### Banned Segments

Explicit lists of forbidden token fragments — foreground, background, error, default (for icons) — prevent the most common agent naming errors. Agents check the banned list before emitting any token reference.

##### Phantom Token Protocol

When a referenced token does not exist in the Figma inventory, agents flag it with ⚠️ and log it in the Variable Audit Report rather than silently using it. Gaps are governance issues, not agent decisions.

## Machine-Readable Specifications

#### SOLAR maintains parallel documentation layers — human-readable guidelines for context and decision-making, machine-readable specifications for deterministic agent consumption.

##### component-specs.json

Every component's tokens, ARIA roles, states, and constraints are encoded as structured JSON. Agents parse this directly rather than extracting intent from prose — eliminating interpretation error and enabling deterministic component generation.

##### Token Inventories

Complete Figma variable exports — primitives, light mode, dark mode — are stored as JSON in the repository. Agents cross-reference these to validate that token names resolve to real Figma variables with real values, not stale documentation.

##### Figma Variable Alignment

Live snapshots of Figma variables are tracked alongside the documentation. Discrepancies between documented tokens and actual Figma variables are logged in the Variable Audit Report — agents use this to avoid referencing phantom tokens.

## Skills & Progressive Disclosure

#### SOLAR packages agent capabilities as skills — self-contained instruction sets that teach agents to perform specific tasks such as slide design, component documentation, or design validation.

##### Skill Structure

Each skill has a SKILL.md entry point under 500 lines and a references/ directory for detailed specifications. The entry point defines the workflow and common patterns; reference files provide the granular data an agent needs for execution.

##### Progressive Disclosure

Complex knowledge is layered rather than flattened. An agent creating a slide loads the slide-types reference. An agent documenting a component loads the component-doc reference. No skill forces an agent to consume the entire system upfront.

##### Versioned with the System

Skills live in the repository's skills/ directory, versioned alongside tokens, components, and guidelines. As SOLAR evolves, skills are updated to match — ensuring agent behavior stays aligned with the current system state rather than a stale snapshot.

## Validation & Compliance

#### Agents validate their output against the same compliance rules that govern human implementation — validation rule IDs, automated lint checks, and structured checklists ensure every output meets SOLAR standards.

##### Validation Rule IDs

Every rule has a standard ID — CLR-001 through CLR-006 for color, SPC-001 through SPC-004 for spacing, A11Y-001 through A11Y-008 for accessibility, and so on across ten categories. Agents reference these IDs in code comments, lint configurations, and compliance reports.

##### Automated Lint

The solar-lint-plugin validates Figma designs against SOLAR rules in real time. The solar-lint-agent runs the same checks headlessly in CI pipelines — agent-generated output is validated by the same tooling that validates human work.

##### Pre-Submission Checklist

Twenty-two items covering tokens, accessibility, responsive behavior, theming, and naming conventions. Agents treat this checklist as a mandatory gate before any output is submitted — items that fail are resolved, not skipped.

## The Agent Consumption Path

#### An agent working within SOLAR follows a defined consumption path — read the instruction layer, load relevant specifications, apply tokens and patterns, then validate output against compliance rules.

##### 01 Read CLAUDE.md

Learn token naming rules, banned segments, separator conventions, and validation requirements. This is the agent's operating manual — every rule is hard, not advisory.

##### 04 Generate Output

Apply semantic tokens, named text styles, spatial values, and accessibility requirements. Every visual property must trace to a named token — no raw values.

##### 02 Load Component Specs

Get structured token mappings, ARIA requirements, and interaction states for the target component. Parse JSON directly — never extract intent from prose.

##### 05 Validate

Run the 22-item checklist, cross-reference the token inventory, flag any phantom or unresolved tokens. Validation is not optional — it is the final step before submission.

##### 03 Load Skill

If the task has a packaged skill, read SKILL.md and relevant reference files for task-specific workflow and data. Skills scope what the agent needs to know.

##### 06 Submit

Output meets SOLAR compliance standards and is ready for review. Compliance is binary — partial compliance is non-compliance.

## Quick-Start Rules

#### Ten rules for valid SOLAR output. Follow these before anything else.

Every visual property must trace to a token. Every interactive element must meet accessibility baselines. If a property isn't covered by a token, flag it as a gap — never use raw values.

1.  Every color → semantic token (color.\*) — never hex, never primitive\
2.  Every spacing → spatial token (inset._, stack._) — never raw px/rem\
3.  Every text → named text style (type.body.md.\*) — never raw font props\
4.  Every shadow → effect token (shadow.\*) — never raw box-shadow\
5.  Every duration → motion token (motion.duration.\*) — never raw ms

6.  Every easing → motion token (motion.easing.\*) — never raw cubic-bezier\
7.  Every border-radius → spatial.border-radius.\* — never raw px\
8.  Every z-index → defined level (0/100/200/300/400/500/600) — never arbitrary\
9.  Every interactive element → minimum 44×44px touch target\
10. Every interactive element → visible focus ring on :focus-visible

## Do / Don't / Agent Tips

#### Quick-reference Do's, Don'ts, and tips for AI agents.

Follow the Do column as default behavior. The Don't column lists the most common agent mistakes. Tips provide practical shortcuts for correct output.

##### Do

Use semantic tokens for every visual property — color, spacing, type, shadow, radius, elevation.

Include the feedback segment for all status colors: color.text.feedback.danger, color.icon.feedback.success.

Use action token properties (bg, text, icon, border) — never foreground or background.

Reference named text styles — never set raw font-size, font-weight, or line-height.

Run the validation checklist before every handoff.

Ensure 44×44px minimum touch targets on all interactive elements.

Provide visible focus rings on every focusable element.

##### Don’t

Use hex values, primitives, or hardcoded px/rem — always use semantic tokens.

Skip the feedback segment: color.text.danger is banned — use color.text.feedback.danger.

Use foreground or background — use text/icon and bg/surface respectively.

Mix separator styles: Figma uses slash, docs use dot, CSS uses hyphen.

Use arbitrary z-index values — only the seven defined levels (0–600).

Silently use phantom tokens like color.surface.secondary — flag them with ⚠️.

Invent tokens that don't exist in the inventory — flag gaps for governance.

##### Agent Tips

Use this page as first-pass lookup. Cross-reference the full Guidelines spec for edge cases.

Check the Banned Segments list first when in doubt — it catches 90% of naming errors.

Typography scale shows Desktop values — Mobile values differ. Check both modes.

Shadow tokens in CSS are composites; Figma stores shadow color variables separately.

Run the validation checklist as a pre-submission gate before every output.

If a token doesn't exist and you need it, flag it as a governance gap — never fabricate a name.

## @SOLAR:PAGE_CONTEXT

The machine-readable context block the SOLAR team placed on this page, verbatim.

```text
@SOLAR:PAGE_CONTEXT
page: Agentic Reference
domain: AI Agent Toolkit > Quick-Reference Specification
version: 1.0
updated: 2026-03-27

[ROLE]
You are the SOLAR agentic implementation specialist. This page is the minimum viable knowledge an AI agent needs to generate a valid SOLAR interface. Every token name, spacing value, and component rule on this page is the canonical quick-reference — use it as the first lookup before consulting the full Guidelines spec.

[SCOPE]
- Ten foundational rules for valid SOLAR output
- Complete semantic color token grammar and patterns
- Spatial token system: inset, stack, gap, border-radius
- Shadow and elevation token inventory
- Z-index level system
- Component-to-HTML mapping with key tokens and touch targets
- Responsive breakpoint grid definitions
- Typography scale with font families and weights
- CSS custom property naming convention
- Pre-review validation checklist

[TOKEN_RULES]
rule_01: every color → semantic token (color.*) — never hex, never primitive
rule_02: every spacing → spatial token (inset.*, stack.*, gap.*) — never raw px/rem
rule_03: every text → named text style (Display/L, Body/M/Regular, etc.) — never raw font props
rule_04: every shadow → effect token (shadow.*) — never raw box-shadow
rule_05: every duration → motion token (motion.duration.*) — never raw ms
rule_06: every easing → motion token (motion.easing.*) — never raw cubic-bezier
rule_07: every border-radius → spatial.border-radius.* — never raw px
rule_08: every z-index → defined level (0/100/200/300/400/500/600) — never arbitrary
rule_09: every interactive element → minimum 44x44px touch target
rule_10: every interactive element → visible focus ring on :focus-visible

[COLOR_TOKEN_GRAMMAR]
surface: color.surface.{variant} → base, raised, overlay, modal, background, muted, scrim, hover, active, inverse, feedback.*
text: color.text.{variant} → primary, secondary, tertiary, disabled, inverse, feedback.{type}, link.{state}
border: color.border.{variant} → default, subtle, strong, disabled, inverse, feedback.{type}.{subtle|strong}
icon: color.icon.{variant} → primary, secondary, tertiary, disabled, inverse, feedback.{type}
action: color.action.{intent}.{property}.{state}
data: color.data.{type}.{id} → category.01-08, scale.01-08, delta.positive|negative|neutral

[BANNED_SEGMENTS]
foreground → use text or icon
background → use bg (action) or surface
color.icon.default → color.icon.primary
color.text.danger → color.text.feedback.danger
color.border.error → color.border.feedback.danger.strong
color.border.focus → color.border.feedback.focus.strong
color.icon.success → color.icon.feedback.success
color.surface.danger → color.surface.feedback.danger
shadow.subtle → shadow.raised
shadow.elevated → shadow.overlay

[SPATIAL_SYSTEM]
inset: none=0 | 2xs=2 | xs=4 | sm=8 | md=16 | lg=24 | xl=32
stack: none=0 | 2xs=2 | xs=4 | sm=8 | md=16 | lg=24 | xl=32 | 2xl=48
icon.size: xs=16 | sm=20 | md=24 | lg=32 | xl=40
border-radius: none=0 | sm=4 | md=6 | lg=8 | xl=12 | full=9999

[SHADOW_TOKENS]
shadow.control: inputs, small controls
shadow.raised: cards, raised surfaces
shadow.overlay: dropdowns, menus, popovers
shadow.modal: dialogs, modals, drawers
shadow.focus.default: focus ring (blue)
shadow.focus.danger: focus ring (red/error)

[Z_INDEX_SYSTEM]
base=0 | sticky=100 | dropdown=200 | overlay=300 | modal=400 | toast=500 | tooltip=600

[COMPONENT_MAP]
Button: <button> → color.action.{hierarchy}.*, border-radius.md → 44x36(sm), 44x44(md/lg)
TextInput: <input>+<label> → color.surface.base, color.border.* → 44x40px
SelectDropdown: <div>(custom) → color.surface.raised, shadow.overlay → 44x40px
Checkbox: <input type="checkbox"> → color.action.primary.bg.default → 44x20px
Radio: <input type="radio"> → color.action.primary.bg.default → 44x20px
Switch: <button role="switch"> → color.action.primary.bg.default → 44x24px
Dialog: <div role="dialog"> → shadow.modal, z-index:400
Drawer: <aside>|<div> → shadow.modal, z-index:300
Card: <div> → color.surface.raised, shadow.raised
Table: <table> → color.surface.secondary (phantom) → 44x36px(row)
Tabs: <div role="tablist"> → color.action.primary.bg.default → 44x40px
Accordion: heading+<button> → color.surface.base, color.border.subtle → 44x48px
Tooltip: <div role="tooltip"> → color.surface.inverse, z-index:600
Menu: <div role="menu"> → shadow.overlay, z-index:200 → 44x36px

[BREAKPOINTS]
XS: 393px, 4col, 16px margin/gutter
SM: 768px, 4col, 16px margin/gutter
MD: 1024px, 8col, 20px margin/gutter
LG: 1440px, 12col, 24px margin/gutter
XL: 1920px, 12col, 24px margin/gutter

[TYPOGRAPHY_SCALE]
Display: Gotham Medium 500 → L:56/72, M:40/52, S:32/40
Title: Inter Medium 500 → L:44/56, M:32/40, S:20/28, XS:16/24
Body: Inter Regular 400 → M:16/24, S:14/20, XS:12/16
Label: Inter Medium 500 → M:14/20, S:12/16
Helper: Inter Regular 400 → M:14/16, S:12/16
Code: IBM Plex Mono Medium 500 → M:16/24, S:14/20
rule: 32 variables x 2 modes (Desktop/Mobile) — size + line-height only

[CSS_CONVENTION]
prefix: --solar-
separator: hyphen
casing: lowercase
pattern: --solar-{category}-{path-joined-by-hyphens}
contexts: Figma=slash, docs=dot, CSS=hyphen — never mix

[AGENT_BEHAVIOR]
- Use this page as first-pass lookup for token names, spatial values, and component rules
- Cross-reference full Guidelines spec (v1.0) for detailed rationale and edge cases
- Validate every visual property against the ten foundational rules before output
- Flag any token name not matching the grammar as a potential error
- If a needed token does not exist, flag as gap — never invent tokens
- Use the validation checklist as pre-submission gate for all generated interfaces

[CONSTRAINTS]
- this page is a quick-reference — does not replace the full spec
- all token names use dot (.) separators per documentation convention
- never mix separator styles within a single context
- color.surface.secondary is a known phantom token — flag it, do not silently use
- typography scale shows Desktop values — Mobile values differ (see full spec)
- shadow tokens listed here are CSS composites, not Figma color variables
@END:PAGE_CONTEXT
```
