# SOLAR documentation and data pipeline

This folder is everything the repository knows about Biamp's SOLAR design system, and the
scripts that keep that knowledge in step with Figma. It exists so that a **SOLAR
design-to-code generator** can be built on top of it. Read this page first; it is the only
place that describes the whole pipeline end to end.

## What exists today, and what does not

| Exists                                                                                          | Does not exist yet                                                                                                                                               |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Human-written Foundations reference (18 chapters + agent quick-reference)                       | The design-to-code generator itself. Nothing in this repository emits React, CSS or TypeScript from SOLAR data yet.                                              |
| Foundations token inventory as JSON, and three files derived from it by a script                | `@bwp-web/styles` content: the `--solar-*` theme that `reference.css` prototypes is not shipped from the package.                                                |
| Verbatim text of every Foundations Figma page, fetched over REST, plus every page-context block | `@bwp-web/components` content: no component is implemented.                                                                                                      |
| SOLAR Web component, pattern and view data extracted from Figma, and docs built from it         | An automated Foundations token export from the SOLAR core team (pipeline stage 2 in [solar/17-implementation-pipeline.md](solar/17-implementation-pipeline.md)). |
| SOLAR Icons: every icon as outline and solid SVG, logos, and a catalog for `@bwp-web/assets`    |                                                                                                                                                                  |

One command, `npm run solar:sync`, refreshes all three Figma files without any model or agent.
When a document here says "a generator", it means the future tool. The scripts that exist
today generate **documentation and machine-readable data**, not code.

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
                    future generator → @bwp-web/styles, @bwp-web/components
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

