/**
 * The overlay's `tint`: an axis a component takes from another, whose values recolour it, where
 * Figma draws it in one of them alone. Agenda Row's dot and All-Day Bar's stripe and fill are drawn
 * in category 06 only; the owner decided (2026-09-26) they take Event Chip's `category`, so an
 * event is the same colour everywhere.
 *
 * Each value's colour family is read from the other component's IR, from the cell the rule names
 * (Event Chip's `stripe.background`: red is `color.data.category.01`, blue `…06`), never written
 * by hand. Every token of the default's family in this IR is the tinted one: the API gains the
 * axis at the default Figma draws, the recipe keeps Figma's tokens, and the emitters swap the
 * family where the caller picks another value. The oracle checks the default, which is Figma's.
 *
 * Applied once every IR is built (the stage), since the other component may come later.
 */

/** A token's family, its path without its last segment: `color.data.category.06`. */
const familyOf = (token) => token.slice(0, token.lastIndexOf('.'));

/** Every token entry in an IR style tree. */
function* tokenEntries(node) {
  if (!node || typeof node !== 'object') return;
  for (const value of Object.values(node)) {
    if (value && typeof value === 'object') {
      if (typeof value.token === 'string') yield value;
      yield* tokenEntries(value);
    }
  }
}

/**
 * @param {object} spec the component's IR, changed in place
 * @param {Record<string, object>} specs every IR, by component
 * @param {{ has: (name: string) => boolean }} names the SOLAR token names
 * @param {object | null} overlay the component's overlay
 */
export function applyTints(spec, specs, names, overlay) {
  for (const [axis, rule] of Object.entries(overlay?.tint ?? {})) {
    const where = `spec/overlay (${spec.component}) tint.${axis}`;
    const source = specs[rule.from];
    if (!source) throw new Error(`${where}: no component ${rule.from}`);
    const values = source.api[axis]?.values;
    if (!values) throw new Error(`${where}: ${rule.from} has no axis ${axis}`);
    if (!values.includes(rule.default))
      throw new Error(`${where}: ${rule.default} is none of ${rule.from}'s`);
    if (spec.api[axis])
      throw new Error(`${where}: the API already has ${axis}`);
    const [layer, cell] = rule.cell.split('.');
    const style = source.style[layer];
    if (!style || !cell)
      throw new Error(`${where}: ${rule.from} has no cell ${rule.cell}`);
    // A value's token: the look that names it, or the base where it is the default.
    const tokenOf = (value) => {
      for (const [key, looks] of Object.entries(style.appearance ?? {}))
        if (key.split(', ').includes(`${axis}=${value}`)) {
          const token = looks.default?.[cell]?.token;
          if (token) return token;
        }
      return value === source.api[axis].default
        ? style.base[cell]?.token
        : undefined;
    };
    const families = Object.fromEntries(
      values.map((value) => {
        const token = tokenOf(value);
        if (!token)
          throw new Error(
            `${where}: ${rule.from} draws no ${rule.cell} for ${value}`,
          );
        return [value, familyOf(token)];
      }),
    );
    const from = families[rule.default];
    const tinted = [...tokenEntries(spec.style)].filter((e) =>
      e.token.startsWith(`${from}.`),
    );
    if (!tinted.length)
      throw new Error(`${where}: no cell here is drawn in ${from}`);
    for (const e of tinted)
      for (const family of Object.values(families)) {
        const token = `${family}${e.token.slice(from.length)}`;
        if (!names.has(token))
          throw new Error(`${where}: ${token} is not a SOLAR token`);
      }
    spec.api[axis] = { values: [...values], default: rule.default };
    (spec.tints ??= {})[axis] = { from, values: families, reason: rule.reason };
  }
  return spec;
}
