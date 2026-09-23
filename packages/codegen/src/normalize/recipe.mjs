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

import { checkPathData } from './svg.mjs';

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

// Which roles each class of cell follows. A drawn shape follows every axis: a glyph legitimately
// changes with size (Spinner's ring), appearance (StatusIndicator's type) and state (Checkbox's
// tick appears when checked), so no axis is a finding for it.
const FOLLOWS = {
  geometry: ['size'],
  paint: ['appearance', 'state'],
  shape: ['size', 'appearance', 'state'],
};

/**
 * A layer's drawn shape as a glyph: its box, and the outlines Figma records, the fill's and the
 * stroke's, each a filled region (a stroke's geometry is the stroke's own outline, painted in the
 * stroke colour). Paths reach every target byte for byte, so each is checked against the
 * commands every target draws.
 */
function glyphOf(layer, where) {
  if (!layer.geometry && !layer.strokeGeometry) return undefined;
  const paths = (list, part) =>
    (list ?? []).map((g) => {
      checkPathData(g.path, { file: `${where} ${part}` });
      return { d: g.path, evenOdd: g.windingRule === 'EVENODD' };
    });
  const [width, height] = layer.size ?? [0, 0];
  return {
    glyph: {
      width,
      height,
      fill: paths(layer.geometry, 'fill'),
      stroke: paths(layer.strokeGeometry, 'stroke'),
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Style cells: what one layer contributes, as token references

const CORNERS = [
  'topLeftRadius',
  'topRightRadius',
  'bottomLeftRadius',
  'bottomRightRadius',
];
// A uniform stroke is bound as `strokeWeight` (Spinner's ring), per side as the other four
// (Button); both may be present, naming one variable.
const STROKES = [
  'strokeWeight',
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
  borderTopWidth: ['border'],
  borderRightWidth: ['border'],
  borderBottomWidth: ['border'],
  borderLeftWidth: ['border'],
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
  let bindings = [...new Set(keys.map((k) => layer.vars?.[k]).filter(Boolean))];
  // Bindings that disagree are settled by the value Figma draws, where exactly one names it: Slider's
  // Handle binds its stroke to border/strong and, stale, each side to border/default, and draws 2.
  if (bindings.length > 1 && typeof literal === 'number') {
    const drawn = bindings.filter(
      (b) => names.value(names.variable(b)) === literal,
    );
    if (drawn.length === 1) bindings = drawn;
  }
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
  // A paint bound to a variable that is not a colour (Spinner's indicator, bound to the spacing
  // variable border/strong) cannot be drawn from that token: it is reported, never painted. A
  // primitive colour is still a colour (Avatar's palette); using one is a different finding.
  if (token && !token.startsWith('color.'))
    return { literal: p, binding: ref[1], misbound: true };
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
    // An icon's colour, recorded on the icon itself (fetch-rest.mjs). One icon in two colours is a
    // two-tone mark the recipe does not model, so it is left to the caller to report.
    const distinct = [...new Set(layer.iconFills ?? [])];
    if (distinct.length === 1)
      put('color', 'paint', paint(distinct, names, `${where}.color`));
    return cells;
  }

  if (type === 'TEXT') {
    put('color', 'paint', paint(layer.fills, names, `${where}.color`));
    put('typography', 'geometry', style(layer.textStyle, names.textStyle));
    return cells;
  }

  // An image fill is content -- the picture a slot shows (Dialog's header image) -- not design: the
  // layer records that it carries one, and the paint beside it is the background, drawn where the
  // picture does not cover.
  put('glyph', 'shape', glyphOf(layer, `${where}.glyph`));
  const content = (layer.fills ?? []).filter((f) => f !== 'IMAGE');
  if (content.length !== (layer.fills ?? []).length)
    put('image', 'paint', { value: true });
  put(
    'background',
    'paint',
    paint(layer.fills && content, names, `${where}.background`),
  );
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
  // No stroke paint is no border, whatever weight Figma keeps: it keeps a stroke's weight, and its
  // variable binding, after the paint is removed (Icon Button's primary loses its border on hover
  // and at md, still bound to border.default). The oracle reads it the same way.
  if (!layer.strokes?.length) put('borderWidth', 'geometry', { none: true });
  else if (layer.strokeWeight === 'mixed')
    // Sides of their own (Button Group's divider is a top stroke only): one cell per side, each
    // read from its weight and its own binding. Data fetched before the weights were recorded has
    // the bindings alone; a side is then drawn where it is bound, marked `inferred`, and reported.
    PADDING.forEach((side, i) => {
      const weight = layer.strokeWeights?.[i];
      const value =
        weight === 0
          ? { none: true }
          : bound(
              layer,
              [`stroke${side}Weight`],
              weight,
              names,
              `${where}.border${side}Width`,
            );
      put(
        `border${side}Width`,
        'geometry',
        layer.strokeWeights ? value : { ...value, inferred: true },
      );
    });
  else
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
  const allAppearance = byRole(['appearance']);
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

  // Every variant's cells, once, and per icon layer the variants whose colour cannot be one cell.
  const unattributed = new Map();
  // Layers whose sides differ, in variants fetched before the per-side weights were recorded.
  const unrecorded = new Map();
  const unattribute = (path, variant) =>
    unattributed.set(path, (unattributed.get(path) ?? new Set()).add(variant));
  const cells = new Map(
    resolved.variants.map((v) => {
      const perLayer = new Map();
      for (const [path, layer] of v.layers) {
        perLayer.set(
          path,
          cellsOf(layer, layers[path].type, names, `${component} ${path}`),
        );
        // An icon's colour is read from the icon itself (cellsOf). An icon drawn in more than one
        // colour is a two-tone mark one cell cannot hold: no cell, and a finding.
        if (new Set(layer.iconFills ?? []).size > 1) unattribute(path, v.name);
        if (layer.strokes?.length && layer.strokeWeight === 'mixed')
          if (!layer.strokeWeights)
            unrecorded.set(
              path,
              (unrecorded.get(path) ?? new Set()).add(v.name),
            );
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
      //
      // A composed child the reference variant hides records no variant at all: Icon Button's
      // Spinner is drawn only while loading, and Figma keeps no size on the hidden instance. Which
      // child it is, is then read from the first variant of the combination that draws it. Only
      // for what the parent decides about a child, never for a style cell, whose absence can mean
      // something.
      const composes = cell === 'component' || cell.startsWith('variant.');
      const exactOf = (props) =>
        byKey.get(
          keyOf({ ...props, ...coordinate(defaults, others) }, axisNames),
        );
      const reference = (props) => {
        const exact = exactOf(props);
        const k = keyOf(props, follows);
        if (
          exact &&
          composes &&
          read(exact, path, cell) === undefined &&
          read(exact, path, 'present')?.value === false
        )
          return (
            resolved.variants.find(
              (w) =>
                keyOf(w.props, follows) === k &&
                read(w, path, cell) !== undefined,
            ) ?? exact
          );
        if (exact) return exact;
        if (!fallbacks.has(k))
          fallbacks.set(
            k,
            resolved.variants.find((w) => keyOf(w.props, follows) === k),
          );
        return fallbacks.get(k);
      };
      const fallbacks = new Map();

      const sizeAxes = follows.filter((a) => axes[a].role === 'size');
      const appearanceAxes = follows.filter(
        (a) => axes[a].role === 'appearance',
      );
      const stateAxes = follows.filter((a) => axes[a].role === 'state');
      const sizeKeyOf = (v) => sizeAxes.map((a) => v.props[a]).join(', ');
      const stateOf = (v) =>
        stateAxes.map((a) => v.props[a]).join(', ') || 'default';
      // Every appearance key an entry holds for. The emitters look an entry up by the full
      // combination of the appearance axes, so a cell that follows only some of them (Icon
      // Button's radius, by shape and not by prio) is written under each combination of the rest,
      // not under a partial key no lookup would ever build.
      const keysOf = (v) =>
        !allAppearance.length || (!appearanceAxes.length && !stateAxes.length)
          ? ['default']
          : allAppearance
              .filter((a) => !appearanceAxes.includes(a))
              .reduce(
                (combos, a) =>
                  combos.flatMap((c) =>
                    axes[a].options.map((o) => ({ ...c, [a]: o })),
                  ),
                [v.props],
              )
              .map((c) => keyOf(c, allAppearance));
      const combinedCell =
        sizeAxes.length && (appearanceAxes.length || stateAxes.length);
      const placeAt = (v, k, at) => {
        const sizeKey = sizeKeyOf(v);
        const s = stateOf(v);
        if (combinedCell)
          // A cell that follows size *and* the paint axes -- only ever by an overlay decision --
          // needs every combination, so it gets its own section rather than two half-answers.
          ((((entry.combined ??= {})[sizeKey] ??= {})[k] ??= {})[s] ??= {})[
            cell
          ] = at;
        else if (sizeAxes.length) (entry.size[sizeKey] ??= {})[cell] = at;
        else ((entry.appearance[k] ??= {})[s] ??= {})[cell] = at;
      };
      /** What both emitters find for a combination, in their order: a state, then rest, then base. */
      const lookup = (v, k) => {
        const z = sizeKeyOf(v);
        const s = stateOf(v);
        const c = entry.combined?.[z]?.[k];
        const a = entry.appearance[k];
        const held =
          s === 'default' ? undefined : (c?.[s]?.[cell] ?? a?.[s]?.[cell]);
        return (
          held ??
          c?.default?.[cell] ??
          a?.default?.[cell] ??
          entry.size[z]?.[cell] ??
          entry.base[cell]
        );
      };
      const equalToBase = [];

      const base = read(defaultVariant, path, cell);
      if (base !== undefined)
        entry.base[cell] = { ...base, from: defaultVariant.name };

      for (const v of resolved.variants) {
        const ref = reference(v.props);
        const expected = read(ref, path, cell);
        // A missing variant is reported; a hidden child read where it is drawn is not missing.
        if (!exactOf(v.props))
          sparse.add(
            `${keyOf(v.props, follows)}|${ref.name}|${follows.join(',')}`,
          );
        if (ref === v) {
          // A reference variant: its value is the recipe entry for its combination, stored only
          // where it differs from the base -- or, below, from what the lookup would find in its
          // place.
          if (expected === undefined) continue;
          const at = { ...expected, from: v.name };
          if (same(expected, base)) equalToBase.push({ v, at });
          else for (const k of keysOf(v)) placeAt(v, k, at);
          continue;
        }
        const found = read(v, path, cell);
        if (
          expected === undefined ||
          found === undefined ||
          same(expected, found)
        )
          continue;
        // Grouped by where the variant sits on the axes this cell should not follow: twenty lg
        // variants without a shadow are one finding about lg, not twenty.
        const where = coordinate(v.props, others);
        const g = `${cell}|${JSON.stringify(where)}`;
        if (!groups.has(g))
          groups.set(g, { cell, where, follows, variants: [] });
        groups.get(g).variants.push({ variant: v.name, expected, found });
      }

      // A value equal to the base is left out only where the lookup would still find the base: lg
      // secondary's disabled border is the base's 1px, but the lookup reaches lg's borderless
      // resting entry first, so it is written after all. Resting values first, as they are what a
      // state falls back to.
      const bare = (e) => e && JSON.stringify({ ...e, from: 0, reason: 0 });
      for (const { v, at } of [...equalToBase].sort(
        (x, y) =>
          (stateOf(x.v) === 'default' ? 0 : 1) -
          (stateOf(y.v) === 'default' ? 0 : 1),
      ))
        for (const k of keysOf(v))
          if (bare(lookup(v, k)) !== bare(at)) placeAt(v, k, at);

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
        const kind = value.misbound
          ? 'misbound'
          : value.binding
            ? 'unknown-token'
            : 'unbound';
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
        kind === 'unbound'
          ? `${literals.map(String).join(', ')}, bound to no variable`
          : `bound to ${[...bindings].join(', ')}`,
      reason:
        kind === 'misbound'
          ? `${cell} on ${path} is a colour bound to ${[...bindings].join(', ')}, which is not a colour variable, so no colour can be read from it.`
          : kind === 'unknown-token'
            ? `${cell} on ${path} is bound to a variable that is not a SOLAR token, so the recipe cannot name it.`
            : `${cell} on ${path} is a literal in Figma, bound to no variable, so the recipe carries a raw value where it should name a token.`,
      raise:
        kind === 'misbound'
          ? `Ask SOLAR to rebind ${component} ${path} ${cell} to a colour token.`
          : kind === 'unknown-token'
            ? `Ask SOLAR to rebind ${component} ${path} ${cell} to a SOLAR token.`
            : suggest.length
              ? `Ask SOLAR to bind ${component} ${path} ${cell} to ${suggest.join(' or ')}, which has the same value.`
              : `SOLAR has no ${label} token; ask SOLAR for one, or confirm ${literals.join(', ')} is intended.`,
    };
    if (suggest.length) d.suggest = suggest;
    deviations.push(d);
  }

  for (const [path, variants] of [...unattributed].sort(([a], [b]) =>
    a.localeCompare(b),
  ))
    deviations.push({
      kind: 'unattributed',
      component,
      layer: path,
      cell: 'color',
      variants: [...variants].map((variant) => ({ variant })),
      token: `component.${component.toLowerCase()}.${slug(path)}.color#unattributed`,
      figmaValue: `the icon is drawn in more than one colour in ${variants.size} variant${variants.size === 1 ? '' : 's'}`,
      reason: `${path} is drawn in more than one colour, and an icon's colour is one cell, so the recipe carries no colour for it. A SOLAR icon inherits one colour; a two-tone one is a logo, or a mark SOLAR should redraw.`,
      raise: `Ask SOLAR whether ${path} is meant to be two-tone; if so it is not an icon.`,
    });

  for (const [path, variants] of [...unrecorded].sort(([a], [b]) =>
    a.localeCompare(b),
  ))
    deviations.push({
      kind: 'unrecorded',
      component,
      layer: path,
      cell: 'borderWidth',
      variants: [...variants].map((variant) => ({ variant })),
      token: `component.${component.toLowerCase()}.${slug(path)}.borderWidth#unrecorded`,
      figmaValue: `sides of different weights, not recorded, in ${variants.size} variant${variants.size === 1 ? '' : 's'}`,
      reason: `${path}'s sides differ in weight, and the data was fetched before the fetcher recorded each side's weight, so a side is drawn where it is bound to a variable and nowhere else. Not a Figma defect.`,
      raise:
        'Nothing for SOLAR: re-run `npm run solar:sync` to record the weights.',
    });

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
