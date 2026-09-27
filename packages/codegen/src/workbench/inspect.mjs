/**
 * What the workbench's Inspect shows for one variant of a component: `solar:explain`'s reading,
 * as data. Each layer with its web class (for pointing), and each cell once (a text style is one
 * cell, not its six properties): the entry that wins, where it sits, the scopes a rule may be keyed
 * on, and the tokens, keywords and `none` it may be set to. A cell whose raw value the overlay
 * allows (`allowLiteral`) takes none of them: a token or `none` there leaves the rule no literal to
 * allow, which fails the build, so a change to it is a Report.
 */

import { createHash } from 'node:crypto';
import { parse } from 'yaml';
import { entryText, lookupCell } from '../explain/index.mjs';
import { layerClass } from '../util/classes.mjs';
import { CELL_OF_PROPERTY } from '../verify/oracle.mjs';
import { scopesFor } from './scopes.mjs';
import { KEYWORD_CELLS, tokenChoices } from './tokens.mjs';

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
      hidden: Boolean(values.hidden),
      cells: cells.map((cell) => {
        const hit = lookupCell(spec, layer, cell, variant);
        const current = hit?.entry?.token ?? null;
        const allowed = literal.has(`${layer}.${cell}`);
        return {
          cell,
          entry: entryText(hit?.entry),
          at: hit?.at ?? null,
          scopes: scopesFor(spec, doc, layer, cell, variant).map(
            ({ label, key }) => ({ label, key }),
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
    variants: oracle.variants.map((v, i) => ({ index: i, name: v.figma })),
    variant: index,
    layers,
  };
}
