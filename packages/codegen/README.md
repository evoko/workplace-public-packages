# @bwp-web/codegen

Turns the SOLAR design system in [`docs/`](../../docs/README.md) into code. Private to this
repository: it is a build tool, not something we publish.

One command does everything:

```bash
npm run solar:codegen
```

It reads the committed Figma data and writes two contracts — `spec/tokens.json` and
`spec/icons.json` — then emits the tokens to four targets and the icons to three. It needs no
Figma token and no network.

## The one invariant

**The generator never writes to `docs/`.** `docs/` mirrors Figma; if generated code looks wrong,
the fix belongs in this package, never in the mirror. Every write goes through
[`writeGenerated`](src/util/write.mjs), which refuses a path under `docs/` outright, and CI
re-checks it after each run. This is invariant 1 of
[the design spec](../../docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md).

## What it produces

`spec/tokens.json` is the contract: 710 tokens in [DTCG](https://tr.designtokens.org/) format —
647 variables, 9 shadows, 47 text styles and the 7-level z-index ladder. Modes live under
`$extensions["com.biamp.solar"].modes`. Every token target is generated from this one file.

| Target     | Output                                                 | Covers                                                      |
| ---------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| `css`      | `packages/styles/src/generated/css/tokens.css`         | 663 — everything except the typography composites           |
| `mui`      | `packages/styles/src/generated/mui/theme.ts`           | 710                                                         |
| `tailwind` | `packages/styles/src/generated/tailwind/preset.ts`     | 371 — the semantic layer, plus `motion.*` and font families |
| `flutter`  | `packages/solar_flutter/lib/src/generated/tokens.dart` | 710                                                         |

The four are independent emitters reading one normalized spec. They are **not** transpiled from
each other: a Dart file is not a translation of a stylesheet, and pretending otherwise is how
the two drift apart.

`spec/deviations.md` lists the **18 places the code deliberately differs from what Figma says**:
13 from the tokens and 5 from the icons. It is the report SOLAR governance reads, so every entry
names an action for them.

## How the targets are kept in agreement

Each emitter writes a `tokens.manifest.json` beside its output recording, per token,
`{emitted, normalized, modes}` — the literal it produced, that literal parsed back to a
canonical form, and the same per mode. [`test/parity.test.mjs`](test/parity.test.mjs) then
asserts across all four that they agree with each other **and** with the spec, in every mode.
Agreement alone is not enough: four targets can be uniformly wrong, so the spec is the oracle.

Two subtleties worth knowing before changing an emitter:

- **Canonicalization absorbs unit differences, not mistakes.** Alpha is quantized to 8 bits
  because Dart's `Color(0xAARRGGBB)` has only one byte for it, and letter spacing is compared as
  a fraction of the font size because Figma states it in percent, CSS needs a length and Flutter
  needs pixels. A one-step error in either still fails.
- **A manifest is a claim about the output, so parity checks it against the real artifact.** The
  last assertion re-reads the stylesheet, the MUI data and the Dart source, because an emitter
  that recorded a mode it forgot to emit would otherwise pass.

## Icons

`spec/icons.json` is the second contract, built from `docs/solar-icons/`: 341 icon sets in
outline and solid, 3 logo sets, each variant reduced to `{viewBox, paths}` and each path to its
`d` string and fill rule. Three targets are emitted from it.

| Target    | Output                                                              | Covers                                            |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| `react`   | `packages/assets/src/generated/icons/`, `.../logos/`                | 341 icon components, 2 logo components, 5 rasters |
| `svg`     | `packages/assets/src/generated/svg/`                                | 687 standalone files: 682 icon variants, 5 marks  |
| `flutter` | `packages/solar_flutter/lib/src/generated/icons.dart`, `logos.dart` | 682 icon and 4 logo `SolarVector` constants       |

The path data reaches all three byte for byte, so agreement is a property of the data rather
than of three formatters happening to concur. [`test/icon-parity.test.mjs`](test/icon-parity.test.mjs)
proves it the hard way: it opens the generated TSX, the generated SVG and the generated Dart,
extracts the geometry back out and compares it to the spec, never to a manifest.

Two contracts make icons different from tokens, and each is asserted in both directions:

- **No icon carries a colour.** Every icon in SOLAR is drawn `#111111`; the normalizer asserts
  that and drops the fill, so a React path is `fill="currentColor"`, an SVG file's path is too,
  and a Dart path's `fill` is null and takes the widget's colour. The colour comes from
  `color.icon.*` at the point of use. A token's whole content is its value; an icon must have
  none, so the suite checks both the absence of any hex, `Color(` or `rgb(` and the presence of
  the inheritance that replaces it.
- **Every logo carries one.** A brand mark is not an icon with a tint, so a logo path keeps its
  own `#rrggbb`, an inherited one is an error, and `currentColor` appears in no generated logo
  artifact at all. The React and Flutter types omit a colour prop, so the compiler refuses a
  tinted mark rather than a comment asking nicely.

The one asset the vector IR cannot represent is the Teams mark — 12 gradient fills and every
`fill-opacity` in the corpus. React and the raw SVG ship it verbatim; Flutter omits it. The
emitter asserts that is the _only_ variant it skipped, and the parity suite asserts it is the
only divergence between the targets, so a second unrepresentable asset fails the build instead
of disappearing.

## Layout

```
bin/solar-codegen.mjs      the CLI
src/normalize/             css-contract.json -> the DTCG spec, solar-icons/ -> the icon spec,
                           the SVG reader, and the recorded deviations
src/emit/                  one file per emitter, plus the shared manifest and canonical values
src/report/                spec/deviations.md
src/util/                  paths, the docs/ write guard, deterministic sorting
test/                      unit suites per module, plus token parity across four targets and
                           icon parity across three
```

## Changing it

- **A value is wrong in every target** → the normalizer, `src/normalize/`.
- **A value is wrong in one target** → that emitter, `src/emit/`.
- **Figma itself is wrong** → add a rule to `src/normalize/deviations.mjs` so it is applied
  consistently and reported to SOLAR governance in `spec/deviations.md`. Do not edit `docs/`.
- **A new token appeared in Figma** → nothing here; re-run `npm run solar:tokens`, and the
  normalizer picks it up. An unknown token _type_ fails loudly rather than guessing.
- **A new icon appeared in Figma** → nothing here either; re-run `npm run solar:icons`, and
  `src/normalize/icons.mjs` picks it up. An SVG feature the IR cannot represent — a gradient, a
  stroke, an arc — fails naming the file rather than being quietly dropped.

Everything generated is committed, and CI regenerates it and fails on any difference, so run
`npm run solar:codegen` and commit the result after touching this package.

Generator code is ESM `.mjs` with no build step. Run the suites with `npx vitest run` from here
or from the repository root.
