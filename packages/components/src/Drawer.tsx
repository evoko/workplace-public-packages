/**
 * SOLAR Drawer.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDrawerTree` and `solarDrawerSlots` beside the recipe. What it looks like is not here. That
 * is the recipe, `solarDrawerStyle` and `solarDrawerCompose` in `@bwp-web/styles/mui`: the panel,
 * its header and its content's padding.
 *
 * A panel that slides in from the viewport's end edge for a secondary task that keeps the page in
 * context, as the description says, drawn from Figma's layer tree (`internal/layers.tsx`) in MUI's
 * Drawer: a dialog labelled by its `title`, the focus trapped in it, Escape and a click on the Scrim
 * calling `onClose`, and the focus back on its trigger once closed. Its content is `children`, its
 * footer `actions` (a SOLAR Button Group), and its close button its own, drawn where it is given
 * `onClose`. `inline` draws it in place. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box from '@mui/material/Box';
import MuiDrawer, {
  type DrawerProps as MuiDrawerProps,
} from '@mui/material/Drawer';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarDrawerCompose,
  solarDrawerStyle,
  type SolarDrawerProps,
  solarDrawerSlots,
  solarDrawerTree,
} from '@bwp-web/styles/mui';
import { IconClose } from '@bwp-web/assets';
import { IconButton } from './IconButton.js';
import { drawChildren } from './internal/layers.js';
import { Scrim } from './Scrim.js';

export interface DrawerProps
  extends
    SolarDrawerProps,
    Omit<
      MuiDrawerProps,
      | keyof SolarDrawerProps
      | 'children'
      | 'title'
      | 'onClose'
      | 'anchor'
      | 'variant'
    > {
  /** Called to close it: its close button, Escape, a click on the Scrim. Given, its close button shows. */
  onClose?: () => void;
  /** What its close button says to a screen reader. */
  closeLabel?: string;
  /** Its title, which names it. */
  title: ReactNode;
  /** Its content. */
  children?: ReactNode;
  /** Its footer: a SOLAR Button Group (full-width). */
  actions?: ReactNode;
  /** Draws it in place, not modal. */
  inline?: boolean;
}

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(
  function Drawer(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarDrawer), under the caller's own.
    const {
      open = false,
      onClose,
      closeLabel = 'Close',
      title,
      children,
      actions,
      inline = false,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarDrawer');
    const composed = solarDrawerCompose({});
    // Its close button only where it can close; its footer where it is given one.
    const parts = {
      ...composed,
      close: { ...composed.close, present: onClose != null },
      cta: { ...composed.cta, present: actions != null },
    };
    const titleId = useId();
    const drawn = drawChildren('root', {
      prefix: 'SolarDrawer',
      tree: solarDrawerTree,
      slots: solarDrawerSlots,
      parts,
      text: { title: <span id={titleId}>{title}</span> },
      content: { content: children },
      render: {
        close: ({ className: cls, style }) => (
          <span className={cls} style={style}>
            <IconButton
              size="md"
              shape="square"
              prio="tertiary"
              icon={<IconClose />}
              aria-label={closeLabel}
              onClick={onClose}
            />
          </span>
        ),
        cta: ({ className: cls, style }) => (
          <span className={cls} style={style}>
            {actions}
          </span>
        ),
      },
    });
    const surface = [solarDrawerStyle({}), ...(Array.isArray(sx) ? sx : [sx])];
    if (inline)
      return (
        <Box
          ref={ref}
          role="dialog"
          aria-labelledby={titleId}
          className={rest.className}
          style={rest.style}
          sx={surface}
        >
          {drawn}
        </Box>
      );
    return (
      <MuiDrawer
        ref={ref}
        anchor="right"
        open={open}
        onClose={onClose}
        slots={{ backdrop: Scrim }}
        {...rest}
        slotProps={{
          ...rest.slotProps,
          paper: { role: 'dialog', 'aria-labelledby': titleId, sx: surface },
        }}
      >
        {drawn}
      </MuiDrawer>
    );
  },
);
