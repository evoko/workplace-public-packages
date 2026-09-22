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
| Every **icon** file | `<svg>` + `<path>` only. No groups, masks, clip paths, strokes, gradients or opacity |
| Path commands | `M C L H V Z` only, all absolute, none implicitly repeated. **No arcs.** Numbers may use `1e-05` form |
| Colour | one, `#111111`, on every icon path |
| `fill-rule="evenodd"` | 75 paths, always paired with a redundant `clip-rule` that can be ignored |
| viewBox | `0 0 24 24` everywhere except `zone` outline, which is `0 0 24 25` |
| Logos | 5 SVG and 5 raster PNG. `google`, `microsoft` and both `biamp-logo` files are plain multi-colour paths |
| **`teams.svg` is the outlier** | 13 paths, 12 of them filled by `url(#…)` referencing 11 radial and 1 linear gradient with 27 stops, plus all 7 `fill-opacity` attributes in the whole set. It is the only file the vector IR cannot represent |

The uniformity of the **icons** is what makes a dependency-free Flutter path worth taking. If an
arc or a gradient appears there later, the parser must fail loudly rather than render something
subtly wrong.

`teams.svg` is a genuine exception and needs its own decision in Task 5, not a silent workaround.
Modelling radial gradients with focal points, `gradientTransform` matrices and 27 stops in a Dart
painter is disproportionate work for one third-party brand mark. React renders it as-is, because
JSX mirrors SVG and gradients cost nothing there; the open question is only what Flutter does.

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

### Task 1: Parse SVG into the icon IR — done

A parser narrow enough to reject anything it does not fully understand. It accepts `<svg>` with
a `viewBox` and one or more `<path>`, and nothing else: an unexpected element, a stroke, a
gradient or an unsupported path command is an error naming the file, not a silent omission.

**Files:**

- Created: `packages/codegen/src/normalize/svg.mjs`
- Created: `packages/codegen/test/svg.test.mjs`

Exports `parseSvg(source, {file})` returning `{viewBox: [x, y, w, h], paths: [{d, fillRule, fill}]}`,
plus `SUPPORTED_COMMANDS` and `checkPathData(d, {file})`, which scans a `d` string and throws on
any command outside `M C L H V Z`, so the no-arcs finding is enforced rather than remembered.

**`fill` layering.** The parser holds no SOLAR policy: it is a plain SVG-to-IR reader, so `fill`
is a lowercased `#rrggbb` string whenever the path names a colour — **including `#111111`** — and
`null` only when the attribute is `currentColor` or absent. Collapsing `#111111` to "inherited" is
the SOLAR rule that an icon takes its colour from `color.icon.*`, and it belongs to Task 2's
normalizer, which knows which files are icons and which are logos. `fillRule` is `'evenodd'` or
`'nonzero'`, the default when the attribute is absent; `clip-rule` is dropped, since it only takes
effect inside a `<clipPath>` and in this corpus is always an `evenodd` duplicate of `fill-rule`.

Named colours are limited to `white` and `black`, the only two the corpus uses; any other keyword
throws rather than being guessed at. `#rgb` shorthand is expanded. `fill="none"` on a path throws —
it is the root's chrome, never a path's colour — and the root's own `fill` is never read.

```js
/**
 * A deliberately narrow SVG reader for the icon IR.
 *
 * It understands `<svg>` with a `viewBox` holding one or more `<path>`, and nothing else.
 * Anything it cannot represent -- a group, a stroke, a gradient, an opacity, an arc -- is an
 * error naming the file, because the Flutter target re-draws this geometry by hand and a
 * silently dropped attribute would ship as a subtly wrong icon that no test would catch.
 *
 * It is a pure SVG-to-IR reader and holds no SOLAR policy: a path that names a colour gets that
 * colour, including `#111111`. Deciding that an icon's colour is inherited belongs to the
 * normalizer that knows which files are icons and which are logos.
 */

/**
 * The path commands the IR can represent. Absolute only: the whole corpus is absolute today,
 * and a relative command would shift the geometry of every later subpath if a target replayed
 * it as absolute.
 */
export const SUPPORTED_COMMANDS = new Set(['M', 'L', 'C', 'H', 'V', 'Z']);

/**
 * How many numbers each command consumes. A command may repeat its arguments -- `H1 2` is two
 * horizontal linetos -- so a run is well formed when its count is a positive multiple of this,
 * which is what separates a legal repeat from a truncated `C1 2 3`.
 */
const ARITY = { M: 2, L: 2, C: 6, H: 1, V: 1, Z: 0 };

