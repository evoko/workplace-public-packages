# SOLAR documentation and data pipeline

This folder is everything the repository knows about Biamp's SOLAR design system, and the
scripts that keep that knowledge in step with Figma, plus the generator that turns it into
code. Read this page for the data: every input, output and sync command. How the whole pipeline
works: [architecture.md](engineering/architecture.md).

## What is here

- **The Foundations reference**: 17 curated chapters and an agent quick-reference (chapter 18) in
  [solar/](solar/README.md), the token inventory as JSON and three files derived from it, and the
  verbatim text of every Foundations Figma page.
- **SOLAR Web**: component, pattern and view data extracted from Figma, and docs built from it,
  in [solar-web/](solar-web/README.md).
- **SOLAR Icons**: every icon as outline and solid SVG, the logos, and a catalog, in
  [solar-icons/](solar-icons/README.md).
- **The engineering guides** (hand-written): [architecture](engineering/architecture.md),
  [decisions](engineering/decisions.md), [workflows](engineering/workflows.md) and
  [open work](engineering/open-work.md).
- **The design review** for the SOLAR designers: [solar-review-for-design.md](solar-review-for-design.md).

From this data `npm run solar:codegen` generates the code; see
[From docs to code](#from-docs-to-code).

One command, `npm run solar:sync`, refreshes all three Figma files without any model or agent.
The scripts under `docs/` generate **documentation and machine-readable data**; `solar:codegen`
generates **code** from that data. `solar:sync` and `solar:rebuild` run them one after the
other; neither ever writes to the other's outputs.

## The pipeline in one picture

```
Figma: SOLAR Foundations (Y21OGpk2z6ig9cRMc5cl9L)                  Figma: SOLAR Web (OGvmMNnywH7JWDyEhOzjcc)
   │ Plugin API capture       │ REST ── solar/raw/fetch-rest.mjs        │ REST ── solar-web/raw/fetch-rest.mjs
   │ (manual, deliberate)     ▼                                         ▼
   ▼                     solar/raw/<section>/<slug>.json (33)      solar-web/raw/<section>/<slug>.json (174)
solar/tokens/                 │ solar/build-docs.mjs                    │ solar-web/build-docs.mjs
figma-variables.json          ▼                                         ▼
 ◄── SOURCE OF TRUTH     solar/figma-pages/<section>/<slug>.md      catalog.json  token-usage.json  INDEX.md
   │ build-derived.mjs    INDEX.md  page-context.json                 issues.md  <section>/<slug>.md
   ▼ (solar:tokens)           │ human review                            │
css-contract.json             ▼                                         │
reference.css            solar/01-…18-*.md (curated chapters)           │
grammar.json                  │                                         │
   └──────────────────────────┴─────────────────────────────────────────┘
                                          ▼
        npm run solar:codegen → spec/ and every code target (see engineering/architecture.md)
```

`npm run solar:sync` runs the REST columns end to end (`solar:foundations`, `solar:web`, then
`solar:icons`, a third column of the same shape: `docs/solar-icons/raw/` plus the exported
`svg/` and `logos/` assets, rendered into `INDEX.md`, `catalog.json` and `issues.md`). The
token JSON on the left is refreshed deliberately, never by the sync.

## Inputs

| Input                                                                                                                                 | Origin                                                                                                                                             | How it changes                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [solar/tokens/figma-variables.json](solar/tokens/figma-variables.json)                                                                | Verbatim capture of every Foundations variable, text style and effect style, 2026-09-20; verified identical to Biamp's original file on 2026-09-21 | Manually, with [solar/tokens/capture-variables.js](solar/tokens/capture-variables.js) and `compare-capture.mjs` (see [solar/tokens/README.md](solar/tokens/README.md#regenerating)). Never by `solar:sync`.                                                               |
| [solar-web/tokens/layout-variables.json](solar-web/tokens/layout-variables.json)                                                      | Capture of SOLAR Web's own `Layout` variable collection (grid columns, margins, gutters, breakpoints), 2026-09-21                                  | Manually, with the same Plugin API route as the Foundations capture. Folded into `css-contract.json` by `solar:tokens`.                                                                                                                                                   |
| [solar/raw/\*\*/\*.json](solar/raw/README.md)                                                                                         | Per-page REST extraction of Biamp's original Foundations file: text in reading order, tables, swatches, page-context blocks                        | `npm run solar:foundations` (or `solar:sync`). Re-fetched only when Figma reports a new file version.                                                                                                                                                                     |
| [solar-web/raw/\*\*/\*.json](solar-web/raw/README.md)                                                                                 | Per-page REST extraction of the live SOLAR Web file                                                                                                | `npm run solar:web` (or `solar:sync`). Re-fetched only when Figma reports a new file version.                                                                                                                                                                             |
| [solar-icons/raw/\*\*/\*.json](solar-icons/README.md), [solar-icons/svg/](solar-icons/svg/), [solar-icons/logos/](solar-icons/logos/) | Per-page REST extraction of the SOLAR Icons file plus the SVG/PNG export of every icon variant and logo                                            | `npm run solar:icons` (or `solar:sync`). Re-exported only when Figma reports a new file version.                                                                                                                                                                          |
| `solar/raw/_pages.json`, `solar-web/raw/_pages.json`                                                                                  | Page manifests: section, slug, Figma page id, status                                                                                               | Synced automatically by the fetchers (new pages added, vanished pages flagged, never deleted).                                                                                                                                                                            |
| [solar-web/raw/\_variables.json](solar-web/raw/_variables.json)                                                                       | Figma variable id → `Collection:name` map used to name bindings                                                                                    | Manually when Figma introduces a new variable (the Web fetcher exits 2 and lists the id).                                                                                                                                                                                 |
| The prose chapters in [solar/](solar/README.md)                                                                                       | Written from the Foundations Figma pages and reconciled against the token JSON; front matter names the source pages and their content hashes       | Manually, when [solar/review-status.md](solar/review-status.md) flags a chapter as behind; then `node docs/solar/build-docs.mjs --mark-reviewed <file>`. When prose and JSON disagree, the JSON wins; see [solar/source-discrepancies.md](solar/source-discrepancies.md). |

## Outputs, and who reads them

| Output                                                                                                                     | Produced by                  | Intended reader                                                                             | Shape documented in                                                         |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [solar/tokens/css-contract.json](solar/tokens/css-contract.json)                                                           | `build-derived.mjs`          | Generator: the `--solar-*` name and resolved value of every token, per mode                 | [solar/tokens/README.md](solar/tokens/README.md#shape-of-the-derived-files) |
| [solar/tokens/reference.css](solar/tokens/reference.css)                                                                   | `build-derived.mjs`          | Humans, and a prototype of what `@bwp-web/styles` should ship                               | same                                                                        |
| [solar/tokens/grammar.json](solar/tokens/grammar.json)                                                                     | `build-derived.mjs`          | Validators and agents: regexes and banned names for token references                        | same                                                                        |
| [solar/figma-pages/\*\*/\*.md](solar/figma-pages/INDEX.md)                                                                 | `solar/build-docs.mjs`       | Humans and agents checking a chapter against what Figma says today                          | [solar/raw/README.md](solar/raw/README.md#file-shape)                       |
| [solar/figma-pages/page-context.json](solar/figma-pages/page-context.json)                                                 | `solar/build-docs.mjs`       | Agents: every `@SOLAR:PAGE_CONTEXT` block verbatim, lowest-precedence source                | same                                                                        |
| [solar/review-status.md](solar/review-status.md)                                                                           | `solar/build-docs.mjs`       | Maintainers: which curated chapters are behind their Figma source pages                     | its own header                                                              |
| [solar-icons/catalog.json](solar-icons/catalog.json), [INDEX.md](solar-icons/INDEX.md), [issues.md](solar-icons/issues.md) | `solar-icons/build-docs.mjs` | Asset generator: icon names, files, fill token per variant; humans: previews                | [solar-icons/README.md](solar-icons/README.md)                              |
| [solar-web/catalog.json](solar-web/catalog.json)                                                                           | `build-docs.mjs`             | Generator: one record per component with props, axes, tokens, slots, composition            | [solar-web/schema.md](solar-web/schema.md)                                  |
| [solar-web/token-usage.json](solar-web/token-usage.json)                                                                   | `build-docs.mjs`             | Impact analysis: which components consume a token                                           | same                                                                        |
| [solar-web/INDEX.md](solar-web/INDEX.md), [issues.md](solar-web/issues.md), per-page `.md`                                 | `build-docs.mjs`             | Humans and agents reading about one component                                               | [solar-web/README.md](solar-web/README.md#reading-a-component-page)         |
| `solar/raw/_meta.json`, `solar-web/raw/_meta.json`                                                                         | the fetchers                 | Provenance: file version, date, failed pages, unresolved variable ids                       | [solar-web/README.md](solar-web/README.md#keeping-it-in-sync-with-figma)    |
| [`spec/tokens.json`](../spec/tokens.json)                                                                                  | `solar:codegen`              | The DTCG contract the four token targets are generated from: 714 tokens with their modes    | [packages/codegen/README.md](../packages/codegen/README.md)                 |
| [`spec/icons.json`](../spec/icons.json)                                                                                    | `solar:codegen`              | The drawing contract the three icon targets are generated from: 340 icon sets, 3 logo sets  | same                                                                        |
| `packages/styles/src/generated/`, `packages/solar_flutter/lib/src/generated/tokens.dart`                                   | `solar:codegen`              | Apps: the tokens as CSS, an MUI theme, a Tailwind 4 stylesheet and Dart constants           | [packages/styles/README.md](../packages/styles/README.md)                   |
| `packages/assets/src/generated/`, `packages/solar_flutter/lib/src/generated/icons.dart`                                    | `solar:codegen`              | Apps: 340 React icon components, 685 standalone SVG files and the Dart vectors              | [packages/assets/README.md](../packages/assets/README.md)                   |
| [`spec/components/`](../spec/components/)                                                                                  | `solar:codegen`              | The component contract: API, platform states, slots and style recipe in token names         | [packages/codegen/README.md](../packages/codegen/README.md#components)      |
| [`spec/verify/`](../spec/verify/)                                                                                          | `solar:codegen`              | The oracle: what Figma draws for every variant, the visual checks' expectations             | [packages/codegen/README.md](../packages/codegen/README.md#components)      |
| [`spec/overlay/`](../spec/overlay/)                                                                                        | hand-written, reviewed       | The decisions about one component: base, renames, axis interactions, allowed literals       | [spec/overlay/README.md](../spec/overlay/README.md)                         |
| `packages/styles/src/generated/mui/components/`, `packages/solar_flutter/lib/src/generated/components/`                    | `solar:codegen`              | Apps: each component's recipe, for MUI's `sx`, and Flutter's token names and state resolver | [packages/components/README.md](../packages/components/README.md)           |
| [`spec/deviations.md`](../spec/deviations.md)                                                                              | `solar:codegen`              | SOLAR governance: every place code and Figma differ, decided or open                        | its own header                                                              |

All generated files are committed so that the repository is usable without a Figma token.
Edit the scripts, never the outputs.

## Commands

```bash
npm run solar:sync         # everything: fetch all three Figma files, rebuild every generated doc,
                           #   the derived token files and the generated code
npm run solar:rebuild      # the same without the fetch, so no Figma token is needed
npm run solar:foundations  # Foundations only: fetch + rebuild docs/solar/figma-pages/
npm run solar:web          # SOLAR Web only: fetch + rebuild docs/solar-web/
npm run solar:icons        # SOLAR Icons only: fetch, export SVG/PNG assets, rebuild docs/solar-icons/
npm run solar:fetch        # fetch all three, build nothing
npm run solar:docs         # rebuild all three from the checked-in raw JSON and assets, no Figma access
npm run solar:tokens       # rebuild css-contract.json, reference.css, grammar.json from figma-variables.json
```

The code commands, among them `solar:codegen` (rebuild `spec/` and every code target, no Figma
access) and `solar:triage`, are in
[engineering/workflows.md, Everyday commands](engineering/workflows.md#everyday-commands).

Anything that fetches needs a Figma personal access token with `file_content:read` in
`~/.config/figma/token` or `$FIGMA_TOKEN`; `solar:rebuild`, `solar:docs`, `solar:tokens` and
`solar:codegen` need nothing. All of them are deterministic: running them twice on unchanged
inputs produces no diff.

`solar:sync` runs every step even after one of them reports a problem, and lists the failures at
the end. That is deliberate. A fetcher that cannot name a variable has still written its pages, so
stopping there would leave `raw/` ahead of the generated docs — a state CI rejects — and would
skip the files that had not been fetched yet. Only a page that genuinely failed to fetch is an
error; an unresolved variable id is a finding, recorded in `raw/_meta.json` and named in the
output so it can be added to `_variables.json`. The
shared REST client, version-keyed cache and manifest helpers live in
[\_shared/figma-rest.mjs](_shared/figma-rest.mjs).

## From docs to code

`npm run solar:codegen` reads this folder and never writes to it: it builds the token, icon and
component contracts in `spec/`, then every code target from them, and writes each component's
Figma oracle. How, and why: [engineering/architecture.md](engineering/architecture.md); where a
change goes: [engineering/workflows.md](engineering/workflows.md#decide-where-a-change-goes); the
generator's internals: [packages/codegen/README.md](../packages/codegen/README.md).

## Checks in CI

[`.github/workflows/solar.yml`](../.github/workflows/solar.yml) runs on every pull request and on
pushes to `main` and the `v<number>` branches; no job needs a Figma token, because all of them work
from data committed here. Each job, and how to fix it when it fails:
[engineering/architecture.md, CI and deployment](engineering/architecture.md#ci-and-deployment).

### Personal data in a public repository

Occurrences that have been reviewed and knowingly kept are listed with a reason in
[`scripts/personal-data-baseline.json`](../scripts/personal-data-baseline.json); anything else
fails the check. When a sync pulls new placeholder text out of Figma, prefer redacting it in the
extractor: the Foundations fetcher already drops table columns named Contributors, Authors,
Owners, Contacts or E-mail, and a whole page can be skipped with `"exclude": true` in its
`_pages.json` entry. Otherwise run

```bash
node scripts/check-personal-data.mjs --list     # show accepted findings too
node scripts/check-personal-data.mjs --accept   # add current findings, then write each reason
```

Credentials, including Figma personal access tokens, are never accepted and always fail.
Personal **names** cannot be detected reliably and are not scanned, so review the diff by hand
when Figma content changes.

## Where to start

| You want to…                                                   | Read                                                                                                                                                                     |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Write UI as an agent                                           | [solar/18-agent-reference.md](solar/18-agent-reference.md), then the component's page under `solar-web/`                                                                 |
| Understand a design rule                                       | The chapter in [solar/README.md](solar/README.md)                                                                                                                        |
| See what a Figma page says today                               | [solar/figma-pages/INDEX.md](solar/figma-pages/INDEX.md)                                                                                                                 |
| Know whether the chapters are current                          | [solar/review-status.md](solar/review-status.md)                                                                                                                         |
| Look up a token's CSS name or value                            | `solar/tokens/css-contract.json`, or `reference.css` for the whole theme                                                                                                 |
| Validate a token reference                                     | `solar/tokens/grammar.json`                                                                                                                                              |
| Generate icon assets                                           | [solar-icons/README.md](solar-icons/README.md#conventions-a-generator-can-rely-on), then `solar-icons/catalog.json`                                                      |
| Use the tokens in code                                         | [packages/styles/README.md](../packages/styles/README.md) for MUI, CSS and Tailwind; [packages/solar_flutter/README.md](../packages/solar_flutter/README.md) for Flutter |
| Use an icon or a logo in code                                  | [packages/assets/README.md](../packages/assets/README.md) for React and raw SVG; [packages/solar_flutter/README.md](../packages/solar_flutter/README.md) for Flutter     |
| Change what the generator emits                                | [packages/codegen/README.md](../packages/codegen/README.md)                                                                                                              |
| Understand how the system works                                | [engineering/architecture.md](engineering/architecture.md)                                                                                                               |
| Know why something is the way it is                            | [engineering/decisions.md](engineering/decisions.md)                                                                                                                     |
| Do a task (set up, verify, add a component, fix a check, sync) | [engineering/workflows.md](engineering/workflows.md)                                                                                                                     |
| Pick up unfinished work                                        | [engineering/open-work.md](engineering/open-work.md), and `npm run solar:triage` for what each component needs                                                           |
| Use the components                                             | [packages/components/README.md](../packages/components/README.md) for React; [packages/solar_flutter/README.md](../packages/solar_flutter/README.md) for Flutter         |
| Know why the code differs from Figma                           | [`spec/deviations.md`](../spec/deviations.md)                                                                                                                            |
| Know what the Figma data looks like                            | [solar-web/schema.md](solar-web/schema.md), then [solar-web/README.md](solar-web/README.md#conventions-a-generator-can-rely-on) and its limits section                   |
| Refresh from Figma                                             | `npm run solar:sync`; details in [solar/raw/README.md](solar/raw/README.md) and [solar-web/README.md](solar-web/README.md#keeping-it-in-sync-with-figma)                 |
| Know why two sources disagree                                  | [solar/source-discrepancies.md](solar/source-discrepancies.md) and [solar-web/issues.md](solar-web/issues.md)                                                            |
