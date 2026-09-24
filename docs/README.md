# SOLAR documentation and data pipeline

This folder is everything the repository knows about Biamp's SOLAR design system, and the
scripts that keep that knowledge in step with Figma, plus the generator that turns it into
code. Read this page first; it is the only place that describes the whole pipeline end to end.

## What exists today, and what does not

| Exists                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Does not exist yet                                                                                                                                                                                                                                                            |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Human-written Foundations reference (18 chapters + agent quick-reference)                                                                                                                                                                                                                                                                                                                                                                                                      | Every component but Button, Icon Button, Button Group, Spinner and StatusIndicator. The other 127 in SOLAR Web's components section are milestone 4, [family by family](superpowers/plans/2026-09-24-solar-library-families.md); `npm run solar:triage` says what each needs. |
| Foundations token inventory as JSON, and three files derived from it by a script                                                                                                                                                                                                                                                                                                                                                                                               | The rest of the developer tweak loop: `solar:explain` and the tweak panel (edit a value in the viewer, save an overlay rule) are designed in [the docs-to-code spec](superpowers/specs/2026-09-21-solar-docs-to-code-design.md) and not built (3c).                           |
| Verbatim text of every Foundations Figma page, fetched over REST, plus every page-context block                                                                                                                                                                                                                                                                                                                                                                                | An automated Foundations token export from the SOLAR core team (pipeline stage 2 in [solar/17-implementation-pipeline.md](solar/17-implementation-pipeline.md)).                                                                                                              |
| SOLAR Web component, pattern and view data extracted from Figma, and docs built from it                                                                                                                                                                                                                                                                                                                                                                                        |                                                                                                                                                                                                                                                                               |
| SOLAR Icons: every icon as outline and solid SVG, logos, and a catalog for `@bwp-web/assets`                                                                                                                                                                                                                                                                                                                                                                                   |                                                                                                                                                                                                                                                                               |
| **Code generation**: `npm run solar:codegen` emits tokens to CSS, MUI, Tailwind and Flutter, the icons and logos to React, raw SVG and Flutter, and the Button, Icon Button, Button Group and Spinner recipes and F1's thirteen display primitives' to MUI and Flutter, with parity suites proving the targets agree                                                                                                                                                           |
| **Components**: SOLAR Button, Icon Button, Button Group and Spinner, and the display primitives (StatusIndicator, Counter, Kbd, Timestamp, Avatar, Trend Badge, Divider, Skeleton, ProgressBar, Node End, RowExpand, Tree Indent, Cursor), for React (`@bwp-web/components`, on MUI) and for Flutter (`SolarButton`…`SolarCursor`), each overridable through a reviewed overlay in `spec/overlay/`, and checked on both platforms against what Figma draws, variant by variant |                                                                                                                                                                                                                                                                               |
| **Review surfaces**: Storybook for React (`npm run storybook`) and Widgetbook for Flutter (`npm run widgetbook`), every Figma variant of every generated component with its state forced, in Light and Dark, built from the visual checks' own cases and oracles                                                                                                                                                                                                               |                                                                                                                                                                                                                                                                               |