// Only the keywords the corpus actually uses. Guessing at the rest of the CSS colour list would
// mean inventing brand colours for logos, which is exactly the kind of quiet error this parser
// exists to prevent.
const NAMED_COLORS = { white: '#ffffff', black: '#000000' };

const TAG = /<(\/?)([a-zA-Z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const ATTR = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

// Sticky, so the scan can report the exact character it could not read rather than skipping it.
const NUMBER = /[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/y;
const LETTER = /[a-zA-Z]/y;
const SEPARATOR = /[\s,]+/y;

function fail(file, detail) {
  throw new Error(`${file}: ${detail}`);
}

function parseAttrs(text) {
  const attrs = {};
  for (const m of text.matchAll(ATTR)) attrs[m[1]] = m[2] ?? m[3];
  return attrs;
}

/**
 * Scans a `d` string and throws on anything outside `M L C H V Z`.
 *
 * It validates without rewriting: the `d` the caller holds reaches every target byte for byte,
 * so parity between React and Flutter is a property of the data rather than of two formatters
 * agreeing.
 */
export function checkPathData(d, { file }) {
  const text = String(d).trim();
  if (text === '') fail(file, 'path has an empty d attribute');

  let at = 0;
  let first = true;
  let command = null;
  let count = 0;

  // Checked when the run ends rather than per number, because only the total distinguishes a
  // legal repeat from a truncated command.
  const endRun = () => {
    if (command === null) return;
    const need = ARITY[command];
    if (need === 0 ? count !== 0 : count === 0 || count % need !== 0)
      fail(
        file,
        `"${command}" takes ${need} argument${need === 1 ? '' : 's'} but was given ${count}`,
      );
  };

  while (at < text.length) {
    NUMBER.lastIndex = at;
    const number = NUMBER.exec(text);
    if (number) {
      if (first)
        fail(file, `path data starts with "${number[0]}", not a moveto`);
      count += 1;
      at = NUMBER.lastIndex;
      continue;
    }

    LETTER.lastIndex = at;
    const letter = LETTER.exec(text);
    if (letter) {
      const next = letter[0];
      if (!SUPPORTED_COMMANDS.has(next)) {
        const why = SUPPORTED_COMMANDS.has(next.toUpperCase())
          ? `relative path command "${next}"`
          : `unsupported path command "${next}"`;
        fail(
          file,
          `${why} in path data; only ${[...SUPPORTED_COMMANDS].join(' ')} are supported`,
        );
      }
      if (first && next !== 'M')
        fail(file, `path data starts with "${next}", not a moveto`);
      endRun();
      first = false;
      command = next;
      count = 0;
      at = LETTER.lastIndex;
      continue;
    }

    SEPARATOR.lastIndex = at;
    const separator = SEPARATOR.exec(text);
    if (separator) {
      at = SEPARATOR.lastIndex;
      continue;
    }

    fail(
      file,
      `unreadable character "${text[at]}" in path data at offset ${at}`,
    );
  }
  endRun();
}

function readViewBox(value, file) {
  if (value === undefined) fail(file, '<svg> has no viewBox');
  const parts = value.trim().split(/[\s,]+/);
  const numbers = parts.map(Number);
  if (parts.length !== 4 || numbers.some((n) => !Number.isFinite(n)))
    fail(file, `malformed viewBox "${value}"; expected four numbers`);
  if (numbers[2] <= 0 || numbers[3] <= 0)
    fail(
      file,
      `malformed viewBox "${value}"; width and height must be positive`,
    );
  return numbers;
}

function readFillRule(value, file) {
  if (value === undefined) return 'nonzero';
  if (value === 'evenodd' || value === 'nonzero') return value;
  fail(file, `unsupported fill-rule "${value}"`);
}

function readFill(value, file) {
  if (value === undefined) return null;
  const text = value.trim().toLowerCase();
  if (text === 'currentcolor') return null;
  if (text.startsWith('url('))
    fail(
      file,
      `path is filled by a reference (${value}); gradients and patterns cannot be represented`,
    );
  if (text === 'none')
    fail(
      file,
      'path has fill="none" and would draw nothing; the IR carries filled paths only',
    );
  if (text in NAMED_COLORS) return NAMED_COLORS[text];
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(text);
  if (!hex)
    fail(
      file,
      `unsupported fill "${value}"; expected #rgb, #rrggbb, currentColor, or a known colour keyword`,
    );
  const digits = hex[1];
  return digits.length === 3
    ? `#${[...digits].map((c) => c + c).join('')}`
    : `#${digits}`;
}

function readPath(attrs, file) {
  for (const [name, value] of Object.entries(attrs)) {
    if (name === 'stroke' || name.startsWith('stroke-'))
      fail(
        file,
        `path carries ${name}="${value}"; the IR fills paths, it never strokes them`,
      );
    if (name === 'fill-opacity')
      fail(
        file,
        `path carries fill-opacity="${value}"; the IR has no opacity channel`,
      );
  }
  if (attrs.d === undefined) fail(file, 'path has no d attribute');
  checkPathData(attrs.d, { file });
  // clip-rule is deliberately dropped. It only takes effect on a path used inside a <clipPath>,
  // and none of these are; in this corpus it is always evenodd beside an identical fill-rule.
  return {
    d: attrs.d,
    fillRule: readFillRule(attrs['fill-rule'], file),
    fill: readFill(attrs.fill, file),
  };
}

/**
 * @param {string} source
 * @param {{file: string}} context the path reported in every error message
 * @returns {{viewBox: number[], paths: {d: string, fillRule: string, fill: string | null}[]}}
 */
export function parseSvg(source, { file }) {
  // Comments are stripped first so that markup quoted inside one is never read as geometry.
  const text = source.replace(/<!--[\s\S]*?-->/g, '');
  let viewBox = null;
  const paths = [];

  for (const [, closing, name, attrText] of text.matchAll(TAG)) {
    if (name === 'svg') {
      if (closing) continue;
      if (viewBox) fail(file, 'more than one <svg> element');
      // The root's own fill is chrome -- Figma writes fill="none" on every export -- and must
      // never be inherited into a path, which is why only the viewBox is read here.
      viewBox = readViewBox(parseAttrs(attrText).viewBox, file);
      continue;
    }
    if (!viewBox) fail(file, `<${name}> appears before the root <svg>`);
    if (name !== 'path')
      fail(
        file,
        `unsupported element <${name}>; only <svg> and <path> can be represented`,
      );
    if (closing) continue;
    paths.push(readPath(parseAttrs(attrText), file));
  }

  if (!viewBox) fail(file, 'no <svg> root element');
  if (paths.length === 0) fail(file, 'no <path> elements');
  return { viewBox, paths };
}
```

**Tests (26, all passing).** Real files from `docs/solar-icons/` for the accepting cases, inline
synthetic documents for the rejections: a single-path icon (`chevron-right`); an `evenodd` path
whose `clip-rule` does not survive; a four-colour logo (`os-logo/google`); the named colours in
both `biamp-logo` files; the `0 0 24 25` and `0 0 36 12` viewBoxes; scientific-notation `d` data
round-tripping verbatim; `#rgb` expansion; `currentColor` and an absent fill as `null`; and a
rejection each for an arc command, a relative command, a `<g>`, a `<defs>`, a `stroke`, a
`stroke-width`, a gradient fill, a `fill-opacity`, a missing viewBox, a short viewBox, a
zero-extent viewBox, an unknown colour keyword, `fill="none"`, an unsupported `fill-rule` and an
empty document.

The last block is the one that matters: it walks all 686 SVG files under `docs/solar-icons/svg/`
and `docs/solar-icons/logos/` and asserts the measured totals — 824 `<path>` elements in the
files, 685 files parsed, `logos/os-logo/teams.svg` the only failure (and failing on its first
gradient fill), 811 paths in the parsed set, 75 of them `evenodd`, every fill either `null` or
`#rrggbb`, every viewBox four numbers with a positive extent. That is what proves the parser
matches the corpus rather than the prose describing it.

Run: `npx vitest run packages/codegen/test/svg.test.mjs`

The repository owner commits `packages/codegen/src/normalize/svg.mjs` and
`packages/codegen/test/svg.test.mjs`.

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

### Task 5: Logo emitter for React, and what Flutter does about `teams.svg`

**Files:**

- Create: `packages/codegen/src/emit/react-logos.mjs`
- Create: `packages/codegen/test/react-logos.test.mjs`

`LogoBiamp` and `LogoOs` take a `variant` prop (`light-sm | dark-sm`, `microsoft | google | teams`)
and render fixed `fill` values. `teams` additionally carries its `<defs>` gradients verbatim,
which React handles natively; its ids must be made unique per instance so two Teams logos on one
page cannot collide. Flutter cannot represent it as a vector path, so decide there between
shipping it as a raster asset or dropping the Teams variant on that platform — either way it is
a recorded deviation, never a silently different logo. They deliberately do **not** accept `color`: a tinted brand mark
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
