/**
 * How far a workbench scope reaches, and what overrides it where the person is looking: for one
 * cell, the number of variants drawing its layer that a `set` at the scope's path would change
 * (those whose recipe lookup, explain/index.mjs `lookupOrder`, reaches the path before any entry
 * for the cell), and the recipe position of the entry that wins over it in the variant in view, so
 * the Inspect dialog can say "every selected=false (4)" and disable a scope that would change
 * nothing there. Both follow the lookup's own order, so a state that holds beats a lower one as it
 * does there.
 */

import { lookupOrder } from '../explain/index.mjs';

/** A path as one string, for comparing by. */
const keyOf = (path) => path.join('\u0000');

/**
 * Where a lookup order meets `path` for one cell: the position (`{ at, path }`) of an entry read
 * before it (which overrides it), null where a set there would be drawn, undefined where the order
 * never reads it.
 */
function overrideIn(order, style, cell, path) {
  const mine = order.findIndex((p) => keyOf(p.path) === keyOf(path));
  if (mine < 0) return undefined;
  const earlier = order
    .slice(0, mine)
    .find((p) => p.path.reduce((node, key) => node?.[key], style)?.[cell]);
  return earlier ?? null;
}

/**
 * The position (`{ at, path }`) of the entry that overrides `path` for this cell in this variant,
 * or null where a rule at `path` would be what the variant draws.
 *
 * @param {string[]} path a scope's IR path (scopes.mjs `scopesFor`), which the variant's lookup reads
 * @param {object[]} [order] the variant's `lookupOrder`, where the caller has it
 */
export function winnerOver(
  spec,
  layer,
  cell,
  variant,
  path,
  order = lookupOrder(spec, variant),
) {
  const wins = overrideIn(order, spec.style[layer], cell, path);
  if (wins === undefined)
    throw new Error(
      `${spec.component}: the lookup never reads ${path.join(' · ')} for ${variant.figma}`,
    );
  return wins;
}

/** The recipe position (its `at`) of the entry that overrides `path` here, or null (`winnerOver`). */
export function winsOver(
  spec,
  layer,
  cell,
  variant,
  path,
  order = lookupOrder(spec, variant),
) {
  return winnerOver(spec, layer, cell, variant, path, order)?.at ?? null;
}

/**
 * A component's reach, each variant's lookup order read once however many cells and scopes ask:
 * `count` is how many of the variants that draw the layer a `set` at `path` would change for the
 * cell, `total` how many draw the layer, and `winnerOver` and `winsOver` the entry that overrides
 * `path` in one variant (by its index): its position, and its `at`.
 */
export function reachOf(spec, oracle) {
  const orders = oracle.variants.map((v) => lookupOrder(spec, v));
  return {
    count: (layer, cell, path) =>
      oracle.variants.filter(
        (v, i) =>
          layer in v.layers &&
          overrideIn(orders[i], spec.style[layer], cell, path) === null,
      ).length,
    total: (layer) => oracle.variants.filter((v) => layer in v.layers).length,
    winnerOver: (layer, cell, index, path) =>
      winnerOver(
        spec,
        layer,
        cell,
        oracle.variants[index],
        path,
        orders[index],
      ),
    winsOver: (layer, cell, index, path) =>
      winsOver(spec, layer, cell, oracle.variants[index], path, orders[index]),
  };
}
