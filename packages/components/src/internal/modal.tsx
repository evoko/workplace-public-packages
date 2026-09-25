/**
 * A dialog's surface, modal: in MUI's Dialog, which brings the page's top layer, the focus trapped
 * in it, Escape and a click on the backdrop to close it, and the focus back on the trigger once
 * closed, over SOLAR's Scrim. Or, `inline`, the surface drawn in place, as the visual checks and a
 * page showing a dialog's content draw it.
 *
 * Hand written and internal: Dialog, ConfirmationDialog and Split Dialog share it. MUI's paper
 * takes the surface's recipe as its own style, so its fill, corners and shadow are SOLAR's.
 */

import Box from '@mui/material/Box';
import MuiDialog, {
  type DialogProps as MuiDialogProps,
} from '@mui/material/Dialog';
import { forwardRef, type ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';
import { Scrim } from '../Scrim.js';

export interface ModalProps extends Omit<
  MuiDialogProps,
  'children' | 'title' | 'open' | 'onClose' | 'maxWidth' | 'fullWidth'
> {
  /** Whether it shows; a modal surface is shown while true. */
  open?: boolean;
  /** Called to close it: Escape, a click on the Scrim, the surface's own close button. */
  onClose?: () => void;
  /** Draws it in place, not modal. */
  inline?: boolean;
}

/** The surface, modal or in place: `surface` its recipe's style, `role` what it is announced as. */
export const Modal = forwardRef<
  HTMLDivElement,
  ModalProps & {
    surface: SxProps<Theme>;
    role?: 'dialog' | 'alertdialog';
    children: ReactNode;
  }
>(function Modal(
  {
    open = false,
    onClose,
    inline = false,
    surface,
    role = 'dialog',
    children,
    // The surface's own style is the caller's too, given in `surface`.
    sx: _sx,
    ...rest
  },
  ref,
) {
  if (inline)
    return (
      <Box
        ref={ref}
        role={role}
        aria-labelledby={rest['aria-labelledby']}
        aria-describedby={rest['aria-describedby']}
        className={rest.className}
        style={rest.style}
        sx={surface}
      >
        {children}
      </Box>
    );
  return (
    <MuiDialog
      ref={ref}
      open={open}
      onClose={onClose}
      maxWidth={false}
      slots={{ backdrop: Scrim }}
      {...rest}
      slotProps={{ ...rest.slotProps, paper: { role, sx: surface } }}
    >
      {children}
    </MuiDialog>
  );
});
