import { canonical } from './manifest.mjs';

/**
 * SOLAR swaps the Desktop type scale for the Mobile one "at the tablet boundary"
 * (docs/solar/06-typography.md) without naming a pixel. `viewport.sm` is that boundary, so the
 * Mobile mode is everything below it. Deriving the query here rather than writing 767.98px into
 * each target keeps the one responsive number in the generated code traceable to a token, and
 * keeps CSS and MUI switching at the same width by construction.
 */
export const MOBILE_BOUNDARY_TOKEN = 'viewport.sm';

/** 0.02px below the boundary: the conventional step down, and below any device pixel ratio. */
const STEP = 0.02;

/** @param {Map<string, {value: unknown}>} index token name to token */
export function mobileMediaQuery(index) {
  const token = index.get(MOBILE_BOUNDARY_TOKEN);
  if (!token)
    throw new Error(
      `cannot derive the mobile breakpoint: ${MOBILE_BOUNDARY_TOKEN} is missing from the spec`,
    );
  const px = canonical.dimension(token.value);
  return `(max-width: ${Math.round((px - STEP) * 100) / 100}px)`;
}
