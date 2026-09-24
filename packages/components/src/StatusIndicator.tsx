/**
 * SOLAR StatusIndicator.
 *
 * Scaffolded once by `npm run solar:scaffold StatusIndicator` from spec/components/statusindicator.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, `solarStatusIndicatorStyle` and `solarStatusIndicatorCompose` in
 * `@bwp-web/styles/mui`: each type's disc or triangle, its mark, their colours and where they sit.
 *
 * Bespoke: a drawn mark. Each type is its own drawing, so this walks Figma's layer tree and draws a
 * layer as a glyph (an SVG of Figma's outline) where the recipe has one and as a box where it does
 * not. Decorative unless given a `label`, which it then announces as an image. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type CSSProperties, type ReactNode } from 'react';
import {
  solarStatusIndicatorCompose,
  solarStatusIndicatorStyle,
  type SolarStatusIndicatorParts,
  type SolarStatusIndicatorProps,
} from '@bwp-web/styles/mui';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: ['innerPath', 'union', 'container', 'frame3'],
  frame3: ['frame3InnerPath'],
  container: ['containerInnerPath', 'icon', 'containerUnion'],
};

export interface StatusIndicatorProps
  extends
    SolarStatusIndicatorProps,
    // MUI types BoxProps' ref for any element; the component's own, a <span>, comes from forwardRef.
    Omit<BoxProps, keyof SolarStatusIndicatorProps | 'children' | 'ref'> {
  /**
   * What the status means, for a screen reader. Without it the mark is decorative and hidden from
   * assistive technology, so say the status in words beside it.
   */
  label?: string;
}

type Glyph = { width: number; height: number; fill: Path[]; stroke: Path[] };
type Path = { d: string; evenOdd: boolean };

/** One layer, drawn as Figma draws it in this variant, or nothing where it is hidden. */
function layer(
  name: string,
  parts: Record<string, SolarStatusIndicatorParts>,
): ReactNode {
  const p = parts[name] ?? {};
  if (p.present === false) return null;
  const place: CSSProperties | undefined =
    typeof p.x === 'number'
      ? {
          position: 'absolute',
          left: p.x,
          top: typeof p.y === 'number' ? p.y : 0,
        }
      : undefined;
  const glyph =
    typeof p.glyph === 'object' && p.glyph !== null ? (p.glyph as Glyph) : null;
  if (glyph)
    return (
      <svg
        key={name}
        className={`SolarStatusIndicator-${name} SolarStatusIndicator-glyph`}
        viewBox={`0 0 ${glyph.width} ${glyph.height}`}
        style={place}
        aria-hidden
      >
        {glyph.fill.map((path, i) => (
          <path
            key={`f${i}`}
            className="SolarGlyph-fill"
            d={path.d}
            fillRule={path.evenOdd ? 'evenodd' : 'nonzero'}
          />
        ))}
        {glyph.stroke.map((path, i) => (
          <path
            key={`s${i}`}
            className="SolarGlyph-stroke"
            d={path.d}
            fillRule={path.evenOdd ? 'evenodd' : 'nonzero'}
          />
        ))}
      </svg>
    );
  return (
    <span
      key={name}
      className={`SolarStatusIndicator-${name} SolarStatusIndicator-box`}
      style={place}
    >
      {(TREE[name] ?? []).map((child) => layer(child, parts))}
    </span>
  );
}

export const StatusIndicator = forwardRef<
  HTMLSpanElement,
  StatusIndicatorProps
>(function StatusIndicator({ type, size, label, sx, ...rest }, ref) {
  const parts = solarStatusIndicatorCompose({ type, size });
  return (
    <Box
      component="span"
      ref={ref}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
      sx={[
        solarStatusIndicatorStyle({ type, size }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {(TREE.root ?? []).map((child) => layer(child, parts))}
    </Box>
  );
});