One command, `npm run solar:sync`, refreshes all three Figma files without any model or agent.
The scripts under `docs/` generate **documentation and machine-readable data**; `solar:codegen`
generates **code** from that data. The two never run together and never write to each other's
outputs.

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
        npm run solar:codegen → spec/tokens.json → css · mui · tailwind · flutter
                              → spec/icons.json  → react · svg · flutter
                              → spec/components/*.json (+ spec/overlay/*.yaml) → mui · flutter recipes
        npm run solar:scaffold <Name>  → packages/components/src/<Name>.tsx, once, then hand-owned
        npm run solar:scaffold -- --flutter <Name> → solar_flutter lib/src/components/solar_<name>.dart
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

| Output                                                                                                                     | Produced by                  | Intended reader                                                                            | Shape documented in                                                         |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- |
| [solar/tokens/css-contract.json](solar/tokens/css-contract.json)                                                           | `build-derived.mjs`          | Generator: the `--solar-*` name and resolved value of every token, per mode                | [solar/tokens/README.md](solar/tokens/README.md#shape-of-the-derived-files) |
| [solar/tokens/reference.css](solar/tokens/reference.css)                                                                   | `build-derived.mjs`          | Humans, and a prototype of what `@bwp-web/styles` should ship                              | same                                                                        |
| [solar/tokens/grammar.json](solar/tokens/grammar.json)                                                                     | `build-derived.mjs`          | Validators and agents: regexes and banned names for token references                       | same                                                                        |
| [solar/figma-pages/\*\*/\*.md](solar/figma-pages/INDEX.md)                                                                 | `solar/build-docs.mjs`       | Humans and agents checking a chapter against what Figma says today                         | [solar/raw/README.md](solar/raw/README.md#file-shape)                       |
| [solar/figma-pages/page-context.json](solar/figma-pages/page-context.json)                                                 | `solar/build-docs.mjs`       | Agents: every `@SOLAR:PAGE_CONTEXT` block verbatim, lowest-precedence source               | same                                                                        |
| [solar/review-status.md](solar/review-status.md)                                                                           | `solar/build-docs.mjs`       | Maintainers: which curated chapters are behind their Figma source pages                    | its own header                                                              |
| [solar-icons/catalog.json](solar-icons/catalog.json), [INDEX.md](solar-icons/INDEX.md), [issues.md](solar-icons/issues.md) | `solar-icons/build-docs.mjs` | Asset generator: icon names, files, fill token per variant; humans: previews               | [solar-icons/README.md](solar-icons/README.md)                              |
| [solar-web/catalog.json](solar-web/catalog.json)                                                                           | `build-docs.mjs`             | Generator: one record per component with props, axes, tokens, slots, composition           | [solar-web/schema.md](solar-web/schema.md)                                  |
| [solar-web/token-usage.json](solar-web/token-usage.json)                                                                   | `build-docs.mjs`             | Impact analysis: which components consume a token                                          | same                                                                        |
| [solar-web/INDEX.md](solar-web/INDEX.md), [issues.md](solar-web/issues.md), per-page `.md`                                 | `build-docs.mjs`             | Humans and agents reading about one component                                              | [solar-web/README.md](solar-web/README.md#reading-a-component-page)         |
| `solar/raw/_meta.json`, `solar-web/raw/_meta.json`                                                                         | the fetchers                 | Provenance: file version, date, failed pages, unresolved variable ids                      | [solar-web/README.md](solar-web/README.md#keeping-it-in-sync-with-figma)    |
| [`spec/tokens.json`](../spec/tokens.json)                                                                                  | `solar:codegen`              | The DTCG contract the four token targets are generated from: 710 tokens with their modes   | [packages/codegen/README.md](../packages/codegen/README.md)                 |
| [`spec/icons.json`](../spec/icons.json)                                                                                    | `solar:codegen`              | The drawing contract the three icon targets are generated from: 340 icon sets, 3 logo sets | same                                                                        |
| `packages/styles/src/generated/`, `packages/solar_flutter/lib/src/generated/tokens.dart`                                   | `solar:codegen`              | Apps: the tokens as CSS, an MUI theme, a Tailwind 4 stylesheet and Dart constants          | [packages/styles/README.md](../packages/styles/README.md)                   |
| `packages/assets/src/generated/`, `packages/solar_flutter/lib/src/generated/icons.dart`                                    | `solar:codegen`              | Apps: 340 React icon components, 685 standalone SVG files and the Dart vectors             | [packages/assets/README.md](../packages/assets/README.md)                   |
| [`spec/components/`](../spec/components/)                                                                                  | `solar:codegen`              | The component contract: API, platform states, slots and style recipe in token names        | [packages/codegen/README.md](../packages/codegen/README.md#components)      |
| [`spec/verify/`](../spec/verify/)                                                                                          | `solar:codegen`              | The oracle: what Figma draws for every variant, the visual checks' expectations            | [packages/codegen/README.md](../packages/codegen/README.md#components)      |
| [`spec/overlay/`](../spec/overlay/)                                                                                        | hand-written, reviewed       | The decisions about one component: base, renames, axis interactions, allowed literals      | same                                                                        |
| `packages/styles/src/generated/mui/components/`, `packages/solar_flutter/lib/src/generated/components/`                    | `solar:codegen`              | Apps: each component's recipe, for MUI's `sx` and for a Flutter `ButtonStyle`              | [packages/components/README.md](../packages/components/README.md)           |
| [`spec/deviations.md`](../spec/deviations.md)                                                                              | `solar:codegen`              | SOLAR governance: the 29 places code and Figma differ — 14 token, 1 MUI, 3 icon, 11 Button | its own header                                                              |

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
npm run solar:codegen      # rebuild both specs and every code target, no Figma access
npm run solar:triage       # survey every SOLAR Web component for planning: builds, findings, needs
```

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

`npm run solar:codegen` runs two stages from the data under `docs/`, each writing a contract and
then generating independent targets from it.

**Tokens.** The token data becomes `spec/tokens.json`, a [DTCG](https://tr.designtokens.org/)
contract of 710 tokens. Four emitters generate from that one file: CSS custom properties, an MUI
theme and a Tailwind 4 stylesheet into [`@bwp-web/styles`](../packages/styles/README.md), and Dart
constants into [`solar_flutter`](../packages/solar_flutter/README.md).

**Icons.** `docs/solar-icons/` becomes `spec/icons.json`, the drawing data for 340 icon sets and
3 logo sets — a viewBox and path strings per variant, and nothing else. Three emitters generate
from it: React components and 685 standalone SVG files into
[`@bwp-web/assets`](../packages/assets/README.md), and `SolarVector` constants into
`solar_flutter`. An icon carries **no** colour — it inherits one from `color.icon.*`, through
`currentColor` on the web and the widget's colour in Flutter — while a logo always carries its
own and is never tintable.

**Components.** A component set under `docs/solar-web/` becomes `spec/components/<name>.json`:
its public API, the states the platform handles, its slots, and a **recipe** — what it looks like,
per size, appearance and state, in token names. Figma's own axes are read against SOLAR's model,
geometry follows size and paint follows appearance and state, and every variant that disagrees is
recorded rather than averaged away. A hand-written overlay in `spec/overlay/` holds the decisions
about one component, each with a reason. Two emitters generate from the IR: a recipe for MUI in
`@bwp-web/styles/mui` and one for Flutter in `solar_flutter`. The component itself — props, slots,
loading, accessibility — is a **shell**, one per platform (a React component, a Flutter widget),
scaffolded once by `solar:scaffold` and then owned by developers, so a design change reaches it through the recipe without touching behaviour.

No target is transpiled from another; agreement is proved instead by parity suites that compare
every token in every mode, every icon variant's geometry, and every component recipe entry and API
across MUI and Flutter, against the spec as the oracle. The places code and Figma differ are
reported in [`spec/deviations.md`](../spec/deviations.md), never patched in `docs/`.

Agreement between two platforms is not correctness, so the components are also checked against
**Figma itself**. `spec/verify/<name>.json` is the oracle: what Figma draws for every variant,
generated straight from the Figma layers, independently of the recipe. The **visual checks**
render every variant as the real component — React in Chromium with Playwright
(`npm run test:visual`), Flutter as widget tests — reach each state the way a user does, read back
what is drawn, and fail on any difference the oracle does not excuse. An excused difference is an
open finding or an overlay decision, named in the oracle, and lands in a gap report instead.

**It never writes to `docs/`.** This folder mirrors Figma, so when generated code is wrong the
fix belongs in the generator, never in the mirror. A write guard enforces it and CI re-checks it
after every run. How to change it: [packages/codegen/README.md](../packages/codegen/README.md).
Why it is built this way, and what the tweak loop will look like when it exists:
[the docs-to-code spec](superpowers/specs/2026-09-21-solar-docs-to-code-design.md).

## Checks in CI

[`.github/workflows/solar.yml`](../.github/workflows/solar.yml) runs on every pull request and
on pushes to `main` and the `v*` branches. **No job needs a Figma token**, because all of them
work from data that is committed here.

| Job                                        | What it does                                                                                                                                                       | Fixing a failure                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| Generated docs and tokens are up to date   | Reruns `solar:docs` and `solar:tokens` from the committed raw data and fails if any file changes, then checks Prettier formatting of the docs and scripts          | Run those two commands locally and commit the result                             |
| No unreviewed personal data or credentials | [`scripts/check-personal-data.mjs`](../scripts/check-personal-data.mjs) scans every tracked and untracked file for credentials, e-mail addresses and phone numbers | Redact in the extractor, or accept the finding with a written reason (see below) |
| Generated code is up to date               | Reruns `solar:codegen`, fails if `docs/` was written to, fails if any generated file changed, then runs the unit and parity suites                                 | Run `npm run solar:codegen` locally and commit the result                        |
| Dart package analyzes and tests            | `dart format --set-exit-if-changed`, `flutter analyze` and `flutter test` in `packages/solar_flutter`, including the Flutter visual checks; keeps their reports    | Run the same three locally; the reports are in `build/visual/`                   |
| Web components draw what Figma draws       | Installs Playwright's Chromium and runs `npm run test:visual`: every variant rendered and measured against `spec/verify/`; keeps the gap reports                   | Run `npm run test:visual` locally; the reports are in `test/visual/.out/`        |

The Flutter version is pinned in the workflow, because `dart format` changed its output in Dart
3.7 and the codegen job diffs the formatted file. Upgrading Flutter locally means reformatting
`tokens.dart` and raising `FLUTTER_VERSION` in the same commit. Node is pinned to 22 in every
job and in `.nvmrc`.

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

| You want to…                          | Read                                                                                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Write UI as an agent                  | [solar/18-agent-reference.md](solar/18-agent-reference.md), then the component's page under `solar-web/`                                                                 |
| Understand a design rule              | The chapter in [solar/README.md](solar/README.md)                                                                                                                        |
| See what a Figma page says today      | [solar/figma-pages/INDEX.md](solar/figma-pages/INDEX.md)                                                                                                                 |
| Know whether the chapters are current | [solar/review-status.md](solar/review-status.md)                                                                                                                         |
| Look up a token's CSS name or value   | `solar/tokens/css-contract.json`, or `reference.css` for the whole theme                                                                                                 |
| Validate a token reference            | `solar/tokens/grammar.json`                                                                                                                                              |
| Generate icon assets                  | [solar-icons/README.md](solar-icons/README.md#conventions-a-generator-can-rely-on), then `solar-icons/catalog.json`                                                      |
| Use the tokens in code                | [packages/styles/README.md](../packages/styles/README.md) for MUI, CSS and Tailwind; [packages/solar_flutter/README.md](../packages/solar_flutter/README.md) for Flutter |
| Use an icon or a logo in code         | [packages/assets/README.md](../packages/assets/README.md) for React and raw SVG; [packages/solar_flutter/README.md](../packages/solar_flutter/README.md) for Flutter     |
| Change what the generator emits       | [packages/codegen/README.md](../packages/codegen/README.md)                                                                                                              |
| Plan the next components              | [the milestone 4 plan](superpowers/plans/2026-09-24-solar-library-families.md), and `npm run solar:triage` for today's numbers                                           |
| Know why the code differs from Figma  | [`spec/deviations.md`](../spec/deviations.md)                                                                                                                            |
| Design the component generator        | [solar-web/schema.md](solar-web/schema.md), then [solar-web/README.md](solar-web/README.md#conventions-a-generator-can-rely-on) and its limits section                   |
| Refresh from Figma                    | `npm run solar:sync`; details in [solar/raw/README.md](solar/raw/README.md) and [solar-web/README.md](solar-web/README.md#keeping-it-in-sync-with-figma)                 |
| Know why two sources disagree         | [solar/source-discrepancies.md](solar/source-discrepancies.md) and [solar-web/issues.md](solar-web/issues.md)                                                            |
