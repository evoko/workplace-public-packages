/**
 * SOLAR Radio.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarRadioTree` and `solarRadioSlots` beside the recipe. What it looks like is not here. That is
 * the recipe, `solarRadioStyle` and `solarRadioCompose` in `@bwp-web/styles/mui`: the ring's fill
 * and edge by state, and the dot, Figma's own outline.
 *
 * One choice of a group, committed on click: put two to five in MUI's RadioGroup, which checks the
 * one whose `value` is its own and names them all, and gives each a label (MUI's
 * FormControlLabel, or a <label>). A radio alone is a bug, SOLAR says; `checked` checks one
 * outside a group. It wraps MUI's Radio, a native input, with its ring and dot drawn from Figma's
 * layer tree (`internal/layers.tsx`). The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import MuiRadio, {
  type RadioProps as MuiRadioProps,
} from '@mui/material/Radio';
import { useRadioGroup } from '@mui/material/RadioGroup';
import { forwardRef, type ReactNode } from 'react';
import {
  solarRadioCompose,
  solarRadioStyle,
  type SolarRadioProps,
  solarRadioSlots,
  solarRadioTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** The dot, as MUI's icon: MUI hands the icon a size, which the dot does not take. */
function Marks({ children }: { children: ReactNode; fontSize?: unknown }) {
  return <>{children}</>;
}

export interface RadioProps
  extends
    SolarRadioProps,
    Omit<
      MuiRadioProps,
      keyof SolarRadioProps | 'icon' | 'checkedIcon' | 'color' | 'size' | 'ref'
    > {}

export const Radio = forwardRef<HTMLButtonElement, RadioProps>(
  function Radio(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarRadio), under the caller's own.
    const {
      checked: checkedProp,
      disabled = false,
      value,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarRadio');
    const group = useRadioGroup();
    // As MUI decides it: the prop where given, and otherwise whether its group holds its value.
    const checked =
      checkedProp ??
      (group?.value != null &&
        value != null &&
        String(group.value) === String(value));
    const look = { checked, disabled };
    // Hover and focus draw the dot as at rest; a disabled radio draws Figma's own outline of it.
    const marks = (
      <Marks>
        {drawChildren('root', {
          prefix: 'SolarRadio',
          tree: solarRadioTree,
          slots: solarRadioSlots,
          parts: solarRadioCompose(look, disabled ? 'disabled' : 'default'),
        })}
      </Marks>
    );
    return (
      <MuiRadio
        ref={ref}
        {...rest}
        value={value}
        checked={checkedProp}
        disabled={disabled}
        disableRipple
        icon={marks}
        checkedIcon={marks}
        sx={[solarRadioStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  },
);
