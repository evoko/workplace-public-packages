/**
 * SOLAR Event Chip.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarEventChipTree` and `solarEventChipSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarEventChipStyle` and `solarEventChipCompose` in `@bwp-web/styles/mui`:
 * its category's stripe or fill, and its words' text styles and colours.
 *
 * One event in a calendar (a Day Cell, a week or day grid, an Agenda Row), as the description
 * says, drawn from Figma's layer tree (`internal/layers.tsx`): its `category`'s colour as a stripe
 * beside neutral words (`variant` subtle), a pale fill (tinted) or a full fill with inverse words
 * (solid); its `time` where given, a repeating event's icon (`repeating`), and its `title`, on one
 * line, cut short at the chip's end. It fills the width it is given. A styled part: what the event
 * is, and what a click on it does, are the caller's. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarEventChipCompose,
  solarEventChipStyle,
  type SolarEventChipProps,
  solarEventChipSlots,
  solarEventChipTree,
} from '@bwp-web/styles/mui';
import { IconRepeat } from '@bwp-web/assets';
import { drawChildren } from './internal/layers.js';

export interface EventChipProps
  extends
    SolarEventChipProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarEventChipProps | 'children' | 'title' | 'ref'> {
  /** The event's title. */
  title: ReactNode;
  /** When it starts, in the caller's words ("9:00"); given, it is drawn before the title. */
  time?: ReactNode;
  /** Whether the event repeats: its icon is drawn before the title. */
  repeating?: boolean;
}

export const EventChip = forwardRef<HTMLDivElement, EventChipProps>(
  function EventChip(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarEventChip), under the caller's own.
    const {
      category,
      variant,
      title,
      time,
      repeating = false,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarEventChip');
    const look = { category, variant };
    const composed = solarEventChipCompose(look);
    // A part left out is not drawn.
    const parts = {
      ...composed,
      time: { ...composed.time, present: time != null },
      repeating: { ...composed.repeating, present: repeating },
    };
    return (
      <Box
        ref={ref}
        {...rest}
        sx={[solarEventChipStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarEventChip',
          tree: solarEventChipTree,
          slots: solarEventChipSlots,
          parts,
          text: { title, time },
          // The repeat icon says it repeats to a screen reader, as its look does.
          icons: {
            repeating: (
              <span role="img" aria-label="Repeats">
                <IconRepeat />
              </span>
            ),
          },
        })}
      </Box>
    );
  },
);
