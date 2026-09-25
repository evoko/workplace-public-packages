/**
 * SOLAR TableFooter.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTableFooterTree` and `solarTableFooterSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarTableFooterStyle` and `solarTableFooterCompose` in
 * `@bwp-web/styles/mui`: the strip's padding and gaps, and the words' text style.
 *
 * The strip under a Table, drawn from Figma's layer tree (`internal/layers.tsx`): how many rows a
 * page shows (the caller's SOLAR Dropdown, `rowsPerPage`, and on desktop its words,
 * `rowsPerPageLabel`), the caller's Pagination (`pagination`), and an optional action: a SOLAR
 * Button on desktop (`button`), an Icon Button on mobile (`iconButton`), as Figma draws each. The
 * `breakpoint` is the app's to give (owner decision 2026-09-25). Paging is the caller's. The app
 * must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarTableFooterCompose,
  solarTableFooterStyle,
  type SolarTableFooterProps,
  solarTableFooterSlots,
  solarTableFooterTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface TableFooterProps
  extends
    SolarTableFooterProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarTableFooterProps | 'children' | 'ref'> {
  /** A SOLAR Dropdown (md): how many rows a page shows. */
  rowsPerPage?: ReactNode;
  /** The Dropdown's words, "rows per page" in the app's language; desktop only, as Figma draws it. */
  rowsPerPageLabel?: ReactNode;
  /** A SOLAR Pagination: which page. */
  pagination?: ReactNode;
  /** A SOLAR Button (md, primary): the table's action, on desktop. */
  button?: ReactNode;
  /** A SOLAR Icon Button (md, square, primary): the table's action, on mobile. */
  iconButton?: ReactNode;
}

export const TableFooter = forwardRef<HTMLDivElement, TableFooterProps>(
  function TableFooter(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTableFooter), under the caller's own.
    const {
      breakpoint = 'desktop',
      rowsPerPage,
      rowsPerPageLabel,
      pagination,
      button,
      iconButton,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarTableFooter');
    const look = { breakpoint };
    const composed = solarTableFooterCompose(look);
    // A slot left empty is not drawn.
    const given = (layer: keyof typeof composed, node: ReactNode) => ({
      ...composed[layer],
      present: composed[layer].present && node != null,
    });
    const parts = {
      ...composed,
      rowsPerPage: given('rowsPerPage', rowsPerPage),
      rowsPerPageMobile: given('rowsPerPageMobile', rowsPerPage),
      rowsPerPageLabel: given('rowsPerPageLabel', rowsPerPageLabel),
      pagination: given('pagination', pagination),
      paginationMobile: given('paginationMobile', pagination),
      button: given('button', button),
      iconButton: given('iconButton', iconButton),
    };
    const held = (node: ReactNode) =>
      function Held({
        className: cls,
        style,
      }: {
        className: string;
        style?: object;
      }) {
        return (
          <span className={cls} style={style}>
            {node}
          </span>
        );
      };
    return (
      <Box
        ref={ref}
        {...rest}
        sx={[solarTableFooterStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarTableFooter',
          tree: solarTableFooterTree,
          slots: solarTableFooterSlots,
          parts,
          text: { rowsPerPageLabel },
          render: {
            rowsPerPage: held(rowsPerPage),
            rowsPerPageMobile: held(rowsPerPage),
            pagination: held(pagination),
            paginationMobile: held(pagination),
            button: held(button),
            iconButton: held(iconButton),
          },
        })}
      </Box>
    );
  },
);
