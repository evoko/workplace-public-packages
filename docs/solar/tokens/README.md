# SOLAR token inventory

[figma-variables.json](figma-variables.json) is a verbatim capture of every variable,
text style and effect style in the SOLAR Foundations Figma file, taken on 2026-09-20 via
the Figma Plugin API. It is the token source of truth for this repository until the
SOLAR core team's automated Figma → JSON export replaces it (pipeline stage 2 in
[17-implementation-pipeline.md](../17-implementation-pipeline.md)).

## Files in this folder

| File                   | What it is                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `figma-variables.json` | **Source of truth.** Verbatim capture of every variable, text style and effect style                                                                                           |
| `css-contract.json`    | Generated. Every token as `{figma, doc, css}` with resolved Light/Dark or Desktop/Mobile values, shadow composites, text-style composites, z-index ladder                      |
| `reference.css`        | Generated. All `--solar-*` custom properties: Light defaults, Dark under `[data-theme="dark"]`, Mobile type under a `max-width: 767.98px` media query, reduced-motion baseline |
| `grammar.json`         | Generated. Enumerations, anchored regex patterns per token category (semantic and primitive), and the banned-name list, for validating token references                        |
| `build-derived.mjs`    | Generates the three files above from the JSON. `node docs/solar/tokens/build-derived.mjs`                                                                                      |

## Shape of the file

| Key            | What it holds                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`       | File key, export date, collection ids, mode names, counts                                                                                                     |
| `primitives`   | The Primitives collection (265 variables, single mode) grouped by path prefix. Hex strings, or `{hex, a}` for alphas. Scales are arrays or `{index: px}` maps |
| `color`        | The Color collection (287 variables). `name: [lightAlias, darkAlias, scopes]`. Aliases point into `primitives`                                                |
| `spatial`      | The Spatial collection (34 variables). `name: [alias, resolvedPx, scopes]`                                                                                    |
| `type`         | The Type collection (41 variables). `name: [desktopPx, mobilePx]`                                                                                             |
| `textStyles`   | 60 local text styles. `name: [family, style, sizePx, lineHeightPx, letterSpacing]` at Desktop mode                                                            |
| `effectStyles` | 9 local effect styles as ordered drop-shadow layers with the bound shadow color variable and its Light-mode rgba                                              |

Counts were checked against Figma after writing: 265 / 287 / 34 / 41 / 60 / 9.

## Reading a token end to end

`color.action.primary.bg.hover`

1. Docs name → Figma path: drop the `color.` category and use slashes:
   `action/primary/bg/hover` in the Color collection.
2. `color["action/primary/bg/hover"]` = `["{color/neutral/700}", "{color/mono/white}", …]`.
3. Resolve each alias in `primitives`: Light `#333333`, Dark `#FFFFFF`.
4. CSS: `--solar-color-action-primary-bg-hover: #333333;` and, under
   `[data-theme="dark"]`, `#ffffff`.

`inset.lg`

1. Figma path `inset/lg` in the Spatial collection.
2. `spatial["inset/lg"]` = `["{spatial/scale/5}", 20, "GAP"]`.
3. CSS: `--solar-inset-lg: 20px;` (or `1.25rem`).

`body/md/regular`

1. Text style: Inter Regular, 14 / 20, −0.32 px tracking (documented as −2 %).
2. Size and line height are bound to `type["size/body/md"]` and
   `type["line-height/body/md"]`, both `[14, 14]` and `[20, 20]`, so this style is the
   same on Desktop and Mobile. `display/lg` by contrast is `[56, 40]` / `[72, 52]`.

## Aliases and modes

- Light/Dark live only in the Color collection. Spatial has one mode. Type has
  Desktop/Mobile. A rendered screen is always in one color mode **and** one type mode.
- Every semantic value is an alias; no semantic token holds a raw value. This is what
  makes theming a primitive swap.
- Scopes are Figma property scopes (`TEXT_FILL`, `STROKE_COLOR`, `GAP`, …). They encode
  intent (a `TEXT_FILL` token is a text color) and are worth preserving in any
  generated token metadata.

## Groups you might not expect in Foundations

- `color.meter.*` and `color.control.{neutral,mute,solo,phantom,phase}.*`: audio-domain
  semantics (SOLAR Audio) shipped in the shared collection.
- `color/flow-accent/*` primitives: SOLAR Flow wire and port accents.
- `.[utility]/…` text styles: internal styles for the documentation slides, not the
  product ramp.

## Sync status against SOLAR Web (checked 2026-09-20)

SOLAR Web (`OGvmMNnywH7JWDyEhOzjcc`) defines no color, type or spatial variables of its
own. It consumes the four Foundations collections from the published org library
`SOLAR Foundations [v1--2026]`, so the question "is this JSON in sync with SOLAR Web?"
reduces to "is it in sync with the published library". Result:

| Collection | Published names | JSON names | Name diff        | Values checked                | Value diff |
| ---------- | --------------- | ---------- | ---------------- | ----------------------------- | ---------- |
| Color      | 287             | 287        | none             | 111 (bound in Web components) | none       |
| Spatial    | 34              | 34         | none             | 26                            | none       |
| Type       | 41              | 41         | none             | 20                            | none       |
| Primitives | 158             | 265        | 107 in JSON only | 15                            | none       |

- The 107 primitives absent from the published listing are exactly the non-color
  groups: `type/*` (61), `spatial/*` (33), `viewport/*` (5), `motion/*` (8). They are
  hidden from publishing but still resolve inside Web through aliases and direct
  bindings (Web text layers bind `type/font-family/inter` and `type/font-weight/*`), so
  the JSON is a superset, not a divergence.
