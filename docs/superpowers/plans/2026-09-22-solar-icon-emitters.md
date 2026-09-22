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

Measured, not assumed. Re-measured on 2026-09-22, after SOLAR shipped the missing `support`
outline and redrew `zone` on the 24 grid; the two rows that changed say so:

| | |
| --- | --- |
| 341 icon sets | 682 SVG files: 341 outline, 341 solid (340 outlines until `support` gained its own on 2026-09-22) |
| 452 KB total | 358 KB of it path data; median 348 B per file |
| Every **icon** file | `<svg>` + `<path>` only. No groups, masks, clip paths, strokes, gradients or opacity |
| Path commands | `M C L H V Z` only, all absolute, none implicitly repeated. **No arcs.** Numbers may use `1e-05` form |
| Colour | one, `#111111`, on every icon path |
| `fill-rule="evenodd"` | 75 paths, always paired with a redundant `clip-rule` that can be ignored |
| viewBox | `0 0 24 24` on every icon. `zone` outline was `0 0 24 25` until SOLAR redrew it on 2026-09-22; the code still carries a viewBox per variant, because a constant would crop the next one silently |
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

**Tests (29, all passing).** Real files from `docs/solar-icons/` for the accepting cases, inline
synthetic documents for the rejections: a single-path icon (`chevron-right`); an `evenodd` path
whose `clip-rule` does not survive; a four-colour logo (`os-logo/google`); the named colours in
both `biamp-logo` files; a synthetic `0 0 24 25` document and the logos' real `0 0 36 12` viewBox,
since no icon is off the grid since 2026-09-22; scientific-notation `d` data
round-tripping verbatim; `#rgb` expansion; `currentColor` and an absent fill as `null`; and a
rejection each for an arc command, a relative command, a `<g>`, a `<defs>`, a `stroke`, a
`stroke-width`, a gradient fill, a `fill-opacity`, a missing viewBox, a short viewBox, a
zero-extent viewBox, an unknown colour keyword, `fill="none"`, an unsupported `fill-rule` and an
empty document.

The last block is the one that matters: it walks all 687 SVG files under `docs/solar-icons/svg/`
and `docs/solar-icons/logos/` and asserts the measured totals — 825 `<path>` elements in the
files, 686 files parsed, `logos/os-logo/teams.svg` the only failure (and failing on its first
gradient fill), 812 paths in the parsed set, 75 of them `evenodd`, every fill either `null` or
`#rrggbb`, every viewBox four numbers with a positive extent, and all 682 icon files on
`0 0 24 24`. That is what proves the parser matches the corpus rather than the prose describing
it.

Run: `npx vitest run packages/codegen/test/svg.test.mjs`

The repository owner commits `packages/codegen/src/normalize/svg.mjs` and
`packages/codegen/test/svg.test.mjs`.

---

### Task 2: Normalize every icon and logo into the icon spec — done

**Files:**

- Created: `packages/codegen/src/normalize/icons.mjs`
- Created: `packages/codegen/test/icons.test.mjs`
- Modified: `packages/codegen/src/normalize/deviations.mjs`

`loadIconCatalog()` reads `docs/solar-icons/catalog.json`; `buildIconSpec(catalog)` reads the SVG
files beside it and returns `{spec, deviations}`. It returns data and writes nothing: `spec/icons.json`
is written by the CLI in task 9, so nothing here can reach into `spec/` or `docs/`.

```json
{
  "icons": {
    "chevron-right": {
      "component": "IconChevronRight",
      "name": "ChevronRight",
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
      "name": "Biamp Logo",
      "prop": "variant",
      "raster": false,
      "variants": {
        "light-sm": {
          "viewBox": [0, 0, 36, 12],
          "paths": [{ "d": "…", "fillRule": "nonzero", "fill": "#d22730" }]
        }
      }
    },
    "os-logo": {
      "component": "LogoOs",
      "prop": "logo",
      "raster": false,
      "variants": { "teams": { "unsupported": "gradient", "source": "<svg …>" } }
    },
    "app-icon": {
      "component": "LogoAppIcon",
      "prop": "app",
      "raster": true,
      "files": { "workplace": "logos/app-icon/workplace@2x.png" }
    }
  }
}
```

Icons are keyed by `fileStem`, which is unique across all 341; `kebab` is not, because two Figma
components are both named `Icon/Phone`. Logos are keyed by their set's kebab and their variants by
the file's slug, with the raster density (`@2x`) stripped. `prop` is the Figma property the variant
is chosen by — one shared property becomes that property's name, and `biamp-logo`, which crosses
`style` with `size`, becomes `variant`, matching the one slug its files are named by.

**The policy this file owns.** Task 1's parser is deliberately policy-free, so the SOLAR rules land
here:

- **An icon's colour is inherited.** Every icon path in the corpus is `#111111`. That is asserted
  and the fill dropped, so an icon path carries only `{d, fillRule}` and `currentColor` is safe. A
  differently coloured icon path throws naming the file: it is a governance question, not something
  to normalize away.
- **A logo's colour is its own.** Every logo path keeps its `fill`, and an inherited one is an error.
- **Component names come from the file stem**, never from `catalog.component`, which is not unique.
  The catalog name is consulted only for its letters' case, and only when it spells the same name —
  the stem is lowercase, so `usb` alone cannot know it is `IconUSB`. That keeps `IconUSB`,
  `IconIODevice`, `IconUIBuilder` and `IconUIOnly` as SOLAR spells them while the Audio & DSP phone
  still becomes `IconPhoneAudioDsp`. All 341 names are asserted unique at the end.
- **A set with no outline falls back to its solid**, so the component still renders. `support` was
  that set — two solid variants and no outline — until SOLAR drew the missing outline on
  2026-09-22, and every one of the 341 sets now draws both variants from its own file. The fallback
  stays, and is now covered by a hand-built catalog: it is not the only set whose two variants are
  identical — 80, a chevron or a plus with nothing to fill, are drawn the same in both — so the
  fallback is identified by the missing source file, never by comparing geometry.
- **A viewBox is kept verbatim**, taken from the parsed SVG, and `catalog.size` is used only to
  notice a mismatch. `zone` outline was `0 0 24 25` against a declared `[24, 24]` until SOLAR
  redrew it on the grid on 2026-09-22. Nothing is off grid today; cropping to the declared size
  would shift the drawing, so the comparison and the verbatim carry stay.

**The one unsupported asset.** `logos/os-logo/teams.svg` is 13 paths, 12 filled by `url(#…)` from 11
radial and one linear gradient with 27 stops, plus every `fill-opacity` in the set, so `parseSvg`
throws on it. It is handled by an explicit allowlist, `UNSUPPORTED_VECTORS`, and not by wrapping the
parse in a bare try/catch: swallowing every parse failure would turn the same gradient appearing in
some *other* asset into a silent omission, which is the one failure this pipeline exists to prevent.
A failure for a file on the list becomes `{unsupported: 'gradient', source}`; a failure anywhere else
propagates. The raw SVG **source string** travels in the spec rather than a path, because emitters
read the spec and never reach into `docs/`. React inlines it as JSX in task 5; Flutter decides in
task 7.

**Deviations** are a second export, `ICON_DEVIATIONS`, beside `DEVIATIONS` in
`normalize/deviations.mjs`. `DEVIATIONS` is the lookup `applyDeviation` walks per token value and is
the wrong shape for these, but the record shape is the same `{token, figmaValue, reason, raise}`, so
both sets render as rows of the one `spec/deviations.md` table. `buildIconSpec` returns the ones the
catalog actually triggered, the way `buildTokenSpec` does, and a trigger with no matching entry
throws: a second name collision or a second off-grid viewBox is a new governance question, not
something to fold into an existing row.

| Token | Why we differ |
| --- | --- |
| `icon.phone` | Two Figma components are both named `Icon/Phone`. The Audio & DSP one is emitted as `IconPhoneAudioDsp`. Ask SOLAR to rename one. |
| `icon.support` | **Resolved in Figma on 2026-09-22**, so it is no longer reported. It said: Figma has two solid variants and no outline, `outline` falls back to `solid` so the component still renders, ask SOLAR to supply the outline. The entry stays in `ICON_DEVIATIONS` as the row the fallback looks up if a set arrives without an outline again. |
| `icon.zone` | **Resolved in Figma on 2026-09-22**, so it is no longer reported. It said: the outline viewBox is `0 0 24 25`, 1px taller than the grid, carried verbatim rather than cropped, ask SOLAR to redraw on the 24 grid. The entry stays in `ICON_DEVIATIONS` for the same reason. |
| `logo.os-logo.teams` | Gradient fills and `fill-opacity` cannot be represented as vector paths. It ships as raw SVG. Ask SOLAR whether a flat-colour Teams mark exists. |

```js
/**
 * Turns docs/solar-icons into the icon spec.
 *
 * parseSvg reads SVG; this file holds the SOLAR policy parseSvg deliberately does not: which
 * files are icons and which are logos, and therefore which paths own a colour and which inherit
 * one. An icon is drawn in color/neutral/900 and tinted at use through `color.icon.*`, so its
 * fill is asserted and dropped; a logo is a brand mark, so its fill is kept and a missing one is
 * an error.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { docsDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { ICON_DEVIATIONS } from './deviations.mjs';
import { parseSvg } from './svg.mjs';

const iconsDir = join(docsDir, 'solar-icons');

// The single colour every icon path in the corpus is drawn in. Asserting it rather than
// accepting any colour is what makes dropping the fill safe: a recoloured icon is a governance
// question, not something to normalize away into currentColor.
const ICON_COLOR = '#111111';

/**
 * Assets the vector IR cannot represent, listed one by one on purpose.
 *
 * logos/os-logo/teams.svg is 13 paths, 12 of them filled by `url(#…)` from 11 radial and one
 * linear gradient, plus every `fill-opacity` in the set. It ships as raw SVG instead. Catching
 * parse failures generally would turn the same gradient appearing in some *other* asset into a
 * silent omission, which is the one failure this pipeline exists to prevent, so a failure
 * anywhere else still propagates.
 */
export const UNSUPPORTED_VECTORS = new Set(['logos/os-logo/teams.svg']);

export function loadIconCatalog() {
  return JSON.parse(readFileSync(join(iconsDir, 'catalog.json'), 'utf8'));
}

/**
 * Parses one asset, or records it as unsupported if it is on the allowlist.
 *
 * The raw source travels in the spec rather than a path, because emitters read the spec and
 * never reach into docs/.
 *
 * @param {string} source
 * @param {{file: string}} context the path relative to docs/solar-icons
 */
export function readVector(source, { file }) {
  try {
    return parseSvg(source, { file });
  } catch (error) {
    if (!UNSUPPORTED_VECTORS.has(file)) throw error;
    return { unsupported: 'gradient', source };
  }
}

const loadVector = (file) =>
  readVector(readFileSync(join(iconsDir, file), 'utf8'), { file });

const pascal = (text) =>
  text
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');

/**
 * The component name is derived from the file stem, never taken from the catalog: two Figma
 * components are both named `Icon/Phone`, so `catalog.component` is not unique while the stem
 * is. The catalog name is consulted only for its letters' case, and only when it spells the
 * derived name -- the stem is lowercase, so `usb` alone cannot know it is `IconUSB`.
 */
function componentName(prefix, stem, catalogName) {
  const derived = prefix + pascal(stem);
  return catalogName && catalogName.toLowerCase() === derived.toLowerCase()
    ? catalogName
    : derived;
}

// Basenames carry the raster density (workplace@2x.png); the slug is the variant, not the file.
const slugOf = (file) =>
  file
    .split('/')
    .pop()
    .replace(/(@\d+x)?\.\w+$/, '');

function iconPath(path, file) {
  if (path.fill !== ICON_COLOR)
    throw new Error(
      `${file}: icon path is filled ${path.fill ?? 'by inheritance'}, expected ${ICON_COLOR}; ` +
        'an icon takes its colour from color.icon.*, so a different one is a governance question',
    );
  return { d: path.d, fillRule: path.fillRule };
}

function logoPath(path, file) {
  if (path.fill === null)
    throw new Error(
      `${file}: logo path inherits its fill; a brand mark carries its own colours and is ` +
        'never tinted',
    );
  return { d: path.d, fillRule: path.fillRule, fill: path.fill };
}

function logoProp(group) {
  // One shared prop is the component's prop; biamp-logo crosses style with size, so its two
  // Figma props collapse into the one variant slug the files are named by.
  const keys = [
    ...new Set(group.variants.flatMap((v) => Object.keys(v.props ?? {}))),
  ];
  return keys.length === 1 ? keys[0].toLowerCase() : 'variant';
}

export function buildIconSpec(catalog) {
  const deviations = [];
  const recorded = new Set();
  // Deviations are recorded because the data triggered them, so the report describes the corpus
  // rather than a list someone remembered to update. A trigger with no entry stops the build: a
  // second off-grid viewBox or a second name collision is a new governance question, not
  // something to fold into an existing row.
  const record = (token, trigger) => {
    const known = ICON_DEVIATIONS.find((d) => d.token === token);
    if (!known)
      throw new Error(
        `${trigger} has no recorded deviation for ${token}; add one to ICON_DEVIATIONS ` +
          'and take it to SOLAR governance',
      );
    if (recorded.has(token)) return;
    recorded.add(token);
    deviations.push({ ...known });
  };

  const collisions = new Map();
  for (const icon of catalog.icons) {
    const seen = collisions.get(icon.component);
    if (seen) record(`icon.${seen.kebab}`, `${seen.fileStem}/${icon.fileStem}`);
    else collisions.set(icon.component, icon);
  }

  const icons = {};
  for (const icon of [...catalog.icons].sort((a, b) =>
    byCodeUnit(a.fileStem, b.fileStem),
  )) {
    const variants = {};
    for (const name of ['outline', 'solid']) {
      const source = icon.variants[name];
      if (!source) continue;
      const vector = loadVector(source.file);
      const expected = [0, 0, ...icon.size];
      if (vector.viewBox.some((n, i) => n !== expected[i]))
        record(`icon.${icon.kebab}`, source.file);
      variants[name] = {
        viewBox: vector.viewBox,
        paths: vector.paths.map((p) => iconPath(p, source.file)),
      };
    }

    // A missing variant still has to render, so it falls back to the other one rather than
    // leaving a hole every consumer would have to branch on.
    if (!variants.outline) {
      record(`icon.${icon.kebab}`, `${icon.fileStem} outline`);
      variants.outline = structuredClone(variants.solid);
    }
    if (!variants.solid)
      throw new Error(
        `${icon.fileStem}: has neither a solid nor an outline variant`,
      );

    icons[icon.fileStem] = {
      component: componentName('Icon', icon.fileStem, icon.component),
      name: icon.name,
      category: icon.category,
      description: icon.description,
      variants: { outline: variants.outline, solid: variants.solid },
    };
  }

  const names = new Set(Object.values(icons).map((i) => i.component));
  if (names.size !== Object.keys(icons).length)
    throw new Error(
      `component names are not unique: ${Object.keys(icons).length} icons produced ${names.size} names`,
    );

  const logos = {};
  for (const group of [...catalog.logos].sort((a, b) =>
    byCodeUnit(a.kebab, b.kebab),
  )) {
    const entry = {
      // os-logo and biamp-logo already say "logo"; app-icon does not.
      component: componentName('Logo', group.kebab.replace(/-logo$/, '')),
      name: group.name,
      prop: logoProp(group),
      raster: group.variants.every((v) => v.raster),
    };
    if (group.variants.some((v) => v.raster) !== entry.raster)
      throw new Error(
        `${group.kebab}: mixes raster and vector variants, which need different components`,
      );

    if (entry.raster) {
      entry.files = Object.fromEntries(
        group.variants.map((v) => [slugOf(v.file), v.file]),
      );
    } else {
      entry.variants = {};
      for (const variant of group.variants) {
        const slug = slugOf(variant.file);
        const vector = loadVector(variant.file);
        if (vector.unsupported) {
          record(`logo.${group.kebab}.${slug}`, variant.file);
          entry.variants[slug] = vector;
          continue;
        }
        entry.variants[slug] = {
          viewBox: vector.viewBox,
          paths: vector.paths.map((p) => logoPath(p, variant.file)),
        };
        // Triggered by the existence of a drawable logo rather than by a defect in one: SOLAR
        // has no logo size scale, so every logo component has to borrow the icon ladder.
        record('logo.size', variant.file);
      }
    }
    logos[group.kebab] = entry;
  }

  return { spec: { icons, logos }, deviations };
}
```

**Tests (21, all passing).** The spec is built once at module scope from the real catalog, as
`tokens.test.mjs` does. 341 sets under 341 distinct component names; the catalog metadata beside the
geometry; all 341 outlines drawn from their own file, `support` among them since 2026-09-22 and its
two variants no longer the same drawing; the two Phone components separated; the acronyms kept;
every icon variant on `0 0 24 24`; and — the assertion that proves `currentColor` will work —
every path of every variant of all 341 icons carrying exactly `d` and `fillRule` and no `#111111`
anywhere. Three cases run `buildIconSpec` over catalogs written by hand rather than read from
`docs/`, because the two defects that used to reach those branches are fixed and the branches
must keep working: a set with no outline (its `outline` equal to but not the same object as its
`solid`, recording `icon.support`), a set whose file disagrees with its declared size (the file
wins, recording `icon.zone` once), and a trigger with no registry entry, which throws.

Then the logos: each set named after its Figma prop; every logo
path with a `#rrggbb` fill; Google's four brand colours in order; both Biamp marks resolving `white`
and `black` and differing from each other; Teams as `{unsupported, source}` whose source contains
`radialGradient`; and the app icons as five `.png` files with no paths. A totals block ties the spec
to the measured corpus, and two tests hold the allowlist to being an allowlist: a synthetic gradient
document throws under any other file name, and is recorded only under `logos/os-logo/teams.svg`.

The totals are worth stating exactly. 687 SVG files exist: 682 icon files (341 outline, 341 solid)
and 5 logo files. 686 parse — teams.svg is the exception — carrying 812 paths, 792 of them in icons
and 20 in the four vector logos. The spec holds 682 icon variants and 792 icon paths, which is
exactly what was parsed: until 2026-09-22 it held one variant and one path more, the `support`
outline standing in for its solid.

Run: `npx vitest run packages/codegen/test/icons.test.mjs`

The repository owner commits `packages/codegen/src/normalize/icons.mjs`,
`packages/codegen/test/icons.test.mjs` and the `ICON_DEVIATIONS` export in
`packages/codegen/src/normalize/deviations.mjs`.

---

**Measured, so Task 3 does not rediscover it as a bug:** 81 of the 341 icons are drawn
identically in outline and solid. They have distinct Figma node ids, so it is deliberate, not a
duplication fault. Both targets will therefore carry two identical path sets for those icons —
about 28 KB before compression. That is not worth de-duplicating behind a level of indirection,
but it should be stated rather than discovered.

### Task 3: React icon emitter — done

**Files:**

- Created: `packages/assets/src/icon.tsx` (hand written)
- Created: `packages/codegen/src/emit/react-icons.mjs`
- Created: `packages/codegen/test/react-icons.test.mjs`
- Modified: `packages/assets/package.json` (React added; `exports` stays for task 9)

`renderReactIcons(spec)` returns `{modules, barrel, icons}` as strings and data, so the tests run
without touching the disk; `emitReactIcons(spec, fileVersion)` writes them through
`writeGenerated` into `packages/assets/src/generated/icons/`: one `<fileStem>.tsx` per icon, the
barrel `index.ts` sorted with `byCodeUnit`, and `icons.manifest.json`.

**The shell is hand written, not generated.** The design separates generated recipes from
hand-written shells that carry behaviour, and accessibility is behaviour: deciding once what
`title` does beats deciding it 341 times, and only `src/generated/**` is machine owned. It lives
at `packages/assets/src/icon.tsx`, outside the generated tree, and every generated module imports
it.

```tsx
import { useId, type SVGProps } from 'react';

/**
 * The shared shell every generated icon delegates to.
 *
 * Hand written, not generated: the generated modules are recipes -- geometry and a name -- and
 * everything that is behaviour rather than data lives here, so accessibility is decided once
 * instead of 341 times. Only `src/generated/**` is machine owned.
 */

/** The SOLAR `icon.*` steps: 12, 16, 20, 24, 28 and 32px. */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const STEPS: readonly IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export interface IconPath {
  d: string;
  /** Only ever `'evenodd'`; `'nonzero'` is SVG's default and is left off. */
  fillRule?: 'evenodd';
}

/** One variant's drawing. The viewBox travels with it, so a variant off the 24 grid keeps it. */
export interface IconGeometry {
  viewBox: string;
  paths: readonly IconPath[];
}

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** A SOLAR icon.* step, or any CSS length. Defaults to lg (24px). */
  size?: IconSize | (string & {}) | number;
  variant?: 'outline' | 'solid';
  /** Accessible name. Without it the icon is hidden from assistive technology. */
  title?: string;
}

