# @bwp-web/codegen

Turns the SOLAR design system in [`docs/`](../../docs/README.md) into code. Private to this
repository: it is a build tool, not something we publish.

One command does everything:

```bash
npm run solar:codegen
```

It reads the committed Figma data, writes `spec/tokens.json`, and emits four targets from it. It
needs no Figma token and no network.

## The one invariant

**The generator never writes to `docs/`.** `docs/` mirrors Figma; if generated code looks wrong,
the fix belongs in this package, never in the mirror. Every write goes through
[`writeGenerated`](src/util/write.mjs), which refuses a path under `docs/` outright, and CI
re-checks it after each run. This is invariant 1 of
[the design spec](../../docs/superpowers/specs/2026-09-21-solar-docs-to-code-design.md).

## What it produces

`spec/tokens.json` is the contract: 710 tokens in [DTCG](https://tr.designtokens.org/) format —
647 variables, 9 shadows, 47 text styles and the 7-level z-index ladder. Modes live under
`$extensions["com.biamp.solar"].modes`. Everything downstream is generated from this one file,
and `spec/deviations.md` lists the 13 places the code deliberately differs from what Figma says.

| Target     | Output                                                 | Covers                                                      |
| ---------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| `css`      | `packages/styles/src/generated/css/tokens.css`         | 663 — everything except the typography composites           |
| `mui`      | `packages/styles/src/generated/mui/theme.ts`           | 710                                                         |
| `tailwind` | `packages/styles/src/generated/tailwind/preset.ts`     | 371 — the semantic layer, plus `motion.*` and font families |
| `flutter`  | `packages/solar_flutter/lib/src/generated/tokens.dart` | 710                                                         |

The four are independent emitters reading one normalized spec. They are **not** transpiled from
each other: a Dart file is not a translation of a stylesheet, and pretending otherwise is how
the two drift apart.

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

## Layout

```
bin/solar-codegen.mjs      the CLI
src/normalize/             css-contract.json -> the DTCG spec, and the recorded deviations
src/emit/                  one file per target, plus the shared manifest and canonical values
src/report/                spec/deviations.md
src/util/                  paths, the docs/ write guard, deterministic sorting
test/                      unit suites per module, plus parity across the four targets
```

## Changing it

- **A value is wrong in every target** → the normalizer, `src/normalize/`.
- **A value is wrong in one target** → that emitter, `src/emit/`.
- **Figma itself is wrong** → add a rule to `src/normalize/deviations.mjs` so it is applied
  consistently and reported to SOLAR governance in `spec/deviations.md`. Do not edit `docs/`.
- **A new token appeared in Figma** → nothing here; re-run `npm run solar:tokens`, and the
  normalizer picks it up. An unknown token _type_ fails loudly rather than guessing.

Everything generated is committed, and CI regenerates it and fails on any difference, so run
`npm run solar:codegen` and commit the result after touching this package.

Generator code is ESM `.mjs` with no build step. Run the suites with `npx vitest run` from here
or from the repository root.
