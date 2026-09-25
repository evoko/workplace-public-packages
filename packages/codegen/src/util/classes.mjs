/**
 * The class each layer of a component carries on the web, in two name spaces:
 *
 * - **public**, `Solar<Name>-<slot>`: a layer the caller fills (a slot), by the slot's name, which
 *   is the prop's and stable across syncs; with the root, which is the component's own element
 *   (its `className` and `sx`), the hooks an app may style;
 * - **internal**, `Solar<Name>--<layer>`: every other layer, by its name from Figma's layer
 *   names, which a designer's rename changes; not a contract.
 *
 * The recipe styles both and the visual check finds both by the same table (`slotsOf`), so the two
 * cannot drift; the drawn shells' runtime reads the public ones (`internal/layers.tsx`, `slots`).
 */

import { pascal } from './naming.mjs';

export const prefixOf = (component) => `Solar${pascal(component)}`;

/** Each slot's layer, by IR layer name, to the slot's name. */
export function publicLayers(spec) {
  const byPath = new Map(
    Object.entries(spec.layers).map(([name, l]) => [l.path, name]),
  );
  const out = {};
  for (const [slot, s] of Object.entries(spec.slots ?? {})) {
    const layer = byPath.get(s.layer);
    if (layer && layer !== 'root') out[layer] = slot;
  }
  return out;
}

/** The class of one layer, or null for the root, which is the component's element itself. */
export function layerClass(spec, layer) {
  if (layer === 'root') return null;
  const slot = publicLayers(spec)[layer];
  return slot
    ? `${prefixOf(spec.component)}-${slot}`
    : `${prefixOf(spec.component)}--${layer}`;
}

/**
 * `text` with each layer's class written as its own: `Solar<Name>-<layer>` (and a glyph control's
 * `Solar<Name>-<layer>Control`) as the layer's public or internal class, for every component in
 * `specs`. A shell helper that knows a layer only by its name (`cardResets`, `fieldStates`, run
 * before the IR is built) writes `${P}-${layer}`, and the codegen writes what the layer carries;
 * any other class (`SolarCard-press`, `SolarGlyph-fill`) is left as it is. A slot's name is its
 * public class already (`SolarCard-title`, the words), even where a layer has the name too (Card's
 * `title` frame, around them): a layer so named is written by its internal class, `--title`.
 *
 * @param {string} text generated source: a recipe module or a shell
 * @param {Map<string, object>} specs each IR, by its prefix (`SolarCard`)
 */
export function withLayerClasses(text, specs) {
  return text.replace(
    /\b(Solar[A-Z][A-Za-z0-9]*)-([a-z][A-Za-z0-9]*)\b/g,
    (whole, prefix, name) => {
      const spec = specs.get(prefix);
      if (!spec) return whole;
      const slots = new Set(Object.values(publicLayers(spec)));
      if (slots.has(name) || slots.has(name.replace(/Control$/, '')))
        return whole;
      const base =
        !(name in spec.layers) &&
        name.endsWith('Control') &&
        name.slice(0, -7) in spec.layers
          ? name.slice(0, -7)
          : name;
      if (!(base in spec.layers) || base === 'root') return whole;
      return `${layerClass(spec, base)}${name.slice(base.length)}`;
    },
  );
}

/** Every IR, by its prefix, for `withLayerClasses`. */
export const byPrefix = (specs) =>
  new Map(specs.map((s) => [prefixOf(s.component), s]));

/**
 * Every layer's class but the root's, by layer: for a shell that picks a layer while it runs (a
 * breadcrumb trail's item by its position), which the codegen cannot rewrite in its text.
 */
export const classesOf = (spec) =>
  Object.fromEntries(
    Object.keys(spec.layers)
      .filter((l) => l !== 'root')
      .map((l) => [l, layerClass(spec, l)]),
  );
