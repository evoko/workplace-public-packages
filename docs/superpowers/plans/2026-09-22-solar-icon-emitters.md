# Milestone 2 — SOLAR icons and logos as code

Emits the 341 SOLAR icon sets and 3 logo sets from `docs/solar-icons/` into React components in
`@bwp-web/assets`, Dart in `solar_flutter`, and raw SVG, with a parity suite proving the two
targets carry the same geometry.

Design: [the docs-to-code spec](../specs/2026-09-21-solar-docs-to-code-design.md), milestone 2.
It proves the asset pipeline, `currentColor`, naming and tree-shaking.

Milestone 1 (tokens, four targets, parity) is complete and its plan is
[2026-09-21-solar-token-emitters.md](2026-09-21-solar-token-emitters.md). This milestone reuses
its machinery: the `writeGenerated` guard, the manifest/parity pattern, `byCodeUnit`, the
`solar:codegen` CLI and the deviations report.

## What the source data actually is

Measured, not assumed:

| | |
| --- | --- |
| 341 icon sets | 681 SVG files: 340 outline, 341 solid |
| 451 KB total | 358 KB of it path data; median 348 B per file |
| Every file | `<svg>` + `<path>` only. No groups, masks, clip paths, strokes or gradients |
| Path commands | `M C L H V Z` only, all absolute. **No arcs.** Numbers may use `1e-05` form |
| Colour | one, `#111111`, on every icon path |
| `fill-rule="evenodd"` | 75 paths. Dropping it renders those icons as filled blobs |
| viewBox | `0 0 24 24` everywhere except `zone` outline, which is `0 0 24 25` |
| Logos | same structure, but **per-path brand colours**; 5 SVG and 5 raster PNG |

The uniformity is what makes a dependency-free Flutter path worth taking. If arcs or gradients
appeared later the parser must fail loudly rather than render something subtly wrong.

## Decisions taken

