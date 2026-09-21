# SOLAR Web — Component, Pattern and View Reference

SOLAR Web is Biamp's browser component library, the layer above
[SOLAR Foundations](../solar/README.md) in the SOLAR dependency model. This folder is
the repo-local, machine-derived reference for the Figma file `SOLAR Web [v1--2026]`
(file key `OGvmMNnywH7JWDyEhOzjcc`), built to support a SOLAR design-to-code generator
and the V2 `@bwp-web/*` packages.

Unlike the Foundations docs, which are written prose, almost everything here is
**generated from data extracted out of Figma**. Edit the extractor or the builder, never
the generated files.

"A generator" on this page means the future design-to-code tool, which is **not built
yet**. The scripts here produce documentation and data for it; see
[../README.md](../README.md) for the end-to-end picture.

## What is here

| Path                                                          | What it is                                                                                                                                                                                                                                                    | Generated? |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [`INDEX.md`](INDEX.md)                                        | Every Figma page with the component sets it defines, variant counts, and a link to its page doc                                                                                                                                                               | yes        |
| [`catalog.json`](catalog.json)                                | One record per component set or standalone component: props and variant axes, default size and layout, every token bound, hard-coded values, slots, composed sub-components, and the page's documentation text. **This is the file a generator should read.** | yes        |
| [`token-usage.json`](token-usage.json)                        | Reverse index: SOLAR token → components that bind it. Useful for impact analysis and for checking that a token is actually consumed                                                                                                                           | yes        |
| [`issues.md`](issues.md)                                      | Description-vs-set mismatches and hard-coded values found during extraction                                                                                                                                                                                   | yes        |
| `components/…`, `patterns/…`, `views/…`, `tokens/…`, `meta/…` | One Markdown page per Figma page: description, props, anatomy with token bindings per layer, tokens used, slots, composition, variant matrix, issues, documentation card                                                                                      | yes        |
| [`raw/`](raw/README.md)                                       | The per-page JSON the docs are built from, plus the extractor, the assembler and the page manifest. Format documented in `raw/README.md`                                                                                                                      | extracted  |
| [`schema.md`](schema.md)                                      | Field-by-field reference for `catalog.json` and `token-usage.json`, and what a generator can and cannot read from them                                                                                                                                        | no         |
| [`build-docs.mjs`](build-docs.mjs)                            | Renders everything above from `raw/`. `node docs/solar-web/build-docs.mjs`                                                                                                                                                                                    | script     |

## How SOLAR Web relates to Foundations

- SOLAR Web defines **no color, spatial or type variables of its own**. Every binding
  points at the four Foundations collections consumed from the published library, so
  [`docs/solar/tokens/figma-variables.json`](../solar/tokens/figma-variables.json) resolves
  every token you will see here. The one local collection is **Layout** (grid columns,
  gutters, margins, breakpoints), captured in [tokens/layout-variables.json](tokens/layout-variables.json)
  and documented in [tokens/layout-grid.md](tokens/layout-grid.md).
- Text styles and effect styles also come from Foundations (`label/md`, `shadow/control`…).
- Icons are instances of the SOLAR Icons library (`Icon/ChevronRight`, `Icon/None`…);
  they appear in anatomy trees as composed components.
- Component descriptions in Figma are written by the SOLAR core team and include
  variant lists, sizing notes, accessibility requirements and do/don't rules. They are
  reproduced verbatim on each page.

## Reading a component page

