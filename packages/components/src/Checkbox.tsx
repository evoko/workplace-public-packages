/**
 * SOLAR Checkbox.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarCheckboxTree` and `solarCheckboxSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarCheckboxStyle` and `solarCheckboxCompose` in `@bwp-web/styles/mui`: the
 * box's fill and edge by state, and the tick and dash, Figma's own outlines.
 *
 * One choice of many, committed on click. It wraps MUI's Checkbox, a native input, with its box,
 * tick and dash drawn from Figma's layer tree (`internal/layers.tsx`). `mixed` draws the dash, for
 * a parent box whose children are partly checked, and is announced so. Give it a name: a <label>
 * around it or beside it (which toggles it), or an `aria-label`. Controlled with `checked`, or
 * not with `defaultChecked`. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiCheckbox, {
  type CheckboxProps as MuiCheckboxProps,
} from '@mui/material/Checkbox';
import { useControlled } from '@mui/material/utils';
import { forwardRef, type ReactNode } from 'react';
import {
  solarCheckboxCompose,
  solarCheckboxStyle,
  type SolarCheckboxProps,
  solarCheckboxSlots,
  solarCheckboxTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** The tick or dash, as MUI's icon: MUI hands the icon a size, which the marks do not take. */
function Marks({ children }: { children: ReactNode; fontSize?: unknown }) {
  return <>{children}</>;
}

export interface CheckboxProps
  extends
    SolarCheckboxProps,
    Omit<
      MuiCheckboxProps,
      | keyof SolarCheckboxProps
      | 'indeterminate'
      | 'icon'
      | 'checkedIcon'
      | 'indeterminateIcon'
      | 'color'
      | 'size'
      | 'ref'
    > {}

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
  function Checkbox(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarCheckbox), under the caller's own.
    const {
      checked: checkedProp,
      defaultChecked,
      mixed = false,
      disabled = false,
      onChange,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarCheckbox');
    const [on, setOn] = useControlled({
      controlled: checkedProp,
      default: Boolean(defaultChecked),
      name: 'Checkbox',
      state: 'checked',
    });
    // Figma draws a mixed box only as a checked one, so a mixed box is drawn so.
    const look = { checked: on || mixed, mixed, disabled };
    // Hover and focus draw the marks as at rest; a disabled box draws Figma's own outline of them.
    const marks = (
      <Marks>
        {drawChildren('root', {
          prefix: 'SolarCheckbox',
          tree: solarCheckboxTree,
          slots: solarCheckboxSlots,
          parts: solarCheckboxCompose(look, disabled ? 'disabled' : 'default'),
        })}
      </Marks>
    );
    return (
      <MuiCheckbox
        ref={ref}
        {...rest}
        checked={on}
        indeterminate={mixed}
        disabled={disabled}
        onChange={(event, value) => {
          setOn(value);
          onChange?.(event, value);
        }}
        disableRipple
        icon={marks}
        checkedIcon={marks}
        indeterminateIcon={marks}
        sx={[solarCheckboxStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  },
);
