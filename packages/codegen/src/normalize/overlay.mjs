/**
 * The overlay: hand-written decisions about one component, applied over its IR (spec §4.3).
 *
 * It is the only place design-to-code judgement lives, so it is strict about three things. Every
 * rule carries a `reason`, because an unexplained override is how a design system drifts. Every
 * rule must apply to something the IR actually has, so a rule left behind by a Figma change fails
 * the build instead of silently doing nothing. And the result does not depend on the order rules
 * are written in: sections apply in one fixed order, and every address is spelled in Figma's axis
 * names, with `rename` applied last.
 *
 *   component: Button
 *   base:         { mui, flutter, reason }              the stock control each target wraps
 *   rename:       { <axis>: { to, reason } }             Figma axis name to API name
 *   follows:      { <layer>.<cell>: { axes, reason } }    a cell that follows other axes than its class
 *   bind:         { <layer>.<cell>: { literal, token, reason } }  a raw value to the token of that value
 *   set:          { <layer>.<section>.<keys…>.<cell>: { token | none, reason } }  one entry, changed
 *   allowLiteral: { <layer>.<cell>: { reason } }         a raw value there is no token for
 *   accept:       { <deviation token>: { reason } }      the code keeps its value; Figma's
 *                                                        difference is known and intended
 *
 * `accept` and `follows` are not interchangeable. `accept` leaves the recipe as derived and only
 * records that the Figma variants differing from it are known. When the Figma variant is the
 * one that is right -- xl is meant to be flat -- the cell must `follow` that axis instead, so the
 * code draws what Figma draws.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import { repoRoot, specDir } from '../util/paths.mjs';

export const overlayDir = join(specDir, 'overlay');

/** `Button` to `button.yaml`, `Icon Button` to `icon-button.yaml`. */
export const overlayFileOf = (component) =>
  `${component.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.yaml`;

// Fields each section's rules may carry, beyond the reason every rule needs.
const FIELDS = {
  rename: ['to'],
  follows: ['axes'],
  bind: ['literal', 'token'],
  set: ['token', 'none'],
  allowLiteral: [],
  accept: [],
};
const SECTIONS = ['base', ...Object.keys(FIELDS)];

/** Parses and validates overlay text. The structure is checked here; the IR is checked on apply. */
export function parseOverlay(text, file) {
  const doc = parse(text) ?? {};
  const fail = (detail) => {
    throw new Error(`${file}: ${detail}`);
  };
  if (typeof doc.component !== 'string') fail('names no component');
  for (const key of Object.keys(doc))
    if (key !== 'component' && !SECTIONS.includes(key))
      fail(`unknown section ${key}`);

  if (doc.base !== undefined) {
    for (const key of Object.keys(doc.base))
      if (!['mui', 'flutter', 'reason'].includes(key))
        fail(`base: unknown field ${key}`);
    if (!doc.base.reason) fail('base has no reason');
  }
  for (const [section, fields] of Object.entries(FIELDS)) {
    for (const [at, rule] of Object.entries(doc[section] ?? {})) {
      if (!rule || typeof rule !== 'object')
        fail(`${section}.${at} is not a rule`);
      for (const key of Object.keys(rule))
        if (key !== 'reason' && !fields.includes(key))
          fail(`${section}.${at}: unknown field ${key}`);
      if (typeof rule.reason !== 'string' || rule.reason.trim() === '')
        fail(`${section}.${at} has no reason`);
    }
  }
  return { ...doc, file };
}

/** The overlay for one component, or null when it has none. */
export function loadOverlay(component) {
  const path = join(overlayDir, overlayFileOf(component));
  if (!existsSync(path)) return null;
  return parseOverlay(readFileSync(path, 'utf8'), relative(repoRoot, path));
}

/** `root.paddingTop` to `['root', 'paddingTop']`; a cell name may itself hold a dot. */
function splitCell(at) {
  const i = at.indexOf('.');
  return i < 0 ? [at, ''] : [at.slice(0, i), at.slice(i + 1)];
}

