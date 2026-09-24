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
 *   component: Button                                    its address: the Figma name, or
 *                                                        `<section>/<name>` where two share it
 *   codeName:     { name, reason }                       the component's name in code, where its
 *                                                        Figma name is two components'
 *   base:         { mui, flutter, reason }              the stock control each target wraps
 *   drawing:      { reason }                             every variant is its own drawing: every cell
 *                                                        of every layer follows every axis
 *   rename:       { <axis>: { to, values?, reason } }    Figma axis name to API name; `values` maps
 *                                                        each value too, and true/false makes it a boolean
 *   states:       { rename: { <value>: { to, reason } } }  a state value Figma spells otherwise
 *   layerNames:   { <Figma path>: { name, reason } }     a layer's IR name, where Figma's cannot give one
 *                                                        (a glyph for a name, or two that reduce to one)
 *   slots:        { <layer>: { name, type, reason } }    a layer the caller fills, with no Figma prop
 *   derive:       { <axis>: { when: [{ value, given?, props? }], reason } }  an axis that follows
 *                                                        from content (first match wins), not a
 *                                                        prop: the slots `given`, and the shell's
 *                                                        `props` the caller sets (Tag's onClose)
 *   follows:      { <layer>.<cell>: { axes, reason } }    a cell that follows other axes than its class
 *   bind:         { <layer>.<cell>: { literal, token, reason } }  a raw value to the token of that value,
 *                 or { tokens: { <literal>: <token>, … }, reason } where the value differs by size
 *   set:          { <layer>.<section>.<keys…>.<cell>: { token | none | keyword, reason } }  one entry,
 *                                                        changed
 *   allowLiteral: { <layer>.<cell>: { values?, reason } }  a raw value there is no token for;
 *                                                        `values` allows those alone, where a bind
 *                                                        takes the rest (StatusIndicator's 8px dot)
 *   samples:      { <axis>: { keep: [values], reason } }  an axis whose values are samples of what
 *                                                        the caller gives (Avatar's colours): the API
 *                                                        loses it, the recipe keeps those variants
 *   caller:       { <layer>.<cell>: { prop | from, reason } }  a cell whose value is the caller's:
 *                                                        `prop` names the colour prop it is (the API
 *                                                        gains it), `from` the prop it is derived from
 *   controlDraws: { <layer>: { cells?, reason } }        the base control draws this layer itself
 *                                                        (Spinner's ring): its box is the control's,
 *                                                        which the oracle then excuses; `cells`
 *                                                        names the only ones it decides (a
 *                                                        slider's handle: where it sits, x)
 *   restyles:     { <layer>: { cells, reason } }         a composed child whose paint the parent
 *                                                        draws its own way (Toast's Tag, filled
 *                                                        and edged by the toast): `cells`, of
 *                                                        background and borderColor, are read from
 *                                                        the instance, and checked there
 *   shownBy:      { <layer>: { slot, reason } }          a layer Figma hides in every variant, with
 *                                                        no prop to show it, drawn where the caller
 *                                                        fills the slot (Segmented Control's label)
 *   accept:       { <deviation token>: { reason } }      the code keeps its value; Figma's
 *                                                        difference is known and intended
 *
 * `accept` and `follows` are not interchangeable. `accept` leaves the recipe as derived and only
 * records that the Figma variants differing from it are known. When the Figma variant is the
 * one that is right -- lg is meant to be flat -- the cell must `follow` that axis instead, so the
 * code draws what Figma draws.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { parse } from 'yaml';
import { repoRoot, specDir } from '../util/paths.mjs';
import { BOOLEAN_STATES } from './component-layers.mjs';

export const overlayDir = join(specDir, 'overlay');

/** The cells of a composed child's root a parent may draw its own way (`restyles`). */
export const RESTYLED = ['background', 'borderColor'];

/**
 * The composed children the overlay restyles, keyed the way deriveRecipe reads them: by Figma
 * path, to the cells read from the instance.
 */
export function restylesOf(overlay, pathOf) {
  const out = {};
  for (const [layer, rule] of Object.entries(overlay?.restyles ?? {})) {
    const path = pathOf(layer);
    if (path) out[path] = rule.cells ?? [];
  }
  return out;
}

/**
 * `Button` to `button.yaml`, `Icon Button` to `icon-button.yaml`, `.Tree Indent` to
 * `tree-indent.yaml`: the leading dot Figma marks a building block with is no part of a file name.
 */
export const overlayFileOf = (component) =>
  `${component
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}.yaml`;

// Fields each section's rules may carry, beyond the reason every rule needs.
const FIELDS = {
  rename: ['to', 'values'],
  follows: ['axes'],
  bind: ['literal', 'token', 'tokens'],
  set: ['token', 'none', 'keyword'],
  allowLiteral: ['values'],
  controlDraws: ['cells'],
  shownBy: ['slot'],
  restyles: ['cells'],
  samples: ['keep'],
  caller: ['prop', 'from'],
  accept: [],
  slots: ['name', 'type'],
  derive: ['when'],
  layerNames: ['name'],
};
const SECTIONS = [
  'codeName',
  'base',
  'drawing',
  'states',
  ...Object.keys(FIELDS),
];
const SLOT_TYPES = new Set([
  'icon',
  'text',
  'component',
  'content',
  'instance',
]);

/**
 * The variants the recipe is built from, where the overlay says an axis is samples (Avatar's
 * `color` and `shade`, colours Figma draws for show where the caller gives any): those at the
 * values it keeps, with the axis gone. The oracle keeps every variant, each checked with its
 * sample as the caller's value.
 */
export function sampleAxes(resolved, overlay) {
  const rules = overlay?.samples;
  if (!rules) return resolved;
  const where = `spec/overlay/${overlayFileOf(resolved.name)}`;
  for (const [axis, rule] of Object.entries(rules)) {
    if (!resolved.axes[axis])
      throw new Error(`${where}: samples ${axis}: no such axis`);
    for (const v of rule.keep)
      if (!resolved.axes[axis].options.includes(v))
        throw new Error(`${where}: samples ${axis}: ${axis} has no value ${v}`);
  }
  const kept = Object.keys(resolved.axes).filter((a) => !(a in rules));
  const variants = resolved.variants
    .filter((v) =>
      Object.entries(rules).every(([a, r]) => r.keep.includes(v.props[a])),
    )
    .map((v) => ({
      ...v,
      props: Object.fromEntries(kept.map((a) => [a, v.props[a]])),
    }));
  // One variant for each combination of the axes kept, or the recipe would hold two.
  const seen = new Set();
  for (const v of variants) {
    const k = kept.map((a) => v.props[a]).join(', ');
    if (seen.has(k))
      throw new Error(
        `${where}: samples keep two variants at ${k}; keep one value per combination`,
      );
    seen.add(k);
  }
  return {
    ...resolved,
    axes: Object.fromEntries(kept.map((a) => [a, resolved.axes[a]])),
    variants,
  };
}

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

  if (doc.codeName !== undefined) {
    for (const key of Object.keys(doc.codeName ?? {}))
      if (!['name', 'reason'].includes(key))
        fail(`codeName: unknown field ${key}`);
    if (
      typeof doc.codeName?.name !== 'string' ||
      !/^[A-Z][a-zA-Z0-9]*( [A-Z0-9][a-zA-Z0-9]*)*$/.test(doc.codeName.name)
    )
      fail('codeName: name must be capitalised words, as a Figma name is');
    if (!doc.codeName.reason) fail('codeName has no reason');
  }
  if (doc.drawing !== undefined) {
    for (const key of Object.keys(doc.drawing ?? {}))
      if (key !== 'reason') fail(`drawing: unknown field ${key}`);
    if (!doc.drawing?.reason) fail('drawing has no reason');
  }
  if (doc.base !== undefined) {
    for (const key of Object.keys(doc.base))
      if (!['mui', 'flutter', 'reason'].includes(key))
        fail(`base: unknown field ${key}`);
    if (!doc.base.reason) fail('base has no reason');
  }
  if (doc.states !== undefined) {
    for (const key of Object.keys(doc.states))
      if (key !== 'rename') fail(`states: unknown section ${key}`);
    for (const [value, rule] of Object.entries(doc.states.rename ?? {})) {
      if (!rule || typeof rule !== 'object')
        fail(`states.rename.${value} is not a rule`);
      for (const key of Object.keys(rule))
        if (!['to', 'reason'].includes(key))
          fail(`states.rename.${value}: unknown field ${key}`);
      if (typeof rule.to !== 'string' || !rule.to)
        fail(`states.rename.${value} names no value to rename to`);
      if (typeof rule.reason !== 'string' || rule.reason.trim() === '')
        fail(`states.rename.${value} has no reason`);
    }
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
  for (const [at, rule] of Object.entries(doc.bind ?? {})) {
    const one = rule.literal !== undefined || rule.token !== undefined;
    if (one === (rule.tokens !== undefined))
      fail(`bind.${at}: give literal and token, or tokens, not both`);
    if (
      one &&
      (typeof rule.literal !== 'number' || typeof rule.token !== 'string')
    )
      fail(`bind.${at}: literal must be a number and token a token name`);
    if (rule.tokens !== undefined) {
      const pairs = Object.entries(rule.tokens ?? {});
      if (typeof rule.tokens !== 'object' || pairs.length === 0)
        fail(`bind.${at}: tokens must map each literal to a token`);
      for (const [literal, token] of pairs)
        if (!Number.isFinite(Number(literal)) || typeof token !== 'string')
          fail(`bind.${at}: tokens must map each literal to a token`);
    }
  }
  for (const [at, rule] of Object.entries(doc.allowLiteral ?? {}))
    if (
      rule.values !== undefined &&
      (!Array.isArray(rule.values) ||
        rule.values.length === 0 ||
        !rule.values.every((v) => typeof v === 'number'))
    )
      fail(`allowLiteral.${at}: values must list the numbers it allows`);
  for (const [axis, rule] of Object.entries(doc.samples ?? {}))
    if (
      !Array.isArray(rule.keep) ||
      rule.keep.length === 0 ||
      !rule.keep.every((v) => typeof v === 'string')
    )
      fail(`samples.${axis}: keep must list the values the recipe keeps`);
  for (const [at, rule] of Object.entries(doc.caller ?? {})) {
    if ((rule.prop === undefined) === (rule.from === undefined))
      fail(`caller.${at}: give prop or from, one of them`);
    const name = rule.prop ?? rule.from;
    if (typeof name !== 'string' || !/^[a-z][a-zA-Z0-9]*$/.test(name))
      fail(`caller.${at}: the prop must be a name in code`);
  }
  for (const [path, rule] of Object.entries(doc.layerNames ?? {})) {
    if (!path.startsWith('/'))
      fail(`layerNames.${path}: address a layer by its Figma path, from /`);
    if (
      typeof rule.name !== 'string' ||
      !/^[a-zA-Z][a-zA-Z0-9 ]*$/.test(rule.name)
    )
      fail(`layerNames.${path}: name must be words of letters and digits`);
  }
  for (const [layer, rule] of Object.entries(doc.slots ?? {})) {
    if (typeof rule.name !== 'string' || !rule.name)
      fail(`slots.${layer} names no slot`);
    if (!SLOT_TYPES.has(rule.type))
      fail(`slots.${layer}: type must be one of ${[...SLOT_TYPES].join(', ')}`);
  }
  for (const [axis, rule] of Object.entries(doc.derive ?? {})) {
    if (!Array.isArray(rule.when) || rule.when.length === 0)
      fail(`derive.${axis} has no when list`);
    for (const w of rule.when) {
      if (!w || typeof w.value !== 'string')
        fail(`derive.${axis}: every when entry needs a value`);
      if (w.given !== undefined && !Array.isArray(w.given))
        fail(`derive.${axis}.${w.value}: given must be a list of slots`);
      if (
        w.props !== undefined &&
        (!Array.isArray(w.props) ||
          w.props.some((p) => !/^[a-z][A-Za-z0-9]*$/.test(p)))
      )
        fail(`derive.${axis}.${w.value}: props must be a list of prop names`);
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

/**
 * The shared defaults, `spec/overlay/defaults.yaml`: decisions that hold for every component, each
 * with a reason, applied after the component's own overlay and never over a cell it rules on.
 * One section so far:
 *
 *   bind: { <name>: { cells: [<cell>, …], literal, token, reason } }   in every layer, a raw
 *         value in one of `cells` to the token of that value; `token` may be a map by the layer's
 *         auto-layout direction, `{ HORIZONTAL: inset.none, VERTICAL: stack.none }`, for a gap
 *
 * Unlike a component's rule, a default that finds nothing to do in one component is not an error:
 * it is written for all of them.
 */
export const defaultsFile = join(overlayDir, 'defaults.yaml');

export function parseDefaults(text, file) {
  const doc = parse(text) ?? {};
  const fail = (detail) => {
    throw new Error(`${file}: ${detail}`);
  };
  for (const key of Object.keys(doc))
    if (key !== 'bind') fail(`unknown section ${key}`);
  for (const [name, rule] of Object.entries(doc.bind ?? {})) {
    if (!rule || typeof rule !== 'object') fail(`bind.${name} is not a rule`);
    for (const key of Object.keys(rule))
      if (!['cells', 'literal', 'token', 'reason'].includes(key))
        fail(`bind.${name}: unknown field ${key}`);
    if (typeof rule.reason !== 'string' || rule.reason.trim() === '')
      fail(`bind.${name} has no reason`);
    if (
      !Array.isArray(rule.cells) ||
      rule.cells.length === 0 ||
      !rule.cells.every((c) => typeof c === 'string' && c)
    )
      fail(`bind.${name}: cells must list the cells it binds`);
    const byDirection =
      rule.token &&
      typeof rule.token === 'object' &&
      Object.keys(rule.token).length > 0 &&
      Object.entries(rule.token).every(
        ([dir, t]) =>
          ['HORIZONTAL', 'VERTICAL'].includes(dir) && typeof t === 'string',
      );
    if (
      typeof rule.literal !== 'number' ||
      (typeof rule.token !== 'string' && !byDirection)
    )
      fail(
        `bind.${name}: literal must be a number, and token a token name or one per direction (HORIZONTAL, VERTICAL)`,
      );
  }
  return { bind: doc.bind ?? {}, file };
}

/** The shared defaults, or null when there is no defaults file. */
const excludedFile = join(overlayDir, 'excluded.yaml');

/**
 * Parses the components left out of the design-to-code flow (`spec/overlay/excluded.yaml`), by
 * address: each with its reason, and nothing else.
 */
export function parseExcluded(text, file) {
  const doc = parse(text) ?? {};
  const out = {};
  for (const [address, rule] of Object.entries(doc)) {
    for (const key of Object.keys(rule ?? {}))
      if (key !== 'reason')
        throw new Error(`${file}: ${address}: unknown field ${key}`);
    if (typeof rule?.reason !== 'string' || rule.reason.trim() === '')
      throw new Error(`${file}: ${address} has no reason`);
    out[address] = rule.reason.trim();
  }
  return out;
}

/** The components left out of the flow, by address, with their reasons; none without the file. */
export function loadExcluded() {
  if (!existsSync(excludedFile)) return {};
  return parseExcluded(
    readFileSync(excludedFile, 'utf8'),
    relative(repoRoot, excludedFile),
  );
}

export function loadDefaults() {
  if (!existsSync(defaultsFile)) return null;
  return parseDefaults(
    readFileSync(defaultsFile, 'utf8'),
    relative(repoRoot, defaultsFile),
  );
}

/**
 * Applies the shared defaults over a built IR, after its overlay (applyOverlay). A cell the
 * component's overlay names in `bind`, `set` or `allowLiteral` is its own decision and is left
 * alone. A finding is decided once no raw value is left in its cell, as a `bind` decides one.
 *
 * @returns {{spec: object, deviations: object[]}} new objects; the inputs are not mutated
 */
export function applyDefaults(ir, deviationsIn, defaults, { names, overlay }) {
  const spec = structuredClone(ir);
  const deviations = deviationsIn.map((d) => ({ ...d }));
  if (!defaults) return { spec, deviations };

  const own = new Set();
  for (const at of [
    ...Object.keys(overlay?.bind ?? {}),
    ...Object.keys(overlay?.allowLiteral ?? {}),
  ])
    own.add(at);
  for (const at of Object.keys(overlay?.set ?? {})) {
    const [layer, section, ...rest] = at.split('.');
    own.add(`${layer}.${rest.slice(DEPTH[section] ?? 0).join('.')}`);
  }

  const lc = spec.component.toLowerCase();
  const rules = [];
  for (const [name, rule] of Object.entries(defaults.bind).sort(([a], [b]) =>
    a < b ? -1 : 1,
  )) {
    const tokens =
      typeof rule.token === 'string' ? [rule.token] : Object.values(rule.token);
    for (const token of tokens) {
      const value = names.value(token);
      if (value === null)
        throw new Error(
          `${defaults.file}: bind.${name}: ${token} is not a SOLAR token`,
        );
      if (value !== rule.literal)
        throw new Error(
          `${defaults.file}: bind.${name}: ${token} is ${value}, not ${rule.literal}`,
        );
    }
    // The token for one entry: the rule's, or the one for the direction of the layout the entry
    // is in (its own, or the layer's resting one). A direction the rule names no token for (a
    // GRID layout: SOLAR says nothing of a grid's gap) is left to the component: no default.
    const tokenFor = (s, holder) =>
      typeof rule.token === 'string'
        ? rule.token
        : (rule.token[holder.direction?.keyword ?? s.base.direction?.keyword] ??
          null);
    const at = [];
    for (const [layer, s] of Object.entries(spec.style))
      for (const cell of rule.cells) {
        if (own.has(`${layer}.${cell}`)) continue;
        const entries = [...entriesOf(s, cell)];
        let bound = 0;
        for (const [holder, key] of entries)
          if (holder[key].literal === rule.literal && !holder[key].allowed) {
            const token = tokenFor(s, holder);
            if (!token) continue;
            holder[key] = { token, from: 'defaults', reason: rule.reason };
            bound++;
          }
        // The finding is Figma's raw values in the cell, wherever it drew them: a 0 only a
        // non-reference variant draws is not in the recipe to bind, and the default still answers
        // it. Decided once every raw value is this literal and none is left in the recipe; whether
        // that variant should differ at all is its axis finding, which this leaves alone.
        const d = deviations.find(
          (x) =>
            x.token === `component.${lc}.${layer}.${cell}#unbound` &&
            !x.decision,
        );
        // A rule by direction answers only a layer whose every direction it names. A variant with
        // no auto layout (direction none) has no gap to answer.
        const directions = [...entriesOf(s, 'direction')]
          .map(([holder, key]) => holder[key].keyword)
          .filter(Boolean);
        const named =
          typeof rule.token === 'string' ||
          directions.every((dir) => dir in rule.token);
        const answers =
          named &&
          d?.literals?.length > 0 &&
          d.literals.every((l) => l === rule.literal) &&
          entries.every(([holder, key]) => holder[key].literal === undefined);
        if (answers)
          d.decision = { rule: 'bind', reason: rule.reason, default: name };
        if (bound || answers) at.push(`${layer}.${cell}`);
      }
    if (at.length)
      rules.push({
        rule: 'bind',
        at: at.join(', '),
        reason: rule.reason,
        from: defaults.file,
        default: name,
      });
  }
  if (rules.length)
    spec.overlay = {
      file: spec.overlay?.file ?? null,
      rules: [...(spec.overlay?.rules ?? []), ...rules],
    };
  return { spec, deviations };
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
  // A drawing (StatusIndicator: each type is its own shape, from other layers): every cell of
  // every layer follows every axis, which deriveRecipe reads from `*`.
  if (overlay?.drawing) out['*'] = '*';
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
 * Renames state values (`pressed` to `focus` on Text Input, whose Figma description says its
 * `pressed` is the focused state). Applied to the resolved variants, before the recipe is derived,
 * as `follows` is, because the recipe keys every state entry by its value; the variants keep
 * their Figma names, so findings still point at what Figma draws. A rule for a value the state axis
 * does not have, or onto one it already has, fails.
 */
export function renameStates(resolved, overlay) {
  const rules = Object.entries(overlay?.states?.rename ?? {});
  if (!rules.length) return resolved;
  const axis = resolved.axes.state;
  const where = overlay.file;
  if (!axis)
    throw new Error(
      `${where}: states.rename, but ${resolved.name} has no state axis`,
    );
  const to = new Map();
  for (const [value, rule] of rules) {
    if (!axis.options.includes(value))
      throw new Error(
        `${where}: states.rename.${value}: the state axis has no ${value}`,
      );
    if (axis.options.includes(rule.to))
      throw new Error(
        `${where}: states.rename.${value}: the state axis already has ${rule.to}`,
      );
    to.set(value, rule.to);
  }
  const name = (v) => to.get(v) ?? v;
  return {
    ...resolved,
    axes: {
      ...resolved.axes,
      state: { default: name(axis.default), options: axis.options.map(name) },
    },
    variants: resolved.variants.map((v) => ({
      ...v,
      props: { ...v.props, state: name(v.props.state) },
    })),
  };
}

/**
 * Applies everything but `follows` and `states` to a built IR and its deviations.
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
  // Addressed by the Figma name, its section-qualified address, or the code name it gives.
  const figmaName = spec.provenance?.figmaName ?? spec.component;
  const section = (spec.provenance?.page ?? '').replace(/^components\//, '');
  if (
    ![spec.component, figmaName, `${section}/${figmaName}`].includes(
      overlay.component,
    )
  )
    throw new Error(
      `${file} is for ${overlay.component}, not ${spec.component}`,
    );

  const lc = spec.component.toLowerCase();
  const rules = [];
  const record = (rule, at, reason, more = {}) =>
    rules.push({ rule, at, reason, ...more });
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

  if (overlay.codeName)
    record(
      'codeName',
      `${figmaName} → ${spec.component}`,
      overlay.codeName.reason,
    );

  if (overlay.drawing) record('drawing', 'every cell', overlay.drawing.reason);

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
    if (rule.values) {
      const options = axes[axis].options;
      for (const v of options)
        if (!(v in rule.values))
          fail(`rename ${axis}: values gives nothing for ${v}`);
      for (const v of Object.keys(rule.values))
        if (!options.includes(v))
          fail(`rename ${axis}: ${axis} has no value ${v}`);
    }
    record('rename', axis, rule.reason);
  }

  for (const [value, rule] of Object.entries(overlay.states?.rename ?? {}).sort(
    ([a], [b]) => (a < b ? -1 : 1),
  ))
    record('states.rename', `${value} → ${rule.to}`, rule.reason);

  // Layer names were given before the layers were named (see namesOf); here they are recorded.
  for (const [path, rule] of sorted('layerNames'))
    record('layerNames', `${path} → ${rule.name}`, rule.reason);

  // Slots were declared before the layers were named (see declareSlots); here they are recorded.
  for (const [at, rule] of sorted('slots'))
    record('slots', `${at} → ${rule.name}`, rule.reason);

  // An axis that follows from the content the caller gives, not a prop: Tag's `type` is which of
  // its parts show. The recipe keeps the axis, keyed as Figma draws it; the API loses it, and
  // `derived` says which value each combination of filled slots gives, first match wins.
  for (const [axis, rule] of sorted('derive')) {
    if (!axes[axis])
      fail(`derive ${axis}: ${spec.component} has no axis ${axis}`);
    const values = rule.when.map((w) => w.value);
    const options = axes[axis].options;
    for (const v of options)
      if (values.filter((x) => x === v).length !== 1)
        fail(`derive ${axis}: ${v} must appear once in when`);
    for (const v of values)
      if (!options.includes(v))
        fail(`derive ${axis}: ${axis} has no value ${v}`);
    for (const w of rule.when)
      for (const slot of w.given ?? [])
        if (!spec.slots[slot])
          fail(
            `derive ${axis}.${w.value}: ${spec.component} has no slot ${slot}`,
          );
    // `rename` applies last, so the API is still keyed by Figma's axis name here.
    delete spec.api[axis];
    (spec.derived ??= {})[axis] = {
      values: [...options],
      default: axes[axis].default,
      when: rule.when.map((w) => ({
        value: w.value,
        given: [...(w.given ?? [])],
        ...(w.props ? { props: [...w.props] } : {}),
      })),
      reason: rule.reason,
    };
    record('derive', axis, rule.reason);
  }

  for (const [at, rule] of sorted('follows'))
    record('follows', at, rule.reason);

  for (const [at, rule] of sorted('bind')) {
    const pairs = rule.tokens
      ? Object.entries(rule.tokens).map(([l, t]) => [Number(l), t])
      : [[rule.literal, rule.token]];
    const { layer, cell, entries } = cellEntries(at, 'bind');
    for (const [literal, token] of pairs) {
      const value = names.value(token);
      if (value === null) fail(`bind ${at}: ${token} is not a SOLAR token`);
      if (value !== literal)
        fail(`bind ${at}: ${token} is ${value}, not ${literal}`);
      let bound = 0;
      for (const [holder, key] of entries)
        if (holder[key].literal === literal) {
          holder[key] = { token, from: 'overlay', reason: rule.reason };
          bound++;
        }
      if (bound === 0) fail(`bind ${at}: no literal ${literal} to bind`);
    }
    // The finding is decided only when no raw value is left in the cell, but for the values the
    // cell's allowLiteral names.
    const allowed = overlay.allowLiteral?.[at]?.values ?? [];
    const left = entries
      .map(([holder, key]) => holder[key].literal)
      .filter((l) => l !== undefined && !allowed.includes(l));
    if (left.length)
      fail(`bind ${at}: leaves ${[...new Set(left)].join(', ')} unbound`);
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
    // A state the IR keeps no entry for, because Figma draws it as at rest (FAB's focus), may be
    // given one, under an appearance the IR has, for a state the component has. So may focus
    // where Figma draws none at all (Toggle's): a visible focus is SOLAR's floor, and the state
    // joins the component's.
    const states = new Set([
      'default',
      'focus',
      ...spec.states,
      ...Object.keys(spec.api).filter((p) => BOOLEAN_STATES.includes(p)),
    ]);
    // So may an appearance the layer lacks and another layer of the component has (Slider
    // Range's root, where only its fill changes at rest: `default`).
    const looks = new Set(
      Object.values(spec.style).flatMap((st) => Object.keys(st[section] ?? {})),
    );
    keys.forEach((key, i) => {
      const last = i === keys.length - 1 && section !== 'size';
      if (
        !node?.[key] &&
        i === 0 &&
        section === 'appearance' &&
        node &&
        looks.has(key)
      )
        node[key] = {};
      if (!node?.[key] && last && node && states.has(key)) {
        node[key] = {};
        if (key === 'focus' && !spec.states.includes('focus'))
          spec.states.push('focus');
      }
      if (!node?.[key]) fail(`set ${at}: the IR has no ${section} ${key}`);
      node = node[key];
    });
    const cell = parts.slice(2 + DEPTH[section]).join('.');
    if (!cell) fail(`set ${at}: names no cell`);
    // What the lookup finds where the entry has no value of its own: the resting value.
    const resting = () => {
      if (section === 'appearance')
        return s.appearance[keys[0]]?.default?.[cell] ?? s.base[cell];
      if (section === 'combined')
        return (
          s.combined[keys[0]]?.[keys[1]]?.default?.[cell] ??
          s.appearance?.[keys[1]]?.default?.[cell] ??
          s.size?.[keys[0]]?.[cell] ??
          s.base[cell]
        );
      if (section === 'size') return s.base[cell];
      return undefined;
    };
    if (rule.token !== undefined && !names.has(rule.token))
      fail(`set ${at}: ${rule.token} is not a SOLAR token`);
    // A composed child's variant is a keyword of the child's own (Toast's Tag: `status`, where
    // Figma names one Tag no longer has); any other keyword is a size's.
    if (
      rule.keyword !== undefined &&
      !cell.startsWith('variant.') &&
      !['FILL', 'HUG'].includes(rule.keyword)
    )
      fail(`set ${at}: keyword must be FILL or HUG`);
    // What Figma had there is kept beside the decision, so the oracle excuses the variants that
    // draw it and no others.
    const was = node[cell] ?? resting();
    const replaced = was && {
      ...Object.fromEntries(
        ['token', 'none', 'keyword', 'literal'].flatMap((k) =>
          k in was ? [[k, was[k]]] : [],
        ),
      ),
    };
    node[cell] = {
      ...(rule.token !== undefined
        ? { token: rule.token }
        : rule.keyword !== undefined
          ? { keyword: rule.keyword }
          : { none: true }),
      from: 'overlay',
      reason: rule.reason,
      ...(replaced && Object.keys(replaced).length ? { replaced } : {}),
    };
    // A cell set because Figma's value could not be read is that finding's decision, and so is
    // one set where Figma left a raw value, once no raw value is left anywhere in the cell.
    for (const kind of ['misbound', 'unknown-token'])
      decide(`component.${lc}.${layer}.${cell}#${kind}`, 'set', rule.reason);
    if (
      ![...entriesOf(s, cell)].some(
        ([holder, key]) => holder[key].literal !== undefined,
      )
    )
      decide(`component.${lc}.${layer}.${cell}#unbound`, 'set', rule.reason);
    record('set', at, rule.reason);
  }

  for (const [at, rule] of sorted('allowLiteral')) {
    const { layer, cell, entries } = cellEntries(at, 'allowLiteral');
    const literals = entries.filter(
      ([holder, key]) =>
        'literal' in holder[key] &&
        (!rule.values || rule.values.includes(holder[key].literal)),
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

  const BOX = ['x', 'y', 'width', 'height'];
  for (const [layer, rule] of sorted('controlDraws')) {
    if (!spec.layers[layer])
      fail(`controlDraws ${layer}: the IR has no layer ${layer}`);
    for (const cell of rule.cells ?? [])
      if (!BOX.includes(cell))
        fail(`controlDraws ${layer}: ${cell} is not one of ${BOX.join(', ')}`);
    // Its size is the control's too, where it decides it: a raw size Figma draws it at is
    // allowed, and decided here.
    for (const cell of ['width', 'height'].filter(
      (c) => !rule.cells || rule.cells.includes(c),
    )) {
      const entries = [...entriesOf(spec.style[layer], cell)];
      const raw = entries.filter(([holder, key]) => 'literal' in holder[key]);
      for (const [holder, key] of raw)
        holder[key] = { ...holder[key], allowed: rule.reason };
      if (raw.length)
        decide(
          `component.${lc}.${layer}.${cell}#unbound`,
          'controlDraws',
          rule.reason,
        );
    }
    record(
      'controlDraws',
      layer,
      rule.reason,
      rule.cells ? { cells: [...rule.cells] } : {},
    );
  }

  for (const [layer, rule] of sorted('restyles')) {
    if (spec.layers[layer]?.type !== 'INSTANCE')
      fail(`restyles ${layer}: the IR has no composed child ${layer}`);
    const cells = rule.cells ?? [];
    if (!cells.length || cells.some((c) => !RESTYLED.includes(c)))
      fail(`restyles ${layer}: cells must be some of ${RESTYLED.join(', ')}`);
    record('restyles', layer, rule.reason, { cells: [...cells] });
  }

  for (const [layer, rule] of sorted('shownBy')) {
    if (!spec.layers[layer])
      fail(`shownBy ${layer}: the IR has no layer ${layer}`);
    if (!spec.slots[rule.slot])
      fail(`shownBy ${layer}: ${spec.component} has no slot ${rule.slot}`);
    const shown = entriesOf(spec.style[layer], 'present').some(
      ([holder, key]) => holder[key].value !== false,
    );
    if (shown)
      fail(`shownBy ${layer}: Figma shows ${layer} in some variant already`);
    record('shownBy', `${layer} ← ${rule.slot}`, rule.reason);
  }

  // The sampled axes were dropped before the recipe (sampleAxes); here they are recorded.
  for (const [axis, rule] of sorted('samples'))
    record('samples', `${axis}: ${rule.keep.join(', ')}`, rule.reason);

  // A cell whose value is the caller's (Avatar's colour): the API gains the prop, and the IR says
  // which cells take it, or follow from it, so the oracle and the shells read the same. The
  // recipe's own value there is what is drawn when the caller gives none.
  const callers = [
    ...sorted('caller').filter(([, r]) => r.prop),
    ...sorted('caller').filter(([, r]) => r.from),
  ];
  for (const [at, rule] of callers) {
    const { cell } = cellEntries(at, 'caller');
    if (!['background', 'borderColor', 'color'].includes(cell))
      fail(`caller ${at}: only a colour can be the caller's`);
    if (rule.prop) {
      if (spec.api[rule.prop] && spec.api[rule.prop].type !== 'color')
        fail(`caller ${at}: the API already has ${rule.prop}`);
      spec.api[rule.prop] = { type: 'color', default: null };
    } else if (spec.api[rule.from]?.type !== 'color')
      fail(`caller ${at}: from ${rule.from}, which no caller rule gives`);
    (spec.callers ??= {})[at] = rule.prop
      ? { prop: rule.prop, reason: rule.reason }
      : { from: rule.from, reason: rule.reason };
    record('caller', at, rule.reason);
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
        (k, [from, { to, values }]) =>
          k.replace(
            new RegExp(`(^|, )${from}=([^,]+)`, 'g'),
            (_, lead, value) => `${lead}${to}=${values?.[value] ?? value}`,
          ),
        key,
      );
    for (const [from, { to, values }] of renames) {
      if (!spec.api[from]) fail(`rename ${from}: the API has no ${from}`);
      if (spec.api[to]) fail(`rename ${from}: the API already has ${to}`);
      // Figma's two-valued axis (Button Group's type: regular, full-width) as the boolean it is.
      const renamed = (def) => {
        if (!values) return def;
        const mapped = def.values.map((v) => values[v]);
        return [...mapped].sort().join() === 'false,true'
          ? { type: 'boolean', default: values[def.default] === 'true' }
          : { values: mapped, default: values[def.default] };
      };
      spec.api = Object.fromEntries(
        Object.entries(spec.api).map(([k, v]) =>
          k === from ? [to, renamed(v)] : [k, v],
        ),
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