| Question | Decision |
| --- | --- |
| How does Flutter render an icon? | SVG path data as Dart string constants, parsed by a small generated parser. Viable because there are no arcs. Keeps `solar_flutter` dependency free, tree-shakes per icon, and the path data is byte-identical to what React ships, so parity is provable rather than asserted. |
| `IconPhone` collides (Communication and Audio & DSP) | The Audio & DSP one becomes `IconPhoneAudioDsp`, matching the `phone--audio-dsp` file stem the extractor already chose. Recorded as a deviation for SOLAR governance. |
| Logos | Generated, but under their own export, never tintable. The raster app icons ship as files, not components. |
| One representation for both | Every asset is `{viewBox, paths: [{d, fillRule, fill?}]}`. `fill` absent means inherit (`currentColor` in SVG, the widget's colour in Flutter); present means a fixed brand colour. Icons never carry `fill`, logos always do. |

## Notes for whoever executes this

- **The repository owner handles all version control.** An agent executing this plan must not run
  any git write command. Commit steps are written as prose for the owner.
- `docs/` is read-only to the generator (spec invariant 1). `writeGenerated` enforces it.
- Latest stable versions for any new dependency, with the same caps as milestone 1: TypeScript
  6.x, ESLint 9.x, `flutter_lints` 5.x. Node 22, Flutter pinned to 3.24.4 in CI.
- Run `npm run solar:codegen` and commit its output after touching the generator.

---

### Task 1: Parse SVG into the icon IR

A parser narrow enough to reject anything it does not fully understand. It accepts `<svg>` with
a `viewBox` and one or more `<path>`, and nothing else: an unexpected element, a stroke, a
gradient or an unsupported path command is an error naming the file, not a silent omission.

**Files:**

- Create: `packages/codegen/src/normalize/svg.mjs`
- Create: `packages/codegen/test/svg.test.mjs`

Exports `parseSvg(source, {file})` returning `{viewBox: [x, y, w, h], paths: [{d, fillRule, fill}]}`,
where `fill` is `null` for `currentColor`/`#111111` and a lowercased hex string otherwise, and
`fillRule` is `'evenodd'` or `'nonzero'`. Also exports `SUPPORTED_COMMANDS` and a `checkPathData`
that scans a `d` string and throws on any command outside `M C L H V Z`, so the no-arcs finding
is enforced rather than remembered.

Tests must cover: a single-path icon; an `evenodd` path; a multi-path logo with per-path colours;
the `0 0 24 25` viewBox; a named colour (`white`); scientific-notation numbers; and a rejection
each for an arc command, a `<g>`, a stroke and a gradient.

Run: `npx vitest run packages/codegen/test/svg.test.mjs`

---

### Task 2: Normalize every icon and logo into `spec/icons.json`

**Files:**

- Create: `packages/codegen/src/normalize/icons.mjs`
- Create: `packages/codegen/test/icons.test.mjs`
- Modify: `packages/codegen/src/normalize/deviations.mjs`

`buildIconSpec(catalog)` reads `docs/solar-icons/catalog.json` and the SVG files beside it and
returns `{spec, deviations}` shaped as:

```json
{
  "icons": {
    "chevron-right": {
      "component": "IconChevronRight",
      "name": "Chevron right",
      "category": "Navigation",
      "description": "Chevron right. Related: next, forward, caret, drill in, expand",
      "variants": {
        "outline": { "viewBox": [0, 0, 24, 24], "paths": [{ "d": "…", "fillRule": "nonzero" }] },
        "solid": { "viewBox": [0, 0, 24, 24], "paths": [{ "d": "…", "fillRule": "nonzero" }] }
      }
    }
  },
  "logos": {
    "biamp-logo": {
      "component": "LogoBiamp",
      "raster": false,
      "variants": {
        "light-sm": {
          "viewBox": [0, 0, 36, 12],
          "paths": [{ "d": "…", "fillRule": "nonzero", "fill": "#d22730" }]
        }
      }
    },
    "app-icon": { "raster": true, "files": { "workplace": "app-icon/workplace@2x.png" } }
  }
}
```

Three deviations are added to `DEVIATIONS` so they reach `spec/deviations.md` rather than living
as comments:

| Token | Why we differ |
| --- | --- |
| `icon.phone` | Two Figma components are both named `Icon/Phone`. The Audio & DSP one is emitted as `IconPhoneAudioDsp`. Ask SOLAR to rename one. |
| `icon.support` | Figma has two solid variants and no outline. `outline` falls back to `solid`, so the component still renders. Ask SOLAR to supply the outline. |
| `icon.zone` | Its outline viewBox is `0 0 24 25`, so the icon is 1px taller than the grid. The viewBox is carried verbatim rather than cropped. Ask SOLAR to redraw on the 24 grid. |

Tests: all 341 icons present; 340 have both variants and `support` has `outline === solid` with a
deviation recorded; the two Phone icons have distinct component names; `zone` keeps its viewBox;
every icon path has no `fill`; every logo path has one; the raster set carries files, not paths.

Run: `npx vitest run packages/codegen/test/icons.test.mjs`

---

### Task 3: React icon emitter

**Files:**

- Create: `packages/codegen/src/emit/react-icons.mjs`
- Create: `packages/codegen/test/react-icons.test.mjs`

Writes `packages/assets/src/generated/icons/` — one module per icon so bundlers drop what is not
imported — plus a barrel `index.ts`, a shared `Icon.tsx` shell, and `tokens.manifest.json`.

The shell is hand-shaped, not generated per icon:

```tsx
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** A SOLAR icon.* step, or any CSS length. Defaults to lg (24px). */
  size?: IconSize | (string & {}) | number;
  variant?: 'outline' | 'solid';
  /** Accessible name. Without it the icon is aria-hidden. */
  title?: string;
}
```

Rules the tests must hold:

- `fill="currentColor"` on every path, so `color: var(--solar-color-icon-primary)` tints it. No
  `#111111` survives anywhere in the output.
- `size` maps a token step to `var(--solar-icon-lg)`, never a hard-coded px, so it traces to a
  token. A number or string passes through.
- `viewBox` comes from the spec per variant, so `zone` stays correct.
- `fillRule` is emitted as React's `fillRule` prop wherever the source had `evenodd`.
- `title` renders `<title>` and wires `aria-labelledby`; without it, `aria-hidden="true"` and
  `focusable="false"`.
- The barrel is sorted with `byCodeUnit` and exports 341 icons and no duplicate name.

Run: `npx vitest run packages/codegen/test/react-icons.test.mjs`

---

### Task 4: Raw SVG output

**Files:**

- Create: `packages/codegen/src/emit/svg-files.mjs`
- Create: `packages/codegen/test/svg-files.test.mjs`

The spec promises "plus raw SVG". Writes `packages/assets/src/generated/svg/<name>-<variant>.svg`
rewritten to `currentColor`, for consumers using `<img>`, a sprite or a CSS mask. Logos keep
their own colours. The build copies the directory into `dist` and `package.json` exposes
`./svg/*`, the same shape as the `./tokens.css` export in `@bwp-web/styles`.

Tests: file count is 681 + 5; no `#111111` remains in an icon; a logo's brand colours are intact;
each file re-parses with `parseSvg` to the same IR it came from, which is the round trip.

---

### Task 5: Logo emitter for React

**Files:**

- Create: `packages/codegen/src/emit/react-logos.mjs`
- Create: `packages/codegen/test/react-logos.test.mjs`

`LogoBiamp` and `LogoOs` take a `variant` prop (`light-sm | dark-sm`, `microsoft | google | teams`)
and render fixed `fill` values. They deliberately do **not** accept `color`: a tinted brand mark
is a brand violation, and the type system should say so. The raster app icons are exported as
URLs, not components.

Tests: no `currentColor` anywhere in a logo; every brand colour from the source survives; the
app-icon export is a record of paths to `.png` files.

---

### Task 6: The Dart path parser

**Files:**

- Create: `packages/codegen/src/emit/flutter-svg-path.mjs` (emits the parser)
- Create: `packages/solar_flutter/test/svg_path_test.dart`

Generates `lib/src/generated/svg_path.dart`: `Path parseSvgPath(String d)` handling `M C L H V Z`
absolutely, with a number scanner that accepts `1e-05`. Anything else throws `FormatException`
naming the command, so a future arc fails loudly on the Dart side too.

It is generated rather than hand-written so its supported command set cannot drift from the
validator in Task 1; both read `SUPPORTED_COMMANDS`.

Dart tests: a line, a cubic, `H`/`V` shorthands, `Z` closing, scientific notation, and a
`FormatException` for `A`. Also an implicit repeated command (`L 1 2 3 4` meaning two line-tos):
it appears nowhere in today's 686 files — every command carries exactly its argument count — but
it is valid SVG, so the parser supports it and the test for it is synthetic rather than drawn
from the data.

Run: `cd packages/solar_flutter && flutter test test/svg_path_test.dart`

---

### Task 7: Flutter icon and logo emitter

**Files:**

- Create: `packages/codegen/src/emit/flutter-icons.mjs`
- Create: `packages/codegen/test/flutter-icons.test.mjs`
- Create: `packages/solar_flutter/test/icons_test.dart`

Writes `lib/src/generated/icons.dart` and `logos.dart`:

```dart
@immutable
class SolarVectorPath {
  const SolarVectorPath(this.d, {this.evenOdd = false, this.fill});
  final String d;
  final bool evenOdd;
  /// Null means the widget's colour, matching currentColor on the web.
  final Color? fill;
}

@immutable
class SolarVector {
  const SolarVector({required this.width, required this.height, required this.paths});
  final double width;
  final double height;
  final List<SolarVectorPath> paths;
}
```

One top-level `const` per icon variant so Dart's tree shaker can drop the rest, named
`chevronRightOutline` / `chevronRightSolid`, grouped in `SolarIcons` for discovery. A
`SolarIcon` widget paints them through a `CustomPainter`, taking `size` (defaulting to
`SolarIconSize.lg` from the token package) and `color` (defaulting to the ambient
`SolarTheme.colors.iconPrimary`).

Tests, both sides: the path data string for a given icon is byte-identical to the spec; the
widget paints without throwing for every one of the 681 variants; `evenOdd` reaches the `Path`;
a logo renders its own colours and ignores the `color` argument.

---

### Task 8: Icon parity

**Files:**

- Create: `packages/codegen/test/icon-parity.test.mjs`

The same argument as token parity: the two targets are independent emitters, so something must
prove they agree. For every icon and variant, React and Flutter must carry identical path data,
viewBox and fill rule, and both must match `spec/icons.json`. As in milestone 1, the assertion
reads the **artifacts** — the generated TSX and Dart — not only the manifests, because a manifest
is a claim about the output.

It must also assert the thing that makes icons different from tokens: **no icon carries a
colour**. A `#111111` anywhere in generated icon code is a failure; only logos may name colours.

---

### Task 9: CLI and package wiring

**Files:**

- Modify: `packages/codegen/bin/solar-codegen.mjs`
- Modify: `packages/assets/src/index.ts`, `packages/assets/package.json`
- Modify: `packages/solar_flutter/lib/solar_flutter.dart`

`solar:codegen` gains the icon stage: write `spec/icons.json`, then the React, SVG and Flutter
emitters, and fold the icon deviations into the one report. The summary line grows an icon count.

`@bwp-web/assets` exports the icon barrel, the logo components and `./svg/*`; its build copies
the SVG directory into `dist` the way `@bwp-web/styles` copies `tokens.css`.

Run: `npm run solar:codegen` twice and compare a content hash of every generated file.
Expected: identical, and nothing written under `docs/`.

---

### Task 10: CI and documentation

**Files:**

- Modify: `.github/workflows/solar.yml` (only if the icon stage needs its own step)
- Modify: `docs/README.md`, `CLAUDE.md`, `packages/codegen/README.md`
- Create: `packages/assets/README.md`

The existing `codegen` job already regenerates everything and fails on a difference, so icons are
covered by construction; check that the job's runtime is still reasonable with 681 files.

Documentation must say: how to use an icon in React and in Flutter, that icons take their colour
from `color.icon.*` through `currentColor` while logos never do, that sizes come from `icon.*`,
and that the three source defects are recorded in `spec/deviations.md` rather than patched in
`docs/`.

---

## Done when

- `npm run solar:codegen` emits icons for both targets, is deterministic, and writes nothing
  under `docs/`.
- A React app can `import { IconChevronRight } from '@bwp-web/assets'` and tint it by setting
  `color`; a Flutter app can use `SolarIcon(SolarIcons.chevronRightOutline)` and get the same
  shape.
- The icon parity suite proves the two carry identical geometry for all 681 variants.
- `flutter analyze` and `flutter test` pass, and the npm build, lint, typecheck and format pass.
- The three source defects appear in `spec/deviations.md` with an action for SOLAR.
