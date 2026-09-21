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
| One command, `npm run solar:sync`, that refreshes both Figma files without any model or agent   |                                                                                                                                                                  |

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

`npm run solar:sync` runs both REST columns end to end (`solar:foundations`, then
`solar:web`). The token JSON on the left is refreshed deliberately, never by the sync.

## Inputs

| Input                                                                  | Origin                                                                                                                                       | How it changes                                                                                                                                                                                                                                                            |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [solar/tokens/figma-variables.json](solar/tokens/figma-variables.json) | Verbatim capture of every Foundations variable, text style and effect style, 2026-09-20                                                      | Manually, by re-running the Plugin API capture described in [solar/tokens/README.md](solar/tokens/README.md#regenerating). Never by `solar:sync`.                                                                                                                         |
| [solar/raw/\*\*/\*.json](solar/raw/README.md)                          | Per-page REST extraction of Biamp's original Foundations file: text in reading order, tables, swatches, page-context blocks                  | `npm run solar:foundations` (or `solar:sync`). Re-fetched only when Figma reports a new file version.                                                                                                                                                                     |
| [solar-web/raw/\*\*/\*.json](solar-web/raw/README.md)                  | Per-page REST extraction of the live SOLAR Web file                                                                                          | `npm run solar:web` (or `solar:sync`). Re-fetched only when Figma reports a new file version.                                                                                                                                                                             |
| `solar/raw/_pages.json`, `solar-web/raw/_pages.json`                   | Page manifests: section, slug, Figma page id, status                                                                                         | Synced automatically by the fetchers (new pages added, vanished pages flagged, never deleted).                                                                                                                                                                            |
| [solar-web/raw/\_variables.json](solar-web/raw/_variables.json)        | Figma variable id → `Collection:name` map used to name bindings                                                                              | Manually when Figma introduces a new variable (the Web fetcher exits 2 and lists the id).                                                                                                                                                                                 |
| The prose chapters in [solar/](solar/README.md)                        | Written from the Foundations Figma pages and reconciled against the token JSON; front matter names the source pages and their content hashes | Manually, when [solar/review-status.md](solar/review-status.md) flags a chapter as behind; then `node docs/solar/build-docs.mjs --mark-reviewed <file>`. When prose and JSON disagree, the JSON wins; see [solar/source-discrepancies.md](solar/source-discrepancies.md). |

## Outputs, and who reads them

| Output                                                                                     | Produced by            | Intended reader                                                                  | Shape documented in                                                         |
| ------------------------------------------------------------------------------------------ | ---------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| [solar/tokens/css-contract.json](solar/tokens/css-contract.json)                           | `build-derived.mjs`    | Generator: the `--solar-*` name and resolved value of every token, per mode      | [solar/tokens/README.md](solar/tokens/README.md#shape-of-the-derived-files) |
| [solar/tokens/reference.css](solar/tokens/reference.css)                                   | `build-derived.mjs`    | Humans, and a prototype of what `@bwp-web/styles` should ship                    | same                                                                        |
| [solar/tokens/grammar.json](solar/tokens/grammar.json)                                     | `build-derived.mjs`    | Validators and agents: regexes and banned names for token references             | same                                                                        |
| [solar/figma-pages/\*\*/\*.md](solar/figma-pages/INDEX.md)                                 | `solar/build-docs.mjs` | Humans and agents checking a chapter against what Figma says today               | [solar/raw/README.md](solar/raw/README.md#file-shape)                       |
| [solar/figma-pages/page-context.json](solar/figma-pages/page-context.json)                 | `solar/build-docs.mjs` | Agents: every `@SOLAR:PAGE_CONTEXT` block verbatim, lowest-precedence source     | same                                                                        |
| [solar/review-status.md](solar/review-status.md)                                           | `solar/build-docs.mjs` | Maintainers: which curated chapters are behind their Figma source pages          | its own header                                                              |
| [solar-web/catalog.json](solar-web/catalog.json)                                           | `build-docs.mjs`       | Generator: one record per component with props, axes, tokens, slots, composition | [solar-web/schema.md](solar-web/schema.md)                                  |
| [solar-web/token-usage.json](solar-web/token-usage.json)                                   | `build-docs.mjs`       | Impact analysis: which components consume a token                                | same                                                                        |
| [solar-web/INDEX.md](solar-web/INDEX.md), [issues.md](solar-web/issues.md), per-page `.md` | `build-docs.mjs`       | Humans and agents reading about one component                                    | [solar-web/README.md](solar-web/README.md#reading-a-component-page)         |
| `solar/raw/_meta.json`, `solar-web/raw/_meta.json`                                         | the fetchers           | Provenance: file version, date, failed pages, unresolved variable ids            | [solar-web/README.md](solar-web/README.md#keeping-it-in-sync-with-figma)    |

All generated files are committed so that the repository is usable without a Figma token.
Edit the scripts, never the outputs.

## Commands

```bash
npm run solar:sync         # refresh both Figma files and rebuild every generated doc
npm run solar:foundations  # Foundations only: fetch + rebuild docs/solar/figma-pages/
npm run solar:web          # SOLAR Web only: fetch + rebuild docs/solar-web/
npm run solar:fetch        # fetch both, build nothing
npm run solar:docs         # rebuild both from the checked-in raw JSON, no Figma access
npm run solar:tokens       # rebuild css-contract.json, reference.css, grammar.json from figma-variables.json
```

Anything that fetches needs a Figma personal access token with `file_content:read` in
`~/.config/figma/token` or `$FIGMA_TOKEN`; `solar:docs` and `solar:tokens` need nothing. All
of them are deterministic: running them twice on unchanged inputs produces no diff. The
shared REST client, version-keyed cache and manifest helpers live in
[\_shared/figma-rest.mjs](_shared/figma-rest.mjs).

## Where to start

| You want to…                          | Read                                                                                                                                                     |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Write UI as an agent                  | [solar/18-agent-reference.md](solar/18-agent-reference.md), then the component's page under `solar-web/`                                                 |
| Understand a design rule              | The chapter in [solar/README.md](solar/README.md)                                                                                                        |
| See what a Figma page says today      | [solar/figma-pages/INDEX.md](solar/figma-pages/INDEX.md)                                                                                                 |
| Know whether the chapters are current | [solar/review-status.md](solar/review-status.md)                                                                                                         |
| Look up a token's CSS name or value   | `solar/tokens/css-contract.json`, or `reference.css` for the whole theme                                                                                 |
| Validate a token reference            | `solar/tokens/grammar.json`                                                                                                                              |
| Design the generator                  | [solar-web/schema.md](solar-web/schema.md), then [solar-web/README.md](solar-web/README.md#conventions-a-generator-can-rely-on) and its limits section   |
| Refresh from Figma                    | `npm run solar:sync`; details in [solar/raw/README.md](solar/raw/README.md) and [solar-web/README.md](solar-web/README.md#keeping-it-in-sync-with-figma) |
| Know why two sources disagree         | [solar/source-discrepancies.md](solar/source-discrepancies.md) and [solar-web/issues.md](solar-web/issues.md)                                            |
