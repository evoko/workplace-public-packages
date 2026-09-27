/**
 * What the workbench's Inspect shows for one variant of a component: `solar:explain`'s reading,
 * as data. The variant axes and each variant's value on each; each layer with its web class, the
 * selector the web recipe finds it by (for outlining it in the preview and pointing at it) and the
 * layer it sits in (for the tree); and each cell once (a text style is one cell,
 * not its six properties): the entry that wins, its value as a person reads it, where it sits,
 * where it comes from (Figma, a rule or the defaults) and the reason a rule or a default gives, the
 * scopes a rule may be keyed on with how many variants each reaches and the entry that overrides it
 * here, and the tokens, keywords and `none` it may be set to. A cell whose raw value the overlay
 * allows (`allowLiteral`) takes none of them: a token or `none` there leaves the rule no literal to
 * allow, which fails the build, so a change to it is a Report.
 */

import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { slotsOf } from '../emit/mui-component.mjs';
import { entryText, lookupCell } from '../explain/index.mjs';
import { flattenSpec } from '../spec.mjs';
import { layerClass } from '../util/classes.mjs';
import { CELL_OF_PROPERTY } from '../verify/oracle.mjs';
import { reachOf } from './reach.mjs';
import { plainLabel, scopesFor } from './scopes.mjs';
import { KEYWORD_CELLS, tokenChoices, valueText } from './tokens.mjs';

/** A short hash of the overlay file's text, which a write must name to be taken. */
export const revisionOf = (text) =>
  createHash('sha256')
    .update(text ?? '')
    .digest('hex')
    .slice(0, 16);

/** What Inspect says of a cell whose raw value the overlay allows. */
export const LITERAL_NOTE =
  'a raw value the overlay allows (allowLiteral): use Report';

/** The built component by its name, or a thrown error naming it. */
export function builtOf(build, name) {
  const found = build.built.find((b) => b.spec.component === name);
  if (!found) throw new Error(`no component ${name}`);
  return found;
}

/** One variant's name (`size=md, state=default`) as its axes and their values. */
const partsOf = (figma) =>
  figma ? Object.fromEntries(figma.split(', ').map((p) => p.split('='))) : {};

/** Each variant axis in Figma's spelling and its values, in the order the variants draw them. */
function axesOf(oracle) {
  const axes = new Map();
  for (const v of oracle.variants)
    for (const [name, value] of Object.entries(partsOf(v.figma))) {
      if (!axes.has(name)) axes.set(name, []);
      if (!axes.get(name).includes(value)) axes.get(name).push(value);
    }
  return [...axes].map(([name, values]) => ({ name, values }));
}

/**
 * The layer a layer sits in, among those the variant draws: the one whose Figma path is the longest
 * proper prefix of its own (a layer whose parent the variant does not draw sits in the nearest
 * one it does, so the tree has no gap).
 */
function parentOf(spec, drawn, name) {
  if (name === 'root') return null;
  const path = spec.layers[name]?.path ?? '';
  let best = 'root';
  let length = 0;
  for (const [other, l] of Object.entries(spec.layers)) {
    if (other === name || other === 'root' || !drawn.has(other)) continue;
    if (path.startsWith(`${l.path}/`) && l.path.length > length) {
      best = other;
      length = l.path.length;
    }
  }
  return best;
}

/**
 * Where the web draws a layer, as the MUI recipe styles it and the visual check measures it (the
 * slot table, `slotsOf`): `&` for the component's root element (a text MUI draws in the root, as
 * Button's label, is the root's element too), else a selector under the root (`& .MuiButton-startIcon`,
 * `& .SolarOptionCard--container`, `& > *`). Null only where the component has no slot table, which
 * the recipe's build refuses, so no built component has one.
 */
const selectorsOf = (spec) => slotsOf(spec) ?? {};

/** A path as one string, for comparing by. */
const keyOf = (path) => path?.join('\u0000');

/**
 * The selectors of one variant's layers, where several share one (Button Group's Buttons, each
 * `& > *`): each its own, `& > :nth-child(<n>)`, in the order the case draws them
 * (test/visual/cases/button-group.tsx: the variant's layers in order, each one shown, and each one
 * a prop shows though Figma hides it at rest, a slot hidden in the first variant); null for one
 * not drawn here.
 */
