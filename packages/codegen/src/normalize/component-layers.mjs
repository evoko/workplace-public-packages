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

/**
 * The VARIANT-type props of a set: its axes, with their options in Figma's order. A standalone
 * component (one Figma drew with no variants, loaded as a set of one by `componentOf`) has none;
 * a set with none is a fetch gone wrong.
 */
function axesOf(set) {
  const axes = {};
  for (const [name, def] of Object.entries(set.props ?? {})) {
    if (def.type !== 'VARIANT') continue;
    axes[name] = { default: def.default, options: [...def.options] };
  }
  if (Object.keys(axes).length === 0 && !set.standalone)
    throw new Error(`${set.name}: has no variant axes`);
  return axes;
}

/**
 * `size=md, prio=primary` to `{size: 'md', prio: 'primary'}`, checked against the axes. The one
 * variant of a component with no axes is named `''`.
 */
function parseVariantName(name, axes) {
  const props = {};
  for (const part of name === '' ? [] : name.split(',')) {
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

    // A layer that exists only in this variant, recorded with its properties and its parent
    // (`{path, parent, layer}`), so it resolves like any other.
    for (const added of overrides.added ?? []) {
      if (!added?.path || !added.layer)
        throw new Error(
          `${raw.variant}: an added layer without a path or properties`,
        );
      layers.set(added.path, structuredClone(added.layer));
      parents.set(added.path, added.parent ?? '/');
    }
    for (const added of overrides.added ?? [])
      if (!layers.has(parents.get(added.path)))
        throw new Error(
          `${raw.variant}: adds ${added.path} under ${added.parent}, which it does not have`,
        );

    // The root's size is not diffed (the fetcher keeps it on the variant itself), so it is
    // read from there; the default tree's own root size is the default variant's.
    if (raw.size) layers.get('/').size = [...raw.size];

    return {
      name: raw.variant,
      props,
      layers,
      parents,
      removed,
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

/**
 * States Figma draws as `false/true` axes, strongest first. It is the order a platform resolves
 * two at once -- a disabled control shows no hover -- and the order both emitters apply them in
 * (each component's `STATE_SELECTORS`, and its Flutter `statePrecedence`, which is that reversed);
 * the MUI emitter refuses a table that orders these otherwise.
 */
export const BOOLEAN_STATES = [
  'disabled',
  'loading',
  'focus',
  'pressed',
  'hover',
];

/**
 * Folds the states a component draws as separate `false/true` axes (Checkbox's `hover`, `focus`,
 * `disabled`) into one `state` axis, the shape Button draws with one axis already: its value is
 * the axis that is true, or `default`. From there it is read like Button's -- `hover` and `focus`
 * are platform states, `disabled` a prop.
 *
 * A variant with two true is not a state of its own: the platform shows the stronger one, so it
 * is read as that and reported (`compound-state`), unless a variant already draws that state, in
 * which case it is dropped and reported. Beside a `state` axis nothing is folded: a `disabled` or
 * `loading` axis there is a prop already, and a platform state drawn both ways is refused.
 *
 * @returns {{resolved: ReturnType<typeof resolveVariants>, findings: object[]}}
 */
export function foldStateAxes(resolved) {
  const folded = Object.keys(resolved.axes).filter(
    (a) =>
      BOOLEAN_STATES.includes(a) &&
      resolved.axes[a].options.length === 2 &&
      resolved.axes[a].options.includes('false') &&
      resolved.axes[a].options.includes('true'),
  );
  if (!folded.length) return { resolved, findings: [] };
  // Beside a `state` axis, a `disabled` or `loading` axis is a prop already (Card's `loading`);
  // a platform state drawn both ways would need merging by judgement.
  if (resolved.axes.state) {
    const platform = folded.filter((a) => !['disabled', 'loading'].includes(a));
    if (platform.length)
      throw new Error(
        `${resolved.name}: draws states both as a state axis and as ${platform.join(', ')}`,
      );
    return { resolved, findings: [] };
  }
  for (const a of folded)
    if (resolved.axes[a].default !== 'false')
      throw new Error(`${resolved.name}: its default variant is ${a}`);

  // `state` takes the place of the first folded axis, so the others keep their order.
  const axes = {};
  for (const [name, def] of Object.entries(resolved.axes))
    if (name === folded[0])
      axes.state = {
        default: 'default',
        options: [
          'default',
          ...BOOLEAN_STATES.filter((s) => folded.includes(s)),
        ],
      };
    else if (!folded.includes(name)) axes[name] = def;

  const fold = (props) => {
    const on = BOOLEAN_STATES.filter((s) => props[s] === 'true');
    const next = {};
    for (const [a, value] of Object.entries(props))
      if (a === folded[0]) next.state = on[0] ?? 'default';
      else if (!folded.includes(a)) next[a] = value;
    return { props: next, on };
  };
  const keyOf = (props) =>
    Object.keys(axes)
      .map((a) => `${a}=${props[a]}`)
      .join(', ');
  const claimed = new Set(
    resolved.variants
      .map((v) => fold(v.props))
      .filter(({ on }) => on.length < 2)
      .map(({ props }) => keyOf(props)),
  );

  const variants = [];
  const read = [];
  const dropped = [];
  for (const v of resolved.variants) {
    const { props, on } = fold(v.props);
    if (on.length < 2) variants.push({ ...v, props });
    else if (claimed.has(keyOf(props))) dropped.push({ variant: v.name, on });
    else {
      claimed.add(keyOf(props));
      variants.push({ ...v, props });
      read.push({ variant: v.name, on });
    }
  }

  const component = resolved.name;
  const findings = [];
  if (read.length)
    findings.push({
      kind: 'compound-state',
      component,
      layer: '/',
      cell: 'state',
      variants: read.map(({ variant }) => ({ variant })),
      token: `component.${component.toLowerCase()}.state#compound`,
      figmaValue: read.map(({ on }) => on.join(' + ')).join('; '),
      reason: `${component} draws ${read.length === 1 ? 'a variant' : `${read.length} variants`} with two states at once (${read.map(({ on }) => on.join(' and ')).join('; ')}). A platform shows only the stronger, so ${read.length === 1 ? 'it is' : 'each is'} read as ${[...new Set(read.map(({ on }) => on[0]))].join(', ')}, which no variant draws on its own there.`,
      raise: `Ask SOLAR whether ${component} should draw ${[...new Set(read.map(({ on }) => on[0]))].join(', ')} on its own instead.`,
    });
  if (dropped.length)
    findings.push({
      kind: 'compound-state',
      component,
      layer: '/',
      cell: 'state',
      variants: dropped.map(({ variant }) => ({ variant })),
      token: `component.${component.toLowerCase()}.state#compound-dropped`,
      figmaValue: dropped.map(({ on }) => on.join(' + ')).join('; '),
      reason: `${component} draws ${dropped.length === 1 ? 'a variant' : `${dropped.length} variants`} with two states at once. A platform shows only the stronger, which another variant already draws, so ${dropped.length === 1 ? 'it is' : 'they are'} not read.`,
      raise: `Ask SOLAR whether ${component}'s ${dropped.map(({ on }) => on.join(' + ')).join(', ')} ${dropped.length === 1 ? 'variant' : 'variants'} can be removed.`,
    });
  return { resolved: { ...resolved, axes, variants }, findings };
}
