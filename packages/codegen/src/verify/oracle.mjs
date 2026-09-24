/**
 * The oracle: what Figma says each variant of a component looks like (design spec §7).
 *
 * Built from the resolved Figma layers alone -- the variant resolver, never the recipe or an
 * emitter -- so it can catch a recipe that is wrong, not only one that was emitted wrongly. For
 * every variant and every layer it lists the values a renderer can be measured against, resolved
 * to Light and Desktop through the token spec: colours as hex, lengths in pixels, a text style as
 * its parts. Numbers are what Figma draws (the layer's own value, not its variable's), colours the
 * variable a paint is bound to, since that is all Figma records of a bound paint.
 *
 * Where the code is known to differ from Figma, the entry stays Figma's and is marked `excused`,
 * naming why: a finding still open (the report shows the gap, the check does not fail on it), an
 * overlay decision, or a Figma value no colour can be read from. The visual checks compare every
 * entry and skip only excused ones, so a difference nobody decided on fails.
 */

import { flattenSpec } from '../spec.mjs';
import {
  foldStateAxes,
  resolveVariants,
} from '../normalize/component-layers.mjs';
import { PLATFORM_STATES } from '../normalize/components.mjs';
import { renameStates, sameLayers } from '../normalize/overlay.mjs';
import { drawnPaint } from '../normalize/paints.mjs';
import { farEdgesOf, placementOf } from '../normalize/placement.mjs';
import { featuresOf } from '../emit/text-features.mjs';

/** Each IR cell a finding can name, as the oracle properties it covers. */
export const PROPERTIES_OF = {
  background: ['background'],
  borderColor: ['borderColor'],
  borderWidth: ['borderWidth'],
  borderTopWidth: ['borderTopWidth'],
  borderRightWidth: ['borderRightWidth'],
  borderBottomWidth: ['borderBottomWidth'],
  borderLeftWidth: ['borderLeftWidth'],
  radius: ['radius'],
  radiusTopLeft: ['radiusTopLeft'],
  radiusTopRight: ['radiusTopRight'],
  radiusBottomRight: ['radiusBottomRight'],
  radiusBottomLeft: ['radiusBottomLeft'],
  shadow: ['shadow'],
  color: ['color'],
  gap: ['gap'],
  paddingTop: ['paddingTop'],
  paddingRight: ['paddingRight'],
  paddingBottom: ['paddingBottom'],
  paddingLeft: ['paddingLeft'],
  width: ['width'],
  height: ['height'],
  x: ['x'],
  y: ['y'],
  right: ['right'],
  bottom: ['bottom'],
  opacity: ['opacity'],
  typography: [
    'fontFamily',
    'fontWeight',
    'fontSize',
    'lineHeight',
    'letterSpacing',
    'textDecoration',
  ],
};

/** `#abc`, `#aabbcc`, `#aabbccdd`, `rgba(…)` or a `#aabbcc a=0.5` literal as lowercase `#rrggbb[aa]`. */
export function hex(value) {
  const v = String(value).trim().toLowerCase();
  const alpha = (a) =>
    a >= 1
      ? ''
      : Math.round(a * 255)
          .toString(16)
          .padStart(2, '0');
  let m = /^#([0-9a-f]{3})$/.exec(v);
  if (m) return `#${[...m[1]].map((c) => c + c).join('')}`;
  m = /^#([0-9a-f]{6})(?:\s+a=([\d.]+))?$/.exec(v);
  if (m) return `#${m[1]}${m[2] === undefined ? '' : alpha(Number(m[2]))}`;
  m = /^#([0-9a-f]{8})$/.exec(v);
  if (m) return m[1].endsWith('ff') ? `#${m[1].slice(0, 6)}` : `#${m[1]}`;
  m =
    /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)$/.exec(
      v,
    );
  if (m) {
    const [r, g, b] = m
      .slice(1, 4)
      .map((n) => Number(n).toString(16).padStart(2, '0'));
    return `#${r}${g}${b}${m[4] === undefined ? '' : alpha(Number(m[4]))}`;
  }
  throw new Error(`not a colour: ${value}`);
}

const px = (v) => {
  const n = typeof v === 'number' ? v : Number(String(v).replace(/px$/, ''));
  if (!Number.isFinite(n)) throw new Error(`not a length: ${v}`);
  return n;
};

