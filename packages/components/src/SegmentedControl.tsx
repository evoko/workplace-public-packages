/**
 * SOLAR Segmented Control.
 *
 * Scaffolded once by `npm run solar:scaffold "Segmented Control"` from
 * spec/components/segmented-control.json, and owned by developers from then on: change it freely.
 * What it looks like is not here. That is the recipe, `solarSegmentedControlStyle` and
 * `solarSegmentedControlCompose` in `@bwp-web/styles/mui`: the track, and the label and helper's
 * text styles, by size.
 *
 * Two to five SegmentedControlItems of its size, one always chosen, committed on click: a radio
 * group, whose segments are native radio inputs of one name, so the arrow keys move between them.
 * Its `label` names the group (a mandatory one is starred), and its `helper` says more below it.
 * For six or more choices, or for navigation, use Tabs; for on and off, a Toggle. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, useId, type ChangeEvent, type ReactNode } from 'react';
import {
  solarSegmentedControlCompose,
  solarSegmentedControlStyle,
  type SolarSegmentedControlProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { SegmentedControlContext } from './SegmentedControlItem.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: ['label', 'track', 'helper'],
  label: ['labelLabel', 'mandatory'],
  track: [
    'segmentedControlItem',
    'segmentedControlItem2',
    'segmentedControlItem3',
    'segmentedControlItem4',
    'segmentedControlItem5',
    'segmentedControlItem6',
  ],
};

export interface SegmentedControlProps
  extends
    SolarSegmentedControlProps,
    Omit<
      BoxProps,
      keyof SolarSegmentedControlProps | 'children' | 'onChange' | 'ref'
    > {
  /** Two to five SegmentedControlItems, of its size. */
  children: ReactNode;
  /** The value of the chosen segment. */
  value: string | null;
  /** Called with the value of the segment chosen. */
  onChange: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
  /** What the group chooses, above it. */
  label?: ReactNode;
  /** Whether a choice is required, which stars the label. */
  mandatory?: boolean;
  /** More about the choice, below it. */
  helper?: ReactNode;
  /** The radio group's name, for a form; one of its own where none is given. */
  name?: string;
}

export const SegmentedControl = forwardRef<
  HTMLSpanElement,
  SegmentedControlProps
>(function SegmentedControl(
  {
    size,
    children,
    value,
    onChange,
    label,
    mandatory = false,
    helper,
    name,
    sx,
    ...rest
  },
  ref,
) {
  const id = useId();
  const parts = solarSegmentedControlCompose({ size });
  // Figma hides the label and helper, which show where the caller gives them.
  const drawn = {
    ...parts,
    label: { ...parts.label, present: label != null },
    labelLabel: { ...parts.labelLabel, present: label != null },
    mandatory: { ...parts.mandatory, present: mandatory },
    helper: { ...parts.helper, present: helper != null },
  };
  return (
    <Box
      component="span"
      ref={ref}
      {...rest}
      sx={[
        solarSegmentedControlStyle({ size }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarSegmentedControl',
        tree: TREE,
        parts: drawn,
        text: {
          labelLabel: <span id={`${id}-label`}>{label}</span>,
          mandatory: <span aria-hidden>*</span>,
          helper,
        },
        content: {
          track: (
            <SegmentedControlContext.Provider
              value={{ name: name ?? id, value, onChange }}
            >
              {children}
            </SegmentedControlContext.Provider>
          ),
        },
        render: {
          track: (layer) => (
            <span
              role="radiogroup"
              aria-labelledby={label != null ? `${id}-label` : undefined}
              aria-required={mandatory || undefined}
              {...layer}
            />
          ),
        },
      })}
    </Box>
  );
});
