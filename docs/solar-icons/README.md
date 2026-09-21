# SOLAR Icons — asset and metadata reference

SOLAR Icons is Biamp's icon library, the sibling of [SOLAR Web](../solar-web/README.md) in
the SOLAR dependency model. This folder is the repo-local, machine-derived copy of the Figma
file `SOLAR Icons [v2--2026]` (key `f0slPVSjDnXgdyPmWOSVOw`), built so that
`@bwp-web/assets` can be generated from it. Everything here is produced by
`npm run solar:icons`; edit the scripts, never the outputs.

## What is here

| Path                                                                           | What it is                                                                                                                                                                                  | Generated? |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| [`INDEX.md`](INDEX.md)                                                         | Every icon by category with inline previews of both variants, the Figma name, the proposed component name and the file stem                                                                 | yes        |
| [`catalog.json`](catalog.json)                                                 | One record per icon: names, category, Figma ids, and per variant the SVG path, bound fill token, path count and colours found in the file. **This is what an asset generator should read.** | yes        |
| [`svg/outline/`](svg/outline/), [`svg/solid/`](svg/solid/)                     | The exported SVGs, one per variant, named by kebab-case icon name (`chevron-right.svg`). Verbatim Figma export, 24 × 24, single fill `#111111`                                              | yes        |
| [`logos/`](logos/)                                                             | OS logos and the Biamp logo as SVG, app icons as PNG at 2× (they are raster images in Figma). Logos keep their colours                                                                      | yes        |
| [`issues.md`](issues.md)                                                       | Findings: missing or duplicate variants, hard-coded fills, wrong viewBox, name collisions, multi-colour SVGs                                                                                | yes        |
| [`CHANGELOG.md`](CHANGELOG.md)                                                 | The file's own Changelog page, verbatim, without the contributor column                                                                                                                     | yes        |
| [`raw/`](raw/)                                                                 | Per-page JSON (`raw/icons/<category>.json`, `raw/logos/logos.json`, `raw/meta/*.json`), the page manifest `_pages.json` and the provenance `_meta.json`                                     | extracted  |
| [`raw/fetch-rest.mjs`](raw/fetch-rest.mjs), [`build-docs.mjs`](build-docs.mjs) | The extractor (REST nodes + image export) and the renderer                                                                                                                                  | script     |

## How the library is modelled in Figma

- One page per category (Navigation, Actions, Status & Feedback, …). Each icon is a component
  set named `Icon/<Name>` with exactly two variants: `solid=false` (outline) and `solid=true`.
- Every variant is a 24 × 24 frame with a single flattened vector whose fill is bound to the
  Foundations primitive `color/neutral/900`. There are no strokes, so the SVGs are pure paths.
- The Logos page holds three sets: `OS Logo` (Microsoft, Google, Teams), `Biamp Logo` (dark
  and light) and `App Icon` (Workplace, Designer, Tools, Booking, Command), the last one drawn
  as raster images.
- `[Changelog]` is a text page; `[Staging]` and `New Icons Candidates` are empty.

## Conventions a generator can rely on

- **Name mapping.** Figma `Icon/ChevronRight` → file stem `chevron-right` → component
  `IconChevronRight`. Both derived names are in `catalog.json`; do not re-derive them.
- **Colour.** Every icon SVG carries exactly one fill, `#111111`, which is the bound token's
  Light-mode value. A generator replaces it with `currentColor` and lets the consumer set the
  colour through `color.icon.*` tokens. The catalog records the bound token per variant so a
  deviation shows up in `issues.md` first.
- **Variants.** Treat `outline` as the default and `solid` as a boolean prop, matching the
  Figma axis. An icon with a missing variant is listed in `issues.md`; do not synthesise it.
- **Collisions.** When two pages define the same icon name, the second export is suffixed with
  its page slug (`phone--audio-dsp`) and flagged. Resolve upstream rather than in code.
- **Logos are not icons.** They keep their own colours and aspect ratios and must never be
  recoloured.

## Keeping it in sync with Figma

```bash
npm run solar:icons      # fetch pages, export assets, rebuild the docs here
npm run solar:sync       # the same, plus Foundations and SOLAR Web
node docs/solar-icons/raw/fetch-rest.mjs --pages actions,media   # a subset of pages
node docs/solar-icons/raw/fetch-rest.mjs --no-assets             # metadata only, no export
```

The fetcher keys its response cache and its asset cache by the Figma file version, so an
unchanged file costs one request and re-copies assets from the cache; a changed file re-exports
everything. `svg/` and `logos/` are rebuilt from scratch on a full run so renamed or removed
icons do not linger. A cold export of all variants takes about two minutes because the image
endpoint is rate-limited. The command exits non-zero if any asset failed to export or a fill
binds a variable that is not in the SOLAR Web name map.

This repository is public: table columns named Contributors, Authors, Owners, Contacts or
E-mail are dropped at capture time on the text pages.

## Limits

- Icon descriptions and keywords are not filled in on the Figma side yet; `description` is
  empty on every icon.
- The export is what Figma renders: an icon with a stray off-grid pixel exports with a
  non-24 viewBox (see the Zone icon), and that is reported, not corrected.
- Raster app icons are exported at 2× only. Ask the design team for source files if other
  densities are needed.
