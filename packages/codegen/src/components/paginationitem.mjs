/**
 * SOLAR PaginationItem, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One page of a Pagination: MUI's ButtonBase on the web, drawn and pressable in Flutter, its number
 * drawn by the shared layer helpers. Its own 24 × 24 box is its target (owner decision 2026-09-24:
 * the items sit 4px apart, where 44 × 44 targets would cover each other).
 */

import { drawnFlutter, drawnResets, treeOf } from '../shells/drawn.mjs';

const P = 'SolarPaginationItem';

const requireLayers = (spec) => {
  if (spec.layers.page?.type !== 'TEXT')
    throw new Error('PaginationItem: the IR has no page text');
  for (const prop of ['selected', 'disabled'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`PaginationItem: the IR has no ${prop} prop`);
};

export default {
  name: 'PaginationItem',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('PaginationItem', { display: 'flex' }),
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
  shells: {
    // The page's number is the React child, and Flutter's `page`, an int.
    slots: { page: { react: 'children', flutter: 'page' } },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR PaginationItem.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarPaginationItemStyle\` and \`solarPaginationItemCompose\` in
 * \`@bwp-web/styles/mui\`: the page's fill and ring by state, and its number's ink.
 *
 * One page of a Pagination: MUI's ButtonBase, a button (a link where it has an \`href\`) that goes to
 * its page, its number its children, named "Page 3" for a screen reader (\`aria-label\`
 * overrides). The \`selected\` one is the current page (\`aria-current="page"\`). Its own 24 × 24 box
 * is its target: the pages sit 4px apart. Use it inside a Pagination. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { forwardRef, type ReactNode } from 'react';
import {
  solarPaginationItemCompose,
  solarPaginationItemStyle,
  type SolarPaginationItemProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface PaginationItemProps
  extends SolarPaginationItemProps,
    Omit<ButtonBaseProps, keyof SolarPaginationItemProps | 'children' | 'ref'> {
  /** The page's number. */
  children: ReactNode;
  /** Where it goes: it is a link. */
  href?: string;
}

export const PaginationItem = forwardRef<HTMLButtonElement, PaginationItemProps>(
  function PaginationItem({ selected = false, disabled = false, children, sx, ...rest }, ref) {
    const look = { selected, disabled };
    const parts = solarPaginationItemCompose(look);
    return (
      <ButtonBase
        ref={ref}
        aria-current={selected ? 'page' : undefined}
        aria-label={typeof children === 'number' || typeof children === 'string' ? \`Page \${children}\` : undefined}
        {...rest}
        disabled={disabled}
        disableRipple
        sx={[solarPaginationItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', { prefix: '${P}', tree: TREE, parts, text: { page: children } })}
      </ButtonBase>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the page’s fill and ring by state, and its number’s ink, read cell by cell',
        about: `Bespoke: one page of a SolarPagination, drawn from Figma's layer tree with [SolarLayers], pressable and focusable, named "Page 3" for a screen reader; the [selected] one is the current page, announced selected. Its own 24 × 24 box is its target: the pages sit 4px apart. Use it inside a SolarPagination.`,
        params: `required this.page,
required this.onPressed,`,
        fields: `/// The page's number.
final int page;

/// Called when it is chosen; null disables it.
final VoidCallback? onPressed;`,
        control: {
          onPressed: 'disabled ? null : onPressed',
          semantics: 'selected: selected,',
          // The pages sit 4px apart: each one's box is its target.
          target: false,
        },
        text: "{'page': '$page'}",
        // Named "Page 3", its figure not read again; still a button, and selected where it is.
        builders: "{'page': (layer) => ExcludeSemantics(child: layer)}",
        wrap: `Semantics(label: 'Page $page', child: mark)`,
      });
    },
  },
};
