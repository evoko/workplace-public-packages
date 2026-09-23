# SOLAR Foundations raw extraction

One JSON file per page of the Figma file `SOLAR Foundations [v1--2026]` (key
`Y21OGpk2z6ig9cRMc5cl9L`, Biamp's original, not a copy). [`_pages.json`](_pages.json) is the
page manifest, [`_meta.json`](_meta.json) the provenance of the last fetch.

**How the data is produced:** [`fetch-rest.mjs`](fetch-rest.mjs) calls the Figma REST API
(`GET /v1/files/{key}/nodes?ids={pageId}`) for every page through the shared client in
[`../../_shared/figma-rest.mjs`](../../_shared/figma-rest.mjs), caches responses by file
version, and turns each page into its text in reading order. No model or agent is involved;
running it twice on an unchanged file produces no diff. It needs a Figma personal access
token with `file_content:read` in `$FIGMA_TOKEN` or `~/.config/figma/token`.

The same run also reads every text style's definition into [`text-styles.json`](text-styles.json):
its `textDecoration` and `textCase`, which the Plugin API token capture did not record, plus font,
size, line height and letter spacing to cross-check it. Style ids come from the published styles
(`GET /v1/files/{key}/styles`), falling back to the file's own style map; each style's node then
carries its full type style. `tokens/build-derived.mjs` merges the decoration and case into
`css-contract.json`. Without this, `link/md/hover` was indistinguishable from `label/md`: the
underline that makes it a link was lost.

```bash
npm run solar:foundations                          # fetch + rebuild ../figma-pages/
node docs/solar/raw/fetch-rest.mjs --pages tokens,color   # a subset
node docs/solar/raw/fetch-rest.mjs --fresh          # ignore the response cache
node docs/solar/build-docs.mjs                      # rebuild ../figma-pages/ only
```

**What it does not do:** read Figma variables. The REST variables endpoint needs the
Enterprise-only `file_variables:read` scope, so [`../tokens/figma-variables.json`](../tokens/figma-variables.json)
remains a deliberate Plugin API capture (see [`../tokens/README.md`](../tokens/README.md#regenerating)).
Variable ids that appear in `swatches[]` below are the Foundations file's local ids
(`VariableID:27:748`) and are matched to names by label, not by id.

## Sections

| Section         | Figma group        | Pages | Notes                                                                                                                           |
| --------------- | ------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| `meta`          | `[Bracketed]`      | 4 + 1 | Changelog, Table of Contents, Directory, Lint Plugin. **Contacts is excluded** (`exclude: true` in the manifest: personal data) |
| `documentation` | `☰ DOCUMENTATION` | 22    | The chapters the curated `../NN-*.md` files were written from. `indent: 1` marks sub-pages                                      |
| `primitives`    | `◼︎ PRIMITIVES`     | 6     | Colour, Typography, Spatial, Motion, Elevation, Viewport reference sheets                                                       |

`Cover`, `---` separators and `.[UTILITY]` are skipped. Pages that disappear from Figma are
marked `missingInFigma` in the manifest, never deleted.

A page with `"exclude": true` in `_pages.json` is never fetched or rendered and any stale raw
file of it is removed on the next run. This repository is public; use the flag for any page
that carries personal data (names, e-mail addresses) rather than redacting by hand.

## File shape

```jsonc
{
  "page": "Tokens",
  "pageId": "763:47331",
  "section": "documentation",
  "slug": "tokens",
  "status": "done", // from the 🟢 / 🟡 / 🟠 emoji in the page name
  "slides": [
    {
      "name": "Slide",
      "title": "Token Naming Grammar", // the slide's .Subheader headline, null on cover slides
      "subtitle": null,
      "x": 8880, "y": 0, "w": 959, "h": 2906, // canvas position; slides read left to right
      "blocks": [Block, …]
    }
  ],
  "pageContext": "@SOLAR:PAGE_CONTEXT\npage: Tokens\n…", // verbatim, or null
  "swatches": [ { "layer": "Color container", "labels": ["red", "#D22730"], "variableId": "VariableID:27:748", "hex": "#d22730", "opacity": 1 } ],
  "blockCount": 141
}
```

### `Block`

| `t`     | Fields              | Source                                                                                                   |
| ------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| `h`     | `level` 1–5, `text` | Text using the `.[utility]/Headline/H*` styles                                                           |
| `p`     | `text`, `style`     | Any other text. `style` is the text-style name, or `size/weight` when unstyled. Newlines kept            |
| `code`  | `text`              | Text using a `Code/*` style                                                                              |
| `table` | `rows[][]`          | A frame whose children are horizontal rows of text cells with equal cell counts; first row is the header |
| `image` | `name`              | A node with an image fill and no text                                                                    |
| `group` | `name`, `blocks[]`  | A component instance (`.Grid Item`, `.Color`, `.Table / Column`…) with its own text                      |

Reading order: auto-layout children keep Figma order; free-positioned children are sorted by
row, then x. Hidden nodes, the `.Header` / `.Footer` chrome and the `@SOLAR:PAGE_CONTEXT`
frame are excluded from `blocks` (the latter is captured in `pageContext`).

`swatches[]` lists the smallest containers with a variable-bound fill and a text label,
ignoring text colours; on the primitives pages this is one entry per palette swatch or scale
step.

## Relationship to the curated chapters

The generated pages in [`../figma-pages/`](../figma-pages/INDEX.md) are the raw material.
The curated chapters one level up were written from the same Figma pages, reconciled against
`figma-variables.json`, and are the reference. Each chapter's front matter records the
content hash of its source pages (from `../figma-pages/_hashes.json`); `../build-docs.mjs`
compares them on every run and writes [`../review-status.md`](../review-status.md). When a
page changes, the chapter is flagged until someone reviews it and runs
`node docs/solar/build-docs.mjs --mark-reviewed <chapter-file>`. Nothing rewrites chapters
automatically.
