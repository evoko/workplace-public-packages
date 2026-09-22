import { useId, type SVGProps } from 'react';

/**
 * The shared shell every generated icon delegates to.
 *
 * Hand written, not generated: the generated modules are recipes -- geometry and a name -- and
 * everything that is behaviour rather than data lives here, so accessibility is decided once
 * instead of 341 times. Only `src/generated/**` is machine owned.
 */

/** The SOLAR `icon.*` steps: 12, 16, 20, 24, 28 and 32px. */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const STEPS: readonly IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export interface IconPath {
  d: string;
  /** Only ever `'evenodd'`; `'nonzero'` is SVG's default and is left off. */
  fillRule?: 'evenodd';
}

/** One variant's drawing. The viewBox travels with it, so a variant off the 24 grid keeps it. */
export interface IconGeometry {
  viewBox: string;
  paths: readonly IconPath[];
}

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** A SOLAR icon.* step, or any CSS length. Defaults to lg (24px). */
  size?: IconSize | (string & {}) | number;
  variant?: 'outline' | 'solid';
  /** Accessible name. Without it the icon is hidden from assistive technology. */
  title?: string;
}

export interface IconShellProps extends IconProps {
  outline: IconGeometry;
  solid: IconGeometry;
}

/**
 * A named step resolves to its CSS variable rather than to px, so the rendered size traces to
 * `icon.*` and follows a token change. Anything else -- a number, `1em`, `100%` -- is the
 * caller's own length and passes through untouched.
 */
const length = (size: IconSize | (string & {}) | number) =>
  typeof size === 'string' && (STEPS as readonly string[]).includes(size)
    ? `var(--solar-icon-${size})`
    : size;

export function Icon({
  size = 'lg',
  variant = 'outline',
  title,
  outline,
  solid,
  ...props
}: IconShellProps) {
  const geometry = variant === 'solid' ? solid : outline;
  const side = length(size);
  // useId, not a counter: the id has to be stable between the server render and hydration.
  const titleId = `${useId()}title`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={geometry.viewBox}
      width={side}
      height={side}
      // An icon with a name is an image; one without is decoration beside a label that already
      // says it, and is taken out of the tree entirely. focusable="false" is for IE/Edge legacy,
      // where an svg is a tab stop by default.
      role={title ? 'img' : undefined}
      aria-labelledby={title ? titleId : undefined}
      aria-hidden={title ? undefined : true}
      focusable={title ? undefined : false}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      {geometry.paths.map((path, i) => (
        // Every path inherits its colour, so `color: var(--solar-color-icon-primary)` on any
        // ancestor tints the icon. The SOLAR source draws them all in color/neutral/900.
        // The list is a fixed generated constant, so the index is a stable identity.
        <path key={i} d={path.d} fillRule={path.fillRule} fill="currentColor" />
      ))}
    </svg>
  );
}