/** A text style token's values, as the oracle spells them: its parts, Desktop, in pixels. */
export function textValuesOf(token) {
  const { fontFamily, fontWeight, fontSize, lineHeight, letterSpacing } =
    token.value;
  const desktop = token.modes?.desktop ?? {};
  const size = px(desktop.fontSize ?? fontSize);
  // Figma spells tracking as a percentage of the size or in pixels; the renderer reports pixels.
  const tracking = String(letterSpacing ?? '0');
  const spacing = tracking.endsWith('%')
    ? (Number(tracking.slice(0, -1)) / 100) * size
    : px(tracking);
  return {
    fontFamily,
    fontWeight,
    fontSize: size,
    lineHeight: px(desktop.lineHeight ?? lineHeight),
    letterSpacing: Math.round(spacing * 1000) / 1000,
    // As CSS spells it (Figma writes UNDERLINE).
    textDecoration: String(
      featuresOf(token.ext).textDecoration ?? 'none',
    ).toLowerCase(),
  };
}

/**
 * What an IR cell's token draws of one oracle property, resolved to Light and Desktop as the oracle
 * spells it, or undefined where it names none (a keyword, a literal, a token of another type): what
 * a `set` rule decides, and what `solar:explain` compares with Figma.
 *
 * @param {Map<string, object>} byName the token spec's tokens by name (flattenSpec)
 */
export function cellValue(byName, cell, property) {
  if (cell.none)
    return {
      background: 'transparent',
      borderColor: 'transparent',
      color: 'transparent',
      shadow: 'none',
      borderWidth: 0,
      radius: 0,
    }[property];
  const token = cell.token && byName.get(cell.token);
  if (!token) return undefined;
  if (token.type === 'color') return hex(token.modes?.light ?? token.value);
  if (token.type === 'shadow') return token.modes?.light ?? token.value;
  if (token.type === 'dimension') return px(token.value);
  // A text style (PIN Input's sm placeholder, set to body.md.medium): each of its properties.
  if (token.type === 'typography') return textValuesOf(token)[property];
  return undefined;
}

/** Whether a `set` rule's IR entry reaches a Figma variant: the base every one, a size its size,
 * an appearance its combination (at rest, in every state; in a state, that state alone), and the
 * two together both. */
function setReaches(props, section, keys, holdsOwn = () => false) {
  // `default` is the one key of a component with no appearance axis (Link), which every variant has.
  const holds = (key) =>
    key === 'default' ||
    key.split(', ').every((kv) => {
      const [axis, value] = kv.split('=');
      return String(props[axis]) === value;
    });
  // A resting entry reaches the other states too, but for one whose own entry holds the cell (a
  // disabled Checkbox's edge): that state draws its own, not the decision.
  const inState = (state) => {
    const at = String(props.state ?? 'default');
    return at === state || (state === 'default' && !holdsOwn(at));
  };
  if (section === 'base') return true;
  if (section === 'size') return String(props.size) === keys[0];
  if (section === 'appearance') return holds(keys[0]) && inState(keys[1]);
  return String(props.size) === keys[0] && holds(keys[1]) && inState(keys[2]);
}

const same = (a, b) =>
  a !== undefined &&
  b !== undefined &&
  (typeof a === 'number' || typeof b === 'number'
    ? Number(a) === Number(b)
    : String(a) === String(b));

/**
 * @param {object} set the raw component set
 * @param {object} spec the component's IR, for its layer names, API and states only
 * @param {object[]} deviations the component's findings after the overlay
 * @param {{tokens: object, names: object, overlay: object | null, fileVersion: string}} context
 */
