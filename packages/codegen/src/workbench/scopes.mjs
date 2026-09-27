/**
 * The looks a workbench `set` rule for one cell may be keyed on, from every variant (`base`) to the
 * one in view (`combined`), each as the overlay key a person would write: axis names and values in
 * Figma's spelling, since `rename` applies after `set` (spec/overlay/README.md, `rename`), and a
 * state in the IR's, since `states.rename` applies before the recipe (`states`). Only a key the
 * build takes is offered: one whose entries the IR has, or may be given (`setMayAdd`). The IR path
 * beside each key is where the recipe lookup reads the entry (explain/index.mjs), and the label
 * says the same look in plain words (`plainLabel`).
 */

import { statePrecedence } from '../emit/flutter-component.mjs';
import { appearanceAxes, recipeProps } from '../explain/index.mjs';
import { setMayAdd } from '../normalize/overlay.mjs';
import { recipeAxes } from '../spec.mjs';

/** The platform state that holds in a variant, by the recipe's precedence, or `default`. */
export function stateOf(spec, variant) {
  const props = recipeProps(spec, variant);
  for (const state of statePrecedence(spec.component)) {
    const holds = spec.states.includes(state)
      ? variant.state === state
      : props[state] === true;
    if (holds) return state;
  }
  return 'default';
}

/**
 * A look (`prio=primary, danger=false`) in plain words: an axis that is false left out, one that
 * is true by its name, any other by its value alone (`primary`); empty where nothing is left.
 */
export function plainLook(look) {
  if (!look || look === 'default') return '';
  return look
    .split(', ')
    .map((pair) => pair.split('='))
    .filter(([, value]) => value !== 'false')
    .map(([axis, value]) => (value === 'true' ? axis : value))
    .join(', ');
}

/** A state in plain words: the resting look `at rest`, any other by its name. */
const plainState = (state) => (state === 'default' ? 'at rest' : state);

/**
 * A recipe position (an IR path, as `lookupOrder` and `scopesFor` give it) in plain words: `every
 * variant`, `every md`, `primary · at rest`, `md · primary, danger · hover`.
 */
export function plainLabel([section, ...keys]) {
  if (section === 'base') return 'every variant';
  if (section === 'size') return `every ${keys[0]}`;
  const [size, look, state] =
    section === 'combined' ? keys : [null, keys[0], keys[1]];
  return [size, plainLook(look), plainState(state)].filter(Boolean).join(' · ');
}

/** One IR axis name and value in Figma's spelling, by the overlay's `rename`. */
function figmaPair(doc, axis, value) {
  for (const [figmaAxis, rule] of Object.entries(doc?.rename ?? {})) {
    const codeAxis = rule?.to ?? figmaAxis;
    if (codeAxis !== axis) continue;
    const figmaValue = Object.entries(rule?.values ?? {}).find(
      ([, code]) => String(code) === String(value),
    )?.[0];
    return [figmaAxis, figmaValue ?? value];
  }
  return [axis, value];
}

/** A look (`variant=solid, span=end`) in Figma's spelling (`style=solid, span=end`). */
export function figmaSpelling(doc, look) {
  if (look === 'default') return look;
  return look
    .split(', ')
    .map((pair) => {
      const [axis, value] = pair.split('=');
      return figmaPair(doc, axis, value).join('=');
    })
    .join(', ');
}

/** The recipe's axes as `setMayAdd` reads them, each with its values as a look spells them. */
const axesOf = (spec) =>
  Object.fromEntries(
    Object.entries(recipeAxes(spec)).map(([axis, def]) => [
      axis,
      { options: (def.values ?? [true, false]).map(String) },
    ]),
  );

/**
 * Whether a `set` at this IR path would be taken by the build: every step is an entry the IR has,
 * or one the set loop may add (normalize/overlay.mjs, `setMayAdd`).
 */
function accepted(spec, layer, [section, ...keys]) {
  let node = spec.style[layer]?.[section];
  if (!node) return false;
  const mayAdd = setMayAdd(spec, section, axesOf(spec));
  return keys.every((key, i) => {
    const last = i === keys.length - 1 && section !== 'size';
    if (!node[key] && !mayAdd(key, i, last)) return false;
    node = node[key] ?? {};
    return true;
  });
}

/**
 * @param {object} spec the component's IR
 * @param {object | null} doc its overlay, parsed (for the renames)
 * @param {string} layer an IR layer
 * @param {string} cell an IR cell
 * @param {object} variant one of the oracle's variants
 * @returns {{label: string, key: string, path: string[]}[]} broadest first, each one the build takes
 */
export function scopesFor(spec, doc, layer, cell, variant) {
  const props = recipeProps(spec, variant);
  const axes = appearanceAxes(spec);
  const look =
    axes.map((a) => `${a}=${String(props[a])}`).join(', ') || 'default';
  const size = 'size' in spec.api ? String(props.size) : null;
  const state = stateOf(spec, variant);
  const figmaSize = size && figmaPair(doc, 'size', size)[1];
  const figmaLook = figmaSpelling(doc, look);
  const out = [{ key: `${layer}.base.${cell}`, path: ['base'] }];
  if (size)
    out.push({
      key: `${layer}.size.${figmaSize}.${cell}`,
      path: ['size', size],
    });
  if (axes.length || state !== 'default')
    out.push({
      key: `${layer}.appearance.${figmaLook}.${state}.${cell}`,
      path: ['appearance', look, state],
    });
  if (size && axes.length)
    out.push({
      key: `${layer}.combined.${figmaSize}.${figmaLook}.${state}.${cell}`,
      path: ['combined', size, look, state],
    });
  return out
    .filter((scope) => accepted(spec, layer, scope.path))
    .map((scope) => ({ label: plainLabel(scope.path), ...scope }));
}
