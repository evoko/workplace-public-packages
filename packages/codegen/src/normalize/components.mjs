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
import { foldStateAxes, resolveVariants } from './component-layers.mjs';
import {
  applyDefaults,
  applyOverlay,
  followsOf,
  restylesOf,
  renameStates,
  sameLayers,
  sampleAxes,
} from './overlay.mjs';
import { deriveRecipe } from './recipe.mjs';

const webDir = join(docsDir, 'solar-web');

export function loadWebCatalog() {
  return JSON.parse(readFileSync(join(webDir, 'catalog.json'), 'utf8'));
}

/**
 * The raw component set for one catalog entry. A standalone component -- one Figma drew with no
 * variants (Drawer, Scrim, Pagination) -- is the set of its one variant, named `''`, with no
 * axes, so it resolves and derives as any set does. `rawDir` reads the raw pages from elsewhere --
 * a test checking a fetcher change before it is synced.
 */
export function componentOf(entry, { rawDir = join(webDir, 'raw') } = {}) {
  const page = JSON.parse(
    readFileSync(join(rawDir, entry.section, `${entry.slug}.json`), 'utf8'),
  );
  if (entry.kind === 'set') {
    const set = page.componentSets.find((s) => s.name === entry.name);
    if (!set)
      throw new Error(
        `${entry.section}/${entry.slug}.json has no component set ${entry.name}`,
      );
    return set;
  }
  const one = (page.components ?? []).find((c) => c.name === entry.name);
  if (!one)
    throw new Error(
      `${entry.section}/${entry.slug}.json has no component ${entry.name}`,
    );
  return {
    name: one.name,
    id: one.id,
    description: one.description,
    props: one.props,
    standalone: true,
    defaultVariant: '',
    defaultVariantTree: one.tree,
    variants: [{ variant: '' }],
  };
}