export function buildOracle(
  set,
  spec,
  deviations,
  { tokens, names, overlay, fileVersion },
) {
  const byName = new Map(flattenSpec(tokens).map((t) => [t.name, t]));
  const nameOf = new Map(
    Object.entries(spec.layers).map(([n, l]) => [l.path, n]),
  );
  const where = spec.component;

  /** A paint list as one colour, `transparent`, or null when no colour can be read from it. */
  const colour = (paints, at) => {
    // An image fill is the slot's content; the colour beside it is the background.
    paints = paints?.filter((p) => p !== 'IMAGE');
    if (!paints || paints.length === 0) return { value: 'transparent' };
    // What Figma draws of a stack: the top paint, where it covers the rest.
    const { paint } = drawnPaint(paints, names, `${where} ${at}`);
    const ref = /^\{(.+)\}$/.exec(paint);
    if (!ref) return { value: hex(paint) };
    const doc = names.variable(ref[1]);
    const token = doc && byName.get(doc);
    if (!token || token.type !== 'color')
      return { value: null, unresolved: ref[1] };
    return { value: hex(token.modes?.light ?? token.value) };
  };

  const shadow = (style) => {
    if (!style) return 'none';
    const doc = names.effectStyle(style);
    const token = doc && byName.get(doc);
    if (!token)
      throw new Error(`${where}: effect style ${style} is not a token`);
    return token.modes?.light ?? token.value;
  };

  const textValues = textValuesOf;
  const decidedValue = (rule, property) => cellValue(byName, rule, property);

  /**
   * What a layout's gap draws: its own value, or a grid's, the variable its rows and columns are
   * bound to, since Figma records no number for a grid's gap (its plain gap is 0 and not drawn).
   */
  const gapOf = (layer) => {
    if (layer.layout.dir !== 'GRID') return layer.layout.gap ?? 0;
    const bound = layer.vars?.gridRowGap ?? layer.vars?.gridColumnGap;
    const token = bound && byName.get(names.variable(bound));
    return token ? px(token.value) : (layer.layout.gap ?? 0);
  };

  const typography = (style, at) => {
    const doc = names.textStyle(style);
    const token = doc && byName.get(doc);
    if (!token)
      throw new Error(`${where} ${at}: text style ${style} is not a token`);
    return textValues(token);
  };

  /** What one layer looks like in one variant, and the Figma values no colour could be read from. */
  function measure(layer, path, parent, far) {
    const out = {};
    const unresolved = {};
    const paint = (prop, paints) => {
      const c = colour(paints, `${path}.${prop}`);
      out[prop] = c.value;
      if (c.unresolved) unresolved[prop] = c.unresolved;
    };
    if (layer.hidden) out.hidden = true;
    const [sizeX, sizeY] = (layer.layout?.sizing ?? layer.sizing ?? '').split(
      '/',
    );
    // A layer its parent's auto layout does not place is where Figma put it, at the size it is
    // drawn: both are measured, from the parent's edge, for a box and a glyph alike (the `!` in
    // StatusIndicator's triangle), since a shell that misplaced one would draw it wrong.
    const placedBox = Boolean(layer.position);
    // A root no auto layout sizes (Checkbox's) is fixed at the size it is drawn, as the recipe
    // draws it.
    const drawnAt = placedBox || (path === '/' && !sizeX);
    const box = () => {
      if ((sizeX === 'FIXED' || drawnAt) && layer.size)
        out.width = layer.size[0];
      if ((sizeY === 'FIXED' || drawnAt) && layer.size)
        out.height = layer.size[1];
      // From the edge it is pinned to, which is Figma's reading of where it is (placementOf).
      if (placedBox) Object.assign(out, placementOf(layer, parent, far));
    };

    if (layer.type === 'TEXT') {
      paint('color', layer.fills);
      if (layer.textStyle)
        Object.assign(out, typography(layer.textStyle, path));
      // A text placed by position: where it starts; its size follows from its font.
      if (placedBox) Object.assign(out, placementOf(layer, parent, far));
      return { out, unresolved };
    }
    if (layer.type === 'INSTANCE') {
      // A composed child draws itself; the parent decides only its size, which variant it is,
      // and, for an icon, the colour it inherits; and its fill and edge where the parent draws
      // them its own way (the overlay's restyles: Toast's Tag).
      if (layer.main?.startsWith('Icon/')) {
        const fills = [...new Set(layer.iconFills ?? [])];
        if (fills.length === 1) paint('color', fills);
      } else if (layer.main)
        // The component in code where Figma's name is two components' (the overlay's composes).
        out.component = overlay?.composes?.[layer.main]?.name ?? layer.main;
      if (layer.variant) out.variant = { ...layer.variant };
      const restyled = overlay?.restyles?.[nameOf.get(path)]?.cells ?? [];
      if (restyled.includes('background')) paint('background', layer.fills);
      if (restyled.includes('borderColor')) paint('borderColor', layer.strokes);
      box();
      return { out, unresolved };
    }
    if (layer.fills?.includes('IMAGE')) out.image = true;
    // The shape drawn, as Figma's path data, compared as data by the visual checks.
    if (layer.geometry || layer.strokeGeometry)
      out.glyph = {
        fill: (layer.geometry ?? []).map((g) => g.path),
        stroke: (layer.strokeGeometry ?? []).map((g) => g.path),
      };
    paint('background', layer.fills);
    paint('borderColor', layer.strokes);
    // A layer drawn translucent (Node End's halo), as the recipe rounds it.
    if (layer.opacity !== undefined)
      out.opacity = Math.round(layer.opacity * 1e4) / 1e4;
    // Sides of their own where the weights were recorded; `mixed` where they were not, which the
    // recipe's `unrecorded` finding excuses until a sync records them.
    if (layer.strokes?.length && layer.strokeWeights)
      ['Top', 'Right', 'Bottom', 'Left'].forEach((side, i) => {
        out[`border${side}Width`] = layer.strokeWeights[i];
      });
    else
      out.borderWidth = layer.strokes?.length ? (layer.strokeWeight ?? 0) : 0;
    // An ellipse with no outline of its own is drawn as a box (Node End's dot), and it is round:
    // its corner is half its size, which a renderer's pill radius draws, since no corner can be
    // rounder than half its box (compare.mjs).
    if (
      layer.type === 'ELLIPSE' &&
      !layer.geometry &&
      !layer.strokeGeometry &&
      layer.size
    )
      out.radius = Math.min(...layer.size) / 2;
    // A shape (Spinner's ring, a boolean operation) has no box to round; a frame or rectangle does.
    else if (
      ![
        'ELLIPSE',
        'VECTOR',
        'LINE',
        'STAR',
        'POLYGON',
        'BOOLEAN_OPERATION',
      ].includes(layer.type)
    ) {
      // Corners of their own where they differ, clockwise from the top left as Figma records them.
      const r = layer.radius ?? 0;
      if (Array.isArray(r) && new Set(r).size > 1)
        ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].forEach(
          (corner, i) => {
            out[`radius${corner}`] = r[i];
          },
        );
      else out.radius = Array.isArray(r) ? r[0] : r;
    }
    if (path === '/') out.shadow = shadow(layer.effectStyle);
    if (layer.layout) {
      const [top, right, bottom, left] = layer.layout.pad ?? [0, 0, 0, 0];
      Object.assign(out, {
        paddingTop: top,
        paddingRight: right,
        paddingBottom: bottom,
        paddingLeft: left,
        gap: gapOf(layer),
      });
    }
    box();
    return { out, unresolved };
  }

  // The API a variant is reached through: Figma's axes, renamed as the overlay says, with the
  // state axis split into a platform state and boolean props, as the IR's own API is.
  const rename = Object.fromEntries(
    Object.entries(overlay?.rename ?? {}).map(([axis, r]) => [axis, r.to]),
  );
  const renameValue = (axis, value) =>
    overlay?.rename?.[axis]?.values?.[value] ?? value;
  const resolved = sameLayers(
    renameStates(foldStateAxes(resolveVariants(set)).resolved, overlay),
    overlay,
  );
  const defaults = Object.fromEntries(
    Object.entries(spec.api).map(([p, d]) => [p, d.default]),
  );
  const derived = overlay?.derive ?? {};
  const reach = (props) => {
    // A colour the caller gives has no default: it is given where Figma draws one (callers).
    const api = Object.fromEntries(
      Object.entries(defaults).filter(([, d]) => d !== null),
    );
    let state = 'default';
    let content;
    for (const [axis, value] of Object.entries(props)) {
      // An axis of samples is no prop: its sample is the caller's value, read below (callers).
      if (overlay?.samples?.[axis]) continue;
      // An axis the overlay derives from content is reached by filling those slots, and setting
      // the props it names (Tag's onClose).
      if (derived[axis]) {
        const w = derived[axis].when.find((x) => x.value === value);
        content = [...(w.given ?? []), ...(w.props ?? [])];
        continue;
      }
      if (axis === 'state') {
        const parts = overlay?.states?.compound?.[value]?.of;
        // A compound state is reached by holding its parts: its prop set, its platform state
        // reached (DatePicker's error-focused: in error, focused).
        if (parts)
          for (const part of parts)
            if (PLATFORM_STATES.has(part)) state = part;
            else api[part] = true;
        else if (PLATFORM_STATES.has(value)) state = value;
        else if (!derived[value]) api[value] = true;
        continue;
      }
      const prop = rename[axis] ?? axis;
      if (!(prop in spec.api))
        throw new Error(`${where}: axis ${axis} is not a prop of the IR`);
      const v = renameValue(axis, value);
      api[prop] = spec.api[prop].type === 'boolean' ? v === 'true' : v;
    }
    // A state value derived from content (Text Input's `filled`, from its value): reached by the
    // content that makes it true in the variant that draws it, and by the content that makes it
    // false in every other. It is no prop.
    for (const [value, d] of Object.entries(derived)) {
      if (d.when.some((w) => typeof w.value !== 'boolean')) continue;
      const on = props.state === value;
      const w = d.when.find((x) => x.value === on);
      content = [...(content ?? []), ...(w.given ?? []), ...(w.props ?? [])];
      delete api[value];
    }
    return { props: api, state, ...(content ? { content } : {}) };
  };

  // Findings that excuse a difference, by variant and property, from the findings alone.
  const excuses = [];
  for (const d of deviations) {
    const layer = nameOf.get(d.layer);
    const properties = PROPERTIES_OF[d.cell];
    if (!layer || !properties) continue;
    const why = d.decision
      ? {
          finding: d.token,
          decision: d.decision.rule,
          reason: d.decision.reason,
        }
      : { finding: d.token, decision: null, reason: d.reason };
    if (d.kind === 'axis' || d.kind === 'unrecorded')
      for (const { variant } of d.variants)
        excuses.push({ variant, layer, properties, why });
    // A raw value an overlay `set` replaced (Button Group's hidden button, fixed at 138, set to
    // fill): the code draws the decision, so Figma's value is excused wherever it appears. Where
    // several rules set the cell (Text Input's width, the base's and sm's), each variant names the
    // rule that reaches it, the most specific first; the finding's own decision is the last rule
    // applied, which may be another size's.
    if (d.kind === 'unbound' && d.decision?.rule === 'set') {
      const depth = { base: 0, size: 1, appearance: 2, combined: 3 };
      const rules = Object.entries(overlay?.set ?? {})
        .map(([at, rule]) => ({ parts: at.split('.'), rule }))
        .filter(
          ({ parts: [l, section], parts }) =>
            l === layer &&
            section in depth &&
            parts.slice(2 + depth[section]).join('.') === d.cell,
        )
        .sort((a, b) => depth[b.parts[1]] - depth[a.parts[1]]);
      for (const { parts, rule } of rules)
        excuses.push({
          variant: null,
          layer,
          properties,
          reaches: (props) =>
            setReaches(props, parts[1], parts.slice(2, 2 + depth[parts[1]])),
          why: { ...why, reason: rule.reason },
        });
      excuses.push({ variant: null, layer, properties, why });
    }
    // A value no colour can be read from, wherever it appears.
    if (d.kind === 'misbound' || d.kind === 'unknown-token')
      excuses.push({
        variant: null,
        layer,
        properties,
        why,
        unresolvedOnly: true,
      });
  }

  // A layer the base control draws itself (Spinner's ring, CircularProgress's SVG circle): its
  // box, and the roundness of its shape, are the control's, by an overlay decision, in every
  // variant.
  // A rule that names its cells (a slider's handle: where it sits) excuses those alone.
  for (const [layer, rule] of Object.entries(overlay?.controlDraws ?? {}))
    excuses.push({
      variant: null,
      layer,
      properties: rule.cells ?? [
        'x',
        'y',
        'right',
        'bottom',
        'width',
        'height',
        'radius',
      ],
      why: {
        finding: `component.${spec.component.toLowerCase()}.${layer}#controlDraws`,
        decision: 'controlDraws',
        reason: rule.reason,
      },
    });

  // A cell an overlay `set` changed where Figma's value was readable (a shadow the overlay removes,
  // drawn): the code draws the decision, so Figma's value is excused in the variants that draw
  // what the decision replaced (the IR keeps it beside the decision), where it differs from the
  // decision. A value no colour can be read from is its finding's to excuse, above.
  for (const [at, rule] of Object.entries(overlay?.set ?? {})) {
    const parts = at.split('.');
    const [layer, section] = parts;
    const depth = { base: 0, size: 1, appearance: 2, combined: 3 }[section];
    const keys = parts.slice(2, 2 + depth);
    const cell = parts.slice(2 + depth).join('.');
    const properties = PROPERTIES_OF[cell];
    if (!properties || !spec.layers[layer]) continue;
    let node = spec.style?.[layer]?.[section];
    for (const k of keys) node = node?.[k];
    const replaced = node?.[cell]?.replaced;
    if (!replaced) continue;
    excuses.push({
      variant: null,
      layer,
      properties,
      reaches: (props) =>
        setReaches(props, section, keys, (state) => {
          let own = spec.style?.[layer]?.[section];
          for (const k of keys.slice(0, -1)) own = own?.[k];
          return own?.[state]?.[cell] !== undefined;
        }),
      drew: (property, figma) =>
        (replaced.literal !== undefined
          ? same(replaced.literal, figma)
          : same(decidedValue(replaced, property), figma)) &&
        !same(decidedValue(rule, property), figma),
      why: {
        finding: `component.${spec.component.toLowerCase()}.${layer}.${cell}#set`,
        decision: 'set',
        reason: rule.reason,
      },
    });
  }

  // A composed child's variant an overlay `set` decides (Toast's Tag: `status`, where Figma names
  // a type Tag no longer has): the child is checked in the variant decided, and Figma's is kept
  // beside it, as `figmaVariant`.
  const variantSets = Object.entries(overlay?.set ?? {}).flatMap(
    ([at, rule]) => {
      const parts = at.split('.');
      const [layer, section] = parts;
      const depth = { base: 0, size: 1, appearance: 2, combined: 3 }[section];
      const cell = parts.slice(2 + depth).join('.');
      if (!cell.startsWith('variant.') || rule.keyword === undefined) return [];
      const keys = parts.slice(2, 2 + depth);
      return [
        {
          layer,
          axis: cell.slice('variant.'.length),
          keyword: rule.keyword,
          reaches: (props) => setReaches(props, section, keys),
        },
      ];
    },
  );

  const variants = resolved.variants.map((v) => {
    const layers = {};
    const excused = [];
    for (const [path, layer] of v.layers) {
      const name = nameOf.get(path);
      if (!name) throw new Error(`${where}: no IR name for layer ${path}`);
      const { out, unresolved } = measure(
        layer,
        path,
        v.layers.get(v.parents.get(path)),
        farEdgesOf(resolved.variants, path),
      );
      for (const d of variantSets)
        if (d.layer === name && out.variant && d.reaches(v.props)) {
          out.figmaVariant ??= { ...out.variant };
          out.variant[d.axis] = d.keyword;
        }
      layers[name] = out;
      for (const e of excuses) {
        if (e.layer !== name || (e.variant !== null && e.variant !== v.name))
          continue;
        if (e.reaches && !e.reaches(v.props)) continue;
        for (const property of e.properties) {
          if (!(property in out)) continue;
          if (e.unresolvedOnly && !(property in unresolved)) continue;
          if (e.drew && !e.drew(property, out[property])) continue;
          // One excuse per property: two findings may cover it (a set value that also differs by
          // axis), and the first found names it.
          if (excused.some((x) => x.layer === name && x.property === property))
            continue;
          excused.push({
            layer: name,
            property,
            figma: out[property],
            ...e.why,
          });
        }
      }
    }
    // A cell whose value is the caller's (Avatar's background): the colour Figma draws there is
    // the caller's in this variant, so the variant is reached with it, and the cell compared. A
    // cell derived from it (the initials' ink) is the shell's rule, not Figma's sample: excused.
    const reached = reach(v.props);
    const callers = Object.entries(spec.callers ?? {});
    for (const [at, c] of callers) {
      if (!c.prop) continue;
      const [layer, cell] = at.split('.');
      const value = layers[layer]?.[PROPERTIES_OF[cell][0]];
      if (value && value !== 'transparent') reached.props[c.prop] = value;
    }
    for (const [at, c] of callers) {
      if (!c.from || reached.props[c.from] === undefined) continue;
      const [layer, cell] = at.split('.');
      for (const property of PROPERTIES_OF[cell])
        if (
          layers[layer] &&
          property in layers[layer] &&
          !excused.some((x) => x.layer === layer && x.property === property)
        )
          excused.push({
            layer,
            property,
            figma: layers[layer][property],
            finding: `component.${spec.component.toLowerCase()}.${layer}.${cell}#caller`,
            decision: 'caller',
            reason: c.reason,
          });
    }
    return {
      figma: v.name,
      ...reached,
      layers,
      ...(excused.length ? { excused } : {}),
    };
  });

  return {
    $description: `What Figma draws for every variant of SOLAR ${spec.component}, resolved to Light and Desktop: the oracle the visual checks measure both platforms against. Generated by @bwp-web/codegen from docs/solar-web, independently of the recipe. Do not edit.`,
    component: spec.component,
    fileVersion,
    mode: { color: 'light', type: 'desktop' },
    // The layers a prop shows or hides (a slot), by the prop: a slot hidden at rest is drawn when
    // its prop says so, where any other layer Figma hides in a variant must not be drawn there.
    slots: Object.fromEntries([
      ...Object.entries(spec.slots)
        .filter(([, s]) => s.props.visible)
        .map(([, s]) => [nameOf.get(s.layer), s.props.visible]),
      // A layer Figma always hides, drawn where the caller fills a slot (an overlay's shownBy):
      // shown by the slot, as by a prop, and so is the slot's own layer.
      ...Object.entries(overlay?.shownBy ?? {}).flatMap(([layer, rule]) => [
        [layer, `filled ${rule.slot}`],
        [nameOf.get(spec.slots[rule.slot].layer), `filled ${rule.slot}`],
      ]),
    ]),
    variants,
  };
}

