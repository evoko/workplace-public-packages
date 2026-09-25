/**
 * SOLAR RowSelect.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarRowSelectTree` and `solarRowSelectSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarRowSelectStyle` and `solarRowSelectCompose` in `@bwp-web/styles/mui`:
 * the cell's square and the header's fill.
 *
 * A Table row's select cell, drawn from Figma's layer tree (`internal/layers.tsx`): a SOLAR
 * Checkbox, centred, that selects its row, or in the header row (`header`) every row: `checked`,
 * or `mixed` where some are. It is named for what it selects (`label`). In a Row it is a cell to a
 * screen reader. Whether a row is selected is the caller's. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ChangeEvent } from 'react';
import {
  solarRowSelectCompose,
  solarRowSelectStyle,
  type SolarRowSelectProps,
  solarRowSelectSlots,
  solarRowSelectTree,
} from '@bwp-web/styles/mui';
import { Checkbox } from './Checkbox.js';
import { drawChildren } from './internal/layers.js';
import { useSolarRow } from './internal/table.js';

export interface RowSelectProps
  extends
    SolarRowSelectProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<
      BoxProps,
      keyof SolarRowSelectProps | 'children' | 'onChange' | 'ref'
    > {
  /** Whether its row is selected; in the header row, whether every row is. */
  checked?: boolean;
  /** In the header row, where some rows are selected and some not. */
  mixed?: boolean;
  disabled?: boolean;
  /** Called with the value a click asks for. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  /** What it selects, for a screen reader: "Select row" or, in the header row, "Select all rows". */
  label?: string;
}

export const RowSelect = forwardRef<HTMLDivElement, RowSelectProps>(
  function RowSelect(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarRowSelect), under the caller's own.
    const {
      header = false,
      checked = false,
      mixed = false,
      disabled,
      onChange,
      label,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarRowSelect');
    const row = useSolarRow();
    const look = { header };
    const parts = solarRowSelectCompose(look);
    return (
      <Box
        ref={ref}
        role={row ? (header ? 'columnheader' : 'cell') : undefined}
        {...rest}
        sx={[solarRowSelectStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarRowSelect',
          tree: solarRowSelectTree,
          slots: solarRowSelectSlots,
          parts,
          render: {
            checkbox: ({ className: cls, style }) => (
              <span className={cls} style={style}>
                <Checkbox
                  checked={checked}
                  mixed={mixed}
                  disabled={disabled}
                  onChange={onChange}
                  slotProps={{
                    input: {
                      'aria-label':
                        label ?? (header ? 'Select all rows' : 'Select row'),
                    },
                  }}
                />
              </span>
            ),
          },
        })}
      </Box>
    );
  },
);
