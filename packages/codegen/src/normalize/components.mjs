/**
 * Builds the component IR (design spec §4.2) from the SOLAR Web data.
 *
 * The IR is the contract every component target is generated from, the way spec/tokens.json is
 * for tokens: the public API, the platform states, the slots, and the style recipe in token
 * names, with where each came from. It records what Figma says and nothing more. Choices -- the
 * MUI or Flutter base to wrap, renaming `prio` to `variant`, an axis interaction that is
 * intended -- are the overlay's (spec/overlay/, milestone 3a task 4), so every one stays visible
 * as a decision rather than being baked in here.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { docsDir } from '../util/paths.mjs';
import { camel } from '../util/naming.mjs';
import { resolveVariants } from './component-layers.mjs';
import { deriveRecipe } from './recipe.mjs';

const webDir = join(docsDir, 'solar-web');

export function loadWebCatalog() {
  return JSON.parse(readFileSync(join(webDir, 'catalog.json'), 'utf8'));
}

/** The catalog entry and the raw component set for one component, by its Figma name. */
export function loadComponent(catalog, name) {
  const entry = catalog.components.find(
    (c) => c.name === name && c.kind === 'set',
  );
  if (!entry)
    throw new Error(`the SOLAR Web catalog has no component named ${name}`);
  const page = JSON.parse(
    readFileSync(
      join(webDir, 'raw', entry.section, `${entry.slug}.json`),
      'utf8',
    ),
  );
  const set = page.componentSets.find((s) => s.name === name);
  if (!set)
    throw new Error(
      `${entry.section}/${entry.slug}.json has no component set ${name}`,
    );
  return { entry, set };
}

/**
 * The values of Figma's `state` axis that are platform states: CSS pseudo-classes, Flutter
 * `WidgetState`s. Figma draws them as variants only because it has no pseudo-states (§4.2).
 * Any other value of that axis -- `disabled`, `loading` -- is something the platform cannot
 * derive by itself, so it becomes a boolean prop instead.
 */
export const PLATFORM_STATES = new Set([
  'default',
  'hover',
  'pressed',
  'focus',
]);

/** Figma keys props with a node suffix (`hasLabel#2104:66`); the catalog does not. */
const propName = (key) => key.replace(/#.*$/, '');

/**
 * Slots, from the layer tree: each layer whose visibility or content a component prop drives.
 * The catalog lists these too, but by layer *name*, and Button's two icon slots are both named
 * `Icon/None`; the tree's `propRefs` say which path each prop drives.
 */
function slotsOf(resolved, set) {
  const defaults = resolved.variants.find((v) => v.name === set.defaultVariant);
  const slots = {};
  for (const [path, layer] of defaults.layers) {
    const refs = layer.propRefs;
    if (!refs) continue;
    const props = {};
    if (refs.visible) props.visible = propName(refs.visible);
    if (refs.mainComponent) props.content = propName(refs.mainComponent);
    if (refs.characters) props.content = propName(refs.characters);
    if (!props.visible && !props.content) continue;

    // Named after the prop that shows it (`hasIconLeading` is `iconLeading`), else the one that
    // fills it, so the name is Figma's and not invented here.
    const name = props.visible?.startsWith('has')
      ? camel(props.visible.slice(3))
      : camel(props.content ?? props.visible);
    if (slots[name])
      throw new Error(`${set.name}: two slots are both named ${name}`);

    const def = (p) =>
      set.props[Object.keys(set.props).find((k) => propName(k) === p)];
    const slot = { layer: path, props };
    if (refs.characters) {
      slot.type = 'text';
      slot.default = def(props.content)?.default ?? null;
    } else if (refs.mainComponent) {
      // An instance swap whose default is an icon is an icon slot; any other swap is a component.
      slot.type = layer.main?.startsWith('Icon/') ? 'icon' : 'instance';
    } else {
      slot.type = 'component';
      slot.component = layer.main ?? null;
    }
    slot.optional = Boolean(props.visible);
    slot.visible = props.visible ? def(props.visible)?.default !== false : true;
    slots[name] = slot;
  }
  return slots;
}

/** A false/true axis is a boolean prop in every target, whatever Figma calls it. */
const isBoolean = (axis) =>
  axis.options.length === 2 &&
  axis.options.includes('false') &&
  axis.options.includes('true');

/**
 * @param {{entry: object, set: object}} component from loadComponent
 * @param {{names: ReturnType<import('./recipe.mjs').tokenNames>, fileVersion: string}} options
 */
export function buildComponentSpec({ entry, set }, { names, fileVersion }) {
  const resolved = resolveVariants(set);
  const recipe = deriveRecipe(resolved, { names });

  const api = {};
  const states = [];
  for (const [axis, def] of Object.entries(recipe.axes)) {
    if (def.role === 'state') {
      for (const value of def.options) {
        if (PLATFORM_STATES.has(value)) states.push(value);
        else api[value] = { type: 'boolean', default: false };
      }
    } else if (isBoolean(def))
      api[axis] = { type: 'boolean', default: def.default === 'true' };
    else api[axis] = { values: [...def.options], default: def.default };
  }

  const slots = slotsOf(resolved, set);

  // Layer names: the slot that owns a layer, else the layer's own name, and `root` for the
  // component. Paths stay beside them, because a path is what ties a name back to Figma.
  const bySlot = new Map(
    Object.entries(slots).map(([name, s]) => [s.layer, name]),
  );
  const layerNames = new Map();
  for (const path of Object.keys(recipe.layers)) {
    const name =
      path === '/'
        ? 'root'
        : (bySlot.get(path) ??
          camel(path.split('/').pop().replace(/#\d+$/, '')));
    if ([...layerNames.values()].includes(name))
      throw new Error(
        `${set.name}: layers ${path} and another are both named ${name}`,
      );
    layerNames.set(path, name);
  }

  const layers = {};
  const style = {};
  for (const [path, { parent, type }] of Object.entries(recipe.layers)) {
    const name = layerNames.get(path);
    layers[name] = {
      path,
      parent: parent === null ? null : layerNames.get(parent),
      type,
    };
    const s = recipe.style[path];
    style[name] = {
      base: s.base,
      size: s.size,
      // Keyed `prio=primary, danger=false`, as Figma spells the combination; the overlay's
      // renames reach these keys too (task 4).
      appearance: s.appearance,
    };
  }

  return {
    spec: {
      component: set.name,
      base: { mui: null, flutter: null },
      api,
      states,
      slots,
      layers,
      style,
      docs: {
        description: entry.description ?? null,
        figmaIssues: [...(entry.issues ?? [])],
      },
      provenance: {
        page: entry.section,
        pageId: entry.pageId,
        figmaNode: entry.nodeId,
        defaultVariant: set.defaultVariant,
        fileVersion,
      },
    },
    // Reported under the IR's layer names (`iconTrailing`, not `Icon/None#2`), which are what the
    // code and the design review use; the Figma path stays in `layer`.
    deviations: recipe.deviations.map((d) => {
      const lc = set.name.toLowerCase();
      const figma = d.layer === '/' ? 'root' : d.layer.slice(1);
      const prefix = `component.${lc}.${figma}.`;
      return d.token.startsWith(prefix)
        ? {
            ...d,
            token: `component.${lc}.${layerNames.get(d.layer)}.${d.token.slice(prefix.length)}`,
          }
        : d;
    }),
  };
}