/**
 * Each IR layer's own name in Figma: its path's last part, below its parent's (`Icon/None`), without
 * the `#2` the IR tells two of one name apart by, which Figma's names do not carry.
 */
const nodeNames = (spec) =>
  Object.fromEntries(
    Object.entries(spec.layers).map(([name, l]) => {
      const parent = l.parent === null ? null : spec.layers[l.parent].path;
      const node =
        parent === null
          ? l.path
          : l.path.slice(parent === '/' ? 1 : parent.length + 1);
      return [name, node.replace(/#\d+$/, '')];
    }),
  );

/**
 * What an instance of another component hides of it, in each variant (a Select's rows: the
 * Dropdown Item's checkbox, second line and icon), from the names Figma records hidden in the
 * variant (`hidden` on the raw variant), as `hides` on the composed child's entry, for the checks
 * to expect undrawn. A second pass once every component's IR is built, since a child's layers are
 * its own IR's; its names alone, never its recipe. A name the component's own layers also carry is
 * the component's (Segmented Control's `Label`), not a child's.
 *
 * @param {object} oracle the component's, changed in place
 * @param {object} spec the component's IR
 * @param {object} set the raw component set
 * @param {Record<string, object>} specs every IR, by component name
 */
export function hideInComposed(oracle, spec, set, specs) {
  const own = new Set(Object.values(nodeNames(spec)));
  // The fetcher records a variant's hidden names only where they differ from the default's.
  const byDefault =
    set.variants.find((v) => v.variant === set.defaultVariant)?.hidden ?? [];
  const hiddenIn = new Map(
    set.variants.map((v) => [v.variant, v.hidden ?? byDefault]),
  );
  for (const variant of oracle.variants) {
    const hidden = new Set(
      (hiddenIn.get(variant.figma) ?? []).filter((n) => !own.has(n)),
    );
    if (!hidden.size) continue;
    for (const entry of Object.values(variant.layers)) {
      const child = entry.component && specs[entry.component];
      if (!child) continue;
      const hides = Object.entries(nodeNames(child))
        .filter(([name, node]) => name !== 'root' && hidden.has(node))
        .map(([name]) => name)
        .sort();
      if (hides.length) entry.hides = hides;
    }
  }
}
