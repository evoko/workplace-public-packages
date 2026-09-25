// A component's shells as the tests read them: the files, written by hand
// (src/shells/index.mjs).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  componentsSrc,
  flutterComponents,
  flutterFileOf,
  shellFileOf,
} from '../src/shells/index.mjs';

/** A component's React shell, `Button.tsx`. */
export const reactShell = (name) =>
  readFileSync(join(componentsSrc, shellFileOf(name)), 'utf8');

/** A component's Flutter widget, `solar_button.dart`. */
export const flutterShell = (name) =>
  readFileSync(join(flutterComponents, flutterFileOf(name)), 'utf8');

/**
 * Code with its layout taken out, so a test names what a shell says rather than how Prettier or
 * dart format lays it out: whitespace runs as one space, none inside brackets, and no trailing
 * comma.
 */
export const flat = (text) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/([({[<]) /g, '$1')
    .replace(/ ([)}\]>])/g, '$1')
    .replace(/,\s?([)}\]>])/g, '$1');
