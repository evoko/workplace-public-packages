# SOLAR Web raw extraction

One JSON file per Figma page of `SOLAR Web [v1--2026]` (file key `OGvmMNnywH7JWDyEhOzjcc`).
[`_pages.json`](_pages.json) is the manifest of pages and their target paths.

**How the data is produced (current route):** [`fetch-rest.mjs`](fetch-rest.mjs) calls
the Figma REST API (`GET /v1/files/{key}/nodes?ids={pageId}`) for every page in the
manifest, through the shared client and version-keyed cache in
[`../../_shared/figma-rest.mjs`](../../_shared/figma-rest.mjs), and transforms the response
into the shape below. It needs a Figma personal
access token with `file_content:read` in `$FIGMA_TOKEN` or `~/.config/figma/token`, from
an account that can open the file. It costs no model tokens and is deterministic.
Variable IDs become names through [`_variables.json`](_variables.json); that map was
built with the Figma Plugin API because the REST variables endpoint requires the
`file_variables:read` scope, which the available accounts cannot grant. With such a
token, `fetch-rest.mjs --vars` rebuilds the map from REST. Until then, when the fetch reports
unresolved variable refs (a variable Foundations added or republished under a new ID, as on
2026-09-25), [`unresolved-ids.mjs`](unresolved-ids.mjs) lists their full IDs from the REST cache,
prints the read-only Plugin API script that names them (run it through the Figma MCP `use_figma`
tool in this file), and merges the names it returns (`--add`); then run the fetch again, which
reads the cache.

After a change to the fetcher itself, `--expect-version <v>` rebuilds the mirror from the cache
of the version it already holds (`_meta.json`), and stops, writing nothing, where Figma's current
version is another: the change is taken alone, never mixed with a design change a sync would
bring.

```bash
node docs/solar-web/raw/fetch-rest.mjs                 # all pages (REST responses cached in $TMPDIR)
node docs/solar-web/raw/fetch-rest.mjs --only-missing  # only pages without a JSON yet
node docs/solar-web/raw/fetch-rest.mjs --pages button,tabs
node docs/solar-web/build-docs.mjs                     # then regenerate the docs
```

**Retired route:** before REST access existed, pages were extracted inside the Figma desktop
app through the Figma MCP `use_figma` tool, chunked and reassembled by `_extractor.js`,
`_extractor2.js`, `_assemble.mjs` and `_assemble2.mjs`. It worked on view-only files but routed
every byte through a model. The REST route replaced it on 2026-09-21 with the identical output
shape, and the scripts were removed on 2026-09-23; they are in git history if a view-only file
ever needs them again.

These files are the machine-readable ground truth for the human docs one level up and
for any design-to-code generator. Regenerate them rather than editing them.

## File shape

```jsonc
{
  "page": "↳ 🟢 Button", // Figma page name
  "pageId": "2049:578",
  "componentSets": [/* every COMPONENT_SET on the page */],
  "components": [/* COMPONENTs that are not variants of a set */],
  "frames": [
    /* other top-level frames/instances: examples, view compositions */
  ],
  "docText": [/* text of the page's documentation card(s), in reading order */],
  "pageContext": null, // an @SOLAR:PAGE_CONTEXT block if the page has one
}
```

### `componentSets[]`

| Field                     | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `id`              | Figma component set name and node id                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `description`             | The set's description as written in Figma (HTML entities such as `&quot;` are as stored)                                                                                                                                                                                                                                                                                                                                                                          |
| `docLinks`                | Documentation links attached in Figma                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `props`                   | `componentPropertyDefinitions`: `type` (`VARIANT`, `BOOLEAN`, `TEXT`, `INSTANCE_SWAP`), `default`, `options` (variant axis values). Non-variant prop keys carry Figma's `#node:id` suffix                                                                                                                                                                                                                                                                         |
| `variantCount`            | Number of variant components in the set                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `defaultVariant`          | Name of the variant Figma marks as default                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `defaultVariantNodeCount` | Node count under the default variant; when > 300 the tree is capped at depth 3 and a `census` is added                                                                                                                                                                                                                                                                                                                                                            |
| `defaultVariantTree`      | Layer tree of the default variant (see below)                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `variants[]`              | Per-variant digest: `variant` (name = `axis=value, …`), `size` `[w, h]`, root `fills`/`strokes`/`effect`/`opacity`, the set of `textFills` and `iconFills` found inside, `hidden` layer names when they differ from the default variant's, and `overrides` (non-default variants only): `changed` layer-path → differing fields, `added` and `removed` layer paths, relative to `defaultVariantTree`. Documented in [../schema.md](../schema.md#variantoverrides) |
| `variantsTruncated`       | Present when more than 150 variants were skipped                                                                                                                                                                                                                                                                                                                                                                                                                  |