// How many keys each style section nests before reaching the cell.
const DEPTH = { base: 0, size: 1, appearance: 2, combined: 3 };

/** Every entry of one cell in a layer's style, wherever it sits. */
function* entriesOf(layerStyle, cell) {
  function* descend(node, depth) {
    if (!node) return;
    if (depth === 0) {
      if (cell in node) yield [node, cell];
      return;
    }
    for (const child of Object.values(node)) yield* descend(child, depth - 1);
  }
  for (const [section, depth] of Object.entries(DEPTH))
    yield* descend(layerStyle[section], depth);
}

/**
 * The per-cell `follows` overrides, keyed the way deriveRecipe reads them: by Figma path. Applied
 * before the recipe is derived, which is why it is separate from applyOverlay.
 */
export function followsOf(overlay, pathOf) {
  const out = {};
  for (const [at] of Object.entries(overlay?.follows ?? {})) {
    const [layer, cell] = splitCell(at);
    const path = pathOf(layer);
    if (!path)
      throw new Error(
        `${overlay.file}: follows ${at}: the IR has no layer ${layer}`,
      );
    (out[path] ??= {})[cell] = overlay.follows[at].axes;
  }
  return out;
}

/**
 * Applies everything but `follows` to a built IR and its deviations.
 *
 * @returns {{spec: object, deviations: object[]}} new objects; the inputs are not mutated
 */
