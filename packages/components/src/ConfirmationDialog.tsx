/**
 * SOLAR ConfirmationDialog.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarConfirmationDialogTree` and `solarConfirmationDialogSlots` beside the recipe. What it looks
 * like is not here. That is the recipe, `solarConfirmationDialogStyle` and
 * `solarConfirmationDialogCompose` in `@bwp-web/styles/mui`: the surface, its padding and its
 * words' text styles.
 *
 * A dialog for an action that needs explicit approval, as the description says, drawn from Figma's
 * layer tree (`internal/layers.tsx`): its `title`, its `description`, and its own two lg Buttons in
 * a full-width Button Group, `cancelLabel` (secondary, `onCancel`) and `confirmLabel` (primary,
 * `onConfirm`), the confirm Button danger where the `intent` is. Modal as a Dialog is, over the
 * Scrim, announced as an alert dialog named by its title and described by its description; Escape
 * and a click on the Scrim cancel. `inline` draws it in place. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarConfirmationDialogCompose,
  solarConfirmationDialogStyle,
  type SolarConfirmationDialogProps,
  solarConfirmationDialogSlots,
  solarConfirmationDialogTree,
} from '@bwp-web/styles/mui';
import { Button, type ButtonProps } from './Button.js';
import { ButtonGroup } from './ButtonGroup.js';
import { drawChildren } from './internal/layers.js';
import { Modal, type ModalProps } from './internal/modal.js';

export interface ConfirmationDialogProps
  extends
    SolarConfirmationDialogProps,
    Omit<ModalProps, keyof SolarConfirmationDialogProps | 'onClose'> {
  /** What it asks. */
  title: ReactNode;
  /** What happens if the action goes ahead. */
  description?: ReactNode;
  /** Its confirm Button's words. */
  confirmLabel?: ReactNode;
  /** Its cancel Button's words. */
  cancelLabel?: ReactNode;
  /** Called when the action is confirmed. */
  onConfirm?: () => void;
  /** Called when it is cancelled: its cancel Button, Escape, a click on the Scrim. */
  onCancel?: () => void;
  /** More props for its confirm Button (`autoFocus`, `loading`). */
  confirmButtonProps?: Partial<ButtonProps> & Record<`data-${string}`, string>;
  /** More props for its cancel Button. */
  cancelButtonProps?: Partial<ButtonProps> & Record<`data-${string}`, string>;
}

export const ConfirmationDialog = forwardRef<
  HTMLDivElement,
  ConfirmationDialogProps
>(function ConfirmationDialog(inProps, ref) {
  // As the app's MUI theme sets them (components.SolarConfirmationDialog), under the caller's own.
  const {
    intent = 'default',
    title,
    description,
    confirmLabel = 'Continue',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    confirmButtonProps,
    cancelButtonProps,
    open,
    inline,
    sx,
    ...rest
  } = useSolarProps(inProps, 'SolarConfirmationDialog');
  const look = { intent };
  const composed = solarConfirmationDialogCompose(look);
  const parts = {
    ...composed,
    description: {
      ...composed.description,
      present: composed.description.present && description != null,
    },
  };
  const titleId = useId();
  const descriptionId = useId();
  return (
    <Modal
      ref={ref}
      {...rest}
      open={open}
      onClose={onCancel}
      inline={inline}
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={description != null ? descriptionId : undefined}
      surface={[
        solarConfirmationDialogStyle(look),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {drawChildren('root', {
        prefix: 'SolarConfirmationDialog',
        tree: solarConfirmationDialogTree,
        slots: solarConfirmationDialogSlots,
        parts,
        text: {
          title: <span id={titleId}>{title}</span>,
          description: <span id={descriptionId}>{description}</span>,
        },
        render: {
          buttonGroup: ({ className: cls, style }) => (
            <span className={cls} style={style}>
              <ButtonGroup type="full-width">
                <Button
                  size="lg"
                  prio="secondary"
                  onClick={onCancel}
                  {...cancelButtonProps}
                >
                  {cancelLabel}
                </Button>
                <Button
                  size="lg"
                  prio="primary"
                  danger={intent === 'danger'}
                  onClick={onConfirm}
                  {...confirmButtonProps}
                >
                  {confirmLabel}
                </Button>
              </ButtonGroup>
            </span>
          ),
        },
      })}
    </Modal>
  );
});
