/**
 * The workbench bar's scenarios (bar-scenarios.json), which both viewers' bar tests run: read from
 * disk, each with its fixtures resolved and its platform named. Widgetbook's driver
 * (solar_flutter/widgetbook/test/workbench_scenarios_test.dart) resolves them the same way, in Dart.
 */

import { readFileSync } from 'node:fs';

export const SCENARIOS_FILE = new URL('./bar-scenarios.json', import.meta.url);

/** The file as it is: about, vocabulary, fixtures and scenarios. */
export const readScenarios = () =>
  JSON.parse(readFileSync(SCENARIOS_FILE, 'utf8'));

/**
 * `value` with every `{ "$fixture": name, ...over }` replaced by a copy of `fixtures[name]` with
 * the object's other keys put over it, each resolved in turn.
 */
export function resolve(value, fixtures) {
  if (Array.isArray(value)) return value.map((v) => resolve(v, fixtures));
  if (value === null || typeof value !== 'object') return value;
  const { $fixture: name, ...over } = value;
  let base = {};
  if (name !== undefined) {
    if (!(name in fixtures)) throw new Error(`no fixture ${name}`);
    base = resolve(fixtures[name], fixtures);
    if (base === null || typeof base !== 'object' || Array.isArray(base)) {
      if (Object.keys(over).length)
        throw new Error(`fixture ${name} is no object`);
      return base;
    }
  }
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = resolve(v, fixtures);
  return out;
}

/** `value` with `$platform` and `$other`, as values and as keys, the platforms they name. */
export function forPlatform(value, platform) {
  const other = platform === 'web' ? 'flutter' : 'web';
  const name = (s) =>
    s === '$platform' ? platform : s === '$other' ? other : s;
  if (Array.isArray(value)) return value.map((v) => forPlatform(v, platform));
  if (typeof value === 'string') return name(value);
  if (value === null || typeof value !== 'object') return value;
  return Object.fromEntries(
    Object.entries(value).map(([k, v]) => [name(k), forPlatform(v, platform)]),
  );
}

/** Every scenario, resolved, for a bar on `platform` (`web` or `flutter`). */
export function scenariosFor(platform) {
  const { fixtures, scenarios } = readScenarios();
  return scenarios.map((s) => forPlatform(resolve(s, fixtures), platform));
}
