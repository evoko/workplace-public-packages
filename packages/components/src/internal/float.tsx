/**
 * A menu's surface, floating: under the element that opened it (a Dropdown Menu's trigger), or at a
 * point (a Context Menu's, where the pointer was), in MUI's Popover, which brings the page's top
 * layer, Escape and a click outside to close it, the focus held in it while open, and the focus
 * back on the trigger once closed. Without either, the surface draws in place, as the visual checks
 * and a picker that holds its own popup draw it.
 *
 * Hand written and internal: the menus share it. The Popover's paper gives way to the surface,
 * which draws the menu's fill, edge and shadow itself: no fill, shadow or corner of its own, and
 * nothing clipped, so the surface's shadow shows.
 */

import Popover from '@mui/material/Popover';
import Popper, { type PopperProps } from '@mui/material/Popper';
import type { ReactElement } from 'react';

export interface Floating {
  /** Floats the menu under this element, the trigger that opened it. */
  anchorEl?: HTMLElement | null;
  /** Floats the menu at this point on the page, in pixels (a pointer's, for a context menu). */
  anchorPosition?: { top: number; left: number };
  /** Whether a floating menu is open. */
  open?: boolean;
  /** Called to close a floating menu: Escape, a click outside, Tab, or a choice. */
  onClose?: () => void;
  /**
   * Floats it without taking the focus, in MUI's Popper, which neither holds the focus nor closes
   * it: a combobox's suggestions, which its input keeps the focus and the keyboard for.
   */
  keepFocus?: boolean;
  /** More of the Popper's props, where it keeps the focus (`disablePortal`). */
  popperProps?: Partial<PopperProps>;
}

/** Whether the menu floats: given something to float from. */
export const floats = (f: Floating) =>
  f.anchorEl !== undefined || f.anchorPosition !== undefined;

/** The surface, floating where it is given something to float from, and in place otherwise. */
export function Float({
  anchorEl,
  anchorPosition,
  open = false,
  onClose,
  keepFocus = false,
  popperProps,
  children,
}: Floating & { children: ReactElement }) {
  if (!floats({ anchorEl, anchorPosition })) return children;
  if (keepFocus)
    return (
      <Popper
        placement="bottom-start"
        {...popperProps}
        open={open && anchorEl != null}
        anchorEl={anchorEl}
      >
        {children}
      </Popper>
    );
  return (
    <Popover
      open={open && (anchorPosition !== undefined || anchorEl != null)}
      onClose={onClose}
      {...(anchorPosition
        ? { anchorReference: 'anchorPosition' as const, anchorPosition }
        : {
            anchorEl,
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' } as const,
            transformOrigin: { vertical: 'top', horizontal: 'left' } as const,
          })}
      slotProps={{
        paper: {
          sx: {
            background: 'none',
            boxShadow: 'none',
            borderRadius: 0,
            overflow: 'visible',
          },
        },
      }}
    >
      {children}
    </Popover>
  );
}
