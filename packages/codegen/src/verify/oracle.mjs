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
import { renameStates } from '../normalize/overlay.mjs';
import { drawnPaint } from '../normalize/paints.mjs';
import { featuresOf } from '../emit/text-features.mjs';

/** Each IR cell a finding can name, as the oracle properties it covers. */
const PROPERTIES_OF = {
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

  const typography = (style, at) => {
    const doc = names.textStyle(style);
    const token = doc && byName.get(doc);
    if (!token)
      throw new Error(`${where} ${at}: text style ${style} is not a token`);
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
  };

  /** What one layer looks like in one variant, and the Figma values no colour could be read from. */
  function measure(layer, path) {
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
    const box = () => {
      if ((sizeX === 'FIXED' || placedBox) && layer.size)
        out.width = layer.size[0];
      if ((sizeY === 'FIXED' || placedBox) && layer.size)
        out.height = layer.size[1];
      if (placedBox) {
        out.x = layer.position[0];
        out.y = layer.position[1];
      }
    };

    if (layer.type === 'TEXT') {
      paint('color', layer.fills);
      if (layer.textStyle)
        Object.assign(out, typography(layer.textStyle, path));
      // A text placed by position: where it starts; its size follows from its font.
      if (placedBox) {
        out.x = layer.position[0];
        out.y = layer.position[1];
      }
      return { out, unresolved };
    }
    if (layer.type === 'INSTANCE') {
      // A composed child draws itself; the parent decides only its size, which variant it is,
      // and, for an icon, the colour it inherits.
      if (layer.main?.startsWith('Icon/')) {
        const fills = [...new Set(layer.iconFills ?? [])];
        if (fills.length === 1) paint('color', fills);
      } else if (layer.main) out.component = layer.main;
      if (layer.variant) out.variant = { ...layer.variant };
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
    // Sides of their own where the weights were recorded; `mixed` where they were not, which the
    // recipe's `unrecorded` finding excuses until a sync records them.
    if (layer.strokes?.length && layer.strokeWeights)
      ['Top', 'Right', 'Bottom', 'Left'].forEach((side, i) => {
        out[`border${side}Width`] = layer.strokeWeights[i];
      });
    else
      out.borderWidth = layer.strokes?.length ? (layer.strokeWeight ?? 0) : 0;
    // A shape (Spinner's ring) has no box to round; a frame or rectangle does.
    if (
      !['ELLIPSE', 'VECTOR', 'LINE', 'STAR', 'POLYGON'].includes(layer.type)
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
        gap: layer.layout.gap ?? 0,
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
  const resolved = renameStates(
    foldStateAxes(resolveVariants(set)).resolved,
    overlay,
  );
  const defaults = Object.fromEntries(
    Object.entries(spec.api).map(([p, d]) => [p, d.default]),
  );
  const derived = overlay?.derive ?? {};
  const reach = (props) => {
    const api = { ...defaults };
    let state = 'default';
    let content;
    for (const [axis, value] of Object.entries(props)) {
      // An axis the overlay derives from content is reached by filling those slots.
      if (derived[axis]) {
        content = [
          ...(derived[axis].when.find((w) => w.value === value).given ?? []),
        ];
        continue;
      }
      if (axis === 'state') {
        if (PLATFORM_STATES.has(value)) state = value;
        else api[value] = true;
        continue;
      }
      const prop = rename[axis] ?? axis;
      if (!(prop in spec.api))
        throw new Error(`${where}: axis ${axis} is not a prop of the IR`);
      const v = renameValue(axis, value);
      api[prop] = spec.api[prop].type === 'boolean' ? v === 'true' : v;
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
    // fill): the code draws the decision, so Figma's value is excused wherever it appears.
    if (d.kind === 'unbound' && d.decision?.rule === 'set')
      excuses.push({ variant: null, layer, properties, why });
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
  // box is the control's, by an overlay decision, in every variant.
  for (const [layer, rule] of Object.entries(overlay?.controlDraws ?? {}))
    excuses.push({
      variant: null,
      layer,
      properties: ['x', 'y', 'width', 'height'],
      why: {
        finding: `component.${spec.component.toLowerCase()}.${layer}#controlDraws`,
        decision: 'controlDraws',
        reason: rule.reason,
      },
    });

  const variants = resolved.variants.map((v) => {
    const layers = {};
    const excused = [];
    for (const [path, layer] of v.layers) {
      const name = nameOf.get(path);
      if (!name) throw new Error(`${where}: no IR name for layer ${path}`);
      const { out, unresolved } = measure(layer, path);
      layers[name] = out;
      for (const e of excuses) {
        if (e.layer !== name || (e.variant !== null && e.variant !== v.name))
          continue;
        for (const property of e.properties) {
          if (!(property in out)) continue;
          if (e.unresolvedOnly && !(property in unresolved)) continue;
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
    return {
      figma: v.name,
      ...reach(v.props),
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
    slots: Object.fromEntries(
      Object.entries(spec.slots)
        .filter(([, s]) => s.props.visible)
        .map(([, s]) => [nameOf.get(s.layer), s.props.visible]),
    ),
    variants,
  };
}
