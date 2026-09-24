/**
 * SOLAR PaginationNav, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * The previous or next arrow of a Pagination: MUI's ButtonBase on the web, drawn and pressable in
 * Flutter, its chevron drawn by the shared layer helpers, pointing the way it goes. Its own 24 × 24
 * box is its target, as a PaginationItem's.
 */

import {
  drawnFlutter,
  drawnResets,
  iconsOf,
  reactIcon,
  treeOf,
} from '../shells/drawn.mjs';

const P = 'SolarPaginationNav';

const requireLayers = (spec) => {
  if (spec.api.direction?.values?.join() !== 'previous,next')
    throw new Error('PaginationNav: its direction is not previous or next');
  if (spec.api.disabled?.type !== 'boolean')
    throw new Error('PaginationNav: the IR has no disabled prop');
};

export default {
  name: 'PaginationNav',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('PaginationNav', {
      display: 'flex',
      [`& .${P}-icon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      // Mirrored by the layout's direction, not by the prop, as its description says.
      [`&:dir(rtl) .${P}-icon`]: { transform: 'scaleX(-1)' },
    }),
    // Hovered, pressed and focused as the pointer and the keyboard reach it (MUI marks the
    // keyboard's focus-visible); disabled as MUI marks it.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR PaginationNav.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarPaginationNavStyle\` and \`solarPaginationNavCompose\` in
 * \`@bwp-web/styles/mui\`: the arrow's fill and ring by state, and its chevron's ink.
 *
 * The previous or next arrow of a Pagination: MUI's ButtonBase, named "Previous page" or "Next page"
 * (\`aria-label\` overrides), disabled at the first and the last page rather than hidden, as its
 * description says, and still announced (\`aria-disabled\`). Its chevron points the way it goes,
 * mirrored in a right-to-left layout. Its own 24 × 24 box is its target. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
${[...new Set(Object.values(iconsOf(spec)[0].byAxis.values).map((x) => x.react))].sort().length ? `import { ${[...new Set(Object.values(iconsOf(spec)[0].byAxis.values).map((x) => x.react))].sort().join(', ')} } from '@bwp-web/assets';` : ''}
import { forwardRef } from 'react';
import {
  solarPaginationNavCompose,
  solarPaginationNavStyle,
  type SolarPaginationNavProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface PaginationNavProps
  extends SolarPaginationNavProps,
    Omit<ButtonBaseProps, keyof SolarPaginationNavProps | 'children' | 'ref'> {
  /** Where it goes: it is a link. */
  href?: string;
}

export const PaginationNav = forwardRef<HTMLButtonElement, PaginationNavProps>(
  function PaginationNav({ direction = 'previous', disabled = false, sx, ...rest }, ref) {
    const look = { direction, disabled };
    const parts = solarPaginationNavCompose(look);
    return (
      <ButtonBase
        ref={ref}
        aria-label={direction === 'next' ? 'Next page' : 'Previous page'}
        {...rest}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        disableRipple
        sx={[solarPaginationNavStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE,
          parts,
          icons: { icon: ${reactIcon(iconsOf(spec)[0], spec)} },
        })}
      </ButtonBase>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the arrow’s fill and ring by state, and its chevron’s ink, read cell by cell',
        about: `Bespoke: the previous or next arrow of a SolarPagination, drawn from Figma's layer tree with [SolarLayers], pressable and focusable, named for a screen reader by MaterialLocalizations ("Previous page", "Next page"), disabled at the first and the last page rather than hidden. Its chevron points the way it goes, mirrored in a right-to-left layout. Its own 24 × 24 box is its target.`,
        params: `required this.onPressed,`,
        fields: `/// Called when it is chosen; null disables it.
final VoidCallback? onPressed;`,
        control: {
          onPressed: 'disabled ? null : onPressed',
          semantics: '',
          target: false,
        },
        wrap: `Semantics(
      label: direction == SolarPaginationNavDirection.next
          ? MaterialLocalizations.of(context).nextPageTooltip
          : MaterialLocalizations.of(context).previousPageTooltip,
      child: Transform.flip(
        flipX: Directionality.of(context) == TextDirection.rtl,
        child: mark,
      ),
    )`,
      });
    },
  },
};