| Output                                                                                                                     | Produced by                  | Intended reader                                                                  | Shape documented in                                                         |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [solar/tokens/css-contract.json](solar/tokens/css-contract.json)                                                           | `build-derived.mjs`          | Generator: the `--solar-*` name and resolved value of every token, per mode      | [solar/tokens/README.md](solar/tokens/README.md#shape-of-the-derived-files) |
| [solar/tokens/reference.css](solar/tokens/reference.css)                                                                   | `build-derived.mjs`          | Humans, and a prototype of what `@bwp-web/styles` should ship                    | same                                                                        |
| [solar/tokens/grammar.json](solar/tokens/grammar.json)                                                                     | `build-derived.mjs`          | Validators and agents: regexes and banned names for token references             | same                                                                        |
| [solar/figma-pages/\*\*/\*.md](solar/figma-pages/INDEX.md)                                                                 | `solar/build-docs.mjs`       | Humans and agents checking a chapter against what Figma says today               | [solar/raw/README.md](solar/raw/README.md#file-shape)                       |
| [solar/figma-pages/page-context.json](solar/figma-pages/page-context.json)                                                 | `solar/build-docs.mjs`       | Agents: every `@SOLAR:PAGE_CONTEXT` block verbatim, lowest-precedence source     | same                                                                        |
| [solar/review-status.md](solar/review-status.md)                                                                           | `solar/build-docs.mjs`       | Maintainers: which curated chapters are behind their Figma source pages          | its own header                                                              |
| [solar-icons/catalog.json](solar-icons/catalog.json), [INDEX.md](solar-icons/INDEX.md), [issues.md](solar-icons/issues.md) | `solar-icons/build-docs.mjs` | Asset generator: icon names, files, fill token per variant; humans: previews     | [solar-icons/README.md](solar-icons/README.md)                              |
| [solar-web/catalog.json](solar-web/catalog.json)                                                                           | `build-docs.mjs`             | Generator: one record per component with props, axes, tokens, slots, composition | [solar-web/schema.md](solar-web/schema.md)                                  |
| [solar-web/token-usage.json](solar-web/token-usage.json)                                                                   | `build-docs.mjs`             | Impact analysis: which components consume a token                                | same                                                                        |
| [solar-web/INDEX.md](solar-web/INDEX.md), [issues.md](solar-web/issues.md), per-page `.md`                                 | `build-docs.mjs`             | Humans and agents reading about one component                                    | [solar-web/README.md](solar-web/README.md#reading-a-component-page)         |
| `solar/raw/_meta.json`, `solar-web/raw/_meta.json`                                                                         | the fetchers                 | Provenance: file version, date, failed pages, unresolved variable ids            | [solar-web/README.md](solar-web/README.md#keeping-it-in-sync-with-figma)    |

All generated files are committed so that the repository is usable without a Figma token.
Edit the scripts, never the outputs.

## Commands

```bash
npm run solar:sync         # refresh both Figma files and rebuild every generated doc
npm run solar:foundations  # Foundations only: fetch + rebuild docs/solar/figma-pages/
npm run solar:web          # SOLAR Web only: fetch + rebuild docs/solar-web/
npm run solar:icons        # SOLAR Icons only: fetch, export SVG/PNG assets, rebuild docs/solar-icons/
npm run solar:fetch        # fetch all three, build nothing
npm run solar:docs         # rebuild all three from the checked-in raw JSON and assets, no Figma access
npm run solar:tokens       # rebuild css-contract.json, reference.css, grammar.json from figma-variables.json
```

Anything that fetches needs a Figma personal access token with `file_content:read` in
`~/.config/figma/token` or `$FIGMA_TOKEN`; `solar:docs` and `solar:tokens` need nothing. All
of them are deterministic: running them twice on unchanged inputs produces no diff. The
shared REST client, version-keyed cache and manifest helpers live in
[\_shared/figma-rest.mjs](_shared/figma-rest.mjs).

## Checks in CI

[`.github/workflows/solar.yml`](../.github/workflows/solar.yml) runs on every pull request and
on pushes to `main` and the `v*` branches. **Neither job needs a Figma token**, because both
work from data that is committed here.

| Job                                        | What it does                                                                                                                                                       | Fixing a failure                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Generated docs and tokens are up to date   | Reruns `solar:docs` and `solar:tokens` from the committed raw data and fails if any file changes, then checks Prettier formatting of the docs and scripts          | Run those two commands locally and commit the result                             |
| No unreviewed personal data or credentials | [`scripts/check-personal-data.mjs`](../scripts/check-personal-data.mjs) scans every tracked and untracked file for credentials, e-mail addresses and phone numbers | Redact in the extractor, or accept the finding with a written reason (see below) |

Generated files record the **source's** fetch date and Figma file version (`sourceFetchedOn`,
`fileVersion`), never the build date, so rebuilding on a later day produces no diff. Keep it
that way: a builder must be a pure function of `raw/` plus the token captures.

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

| You want to…                          | Read                                                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Write UI as an agent                  | [solar/18-agent-reference.md](solar/18-agent-reference.md), then the component's page under `solar-web/`                                                 |
| Understand a design rule              | The chapter in [solar/README.md](solar/README.md)                                                                                                        |
| See what a Figma page says today      | [solar/figma-pages/INDEX.md](solar/figma-pages/INDEX.md)                                                                                                 |
| Know whether the chapters are current | [solar/review-status.md](solar/review-status.md)                                                                                                         |
| Look up a token's CSS name or value   | `solar/tokens/css-contract.json`, or `reference.css` for the whole theme                                                                                 |
| Validate a token reference            | `solar/tokens/grammar.json`                                                                                                                              |
| Generate icon assets                  | [solar-icons/README.md](solar-icons/README.md#conventions-a-generator-can-rely-on), then `solar-icons/catalog.json`                                      |
| Design the generator                  | [solar-web/schema.md](solar-web/schema.md), then [solar-web/README.md](solar-web/README.md#conventions-a-generator-can-rely-on) and its limits section   |
| Refresh from Figma                    | `npm run solar:sync`; details in [solar/raw/README.md](solar/raw/README.md) and [solar-web/README.md](solar-web/README.md#keeping-it-in-sync-with-figma) |
| Know why two sources disagree         | [solar/source-discrepancies.md](solar/source-discrepancies.md) and [solar-web/issues.md](solar-web/issues.md)                                            |
