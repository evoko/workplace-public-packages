/**
 * Tooltip's Playground: its trigger is the "Open" button (overlay.tsx), which it describes; it
 * shows on hover or keyboard focus after its delay, as in an app, and hides as the pointer leaves or
 * on Escape, and the `open` extra follows it (logged `onOpen` and `onClose`); `open` on, from the
 * panel or the button's press, forces it shown until a hover ends or Escape. Its size, position and
 * words from their controls, its words shown by the `tooltipContent` toggle. The shell takes no
 * `open` (reported): it is MUI's Tooltip, so its open state is reached through MUI's theme default
 * props for the one Tooltip under it, which the shell does not set.
 */

import { ThemeProvider, type Theme } from '@mui/material/styles';
import { Tooltip, type TooltipProps } from '../../src/Tooltip.js';
import { overlayOf } from './overlay.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const overlay = overlayOf(p);
    const words = p.text('content');
    const content = p.flag('tooltipContent');
    const controlled = (outer: Theme): Theme => ({
      ...outer,
      components: {
        ...outer.components,
        MuiTooltip: {
          ...outer.components?.MuiTooltip,
          defaultProps: {
            ...outer.components?.MuiTooltip?.defaultProps,
            open: overlay.open,
            onOpen: () => {
              p.set('open', true);
              p.log('onOpen');
            },
            onClose: () => overlay.close(),
          },
        },
      },
    });
    return (
      <ThemeProvider theme={controlled}>
        <Tooltip
          size={p.choice<NonNullable<TooltipProps['size']>>('size')}
          position={p.choice<NonNullable<TooltipProps['position']>>('position')}
          title={content ? words : ''}
        >
          {overlay.trigger}
        </Tooltip>
      </ThemeProvider>
    );
  },
} satisfies PlaygroundBuilder;
