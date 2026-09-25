/**
 * `repeats`: sibling copies of one layer that Figma draws as a component's sample content (a
 * month's Day Cells, its weekdays), read as their first (the pipeline review's item 1, owner
 * decision 2026-09-25: an opt-in rule, each collapse a written decision).
 */

import { describe, expect, it } from 'vitest';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import { loadDefaults, loadOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { buildOracle } from '../src/verify/oracle.mjs';

const contract = loadContract();
const names = tokenNames(contract);
const catalog = loadWebCatalog();
const defaults = loadDefaults();
const NAME = 'Date Picker Open';
const build = (overlay) =>
  buildComponentSpec(loadComponent(catalog, NAME), {
    names,
    fileVersion: catalog.fileVersion,
    overlay,
    defaults,
  });
// The overlay, changed by `change`.
const changed = (change) => {
  const overlay = structuredClone(loadOverlay(NAME));
  change(overlay);
  return overlay;
};

describe('repeats', () => {
  const { spec, deviations } = build(loadOverlay(NAME));

  it('reads Date Picker Open’s days and weekdays as their first, each marked with its count', () => {
    const repeated = Object.fromEntries(
      Object.entries(spec.layers)
        .filter(([, l]) => l.repeat)
        .map(([n, l]) => [n, l.repeat]),
    );
    expect(repeated).toEqual({
      weekdayRowWeekday: 7,
      dayGridDayCell: 35,
      containerWeekdayRowWeekday: 7,
      containerDayGridDayCell: 35,
      container2WeekdayRowWeekday: 7,
      container2DayGridDayCell: 35,
    });
    expect(Object.keys(spec.layers)).toHaveLength(25);
    expect(spec.layers).not.toHaveProperty('dayGridDayCell2');
    expect(spec.style).not.toHaveProperty('dayGridDayCell2');
    // No finding names a copy.
    expect(
      deviations.filter((d) => /daygriddaycell\d+|weekday\d+/.test(d.token)),
    ).toEqual([]);
  });

  it('measures the firsts alone in the oracle', () => {
    const loaded = loadComponent(catalog, NAME);
    const oracle = buildOracle(loaded.set, spec, deviations, {
      tokens: buildTokenSpec(contract).spec,
      names,
      overlay: loadOverlay(NAME),
      fileVersion: catalog.fileVersion,
    });
    const layers = new Set(
      oracle.variants.flatMap((v) => Object.keys(v.layers)),
    );
    expect(layers.has('dayGridDayCell')).toBe(true);
    expect(
      [...layers].filter((l) => /\d$/.test(l) && /Cell|Weekday/.test(l)),
    ).toEqual([]);
  });

  it('keeps the copies without the rule, as Figma draws them', () => {
    const without = build(
      changed((o) => {
        delete o.repeats;
      }),
    ).spec;
    expect(Object.keys(without.layers)).toHaveLength(145);
    expect(without.layers.dayGridDayCell).not.toHaveProperty('repeat');
  });

  it('refuses a rule that names no layer, a copy, or a layer with no copies', () => {
    const rule = { reason: 'r' };
    expect(() => build(changed((o) => (o.repeats = { nope: rule })))).toThrow(
      /repeats nope: the component has no such layer/,
    );
    expect(() =>
      build(changed((o) => (o.repeats = { dayGridDayCell2: rule }))),
    ).toThrow(/is a copy of \/DayGrid\/Day Cell; name the first/);
    expect(() => build(changed((o) => (o.repeats = { month: rule })))).toThrow(
      /repeats month: Figma draws no copy of/,
    );
  });
});