1. **Props** lists the variant axes with the default in bold, then boolean, text and
   instance-swap props (Figma's `#node:id` suffixes are stripped).
2. **Anatomy** is the default variant's layer tree. Each layer shows its role
   (instance of X, text with style, frame), auto-layout metrics (`row gap 8 pad 0/12/0/12
HUG/FIXED`), size, and every token binding. A `~~struck~~` layer is hidden by
   default and typically controlled by a boolean prop. A bare `#hex` marked ⚠️ is a
   hard-coded value.
3. **Tokens used** unions the default tree and the variant digest by role.
4. **Slots and prop-controlled layers** map props to the layer they toggle, fill or swap.
5. **Composes** lists nested components; their internals live on their own pages.
6. **Variant matrix** gives, per variant, root fill, stroke, effect, and the set of
   text and icon colors inside. Read the state tokens from here.
7. **Issues detected** and **Documentation card** close the page.

## Conventions a generator can rely on

- Variant names are `axis=value, axis=value`; the axes and their order are in `props`.
- State axes use the names `default | hover | pressed | focus | disabled | loading`
  where present; Foundations tokens call `pressed` **active** (`color.action.*.*.active`).
- Destructive styling is a separate boolean-like variant axis `danger` and maps to
  the `…/danger/…` action tokens.
- Sizes are named `xs | sm | md | lg | xl`; rendered heights are in the variant matrix,
  and where a description disagrees with the rendered size, `issues.md` says so.
- Focus is usually **not** a variant: apply `shadow/focus/default` (or
  `shadow/focus/danger`) on `:focus-visible` per the Button description.
- Spacing is bound to `inset.*` for padding and gap, `stack.*` for vertical rhythm;
  radius to `radius.*`; border width to `border.*`; icon size to `icon.*`.

## Limits of the extracted data

Know these before designing anything on top of `catalog.json`:

- **Variants are stored as diffs against the default variant.** The default variant has the
  full layer tree; every other variant has a root digest plus `overrides` listing exactly
  which layers and fields differ (see [schema.md](schema.md)). Layers deeper than six levels
  and the internals of nested instances are not captured; sets with more than 151 variants
  are truncated and flagged.
- **No motion, no prototype interactions.** Durations, easings and transitions come from
  the Foundations motion tokens and prose, never from the Web file.
- **Descriptions and sets disagree** on 152 components: variant counts, axis values, state
  vocabularies. `issues.md` lists every case; the set is what was drawn, the description is
  what was intended, and neither is automatically right.
- **149 hard-coded values on 51 components**, listed per component under `hardcoded`. A
  generator must not turn these into literals; each one is a governance gap.
- **Some bindings point at pre-SOLAR libraries.** The documentation chrome binds `Base
Typograhy` and `Scale`; the Coachmark component (added to Figma 2026-09-21) binds
  `Sematic`, a legacy `Spatial:Spacing/*` collection and a `Legacy Palette` colour. These
  are not SOLAR tokens, resolve to nothing in `css-contract.json`, and are flagged per
  component as "Binds legacy non-SOLAR collection(s)". Treat each as a governance gap.
- **Ten local variables in the Web file duplicate Foundations token names**
  (`Color(local)/…`, `Spatial(local)/…`, `Type(local)/…` in `raw/_variables.json`). Treat
  them as the Foundations token of the same name and report them to SOLAR governance.
- **Layout tokens are SOLAR Web's own.** Grid columns, gutters, margins and breakpoints are
  the Web file's local `Layout` collection, absent from `figma-variables.json`. They are
  captured in [tokens/layout-variables.json](tokens/layout-variables.json) and folded into
  `css-contract.json` and `reference.css` as `layout.*` / `--solar-layout-*` by `solar:tokens`.
- **46 pages carry the boilerplate documentation card** ("Breadcrumbs" text left from the
  template). Their `docText` is not about the component; `issues.md` flags them.
- **Values are never resolved here.** Every token reference is a name; resolve it through
  `css-contract.json`. The Web file's own rendering is not a source for values.
- **Coverage is per Figma page**, tracked in `raw/_pages.json`. Pages the Figma team hides
  or renames are followed on the next sync; a page marked `missingInFigma` keeps its last
  extracted data until someone removes it deliberately.

## Keeping it in sync with Figma

```bash
npm run solar:web     # fetch every page from the live SOLAR Web file, then rebuild all docs here
npm run solar:sync    # the same, plus the Foundations side (docs/solar/figma-pages)
npm run solar:fetch   # fetch both files only
npm run solar:docs    # rebuild both doc sets only
npm run solar:tokens  # regenerate the Foundations css-contract / reference.css / grammar
```

`solar:web` is fully algorithmic, no model or agent involved:

1. Reads the live file's `version` from Figma and keys its response cache by it, so a
   changed file is re-fetched automatically and an unchanged one costs no API calls
   beyond the version check. `--fresh` forces a re-fetch.
2. Syncs [`raw/_pages.json`](raw/_pages.json) with the pages that exist in Figma: new
   content pages are added under the section they sit in, retitled pages are updated,
   the 🟢 / 🟡 / 🟠 status emoji is recorded as `status`, and pages that vanished are
   marked `missingInFigma` rather than deleted.
3. Fetches and transforms every page, writes [`raw/_meta.json`](raw/_meta.json) with
   the file version and date, and rebuilds `INDEX.md`, `catalog.json`,
   `token-usage.json`, `issues.md` and the per-page docs.

It exits non-zero if a page binds a variable that is not yet in
[`raw/_variables.json`](raw/_variables.json). That happens only when Figma adds a new
variable; resolving it is a one-line lookup described in [raw/README.md](raw/README.md).
Requirements: Node 20+, a Figma token in `~/.config/figma/token` or `$FIGMA_TOKEN` from an
account that can open the file. Note that this refreshes SOLAR **Web** only; the
Foundations token inventory in `docs/solar/tokens/figma-variables.json` is the declared
source of truth and is regenerated deliberately, not by this command.

## Regenerating

`npm run solar:sync` re-pulls every page over the REST API and rebuilds all docs; see
[raw/README.md](raw/README.md) for the token setup. The Figma file version and the date of
the current data are recorded in [raw/\_meta.json](raw/_meta.json), together with any pages
that failed to fetch and any variable ids that could not be named.