export interface IconShellProps extends IconProps {
  outline: IconGeometry;
  solid: IconGeometry;
}

/**
 * A named step resolves to its CSS variable rather than to px, so the rendered size traces to
 * `icon.*` and follows a token change. Anything else -- a number, `1em`, `100%` -- is the
 * caller's own length and passes through untouched.
 */
const length = (size: IconSize | (string & {}) | number) =>
  typeof size === 'string' && (STEPS as readonly string[]).includes(size)
    ? `var(--solar-icon-${size})`
    : size;

export function Icon({
  size = 'lg',
  variant = 'outline',
  title,
  outline,
  solid,
  ...props
}: IconShellProps) {
  const geometry = variant === 'solid' ? solid : outline;
  const side = length(size);
  // useId, not a counter: the id has to be stable between the server render and hydration.
  const titleId = `${useId()}title`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={geometry.viewBox}
      width={side}
      height={side}
      // An icon with a name is an image; one without is decoration beside a label that already
      // says it, and is taken out of the tree entirely. focusable="false" is for IE/Edge legacy,
      // where an svg is a tab stop by default.
      role={title ? 'img' : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      focusable={title ? undefined : false}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {geometry.paths.map((path, i) => (
        // Every path inherits its colour, so `color: var(--solar-color-icon-primary)` on any
        // ancestor tints the icon. The SOLAR source draws them all in color/neutral/900.
        // The list is a fixed generated constant, so the index is a stable identity.
        <path key={i} d={path.d} fillRule={path.fillRule} fill="currentColor" />
      ))}
    </svg>
  );
}
```

A generated module is geometry, a name and a JSDoc line from the catalog. It emits a real function
per icon rather than a call to a shared factory: a bundler can see an unimported function is
unreachable without following a call, and React DevTools shows the icon's own name.

```tsx
// Generated by @bwp-web/codegen from spec/icons.json. Do not edit.
import { Icon, type IconGeometry, type IconProps } from '../../icon.js';

const outline: IconGeometry = {
  viewBox: '0 0 24 24',
  paths: [
    {
      d: 'M13.1717 12.0007L8.22192 7.05093L9.63614 5.63672L16.0001 12.0007L9.63614 18.3646L8.22192 16.9504L13.1717 12.0007Z',
    },
  ],
};

const solid: IconGeometry = {
  viewBox: '0 0 24 24',
  paths: [{ d: 'M16 12L10 18V6L16 12Z' }],
};

/**
 * Chevron right. Related: next, forward, caret, drill in, expand
 *
 * @category Navigation
 */
export function IconChevronRight(props: IconProps) {
  return <Icon {...props} outline={outline} solid={solid} />;
}
```

**The manifest records digests, not path data.** `d` strings are 358 KB; repeating them in the
React, SVG and Flutter manifests would trip that to over a megabyte of checked-in duplication for
a question that is only ever asked as "is this the same geometry?". Each entry is
`{viewBox, pathCount, digest}`, where `digest` is a SHA-256 over the canonical JSON of the paths
array with `fillRule` spelled out, so a target that silently drops the attribute reads as a
different digest. Task 8 compares digests across targets. `geometryDigest` is exported from
`react-icons.mjs` for the other two emitters to import; if a third caller appears it should move
to a shared module.

**Tree shaking is measured, not assumed.** Bundling a fixture that imports exactly one icon
through the barrel, with esbuild, `--bundle --minify --format=esm` and React external, gives
**961 bytes**: the shell, chevron-right's two variants and nothing else. Bundling the whole barrel
gives **428 KB**. Every one of the other 340 icons' `d` strings was searched for in the one-icon
bundle; none survived. The measurement is against `src/` because `@bwp-web/assets` does not export
the icons yet — its `exports` map and `src/index.ts` are task 9 — so it should be repeated against
`dist/` once that lands.

**React is a new dependency of the repository.** Nothing here used it before. `react`, `react-dom`
and both `@types` packages are devDependencies of `packages/assets` at `^19.3.0`, with
`"react": ">=18"` as its one peerDependency. The generated modules import React only through the
automatic JSX runtime; tsup already externalises it.

**Tests** are 13 cases in one file: 341 modules and a barrel of 341 unique names including
`IconUSB` and `IconPhoneAudioDsp`; no `#111111` in any module; a viewBox emitted per variant,
asserted by rendering a hand-built spec whose outline is `0 0 24 25` beside a square solid —
`zone` was that asset until SOLAR redrew it on 2026-09-22 — with every real module declaring two
square viewBoxes and nothing else; `fillRule` present only where the source says `evenodd`; no
`px` literal or hard-coded size anywhere; and a manifest of 341 entries, 682 variants and
distinct digests for geometry that differs.

Six of them render the real component with `react-dom/server`'s `renderToStaticMarkup`, which
needs no DOM, and assert the markup rather than the source: every `<path>` carries
`fill="currentColor"`; `size` resolves `lg` to `var(--solar-icon-lg)` and passes `40` and `1em`
through; a `title` produces `role="img"` and an `aria-labelledby` matching the `<title>`'s
`useId` id; without one the icon is `aria-hidden="true"` and `focusable="false"`.

Run: `npx vitest run packages/codegen/test/react-icons.test.mjs`

The repository owner commits `packages/assets/src/icon.tsx`,
`packages/assets/src/generated/icons/`, `packages/codegen/src/emit/react-icons.mjs`,
`packages/codegen/test/react-icons.test.mjs`, `packages/assets/package.json` and
`package-lock.json`.

---

**Dependencies added.** `packages/assets` gets `react`, `react-dom`, `@types/react` and
`@types/react-dom` at `^19.3.0` as devDependencies and `"react": ">=18"` as its one peer
dependency. `packages/codegen` gets `react` and `react-dom` as devDependencies too, because its
test renders a component with `renderToStaticMarkup`; without that they resolve only through npm
hoisting from `packages/assets`, which is undeclared and breaks under a stricter installer.

### Task 4: Raw SVG output — done

**Files:**

- Created: `packages/codegen/src/emit/svg-files.mjs`
- Created: `packages/codegen/test/svg-files.test.mjs`
- Modified: `packages/assets/package.json` (the `./svg/*` export and the build copy)

The spec promises "plus raw SVG", for consumers using `<img>`, a sprite or a CSS mask.
`renderSvgFiles(spec)` returns a `Map` of path to contents, so the tests never touch the disk;
`emitSvgFiles(spec, fileVersion)` writes it through `writeGenerated` into
`packages/assets/src/generated/svg/`. **687 files**: 682 at
`icons/<fileStem>-<variant>.svg`, one per icon variant, and 5 at `logos/<set>-<variant>.svg` —
`biamp-logo-light-sm`, `biamp-logo-dark-sm`, `os-logo-microsoft`, `os-logo-google` and
`os-logo-teams`. The app icons are raster and are skipped here; they ship as files in task 5.

**The files are serialized from the spec, never copied out of `docs/`.** That is the whole point
of the task. React, Flutter and these files have to draw the same geometry, and a copy could
drift from the IR the other two are built from: the raw SVG would then be a fourth source of
truth instead of a fourth rendering of the one source. Serializing is also what makes the round
trip a real assertion rather than a tautology about a copied byte.

One `<svg>`, one line, no header comment:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path d="M16 12L10 18V6L16 12Z" fill="currentColor"/></svg>
```

- `width` and `height` come from the viewBox extent rather than a constant, so the file has an
  intrinsic size for `<img>`. Every icon is 24 × 24 today; `zone` outline was `24` × `25` until
  SOLAR redrew it on 2026-09-22, and a constant would have cropped it.
- The root's own `fill="none"` is **not** emitted. It is Figma chrome, and the parser already
  refuses to inherit it into a path.
- Every icon path is `fill="currentColor"`; every logo path carries its literal colour.
- `fill-rule="evenodd"` appears on the 75 paths the spec says so about, spread across 75 distinct
  files. `nonzero` is SVG's default and is never spelled out.
- Nothing is escaped, because nothing can carry markup: `checkPathData` has already rejected
  every character in `d` outside numbers, separators and `M L C H V Z`, and a fill is a validated
  `#rrggbb`.

**The one exception is `os-logo/teams`.** It has no IR — 12 gradient fills and every
`fill-opacity` in the set — so its `spec.logos['os-logo'].variants.teams.source` is written
verbatim. Raw SVG is the one target that can carry it faithfully, so this is the target that
ships the real mark rather than a flattened approximation of it.

`fileVersion` is accepted for signature parity with the other emitters and deliberately unused:
these files carry no provenance header, because an SVG is downloaded by a browser rather than
read as source.

```js
/**
 * Writes every icon and logo back out as a standalone SVG file.
 *
 * The files are serialized from the spec, never copied out of docs/. React, Flutter and these
 * files have to draw the same geometry, and a copy could drift from the IR the other two are
 * built from: the raw SVG would then be a fourth source of truth instead of a fourth rendering
 * of the one source. Serializing means the round trip -- parse the generated file and compare it
 * to the spec it came from -- is a real assertion rather than a tautology about a copied byte.
 */

import { join } from 'node:path';
import { packagesDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { writeGenerated } from '../util/write.mjs';

const OUT_DIR = join(packagesDir, 'assets', 'src', 'generated', 'svg');

/**
 * Serializes one path element.
 *
 * Nothing is escaped, because nothing here can carry markup: `checkPathData` has already
 * rejected every character in `d` outside numbers, separators and `M L C H V Z`, and a fill is
 * a validated `#rrggbb`. `fill-rule` is written only for `evenodd`; `nonzero` is SVG's default
 * and spelling it out would add 682 attributes that say nothing.
 */
const pathElement = (path, fill) =>
  `<path d="${path.d}"` +
  (path.fillRule === 'evenodd' ? ' fill-rule="evenodd"' : '') +
  ` fill="${fill}"/>`;

/**
 * @param {{viewBox: number[], paths: object[]}} geometry
 * @param {(path: object) => string} fillOf icons inherit their colour, logos own theirs
 */
function serialize(geometry, fillOf) {
  const [, , width, height] = geometry.viewBox;
  // width/height give the file an intrinsic size, which is what an <img> or a CSS mask needs;
  // they come from the viewBox extent rather than a constant. Every icon is 24 x 24 today --
  // zone outline was 24 x 25 until SOLAR redrew it on the grid on 2026-09-22 -- and a constant
  // would silently crop the next variant that is not.
  // The root's own fill is deliberately absent: Figma writes fill="none" on every export and it
  // is chrome, not geometry.
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${geometry.viewBox.join(' ')}"` +
    ` width="${width}" height="${height}">` +
    geometry.paths.map((p) => pathElement(p, fillOf(p))).join('') +
    '</svg>\n'
  );
}

/**
 * Renders every file as data, keyed by its path below the generated svg/ directory.
 *
 * Returning a Map rather than writing keeps the tests off the disk, so "no #111111 survives"
 * is a property of what this function produces rather than of whatever happens to be checked in.
 */
export function renderSvgFiles(spec) {
  const files = new Map();

  for (const stem of Object.keys(spec.icons).sort(byCodeUnit)) {
    for (const variant of ['outline', 'solid']) {
      files.set(
        `icons/${stem}-${variant}.svg`,
        serialize(spec.icons[stem].variants[variant], () => 'currentColor'),
      );
    }
  }

  for (const set of Object.keys(spec.logos).sort(byCodeUnit)) {
    const logo = spec.logos[set];
    if (logo.raster) continue; // the app icons are PNGs and ship as files of their own
    for (const slug of Object.keys(logo.variants).sort(byCodeUnit)) {
      const geometry = logo.variants[slug];
      // os-logo/teams has no IR -- it is 12 gradient fills and every fill-opacity in the set --
      // so its source travels verbatim. Raw SVG is the one target that can carry it faithfully,
      // and shipping the real mark here beats shipping a flattened approximation of it.
      files.set(
        `logos/${set}-${slug}.svg`,
        geometry.unsupported
          ? geometry.source
          : serialize(geometry, (p) => p.fill),
      );
    }
  }

  return files;
}

// fileVersion is accepted for signature parity with the other emitters, which record it in a
// manifest. These files carry no header: an SVG is consumed by a browser, not read as source,
// and a provenance comment would be bytes every consumer downloads and no consumer reads.
export function emitSvgFiles(spec, _fileVersion) {
  const files = renderSvgFiles(spec);
  for (const [file, contents] of files)
    writeGenerated(join(OUT_DIR, file), contents);
  return files.size;
}
```

**Package wiring.** `packages/assets/package.json` gains `"./svg/*": "./dist/svg/*"` in `exports`
and `&& cp -R src/generated/svg/. dist/svg` on the `build` script, mirroring how
`@bwp-web/styles` copies `tokens.css`. `files` stays `["dist"]`. Prettier has no `.svg` parser;
it skips the files when expanding a directory, so `npm run format` still passes and the
generated tree needs no ignore entry.

**Tests** are 8 cases in one file. 687 files, 682 + 5, with the five logo names spelled out; no
`#111111` in any icon file and every icon path `fill="currentColor"`, which is the tinting
contract at the file level; `os-logo-google.svg` carrying all four of `#ffc107`, `#ff3d00`,
`#4caf50`, `#1976d2` and no `currentColor`; a file sized from its own viewBox, asserted by
serializing a hand-built spec whose outline is `0 0 24 25` with `height="25"` — `zone` was that
asset until 2026-09-22 — beside every real icon file at `0 0 24 24` and `height="24"`; exactly 75
files with `fill-rule="evenodd"` and none with `nonzero`; and a file written per variant even when
both are the same drawing, which is what the `support` fallback needed until Figma supplied its
outline, with `support-outline.svg` and `support-solid.svg` now differing.

The last two are the ones that matter. `os-logo-teams.svg` is asserted byte-equal to the spec's
`source` and to contain `radialGradient` and `fill-opacity`. And **the round trip**: all 686
representable files are re-parsed with `parseSvg` and compared to the spec geometry they came
from — same viewBox, same `d` strings in order, same fill rules. A spec icon path carries no
`fill` key while `parseSvg` reports `currentColor` as `null`, so both sides are normalized to
`fill ?? null` before comparing. `teams` is excluded because it has no IR by definition. This is
the assertion that proves the files are a faithful rendering rather than plausible-looking markup.

Run: `npx vitest run packages/codegen/test/svg-files.test.mjs`

The repository owner commits `packages/codegen/src/emit/svg-files.mjs`,
`packages/codegen/test/svg-files.test.mjs`, `packages/assets/src/generated/svg/` and
`packages/assets/package.json`.

---

**No SVG manifest, decided here so Task 8 does not reopen it.** The other emitters write a
digest manifest because their output is code that could drift from the spec. The raw SVG is
checked more strongly than a digest would check it: every one of the 686 representable files is
re-parsed and asserted equal to the spec geometry it came from. Task 8 proves React equals the
spec and Flutter equals the spec, so all three agree transitively. `emitSvgFiles` therefore
ignores `fileVersion`, and these files carry no provenance header — a browser downloads an SVG,
it does not read it as source.

### Task 5: Logo emitter for React, and what Flutter does about `teams.svg` — done

**Files:**

- Created: `packages/assets/src/logo.tsx` (hand written)
- Created: `packages/codegen/src/emit/react-logos.mjs`
- Created: `packages/codegen/test/react-logos.test.mjs`
- Modified: `packages/codegen/src/normalize/deviations.mjs` (the Teams row now records the Flutter decision this task takes)

`renderReactLogos(spec)` returns `{modules, barrel, logos}` as strings and data, so the tests run
without touching the disk; `emitReactLogos(spec, fileVersion)` writes them through `writeGenerated`
into `packages/assets/src/generated/logos/`: `biamp.tsx` (`LogoBiamp`), `os.tsx` (`LogoOs`),
`app-icon.ts` (the five raster icons), the barrel `index.ts` and `logos.manifest.json`.
`src/index.ts` and the package `exports` map stay task 9.

**The shell is hand written**, at `packages/assets/src/logo.tsx`, for the same reason `icon.tsx`
is: the generated modules are recipes and everything that is behaviour lives in one place. It
carries two rules `Icon` does not.

- **`color` and `fill` are omitted from the props.** A tinted brand mark is a brand violation, so
  `LogoProps` is `Omit<SVGProps<SVGSVGElement>, 'color' | 'fill' | 'children'>` and the compiler
  refuses `<LogoBiamp fill="red" />` rather than a comment asking callers not to. `currentColor`
  appears nowhere in the shell, the emitter or anything either produces — the exact inverse of the
  icon contract, and asserted as such.
- **`size` sets the height alone.** Marks are not square: the Biamp wordmark is 36 × 12, and
  setting width and height to one length the way `Icon` does would squash it. The width comes from
  the viewBox's intrinsic ratio instead. ⚠️ SOLAR publishes no `logo.*` size scale, so a named step
  reuses the `icon.*` ladder (`var(--solar-icon-lg)` by default); that is a reuse of an existing
  token, not an invented name, but it is worth a governance question. `title` and the
  `role`/`aria-hidden`/`focusable` handling are identical to `Icon`'s.

**Two API choices that differ from the spec data.** `spec.logos['os-logo'].prop` is `logo`, because
that is what the Figma property is called; both components nevertheless take `variant`, so the two
logos have one API rather than one each. And the default variant is the first in `byCodeUnit` order
— `dark-sm` for Biamp, `google` for the OS marks — which is a deterministic generated choice rather
than an editorial one, so adding a variant cannot quietly change what a caller gets without also
changing the emitted union.

```tsx
import { useId, type ReactNode, type SVGProps } from 'react';

/**
 * The shared shell every generated logo delegates to.
 *
 * Hand written, not generated, for the same reason `icon.tsx` is: the generated modules are
 * recipes -- artwork and a name -- and everything that is behaviour rather than data is decided
 * once here. Only `src/generated/**` is machine owned.
 *
 * A logo is not an icon with brand colours. Two things follow, and both are enforced by the
 * types rather than by a comment asking nicely:
 *
 * - **It is never tinted.** `color` and `fill` are omitted from the props, so a caller cannot
 *   recolour a brand mark by accident. Every path carries the colour the SOLAR source drew it
 *   in; nothing here or in anything generated beside it inherits a colour from its surroundings,
 *   which is the exact inverse of the icon contract and is asserted as such.
 * - **It is never squashed.** Marks are not square -- the Biamp wordmark is 36 x 12 -- so `size`
 *   sets the height alone and the width follows from the viewBox's intrinsic ratio. Setting both
 *   the way `Icon` does would distort every non-square mark.
 */

/**
 * The SOLAR `icon.*` steps: 12, 16, 20, 24, 28 and 32px.
 *
 * SOLAR publishes no `logo.*` size scale, so a named step reuses the icon ladder -- a logo sits
 * beside icons in a toolbar or a header and shares their rhythm. Anything outside the ladder is
 * the caller's own CSS length, which is the escape hatch for a lockup that needs its own size.
 */
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const STEPS: readonly LogoSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export interface LogoPath {
  d: string;
  /** Only ever `'evenodd'`; `'nonzero'` is SVG's default and is left off. */
  fillRule?: 'evenodd';
  /** The brand colour. A logo path always owns one; it never inherits. */
  fill: string;
}

/** One mark's drawing, as vector paths. */
export interface LogoGeometry {
  viewBox: string;
  paths: readonly LogoPath[];
}

/**
 * One mark the vector IR cannot represent, carried as JSX instead.
 *
 * `render` is given a per-instance id namespace: a mark drawn with gradients defines ids and
 * refers to them with `url(#…)`, and a browser resolves such a reference to the first match in
 * the document, so two copies of the same logo on one page would both paint with the first
 * copy's gradients. Every id the generator emits is prefixed with `uid`.
 */
export interface LogoMarkup {
  viewBox: string;
  render: (uid: string) => ReactNode;
}

export type LogoArtwork = LogoGeometry | LogoMarkup;

/**
 * `color` and `fill` are deliberately absent. A tinted brand mark is a brand violation, and the
 * type system should refuse it rather than document it.
 */
