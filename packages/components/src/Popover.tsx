/**
 * SOLAR Popover.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarPopoverTree` and `solarPopoverSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarPopoverStyle` and `solarPopoverCompose` in `@bwp-web/styles/mui`: the
 * bubble, its words' text styles, and its tip's shape and place.
 *
 * An anchored overlay for rich content, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): its `title` and `body` in a bubble, and the caller's controls
 * (`children`) under them, its tip pointing at its trigger (`anchorEl`) from the side `placement`
 * names, top by default. It is MUI's Popover, shown while `open`: a dialog labelled by its title,
 * Escape and a click outside it calling `onClose`. The focus moves into it only where it holds
 * controls, and back to its trigger once it closes. Without an anchor it is the surface alone,
 * drawn in place. For a one-line hint use a Tooltip; for a list of actions a Dropdown. The app
 * must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import MuiPopover, { type PopoverOrigin } from '@mui/material/Popover';
import { forwardRef, useEffect, useId, type ReactNode } from 'react';
import {
  solarPopoverCompose,
  solarPopoverStyle,
  type SolarPopoverProps,
  solarPopoverSlots,
  solarPopoverTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface PopoverProps
  extends
    SolarPopoverProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarPopoverProps | 'children' | 'title' | 'ref'> {
  /** Its title, which names it. */
  title: ReactNode;
  /** Its words under the title. */
  body?: ReactNode;
  /** The caller's controls, under its words; given, the focus moves into it. */
  children?: ReactNode;
  /** Its trigger, which its tip points at; without one, the surface alone is drawn in place. */
  anchorEl?: HTMLElement | null;
  /** Whether it shows, where it has a trigger. */
  open?: boolean;
  /** Called to close it: Escape, a click outside it. */
  onClose?: () => void;
}

/**
 * Where it sits against its trigger: its tip hangs from the bubble's square corner, at its start,
 * so that corner meets the trigger's.
 */
const ORIGINS: Record<
  NonNullable<SolarPopoverProps['placement']>,
  { anchorOrigin: PopoverOrigin; transformOrigin: PopoverOrigin }
> = {
  top: {
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'bottom', horizontal: 'left' },
  },
  bottom: {
    anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
  },
  left: {
    anchorOrigin: { vertical: 'top', horizontal: 'left' },
    transformOrigin: { vertical: 'top', horizontal: 'right' },
  },
  right: {
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    transformOrigin: { vertical: 'top', horizontal: 'left' },
  },
};

export const Popover = forwardRef<HTMLDivElement, PopoverProps>(
  function Popover(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarPopover), under the caller's own.
    const {
      size = 'md',
      placement = 'top',
      title,
      body,
      children,
      anchorEl,
      open = false,
      onClose,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarPopover');
    const look = { size, placement };
    const composed = solarPopoverCompose(look);
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      body: {
        ...composed.body,
        present: composed.body.present && body != null,
      },
    };
    const titleId = useId();
    const controls = children != null;
    const shown = anchorEl != null && open;
    // Escape closes it though the focus stays on its trigger, where it holds no controls.
    useEffect(() => {
      if (!shown || controls || !onClose) return;
      const key = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', key);
      return () => document.removeEventListener('keydown', key);
    }, [shown, controls, onClose]);
    const surface = (
      <Box
        ref={ref}
        role="dialog"
        aria-labelledby={titleId}
        {...rest}
        sx={[solarPopoverStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarPopover',
          tree: solarPopoverTree,
          slots: solarPopoverSlots,
          parts,
          text: { title: <span id={titleId}>{title}</span>, body },
          render: {
            // The caller's controls follow its words.
            content: ({ className: cls, style, children: own }) => (
              <div className={cls} style={style}>
                {own}
                {children}
              </div>
            ),
          },
        })}
      </Box>
    );
    if (anchorEl === undefined) return surface;
    return (
      <MuiPopover
        open={shown}
        anchorEl={anchorEl}
        onClose={onClose}
        {...ORIGINS[placement]}
        disableAutoFocus={!controls}
        disableEnforceFocus={!controls}
        slotProps={{
          // MUI's own paper gives way to the drawn surface.
          paper: {
            sx: {
              backgroundColor: 'transparent',
              backgroundImage: 'none',
              boxShadow: 'none',
              borderRadius: 0,
              overflow: 'visible',
              maxWidth: 'none',
            },
          },
        }}
      >
        {surface}
      </MuiPopover>
    );
  },
);
