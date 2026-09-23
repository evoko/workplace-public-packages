/**
 * Derives a component's style recipe from its resolved variants, in token names.
 *
 * The model is SOLAR's own: **geometry follows the size axis, paint follows the appearance and
 * state axes.** Each style cell -- a layer's background, its padding, a text layer's type -- is
 * classified as geometry or paint, and its value for each combination of the axes it follows is
 * read from the one variant that holds every *other* axis at its default. That is the recipe.
 *
 * Then every other variant is checked against it. Where one disagrees, the recipe keeps the
 * reference value and the disagreement is recorded as a deviation naming the exact variants,
 * never averaged away and never allowed to win: it is either a Figma mistake or a real
 * interaction between axes, and both are a human's call (the overlay, milestone 3a task 4).
 * Values bound to no variable, or to one that is not a SOLAR token, are recorded the same way.
 */

// ---------------------------------------------------------------------------------------------
// Figma names to SOLAR token names

/**
 * Lookups from the names Figma binds to the SOLAR doc names, built from the token contract so a
 * name resolves only if it is really a token. An unknown name returns null; it is never guessed
 * from its spelling.
 */
export function tokenNames(contract) {
  const variables = new Map(
    contract.variables.map((v) => [`${v.collection}:${v.figma}`, v.doc]),
  );
  const textStyles = new Set(
    contract.textStyles
      .map((t) => t.figma)
      .filter((f) => !f.startsWith('.') && !f.startsWith('_')),
  );
  const effectStyles = new Map(
    contract.effectStyles.map((e) => [e.figma, e.doc]),
  );
  const pixels = new Map();
  for (const v of contract.variables) {
    const raw = v.value ?? v.desktop;
    const n =
      typeof raw === 'number' ? raw : Number(String(raw).replace(/px$/, ''));
    if (Number.isFinite(n)) pixels.set(v.doc, n);
  }
  const all = new Set([
    ...variables.values(),
    ...[...textStyles].map((f) => `typography.${f.replaceAll('/', '.')}`),
    ...effectStyles.values(),
  ]);
  return {
    variable: (name) => variables.get(name) ?? null,
    /** Whether a doc name is a SOLAR token at all. */
    has: (doc) => all.has(doc),
    /** A dimension token's value in pixels, or null for anything else. */
    value: (doc) => pixels.get(doc) ?? null,
    textStyle: (name) =>
      textStyles.has(name) ? `typography.${name.replaceAll('/', '.')}` : null,
    effectStyle: (name) => effectStyles.get(name) ?? null,
    /** Token names in the given families whose pixel value equals `n`. */
    matching(n, families) {
      return [...pixels]
        .filter(
          ([doc, px]) =>
            px === n && families.some((f) => doc.startsWith(`${f}.`)),
        )
        .map(([doc]) => doc)
        .sort();
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Axis roles

const ROLES = new Set(['size', 'appearance', 'state']);

/** By name, unless given: `size` drives geometry, `state` is interaction, the rest appearance. */
function roleOf(axis, given) {
  const role =
    given?.[axis] ??
    (axis === 'size' ? 'size' : axis === 'state' ? 'state' : 'appearance');
  if (!ROLES.has(role)) throw new Error(`${axis}: unknown role ${role}`);
  return role;
}

// Which roles each class of cell follows.
const FOLLOWS = { geometry: ['size'], paint: ['appearance', 'state'] };

// ---------------------------------------------------------------------------------------------
// Style cells: what one layer contributes, as token references

const CORNERS = [
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
];
const STROKES = [
  'strokeTopWeight',
  'strokeRightWeight',
  'strokeBottomWeight',
  'strokeLeftWeight',
];
const PADDING = ['Top', 'Right', 'Bottom', 'Left'];

// The token families a literal of each cell would come from, for the suggestions attached to an
// unbound value, and what to call a missing family when there is none.
const FAMILIES = {
  gap: ['inset', 'stack'],
  paddingTop: ['inset'],
  paddingRight: ['inset'],
  paddingBottom: ['inset'],
  paddingLeft: ['inset'],
  radius: ['radius'],
  borderWidth: ['border'],
};
// A composed child's extent is an icon size or nothing; a frame's is a control size, which SOLAR
// does not publish.
const INSTANCE_FAMILIES = { width: ['icon'], height: ['icon'] };

/**
 * One geometric value: the token its variable names, or the literal when none is bound. Every
 * binding in `keys` must name the same variable, or the cell cannot be one value.
 */
function bound(layer, keys, literal, names, where) {
  // Absent in Figma and bound to nothing: the layer has no such value at all -- no radius, no
  // stroke -- which is a statement, not a raw zero to report.
  if (literal === undefined && !keys.some((k) => layer.vars?.[k]))
    return { none: true };
  const bindings = [
    ...new Set(keys.map((k) => layer.vars?.[k]).filter(Boolean)),
  ];
  if (bindings.length > 1)
    throw new Error(
      `${where}: binds ${bindings.join(' and ')} to one value; per-side values are not supported`,
    );
  if (bindings.length === 1) {
    const token = names.variable(bindings[0]);
    return token ? { token } : { literal, binding: bindings[0] };
  }
  return { literal };
}

/** A fills or strokes array as one paint. */
function paint(paints, names, where) {
  if (!paints || paints.length === 0) return { none: true };
  if (paints.length > 1)
    throw new Error(
      `${where}: ${paints.length} paints; the recipe carries one per cell`,
    );
  const [p] = paints;
  const ref = /^\{(.+)\}$/.exec(p);
  if (!ref) return { literal: p };
  const token = names.variable(ref[1]);
  return token ? { token } : { literal: p, binding: ref[1] };
}

const style = (name, lookup) => {
  if (!name) return { none: true };
  const token = lookup(name);
  return token ? { token } : { literal: name, binding: name };
};

/** The sizing of each axis, `HUG/FIXED` style, from auto-layout or from the parent's layout. */
function sizingOf(layer) {
  const s = layer.layout?.sizing ?? layer.sizing;
  return s ? s.split('/') : null;
}

function extent(layer, i, names, where) {
  const sizing = sizingOf(layer);
  if (!sizing) return undefined;
  if (sizing[i] !== 'FIXED') return { keyword: sizing[i] };
  return bound(
    layer,
    [i === 0 ? 'width' : 'height'],
    layer.size?.[i],
    names,
    where,
  );
}

/**
 * The style cells of one layer in one variant, each with the class that decides which axes it
 * follows. A composed child (an INSTANCE) contributes only what the parent decides about it --
 * which of its variants, and how big -- because its own padding, colour and radius are its own
 * recipe's, and repeating them here would report every change of child variant as a deviation.
 */
function cellsOf(layer, type, names, where) {
  const cells = {};
  const put = (name, cls, value) => {
    if (value !== undefined) cells[name] = { cls, value };
  };
  put('present', 'paint', { value: !layer.hidden });

  if (type === 'INSTANCE') {
    put(
      'component',
      'geometry',
      layer.main ? { keyword: layer.main } : undefined,
    );
    for (const [k, v] of Object.entries(layer.variant ?? {}))
      put(`variant.${k}`, k === 'size' ? 'geometry' : 'paint', { keyword: v });
    put('width', 'geometry', extent(layer, 0, names, `${where}.width`));
    put('height', 'geometry', extent(layer, 1, names, `${where}.height`));
    return cells;
  }

  if (type === 'TEXT') {
    put('color', 'paint', paint(layer.fills, names, `${where}.color`));
    put('typography', 'geometry', style(layer.textStyle, names.textStyle));
    return cells;
  }

  put('background', 'paint', paint(layer.fills, names, `${where}.background`));
  put(
    'borderColor',
    'paint',
    paint(layer.strokes, names, `${where}.borderColor`),
  );
  put('shadow', 'paint', style(layer.effectStyle, names.effectStyle));
  if (layer.opacity !== undefined)
    put('opacity', 'paint', { literal: layer.opacity });
  put(
    'radius',
    'geometry',
    bound(layer, CORNERS, layer.radius, names, `${where}.radius`),
  );
  put(
    'borderWidth',
    'geometry',
    bound(layer, STROKES, layer.strokeWeight, names, `${where}.borderWidth`),
  );
  if (layer.layout) {
    put('direction', 'geometry', { keyword: layer.layout.dir });
    if (layer.layout.align)
      put('align', 'geometry', { keyword: layer.layout.align });
    put(
      'gap',
      'geometry',
      bound(layer, ['itemSpacing'], layer.layout.gap, names, `${where}.gap`),
    );
    PADDING.forEach((side, i) =>
      put(
        `padding${side}`,
        'geometry',
        bound(
          layer,
          [`padding${side}`],
          layer.layout.pad?.[i] ?? 0,
          names,
          `${where}.padding${side}`,
        ),
      ),
    );
  }
  put('width', 'geometry', extent(layer, 0, names, `${where}.width`));
  put('height', 'geometry', extent(layer, 1, names, `${where}.height`));
  return cells;
}

// ---------------------------------------------------------------------------------------------
// Derivation

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const coordinate = (props, axes) =>
  Object.fromEntries(axes.map((a) => [a, props[a]]));
const keyOf = (props, axes) => axes.map((a) => `${a}=${props[a]}`).join(', ');
const slug = (layer) => (layer === '/' ? 'root' : layer.slice(1));
const describe = (v) =>
  v.token ??
  (v.none
    ? 'none'
    : (v.keyword ??
      (v.value !== undefined ? String(v.value) : String(v.literal))));

/**
 * @param {ReturnType<import('./component-layers.mjs').resolveVariants>} resolved
 * @param {{names: ReturnType<typeof tokenNames>, roles?: Record<string, string>}} options
 */
export function deriveRecipe(
  resolved,
  { names, roles, follows: cellFollows = {} } = {},
) {
  if (!names)
    throw new Error(
      'deriveRecipe needs the token names (tokenNames(contract))',
    );
  const component = resolved.name;
  const axisNames = Object.keys(resolved.axes);
  const axes = Object.fromEntries(
    axisNames.map((a) => [a, { role: roleOf(a, roles), ...resolved.axes[a] }]),
  );
  const byRole = (rs) => axisNames.filter((a) => rs.includes(axes[a].role));
  const defaults = Object.fromEntries(
    axisNames.map((a) => [a, axes[a].default]),
  );
  const byKey = new Map(
    resolved.variants.map((v) => [keyOf(v.props, axisNames), v]),
  );
  const defaultVariant = byKey.get(keyOf(defaults, axisNames));

  // The layer tree, in the default variant's order, plus any layer a variant adds.
  const layers = {};
  for (const v of [defaultVariant, ...resolved.variants])
    for (const [path, layer] of v.layers)
      if (!layers[path])
        layers[path] = {
          parent: v.parents.get(path) ?? null,
          type: layer.type ?? null,
        };

  // Every variant's cells, once.
  const cells = new Map(
    resolved.variants.map((v) => {
      const perLayer = new Map();
      for (const [path, layer] of v.layers)
        if (!layer.unresolved) {
          const layerCells = cellsOf(
            layer,
            layers[path].type,
            names,
            `${component} ${path}`,
          );
          // The icons' colour, from the variant digest (see resolveVariants): one paint for every
          // icon in the variant, or no cell at all where the variant has no icon.
          if (path === '/' && v.iconFills)
            layerCells.iconColor = {
              cls: 'paint',
              value: paint(v.iconFills, names, `${component} /.iconColor`),
            };
          perLayer.set(path, layerCells);
        }
      return [v.name, perLayer];
    }),
  );
  const read = (variant, path, cell) => {
    if (!variant.layers.has(path))
      return cell === 'present' ? { value: false } : undefined;
    return cells.get(variant.name).get(path)?.[cell]?.value;
  };

  const style = {};
  const deviations = [];
  const sparse = new Set();
  const unboundSeen = new Map();

  for (const path of Object.keys(layers)) {
    // Every cell any variant has on this layer, with its class.
    const classes = new Map();
    for (const perLayer of cells.values())
      for (const [cell, { cls }] of Object.entries(perLayer.get(path) ?? {}))
        classes.set(cell, cls);

    const entry = { base: {}, size: {}, appearance: {} };
    const groups = new Map();

    for (const [cell, cls] of classes) {
      // The overlay may say one cell follows other axes than its class does (Button's label
      // type follows prio, state and danger as well as size, by the owner's decision).
      const override = cellFollows[path]?.[cell];
      if (override)
        for (const a of override)
          if (!axes[a])
            throw new Error(
              `${path}.${cell}: follows ${a}, which is not an axis`,
            );
      const follows = override
        ? axisNames.filter((a) => override.includes(a))
        : byRole(FOLLOWS[cls]);
      const others = axisNames.filter((a) => !follows.includes(a));
      // The reference variant for each combination of the followed axes: that combination, with
      // every other axis at its default. A sparse set may not have that variant at all (Avatar
      // has 114 of its 540 combinations); the combination is then read from the first variant
      // Figma does have for it, and the substitution is reported rather than made silently.
      const reference = (props) => {
        const exact = byKey.get(
          keyOf({ ...props, ...coordinate(defaults, others) }, axisNames),
        );
        if (exact) return exact;
        const k = keyOf(props, follows);
        if (!fallbacks.has(k))
          fallbacks.set(
            k,
            resolved.variants.find((w) => keyOf(w.props, follows) === k),
          );
        return fallbacks.get(k);
      };
      const fallbacks = new Map();

      const base = read(defaultVariant, path, cell);
      if (base !== undefined)
        entry.base[cell] = { ...base, from: defaultVariant.name };

      for (const v of resolved.variants) {
        const ref = reference(v.props);
        const expected = read(ref, path, cell);
        if (
          ref !==
          byKey.get(
            keyOf({ ...v.props, ...coordinate(defaults, others) }, axisNames),
          )
        )
          sparse.add(
            `${keyOf(v.props, follows)}|${ref.name}|${follows.join(',')}`,
          );
        if (ref === v) {
          // A reference variant: its value is the recipe entry for its combination, stored only
          // where it differs from the base.
          if (expected === undefined || same(expected, base)) continue;
          const at = { ...expected, from: v.name };
          const sizeAxes = follows.filter((a) => axes[a].role === 'size');
          const appearanceAxes = follows.filter(
            (a) => axes[a].role === 'appearance',
          );
          const stateAxes = follows.filter((a) => axes[a].role === 'state');
          const sizeKey = sizeAxes.map((a) => v.props[a]).join(', ');
          const k = keyOf(v.props, appearanceAxes) || 'default';
          const s = stateAxes.map((a) => v.props[a]).join(', ') || 'default';
          if (sizeAxes.length && (appearanceAxes.length || stateAxes.length))
            // A cell that follows size *and* the paint axes -- only ever by an overlay decision --
            // needs every combination, so it gets its own section rather than two half-answers.
            ((((entry.combined ??= {})[sizeKey] ??= {})[k] ??= {})[s] ??= {})[
              cell
            ] = at;
          else if (sizeAxes.length) (entry.size[sizeKey] ??= {})[cell] = at;
          else ((entry.appearance[k] ??= {})[s] ??= {})[cell] = at;
          continue;
        }
        const found = read(v, path, cell);
        if (
          expected === undefined ||
          found === undefined ||
          same(expected, found)
        )
          continue;
        // Grouped by where the variant sits on the axes this cell should not follow: twenty xl
        // variants without a shadow are one finding about xl, not twenty.
        const where = coordinate(v.props, others);
        const g = `${cell}|${JSON.stringify(where)}`;
        if (!groups.has(g))
          groups.set(g, { cell, where, follows, variants: [] });
        groups.get(g).variants.push({ variant: v.name, expected, found });
      }

      // Values bound to no variable, or to a variable that is not a SOLAR token.
      for (const v of resolved.variants) {
        const value = read(v, path, cell);
        if (!value || value.literal === undefined || cls === undefined)
          continue;
        if (
          typeof value.literal === 'string' &&
          !value.binding &&
          cls === 'paint' &&
          !value.literal.startsWith('#')
        )
          continue;
        const kind = value.binding ? 'unknown-token' : 'unbound';
        const k = `${path}|${cell}|${kind}`;
        if (!unboundSeen.has(k))
          unboundSeen.set(k, {
            kind,
            path,
            cell,
            values: new Set(),
            bindings: new Set(),
          });
        unboundSeen.get(k).values.add(JSON.stringify(value.literal));
        if (value.binding) unboundSeen.get(k).bindings.add(value.binding);
      }
    }

    for (const { cell, where, follows, variants } of groups.values()) {
      const at = Object.entries(where)
        .map(([a, v]) => `${a}=${v}`)
        .join(', ');
      const shown = [
        ...new Set(
          variants.map(
            (v) => `${describe(v.found)} where ${describe(v.expected)}`,
          ),
        ),
      ];
      deviations.push({
        kind: 'axis',
        component,
        layer: path,
        cell,
        where,
        variants,
        token: `component.${component.toLowerCase()}.${slug(path)}.${cell}@${at}`,
        figmaValue: `${variants.length} variant${variants.length === 1 ? '' : 's'} at ${at}: ${shown.slice(0, 3).join('; ')}${shown.length > 3 ? '; …' : ''}`,
        reason:
          `${cell} on ${path} should follow ${follows.join(', ') || 'no axis'} only, but at ${at} it differs from the variant that defines it. ` +
          'The recipe keeps the defining value; this is either a Figma mistake or a real interaction between axes.',
        raise: `Ask SOLAR whether ${component} ${path} ${cell} is meant to change at ${at}.`,
      });
    }

    style[path] = entry;
  }

  for (const { kind, path, cell, values, bindings } of unboundSeen.values()) {
    const literals = [...values].map((v) => JSON.parse(v));
    const numbers = literals.filter((n) => typeof n === 'number');
    const families =
      (layers[path].type === 'INSTANCE'
        ? INSTANCE_FAMILIES[cell]
        : FAMILIES[cell]) ?? [];
    const suggest = [
      ...new Set(numbers.flatMap((n) => names.matching(n, families))),
    ];
    const label =
      cell === 'height' || cell === 'width' ? `control ${cell}` : cell;
    const d = {
      kind,
      component,
      layer: path,
      cell,
      token: `component.${component.toLowerCase()}.${slug(path)}.${cell}#${kind}`,
      figmaValue:
        kind === 'unknown-token'
          ? `bound to ${[...bindings].join(', ')}`
          : `${literals.map(String).join(', ')}, bound to no variable`,
      reason:
        kind === 'unknown-token'
          ? `${cell} on ${path} is bound to a variable that is not a SOLAR token, so the recipe cannot name it.`
          : `${cell} on ${path} is a literal in Figma, bound to no variable, so the recipe carries a raw value where it should name a token.`,
      raise:
        kind === 'unknown-token'
          ? `Ask SOLAR to rebind ${component} ${path} ${cell} to a SOLAR token.`
          : suggest.length
            ? `Ask SOLAR to bind ${component} ${path} ${cell} to ${suggest.join(' or ')}, which has the same value.`
            : `SOLAR has no ${label} token; ask SOLAR for one, or confirm ${literals.join(', ')} is intended.`,
    };
    if (suggest.length) d.suggest = suggest;
    deviations.push(d);
  }

  // One finding per combination read from a substitute, across every cell that needed it.
  for (const entry of [...sparse].sort()) {
    const [combination, from, follows] = entry.split('|');
    const others = axisNames.filter((a) => !follows.split(',').includes(a));
    deviations.push({
      kind: 'sparse',
      component,
      layer: '/',
      cell: '*',
      where: combination,
      token: `component.${component.toLowerCase()}.sparse@${combination}`,
      figmaValue: `no variant with ${combination} and ${others.map((a) => `${a}=${defaults[a]}`).join(', ')}`,
      reason: `${component} has no variant that holds ${others.join(', ')} at the default for ${combination}, so that combination is read from ${from} instead.`,
      raise: `Ask SOLAR whether ${component} should have the variant with ${combination} at the default ${others.join(', ')}.`,
    });
  }

  deviations.sort((a, b) =>
    a.token < b.token ? -1 : a.token > b.token ? 1 : 0,
  );
  return { component, axes, layers, style, deviations };
}
