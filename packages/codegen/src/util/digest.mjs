import { createHash } from 'node:crypto';

export const sha256 = (data) => createHash('sha256').update(data).digest('hex');

/**
 * A stable fingerprint of one icon variant's geometry.
 *
 * The React, SVG and Flutter targets all draw the same `d` strings, and the parity suite has to
 * prove that without repeating 358 KB of path data per target: equal digests mean equal
 * geometry. `fillRule` is spelled out rather than left implicit, so a target that drops the
 * attribute is a different digest.
 */
export const geometryDigest = (paths) =>
  sha256(
    JSON.stringify(
      paths.map((p) => ({ d: p.d, fillRule: p.fillRule ?? 'nonzero' })),
    ),
  );

/**
 * The same for a logo, with the fill included.
 *
 * Deliberately not `geometryDigest`: an icon has no colour of its own, so two icons with the same
 * outline are the same drawing, but a logo's colours *are* the drawing -- the two Biamp
 * wordmarks differ in nothing else.
 */
export const logoDigest = (paths) =>
  sha256(
    JSON.stringify(
      paths.map((p) => ({
        d: p.d,
        fillRule: p.fillRule ?? 'nonzero',
        fill: p.fill,
      })),
    ),
  );
