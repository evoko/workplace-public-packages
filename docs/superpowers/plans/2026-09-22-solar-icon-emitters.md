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
- **`support` has no outline**, so its `outline` is a clone of its `solid` and the component still
  renders. It is not the only set whose two variants are identical — 80 others, a chevron or a plus
  with nothing to fill, are drawn the same in both — so the fallback is identified by the missing
  source file, never by comparing geometry.
- **`zone` keeps its `0 0 24 25` viewBox** verbatim, taken from the parsed SVG. `catalog.size` says
  `[24, 24]` and is wrong for this one; it is used only to notice the mismatch.

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
| `icon.support` | Figma has two solid variants and no outline. `outline` falls back to `solid`, so the component still renders. Ask SOLAR to supply the outline. |
| `icon.zone` | Its outline viewBox is `0 0 24 25`, so the icon is 1px taller than the grid. The viewBox is carried verbatim rather than cropped. Ask SOLAR to redraw on the 24 grid. |
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

**Tests (18, all passing).** The spec is built once at module scope from the real catalog, as
`tokens.test.mjs` does. 341 sets under 341 distinct component names; the catalog metadata beside the
geometry; 340 outlines drawn from their own file with `support` the only fallback, its `outline`
equal to but not the same object as its `solid`; the two Phone components separated; the acronyms
kept; `zone` at `0 0 24 25` against its solid's `0 0 24 24`; and — the assertion that proves
`currentColor` will work — every path of every variant of all 341 icons carrying exactly `d` and
`fillRule` and no `#111111` anywhere. Then the logos: each set named after its Figma prop; every logo
path with a `#rrggbb` fill; Google's four brand colours in order; both Biamp marks resolving `white`
and `black` and differing from each other; Teams as `{unsupported, source}` whose source contains
`radialGradient`; and the app icons as five `.png` files with no paths. A totals block ties the spec
to the measured corpus, and two tests hold the allowlist to being an allowlist: a synthetic gradient
document throws under any other file name, and is recorded only under `logos/os-logo/teams.svg`.

The totals are worth stating exactly, because the corpus and the spec differ by one on purpose.
686 SVG files exist: 681 icon files (340 outline, 341 solid) and 5 logo files. 685 parse — teams.svg
is the exception — carrying 811 paths, 791 of them in icons and 20 in the four vector logos. The spec
holds 682 icon variants and 792 icon paths, one more of each, and that difference is exactly the
`support` outline standing in for its solid.

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

/** One variant's drawing. The viewBox travels with it: `zone` outline is `0 0 24 25`. */
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
`IconUSB` and `IconPhoneAudioDsp`; no `#111111` in any module; `zone` carrying `0 0 24 25` for
outline beside `0 0 24 24` for solid; `fillRule` present only where the source says `evenodd`; no
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
  intrinsic size for `<img>` and `zone` outline is `24` × `25` while everything else is 24 × 24.
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
  // they come from the viewBox extent rather than a constant, so zone outline is 24 x 25.
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
`#4caf50`, `#1976d2` and no `currentColor`; `zone-outline.svg` at `0 0 24 25` with `height="25"`
beside `zone-solid.svg` at 24; exactly 75 files with `fill-rule="evenodd"` and none with
`nonzero`; and `support-outline.svg` existing with the same path data as `support-solid.svg`,
since Figma ships no outline for it.

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

The last case is a real one: `zone`'s outline path 7 of 9, pasted verbatim from the spec. It has
two subpaths wound against each other, eight cubics, a `Z` on each and the negative control
points that put its bounds above the origin, on the one icon whose viewBox is `0 0 24 25`. Its
bounds and four containment probes are asserted, including the hole through the middle of the pin.

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