export interface LogoProps extends Omit<
  SVGProps<SVGSVGElement>,
  'color' | 'fill' | 'children'
> {
  /** A SOLAR icon.* step, or any CSS length. Sets the height. Defaults to lg (24px). */
  size?: LogoSize | (string & {}) | number;
  /** Accessible name. Without it the logo is hidden from assistive technology. */
  title?: string;
}

export interface LogoShellProps extends LogoProps {
  artwork: LogoArtwork;
}

/**
 * A named step resolves to its CSS variable rather than to px, so the rendered size traces to
 * `icon.*` and follows a token change. Anything else -- a number, `1em`, `100%` -- is the
 * caller's own length and passes through untouched.
 */
const length = (size: LogoSize | (string & {}) | number) =>
  typeof size === 'string' && (STEPS as readonly string[]).includes(size)
    ? `var(--solar-icon-${size})`
    : size;

export function Logo({
  size = 'lg',
  title,
  artwork,
  ...props
}: LogoShellProps) {
  // useId, not a counter: the id has to be stable between the server render and hydration.
  // React spells its ids with punctuation (`«r0»` in 19, `:r0:` in 18), so they are reduced to
  // their alphanumerics before being spliced into an `id` or a `url(#…)` fragment reference;
  // the alphanumeric part is the part that makes them distinct. The leading letter keeps the
  // result a valid identifier for anything that later reads the id as a selector.
  const uid = `l${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const titleId = `${uid}title`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={artwork.viewBox}
      // Height only: the width comes from the viewBox's intrinsic ratio, so a 36 x 12 wordmark
      // stays a wordmark. A caller who wants a fixed box sets width in CSS.
      height={length(size)}
      // A logo with a name is an image; one without is decoration beside a label that already
      // says it, and is taken out of the tree entirely. focusable="false" is for IE/Edge legacy,
      // where an svg is a tab stop by default.
      role={title ? 'img' : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      focusable={title ? undefined : false}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {'render' in artwork
        ? artwork.render(uid)
        : artwork.paths.map((path, i) => (
            // The list is a fixed generated constant, so the index is a stable identity.
            <path
              key={i}
              d={path.d}
              fillRule={path.fillRule}
              fill={path.fill}
            />
          ))}
    </svg>
  );
}
```

**The Teams mark, which is the real work.** `spec.logos['os-logo'].variants.teams` is
`{unsupported: 'gradient', source}` — no vector IR. React renders gradients natively, so
`svgToJsx` converts that source string to JSX at generation time rather than approximating the
mark. The transform is narrow because the file is known, and every one of these numbers was
measured rather than assumed:

| | |
| --- | --- |
| Elements | `svg`, `path` × 13, `defs`, `radialGradient` × 11, `linearGradient` × 1, `stop` × 27 |
| Hyphenated attributes | `fill-opacity` × 7, `stop-color` × 27, `stop-opacity` × 7, and nothing else |
| Ids | 12 defined, 12 `url(#…)` references, matching exactly: no dangling reference, no unused id |

Those three attribute names are camelCased from a three-entry table and **a fourth throws**, so a
future mark carrying a stroke or a mask fails the build instead of shipping an attribute React
drops and no test notices. Everything else the file uses — `gradientUnits`, `gradientTransform`,
`cx`, `cy`, `r`, `x1`, `y1`, `x2`, `y2`, `offset` — is already a valid JSX prop name and passes
through untouched. So does text content, a namespaced attribute, `class`, an unbalanced element,
a root attribute the shell cannot own, a reference nothing defines and an id nothing uses: each is
an error naming the file. The root `<svg>` itself is dropped, and its `viewBox` returned separately,
so the shell writes the sizing and accessibility attributes for every mark alike; its `fill="none"`
is Figma chrome and is asserted rather than inherited.

**Ids are namespaced per instance, and renamed rather than prefixed.** A browser resolves
`url(#id)` to the first match in the document, so two `<LogoOs variant="teams" />` on one page would
both paint with the first one's gradients. `LogoMarkup.render` therefore takes a `uid` from the
shell's `useId`, and every id and reference is emitted as a template literal around it —
``id={`${uid}g0`}`` and ``fill={`url(#${uid}g0)`}``. The Figma ids (`paint0_radial_6196_626`) are
replaced by short generated names, not merely prefixed, which is what lets a test assert their
absence literally instead of reasoning about where a prefix sits. React's own id spelling carries
punctuation (`«r0»` in 19, `:r0:` in 18), so the shell reduces it to its alphanumerics before
splicing it into a fragment reference.

**The five app icons are raster, so they are not components.** They ship as base64
`data:image/png;base64,…` string constants — one exported const each (`appIconWorkplace`, …) so a
consumer can take one without the other four, plus an `appIcons` record for convenience. 14,884
bytes of PNG become 19,852 characters of base64. The alternative, `import … from './x.png'`, needs
a bundler loader and a `*.png` TypeScript shim from every consumer; a data URL needs neither and is
the value of an `<img src>` or a `background-image` as it stands. The bytes are read from
`docs/solar-icons/logos/app-icon/` rather than carried in `spec/icons.json`, because 20 KB of
base64 in the spec would be noise to every other target; `docs/` is read-only to the generator, and
reading is what that means.

**Flutter omits the Teams variant entirely.** That is decided here, recorded in the
`logo.os-logo.teams` row of `ICON_DEVIATIONS`, implemented in task 7 and asserted in task 8 as the
*only* difference between the React and Flutter asset sets. Redrawing 11 radial gradients with
focal points, `gradientTransform` matrices and 27 stops in a hand-written painter is
disproportionate work for one third-party brand mark; approximating it with flat colours would
invent a brand colour, which is worse than a missing asset. React and the raw SVG output both carry
the real mark, so the gap is one platform's, documented rather than silent.

**The manifest does not reuse `geometryDigest`.** The icon digest hashes `d` and `fillRule` only,
which is right for an icon: an icon has no colour of its own. A logo's colours *are* the drawing —
the two Biamp wordmarks differ in nothing else, and the two hashes collide without the fill — so
`logoDigest` hashes `{d, fillRule, fill}` and is exported for task 7 to use rather than agree with
by coincidence. A variant with no geometry is fingerprinted by its raw source, and a raster file by
its bytes, so every entry says something.

**Tests (18, all passing).** The spec is built once at module scope from the real catalog. Three
modules and a barrel; both Biamp marks sharing `#d22730` while one wordmark is `#000000` and the
other `#ffffff`; all three OS marks with Google in `#ffc107`, `#ff3d00`, `#4caf50`, `#1976d2`; no
`currentColor` in any module, the barrel or the shell; and the shell's `Omit` of `color` and `fill`
with no module reintroducing either. Then the Teams transform: 12 namespaced ids and 12 namespaced
references, no `paint0_radial_6196_626` or `_6196_626` surviving anywhere, `fillOpacity`,
`stopColor` and `stopOpacity` present with no hyphenated attribute name left, all 13 paths, 11
radial gradients, 1 linear gradient and 27 stops carried through, a synthetic `stroke-linecap`
throwing while the same document without it does not, and a dangling `url(#missing)` throwing. The
five app icons decode from their data URLs to bytes equal to the files in `docs/`, each exported on
its own beside the record. The manifest fingerprints every variant, including the one with no
geometry.

Four render the real component with `react-dom/server`'s `renderToStaticMarkup`. **The one that
matters is two `<LogoOs variant="teams" />` in one tree**: 24 ids, all distinct, the reference set
equal to the id set, and 12 ids under each of two prefixes — which proves the collision is fixed
rather than merely prefixed. The others check that only `height` is written and that it resolves
`lg` to `var(--solar-icon-lg)` and `48` to `48`; that a `title` produces `role="img"` and a matching
`aria-labelledby` while its absence produces `aria-hidden="true"` and `focusable="false"`; and that
Microsoft's four paths render in their own four colours with no `currentColor`.

```js
/**
 * Emits the SOLAR logos as React components, and the raster app icons as data URLs.
 *
 * A logo is not an icon with brand colours, and this file is where that difference is made
 * mechanical rather than remembered:
 *
 * - **No tinting.** Every path keeps the colour SOLAR drew it in, `currentColor` is never
 *   emitted, and the shell's props omit `color` and `fill` so the type system refuses a tinted
 *   brand mark instead of a comment asking for one.
 * - **`os-logo/teams` has no vector IR.** It is 13 paths, 12 of them filled from 11 radial and
 *   one linear gradient, plus every `fill-opacity` in the corpus. React renders that natively,
 *   so its source is converted to JSX here rather than approximated. The conversion is
 *   deliberately narrow: it camelCases the three hyphenated attributes this document actually
 *   uses and throws on a fourth, so a future mark with an unhandled attribute fails the build
 *   instead of rendering an attribute the DOM silently ignores.
 * - **Gradient ids are namespaced per instance.** A browser resolves `url(#id)` to the first
 *   match in the document, so two Teams marks on one page would both paint with the first one's
 *   gradients. Every id is rewritten to a short generated name and prefixed with the shell's
 *   `useId` value; the Figma ids (`paint0_radial_6196_626`) do not survive into the output at
 *   all, which is what lets a test assert their absence literally.
 * - **The app icons are raster and are not components.** They are emitted as base64 data URLs,
 *   one exported const each plus a record, so a consumer can take one without the rest. 14.5 KB
 *   of PNG becomes ~20 KB of base64, which costs no bundler loader, no `*.png` type shim and no
 *   asset-serving decision on the consumer's side.
 */

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { docsDir, packagesDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { writeGenerated } from '../util/write.mjs';

const OUT_DIR = join(packagesDir, 'assets', 'src', 'generated', 'logos');

const HEADER =
  '// Generated by @bwp-web/codegen from spec/icons.json. Do not edit.\n';

// The three hyphenated attributes the corpus uses. An unlisted one throws: React would render
// `fill-opacity` as an unknown attribute on some elements and drop it on others, and either way
// a mark would ship subtly wrong with nothing to notice it.
const JSX_ATTRIBUTES = {
  'fill-opacity': 'fillOpacity',
  'stop-color': 'stopColor',
  'stop-opacity': 'stopOpacity',
};

// What the shell owns on the root element, and therefore what may be dropped from it. Anything
// else on a root is an instruction we would be discarding.
const ROOT_ATTRIBUTES = new Set([
  'width',
  'height',
  'viewBox',
  'fill',
  'xmlns',
]);

const MIME = { '.png': 'image/png' };

const TAG = /<(\/?)([a-zA-Z][\w:.-]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const ATTR = /([a-zA-Z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
const URL_REF = /url\(#([^)\s]+)\)/g;

function fail(file, detail) {
  throw new Error(`${file}: ${detail}`);
}

function parseAttrs(text) {
  const attrs = {};
  for (const m of text.matchAll(ATTR)) attrs[m[1]] = m[2] ?? m[3];
  return attrs;
}

const quote = (text) =>
  `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

// A JSX expression holding a template literal, written as source rather than evaluated.
const template = (body) => '{`' + body + '`}';

// `google: google` rather than `google` is valid and ugly; a slug that is already an identifier
// gets the shorthand, and `dark-sm` keeps its quotes because it has to.
const entry = (key, value) =>
  key === value ? `  ${key},\n` : `  ${quote(key)}: ${value},\n`;

const pascal = (text) =>
  text
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');

const camel = (text) => {
  const name = pascal(text);
  return name[0].toLowerCase() + name.slice(1);
};

// os-logo and biamp-logo already say "logo" in their component name, so the module is named
// after the component rather than after the Figma set: os.tsx exports LogoOs.
const moduleStem = (kebab) => kebab.replace(/-logo$/, '');

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

/**
 * A stable fingerprint of one mark's artwork, for the parity suite in task 8.
 *
 * Deliberately not `geometryDigest` from the icon emitter. That one hashes `d` and `fillRule`
 * only, which is right for an icon: an icon has no colour of its own, so two icons with the same
 * outline are the same drawing. A logo's colours *are* the drawing -- the two Biamp wordmarks
 * differ in nothing else -- so the fill is part of the fingerprint here. Exported so the Flutter
 * emitter hashes the same canonical form rather than a second one that happens to agree.
 */
export const logoDigest = (paths) =>
  sha256(
    JSON.stringify(
      paths.map((p) => ({
        d: p.d,
        fillRule: p.fillRule ?? 'nonzero',
        fill: p.fill,
      })),
    ),
  );

function rootViewBox(attrs, file) {
  for (const name of Object.keys(attrs)) {
    if (!ROOT_ATTRIBUTES.has(name)) {
      fail(
        file,
        `the root <svg> carries "${name}", which the shell cannot own; the shell writes ` +
          'viewBox, the height and the accessibility attributes itself, so anything else on ' +
          'the root would be dropped',
      );
    }
  }
  // Figma writes fill="none" on every export. It is chrome, not geometry, and the vector reader
  // refuses to inherit it into a path; the same rule applies here.
  if (attrs.fill && attrs.fill !== 'none')
    fail(file, `the root <svg> is filled ${attrs.fill}, which is not chrome`);
  if (!attrs.viewBox) fail(file, 'the root <svg> has no viewBox');
  return attrs.viewBox;
}

/**
 * Renders one attribute as JSX source, namespacing any id it defines or refers to.
 *
 * @param {{file: string, defined: Set<string>, referenced: Set<string>, rename: (id: string) => string}} ctx
 */
function jsxAttribute(name, value, ctx) {
  if (name.includes(':'))
    fail(ctx.file, `namespaced attribute "${name}" is not supported`);
  if (name === 'class' || name === 'for')
    fail(ctx.file, `attribute "${name}" is spelled differently in JSX`);

  let jsxName = name;
  if (name.includes('-')) {
    jsxName = JSX_ATTRIBUTES[name];
    if (!jsxName) {
      fail(
        ctx.file,
        `attribute "${name}" has no known JSX spelling; add it to JSX_ATTRIBUTES once you ` +
          'have checked how React spells it, rather than emitting an attribute the DOM ignores',
      );
    }
  }

  if (value.includes('`') || value.includes('${') || value.includes('"'))
    fail(
      ctx.file,
      `attribute "${name}" has a value JSX cannot quote: ${value}`,
    );

  if (jsxName === 'id') {
    ctx.defined.add(value);
    return 'id=' + template('${uid}' + ctx.rename(value));
  }

  if (value.includes('url(#')) {
    const body = value.replace(URL_REF, (_, id) => {
      ctx.referenced.add(id);
      return 'url(#${uid}' + ctx.rename(id) + ')';
    });
    return `${jsxName}=` + template(body);
  }

  return `${jsxName}="${value}"`;
}

/**
 * Converts an SVG document the vector IR cannot represent into the JSX body of a `<Logo>`.
 *
 * The root `<svg>` is dropped -- the shell writes it, so the sizing and accessibility rules are
 * the same for every mark -- and its `viewBox` is returned separately. Everything below it is
 * carried through verbatim apart from the two rewrites this transform exists for: the three
 * hyphenated attribute names, and the ids.
 *
 * It is narrow on purpose. Every element, attribute and text node it does not recognise is an
 * error naming the file. The alternative -- passing the unknown through and hoping -- is how an
 * asset pipeline ships a mark that renders wrong in one browser and right in the next.
 *
 * @param {string} source
 * @param {{file: string}} context
 * @returns {{viewBox: string, jsx: string, ids: string[]}}
 */
export function svgToJsx(source, { file }) {
  const names = new Map();
  const defined = new Set();
  const referenced = new Set();
  // Short generated names rather than prefixed Figma ones: `paint0_radial_6196_626` says
  // nothing a reader needs, and dropping it entirely means "no source id survives" is a literal
  // assertion a test can make rather than a claim about where a prefix happens to sit.
  const rename = (id) => {
    if (!names.has(id)) names.set(id, `g${names.size}`);
    return names.get(id);
  };
  const ctx = { file, defined, referenced, rename };

  const lines = [];
  let viewBox = null;
  let closed = false;
  let open = 0;
  let cursor = 0;
  TAG.lastIndex = 0;

  for (let tag; (tag = TAG.exec(source));) {
    const between = source.slice(cursor, tag.index);
    if (between.trim() !== '')
      fail(file, `text content "${between.trim()}" cannot be carried into JSX`);
    cursor = TAG.lastIndex;

    const [, closing, name, attrText] = tag;
    const selfClosing = attrText.trimEnd().endsWith('/');
    const attrs = parseAttrs(attrText);

    if (name === 'svg') {
      if (closing) {
        closed = true;
        continue;
      }
      if (viewBox !== null) fail(file, 'a nested <svg> is not supported');
      viewBox = rootViewBox(attrs, file);
      continue;
    }

    if (viewBox === null)
      fail(file, `<${name}> appears outside the root <svg>`);
    if (closed) fail(file, `<${name}> appears after the root </svg>`);

    if (closing) {
      open -= 1;
      if (open < 0) fail(file, `</${name}> closes an element that is not open`);
      lines.push(`${'  '.repeat(open)}</${name}>`);
      continue;
    }

    const rendered = Object.entries(attrs).map(([key, value]) =>
      jsxAttribute(key, value, ctx),
    );
    const head = `<${name}${rendered.map((a) => ` ${a}`).join('')}`;
    lines.push(`${'  '.repeat(open)}${head}${selfClosing ? ' />' : '>'}`);
    if (!selfClosing) open += 1;
  }

  if (source.slice(cursor).trim() !== '')
    fail(file, 'trailing text after the root </svg>');
  if (viewBox === null) fail(file, 'no root <svg>');
  if (!closed || open !== 0) fail(file, 'unbalanced elements');

  const missing = [...referenced].filter((id) => !defined.has(id));
  const unused = [...defined].filter((id) => !referenced.has(id));
  if (missing.length)
    fail(
      file,
      `url(#…) refers to ${missing.join(', ')}, which nothing defines`,
    );
  if (unused.length)
    fail(file, `${unused.join(', ')} is defined but never referenced`);

  return { viewBox, jsx: lines.join('\n'), ids: [...names.values()] };
}

const pathLiteral = (path) =>
  `{ d: ${quote(path.d)}` +
  (path.fillRule === 'evenodd' ? `, fillRule: 'evenodd'` : '') +
  `, fill: ${quote(path.fill)} }`;

const geometryLiteral = (name, geometry) =>
  `const ${name}: LogoGeometry = {\n` +
  `  viewBox: ${quote(geometry.viewBox.join(' '))},\n` +
  `  paths: [${geometry.paths.map(pathLiteral).join(', ')}],\n` +
  `};\n`;

function markupLiteral(name, variant, file) {
  const { viewBox, jsx } = svgToJsx(variant.source, { file });
  return (
    `const ${name}: LogoMarkup = {\n` +
    `  viewBox: ${quote(viewBox)},\n` +
    '  // Every id below is namespaced with uid, which the shell takes from useId: a browser\n' +
    '  // resolves url(#id) to the first match in the document, so two of these on one page\n' +
    "  // would otherwise both paint with the first one's gradients.\n" +
    '  render: (uid) => (\n' +
    '    <>\n' +
    jsx
      .split('\n')
      .map((line) => `      ${line}\n`)
      .join('') +
    '    </>\n' +
    '  ),\n' +
    '};\n'
  );
}

/** One vector or gradient logo set: a component, its variant union and its artwork. */
function vectorModule(set, logo) {
  const slugs = Object.keys(logo.variants).sort(byCodeUnit);
  const file = (slug) => `logos/${set}/${slug}.svg`;
  const constName = (slug) => camel(slug);
  const variantType = `${logo.component}Variant`;
  const propsType = `${logo.component}Props`;
  // The default is the first variant in sorted order: a generated, deterministic choice rather
  // than an editorial one, so adding a variant cannot quietly change which mark a caller gets
  // without also changing this list.
  const fallback = slugs[0];

  const kinds = ['LogoArtwork', 'LogoProps'];
  if (slugs.some((slug) => !logo.variants[slug].unsupported))
    kinds.push('LogoGeometry');
  if (slugs.some((slug) => logo.variants[slug].unsupported))
    kinds.push('LogoMarkup');

  const artwork = slugs
    .map((slug) => {
      const variant = logo.variants[slug];
      return variant.unsupported
        ? markupLiteral(constName(slug), variant, file(slug))
        : geometryLiteral(constName(slug), variant);
    })
    .join('\n');

  const source =
    HEADER +
    `import {\n  Logo,\n${kinds
      .sort(byCodeUnit)
      .map((kind) => `  type ${kind},\n`)
      .join('')}} from '../../logo.js';\n\n` +
    artwork +
    '\n' +
    `export type ${variantType} = ${slugs.map(quote).join(' | ')};\n\n` +
    `const VARIANTS: Record<${variantType}, LogoArtwork> = {\n${slugs
      .map((slug) => entry(slug, constName(slug)))
      .join('')}};\n\n` +
    `export interface ${propsType} extends LogoProps {\n` +
    `  /** Which mark to draw. Defaults to ${fallback}. */\n` +
    `  variant?: ${variantType};\n` +
    '}\n\n' +
    `/**\n * ${logo.name}. A brand mark: it carries its own colours and is never tinted.\n */\n` +
    `export function ${logo.component}({\n` +
    `  variant = ${quote(fallback)},\n` +
    `  ...props\n` +
    `}: ${propsType}) {\n` +
    `  return <Logo {...props} artwork={VARIANTS[variant]} />;\n` +
    '}\n';

  return {
    set,
    file: `${moduleStem(set)}.tsx`,
    component: logo.component,
    source,
  };
}

/**
 * One raster set, as base64 data URLs.
 *
 * Read from docs/ rather than carried in spec/icons.json: the spec records the path because
 * 20 KB of base64 in a checked-in JSON file would be noise to every other target. docs/ is
 * read-only to the generator, and reading is what that means.
 */
function rasterModule(set, logo) {
  const slugs = Object.keys(logo.files).sort(byCodeUnit);
  const nameType = `${pascal(set)}Name`;
  const constName = (slug) => camel(set) + pascal(slug);
  const recordName = `${camel(set)}s`;
  const urls = new Map();

  for (const slug of slugs) {
    const path = logo.files[slug];
    const ext = path.slice(path.lastIndexOf('.'));
    const mime = MIME[ext];
    if (!mime)
      throw new Error(`${path}: no known media type for a ${ext} asset`);
    urls.set(
      slug,
      `data:${mime};base64,${readFileSync(join(docsDir, 'solar-icons', path)).toString('base64')}`,
    );
  }

  const source =
    HEADER +
    `\n/**\n * ${logo.name}s as base64 data URLs.\n *\n` +
    ' * Raster, so these are not components: they are the value of an `<img src>`, a CSS\n' +
    ' * `background-image` or a manifest entry. Inlined rather than shipped as files so a\n' +
    ' * consumer needs no bundler loader, no `*.png` type shim and no decision about where to\n' +
    ' * serve them from; one exported const each means taking one does not pull in the rest.\n' +
    ' */\n\n' +
    `export type ${nameType} = ${slugs.map(quote).join(' | ')};\n\n` +
    slugs
      .map(
        (slug) =>
          `export const ${constName(slug)} =\n  ${quote(urls.get(slug))};\n`,
      )
      .join('\n') +
    '\n' +
    `export const ${recordName}: Record<${nameType}, string> = {\n${slugs
      .map((slug) => entry(slug, constName(slug)))
      .join('')}};\n`;

  return {
    set,
    file: `${moduleStem(set)}.ts`,
    exports: [nameType, ...slugs.map(constName), recordName],
    types: [nameType],
    source,
  };
}

/**
 * Renders every logo module, the barrel and the manifest, as data.
 *
 * Returning strings rather than writing them keeps the test suite off the disk, so
 * "no currentColor anywhere" is a property of what this function produces rather than of
 * whatever happens to be checked in.
 */
export function renderReactLogos(spec) {
  const sets = Object.keys(spec.logos).sort(byCodeUnit);
  const modules = [];
  const logos = {};

  for (const set of sets) {
    const logo = spec.logos[set];
    if (logo.raster) {
      modules.push(rasterModule(set, logo));
      logos[set] = {
        raster: true,
        files: Object.fromEntries(
          Object.keys(logo.files)
            .sort(byCodeUnit)
            .map((slug) => {
              const bytes = readFileSync(
                join(docsDir, 'solar-icons', logo.files[slug]),
              );
              return [
                slug,
                {
                  bytes: bytes.length,
                  digest: createHash('sha256').update(bytes).digest('hex'),
                },
              ];
            }),
        ),
      };
      continue;
    }

    modules.push(vectorModule(set, logo));
    logos[set] = {
      component: logo.component,
      raster: false,
      variants: Object.fromEntries(
        Object.keys(logo.variants)
          .sort(byCodeUnit)
          .map((slug) => {
            const variant = logo.variants[slug];
            // A mark with no vector IR is fingerprinted by its source, which is the only thing
            // there is to compare; the manifest says so rather than leaving a hole.
            return [
              slug,
              variant.unsupported
                ? {
                    unsupported: variant.unsupported,
                    digest: sha256(variant.source),
                  }
                : {
                    viewBox: variant.viewBox.join(' '),
                    pathCount: variant.paths.length,
                    digest: logoDigest(variant.paths),
                  },
            ];
          }),
      ),
    };
  }

  const barrel =
    HEADER +
    modules
      .map((m) => {
        const stem = `./${m.file.replace(/\.tsx?$/, '.js')}`;
        if (m.exports)
          return `export {\n${m.exports
            .map(
              (name) => `  ${m.types.includes(name) ? 'type ' : ''}${name},\n`,
            )
            .join('')}} from '${stem}';\n`;
        return (
          `export {\n  ${m.component},\n  type ${m.component}Props,\n` +
          `  type ${m.component}Variant,\n} from '${stem}';\n`
        );
      })
      .join('');

  return { modules, barrel, logos };
}

export function emitReactLogos(spec, fileVersion) {
  const { modules, barrel, logos } = renderReactLogos(spec);
  for (const m of modules) writeGenerated(join(OUT_DIR, m.file), m.source);
  writeGenerated(join(OUT_DIR, 'index.ts'), barrel);
  writeGenerated(
    join(OUT_DIR, 'logos.manifest.json'),
    JSON.stringify(
      {
        _note:
          'Written by the SOLAR codegen. One entry per logo set; "digest" is a SHA-256 of the canonical JSON of that variant\'s paths, or of the raw SVG source for a variant the vector IR cannot represent, or of the file bytes for a raster asset. The app icons ship as base64 data URLs in app-icon.ts; the Teams variant of os-logo is the one asset Flutter does not carry.',
        target: 'react',
        fileVersion,
        logos,
      },
      null,
      2,
    ) + '\n',
  );
  return modules.length;
}
```

Run: `npx vitest run packages/codegen/test/react-logos.test.mjs`

Emitting twice and hashing the directory gives the same digest both times, so the output is a pure
function of `docs/`.

The repository owner commits `packages/assets/src/logo.tsx`,
`packages/assets/src/generated/logos/`, `packages/codegen/src/emit/react-logos.mjs`,
`packages/codegen/test/react-logos.test.mjs` and the `logo.os-logo.teams` row in
`packages/codegen/src/normalize/deviations.mjs`.

---

### Task 6: The Dart path parser — done

**Files:**

- Created: `packages/solar_flutter/lib/src/svg_path.dart` (hand written)
- Created: `packages/solar_flutter/test/svg_path_test.dart`
- Created: `packages/codegen/test/flutter-svg-path.test.mjs`

`Path parseSvgPath(String d)` is the runtime half of Task 1's `checkPathData`: the JS validates
every `d` string once, at generation time, and this replays the same string on a device.

**It is hand written, not generated — the reverse of what this plan first said.** The design
separates generated recipes from hand-written shells, and a parser is behaviour, not data: Task 3
already hand-wrote `icon.tsx` on the same grounds. Generating control flow through a JS template
string would be hard to read, harder to debug, and would put the file where Dart's own tooling
treats it as machine-owned. So it lives at `lib/src/svg_path.dart`, **outside**
`lib/src/generated/`, which stays the tree `solar:codegen` writes.

The anti-drift guarantee that generating it would have given for free comes from a test instead.
The Dart file states its command set once, in a single greppable `const String _commands =
'MLCHVZ';`, and `packages/codegen/test/flutter-svg-path.test.mjs` reads the file and asserts that
set is exactly `SUPPORTED_COMMANDS`. The check is deliberately shallow — one declaration, not
regex archaeology over a switch — because everything else about the two agreeing is proved by
behaviour on both sides.

**The contract is "accept everything the JS accepts, reject everything it rejects".** The
symmetry is the point: a Dart parser that is *stricter* would let a future Figma export pass the
build and then throw inside an app, which is the worst of the two failure modes. So the scanner
is `checkPathData` transposed, regex for regex:

- `M L C H V Z`, absolute only. A lowercase form of one of those six is reported as a **relative**
  command, which is a different problem from an unsupported one and worth telling apart. Every
  other letter is unsupported — including `a`, because `A` is not in the set either, so the
  lowercase/relative distinction never applies to an arc.
- Path data must begin with a moveto, whether the first token is a letter or a number.
- **Arity is a multiple, not an equality.** `H1 2` is two horizontal linetos, `M0 0 5 5` is a
  moveto and then an implicit lineto, `C` with 12 numbers is two cubics, and `C` with 3 is an
  error. `Z` takes none. The count is checked when a run ends, because only the total tells a
  legal repeat from a truncation.
- Numbers are the full SVG grammar: optional sign, digits with an optional decimal point
  including the leading-dot form `.5`, optional exponent. Separators are any run of whitespace
  and commas, or nothing at all when a sign starts the next number, so `1-2` is two numbers.
- Every rejection is a `FormatException` carrying the message, the offending `d` and the offset.

**What the corpus actually holds**, measured over all 812 path strings in the spec, so it is
clear which of that grammar is load-bearing and which is defensive:

| | |
| --- | --- |
| 812 path strings | 792 in the 682 icon variants, 20 in the four vector logos |
| Negative numbers | 21 of them, in 12 paths, in 12 icon variants. **Real** |
| Scientific notation | 5 paths, in 5 variants: `channel-strip` outline, both `meeting-room`, `touch-panel` outline, `zone` solid. Smallest is `9.87904e-05`. **Real** |
| Commas, leading-dot numbers, `1-2` minus separators, explicit `+`, implicit repeats | **none, anywhere.** Supported because they are valid SVG and `checkPathData` accepts them, but speculative — the code and the tests say so rather than implying the data contains one |

**Geometry.** The current point and the subpath start are tracked by hand: `M` moves and records
the start, `L` and `C` draw, `H` and `V` line to one new coordinate and the current value of the
other, and `Z` closes and returns the current point to the subpath start — which is what a
following `H` or `V` measures from. The fill type is deliberately left alone; `fill-rule` travels
beside the path data in the spec and Task 7 applies it per path.

```dart
import 'dart:ui' show Path;

/// Turns SVG path data into a [Path].
///
/// Hand written, not generated. A parser is behaviour, not data: the generated files under
/// `lib/src/generated/` are recipes -- geometry and a name -- and everything that reads them
/// lives outside that tree, the way `icon.tsx` sits outside `src/generated/` on the React side.
///
/// **It accepts exactly what the generator accepts.** `checkPathData` in
/// `packages/codegen/src/normalize/svg.mjs` validates every `d` string at generation time and
/// this function replays it at run time, so the two have to agree in both directions. If this
/// parser were stricter, a future Figma export could pass the build and then throw inside an
/// app; if it were looser, it would draw something the generator never checked. The command set
/// is stated once, in [_commands], and `packages/codegen/test/flutter-svg-path.test.mjs` reads
/// this file and asserts it matches `SUPPORTED_COMMANDS` so the two cannot drift apart.

/// The commands this parser draws, absolute only. Mirrors `SUPPORTED_COMMANDS` on the JS side.
///
/// A lowercase form of one of these is a *relative* command and is reported as such, separately
/// from a letter that is simply not supported: `a` and `A` alike are unsupported, because an arc
/// is not in the set at all, and an arc is the one that will actually turn up.
const String _commands = 'MLCHVZ';

/// How many numbers each command consumes.
///
/// A command may repeat its arguments: `H1 2` is two horizontal linetos and `M0 0 5 5` is a
/// moveto followed by an implicit lineto. A run is therefore well formed when its count is a
/// positive multiple of this, which is what separates a legal repeat from a truncated `C1 2 3`.
const Map<String, int> _arity = <String, int>{
  'M': 2,
  'L': 2,
  'C': 6,
  'H': 1,
  'V': 1,
  'Z': 0,
};

// Matched with matchAsPrefix, so the scan can name the exact character it could not read rather
// than skipping ahead to the next thing that happens to match. These are the JS scanner's three
// regexes, character for character.
final RegExp _number = RegExp(r'[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?');
final RegExp _letter = RegExp(r'[a-zA-Z]');
final RegExp _separator = RegExp(r'[\s,]+');

/// Parses SVG path data into a [Path].
///
/// Accepts `M L C H V Z`, absolute only, with numbers in the full SVG grammar: an optional sign,
/// digits with an optional decimal point (including the leading-dot form `.5`) and an optional
/// exponent, separated by any run of whitespace and commas, or by nothing at all when a sign
/// starts the next number (`1-2` is two numbers). Of those, only negative numbers and scientific
/// notation occur in the SOLAR corpus today -- commas, leading-dot numbers, `1-2` separators,
/// explicit plus signs and implicit repeats do not. They are supported anyway, because they are
/// valid SVG and the generator's validator accepts them, but they are speculative rather than
/// exercised by the data.
///
/// The fill type is deliberately not set: `fill-rule` travels beside the path data in the spec
/// and is applied per path by the caller.
///
/// Throws a [FormatException] naming what it found for anything else.
Path parseSvgPath(String d) {
  final String text = d.trim();
  if (text.isEmpty) {
    throw FormatException('path data is empty', d);
  }

  final Path path = Path();
  final List<double> args = <double>[];

  int at = 0;
  bool first = true;
  String? command;
  int count = 0;
  // Which argument group of the current run is being read. Only M cares: its first group is a
  // moveto and every later one is an implicit lineto.
  int group = 0;

  // The current point, and the start of the current subpath, which is where Z returns to.
  double x = 0;
  double y = 0;
  double startX = 0;
  double startY = 0;

  // Checked when the run ends rather than per number, because only the total distinguishes a
  // legal repeat from a truncated command.
  void endRun() {
    if (command == null) {
      return;
    }
    final int need = _arity[command]!;
    final bool ok = need == 0 ? count == 0 : count > 0 && count % need == 0;
    if (!ok) {
      throw FormatException(
        '"$command" takes $need argument${need == 1 ? '' : 's'} '
        'but was given $count',
        d,
      );
    }
  }

  void apply() {
    switch (command) {
      case 'M':
        // Extra coordinate pairs after a moveto are linetos, per the SVG grammar.
        if (group == 0) {
          path.moveTo(args[0], args[1]);
          startX = args[0];
          startY = args[1];
        } else {
          path.lineTo(args[0], args[1]);
        }
        x = args[0];
        y = args[1];
      case 'L':
        path.lineTo(args[0], args[1]);
        x = args[0];
        y = args[1];
      case 'C':
        path.cubicTo(args[0], args[1], args[2], args[3], args[4], args[5]);
        x = args[4];
        y = args[5];
      case 'H':
        x = args[0];
        path.lineTo(x, y);
      case 'V':
        y = args[0];
        path.lineTo(x, y);
    }
    args.clear();
    group += 1;
  }

  while (at < text.length) {
    final Match? number = _number.matchAsPrefix(text, at);
    if (number != null) {
      if (first) {
        throw FormatException(
          'path data starts with "${number[0]}", not a moveto',
          d,
          at,
        );
      }
      args.add(double.parse(number[0]!));
      count += 1;
      at = number.end;
      if (args.length == _arity[command]) {
        apply();
      }
      continue;
    }

    final Match? letter = _letter.matchAsPrefix(text, at);
    if (letter != null) {
      final String next = letter[0]!;
      if (!_commands.contains(next)) {
        final String why = _commands.contains(next.toUpperCase())
            ? 'relative path command "$next"'
            : 'unsupported path command "$next"';
        throw FormatException(
          '$why in path data; only ${_commands.split('').join(' ')} '
          'are supported',
          d,
          at,
        );
      }
      if (first && next != 'M') {
        throw FormatException(
          'path data starts with "$next", not a moveto',
          d,
          at,
        );
      }
      endRun();
      first = false;
      command = next;
      count = 0;
      group = 0;
      args.clear();
      at = letter.end;
      if (next == 'Z') {
        path.close();
        // Z leaves the current point at the start of the subpath it closed, which is what a
        // following H or V measures from.
        x = startX;
        y = startY;
      }
      continue;
    }

    final Match? separator = _separator.matchAsPrefix(text, at);
    if (separator != null) {
      at = separator.end;
      continue;
    }

    throw FormatException(
      'unreadable character "${text[at]}" in path data at offset $at',
      d,
      at,
    );
  }

  endRun();
  return path;
}
```

**Tests: 14 Dart cases and 4 JS.**

Dart (`packages/solar_flutter/test/svg_path_test.dart`) asserts geometry — `Path.getBounds()` and
`Path.contains()` — rather than only that nothing threw. A line; a cubic, checked by a point
under its sag; `H` then `V` continuing from each other; `Z` proved by building a second triangle
out of `H`/`V` that is only the right shape if the current point went back to the subpath start;
negative coordinates; scientific notation; an implicit repeat, checked as a triangle that a
second moveto could not have drawn; and the comma, doubled-space, `10-10`, `.5` and `+10` forms
that the corpus does not contain. Then a `FormatException` each for an arc, a relative `l`, a
lowercase arc (unsupported, not relative), data starting with a letter that is not `M`, data
starting with a number, a truncated `C`, a truncated `L`, a `Z` given an argument, empty data and
an unreadable character.

The last case is a real one: `zone`'s outline path 7 of 9, pasted verbatim from the spec as SOLAR
drew it until 2026-09-22. It has two subpaths wound against each other, eight cubics, a `Z` on each
and the negative control points that put its bounds above the origin, on what was then the one icon
whose viewBox is `0 0 24 25`. Its bounds and four containment probes are asserted, including the
hole through the middle of the pin. The string is kept now that the icon has been redrawn, because
what it proves about the parser is a property of the string, not of which icon it came from.

JS (`packages/codegen/test/flutter-svg-path.test.mjs`) is the anti-drift assertion: the Dart file
declares `_commands` exactly once, that set equals `SUPPORTED_COMMANDS`, `_arity` gives every one
of them a count and invents none, and no `case` in the parser names a command outside the set.

Separately, as a one-off check rather than a committed test, all 812 spec path strings were run
through the Dart parser: every one parses and none yields empty bounds. Task 8 is where that
becomes a standing assertion.

Run: `cd packages/solar_flutter && flutter test test/svg_path_test.dart` and
`npx vitest run packages/codegen/test/flutter-svg-path.test.mjs`

The repository owner commits `packages/solar_flutter/lib/src/svg_path.dart`,
`packages/solar_flutter/test/svg_path_test.dart` and
`packages/codegen/test/flutter-svg-path.test.mjs`.

---

### Task 7: Flutter icon and logo emitter — done

**Files:**

- Created: `packages/solar_flutter/lib/src/solar_icon.dart` (hand written)
- Created: `packages/codegen/src/emit/flutter-icons.mjs`
- Created: `packages/codegen/test/flutter-icons.test.mjs`
- Created: `packages/solar_flutter/test/icons_test.dart`
- Modified: `packages/solar_flutter/lib/solar_flutter.dart` (the new public surface)

`renderFlutterIcons(spec)` returns `{icons, logos, manifest}` as strings and data, so the tests
run without touching the disk; `emitFlutterIcons(spec, fileVersion)` writes them through
`writeGenerated` into `packages/solar_flutter/lib/src/generated/`: `icons.dart`, `logos.dart` and
`icons.manifest.json`. The CLI wiring is still task 9, so the files were emitted by calling the
emitter directly and then formatted with `dart format`, which is what the CLI already does for
`tokens.dart`.

**The types and the widget are hand written; only the data is generated.** This is the same split
tasks 3 and 6 arrived at, and it is now the rule rather than three separate decisions:
`lib/src/solar_icon.dart` holds `SolarVector`, `SolarVectorPath`, `SolarVectorPainter`,
`SolarIcon` and `SolarLogo`, and sits **outside** `lib/src/generated/`, which stays the tree
`solar:codegen` owns. Accessibility, the colour chain, the fit and the parse cache are behaviour,
and deciding them once beats generating 682 copies of the same control flow through a JS template
string. `parseSvgPath` stays internal: `solar_flutter.dart` exports the two generated data
libraries, `tokens.dart` and `solar_icon.dart`, and nothing else.

**One `static const` per variant, and deliberately no map.** The constants are
`SolarIcons.chevronRightOutline` / `chevronRightSolid` and `SolarLogos.biampDarkSm`. Dart
tree-shakes static fields individually — the same property `SolarIconSize.lg` already relies on
in the token file — so taking one icon costs one icon, and the names autocomplete. A
`Map<String, SolarVector>` would reference every field, so any build that touched the class would
retain all 358 KB of path data; the class doc says so, and a test asserts the emitted code holds
no `Map<`. Measured on the real catalog: **682 names, all unique, every one matching
`^[a-z][A-Za-z0-9]*(Outline|Solid)$`**, so none needs the `$` escaping the token emitter uses for
`2xs` and `default` — a stem is always followed by `Outline` or `Solid`.

**What is in the files.** 341 icons × 2 variants = **682 `SolarVector` constants carrying 792
paths, 75 of them `evenOdd: true`**, and no colour at all: `#111111` does not appear, and neither
does `Color(`, which is asserted on both sides. `logos.dart` carries **four** constants —
`biampDarkSm`, `biampLightSm`, `osGoogle`, `osMicrosoft` — with 20 paths, every one of which names
its own `Color(0x…)` through the token emitter's `dartColor`, so the two Dart files convert
colours the same way. The `app-icon` set is skipped because it is raster: it is not an omission,
it is five PNGs that React ships as data URLs and a Flutter app loads as image assets.

**The Teams mark is absent, and the emitter proves that is the only thing missing.**
`spec.logos['os-logo'].variants.teams` is `{unsupported, source}` and task 5 recorded that Flutter
omits it. The emitter collects what it actually skipped and compares it to `OMITTED_VARIANTS`,
which is exactly `['os-logo.teams']`; anything else stops the build with both lists in the
message. A second unrepresentable mark is a governance question, not something to drop from one
target quietly.

**Fit, do not stretch.** The painter scales the viewBox into the target box by
`min(w/vw, h/vh)` and centres it — `BoxFit.contain` semantics. SVG gets this free from the default
`preserveAspectRatio`, so Flutter has to match it or a drawing that is not square would render
squashed here and letterboxed on the web. `zone`, drawn on `0 0 24 25`, was the icon that needed it
until SOLAR redrew it on 2026-09-22; the logos are not square either, and the test now builds its
own 24 × 25 vector so the case stays covered. `SolarVector` carries an extent rather than
a rectangle, and the emitter throws on a viewBox that does not start at the origin: nothing in the
corpus is offset, and dropping an offset silently would draw the mark in the wrong place.

**The colour chain**, documented on `SolarIcon` and asserted three times: the explicit `color`,
else the ambient `SolarTheme` extension's `colors.iconPrimary`, else `IconTheme.of(context).color`
— so a SOLAR icon in a Material button matches the icons beside it — else black. A path whose
`fill` is non-null uses that colour and ignores the widget's, which is the one thing that lets a
single painter serve both icons and brand marks.

**`SolarLogo` takes no `color` argument at all.** A tinted brand mark is a brand violation, so the
type system refuses it rather than a comment asking nicely — the exact inverse of `SolarIcon`, and
the inverse of the `currentColor` contract on the web. Its `size` sets the **height** and the width
follows the aspect ratio, because the Biamp wordmark is 36 × 12 and one length on both axes would
squash it.

**The parsed `Path` is cached.** `parseSvgPath` scans strings up to 3913 characters and a painter
repaints far more often than its data changes. The cache is an `Expando<Path>` keyed on the
`SolarVectorPath` instance: the vectors are compile-time constants with no `==` of their own, so
identity is the right key, and an `Expando` being weak means it holds nothing alive that the
program has otherwise dropped. `evenOdd` is applied there, as `PathFillType.evenOdd` — without it
the 75 even-odd paths render as filled blobs.

**A manifest, not only two Dart files.** `icons.manifest.json` records
`{constant, viewBox, pathCount, digest}` per variant plus the `omitted` list, using
`geometryDigest` from the React icon emitter and `logoDigest` from the React logo emitter rather
than a second canonical form that happens to agree. That is what task 5 exported them for, and it
is what task 8 compares; a test here already checks all 682 icon digests against React's.

```dart
import 'dart:math' as math;

import 'package:flutter/material.dart' show Theme;
import 'package:flutter/widgets.dart';

import 'generated/tokens.dart' show SolarIconSize, SolarTheme;
import 'svg_path.dart';

/// The vector types and the widgets that draw them.
///
/// Hand written, not generated, the same way `icon.tsx` is on the React side: the files under
/// `lib/src/generated/` are recipes -- geometry and a name -- and everything that is behaviour
/// rather than data is decided once, here. Only `lib/src/generated/` is machine owned.

/// One filled subpath of a SOLAR vector.
@immutable
class SolarVectorPath {
  /// Creates a path from SVG path data.
  const SolarVectorPath(this.d, {this.evenOdd = false, this.fill});

  /// SVG path data, byte identical to the string the web target ships.
  ///
  /// It is replayed by [parseSvgPath], which accepts exactly what the generator validated:
  /// `M L C H V Z`, absolute only.
  final String d;

  /// Whether the path is filled by the even-odd rule rather than the non-zero rule.
  ///
  /// 75 paths in the SOLAR corpus are even-odd. Without this they render as filled blobs
  /// instead of shapes with holes.
  final bool evenOdd;

  /// The colour this path is drawn in.
  ///
  /// Null means the colour the widget was given, matching `currentColor` on the web: an icon
  /// path always inherits, a logo path never does. A path that names a colour ignores the
  /// widget's, which is what lets one painter serve both icons and brand marks.
  final Color? fill;
}

/// One drawing: a viewBox extent and the paths inside it.
@immutable
class SolarVector {
  /// Creates a vector from its viewBox extent and its paths.
  const SolarVector({
    required this.width,
    required this.height,
    required this.paths,
  });

  /// The viewBox width. Every SOLAR viewBox starts at the origin, so this is its extent.
  final double width;

  /// The viewBox height. 24 for every icon today, but carried per variant: `zone` outline was
  /// drawn 25 tall until SOLAR redrew it on the grid.
  final double height;

  /// The paths, painted in order.
  final List<SolarVectorPath> paths;

  /// The drawing's intrinsic ratio, which is what keeps a 36 x 12 wordmark a wordmark.
  double get aspectRatio => width / height;
}

/// Parsed paths, keyed by the [SolarVectorPath] they came from.
///
/// [parseSvgPath] scans strings up to 3913 characters, and a painter repaints far more often
/// than the data changes, so the result is kept rather than rebuilt on every frame. The vectors
/// are compile-time constants with no `==` of their own, so the [Expando] is keyed on identity;
/// being weak, it also holds nothing alive that the program has otherwise dropped.
final Expando<Path> _parsed = Expando<Path>('SolarVectorPath');

Path _pathOf(SolarVectorPath source) {
  final Path? cached = _parsed[source];
  if (cached != null) {
    return cached;
  }
  final Path path = parseSvgPath(source.d)
    ..fillType = source.evenOdd ? PathFillType.evenOdd : PathFillType.nonZero;
  _parsed[source] = path;
  return path;
}

/// Paints a [SolarVector] into a box, scaled to fit and centred.
///
/// The fit is `BoxFit.contain`: one scale factor for both axes. SVG does this for free through
/// the default `preserveAspectRatio`, so Flutter has to match it or a drawing that is not square
/// -- `zone` outline was `0 0 24 25` until SOLAR redrew it, and the logos still are not square --
/// would render stretched here and letterboxed on the web.
class SolarVectorPainter extends CustomPainter {
  /// Creates a painter for [vector], drawing inheriting paths in [color].
  const SolarVectorPainter(this.vector, this.color);

  /// The drawing.
  final SolarVector vector;

  /// The colour for paths that inherit one. A path with its own [SolarVectorPath.fill]
  /// ignores it.
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    if (size.isEmpty) {
      return;
    }
    final double scale = math.min(
      size.width / vector.width,
      size.height / vector.height,
    );
    canvas.save();
    canvas.translate(
      (size.width - vector.width * scale) / 2,
      (size.height - vector.height * scale) / 2,
    );
    canvas.scale(scale);
    final Paint paint = Paint()..isAntiAlias = true;
    for (final SolarVectorPath source in vector.paths) {
      paint.color = source.fill ?? color;
      canvas.drawPath(_pathOf(source), paint);
    }
    canvas.restore();
  }

  @override
  bool shouldRepaint(SolarVectorPainter oldDelegate) =>
      oldDelegate.vector != vector || oldDelegate.color != color;
}

Widget _labelled(String? semanticLabel, Widget child) => Semantics(
      label: semanticLabel,
      image: semanticLabel == null ? null : true,
      child: ExcludeSemantics(child: child),
    );

/// A SOLAR icon, drawn from its vector data.
///
/// ```dart
/// const SolarIcon(SolarIcons.chevronRightOutline)
/// ```
///
/// **Colour.** An icon is monochrome and takes its colour from its surroundings, the way
/// `currentColor` works on the web. The first of these that is set wins:
///
/// 1. the explicit [color];
/// 2. the ambient [SolarTheme] extension's `colors.iconPrimary`;
/// 3. `IconTheme.of(context).color`, so an icon inside a button or a list tile matches the
///    Material icons beside it;
/// 4. black, which is only reached if a caller has removed the default icon theme.
///
/// **Size.** [size] is the side of a square box and defaults to [SolarIconSize.lg] (24). The
/// drawing is scaled to fit that box with its aspect ratio kept, so a variant that is not square
/// is letterboxed rather than stretched.
///
/// **Semantics.** [semanticLabel] names the icon for assistive technology. Without one the icon
/// is excluded from the semantics tree, because an unlabelled icon sits beside a label that
/// already says what it means.
class SolarIcon extends StatelessWidget {
  /// Creates an icon drawing [icon].
  const SolarIcon(
    this.icon, {
    super.key,
    this.size,
    this.color,
    this.semanticLabel,
  });

  /// The drawing, normally a constant from `SolarIcons`.
  final SolarVector icon;

  /// The side of the square box to draw into. Defaults to [SolarIconSize.lg].
  final double? size;

  /// The colour to draw in. See the class doc for what is used when this is null.
  final Color? color;

  /// The accessible name. Without one the icon is hidden from assistive technology.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final double side = size ?? SolarIconSize.lg;
    final Color resolved = color ??
        Theme.of(context).extension<SolarTheme>()?.colors.iconPrimary ??
        IconTheme.of(context).color ??
        const Color(0xFF000000);

    return _labelled(
      semanticLabel,
      SizedBox(
        width: side,
        height: side,
        child: CustomPaint(
          size: Size(side, side),
          painter: SolarVectorPainter(icon, resolved),
        ),
      ),
    );
  }
}

/// A SOLAR brand mark, drawn from its vector data.
///
/// ```dart
/// const SolarLogo(SolarLogos.biampDarkSm)
/// ```
///
/// **It takes no colour.** A logo carries the colours SOLAR drew it in and a tinted brand mark
/// is a brand violation, so there is no `color` argument for the compiler to accept -- the
/// inverse of [SolarIcon], and enforced by the type rather than by a comment asking nicely.
///
/// **[size] sets the height** and the width follows the mark's aspect ratio. The Biamp wordmark
/// is 36 x 12: one length on both axes would squash it.
class SolarLogo extends StatelessWidget {
  /// Creates a logo drawing [logo].
  const SolarLogo(this.logo, {super.key, this.size, this.semanticLabel});

  /// The drawing, normally a constant from `SolarLogos`.
  final SolarVector logo;

  /// The height to draw at. Defaults to [SolarIconSize.lg]; SOLAR publishes no logo scale.
  final double? size;

  /// The accessible name. Without one the logo is hidden from assistive technology.
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final double height = size ?? SolarIconSize.lg;
    final double width = height * logo.aspectRatio;

    return _labelled(
      semanticLabel,
      SizedBox(
        width: width,
        height: height,
        child: CustomPaint(
          size: Size(width, height),
          // Every logo path carries its own fill, so this colour is never used. The painter
          // needs one because it also serves icons, where every path inherits.
          painter: SolarVectorPainter(logo, const Color(0xFF000000)),
        ),
      ),
    );
  }
}
```

```js
/**
 * Emits the SOLAR icons and logos as Dart data.
 *
 * **Data only.** The types, the widgets and the painter are hand written in
 * `packages/solar_flutter/lib/src/solar_icon.dart`, for the same reason `icon.tsx` is hand
 * written on the React side: a generated file is a recipe -- a viewBox and some path strings --
 * and everything that is behaviour is decided once, outside the machine-owned tree.
 *
 * **One static const per variant, and deliberately no map.** Dart tree-shakes static fields
 * individually, the way `SolarIconSize.lg` already does in the token file, so taking one icon
 * costs one icon. A `Map<String, SolarVector>` would reference every field, and any build that
 * touched the class would retain all 358 KB of path data. The constants also autocomplete,
 * which a string-keyed map does not.
 *
 * **The Teams mark is absent.** `logos/os-logo/teams.svg` is 11 radial gradients, one linear
 * gradient and every `fill-opacity` in the corpus, which the vector IR cannot represent;
 * redrawing it in a hand-written painter is disproportionate work for one third-party mark and
 * approximating it would invent a brand colour. React and the raw SVG output both carry the real
 * mark, so the gap is one platform's, recorded in the `logo.os-logo.teams` deviation. The
 * emitter asserts it is the *only* variant it skipped, so a second unsupported asset fails the
 * build instead of disappearing quietly.
 */

import { join } from 'node:path';
import { packagesDir } from '../util/paths.mjs';
import { byCodeUnit } from '../util/sort.mjs';
import { writeGenerated } from '../util/write.mjs';
import { dartColor } from './flutter.mjs';
import { geometryDigest } from './react-icons.mjs';
import { logoDigest } from './react-logos.mjs';

const OUT_DIR = join(packagesDir, 'solar_flutter', 'lib', 'src', 'generated');

const HEADER =
  '// Generated by @bwp-web/codegen from spec/icons.json. Do not edit.\n';

/**
 * The one asset the Flutter target does not carry, spelled out rather than inferred.
 *
 * Written as `<set>.<variant>`. The emitter compares what it actually skipped against this, so
 * a second unrepresentable mark stops the build.
 */
export const OMITTED_VARIANTS = ['os-logo.teams'];

const quote = (text) =>
  `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

const dbl = (n) => (Number.isInteger(n) ? `${n}.0` : String(n));

const pascal = (text) =>
  text
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');

const camel = (text) => {
  const name = pascal(text);
  return name[0].toLowerCase() + name.slice(1);
};

/**
 * A Dart field name for one variant of one asset: `chevron-right` + `outline` becomes
 * `chevronRightOutline`.
 *
 * No `$` escaping, unlike the token emitter: a token tail can be `2xs` or `default`, but every
 * one of the 682 icon names is a stem followed by `Outline` or `Solid`, so none can start with
 * a digit and none can be a reserved word. That is asserted rather than assumed.
 */
export function dartVariantName(stem, variant) {
  const name = camel(stem) + pascal(variant);
  if (!/^[a-z][A-Za-z0-9]*$/.test(name))
    throw new Error(
      `${stem}/${variant} produces "${name}", which is not a plain Dart field name`,
    );
  return name;
}

// A doc comment is line based, so only a newline could break out of it; the catalog descriptions
// are single-line prose today, and collapsing rather than trusting that keeps it true.
const line = (text) => String(text).replace(/\s+/g, ' ').trim();

const pathLiteral = (path) =>
  `SolarVectorPath(${quote(path.d)}` +
  (path.fillRule === 'evenodd' ? ', evenOdd: true' : '') +
  (path.fill ? `, fill: ${dartColor(path.fill)}` : '') +
  ')';

function vectorLiteral(name, geometry, doc) {
  const [minX, minY, width, height] = geometry.viewBox;
  // The type carries an extent, not a rectangle: nothing in the corpus is offset, and silently
  // dropping an offset would draw the mark in the wrong place.
  if (minX !== 0 || minY !== 0)
    throw new Error(
      `${name}: viewBox "${geometry.viewBox.join(' ')}" does not start at the origin, ` +
        'which SolarVector cannot represent',
    );
  return (
    doc.map((text) => `  /// ${text}\n`).join('  ///\n') +
    `  static const SolarVector ${name} = SolarVector(\n` +
    `    width: ${dbl(width)},\n` +
    `    height: ${dbl(height)},\n` +
    '    paths: <SolarVectorPath>[\n' +
    geometry.paths.map((p) => `      ${pathLiteral(p)},\n`).join('') +
    '    ],\n' +
    '  );\n'
  );
}

const CLASS_DOC =
  '/// Every SOLAR %WHAT%, one `static const` per variant.\n' +
  '///\n' +
  '/// Static fields tree-shake individually, so taking one costs one: there is deliberately no\n' +
  '/// `Map<String, SolarVector>` here, because a map would reference every field and pull all of\n' +
  '/// the path data into any build that touched the class.\n';

/**
 * Renders both Dart files and the manifest, as data.
 *
 * Returning strings rather than writing them keeps the tests off the disk, so "no #111111
 * anywhere" is a property of what this function produces rather than of whatever is checked in.
 */
export function renderFlutterIcons(spec) {
  const icons = {};
  const iconMembers = [];

  for (const stem of Object.keys(spec.icons).sort(byCodeUnit)) {
    const icon = spec.icons[stem];
    const variants = {};
    for (const variant of ['outline', 'solid']) {
      const geometry = icon.variants[variant];
      const name = dartVariantName(stem, variant);
      iconMembers.push(
        vectorLiteral(name, geometry, [
          line(icon.description),
          `The ${variant} variant of ${icon.name}, in the ${icon.category} category.`,
        ]),
      );
      variants[variant] = {
        constant: name,
        viewBox: geometry.viewBox.join(' '),
        pathCount: geometry.paths.length,
        digest: geometryDigest(geometry.paths),
      };
    }
    icons[stem] = { variants };
  }

  const logos = {};
  const logoMembers = [];
  const omitted = [];

  for (const set of Object.keys(spec.logos).sort(byCodeUnit)) {
    const logo = spec.logos[set];
    // The app icons are PNGs. They have no vector to emit and are not omissions: React ships
    // them as data URLs and a Flutter app loads them as image assets.
    if (logo.raster) continue;
    // LogoBiamp becomes biamp*, LogoOs becomes os*: the constants are named after the component
    // the React side exports, not after the Figma set, so the two targets read the same.
    const prefix = camel(logo.component.replace(/^Logo/, ''));
    const variants = {};
    for (const slug of Object.keys(logo.variants).sort(byCodeUnit)) {
      const geometry = logo.variants[slug];
      if (geometry.unsupported) {
        omitted.push(`${set}.${slug}`);
        continue;
      }
      const name = dartVariantName(prefix, slug);
      logoMembers.push(
        vectorLiteral(name, geometry, [
          `${logo.name}, ${slug}. A brand mark: it carries its own colours and is never tinted.`,
        ]),
      );
      variants[slug] = {
        constant: name,
        viewBox: geometry.viewBox.join(' '),
        pathCount: geometry.paths.length,
        digest: logoDigest(geometry.paths),
      };
    }
    logos[set] = { component: logo.component, variants };
  }

  if (
    omitted.length !== OMITTED_VARIANTS.length ||
    omitted.some((name, i) => name !== OMITTED_VARIANTS[i])
  )
    throw new Error(
      `Flutter skipped ${omitted.join(', ') || 'nothing'}, but only ` +
        `${OMITTED_VARIANTS.join(', ')} may be skipped; an asset the vector IR cannot ` +
        'represent is a governance question, not something to drop from one target quietly',
    );

  const library = (what, className, members, imports) =>
    `// SOLAR ${what}s for Flutter.\n` +
    HEADER +
    '\n' +
    imports +
    CLASS_DOC.replaceAll('%WHAT%', what) +
    `abstract final class ${className} {\n` +
    members.join('\n') +
    '}\n';

  return {
    icons: library(
      'icon',
      'SolarIcons',
      iconMembers,
      "import '../solar_icon.dart';\n\n",
    ),
    logos: library(
      'logo',
      'SolarLogos',
      logoMembers,
      "import 'package:flutter/painting.dart' show Color;\n\n" +
        "import '../solar_icon.dart';\n\n",
    ),
    manifest: { icons, logos, omitted },
  };
}

export function emitFlutterIcons(spec, fileVersion) {
  const { icons, logos, manifest } = renderFlutterIcons(spec);
  writeGenerated(join(OUT_DIR, 'icons.dart'), icons);
  writeGenerated(join(OUT_DIR, 'logos.dart'), logos);
  writeGenerated(
    join(OUT_DIR, 'icons.manifest.json'),
    JSON.stringify(
      {
        _note:
          'Written by the SOLAR codegen. One entry per icon and logo variant; "constant" is the Dart field it was emitted as and "digest" is a SHA-256 of the canonical JSON of that variant\'s paths, which is what the parity suite compares across targets. The path data itself is not repeated here: it is 358 KB and already lives in icons.dart. "omitted" lists the variants this target does not carry.',
        target: 'flutter',
        fileVersion,
        ...manifest,
      },
      null,
      2,
    ) + '\n',
  );
  return Object.keys(manifest.icons).length;
}
```

**Tests: 17 Dart cases and 14 JS.**

JS (`packages/codegen/test/flutter-icons.test.mjs`) reads the emitter's output back the way a Dart
compiler would — one block per `static const SolarVector`, and the path data inside it in order —
and asserts: 682 constants, all uniquely and legally named; every `d` string and both viewBox
extents byte-identical to the spec, for all 682; an extent taken from the variant rather than a
constant 24, asserted by emitting a hand-built 24 × 25 outline now that `zone` is square; `evenOdd`
exactly where the spec says `evenodd`, 75 times; no `#111111` and no `Color(` anywhere in
`icons.dart`; no `Map<` in the emitted code; and all 682 digests equal to the React emitter's.
Then the logos: the four constants in order, Google's four brand colours as `Color(0x…)` in order,
every logo path owning a fill, the two Biamp wordmarks differing only in it, and no `teams`
anywhere in `logos.dart` or the manifest. Three cases hold the refusals: Teams is the one
omission, a second `unsupported` variant throws naming both, and an offset viewBox throws.

Dart (`packages/solar_flutter/test/icons_test.dart`) paints. The central case is **every one of
the 682 vectors painted into a `PictureRecorder` canvas** — not a sample, because a path string
the Dart parser cannot replay is an icon that throws inside an app. Dart has no reflection, so
there is no way to walk 682 static fields by name, and adding a list to the library to make one
possible is exactly what the emitter refuses to do; the test reads the generated source instead,
which keeps the assertion over the whole set without putting anything in the shipped package that
only a test wants. The rest use a `RecordingCanvas implements Canvas` whose `noSuchMethod` throws,
so a new drawing call cannot slip past: `evenOdd` reaches the `Path` and a square with a hole
really has one (`Path.contains` at its centre is false under even-odd and true under non-zero);
a hand-built 24 × 25 vector is scaled by 24/25 and offset by 0.48 on x with nothing on y, while
`zoneSolid` -- like every icon since 2026-09-22 -- is scaled by 1 and not offset at all; the Biamp
wordmark at 24 high is scaled 2× and drawn 72 × 24; Google's
four paths draw in their own four colours with the widget's red nowhere among them; and an icon's
paths all draw in the colour the painter was given. Six widget cases cover the `lg` default, the
three steps of the colour chain, and the semantics — a named icon is an image carrying that name,
an unnamed one has no label at all. The last reads the `SolarLogo` constructor out of
`solar_icon.dart` and asserts it has no `color` parameter, which is the only way to assert the
absence of an argument.

**Verified.** `dart format lib test` clean; `flutter analyze` **1.3 s, no issues** — a 589 KB
generated file costs it nothing measurable; `flutter test` 39 passing (22 existing, 17 new) in
2.4 s; `npx vitest run` in `packages/codegen` 208 passing across 20 files; `npm run lint`,
`format`, `typecheck` and `build` all pass from the root. Emitting twice and formatting each time
gives identical SHA-256 digests for all three files, and `git status --porcelain docs/` is empty.

**Sizes**, after `dart format`: `icons.dart` **588,838 bytes / 8,428 lines**, `logos.dart` 9,086
bytes / 99 lines, `icons.manifest.json` 168,424 bytes. Unformatted the emitter writes 569,146 and
8,731 bytes; the difference is the formatter moving long string literals onto their own lines.

Run: `npx vitest run packages/codegen/test/flutter-icons.test.mjs` and
`cd packages/solar_flutter && flutter test test/icons_test.dart`

The repository owner commits `packages/solar_flutter/lib/src/solar_icon.dart`,
`packages/solar_flutter/lib/src/generated/icons.dart`,
`packages/solar_flutter/lib/src/generated/logos.dart`,
`packages/solar_flutter/lib/src/generated/icons.manifest.json`,
`packages/solar_flutter/lib/solar_flutter.dart`, `packages/solar_flutter/test/icons_test.dart`,
`packages/codegen/src/emit/flutter-icons.mjs` and
`packages/codegen/test/flutter-icons.test.mjs`.

---

### Task 8: Icon parity — done

**Files:**

- Created: `packages/codegen/test/icon-parity.test.mjs`

The same argument as token parity: the three targets are independent emitters, so something has
to prove they agree. For every icon and variant, React, the raw SVG and Flutter must carry
identical path data, viewBox and fill rule, and all three must match the spec.

**It reads the artifacts, not the manifests.** Milestone 1 taught this the hard way: three token
emitters recorded a mode they had forgotten to emit, and every manifest-reading assertion stayed
green, because a manifest is a claim about the output rather than the output. So this suite opens
the 341 generated TSX modules, the 682 generated SVG files and the two generated Dart libraries,
extracts the geometry back out of them, and compares that to the spec built in memory with
`buildIconSpec(loadIconCatalog())` — `spec/icons.json` is not written until task 9. It never reads
`icons.manifest.json` or `logos.manifest.json` as evidence of anything; `logos.manifest.json` is
opened only to be scanned for `currentColor` alongside every other generated logo artifact.

**The extraction is guarded, because a regex over generated source has two failure modes and only
one of them is loud.** Capturing too much reads the `solid` block as the `outline` one and every
variant looks wrong, which announces itself; capturing too little drops a path and the icon looks
*right*, which does not. Both are closed off. Each TSX geometry ends on a `};` in column 1 and
each Dart constant on a `);` at two spaces of indent, so no block can bleed into the next —
splitting a module on `const outline:` would return the solid block too. `readTsx` counts the
paths it matched against how many times the block says `d:` and throws if they differ. And the
inventory assertion pins 341 modules, 682 SVG files and 682 Dart constants before any geometry is
compared. The SVG target is parsed with `parseSvg` rather than pattern matched, which makes the
round trip — serialize from the spec, parse the file back, compare — a real assertion instead of
one regex agreeing with the regex that wrote the file.

Nine assertions:

| | |
| --- | --- |
| **on disk** | The four generated directories and the two Dart files exist, reported as one list naming `npm run solar:codegen`. A fresh clone gets that sentence rather than 682 ENOENTs. |
| **inventory** | 341 React modules, each yielding exactly `outline` and `solid`; 682 icon SVG files; 682 Dart constants. The three name mappings — `<stem>.tsx`, `<stem>-<variant>.svg`, `dartVariantName(stem, variant)` — are total and one-to-one, checked in both directions so an extra artifact fails as loudly as a missing one. |
| **geometry** | The central one. For all 682 variants the ordered `d` strings, the fill rule and the viewBox agree across React, SVG, Dart **and the spec**. Mismatches collect into a list naming target, icon and variant rather than failing on the first; `d` is compared in full and elided in the message, because a 2,000-character path recited in a failure is not a failure report. |
| **fill rule** | `fillRule: 'evenodd'`, `fill-rule="evenodd"` and `evenOdd: true` fall on exactly the same 75 paths as the spec's `evenodd`, checked both as a set of `<stem>/<variant>#<index>` keys and as a literal count of 75 in each target's bytes. It earns its own assertion because an even-odd icon rendered non-zero is a filled blob, and neither a path count nor a viewBox would notice. |
| **no icon carries a colour** | No `#rrggbb`, no `Color(`, no `rgb(`/`rgba(` anywhere in the 341 TSX modules, the 682 SVG files or `icons.dart`; no extracted icon path carries a fill in any target; and every path in every icon SVG says `fill="currentColor"`. Both halves of the contract — the absence, and the inheritance that replaces it. This is what makes an icon different from a token: a token's whole content is its value, an icon must have none. |
| **logos are the inverse** | Every path of every drawable logo variant names a `#rrggbb` in all three targets, and no generated logo artifact — the two TSX modules, `app-icon.ts`, the barrel, the manifest, the five SVG files, `logos.dart` — contains `currentColor`. `os-logo/teams` has no path list anywhere, so it is asserted to name its colours in gradient stops in both targets that carry it. |
| **logo geometry** | Every logo variant a target does carry is the same drawing as the spec, fills included. |
| **exactly one divergence** | Each logo variant gets a signature of which targets carry it. Only `react+svg+flutter` and `react+svg` are permitted, the `react+svg` group is exactly `['os-logo.teams']`, and the `logo.os-logo.teams` deviation the build actually recorded explains it. A second, undocumented divergence fails here and names the asset. |
| **a viewBox is per variant** | Two assertions since SOLAR redrew `zone` on the grid on 2026-09-22. On disk: every one of the 682 variants is `0 0 24 24` in the spec and all three targets, and every generated SVG file carries `width="24" height="24"`. In memory: the three emitters are run over a hand-built spec whose outline is `0 0 24 25`, and all three carry it, `width="24" height="25"` included. `zone` was the one asset a target could plausibly normalise to a square, and cropping it would fail no count. |

**Verified.** The suite is **10 tests in one file** (9 until the off-grid case was split into an
on-disk assertion and an in-memory one on 2026-09-22), reading **1,035 files** (341 icon TSX, 682
icon SVG, 5 logo modules, 5 logo SVG, `icons.dart`, `logos.dart`): **331–375 ms** for the file on
its own, of which roughly 250 ms is the tests themselves. It is not slow enough to be annoying, and
it parallelises with the rest. `npx vitest run` in `packages/codegen` is **225 passing across 21
files in 588 ms**, up from 208 across 20. `npm run lint`, `format`, `typecheck` and `build` all
pass from the root, and `git status --porcelain` shows only the new test file.

**The suite bites.** Each mutation was applied to a committed artifact, the suite run, and the file
restored from a copy; `git status --porcelain` is clean afterwards.

1. **One `d` string in the generated Dart.** `'M4 12C4 9.87827…'` → `'M5 12C4 9.87827…'` in
   `SolarIcons.accessibilityOutline`. One failure, in the geometry assertion:

   > `flutter accessibility/outline path 0: {"d":"M5 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C… (1457 chars)","fillRule":"nonzero","fill":null} vs spec {"d":"M4 12C4 9.87827 4.84285 7.84344 6.34315 6.34315C… (1457 chars)","fillRule":"nonzero","fill":null}`

2. **A dropped `fillRule` in one TSX module.** `fillRule: 'evenodd'` deleted from
   `icons/meeting-room.tsx`. Two failures:

   > `react meeting-room/solid path 0: {"d":"M9.5 2.49898C9.4998 2.99352 9.64627 3.47701 9.92… (2165 chars)","fillRule":"nonzero","fill":null} vs spec {…,"fillRule":"evenodd",…}`
   >
   > `react evenodd is missing meeting-room/solid#0`

3. **A colour in one icon SVG.** `fill="currentColor"` → `fill="#111111"` in
   `svg/icons/zone-outline.svg`. Two failures:

   > `svg zone/outline path 0: {"d":"M3.1748 21.7491H4.50781V24.0997H2.10254L1.98828 … (144 chars)","fillRule":"nonzero","fill":"#111111"} vs spec {…,"fill":null}`
   >
   > `svg/icons/zone-outline.svg names a colour: #111111`

Two more were run against the logo half, which the brief did not ask for and which changed the
suite:

4. **A tinted logo.** `fill: '#000000'` → `fill: 'currentColor'` in `logos/biamp.tsx`. The first
   attempt failed in the *extractor*, not in an assertion — `readTsx` matched four paths where the
   block declared five, because the `fill` pattern only accepted a hex colour, and the guard threw
   `logos/biamp.tsx: darkSm declares 6 paths, the extractor read 5`. Correct behaviour, but the
   wrong message: a tinted logo should arrive at the assertion that names it. The pattern now
   captures whatever `fill` says and leaves the judgement to the assertions, which then report:

   > `logos/biamp.tsx inherits a colour`
   >
   > `react biamp-logo.dark-sm path 0: {…,"fill":"currentColor"} vs spec {…,"fill":"#000000"}`

5. **A second divergence between the targets.** `svg/logos/os-logo-microsoft.svg` moved aside:

   > `os-logo.microsoft is carried by react+flutter`

   The first form of that assertion compared the *set of signatures* and reported only
   `expected ['react+flutter', 'react+svg', 'react+svg+flutter'] to equal ['react+svg', 'react+svg+flutter']`,
   which says the shape changed but not which asset. It now names the asset, which is what a
   failure at three in the morning needs.

**No defect was found in the emitters.** Nothing outside the new test file changed.

```js
/**
 * Icon parity: the generated artifacts, read back off disk, draw the same thing.
 *
 * The sibling of `parity.test.mjs`, with one lesson from milestone 1 written into its shape:
 * **a manifest is a claim about the output, not the output.** Three token emitters there
 * recorded a mode they had forgotten to emit, and every manifest-reading assertion stayed green.
 * So nothing here reads `icons.manifest.json`. It reads the generated TSX, the generated SVG
 * files and the generated Dart, extracts the geometry back out of them, and compares that to the
 * spec built in memory from `docs/solar-icons/`. A digest may cross-check; it may never be the
 * only evidence.
 *
 * Extraction is regex based, which has one specific failure mode: a pattern that captures too
 * much silently reads the solid block as the outline one and every variant looks wrong -- or,
 * worse, a pattern that captures too little drops a path and the icon looks *right*. Both are
 * guarded: every block's end is anchored, every extractor counts what it read against what the
 * text declares, and the inventory assertion pins the totals (341 modules, 682 variants) before
 * any geometry is compared.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  dartVariantName,
  renderFlutterIcons,
} from '../src/emit/flutter-icons.mjs';
import { renderReactIcons } from '../src/emit/react-icons.mjs';
import { renderSvgFiles } from '../src/emit/svg-files.mjs';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import { parseSvg } from '../src/normalize/svg.mjs';
import { packagesDir, repoRoot } from '../src/util/paths.mjs';
import { byCodeUnit } from '../src/util/sort.mjs';

const ASSETS = join(packagesDir, 'assets', 'src', 'generated');
const FLUTTER = join(packagesDir, 'solar_flutter', 'lib', 'src', 'generated');

const DIRS = {
  icons: join(ASSETS, 'icons'),
  logos: join(ASSETS, 'logos'),
  svgIcons: join(ASSETS, 'svg', 'icons'),
  svgLogos: join(ASSETS, 'svg', 'logos'),
};
const DART = {
  icons: join(FLUTTER, 'icons.dart'),
  logos: join(FLUTTER, 'logos.dart'),
};

const rel = (path) => relative(repoRoot, path);

const RUN_THE_GENERATOR =
  'the icon artifacts have not been generated; run `npm run solar:codegen`';

function read(path) {
  if (!existsSync(path))
    throw new Error(`${rel(path)} does not exist: ${RUN_THE_GENERATOR}`);
  return readFileSync(path, 'utf8');
}

const listing = (dir, ext) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(ext))
    .sort(byCodeUnit);

/** The one shape every extractor normalises a path to, so the comparison is a string compare. */
const asPath = (d, fillRule, fill) => ({
  d,
  fillRule: fillRule ?? 'nonzero',
  fill: fill ?? null,
});

const show = (path) => JSON.stringify(path);

// Path data runs to thousands of characters; a failure message has to name the icon, not recite
// the drawing, so `d` is elided in messages and compared in full.
const brief = (path) =>
  JSON.stringify({
    ...path,
    d:
      path.d.length > 48
        ? `${path.d.slice(0, 48)}… (${path.d.length} chars)`
        : path.d,
  });

/** Symmetric difference, phrased as the two directions that are not empty. */
function differences(label, actual, expected) {
  const a = new Set(actual);
  const e = new Set(expected);
  return [
    ...[...e]
      .filter((name) => !a.has(name))
      .map((n) => `${label} is missing ${n}`),
    ...[...a]
      .filter((name) => !e.has(name))
      .map((n) => `${label} has extra ${n}`),
  ];
}

const camel = (text) =>
  text
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word, i) =>
      i === 0
        ? word[0].toLowerCase() + word.slice(1)
        : word[0].toUpperCase() + word.slice(1),
    )
    .join('');

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

// The end is anchored on a `};` in column 1, so a module's two geometries cannot bleed into one
// another. Splitting on `const outline:` instead would return the solid block too.
const TSX_GEOMETRY =
  /^const (\w+): (?:Icon|Logo)Geometry = \{\n([\s\S]*?)\n\};$/gm;
// `fill` is captured as whatever it says rather than as a colour pattern: a tinted logo has to
// arrive at the assertion that names it, not disappear into an unmatched path here.
const TSX_PATH =
  /\{\s*d: '([^']*)',?(?:\s*fillRule: '(\w+)',?)?(?:\s*fill: '([^']*)',?)?\s*\}/g;
const TSX_VARIANT = /^const (\w+): Logo(?:Geometry|Markup) = \{$/gm;

function readTsx(file) {
  const source = read(file);
  const geometries = new Map();
  for (const [, name, body] of source.matchAll(TSX_GEOMETRY)) {
    const viewBox = /viewBox: '([^']*)'/.exec(body);
    if (!viewBox) throw new Error(`${rel(file)}: ${name} has no viewBox`);
    const paths = [...body.matchAll(TSX_PATH)].map(([, d, fillRule, fill]) =>
      asPath(d, fillRule, fill),
    );
    // Checked against the one thing a loose pattern cannot get wrong: how many times the block
    // says `d:`. A dropped path would otherwise leave a wrong icon looking identical to the spec.
    const declared = [...body.matchAll(/\bd: '/g)].length;
    if (paths.length !== declared)
      throw new Error(
        `${rel(file)}: ${name} declares ${declared} paths, the extractor read ${paths.length}`,
      );
    geometries.set(name, { viewBox: viewBox[1], paths });
  }
  return { source, geometries };
}

// dart format wraps the argument list, so the terminator is a `);` at two spaces of indent --
// the only one in the file at that depth.
const DART_VECTOR =
  /static const SolarVector (\w+) = SolarVector\(([\s\S]*?)\n {2}\);/g;

function readDart(file) {
  const source = read(file);
  const vectors = new Map();
  for (const [, name, body] of source.matchAll(DART_VECTOR)) {
    const width = /width: ([\d.]+)/.exec(body);
    const height = /height: ([\d.]+)/.exec(body);
    if (!width || !height)
      throw new Error(`${rel(file)}: ${name} has no extent`);
    // Splitting rather than matching a whole call: a logo path's `fill: Color(0x…)` nests
    // parentheses, which a single balanced pattern would have to spell out.
    const paths = body.split('SolarVectorPath(').slice(1);
    vectors.set(name, {
      // SolarVector carries an extent, not a rectangle, because nothing in the corpus is offset.
      viewBox: `0 0 ${Number(width[1])} ${Number(height[1])}`,
      paths: paths.map((chunk) => {
        const d = /^\s*'([^']*)'/.exec(chunk);
        if (!d)
          throw new Error(`${rel(file)}: ${name} has a path with no data`);
        const fill = /fill: Color\(0x([0-9A-Fa-f]{8})\)/.exec(chunk);
        if (fill && !/^ff/i.test(fill[1]))
          throw new Error(
            `${rel(file)}: ${name} is filled 0x${fill[1]}, which is not opaque`,
          );
        return asPath(
          d[1],
          /evenOdd: true/.test(chunk) ? 'evenodd' : 'nonzero',
          fill ? `#${fill[1].slice(2).toLowerCase()}` : null,
        );
      }),
    });
  }
  return { source, vectors };
}

