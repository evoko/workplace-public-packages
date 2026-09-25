/**
 * SOLAR Option Row.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarOptionRowTree` and `solarOptionRowSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarOptionRowStyle` and `solarOptionRowCompose` in `@bwp-web/styles/mui`:
 * the row's padding and gap, and its words' text styles.
 *
 * A selection control and its words: a <label> around a SOLAR Checkbox (`control="checkbox"`, one
 * of a set, independent), Radio (`"radio"`, one of a group: inside MUI's RadioGroup, with a
 * `value`) or Toggle (`"toggle"`, a setting that applies at once), drawn from Figma's layer tree
 * (`internal/layers.tsx`). The whole row is the target and the control's name; its
 * `supportingText` describes it. The control's states are its own (`checked`, `mixed`,
 * `disabled`), and hovering the row hovers it. One control a row; for a large tappable choice
 * with an icon, use an Option Card. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, useId, type ChangeEvent, type ReactNode } from 'react';
import {
  solarOptionRowCompose,
  solarOptionRowStyle,
  type SolarOptionRowProps,
  solarOptionRowSlots,
  solarOptionRowTree,
} from '@bwp-web/styles/mui';
import { Checkbox } from './Checkbox.js';
import { drawChildren } from './internal/layers.js';
import { Radio } from './Radio.js';
import { Toggle } from './Toggle.js';

export interface OptionRowProps
  extends
    SolarOptionRowProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<
      BoxProps<'label'>,
      keyof SolarOptionRowProps | 'children' | 'onChange' | 'ref'
    > {
  /** The choice's words, which name the control. */
  children: ReactNode;
  /** A second line that says more, describing the control. */
  supportingText?: ReactNode;
  /** Whether the control is on: checked, or a Toggle selected. A Radio in a RadioGroup follows the group. */
  checked?: boolean;
  /** Whether it starts on, where `checked` does not say (a Checkbox or a Toggle). */
  defaultChecked?: boolean;
  /** A Checkbox's partly checked state, for a parent of rows partly checked. */
  mixed?: boolean;
  disabled?: boolean;
  /** Called with the value a click asks for. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  /** The value a form sends, and a Radio's in its group. */
  value?: string;
  /** The form field's name. */
  name?: string;
}

export const OptionRow = forwardRef<HTMLLabelElement, OptionRowProps>(
  function OptionRow(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarOptionRow), under the caller's own.
    const {
      control,
      children,
      supportingText,
      checked,
      defaultChecked,
      mixed,
      disabled,
      onChange,
      value,
      name,
      className,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarOptionRow');
    const look = { control };
    const composed = solarOptionRowCompose(look);
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      supportingText: {
        ...composed.supportingText,
        present: supportingText != null,
      },
    };
    const described = useId();
    const describedBy = supportingText != null ? described : undefined;
    const own = { disabled, name, value };
    const box = ({
      className: cls,
      style,
    }: {
      className: string;
      style?: object;
    }) => (
      <span className={cls} style={style}>
        {control === 'radio' ? (
          <Radio
            {...own}
            checked={checked}
            onChange={onChange}
            slotProps={{ input: { 'aria-describedby': describedBy } }}
          />
        ) : (
          <Checkbox
            {...own}
            checked={checked}
            defaultChecked={defaultChecked}
            mixed={mixed}
            onChange={onChange}
            slotProps={{ input: { 'aria-describedby': describedBy } }}
          />
        )}
      </span>
    );
    return (
      <Box
        component="label"
        ref={ref}
        {...rest}
        // Its control takes its hover (the controls' recipes read the scope).
        className={['SolarStatesScope', className].filter(Boolean).join(' ')}
        sx={[solarOptionRowStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarOptionRow',
          tree: solarOptionRowTree,
          slots: solarOptionRowSlots,
          parts,
          // The words name the control; the second line describes it, and so is left out of its
          // name.
          text: {
            label: children,
            supportingText: (
              <span id={described} aria-hidden>
                {supportingText}
              </span>
            ),
          },
          render: {
            control: box,
            toggle: ({ className: cls, style }) => (
              <span className={cls} style={style}>
                <Toggle
                  {...own}
                  selected={checked}
                  defaultSelected={defaultChecked}
                  onChange={onChange}
                  slotProps={{ input: { 'aria-describedby': describedBy } }}
                />
              </span>
            ),
          },
        })}
      </Box>
    );
  },
);
