import { useId, type ReactNode, type SVGProps } from 'react';

/**
 * The shared shell every generated logo delegates to.
 *
 * Hand written, not generated, for the same reason `icon.tsx` is: the generated modules are
 * recipes -- artwork and a name -- and everything that is behaviour rather than data is decided
 * once here. Only `src/generated/**` is machine owned.
 *
 * A logo is not an icon with brand colours. Two things follow, and both are enforced by the
 * types rather than by a comment asking nicely:
 *
 * - **It is never tinted.** `color` and `fill` are omitted from the props, so a caller cannot
 *   recolour a brand mark by accident. Every path carries the colour the SOLAR source drew it
 *   in; nothing here or in anything generated beside it inherits a colour from its surroundings,
 *   which is the exact inverse of the icon contract and is asserted as such.
 * - **It is never squashed.** Marks are not square -- the Biamp wordmark is 36 x 12 -- so `size`
 *   sets the height alone and the width follows from the viewBox's intrinsic ratio. Setting both
 *   the way `Icon` does would distort every non-square mark.
 */

/**
 * The SOLAR `icon.*` steps: 12, 16, 20, 24, 28 and 32px.
 *
 * SOLAR publishes no `logo.*` size scale, so a named step reuses the icon ladder -- a logo sits
 * beside icons in a toolbar or a header and shares their rhythm. Anything outside the ladder is
 * the caller's own CSS length, which is the escape hatch for a lockup that needs its own size.
 */
export type LogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const STEPS: readonly LogoSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export interface LogoPath {
  d: string;
  /** Only ever `'evenodd'`; `'nonzero'` is SVG's default and is left off. */
  fillRule?: 'evenodd';
  /** The brand colour. A logo path always owns one; it never inherits. */
  fill: string;
}

/** One mark's drawing, as vector paths. */
export interface LogoGeometry {
  viewBox: string;
  paths: readonly LogoPath[];
}

/**
 * One mark the vector IR cannot represent, carried as JSX instead.
 *
 * `render` is given a per-instance id namespace: a mark drawn with gradients defines ids and
 * refers to them with `url(#…)`, and a browser resolves such a reference to the first match in
 * the document, so two copies of the same logo on one page would both paint with the first
 * copy's gradients. Every id the generator emits is prefixed with `uid`.
 */
export interface LogoMarkup {
  viewBox: string;
  render: (uid: string) => ReactNode;
}

export type LogoArtwork = LogoGeometry | LogoMarkup;

/**
 * `color` and `fill` are deliberately absent. A tinted brand mark is a brand violation, and the
 * type system should refuse it rather than document it.
 */
export interface LogoProps extends Omit<
  SVGProps<SVGSVGElement>,
  'color' | 'fill' | 'children'
> {
  /** A SOLAR icon.* step, or any CSS length. Sets the height. Defaults to lg (24px). */
  size?: LogoSize | (string & {}) | number;
  /** Accessible name. Without it the logo is hidden from assistive technology. */
  title?: string;
}

export interface LogoShellProps extends LogoProps {
  artwork: LogoArtwork;
}

/**
 * A named step resolves to its CSS variable rather than to px, so the rendered size traces to
 * `icon.*` and follows a token change. Anything else -- a number, `1em`, `100%` -- is the
 * caller's own length and passes through untouched.
 */
const length = (size: LogoSize | (string & {}) | number) =>
  typeof size === 'string' && (STEPS as readonly string[]).includes(size)
    ? `var(--solar-icon-${size})`
    : size;

export function Logo({
  size = 'lg',
  title,
  artwork,
  ...props
}: LogoShellProps) {
  // useId, not a counter: the id has to be stable between the server render and hydration.
  // React spells its ids with punctuation (`«r0»` in 19, `:r0:` in 18), so they are reduced to
  // their alphanumerics before being spliced into an `id` or a `url(#…)` fragment reference;
  // the alphanumeric part is the part that makes them distinct. The leading letter keeps the
  // result a valid identifier for anything that later reads the id as a selector.
  const uid = `l${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const titleId = `${uid}title`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={artwork.viewBox}
      // Height only: the width comes from the viewBox's intrinsic ratio, so a 36 x 12 wordmark
      // stays a wordmark. A caller who wants a fixed box sets width in CSS.
      height={length(size)}
      // A logo with a name is an image; one without is decoration beside a label that already
      // says it, and is taken out of the tree entirely. focusable="false" is for IE/Edge legacy,
      // where an svg is a tab stop by default.
      role={title ? 'img' : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      focusable={title ? undefined : false}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {'render' in artwork
        ? artwork.render(uid)
        : artwork.paths.map((path, i) => (
            // The list is a fixed generated constant, so the index is a stable identity.
            <path
              key={i}
              d={path.d}
              fillRule={path.fillRule}
              fill={path.fill}
            />
          ))}
    </svg>
  );
}