// Parsed rather than pattern-matched: the raw SVG is the one target whose own reader already
// exists, and using it makes the round trip -- serialize from the spec, parse back, compare --
// a real assertion instead of a regex agreeing with the regex that wrote the file.
function readSvg(file) {
  const source = read(file);
  const parsed = parseSvg(source, { file: rel(file) });
  return {
    source,
    viewBox: parsed.viewBox.join(' '),
    paths: parsed.paths.map((p) => asPath(p.d, p.fillRule, p.fill)),
  };
}

const fromSpec = (geometry) => ({
  viewBox: geometry.viewBox.join(' '),
  paths: geometry.paths.map((p) => asPath(p.d, p.fillRule, p.fill)),
});

// ---------------------------------------------------------------------------

let spec,
  deviations,
  missing,
  stems,
  variants,
  react,
  reactSources,
  svg,
  dart,
  logoTable,
  logoPresence,
  logoGeometry,
  logoSources;

beforeAll(() => {
  ({ spec, deviations } = buildIconSpec(loadIconCatalog()));
  stems = Object.keys(spec.icons).sort(byCodeUnit);
  variants = stems.flatMap((stem) => [
    [stem, 'outline'],
    [stem, 'solid'],
  ]);

  missing = [...Object.values(DIRS), ...Object.values(DART)]
    .filter((path) => !existsSync(path))
    .map(rel);
  // Nothing below can read a file that is not there. The first assertion reports the whole list
  // with the command to fix it, which is more use than 682 ENOENTs from a fresh clone.
  if (missing.length) return;

  react = new Map();
  reactSources = new Map();
  for (const file of listing(DIRS.icons, '.tsx')) {
    const stem = file.slice(0, -'.tsx'.length);
    const { source, geometries } = readTsx(join(DIRS.icons, file));
    react.set(stem, geometries);
    reactSources.set(`icons/${file}`, source);
  }

  svg = new Map();
  for (const file of listing(DIRS.svgIcons, '.svg'))
    svg.set(file, readSvg(join(DIRS.svgIcons, file)));

  dart = readDart(DART.icons);

  // Logos: one table of every vector variant the spec describes, and which targets carry it.
  logoTable = [];
  for (const set of Object.keys(spec.logos).sort(byCodeUnit)) {
    const logo = spec.logos[set];
    if (logo.raster) continue; // the app icons are PNGs and are not components anywhere
    const prefix = camel(logo.component.replace(/^Logo/, ''));
    for (const slug of Object.keys(logo.variants).sort(byCodeUnit)) {
      logoTable.push({
        key: `${set}.${slug}`,
        set,
        slug,
        drawable: !logo.variants[slug].unsupported,
        reactConst: camel(slug),
        dartConst: dartVariantName(prefix, slug),
        svgFile: `${set}-${slug}.svg`,
        module: `${set.replace(/-logo$/, '')}.tsx`,
      });
    }
  }

  logoSources = new Map();
  const reactLogos = new Map();
  for (const file of readdirSync(DIRS.logos).sort(byCodeUnit)) {
    logoSources.set(`logos/${file}`, read(join(DIRS.logos, file)));
    if (file.endsWith('.tsx'))
      reactLogos.set(file, readTsx(join(DIRS.logos, file)));
  }
  for (const file of listing(DIRS.svgLogos, '.svg'))
    logoSources.set(`svg/logos/${file}`, read(join(DIRS.svgLogos, file)));
  const dartLogos = readDart(DART.logos);
  logoSources.set('logos.dart', dartLogos.source);

  // A variant is "in React" when its module declares it, whether as geometry or, for the Teams
  // mark, as the raw markup the vector IR cannot hold; only the drawable ones have a geometry.
  const declared = new Map(
    [...reactLogos].map(([file, { source }]) => [
      file,
      new Set([...source.matchAll(TSX_VARIANT)].map((m) => m[1])),
    ]),
  );
  const svgLogoFiles = new Set(listing(DIRS.svgLogos, '.svg'));

  const has = {
    react: (v) => declared.get(v.module)?.has(v.reactConst) ?? false,
    svg: (v) => svgLogoFiles.has(v.svgFile),
    flutter: (v) => dartLogos.vectors.has(v.dartConst),
  };
  logoPresence = Object.fromEntries(
    Object.entries(has).map(([target, present]) => [
      target,
      new Set(logoTable.filter(present).map((v) => v.key)),
    ]),
  );

  logoGeometry = { react: new Map(), svg: new Map(), flutter: new Map() };
  for (const variant of logoTable) {
    if (!variant.drawable) continue;
    const fromModule = reactLogos
      .get(variant.module)
      ?.geometries.get(variant.reactConst);
    if (fromModule) logoGeometry.react.set(variant.key, fromModule);
    if (svgLogoFiles.has(variant.svgFile))
      logoGeometry.svg.set(
        variant.key,
        readSvg(join(DIRS.svgLogos, variant.svgFile)),
      );
    const vector = dartLogos.vectors.get(variant.dartConst);
    if (vector) logoGeometry.flutter.set(variant.key, vector);
  }
});