function selectorsIn(spec, oracle, variant) {
  const selectors = { ...selectorsOf(spec) };
  const rest = oracle.variants[0]?.layers ?? {};
  const shared = new Map();
  for (const [layer, selector] of Object.entries(selectors))
    if (layer !== 'root' && selector !== '&')
      shared.set(selector, [...(shared.get(selector) ?? []), layer]);
  for (const [selector, layers] of shared) {
    if (layers.length < 2) continue;
    const drawn = Object.entries(variant.layers)
      .filter(
        ([name, l]) =>
          layers.includes(name) &&
          (!l.hidden || (name in (oracle.slots ?? {}) && rest[name]?.hidden)),
      )
      .map(([name]) => name);
    if (selector !== '& > *')
      throw new Error(
        `${spec.component}: ${layers.join(', ')} share ${selector}, which Inspect cannot tell apart`,
      );
    for (const layer of layers) {
      const n = drawn.indexOf(layer);
      selectors[layer] = n < 0 ? null : `& > :nth-child(${n + 1})`;
    }
  }
  return selectors;
}

/** An entry's value as a person reads it: its token's value, a raw value, a keyword, none, or else as explain phrases it. */
function valueOf(byName, entry) {
  if (!entry) return '';
  if (entry.token) {
    const token = byName.get(entry.token);
    return token ? valueText(token) : entry.token;
  }
  if (entry.none) return 'none';
  if (entry.keyword) return entry.keyword;
  if (entry.gradient)
    return `gradient ${entry.gradient.stops.map((stop) => stop.token).join(' → ')}`;
  const raw = entry.literal ?? entry.value ?? entry.position;
  if (raw === undefined) return entryText(entry);
  return typeof raw === 'object' ? JSON.stringify(raw) : String(raw);
}

/** Where an entry comes from: an overlay rule, the shared defaults, or Figma's variant. */
const originOf = (entry) =>
  entry?.from === 'overlay'
    ? 'rule'
    : entry?.from === 'defaults'
      ? 'defaults'
      : 'figma';

/**
 * @param {{built: object[], tokens: object}} build `stage.build()`
 * @param {string} name the component's name (`Button`)
 * @param {number} index an oracle variant's index
 * @param {{overlayText: string}} files the component's overlay file as it is on disk ('' if none)
 */
export function inspect(build, name, index, { overlayText }) {
  const { spec, oracle } = builtOf(build, name);
  const variant = oracle.variants[index];
  if (!variant) throw new Error(`${name} has no variant ${index}`);
  const doc = overlayText ? parse(overlayText) : null;
  // Each `<layer>.<cell>` an allowLiteral names, its patterns expanded (the IR's overlay record).
  const literal = new Set(
    (spec.overlay?.rules ?? [])
      .filter((r) => r.rule === 'allowLiteral')
      .map((r) => r.at),
  );
  const byName = new Map(flattenSpec(build.tokens).map((t) => [t.name, t]));
  const reach = reachOf(spec, oracle);
  const drawn = new Set(Object.keys(variant.layers));
  const selectors = selectorsIn(spec, oracle, variant);
  const layers = Object.entries(variant.layers).map(([layer, values]) => {
    const cells = [
      ...new Set(
        Object.keys(values)
          .map((p) => CELL_OF_PROPERTY[p])
          .filter(Boolean),
      ),
    ];
    return {
      name: layer,
      className: layerClass(spec, layer),
      selector: selectors[layer] ?? null,
      parent: parentOf(spec, drawn, layer),
      hidden: Boolean(values.hidden),
      cells: cells.map((cell) => {
        const hit = lookupCell(spec, layer, cell, variant);
        const current = hit?.entry?.token ?? null;
        const allowed = literal.has(`${layer}.${cell}`);
        const origin = originOf(hit?.entry);
        return {
          cell,
          total: reach.total(layer),
          entry: entryText(hit?.entry),
          value: valueOf(byName, hit?.entry),
          at: hit?.at ?? null,
          origin,
          reason:
            origin === 'figma' || typeof hit?.entry?.reason !== 'string'
              ? null
              : hit.entry.reason,
          scopes: scopesFor(spec, doc, layer, cell, variant).map(
            ({ label, key, path }) => {
              const winner = reach.winnerOver(layer, cell, index, path);
              return {
                label,
                key,
                count: reach.count(layer, cell, path),
                wins: winner?.at ?? null,
                winsLabel: winner ? plainLabel(winner.path) : null,
                current: keyOf(path) === keyOf(hit?.path),
              };
            },
          ),
          choices: allowed ? [] : tokenChoices(build.tokens, cell, current),
          keywords: !allowed && KEYWORD_CELLS.has(cell) ? ['FILL', 'HUG'] : [],
          none: !allowed,
          ...(allowed ? { note: LITERAL_NOTE } : {}),
        };
      }),
    };
  });
  return {
    component: spec.component,
    revision: revisionOf(overlayText),
    axes: axesOf(oracle),
    variants: oracle.variants.map((v, i) => ({
      index: i,
      name: v.figma,
      parts: partsOf(v.figma),
    })),
    variant: index,
    layers,
  };
}
