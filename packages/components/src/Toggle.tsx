/**
 * SOLAR Toggle.
 *
 * Scaffolded once by `npm run solar:scaffold Toggle` from spec/components/toggle.json, and owned
 * by developers from then on: change it freely. What it looks like is not here. That is the recipe,
 * `solarToggleStyle` and `solarToggleCompose` in `@bwp-web/styles/mui`: the track's fill and edge
 * by state, and the thumb's, where it sits on and off.
 *
 * A setting, on or off, that takes effect at once: no confirm, and no action (that is a Button). It
 * wraps MUI's Switch, a native input announced as a switch, with Figma's track and thumb drawn from
 * its layer tree (`internal/layers.tsx`). On and off read by the thumb's place as well as the
 * colour. Give it a name: a <label> around it or beside it (MUI's FormControlLabel), or an
 * `aria-label`. Controlled with `selected`, or not with `defaultSelected`. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import MuiSwitch, {
  type SwitchProps as MuiSwitchProps,
} from '@mui/material/Switch';
import { useControlled } from '@mui/material/utils';
import { forwardRef, type ChangeEvent } from 'react';
import {
  solarToggleCompose,
  solarToggleStyle,
  type SolarToggleProps,
} from '@bwp-web/styles/mui';
import { drawChildren, type LayerParts } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = { root: ['thumb'] };

/** Figma's thumb, drawn in MUI's thumb slot, from this variant's composition. */
function Thumb({ parts }: { parts?: Record<string, LayerParts> }) {
  return (
    <>
      {drawChildren('root', {
        prefix: 'SolarToggle',
        tree: TREE,
        parts: parts ?? {},
      })}
    </>
  );
}

export interface ToggleProps
  extends
    SolarToggleProps,
    Omit<
      MuiSwitchProps,
      | keyof SolarToggleProps
      | 'checked'
      | 'defaultChecked'
      | 'onChange'
      | 'icon'
      | 'checkedIcon'
      | 'color'
      | 'size'
      | 'edge'
      | 'ref'
    > {
  /** Whether it starts on, where `selected` does not say. */
  defaultSelected?: boolean;
  /** Called with the value a click asks for, the opposite of `selected`. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, selected: boolean) => void;
}

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle(
    {
      selected: selectedProp,
      defaultSelected,
      disabled = false,
      onChange,
      className,
      sx,
      ...rest
    },
    ref,
  ) {
    const [selected, setSelected] = useControlled({
      controlled: selectedProp,
      default: Boolean(defaultSelected),
      name: 'Toggle',
      state: 'selected',
    });
    const look = { selected, disabled };
    return (
      <MuiSwitch
        ref={ref}
        {...rest}
        checked={selected}
        disabled={disabled}
        onChange={(event, value) => {
          setSelected(value);
          onChange?.(event, value);
        }}
        disableRipple
        className={
          [disabled ? 'SolarToggle-disabled' : null, className]
            .filter(Boolean)
            .join(' ') || undefined
        }
        slots={{ thumb: Thumb }}
        slotProps={{ thumb: { parts: solarToggleCompose(look) } as object }}
        sx={[solarToggleStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      />
    );
  },
);
