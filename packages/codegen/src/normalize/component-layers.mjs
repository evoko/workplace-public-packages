/**
 * Resolves every variant of a Figma component set into a flat layer model.
 *
 * The SOLAR Web fetcher stores one full layer tree, for the default variant, and for every other
 * variant only a diff against it (docs/solar-web/schema.md, `Variant.overrides`). This inverts
 * that diff: each variant becomes a map of layer path to that layer's properties, exactly as
 * Figma has them in that variant. It interprets nothing -- which axis a property follows, and
 * whether a disagreement is a Figma mistake, is the recipe stage's question, and it can only ask
 * it of data that has not already been corrected.
 *
 * `vars` stays beside the literal it binds (`radius: 6` with `vars.topLeftRadius:
 * 'Spatial:radius/control'`), because the token name, not the pixel value, is what a recipe
 * carries.
 */

/**
 * Layer paths, spelled the way the fetcher's `flatten` spells them: `/` for the root, then each
 * name joined with `/`, and `#2`, `#3` for a second and third sibling of the same name.
 *
 * Structure comes from walking the tree, never from splitting a path: SOLAR layer names contain
 * `/` themselves (`Icon/None`), so `/Icon/None` could be one layer or two. The walk yields each
 * layer's parent path alongside it, which is the only reliable way to know.
 */
function* walk(node, path = '/', parent = null) {
  yield { path, parent, node };
  const seen = new Map();
  for (const child of node.children ?? []) {
    const n = (seen.get(child.name) ?? 0) + 1;
    seen.set(child.name, n);
    const prefix = path === '/' ? '' : path;
    yield* walk(child, `${prefix}/${child.name}${n > 1 ? `#${n}` : ''}`, path);
  }
}

/** A layer's own properties: everything but its children, deep-copied. */
const own = ({ children: _children, ...props }) => structuredClone(props);

// The two properties the fetcher diffs by sub-key rather than whole (schema.md).
const OBJECT_DIFFED = new Set(['vars', 'layout']);

/**
 * Applies one `changed` entry to one layer. The inverse of the fetcher's diff, rule for rule:
 * `null` means the default had the property and this variant does not; for `vars` and `layout`,
 * when the default had the object, the patch lists only the sub-keys that differ, with `null`
 * again meaning removed; otherwise a value replaces the default's whole.
 */
function applyChange(layer, change) {
  for (const [key, value] of Object.entries(change)) {
    if (value === null) delete layer[key];
    else if (
      OBJECT_DIFFED.has(key) &&
      layer[key] &&
      typeof value === 'object'
    ) {
      const merged = { ...layer[key] };
      for (const [sub, v] of Object.entries(value)) {
        if (v === null) delete merged[sub];
        else merged[sub] = structuredClone(v);
      }
      layer[key] = merged;
    } else layer[key] = structuredClone(value);
  }
}

/** The VARIANT-type props of a set: its axes, with their options in Figma's order. */
function axesOf(set) {
  const axes = {};
  for (const [name, def] of Object.entries(set.props ?? {})) {
    if (def.type !== 'VARIANT') continue;
    axes[name] = { default: def.default, options: [...def.options] };
  }
  if (Object.keys(axes).length === 0)
    throw new Error(`${set.name}: has no variant axes`);
  return axes;
}

/** `size=md, prio=primary` to `{size: 'md', prio: 'primary'}`, checked against the axes. */
function parseVariantName(name, axes) {
  const props = {};
  for (const part of name.split(',')) {
    const [key, value] = part.split('=').map((s) => s.trim());
    props[key] = value;
  }
  for (const [axis, { options }] of Object.entries(axes)) {
    if (!(axis in props)) throw new Error(`${name}: missing ${axis}`);
    if (!options.includes(props[axis]))
      throw new Error(
        `${name}: ${axis}=${props[axis]} is not one of ${options.join(', ')}`,
      );
  }
  for (const key of Object.keys(props))
    if (!(key in axes)) throw new Error(`${name}: ${key} is not an axis`);
  return props;
}

/**
 * @param {object} set one entry of a raw page's `componentSets`
 * @returns {{
 *   name: string,
 *   axes: Record<string, {default: string, options: string[]}>,
 *   variants: Array<{
 *     name: string,
 *     props: Record<string, string>,
 *     layers: Map<string, object>,
 *     parents: Map<string, string | null>,
 *     removed: string[],
 *     unresolved: string[],
 *   }>,
 * }}
 */
export function resolveVariants(set) {
  // A truncated set is missing variants outright, and a recipe built from part of the matrix
  // would report the absent combinations as agreeing with nothing, or not at all.
  if (set.variantsTruncated)
    throw new Error(
      `${set.name}: the fetcher truncated its variants, so the matrix is incomplete`,
    );

  const axes = axesOf(set);
  const base = [...walk(set.defaultVariantTree)];
  const basePaths = new Set(base.map((l) => l.path));
  const seen = new Set();

  const variants = set.variants.map((raw) => {
    const props = parseVariantName(raw.variant, axes);
    const key = Object.keys(axes)
      .map((a) => `${a}=${props[a]}`)
      .join(', ');
    if (seen.has(key)) throw new Error(`${raw.variant} appears twice`);
    seen.add(key);

    const overrides = raw.overrides ?? {};
    if (raw.variant === set.defaultVariant && raw.overrides)
      throw new Error(
        `${set.name}: the default variant ${raw.variant} carries overrides of its own`,
      );

    const removed = [...(overrides.removed ?? [])];
    for (const path of removed)
      if (!basePaths.has(path))
        throw new Error(
          `${raw.variant}: removes ${path}, which the default variant does not have`,
        );
    const gone = new Set(removed);

    const layers = new Map();
    const parents = new Map();
    for (const { path, parent, node } of base) {
      // A removed layer takes everything under it with it.
      if (gone.has(path) || (parent !== null && !layers.has(parent))) continue;
      layers.set(path, own(node));
      parents.set(path, parent);
    }

    for (const [path, change] of Object.entries(overrides.changed ?? {})) {
      if (!basePaths.has(path))
        throw new Error(
          `${raw.variant}: changes ${path}, which the default variant does not have`,
        );
      if (!layers.has(path))
        throw new Error(
          `${raw.variant}: changes ${path}, which it also removes`,
        );
      applyChange(layers.get(path), change);
    }

    // The fetcher records a layer that exists only in this variant by path alone, with none of
    // its properties. It is kept as present -- a visible difference between variants -- and
    // listed, so nothing downstream mistakes an unknown layer for an empty one.
    const unresolved = [...(overrides.added ?? [])];
    for (const path of unresolved) layers.set(path, { unresolved: 'added' });

    // The root's size is not diffed (the fetcher keeps it on the variant itself), so it is
    // read from there; the default tree's own root size is the default variant's.
    if (raw.size) layers.get('/').size = [...raw.size];

    // Icons are instances, and the fetcher does not descend into an instance, so their colour is
    // in no layer: only in the variant's `iconFills` digest. It is carried through for the recipe
    // to read as one cell, never merged into a layer.
    const iconFills = raw.iconFills?.length ? [...raw.iconFills] : null;

    return {
      name: raw.variant,
      props,
      layers,
      parents,
      removed,
      unresolved,
      iconFills,
    };
  });

  if (
    !seen.has(
      Object.entries(axes)
        .map(([a, { default: d }]) => `${a}=${d}`)
        .join(', '),
    )
  )
    throw new Error(`${set.name}: no variant carries every axis default`);

  return { name: set.name, axes, variants };
}
