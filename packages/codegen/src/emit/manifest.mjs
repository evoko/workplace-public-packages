import { canonicalDecoration } from './text-features.mjs';

// Alpha is quantized to 8 bits before rounding, because that is the most a target can carry:
// Dart's Color(0xAARRGGBB) gives it one byte, so CSS's 0.05 and Dart's 0x0D are the same
// colour and must not read as a parity failure.
const alpha8 = (a) => Math.round((Math.round(a * 255) / 255) * 1000) / 1000;
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${alpha8(a)})`;

export const canonical = {
  color(v) {
    if (typeof v === 'string') {
      let m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(v.trim());
      if (m) {
        const n = parseInt(m[1], 16);
        const a = m[2] ? parseInt(m[2], 16) / 255 : 1;
        return rgba((n >> 16) & 255, (n >> 8) & 255, n & 255, a);
      }
      m =
        /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(
          v.trim(),
        );
      if (m) return rgba(+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]);
      // Dart Color(0xAARRGGBB). The wrapper is accepted because that is the literal the
      // Flutter target actually emits; without it the round trip would be fake.
      m = /^(?:Color\()?0x([0-9a-f]{8})\)?$/i.exec(v.trim());
      if (m) {
        const n = parseInt(m[1], 16);
        return rgba(
          (n >> 16) & 255,
          (n >> 8) & 255,
          n & 255,
          ((n >>> 24) & 255) / 255,
        );
      }
    }
    throw new Error(`cannot parse colour: ${JSON.stringify(v)}`);
  },
  dimension(v) {
    const n = typeof v === 'number' ? v : Number(String(v).replace(/px$/, ''));
    if (!Number.isFinite(n))
      throw new Error(`cannot parse dimension: ${JSON.stringify(v)}`);
    return n;
  },
  duration(v) {
    const n = typeof v === 'number' ? v : Number(String(v).replace(/ms$/, ''));
    if (!Number.isFinite(n))
      throw new Error(`cannot parse duration: ${JSON.stringify(v)}`);
    return n;
  },
  number: (v) => Number(v),
  fontFamily: (v) => String(v).replace(/^["']|["']$/g, ''),
  fontWeight: (v) => Number(v),
  // Accepts the spec's numeric array and the literals the targets emit, so a bad conversion
  // in one target is caught by the round trip instead of being echoed back unchecked.
  cubicBezier(v) {
    if (Array.isArray(v)) return v.map(Number);
    const m =
      /^(?:cubic-bezier|Cubic)\(\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*,\s*(-?[\d.]+)\s*\)$/.exec(
        String(v).trim(),
      );
    if (!m) throw new Error(`cannot parse cubic bezier: ${JSON.stringify(v)}`);
    return m.slice(1).map(Number);
  },
  // Composites: normalise the structure, not the target's literal syntax.
  shadow: (layers) =>
    JSON.stringify(
      layers.map((l) => ({
        color: canonical.color(l.color),
        offsetX: canonical.dimension(l.offsetX),
        offsetY: canonical.dimension(l.offsetY),
        blur: canonical.dimension(l.blur),
        spread: canonical.dimension(l.spread),
      })),
    ),
  typography(t) {
    const fontSize = canonical.dimension(t.fontSize);
    return JSON.stringify({
      fontFamily: canonical.fontFamily(t.fontFamily),
      fontWeight: canonical.fontWeight(t.fontWeight),
      fontSize,
      lineHeight: canonical.dimension(t.lineHeight),
      letterSpacing: letterSpacingEm(t.letterSpacing, fontSize),
      textDecoration: canonicalDecoration(t.textDecoration),
    });
  },
};

/**
 * Letter spacing as a fraction of the font size.
 *
 * Figma states it as a percentage of the font size, CSS wants a length, and Flutter wants
 * logical pixels, so the same quantity reaches the targets in three unit systems. Comparing the
 * literals would call `-3%` and `-1.68` different values and, worse, would let a target emit a
 * percentage unnoticed -- which is not a valid CSS letter-spacing at all and is dropped by the
 * browser. A bare number is read as pixels, which is what Flutter emits.
 */
export function letterSpacingEm(value, fontSizePx) {
  const text = String(value).trim();
  const n = parseFloat(text);
  if (!Number.isFinite(n))
    throw new Error(`cannot parse letter spacing: ${JSON.stringify(value)}`);
  const em = text.endsWith('%')
    ? n / 100
    : text.endsWith('em')
      ? n
      : n / fontSizePx;
  return Math.round(em * 1e5) / 1e5;
}

/**
 * Builds a manifest entry: one token as one target emitted it.
 *
 * A manifest is held in memory and handed to the parity suite by each render function; it is
 * not written to disk. It is a claim about the output rather than the output, which is why parity
 * also reads the generated files back (assertion 9 in parity.test.mjs).
 *
 * For scalar types the emitted literal is parsed back, so a bad conversion in one target is
 * caught. For the composite types (shadow, typography) the target's literal syntax differs too
 * much to round-trip, so the emitter passes the structured value it derived from the spec as
 * `canonicalInput`; parity then compares structure, and literal formatting is covered by each
 * emitter's own snapshot test.
 *
 * `modes` maps a mode name (light/dark or desktop/mobile) to the canonical input for that mode,
 * i.e. whatever this target emitted there. The entry then carries the canonicalized value per
 * mode, and parity compares those across targets; without it only one mode would ever be
 * compared and the other axis could drift unnoticed. Omit it for mode-invariant tokens: the
 * entry then has no `modes` key at all.
 */
export function entry(type, emitted, canonicalInput = emitted, modes) {
  const parse = canonical[type];
  if (!parse) throw new Error(`no canonicalizer for type ${type}`);
  const built = { emitted, normalized: parse(canonicalInput) };
  if (modes)
    built.modes = Object.fromEntries(
      Object.entries(modes).map(([mode, value]) => [mode, parse(value)]),
    );
  return built;
}