export function applyOverlay(ir, deviationsIn, overlay, { names, axes }) {
  const spec = structuredClone(ir);
  const deviations = deviationsIn.map((d) => ({ ...d }));
  if (!overlay) return { spec: { ...spec, overlay: null }, deviations };

  const file = overlay.file;
  const fail = (detail) => {
    throw new Error(`${file}: ${detail}`);
  };
  if (overlay.component !== spec.component)
    throw new Error(
      `${file} is for ${overlay.component}, not ${spec.component}`,
    );

  const lc = spec.component.toLowerCase();
  const rules = [];
  const record = (rule, at, reason) => rules.push({ rule, at, reason });
  const decide = (token, rule, reason) => {
    const d = deviations.find((x) => x.token === token);
    if (d) d.decision = { rule, reason };
    return d;
  };
  const layerStyle = (layer, at, rule) => {
    const s = spec.style[layer];
    if (!s) fail(`${rule} ${at}: the IR has no layer ${layer}`);
    return s;
  };
  const cellEntries = (at, rule) => {
    const [layer, cell] = splitCell(at);
    const entries = [...entriesOf(layerStyle(layer, at, rule), cell)];
    if (entries.length === 0) fail(`${rule} ${at}: the IR has no such cell`);
    return { layer, cell, entries };
  };
  const sorted = (section) =>
    Object.entries(overlay[section] ?? {}).sort(([a], [b]) => (a < b ? -1 : 1));

  if (overlay.base) {
    spec.base = {
      mui: overlay.base.mui ?? null,
      flutter: overlay.base.flutter ?? null,
    };
    record('base', 'base', overlay.base.reason);
  }

  // Recorded here, in the fixed section order, but applied last: every other address is in
  // Figma's names.
  for (const [axis, rule] of sorted('rename')) {
    if (!axes[axis])
      fail(`rename ${axis}: ${spec.component} has no axis ${axis}`);
    record('rename', axis, rule.reason);
  }

  for (const [at, rule] of sorted('follows'))
    record('follows', at, rule.reason);

  for (const [at, rule] of sorted('bind')) {
    const value = names.value(rule.token);
    if (value === null) fail(`bind ${at}: ${rule.token} is not a SOLAR token`);
    if (value !== rule.literal)
      fail(`bind ${at}: ${rule.token} is ${value}, not ${rule.literal}`);
    const { layer, cell, entries } = cellEntries(at, 'bind');
    let bound = 0;
    for (const [holder, key] of entries)
      if (holder[key].literal === rule.literal) {
        holder[key] = {
          token: rule.token,
          from: 'overlay',
          reason: rule.reason,
        };
        bound++;
      }
    if (bound === 0) fail(`bind ${at}: no literal ${rule.literal} to bind`);
    decide(`component.${lc}.${layer}.${cell}#unbound`, 'bind', rule.reason);
    record('bind', at, rule.reason);
  }

  for (const [at, rule] of sorted('set')) {
    const parts = at.split('.');
    const [layer, section] = parts;
    const s = layerStyle(layer, at, 'set');
    if (!(section in DEPTH))
      fail(`set ${at}: ${section} is not a style section`);
    let node = s[section];
    const keys = parts.slice(2, 2 + DEPTH[section]);
    for (const key of keys) {
      if (!node?.[key]) fail(`set ${at}: the IR has no ${section} ${key}`);
      node = node[key];
    }
    const cell = parts.slice(2 + DEPTH[section]).join('.');
    if (!cell) fail(`set ${at}: names no cell`);
    if (rule.token !== undefined && !names.has(rule.token))
      fail(`set ${at}: ${rule.token} is not a SOLAR token`);
    node[cell] =
      rule.token !== undefined
        ? { token: rule.token, from: 'overlay', reason: rule.reason }
        : { none: true, from: 'overlay', reason: rule.reason };
    // A cell set because Figma's value could not be read is that finding's decision.
    for (const kind of ['misbound', 'unknown-token'])
      decide(`component.${lc}.${layer}.${cell}#${kind}`, 'set', rule.reason);
    record('set', at, rule.reason);
  }

  for (const [at, rule] of sorted('allowLiteral')) {
    const { layer, cell, entries } = cellEntries(at, 'allowLiteral');
    const literals = entries.filter(
      ([holder, key]) => 'literal' in holder[key],
    );
    if (literals.length === 0) fail(`allowLiteral ${at}: no literal to allow`);
    for (const [holder, key] of literals)
      holder[key] = { ...holder[key], allowed: rule.reason };
    decide(
      `component.${lc}.${layer}.${cell}#unbound`,
      'allowLiteral',
      rule.reason,
    );
    record('allowLiteral', at, rule.reason);
  }

  for (const [token, rule] of sorted('accept')) {
    if (!decide(token, 'accept', rule.reason))
      fail(`accept ${token}: no such deviation`);
    record('accept', token, rule.reason);
  }

  // Renames last, over the API and every key spelled with the axis.
  const renames = sorted('rename');
  if (renames.length) {
    const respell = (key) =>
      renames.reduce(
        (k, [from, { to }]) =>
          k.replace(new RegExp(`(^|, )${from}=`, 'g'), `$1${to}=`),
        key,
      );
    for (const [from, { to }] of renames) {
      if (!spec.api[from]) fail(`rename ${from}: the API has no ${from}`);
      if (spec.api[to]) fail(`rename ${from}: the API already has ${to}`);
      spec.api = Object.fromEntries(
        Object.entries(spec.api).map(([k, v]) => [k === from ? to : k, v]),
      );
    }
    for (const s of Object.values(spec.style)) {
      s.appearance = Object.fromEntries(
        Object.entries(s.appearance).map(([k, v]) => [respell(k), v]),
      );
      if (s.combined)
        for (const [size, byCombo] of Object.entries(s.combined))
          s.combined[size] = Object.fromEntries(
            Object.entries(byCombo).map(([k, v]) => [respell(k), v]),
          );
    }
  }

  // The fixed section order, whatever order the file lists them in.
  const order = SECTIONS;
  rules.sort((a, b) => order.indexOf(a.rule) - order.indexOf(b.rule));
  return { spec: { ...spec, overlay: { file, rules } }, deviations };
}
