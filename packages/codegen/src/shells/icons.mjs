/**
 * The SOLAR icons a component's shells draw of their own, from its IR: each layer that draws an
 * icon (RowExpand's chevrons, `Icon/ChevronRight`), with the icon it draws, as its React component
 * in `@bwp-web/assets` and its `SolarIcons` constant. The shells are written by hand, and the
 * component-parity test holds each to these: an icon Figma swaps fails it until the shell draws
 * the new one.
 */

import { camel, pascal } from '../util/naming.mjs';
import { dartEnumValue } from '../emit/flutter.mjs';

/** Every entry of one layer's style, whatever its section. */
const entriesOf = (style) => [
  style.base,
  ...Object.values(style.size ?? {}),
  ...Object.values(style.appearance ?? {}).flatMap(Object.values),
  ...Object.values(style.combined ?? {}).flatMap((c) =>
    Object.values(c).flatMap(Object.values),
  ),
];

/**
 * The layers that draw a SOLAR icon of their own (RowExpand's chevrons, `Icon/ChevronRight`), with
 * the icon each draws: its React component in `@bwp-web/assets` and its `SolarIcons` constant. A
 * layer whose icon follows one axis (PaginationNav's chevron, by its direction) has `byAxis`, the
 * icon for each of the axis's values, which the drawn helpers choose by the prop; any other layer
 * that draws two icons is refused.
 */
export function iconsOf(spec) {
  const out = [];
  for (const [layer, def] of Object.entries(spec.layers)) {
    // A slot is the caller's to fill (Link's icons), not an icon the shell draws.
    if (def.type !== 'INSTANCE' || spec.slots[layer]) continue;
    const entries = entriesOf(spec.style[layer] ?? { base: {} });
    const names = new Set(
      entries
        .map((e) => e?.component?.keyword)
        .filter((k) => k?.startsWith('Icon/'))
        .map((k) => k.slice('Icon/'.length)),
    );
    if (names.size === 0) continue;
    const solid = entries.some((e) => e?.['variant.solid']?.keyword === 'true');
    const of = (name) => ({
      react: `Icon${pascal(name)}`,
      dart: `SolarIcons.${camel(name)}${solid ? 'Solid' : 'Outline'}`,
    });
    const base = spec.style[layer]?.base?.component?.keyword?.slice(
      'Icon/'.length,
    );
    const byAxis = names.size > 1 ? iconAxisOf(spec, layer, base) : null;
    out.push({
      layer,
      ...of(byAxis ? base : [...names][0]),
      solid,
      ...(byAxis
        ? {
            byAxis: {
              axis: byAxis.axis,
              values: Object.fromEntries(
                Object.entries(byAxis.values).map(([v, name]) => [v, of(name)]),
              ),
            },
          }
        : {}),
    });
  }
  return out;
}

/**
 * The axis a layer's icon follows, and its icon at each value: the icon its appearance entries at
 * rest name, keyed by one axis alone (`direction=next`), the base's elsewhere. Refused where the
 * icon changes otherwise (by size, or state, or two axes together).
 */
function iconAxisOf(spec, layer, base) {
  const fail = () => {
    throw new Error(
      `${spec.component} ${layer}: one layer draws icons by more than one axis`,
    );
  };
  const style = spec.style[layer];
  if (
    Object.values(style.size ?? {}).some((e) => e.component) ||
    style.combined
  )
    fail();
  let axis = null;
  const values = {};
  for (const [key, states] of Object.entries(style.appearance ?? {})) {
    for (const [state, entry] of Object.entries(states))
      if (entry.component && state !== 'default') fail();
    const icon = states.default?.component?.keyword;
    if (!icon) continue;
    const pairs = key.split(', ').map((p) => p.split('='));
    if (pairs.length !== 1 || (axis && axis !== pairs[0][0])) fail();
    axis = pairs[0][0];
    values[pairs[0][1]] = icon.slice('Icon/'.length);
  }
  if (!axis || !spec.api[axis]?.values) fail();
  for (const v of spec.api[axis].values) values[v] ??= base;
  return { axis, values };
}

/** The React expression for an icon layer's icon: its component, or the one of its axis's value. */
export function reactIcon(i, spec) {
  const el = (x) => `<${x.react}${i.solid ? ' variant="solid"' : ''} />`;
  if (!i.byAxis) return el(i);
  const { axis, values } = i.byAxis;
  const map = Object.entries(values)
    .map(([v, x]) => `${JSON.stringify(v)}: ${el(x)}`)
    .join(', ');
  return `({ ${map} } as const)[${axis} ?? ${JSON.stringify(spec.api[axis].default)}]`;
}

/** The Dart expression for an icon layer's icon: its constant, or the one of its axis's value. */
export function dartIcon(i, spec) {
  if (!i.byAxis) return i.dart;
  const { axis, values } = i.byAxis;
  const type = `Solar${pascal(spec.component)}${pascal(axis)}`;
  return `switch (${axis}) {${Object.entries(values)
    .map(([v, x]) => ` ${type}.${dartEnumValue(v)} => ${x.dart},`)
    .join('')} }`;
}
