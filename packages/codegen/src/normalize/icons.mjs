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
      }
    }
    logos[group.kebab] = entry;
  }

  return { spec: { icons, logos }, deviations };
}
