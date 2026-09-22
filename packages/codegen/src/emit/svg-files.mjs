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
