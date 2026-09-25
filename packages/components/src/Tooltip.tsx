/**
 * SOLAR Tooltip.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarTooltipTree` and `solarTooltipSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarTooltipStyle` and `solarTooltipCompose` in `@bwp-web/styles/mui`: the
 * bubble, its words' text style, and its arrow's shape and place.
 *
 * A brief label shown on hover or keyboard focus, as the description says, drawn from Figma's layer
 * tree (`internal/layers.tsx`): its words (`title`) in a bubble, its arrow pointing at its trigger
 * (`children`) from the side `position` names, top by default; `size` sm for an icon button's
 * label, md for a few words. It is MUI's Tooltip: shown after a hover delay (motion.duration.slow,
 * the nearest to the description's ~500ms) or on focus, never holding the focus, and describing its
 * trigger (`aria-describedby`). Without a trigger, it is the bubble alone, drawn in place. For
 * interactive content use a Popover. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import MuiTooltip from '@mui/material/Tooltip';
import { forwardRef, type ReactElement, type ReactNode } from 'react';
import { solarTokens } from '@bwp-web/styles';
import {
  solarTooltipCompose,
  solarTooltipStyle,
  type SolarTooltipProps,
  solarTooltipSlots,
  solarTooltipTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface TooltipProps
  extends
    SolarTooltipProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarTooltipProps | 'children' | 'title' | 'ref'> {
  /** Its words: one line (sm), or about ten words (md). */
  title: ReactNode;
  /** Its trigger, which it describes; without one, the bubble alone is drawn in place. */
  children?: ReactElement;
}

/** The hover delay: the SOLAR duration nearest the description's ~500ms. */
const DELAY = Number.parseFloat(solarTokens.light['motion.duration.slow']);

const PLACEMENT = {
  top: 'top',
  right: 'right',
  bottom: 'bottom',
  left: 'left',
} as const;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarTooltip), under the caller's own.
    const {
      size = 'sm',
      position = 'top',
      title,
      children,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarTooltip');
    const look = { size, position };
    const parts = solarTooltipCompose(look);
    const bubble = (
      <Box
        ref={ref}
        {...rest}
        sx={[solarTooltipStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarTooltip',
          tree: solarTooltipTree,
          slots: solarTooltipSlots,
          parts,
          text: { content: title },
        })}
      </Box>
    );
    if (!children) return bubble;
    // The arrow reaches past the bubble to its trigger: the bubble floats that far off it.
    const reach =
      position === 'top' || position === 'bottom'
        ? Number(parts.arrow?.height ?? 0)
        : Number(parts.arrow?.width ?? 0);
    return (
      <MuiTooltip
        title={bubble}
        placement={PLACEMENT[position]}
        describeChild
        enterDelay={DELAY}
        enterNextDelay={DELAY}
        slotProps={{
          // MUI's own bubble gives way to the drawn one.
          tooltip: {
            sx: {
              backgroundColor: 'transparent',
              padding: 0,
              margin: 0,
              maxWidth: 'none',
            },
          },
          popper: {
            modifiers: [{ name: 'offset', options: { offset: [0, reach] } }],
            sx: { '& .MuiTooltip-tooltip': { margin: '0 !important' } },
          },
        }}
      >
        {children}
      </MuiTooltip>
    );
  },
);