### Layer tree nodes (`defaultVariantTree`, `components[].tree`, `frames[].tree`)

| Field                                              | Meaning                                                                                                                                                                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`, `type`                                     | Layer name and Figma node type                                                                                                                                                                                                                 |
| `hidden`                                           | `true` when the layer is invisible in this variant (usually a boolean-prop-controlled slot)                                                                                                                                                    |
| `main`                                             | For instances: the name of the component (or component set) the instance comes from                                                                                                                                                            |
| `variant`                                          | For instances: the variant properties applied                                                                                                                                                                                                  |
| `text`, `textStyle`                                | For text: first 80 characters and the bound text style                                                                                                                                                                                         |
| `size`                                             | `[width, height]` in px                                                                                                                                                                                                                        |
| `layout`                                           | Auto-layout: `dir`, `gap`, `pad` `[top, right, bottom, left]`, `align` `primary/counter`, `sizing` `horizontal/vertical`                                                                                                                       |
| `sizing`                                           | For non-auto-layout children of an auto-layout parent: `horizontal/vertical` sizing                                                                                                                                                            |
| `fills`, `strokes`                                 | Visible paints. `{Collection:path}` means bound to a variable; a bare `#hex` is a **hard-coded value**; a linear gradient is `linear-gradient(<start> → <end>: <stop> <at>%, …)`, its handles as fractions of the box ([schema](../schema.md)) |
| `constraints`                                      | For a layer placed by `position`: what Figma pins it to, `horizontal/vertical` (`RIGHT/TOP`), where that is not the left and the top                                                                                                           |
| `strokeWeight`, `radius`, `opacity`, `effectStyle` | As in Figma; `radius` is a 4-array when corners differ                                                                                                                                                                                         |
| `vars`                                             | Every other bound variable on the node, `property → Collection:path` (padding, gap, radius, stroke weight, width/height, font size, line height, font family, font style)                                                                      |
| `propRefs`                                         | Component property references: which prop controls `visible`, `characters`, or `mainComponent` on this layer                                                                                                                                   |
| `children`                                         | Child layers (instances are not expanded; their internals belong to their own component page)                                                                                                                                                  |

### `frames[]`

Top-level frames or instances that are not component sets, typically example compositions
on pattern and view pages. Each has `name`, `type`, `id`, `size`, and when it contains no
component definitions: a `census` (instance count per source component), a depth-2 `tree`,
and `texts` (visible strings longer than 40 characters).

## Reading token references

`{Color:action/primary/bg/default}` is the Figma variable `action/primary/bg/default` in the
**Color** collection of SOLAR Foundations, i.e. the documented token
`color.action.primary.bg.default` and the CSS property `--solar-color-action-primary-bg-default`.
Resolved values live in [`../../solar/tokens/figma-variables.json`](../../solar/tokens/figma-variables.json)
and [`../../solar/tokens/css-contract.json`](../../solar/tokens/css-contract.json).
`{Layout:grid/gutter/md}` refers to SOLAR Web's own local Layout collection.
`{Base Typograhy:…}` or `{Scale:…}` are legacy collections that only appear in documentation
chrome.

## Regenerating a page

`node docs/solar-web/raw/fetch-rest.mjs --pages <slug>` then `node docs/solar-web/build-docs.mjs`.
Delete the cached response under `$TMPDIR/solar-web-rest-cache/` first for a fresh pull
from Figma instead of the cached one.
