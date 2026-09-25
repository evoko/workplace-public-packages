/**
 * SOLAR Split Dialog.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarSplitDialogTree` and `solarSplitDialogSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarSplitDialogStyle` and `solarSplitDialogCompose` in
 * `@bwp-web/styles/mui`: the surface, its header, its panes and its foot.
 *
 * A modal dialog with two panes, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`) in MUI's Dialog: its `title` (and an `icon` before it), the caller's
 * `left` and `right` content, and its `actions` (a SOLAR Button Group) across its foot, or, for
 * `cta="regular"`, under the left pane. The same contract as Dialog: a dialog labelled by its
 * title, the focus trapped in it, Escape and a click on the Scrim calling `onClose`, its close
 * button drawn where it is given `onClose`. `inline` draws it in place. The app must load
 * `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarSplitDialogCompose,
  solarSplitDialogStyle,
  type SolarSplitDialogProps,
  solarSplitDialogSlots,
  solarSplitDialogTree,
} from '@bwp-web/styles/mui';
import { IconClose } from '@bwp-web/assets';
import { IconButton } from './IconButton.js';
import { drawChildren } from './internal/layers.js';
import { Modal, type ModalProps } from './internal/modal.js';

export interface SplitDialogProps
  extends
    SolarSplitDialogProps,
    Omit<ModalProps, keyof SolarSplitDialogProps | 'onClose'> {
  /** Called to close it: its close button, Escape, a click on the Scrim. Given, its close button shows. */
  onClose?: () => void;
  /** What its close button says to a screen reader. */
  closeLabel?: string;
  /** Its title, which names it. */
  title: ReactNode;
  /** An icon before its title. */
  icon?: ReactNode;
  /** The left pane's content: a navigation, a list, a form. */
  left?: ReactNode;
  /** The right pane's content: results, a summary, help. */
  right?: ReactNode;
  /** Its actions: a SOLAR Button Group, full-width across its foot, or regular under the left pane. */
  actions?: ReactNode;
}

export const SplitDialog = forwardRef<HTMLDivElement, SplitDialogProps>(
  function SplitDialog(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarSplitDialog), under the caller's own.
    const {
      cta = 'full-width',
      open,
      onClose,
      closeLabel = 'Close',
      title,
      icon,
      left,
      right,
      actions,
      inline,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarSplitDialog');
    const look = { cta };
    const composed = solarSplitDialogCompose(look);
    // A slot left empty is not drawn; its close button only where it can close.
    const given = (layer: keyof typeof composed, node: unknown) => ({
      ...composed[layer],
      present: composed[layer].present && node != null,
    });
    const parts = {
      ...composed,
      icon: given('icon', icon),
      leading: given('leading', icon),
      close: given('close', onClose),
      actions: given('actions', actions),
      actionsRegular: given('actionsRegular', actions),
    };
    const titleId = useId();
    const held = (node: ReactNode) =>
      function Held({
        className: cls,
        style,
      }: {
        className: string;
        style?: object;
      }) {
        return (
          <span className={cls} style={style}>
            {node}
          </span>
        );
      };
    return (
      <Modal
        ref={ref}
        {...rest}
        open={open}
        onClose={onClose}
        inline={inline}
        aria-labelledby={titleId}
        surface={[
          solarSplitDialogStyle(look),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarSplitDialog',
          tree: solarSplitDialogTree,
          slots: solarSplitDialogSlots,
          parts,
          text: { title: <span id={titleId}>{title}</span> },
          icons: { icon: <span aria-hidden>{icon}</span> },
          content: { left, leftRegular: left, right },
          render: {
            close: ({ className: cls, style }) => (
              <span className={cls} style={style}>
                <IconButton
                  size="md"
                  shape="round"
                  prio="tertiary"
                  icon={<IconClose />}
                  aria-label={closeLabel}
                  onClick={onClose}
                />
              </span>
            ),
            actions: held(actions),
            actionsRegular: held(actions),
          },
        })}
      </Modal>
    );
  },
);
