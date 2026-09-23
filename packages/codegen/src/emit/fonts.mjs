/**
 * How each target finds SOLAR's fonts.
 *
 * The font-family tokens are bare names (`Inter`), which is right for the spec and for Flutter,
 * where a family is a key into the fonts a package declares. On the web a bare name is fragile:
 * if the font fails to load the browser falls to its default, usually a serif. So the web targets
 * emit a stack, built from the fallback SOLAR itself names (docs/solar/06-typography.md: Brand
 * Gotham / Montserrat, App Inter / Open Sans, Code IBM Plex Mono / Roboto Mono) and ending in a
 * generic family. A family with no stack here fails the build rather than shipping bare.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { packagesDir } from '../util/paths.mjs';

const SANS = ['system-ui', 'sans-serif'];
const MONO = ['ui-monospace', 'monospace'];

/** SOLAR's primary families, each with its named fallback and a generic ending. */
export const WEB_FONT_STACKS = {
  Gotham: ['Gotham', 'Montserrat', ...SANS],
  Montserrat: ['Montserrat', ...SANS],
  Inter: ['Inter', 'Open Sans', ...SANS],
  'Open Sans': ['Open Sans', ...SANS],
  'IBM Plex Mono': ['IBM Plex Mono', 'Roboto Mono', ...MONO],
  'Roboto Mono': ['Roboto Mono', ...MONO],
};

const GENERIC = new Set([...SANS, ...MONO]);

/** A family token's CSS value: `"Inter", "Open Sans", system-ui, sans-serif`. */
export function webFontStack(family) {
  const stack = WEB_FONT_STACKS[family];
  if (!stack)
    throw new Error(
      `no web font stack for ${family}; add one to WEB_FONT_STACKS`,
    );
  // Generic families are keywords and must stay unquoted; every named one is quoted, one word or
  // several, so a family can never be read as a keyword.
  return stack.map((f) => (GENERIC.has(f) ? f : `"${f}"`)).join(', ');
}

/** The package a Flutter TextStyle names so Flutter finds a font bundled in solar_flutter. */
export const FLUTTER_FONT_PACKAGE = 'solar_flutter';

/**
 * The families and weights solar_flutter bundles, read from its pubspec, which is the one place
 * Flutter reads them from.
 */
export function flutterFonts(
  pubspec = join(packagesDir, 'solar_flutter', 'pubspec.yaml'),
) {
  const doc = parse(readFileSync(pubspec, 'utf8'));
  return new Map(
    (doc.flutter?.fonts ?? []).map((f) => [
      f.family,
      new Set(f.fonts.map((x) => x.weight ?? 400)),
    ]),
  );
}

/** Throws unless solar_flutter bundles a file for this family at this weight. */
export function assertFlutterFont(fonts, family, weight, where) {
  if (!fonts.get(family)?.has(weight))
    throw new Error(
      `${where}: solar_flutter bundles no ${family} ${weight}; add the file to packages/solar_flutter/fonts/ and its pubspec`,
    );
}