describe('icon parity', () => {
  it('every generated artifact this suite reads is on disk', () => {
    expect(
      missing,
      `${RUN_THE_GENERATOR}; it writes ${missing?.join(', ')}`,
    ).toEqual([]);
  });

  it('the inventory is total and one-to-one across the three targets', () => {
    expect(stems.length).toBe(341);
    expect(variants.length).toBe(682);

    expect(differences('react', [...react.keys()], stems)).toEqual([]);
    const illFormed = [...react]
      .filter(([, g]) => g.size !== 2 || !g.has('outline') || !g.has('solid'))
      .map(
        ([stem, g]) =>
          `${stem}.tsx yields ${[...g.keys()].join(', ') || 'nothing'}`,
      );
    expect(illFormed).toEqual([]);

    expect(
      differences(
        'svg',
        [...svg.keys()],
        variants.map(([stem, variant]) => `${stem}-${variant}.svg`),
      ),
    ).toEqual([]);
    expect(
      differences(
        'flutter',
        [...dart.vectors.keys()],
        variants.map(([stem, variant]) => dartVariantName(stem, variant)),
      ),
    ).toEqual([]);

    // The counts the extraction itself is sanity-checked against: 341 modules each yielding two
    // geometries, 682 files, 682 constants.
    expect(react.size).toBe(341);
    expect(svg.size).toBe(682);
    expect(dart.vectors.size).toBe(682);
  });

  it('React, the raw SVG, Dart and the spec draw the same geometry for every icon variant', () => {
    const mismatches = [];
    for (const [stem, variant] of variants) {
      const want = fromSpec(spec.icons[stem].variants[variant]);
      const emitted = {
        react: react.get(stem)?.get(variant),
        svg: svg.get(`${stem}-${variant}.svg`),
        flutter: dart.vectors.get(dartVariantName(stem, variant)),
      };
      for (const [target, got] of Object.entries(emitted)) {
        const where = `${target} ${stem}/${variant}`;
        if (!got) {
          mismatches.push(`${where}: nothing emitted`);
          continue;
        }
        if (got.viewBox !== want.viewBox)
          mismatches.push(
            `${where}: viewBox "${got.viewBox}", spec says "${want.viewBox}"`,
          );
        if (got.paths.length !== want.paths.length) {
          mismatches.push(
            `${where}: ${got.paths.length} paths, spec has ${want.paths.length}`,
          );
          continue;
        }
        got.paths.forEach((path, i) => {
          if (show(path) !== show(want.paths[i]))
            mismatches.push(
              `${where} path ${i}: ${brief(path)} vs spec ${brief(want.paths[i])}`,
            );
        });
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('the evenodd fill rule survives into all three targets, on the same 75 paths', () => {
    // Its own assertion because dropping it is invisible to a viewBox or path-count check and
    // very visible on screen: an evenodd icon rendered nonzero is a filled blob.
    const evenodd = (label, paths) =>
      paths.flatMap((p, i) =>
        p.fillRule === 'evenodd' ? [`${label}#${i}`] : [],
      );
    const want = variants.flatMap(([stem, variant]) =>
      evenodd(
        `${stem}/${variant}`,
        fromSpec(spec.icons[stem].variants[variant]).paths,
      ),
    );
    expect(want.length).toBe(75);

    const wrong = [];
    for (const [target, of] of Object.entries({
      react: ([stem, variant]) => react.get(stem)?.get(variant),
      svg: ([stem, variant]) => svg.get(`${stem}-${variant}.svg`),
      flutter: ([stem, variant]) =>
        dart.vectors.get(dartVariantName(stem, variant)),
    })) {
      const got = variants.flatMap(([stem, variant]) =>
        evenodd(`${stem}/${variant}`, of([stem, variant])?.paths ?? []),
      );
      wrong.push(...differences(`${target} evenodd`, got, want));
    }
    expect(wrong).toEqual([]);

    // And the literal spelling each target uses, counted in the bytes on disk.
    const count = (text, pattern) => (text.match(pattern) ?? []).length;
    const tsx = [...reactSources.values()].reduce(
      (n, source) => n + count(source, /fillRule: 'evenodd'/g),
      0,
    );
    const files = [...svg.values()].reduce(
      (n, g) => n + count(g.source, /fill-rule="evenodd"/g),
      0,
    );
    expect({
      react: tsx,
      svg: files,
      flutter: count(dart.source, /evenOdd: true/g),
    }).toEqual({ react: 75, svg: 75, flutter: 75 });
  });

  it('no icon carries a colour, in any target', () => {
    // The `currentColor` contract, asserted as the absence it actually is. This is what makes an
    // icon different from a token: a token's whole content is its value, an icon must have none.
    const offenders = [];
    const scan = (label, source) => {
      for (const m of source.matchAll(
        /#[0-9a-fA-F]{3,8}\b|\bColor\(|\brgba?\(/g,
      ))
        offenders.push(`${label} names a colour: ${m[0]}`);
    };
    for (const [label, source] of reactSources) scan(label, source);
    for (const [file, geometry] of svg)
      scan(`svg/icons/${file}`, geometry.source);
    scan('icons.dart', dart.source);
    expect(offenders).toEqual([]);

    const tinted = [];
    for (const [stem, variant] of variants) {
      const emitted = {
        react: react.get(stem)?.get(variant),
        svg: svg.get(`${stem}-${variant}.svg`),
        flutter: dart.vectors.get(dartVariantName(stem, variant)),
      };
      for (const [target, got] of Object.entries(emitted))
        for (const [i, path] of (got?.paths ?? []).entries())
          if (path.fill !== null)
            tinted.push(
              `${target} ${stem}/${variant} path ${i} is filled ${path.fill}`,
            );
    }
    expect(tinted).toEqual([]);

    // The positive half, in the one target where the inherited fill is written out rather than
    // being an absence: every path in every icon file says currentColor.
    const notInherited = [...svg]
      .filter(
        ([, g]) =>
          (g.source.match(/fill="currentColor"/g) ?? []).length !==
          g.paths.length,
      )
      .map(
        ([file]) => `svg/icons/${file} does not say currentColor on every path`,
      );
    expect(notInherited).toEqual([]);
  });

  it('logos are the inverse: every path names a colour and none inherits one', () => {
    const inherited = [...logoSources]
      .filter(([, source]) => source.includes('currentColor'))
      .map(([label]) => `${label} inherits a colour`);
    expect(inherited).toEqual([]);

    const uncoloured = [];
    for (const variant of logoTable) {
      if (!variant.drawable) continue;
      const emitted = {
        react: logoGeometry.react.get(variant.key),
        svg: logoGeometry.svg.get(variant.key),
        flutter: logoGeometry.flutter.get(variant.key),
      };
      for (const [target, got] of Object.entries(emitted)) {
        if (!got) {
          uncoloured.push(`${target} ${variant.key}: nothing emitted`);
          continue;
        }
        for (const [i, path] of got.paths.entries())
          if (!/^#[0-9a-f]{6}$/.test(path.fill ?? ''))
            uncoloured.push(
              `${target} ${variant.key} path ${i} is filled ${path.fill ?? 'by inheritance'}`,
            );
      }
    }
    expect(uncoloured).toEqual([]);

    // os-logo/teams has no vector IR, so it has no path list to check. It still has to name its
    // colours, which it does in gradient stops, in both targets that carry it.
    expect(logoSources.get('logos/os.tsx')).toMatch(
      /stopColor="#[0-9a-fA-F]{6}"/,
    );
    expect(logoSources.get('svg/logos/os-logo-teams.svg')).toMatch(
      /stop-color="#[0-9a-fA-F]{6}"/,
    );
  });

  it('every logo a target does carry is the same drawing in the spec', () => {
    const mismatches = [];
    for (const variant of logoTable) {
      if (!variant.drawable) continue;
      const want = fromSpec(spec.logos[variant.set].variants[variant.slug]);
      const emitted = {
        react: logoGeometry.react.get(variant.key),
        svg: logoGeometry.svg.get(variant.key),
        flutter: logoGeometry.flutter.get(variant.key),
      };
      for (const [target, got] of Object.entries(emitted)) {
        if (!got) continue; // absence is the previous test's and the divergence test's business
        const where = `${target} ${variant.key}`;
        if (got.viewBox !== want.viewBox)
          mismatches.push(
            `${where}: viewBox "${got.viewBox}", spec says "${want.viewBox}"`,
          );
        if (got.paths.length !== want.paths.length) {
          mismatches.push(
            `${where}: ${got.paths.length} paths, spec has ${want.paths.length}`,
          );
          continue;
        }
        got.paths.forEach((path, i) => {
          if (show(path) !== show(want.paths[i]))
            mismatches.push(
              `${where} path ${i}: ${brief(path)} vs spec ${brief(want.paths[i])}`,
            );
        });
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('the targets differ by exactly one asset, and a deviation says why', () => {
    // React and the raw SVG render the Teams mark's gradients; the Flutter painter cannot, and
    // approximating it would invent a brand colour. That is the one permitted divergence, so it
    // is asserted as a closed set: a second one has to fail here rather than pass as "expected".
    const PERMITTED = new Set(['react+svg+flutter', 'react+svg']);
    const carriedBy = logoTable.map((variant) => [
      variant.key,
      ['react', 'svg', 'flutter']
        .filter((target) => logoPresence[target].has(variant.key))
        .join('+'),
    ]);

    // Named individually, so a second divergence says which asset it is rather than only that
    // the shape of the answer changed.
    const undocumented = carriedBy
      .filter(([, signature]) => !PERMITTED.has(signature))
      .map(
        ([key, signature]) =>
          `${key} is carried by ${signature || 'no target'}`,
      );
    expect(undocumented).toEqual([]);

    const flutterHasNot = carriedBy
      .filter(([, signature]) => signature === 'react+svg')
      .map(([key]) => key);
    expect(flutterHasNot).toEqual(['os-logo.teams']);

    const deviation = deviations.find((d) => d.token === 'logo.os-logo.teams');
    expect(
      deviation,
      'the one divergence between the targets has no recorded deviation',
    ).toBeDefined();
    expect(deviation.reason).toMatch(/Flutter/);
  });

  it('every icon variant is on the 24 grid in all three targets', () => {
    // Icon/Zone's outline was drawn 0 0 24 25 -- the one asset a target could plausibly
    // normalise to a square -- until SOLAR redrew it on the grid on 2026-09-22. Nothing on disk
    // is off grid now, so this is the assertion that would notice a new one arriving, and the
    // synthetic test below is what keeps the per-variant handling covered.
    const offGrid = [];
    for (const [stem, variant] of variants) {
      const got = {
        spec: fromSpec(spec.icons[stem].variants[variant]).viewBox,
        react: react.get(stem).get(variant).viewBox,
        svg: svg.get(`${stem}-${variant}.svg`).viewBox,
        flutter: dart.vectors.get(dartVariantName(stem, variant)).viewBox,
      };
      for (const [target, viewBox] of Object.entries(got))
        if (viewBox !== '0 0 24 24')
          offGrid.push(`${target} ${stem}/${variant}: ${viewBox}`);
    }
    expect(offGrid).toEqual([]);

    // The SVG files also carry an intrinsic size, which is where a square would creep back in.
    const mis = [...svg]
      .filter(([, file]) => !file.source.includes('width="24" height="24"'))
      .map(([name]) => name);
    expect(mis).toEqual([]);
  });

  it('carries a viewBox per variant into all three targets', () => {
    // The one assertion in this file that runs the emitters in memory rather than reading the
    // generated tree: since zone was redrawn there is no off-grid asset on disk to read, and
    // cropping an off-grid variant to 24 would still fail no count and still shift the drawing.
    const sample = {
      component: 'IconSample',
      name: 'Sample',
      category: 'Test',
      description: 'A hand-built icon, one variant off the 24 grid.',
      variants: {
        outline: {
          viewBox: [0, 0, 24, 25],
          paths: [{ d: 'M0 0H24V25H0Z', fillRule: 'nonzero' }],
        },
        solid: {
          viewBox: [0, 0, 24, 24],
          paths: [{ d: 'M0 0H24V24H0Z', fillRule: 'nonzero' }],
        },
      },
    };
    // The real logos travel with it: the Flutter emitter asserts which variants it skipped.
    const synthetic = { icons: { sample }, logos: spec.logos };
    const [module] = renderReactIcons(synthetic).modules;
    const files = renderSvgFiles(synthetic);
    const dartSource = renderFlutterIcons(synthetic).icons;

    for (const variant of ['outline', 'solid']) {
      const want = fromSpec(sample.variants[variant]).viewBox;
      const tsx = new RegExp(
        `const ${variant}: IconGeometry = \\{\\n  viewBox: '([^']*)'`,
      ).exec(module.tsx);
      const vector = new RegExp(
        `${dartVariantName('sample', variant)} = SolarVector\\(\\n` +
          `    width: ([\\d.]+),\\n    height: ([\\d.]+),`,
      ).exec(dartSource);
      const file = `icons/sample-${variant}.svg`;
      expect({
        react: tsx?.[1],
        svg: parseSvg(files.get(file), { file }).viewBox.join(' '),
        flutter: vector && `0 0 ${Number(vector[1])} ${Number(vector[2])}`,
      }).toEqual({ react: want, svg: want, flutter: want });
    }
    expect(files.get('icons/sample-outline.svg')).toContain(
      'width="24" height="25"',
    );
  });
});
```

Run: `npx vitest run test/icon-parity.test.mjs` from `packages/codegen`.

The repository owner commits `packages/codegen/test/icon-parity.test.mjs`.

---

### Task 9: CLI and package wiring — done

**Files:**

- Modified: `packages/codegen/bin/solar-codegen.mjs`
- Modified: `packages/assets/src/index.ts`
- Modified: `packages/codegen/src/report/deviations.mjs` (one sentence of prose; see below)
- Modified: `packages/codegen/test/spec.test.mjs`
- Already done earlier: `packages/assets/package.json` (task 4, the `./svg/*` export and the
  `cp -R src/generated/svg/. dist/svg` build step) and `packages/solar_flutter/lib/solar_flutter.dart`
  (task 7, the icon, logo and widget exports). Neither needed anything here.

`solar:codegen` gains an icon stage after the token stage. The order is deliberate: **both**
normalizers run before **any** emitter, so a throw from either stops the run before half the
targets have been rewritten, and so the icon deviations are in hand when the single report is
written at the end.

1. `loadContract()` → `buildTokenSpec` → `loadIconCatalog()` → `buildIconSpec`
2. write `spec/tokens.json`, then `spec/icons.json`
3. the four token emitters, then the four icon emitters
4. `writeDeviationsReport([...deviations, ...iconDeviations], fileVersion)`
5. Prettier, `dart format`, one summary line

`spec/icons.json` carries the same `$description` / `$extensions` provenance shape as
`spec/tokens.json`: what generated it, from which files, and the SOLAR Icons file's own
`fileVersion`, `sourceFetchedOn`, `iconFill` and `count`, read from `docs/solar-icons/catalog.json`.
Nothing is timestamped at build time, so the file is a pure function of `docs/`.

**The icon emitters are handed the icons' file version, not the tokens'.** The Foundations export
(`2026-09-20`) says nothing about the icon corpus, whose version is Figma's
`2400491293726842862`. The React and SVG manifests already recorded the latter; the Flutter icon
manifest had been generated by hand in task 7 with the Foundations date, so this task's
regeneration corrects `packages/solar_flutter/lib/src/generated/icons.manifest.json` to match —
the only generated file whose bytes moved.

**The Prettier trap.** The CLI's Prettier call takes explicit globs, and Prettier has no `.svg`
parser: it silently skips an `.svg` found by expanding a directory, but a glob that *matches* one
is an explicit request and the run dies with "No parser could be inferred". So the added glob is
`packages/assets/src/generated/**/*.{ts,tsx,json}` and deliberately does not reach `.svg`. The 687
generated SVG files are written already formatted and need no pass.

**One report, both sources.** `writeDeviationsReport` previously received only the token
deviations, so `spec/deviations.md` carried 13 rows while the icon deviations reached nothing
a human reads. It now receives both sets concatenated, and the renderer's existing dedupe and
`byCodeUnit` sort do the rest: **16 rows**, the three from the icons being `icon.phone`,
`logo.os-logo.teams` and `logo.size`. It was 18 when this task was executed; SOLAR fixed the two
icons behind `icon.support` and `icon.zone` on 2026-09-22 and, because a deviation is reported
only when the data triggers it, both rows left the report on their own. The report's header sentence was the one line
of `report/deviations.mjs` that had to change — it named `spec/tokens.json` as its only source and
now names both, and says that the `icon.*` and `logo.*` rows come from the SOLAR Icons file whose
version `spec/icons.json` records.

**The icon-spec guard** is the sibling of the token one in `test/spec.test.mjs`, for the identical
blind spot: the icon emitters run against the spec `buildIconSpec` holds in memory, so a stale
`spec/icons.json` on disk would fail nothing else in the suite. `spec/icons.json` is not DTCG, so
`flattenSpec` does not read it; a local `flattenIconSpec` walks `icons` and `logos` into one row
per variant — name, component, viewBox, every path's `d`, `fillRule` and `fill`, the
`unsupported`/`source` pair for Teams and the `files` map for the rasters — and the committed file
must equal the in-memory build row for row. Verified by cropping `zone`'s outline viewBox, then
`0 0 24 25`, to `0 0 24 24` in the committed file: the test fails, and `npm run solar:codegen`
restores it. SOLAR has since redrawn the icon on the grid, so repeating that check today means
mutating any variant's viewBox, not that one's.

Measured on this corpus. The three sizes were re-measured on 2026-09-22, after SOLAR shipped the
`support` outline and redrew `zone`; the determinism hash is from the run this task was executed
in and no longer matches, though two consecutive runs still agree with each other:

| | |
| --- | --- |
| Summary line | `codegen: css 663, mui 710, tailwind 371, flutter 710 tokens, react 341, svg 687, logos 3, flutter 341 icons, 16 deviations` (18 when this task was executed; `icon.support` and `icon.zone` stopped triggering when SOLAR fixed the two icons on 2026-09-22) |
| Wall clock | 3.26 s cold, 2.69 s warm |
| Prettier step | 1.15 s of that, standalone; 0.76 s before the assets glob, so the 341 TSX modules and two manifests cost **~0.4 s**. It is ~40% of the run and the largest single step, but it does not dominate it. |
| `dart format lib` | 0.56 s |
| `spec/icons.json` | 603,242 bytes (592 KB), 341 icon sets and 3 logo sets |
| `spec/deviations.md` | 16,864 bytes, 16 rows |
| Generated files | 1,049 across `spec/`, `packages/styles/src/generated`, `packages/assets/src/generated` and `packages/solar_flutter/lib/src/generated` |
| Determinism | two consecutive runs hash to `aca7fed5e3dd610db35b5de7be9230b2a397aacbc4f6342e92dc42d878307694` over all 1,049 files, and `git status --porcelain docs/` is empty |

`packages/assets/src/index.ts` re-exports the two generated barrels with `export *` rather than
repeating 349 names that the emitters already sort and will keep in sync. The `Icon` and `Logo`
shells stay internal — they take geometry, and the generated components are the supported way to
get it — while their types are exported, because a wrapper around an icon has to name its props.
The whole file is re-export statements and nothing else: the package is `sideEffects: false`, and
one statement with an effect here would undo tree-shaking for all 341 icons. Re-measured through
the package entry point, as task 3 asked: `import { IconChevronRight } from '@bwp-web/assets'`
bundled with esbuild `--bundle --minify --format=esm` and React external is **961 bytes** against
`src/index.ts`, byte for byte what task 3 measured one layer down, against 472 KB for the whole
barrel. Against the built `dist/index.js` the same import is 15,134 bytes, of which ~14 KB is 346
repeated `import { jsx as jsxN } from "react/jsx-runtime"` statements that tsup's single-file
bundle leaves behind.

**Measured, and then not acted on.** Raw bytes overstate this badly: 341 near-identical import
statements compress away almost entirely, so over the wire one icon is **1,454 bytes gzipped and
1,026 brotli**, against 615 gzipped through `src`. The real cost is roughly **840 gzipped bytes,
fixed** — it does not grow with the number of icons imported, so an app taking thirty of them
pays it once and it rounds to nothing.

`splitting: true` does not help and was measured: with one entry point esbuild has nothing to
split into, and the output is byte-identical at 15,134. Closing the gap properly would mean
either one tsup entry per icon, which turns a single `dist/index.js` into 341 output files, or
dropping JSX from the generated modules in favour of a factory in the shell, which would undo
task 3's deliberate choice of an explicit component function and touch what the parity suite
reads. Neither is worth ~840 gzipped bytes. Revisit only if the package gains many more
JSX-emitting modules.

```js
#!/usr/bin/env node
// Generates spec/tokens.json and spec/icons.json from docs/, then emits every target.
// Reads docs/, never writes it.
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { buildIconSpec, loadIconCatalog } from '../src/normalize/icons.mjs';
import { writeDeviationsReport } from '../src/report/deviations.mjs';
import { emitCss } from '../src/emit/css.mjs';
import { emitMui } from '../src/emit/mui.mjs';
import { emitTailwind } from '../src/emit/tailwind.mjs';
import { emitFlutter } from '../src/emit/flutter.mjs';
import { emitReactIcons } from '../src/emit/react-icons.mjs';
import { emitSvgFiles } from '../src/emit/svg-files.mjs';
import { emitReactLogos } from '../src/emit/react-logos.mjs';
import { emitFlutterIcons } from '../src/emit/flutter-icons.mjs';
import { repoRoot, specDir } from '../src/util/paths.mjs';
import { writeGenerated } from '../src/util/write.mjs';

const contract = loadContract();
const { spec, deviations } = buildTokenSpec(contract);
// A label for the Foundations export, not a claim about every input: the Layout collection
// comes from a second Figma file captured on its own date (contract.layoutSource.capturedOn).
// Both provenance records are written in full into spec/tokens.json's $extensions below.
const fileVersion = contract.generatedFrom?.exportedOn ?? 'unknown';

// The icon spec is built before anything is emitted, because its deviations join the token ones
// in the single report written at the end. Building both up front also means a throw from either
// normalizer stops the run before half the targets have been rewritten.
const catalog = loadIconCatalog();
const { spec: iconSpec, deviations: iconDeviations } = buildIconSpec(catalog);
// The icons come from the SOLAR Icons Figma file, which is captured on its own schedule and has
// its own version; the Foundations version above says nothing about them.
const iconVersion = catalog.fileVersion ?? 'unknown';

writeGenerated(
  join(specDir, 'tokens.json'),
  JSON.stringify(
    {
      $description:
        'SOLAR design tokens in DTCG format. Generated by @bwp-web/codegen from docs/solar/tokens/css-contract.json and docs/solar-web/tokens/layout-variables.json. Modes live under $extensions["com.biamp.solar"].modes. Do not edit.',
      $extensions: {
        'com.biamp.solar': {
          source: contract.generatedFrom,
          layout: contract.layoutSource,
        },
      },
      ...spec,
    },
    null,
    2,
  ) + '\n',
);

writeGenerated(
  join(specDir, 'icons.json'),
  JSON.stringify(
    {
      $description:
        'SOLAR icons and logos as drawing data. Generated by @bwp-web/codegen from docs/solar-icons/catalog.json and the SVG files beside it. An icon path carries only {d, fillRule} and inherits its colour (color.icon.* through currentColor); a logo path always carries its own brand fill. Do not edit.',
      $extensions: {
        'com.biamp.solar': {
          source: {
            catalog: 'docs/solar-icons/catalog.json',
            fileVersion: catalog.fileVersion,
            sourceFetchedOn: catalog.sourceFetchedOn,
            iconFill: catalog.iconFill,
            count: catalog.count,
          },
        },
      },
      ...iconSpec,
    },
    null,
    2,
  ) + '\n',
);

const counts = {
  css: emitCss(spec, fileVersion),
  mui: emitMui(spec, fileVersion),
  tailwind: emitTailwind(spec, fileVersion),
  flutter: emitFlutter(spec, fileVersion),
};

const iconCounts = {
  react: emitReactIcons(iconSpec, iconVersion),
  svg: emitSvgFiles(iconSpec, iconVersion),
  logos: emitReactLogos(iconSpec, iconVersion),
  flutter: emitFlutterIcons(iconSpec, iconVersion),
};

// One report, both sources. The icon deviations are as much a governance question as the token
// ones -- a name collision, a missing variant, an off-grid viewBox, a gradient the vector IR
// cannot carry -- and spec/deviations.md is the only place a human reads them.
writeDeviationsReport([...deviations, ...iconDeviations], fileVersion);

// The generated files are checked in and are linted and format-checked like hand-written
// ones, so the generator formats them itself rather than the repo ignoring them.
//
// The assets glob names ts, tsx and json and deliberately does not match .svg: Prettier has no
// SVG parser, and while it silently skips an .svg file found by expanding a directory, a glob
// that matches one is an explicit request and fails with "No parser could be inferred". The
// generated SVG files are written already formatted and need no pass.
execSync(
  'npx prettier --write "spec/**/*.{json,md}" "packages/styles/src/generated/**/*.{ts,css,json}" "packages/assets/src/generated/**/*.{ts,tsx,json}"',
  { cwd: repoRoot, stdio: 'ignore' },
);
try {
  execSync('dart format lib', {
    cwd: join(repoRoot, 'packages', 'solar_flutter'),
    stdio: 'ignore',
  });
} catch {
  // Not a warning to skim past: the emitter writes unformatted Dart and the committed file is
  // formatted, so without the SDK tokens.dart is left differing from what is checked in by
  // hundreds of lines. Exiting non-zero says so plainly rather than leaving a diff to puzzle over.
  console.error(
    'dart format FAILED: the Dart SDK is not on PATH, so packages/solar_flutter/lib/src/generated/tokens.dart\n' +
      'is unformatted and will not match the committed file. Install Flutter, or restore that file and\n' +
      'regenerate once the SDK is available. Everything else was written normally.',
  );
  process.exitCode = 1;
}

const tally = (entries) =>
  Object.entries(entries)
    .map(([k, v]) => `${k} ${v}`)
    .join(', ');

console.log(
  `codegen: ${tally(counts)} tokens, ${tally(iconCounts)} icons, ` +
    `${deviations.length + iconDeviations.length} deviations`,
);
```

```ts
/**
 * The public surface of `@bwp-web/assets`.
 *
 * A pure re-export and nothing else. The package is marked `sideEffects: false` and every icon
 * is its own module behind the generated barrel, so a consumer who imports one icon bundles one
 * icon: adding a statement with an effect here, or re-exporting through a wrapper, would undo
 * that for all 341.
 *
 * Raw SVG is not reached through this entry point. It ships as files under `./svg/*`, so a
 * sprite build or a CSS `mask-image` can name one without pulling in React.
 */

// Every icon component: `IconAccessibility` … `IconZoomOut`, each taking `IconProps`.
export * from './generated/icons/index.js';

// The logo components (`LogoBiamp`, `LogoOs`) with their per-set variant unions, and the app
// icon rasters (`appIcons` and the individual data URLs), which are data rather than components.
export * from './generated/logos/index.js';

// The shells' public types. The `Icon` and `Logo` components themselves stay internal: they take
// geometry, and the generated components are the supported way to get it. The types are exported
// because a consumer writing a wrapper around an icon or a logo needs to name its props, and one
// carrying its own artwork needs to name its shape.
export type { IconGeometry, IconPath, IconProps, IconSize } from './icon.js';
export type {
  LogoArtwork,
  LogoGeometry,
  LogoMarkup,
  LogoPath,
  LogoProps,
  LogoSize,
} from './logo.js';
```

Run: `npm run solar:codegen` twice and compare a content hash of every generated file — identical,
and nothing written under `docs/`. Then, from the root, `npm run lint`, `format`, `typecheck` and
`build`; `npx vitest run` in `packages/codegen` (21 files, 220 tests); and in
`packages/solar_flutter`, `dart format --set-exit-if-changed lib test`, `flutter analyze` and
`flutter test` (39 tests). After a build, `packages/assets/dist/svg` holds the 682 icon and 5 logo
files, `@bwp-web/assets/svg/icons/chevron-right-outline.svg` resolves through the package exports,
and both `dist/index.js` and `dist/index.cjs` expose 349 names that render.

The repository owner commits `packages/codegen/bin/solar-codegen.mjs`,
`packages/codegen/src/report/deviations.mjs`, `packages/codegen/test/spec.test.mjs`,
`packages/assets/src/index.ts`, the new `spec/icons.json`, the rewritten `spec/deviations.md` and
the corrected `packages/solar_flutter/lib/src/generated/icons.manifest.json`.

---

### Task 10: CI and documentation — done

**Files:**

- Rewritten: `packages/assets/README.md` (was a three-line "work in progress" stub)
- Modified: `packages/codegen/README.md`, `packages/solar_flutter/README.md`, `docs/README.md`,
  `CLAUDE.md`
- **Not modified: `.github/workflows/solar.yml`.** See below.

**CI needs no new step, and that was checked rather than assumed.** The `codegen` job runs
`npm run solar:codegen`, then fails if `git status --porcelain docs/` is non-empty, then fails if
`git status --porcelain` is non-empty, then runs `npx vitest run` — which is all 21 files and 220
tests, `icon-parity.test.mjs` and the icon-spec guard in `spec.test.mjs` among them. Every icon
artifact is written by that one command and is committed, so the three existing assertions cover
the icon stage by construction: a stale generated module, a spec that no longer matches the
catalog, and a write into `docs/` each fail without anything naming icons. The `flutter` job's
`dart format --set-exit-if-changed lib test`, `flutter analyze` and `flutter test` already reach
`icons.dart`, `logos.dart`, `solar_icon.dart`, `svg_path.dart` and `icons_test.dart`, because
they name directories rather than files.

Runtime, measured locally on this corpus, is not a problem:

| | |
| --- | --- |
| `npm run solar:codegen` | **2.3–3.0 s** wall clock, unchanged from task 9's 2.69–3.26 s |
| `npx vitest run` in `packages/codegen` | 220 tests across 21 files in 650 ms |
| `flutter analyze` | 1.2 s, with `icons.dart` at 589 KB |
| `flutter test` | 39 tests |
| `dart format --set-exit-if-changed lib test` | 9 files, 0 changed, 0.32 s |

One gap worth stating and not worth fixing: `packages/solar_flutter/README.md` is checked by no
Prettier run, because the Dart package is outside the npm workspace and `solar.yml`'s formatting
step names `docs/`, `scripts/`, `README.md`, `CLAUDE.md` and `package.json`. The file is
Prettier-clean; adding it to the glob would be the only reason to touch the workflow, and that is
not what this task is for.

**What each document now says.**

- **`packages/assets/README.md`** — rewritten from the stub into the package's real
  documentation, modelled on `packages/styles/README.md`. Importing an icon and what the three
  props do; that a named `size` step resolves to `var(--solar-icon-<step>)` rather than to px;
  that colour is inherited through `currentColor` and is set at the point of use with
  `color: var(--solar-color-icon-*)`, which also means Light and Dark need nothing from the
  component; what `title` does to `role`, `aria-labelledby`, `aria-hidden` and `focusable`. Then
  the logos, with the two rules that differ — never tintable, because `color` and `fill` are
  omitted from `LogoProps` and the compiler refuses them, and `size` sets the height alone so a
  36 × 12 wordmark is not squashed — the app icons as base64 data URLs, the `./svg/*` export with
  its naming scheme, and the four source defects with a pointer to `spec/deviations.md`.
  Tree-shaking is stated as the measured **1,454 bytes gzipped** for one icon.
- **`packages/codegen/README.md`** — the three false claims are gone: the intro now says two
  contracts, four token targets and three icon targets; `spec/deviations.md` is **18** places, 13
  token and 5 icon; and the parity paragraph is explicitly about the token targets, with icon
  parity described in its own section. That section gives `spec/icons.json`, a table of the three
  icon targets and their counts, that `icon-parity.test.mjs` reads the artifacts rather than the
  manifests, and the two contracts that make icons unlike tokens — **no icon carries a colour**
  and **every logo does**, each asserted in both directions — plus the Teams mark as the one
  divergence the emitter and the suite both pin. "Changing it" gains the icon row.
- **`docs/README.md`** — the outputs table gains `spec/icons.json` and two rows for the generated
  code itself (the styles/Flutter token output, and the assets/Flutter icon output), and the
  deviations row says 18 rather than 13. "From docs to code" now describes both stages, the icon
  colour contract in one sentence, and that no target is transpiled from another. The pipeline
  picture, the `solar:codegen` command line, the "what exists" row and the "Where to start" table
  follow.
- **`CLAUDE.md`** — the codegen paragraph describes both stages. `@bwp-web/assets` is no longer
  listed as an empty skeleton; only canvas and components are. Two new hard rules for an agent:
  an icon never carries a colour and must never be given one — tint at the point of use with a
  `color.icon.*` token, size from the `icon.*` ladder — and a logo always carries its own and is
  never tintable, with the types refusing it. The stale "the design-to-code generator itself does
  not exist" became "nothing generates a component yet", which is what was meant and is still
  true.
- **`packages/solar_flutter/README.md`** — never mentioned icons. It now covers
  `SolarIcon(SolarIcons.chevronRightOutline)`, why there is no `Map<String, SolarVector>`, the
  four-step colour chain (explicit `color` → `SolarTheme`'s `colors.iconPrimary` →
  `IconTheme.of(context).color` → black), `size` defaulting to `SolarIconSize.lg` and fitting
  rather than stretching, and `semanticLabel`. Then `SolarLogos` and its four constants, the two
  inversions (`SolarLogo` takes no colour; `size` is the height), and the Teams variant's
  deliberate absence with the reason and a link to `spec/deviations.md`.

**Verified.** `npx prettier --check "docs/**/*.md" README.md CLAUDE.md package.json` passes, as do
the root `npm run lint`, `format`, `typecheck` and `build`; `npx vitest run` in `packages/codegen`
is 220 passing across 21 files; `flutter analyze`, `flutter test` and
`dart format --set-exit-if-changed lib test` pass; `node scripts/check-personal-data.mjs` reports
2 accepted, 0 new, 0 credentials. `npm run solar:codegen` was re-run afterwards and printed the
same summary line with no change to the tree, and `git status --porcelain docs/` names only
`docs/README.md` and this plan file — no documentation edit reached generated output.

The repository owner commits `packages/assets/README.md`, `packages/codegen/README.md`,
`packages/solar_flutter/README.md`, `docs/README.md`, `CLAUDE.md` and this plan.

---

## Done when

All of these hold.

- `npm run solar:codegen` emits icons for all three targets, is deterministic, and writes nothing
  under `docs/`. Its summary line is
  `codegen: css 663, mui 710, tailwind 371, flutter 710 tokens, react 341, svg 687, logos 3, flutter 341 icons, 16 deviations`,
  and two consecutive runs leave the tree unchanged.
- A React app can `import { IconChevronRight } from '@bwp-web/assets'` and tint it by setting
  `color`; a Flutter app can use `SolarIcon(SolarIcons.chevronRightOutline)` and get the same
  shape.
- The icon parity suite proves React, the raw SVG and Flutter carry identical geometry for all
  **682** variants — one per variant of the 341 sets, which is also the number of SVG files on
  disk since `support` gained its own outline on 2026-09-22. `os-logo.teams` is the one asset the
  targets do not share, and the suite asserts it is the only one.
- `flutter analyze` and `flutter test` pass (39 tests), and the npm build, lint, typecheck and
  format pass; `npx vitest run` in `packages/codegen` is 225 tests across 21 files.
- **Three** source defects appear in `spec/deviations.md` with an action for SOLAR: `icon.phone`,
  `logo.os-logo.teams` and `logo.size` — the last two were found while executing tasks 5 and 7 and
  were not foreseen when this plan was written. They join the 13 token rows for 16 in total. It was
  five and 18 until 2026-09-22, when SOLAR drew the missing `support` outline and redrew `zone` on
  the grid; a deviation is reported only when the data triggers it, so both rows left the report
  without any code change, while their `ICON_DEVIATIONS` entries and the branches that look them up
  stayed.
- The packages are documented: `packages/assets/README.md` and the icon sections of
  `packages/solar_flutter/README.md` for consumers, `packages/codegen/README.md` and `CLAUDE.md`
  for whoever changes the generator. CI needed no new step; task 10 records why.