- Values were compared for every variable bound on six representative Web pages
  (Button, Text Input, Dialog, Data Table, Alert, Dashboard): 174 bindings, 174 matches.
  A full-value comparison of all 520 published variables needs edit access to the Web
  file (`importVariableByKeyAsync` is blocked in view mode) or the org Foundations file.
- SOLAR Web adds one local collection, **Layout** (20 variables): `grid/columns/{xs…xl}`
  = 4, 4, 8, 12, 12; `grid/margin/*` and `grid/gutter/*` aliased to `spatial/scale`;
  `breakpoint/{xs…xl}` aliased to `viewport/*`. It is not in this JSON because it is a
  SOLAR Web token, not a Foundations token.
- The Web documentation cards (`.Component Description` instances) still bind two
  legacy remote collections, `Base Typograhy` and `Scale` (`font-sizing/1,25rem`,
  `letter-spacing/body (-0,2em)`, `0,875rem`…). They appear only in the doc chrome.
  Since 2026-09-21 the new Coachmark component also binds pre-SOLAR libraries
  (`Sematic`, a legacy `Spatial:Spacing/*` and a palette); `docs/solar-web/issues.md`
  flags every such binding as "Binds legacy non-SOLAR collection(s)".

## Shape of the derived files

All three are written by `build-derived.mjs` (`npm run solar:tokens`) and carry a `_note`
explaining themselves. Never edit them; change the JSON or the script.

### `css-contract.json`

```jsonc
{
  "_note": "…",
  "generatedFrom": { "figmaFile", "fileKey", "exportedOn", "solarVersion", "collections": { … } },
  "variables": [Variable, …], // 627: 265 primitives + 287 color + 34 spatial + 41 type
  "effectStyles": [EffectStyle, …], // 9
  "textStyles": [TextStyle, …], // 47: the 60 Figma styles minus the 13 whose names start with "_" or "."
  "zIndex": { "base": 0, "sticky": 100, "dropdown": 200, "overlay": 300, "dialog": 400, "toast": 500, "tooltip": 600 }
}
```

Every `Variable` has `collection` (`Primitives | Color | Spatial | Type`), `tier`
(`primitive | semantic`), and the same name in three spellings: `figma` (`surface/background`),
`doc` (`color.surface.background`), `css` (`--solar-color-surface-background`). The value
fields depend on the collection:

| Collection   | Value fields                                               | Example                                                                 |
| ------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| `Primitives` | `value`                                                    | `"#d22730"`, `"8px"`, `"rgba(0, 0, 0, 0.05)"`                           |
| `Color`      | `light`, `dark` (resolved sRGB), `lightAlias`, `darkAlias` | `"#f5f5f5"`, `"#111111"`, `color/neutral/50`, `color/neutral/900`       |
| `Spatial`    | `value` (resolved px), `alias`                             | `"0px"`, `spatial/border-width/none`                                    |
| `Type`       | `desktop`, `mobile` (px), `naming: "proposed"`             | `"56px"`, `"40px"`. The `type.` doc prefix is not yet ratified by SOLAR |

`EffectStyle` adds `light` and `dark` as ready-to-use `box-shadow` strings plus `layers[]`
(`x, y, blur, spread, colorVar`). `TextStyle` has `figma`, `fontFamily`, `fontWeight`,
`sizeDesktop`, `lineHeightDesktop`, `letterSpacing`, `sizeMobile`, `lineHeightMobile`, and
`sizeVar`/`lineHeightVar` naming the Type-collection CSS properties it should reference.
`zIndex` is not a Figma variable; it is the seven-level ladder from the Agentic Reference.

### `reference.css`

A complete, standalone theme: every `Variable` as a custom property with its Light or
Desktop value on `:root`, Dark values under `[data-theme="dark"]`, Mobile type sizes under
`@media (max-width: 767.98px)`, effect styles as shadow composites, the z-index ladder, and
a reduced-motion baseline. It is a prototype of what `@bwp-web/styles` should ship, and the
quickest way for a human to eyeball the whole contract.

### `grammar.json`

```jsonc
{
  "separators": { "figma": "/", "docs": ".", "css": "-", "cssPrefix": "--solar-" },
  "categories": { "color": { "surfaceVariants": [...], "actionStates": [...], … }, "spatial": {…}, "type": {…}, "motion": {…}, "shadowEffects": [...], "textStyles": [...] },
  "patterns": { "color.surface": "^color\\.surface\\.(…)$", "inset": "…", "radius": "…", … },
  "primitivePatterns": { "color palette": "…", "spatial primitive": "…", … },
  "banned": { "color.text.error": "color.text.feedback.danger", "foreground": "use text or icon", … }
}
```

`categories` are enumerations of the segments that actually exist. `patterns` are anchored
regexes over the documentation dot-name, one per semantic token family, plus one for the
CSS custom-property form; a reference that matches none of them is invalid.
`primitivePatterns` recognise primitives so a validator can reject them in component code.
`banned` maps the most common wrong names to the right one.

## Regenerating

Until the official export exists, the file can be regenerated with a Figma Plugin API
script (`figma.variables.getLocalVariableCollectionsAsync()`,
`getLocalVariablesAsync()`, `getLocalTextStylesAsync()`, `getLocalEffectStylesAsync()`)
against file key `Y21OGpk2z6ig9cRMc5cl9L` (Biamp's original; a content-identical copy works
too, the capture reads only local collections). Keep the same shape so diffs stay readable.