/** A catalog entry's section without the `components/` every component's has: `calendar`. */
const sectionOf = (entry) => entry.section.replace(/^components\//, '');

/**
 * A component's address: its Figma name, or `<section>/<name>` where the name alone is two
 * components' (`calendar/Day Cell`, `inputs/Day Cell`).
 */
export const addressOf = (catalog, entry) =>
  catalog.components.filter(
    (c) =>
      c.name === entry.name && (c.kind === 'set' || c.kind === 'component'),
  ).length > 1
    ? `${sectionOf(entry)}/${entry.name}`
    : entry.name;

/**
 * The catalog entry for one component, by its address. A bare name two components share is an
 * error naming both, never a guess.
 */
export function findEntry(catalog, address) {
  const components = catalog.components.filter(
    (c) => c.kind === 'set' || c.kind === 'component',
  );
  // By name first, then by `<section>/<name>`: a view's Figma name may itself hold a `/`.
  let found = components.filter((c) => c.name === address);
  if (found.length === 0)
    found = components.filter((c) => `${sectionOf(c)}/${c.name}` === address);
  if (found.length === 0)
    throw new Error(`the SOLAR Web catalog has no component named ${address}`);
  if (found.length > 1)
    throw new Error(
      `${address} is the name of ${found.map((c) => `${sectionOf(c)}/${c.name}`).join(' and ')}; address it by one of those`,
    );
  return found[0];
}

/** The catalog entry and the raw component set for one component, by its address. */
export function loadComponent(catalog, address, { rawDir } = {}) {
  const entry = findEntry(catalog, address);
  return { entry, set: componentOf(entry, { rawDir }) };
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
  // Every layer any variant has, the default's first: a slot can exist only in some variants
  // (Dialog's image, only in type=image).
  const layers = new Map();
  const parents = new Map();
  for (const v of [defaults, ...resolved.variants])
    for (const [path, layer] of v.layers)
      if (!layers.has(path)) {
        layers.set(path, layer);
        parents.set(path, v.parents.get(path) ?? null);
      }
  const found = {};
  for (const [path, layer] of layers) {
    const refs = layer.propRefs;
    if (!refs) continue;
    const props = {};
    if (refs.visible) props.visible = propName(refs.visible);
    if (refs.mainComponent) props.content = propName(refs.mainComponent);
    if (refs.characters) props.content = propName(refs.characters);
    // A Figma slot (Tabs' strip, Card's content, Dialog's image): the caller's content.
    if (refs.slotContentId) props.content = propName(refs.slotContentId);
    if (!props.visible && !props.content) continue;

    // Named after the prop that shows it, less the verb (`hasIconLeading` is `iconLeading`,
    // `show leading icon` is `leadingIcon`), else the one that fills it, so the name is Figma's
    // and not invented here.
    const shows = props.visible?.match(
      /^(?:has|show)(?=[A-Z\s_-])[\s_-]*(.+)$/i,
    );
    const name = shows
      ? camel(shows[1])
      : camel(props.content ?? props.visible);
    const entry = {
      layer: path,
      props,
      refs,
      main: layer.main,
      nodeType: layer.type,
    };
    const other = found[name];
    if (!other) {
      found[name] = entry;
      continue;
    }
    // One slot drawn by two layers: a frame one prop shows, and the text or instance inside it
    // another prop fills (`show label` on `/Label`, `label` on `/Label/Label`), where the inner
    // one is shown by the same prop or by none. The slot is the frame, since that is what appears
    // and disappears; `contentLayer` says what is filled, when something is.
    const [outer, inner] = within(path, other.layer, parents)
      ? [other, entry]
      : within(other.layer, path, parents)
        ? [entry, other]
        : [];
    // One slot drawn by several layers the same props drive, neither inside the other: a layer
    // that moves by variant (Tree Item's chevron is ChevronRight collapsed and ChevronDown
    // expanded) or two drawn together (Day Cell's two "more events" chips). The first in layer
    // order is the slot's layer, the rest its alternates; each keeps its own style.
    if (!outer) {
      if (JSON.stringify(entry.props) !== JSON.stringify(other.props))
        throw new Error(`${set.name}: two slots are both named ${name}`);
      other.alternates = [...(other.alternates ?? []), path];
      continue;
    }
    const merges =
      outer.props.visible &&
      !outer.props.content &&
      !outer.contentLayer &&
      [undefined, outer.props.visible].includes(inner.props.visible);
    if (!merges)
      throw new Error(`${set.name}: two slots are both named ${name}`);
    found[name] = inner.props.content
      ? {
          ...inner,
          layer: outer.layer,
          props: { visible: outer.props.visible, content: inner.props.content },
          contentLayer: inner.layer,
        }
      : outer;
  }

  const def = (p) =>
    set.props[Object.keys(set.props).find((k) => propName(k) === p)];
  const slots = {};
  for (const [
    name,
    { layer, props, refs, main, nodeType, contentLayer, alternates },
  ] of Object.entries(found)) {
    const slot = { layer, props };
    if (alternates) slot.alternates = alternates;
    if (contentLayer) slot.contentLayer = contentLayer;
    if (refs.characters) {
      slot.type = 'text';
      slot.default = def(props.content)?.default ?? null;
    } else if (refs.mainComponent) {
      // An instance swap whose default is an icon is an icon slot; any other swap is a component.
      slot.type = main?.startsWith('Icon/') ? 'icon' : 'instance';
    } else if (refs.slotContentId) {
      slot.type = 'content';
    } else if (main?.startsWith('Icon/')) {
      // An icon a boolean shows, with no swap to fill it (Text Input's): still the caller's icon.
      slot.type = 'icon';
    } else if (nodeType === 'TEXT') {
      // Text a boolean shows with no text prop (Text Input's mandatory `*`, Card's helper).
      slot.type = 'text';
      slot.default = null;
    } else {
      slot.type = 'component';
      slot.component = main ?? null;
    }
    slot.optional = Boolean(props.visible);
    slot.visible = props.visible ? def(props.visible)?.default !== false : true;
    slots[name] = slot;
  }
  return slots;
}

/**
 * The slots an overlay declares (`slots: { <layer>: { name, type, reason } }`): a layer the caller
 * fills although Figma drives it with no prop -- Icon Button's icon, Tag's parts. Several layers
 * may draw one slot, in different variants (Tag's icon sits in one layer for icon-only and another
 * for icon+text): the first, in layer order, is the slot's `layer` and the rest its `alternates`.
 * A rule naming a layer the IR does not have, or a slot Figma already defines, fails.
 */
function declareSlots(slots, overlay, layerNames) {
  const rules = Object.entries(overlay?.slots ?? {});
  if (!rules.length) return slots;
  const where = overlay.file;
  const pathOf = new Map([...layerNames].map(([path, name]) => [name, path]));
  const order = [...layerNames.keys()];
  const out = { ...slots };
  const declared = {};
  for (const [layer, rule] of rules) {
    const path = pathOf.get(layer);
    if (!path)
      throw new Error(`${where}: slots.${layer}: the IR has no layer ${layer}`);
    if (slots[rule.name])
      throw new Error(
        `${where}: slots.${layer}: ${rule.name} is already a Figma slot`,
      );
    (declared[rule.name] ??= []).push(path);
  }
  for (const [name, paths] of Object.entries(declared)) {
    const [layer, ...alternates] = paths.sort(
      (a, b) => order.indexOf(a) - order.indexOf(b),
    );
    const rule = overlay.slots[layerNames.get(layer)];
    out[name] = {
      layer,
      ...(alternates.length ? { alternates } : {}),
      props: {},
      type: rule.type,
      optional: true,
      visible: true,
      declared: rule.reason,
    };
  }
  return out;
}

/** Whether `path` is inside `ancestor`, by the parents map (a path cannot be split for it). */
function within(path, ancestor, parents) {
  for (let p = parents.get(path); p; p = parents.get(p))
    if (p === ancestor) return true;
  return false;
}

/**
 * The IR's name for every layer: `root` for the component, the slot's name for a layer a slot owns,
 * else the layer's own name (`Tab Item#2`, Figma's second sibling of that name, is `tabItem2`).
 * Paths stay beside the names, because a path is what ties a name back to Figma.
 *
 * Where two layers would share a name, each of them is qualified by its parent's own name, and
 * then its grandparent's, until the names differ: `/Field/Label` is `fieldLabel` beside `/Label`,
 * whose parent is the component and which keeps `label`. A slot's layer is qualified the same way,
 * from the slot's name (Card's `title` text, inside a frame also named Title, is `titleTitle`);
 * the slot itself, and so the prop, keeps Figma's name. Names come from the set of paths alone, never from the order they were seen, so
 * a layer another variant adds cannot rename one that was already there.
 *
 * @param {Map<string, string | null>} parents every layer's path, to its parent's
 * @param {Record<string, {layer: string}>} slots
 * @returns {Map<string, string>} path to name
 */
export function namesOf(parents, slots, component, given = {}) {
  const bySlot = new Map(
    Object.entries(slots).map(([name, s]) => [s.layer, name]),
  );
  // A name the overlay gives (`layerNames`) is the layer's own word, as a slot's is: for a layer
  // Figma names by a glyph (PIN Input's `|`) or two whose names reduce to one (Tree Item's `Label`
  // and `|Label`).
  for (const [path, name] of Object.entries(given)) {
    if (!parents.has(path))
      throw new Error(
        `${component}: layerNames ${path}: the component has no such layer`,
      );
    if (bySlot.has(path))
      throw new Error(
        `${component}: layerNames ${path}: the layer is slot ${bySlot.get(path)}'s, whose name is the slot's`,
      );
    bySlot.set(path, name);
  }
  // A path cannot be split to find a layer's own name, since names contain `/` themselves.
  const own = (path) => {
    const parent = parents.get(path);
    return path.slice(parent === '/' ? 1 : parent.length + 1);
  };
  const chain = (path) => {
    const names = [];
    for (let p = path; p && p !== '/'; p = parents.get(p))
      names.unshift(own(p));
    return names;
  };
  // A path's name qualified by `depth` ancestors, or null once it has none left to add. A slot's
  // layer starts from the slot's name.
  const at = (path, depth) => {
    if (path === '/') return depth ? null : 'root';
    const names = chain(path);
    if (depth >= names.length) return null;
    const words = [
      ...names.slice(-1 - depth, -1),
      bySlot.get(path) ?? names.at(-1),
    ].join(' ');
    if (!/[a-zA-Z0-9]/.test(words))
      throw new Error(
        `${component}: layer ${path} has no letter or digit to name it by; name it with an overlay layerNames rule`,
      );
    return camel(words);
  };

  // Repeated siblings (`Skeleton`, `Skeleton#2`…) are one family and are qualified together, so
  // they keep reading as a series.
  const family = (path) =>
    path === '/'
      ? '/'
      : `${parents.get(path)}\u0000${own(path).replace(/#\d+$/, '')}`;
  const depth = new Map([...parents.keys()].map((p) => [family(p), 0]));
  const name = (path) => at(path, depth.get(family(path)));
  for (;;) {
    const byName = new Map();
    for (const path of parents.keys())
      byName.set(name(path), [...(byName.get(name(path)) ?? []), path]);
    const clashes = [...byName.values()].filter((group) => group.length > 1);
    if (!clashes.length) break;
    const move = new Set();
    for (const group of clashes)
      for (const path of group)
        if (at(path, depth.get(family(path)) + 1) !== null)
          move.add(family(path));
    for (const f of move) depth.set(f, depth.get(f) + 1);
    const moved = move.size > 0;
    if (!moved)
      throw new Error(
        `${component}: layers ${clashes[0].join(' and ')} are all named ${name(clashes[0][0])}, and qualifying them cannot tell them apart; name one with an overlay layerNames rule`,
      );
  }
  return new Map([...parents.keys()].map((p) => [p, name(p)]));
}

/** A false/true axis is a boolean prop in every target, whatever Figma calls it. */
const isBoolean = (axis) =>
  axis.options.length === 2 &&
  axis.options.includes('false') &&
  axis.options.includes('true');

/**
 * @param {{entry: object, set: object}} component from loadComponent
 * @param {{
 *   names: ReturnType<import('./recipe.mjs').tokenNames>,
 *   fileVersion: string,
 *   overlay?: object | null,
 *   defaults?: object | null,
 * }} options `overlay` from loadOverlay and `defaults` from loadDefaults; null for both builds the
 *   IR as Figma has it
 */
export function buildComponentSpec(
  { entry, set: figmaSet },
  { names, fileVersion, overlay = null, defaults = null },
) {
  // The overlay's code name, where Figma's name is two components' (the calendar's and the date
  // picker's Day Cell), is the component's name from here on: its files, its code and its
  // findings' tokens. Figma's stays in the provenance.
  const codeName = overlay?.codeName?.name;
  const set = codeName ? { ...figmaSet, name: codeName } : figmaSet;
  // Checkbox draws `hover` and `focus` as axes of their own; they are one state axis here.
  const folded = foldStateAxes(resolveVariants(set));
  const stateFindings = folded.findings;
  // Then a state value Figma spells otherwise (Text Input's `pressed` is its focus state).
  // Axes that are samples of what the caller gives (Avatar's colours) are dropped, keeping the
  // variants at the values the overlay names.
  // And the layers the overlay reads as one (Inline Input's action frames, drawn anew per state).
  const resolved = sampleAxes(
    sameLayers(renameStates(folded.resolved, overlay), overlay),
    overlay,
  );
  // Settled before the recipe, because the overlay's `follows` rules are written in them.
  const parents = new Map();
  const defaultVariant = resolved.variants.find(
    (v) => v.name === set.defaultVariant,
  );
  for (const v of [defaultVariant, ...resolved.variants])
    for (const path of v.layers.keys())
      if (!parents.has(path)) parents.set(path, v.parents.get(path) ?? null);
  // Figma's slots, then the ones the overlay declares where Figma records no prop, addressed by
  // the layer names Figma's slots alone give.
  const given = Object.fromEntries(
    Object.entries(overlay?.layerNames ?? {}).map(([path, r]) => [
      path,
      r.name,
    ]),
  );
  const slots = declareSlots(
    slotsOf(resolved, set),
    overlay,
    namesOf(parents, slotsOf(resolved, set), set.name, given),
  );
  const layerNames = namesOf(parents, slots, set.name, given);
  const pathOf = (name) =>
    [...layerNames].find(([, n]) => n === name)?.[0] ?? null;

  const recipe = deriveRecipe(resolved, {
    names,
    follows: followsOf(overlay, pathOf),
    restyles: restylesOf(overlay, pathOf),
  });

  const api = {};
  const states = [];
  for (const [axis, def] of Object.entries(recipe.axes)) {
    if (def.role === 'state') {
      for (const value of def.options) {
        // A compound state (DatePicker's error-focused) is its parts held at once, which the
        // shell detects as it does a platform state: no prop.
        if (PLATFORM_STATES.has(value) || overlay?.states?.compound?.[value])
          states.push(value);
        else api[value] = { type: 'boolean', default: false };
      }
    } else if (isBoolean(def))
      api[axis] = { type: 'boolean', default: def.default === 'true' };
    else api[axis] = { values: [...def.options], default: def.default };
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
      // Keyed `prio=primary, danger=false`, as Figma spells the combination; an overlay rename
      // respells these keys too.
      appearance: s.appearance,
      ...(s.combined ? { combined: s.combined } : {}),
    };
  }

  const spec = {
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
      ...(codeName ? { figmaName: figmaSet.name } : {}),
      page: entry.section,
      pageId: entry.pageId,
      figmaNode: entry.nodeId,
      defaultVariant: set.defaultVariant,
      fileVersion,
    },
  };

  // Reported under the IR's layer names (`iconTrailing`, not `Icon/None#2`), which are what the
  // code and the design review use; the Figma path stays in `layer`.
  const lc = set.name.toLowerCase();
  const deviations = [...stateFindings, ...recipe.deviations].map((d) => {
    const figma = d.layer === '/' ? 'root' : d.layer.slice(1);
    const prefix = `component.${lc}.${figma}.`;
    return d.token.startsWith(prefix)
      ? {
          ...d,
          token: `component.${lc}.${layerNames.get(d.layer)}.${d.token.slice(prefix.length)}`,
        }
      : d;
  });

  const applied = applyOverlay(spec, deviations, overlay, {
    names,
    axes: recipe.axes,
  });
  return applyDefaults(applied.spec, applied.deviations, defaults, {
    names,
    overlay,
  });
}
