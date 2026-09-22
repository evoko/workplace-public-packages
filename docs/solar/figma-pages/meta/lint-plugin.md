# Lint Plugin

> Verbatim text of the Figma page `Lint Plugin` (id `1086:16826`, section meta), extracted by `raw/fetch-rest.mjs` and rendered by `build-docs.mjs`. Generated file, do not edit; it is review material, not the reference. Content hash `f8b268dcd32d`. Curated chapter: [16-governance-validation.md](../../16-governance-validation.md).

## Slide 1

### SOLAR Lint Figma Plugin

## What Is SOLAR Lint

#### SOLAR Lint is a Figma plugin that automatically validates designs against the SOLAR design system. It scans any page, selection, or entire file and flags every deviation — hardcoded values, wrong libraries, detached components, and more.

Think of it as ESLint for your Figma files. It catches issues at design time, not after handoff — so problems are fixed before they reach code review.

##### Key Features

22+ automated lint rules across 7 categories\
Scan by page, selection, or entire file\
Click any finding to jump to the node in Figma\
Component coverage tracking with visual breakdown\
Scan history with diff — track new vs. resolved issues\
CSV export for sharing with your team

Branded dark-theme UI customized for the SOLAR design system.

## What It Checks

#### The plugin runs 22+ rules across 7 categories, catching everything from hardcoded colors to accessibility violations. Each finding links directly to the offending node.

Rules are organized by category: Tokens, Components, Detached Instances, Library Sources, Icons, Typography, and Accessibility.

##### Rule Categories

Tokens — Hardcoded fills, strokes, spacing, padding, radius; primitive vs. semantic misuse; banned token names\
Components — Broken links, outdated instances, hardcoded overrides, naming violations\
Detached — Frames matching DS component names that aren’t instances\
Libraries — Components and variables sourced from non-DS libraries\
Icons — Non-standard sizes, non-DS sources, hardcoded icon colors\
Typography — Missing text styles, non-DS fonts, off-scale font sizes\
Accessibility — WCAG AA contrast failures, touch targets below 44×44px

Severity levels: Error (must fix), Warning (should fix), Info (recommendation).

_[image: image 2]_

## How It Works

#### You pick a scope (page, selection, or all pages), hit Scan, and the plugin walks every node — resolving component references, running all rules, and classifying every instance. Results appear as summary cards, a coverage bar, and a filterable findings table.

##### 1. Scan

Pick a scope — page, selection, or all pages — and run. The plugin resolves every instance to its library source and evaluates each rule against every node it visits.

##### 2. Review

Findings group by severity and category. Summary cards give the counts, the coverage bar shows how much of the scope is bound to SOLAR, and the table filters by rule.

##### 3. Fix

Click a finding to select the node in Figma. Each row names the rule, what it flags, and the action that clears it. Re-scan to confirm the count drops to zero.

| Rule ID  | What It Flags                                          | Severity | Category      | Example              | Action                 |
| -------- | ------------------------------------------------------ | -------- | ------------- | -------------------- | ---------------------- |
| CLR-001  | Solid fill without a variable binding                  | Error    | Token         | Button with #FF0000  | Bind to semantic token |
| CMP-005  | Instance uses older version of published component     | Warning  | Component     | Old Button variant   | Update to latest       |
| DET-001  | Frame name matches DS component but is not an instance | Error    | Detached      | Frame named "Button" | Swap to DS instance    |
| A11Y-001 | Text contrast below WCAG AA threshold                  | Error    | Accessibility | Gray text on gray bg | Fix contrast ratio     |
| TYP-006  | Text node with no bound text style                     | Warning  | Typography    | Ad-hoc 15px text     | Apply DS text style    |
