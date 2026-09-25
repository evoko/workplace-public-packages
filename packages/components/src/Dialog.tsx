/**
 * SOLAR Dialog.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarDialogTree` and `solarDialogSlots` beside the recipe. What it looks like is not here. That
 * is the recipe, `solarDialogStyle` and `solarDialogCompose` in `@bwp-web/styles/mui`: the
 * surface, its header and footer, and its words' text styles.
 *
 * A modal dialog centred over the Scrim, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`) in MUI's Dialog: a dialog (`role="dialog"`, `aria-modal`) labelled by its
 * `title`, the focus trapped in it, Escape and a click on the Scrim calling `onClose`, and the
 * focus back on its trigger once closed. Its type follows from what it is given (owner decision
 * 2026-09-25): an `image` makes the image dialog, its title and `description` under the picture;
 * a `stepper` (a SOLAR Stepper) the wizard; neither the default, its `icon` before its title. Its
 * content is `children`, its footer `actions` (a SOLAR Button Group), and its close button its own,
 * drawn where it is given `onClose`. `inline` draws it in place, not modal, as the visual checks
 * and a page showing a dialog's content draw it. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarDialogCompose,
  solarDialogStyle,
  type SolarDialogProps,
  solarDialogSlots,
  solarDialogTree,
} from '@bwp-web/styles/mui';
import { IconClose } from '@bwp-web/assets';
import { IconButton } from './IconButton.js';
import { drawChildren } from './internal/layers.js';
import { Modal, type ModalProps } from './internal/modal.js';

export interface DialogProps
  extends
    SolarDialogProps,
    Omit<ModalProps, keyof SolarDialogProps | 'onClose'> {
  /** Called to close it: its close button, Escape, a click on the Scrim. Given, its close button shows. */
  onClose?: () => void;
  /** What its close button says to a screen reader. */
  closeLabel?: string;
  /** Its title, which names it. */
  title: ReactNode;
  /** An icon before its title. */
  icon?: ReactNode;
  /** A SOLAR Stepper (line+text) under its title: a wizard. */
  stepper?: ReactNode;
  /** A picture over its content (an <img>, a video): an image dialog, its title under it. */
  image?: ReactNode;
  /** An image dialog's words under its title. */
  description?: ReactNode;
  /** Its content. */
  children?: ReactNode;
  /** Its footer: a SOLAR Button Group (full-width). */
  actions?: ReactNode;
}

export const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  function Dialog(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarDialog), under the caller's own.
    const {
      open = false,
      onClose,
      closeLabel = 'Close',
      title,
      icon,
      stepper,
      image,
      description,
      children,
      actions,
      inline = false,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarDialog');
    // Its type from what it is given.
    const type =
      image != null
        ? ('image' as const)
        : stepper != null
          ? ('wizard' as const)
          : ('default' as const);
    const look = { type };
    const composed = solarDialogCompose(look);
    const closes = onClose != null;
    // A slot left empty is not drawn; its close button only where it can close.
    const parts = {
      ...composed,
      icon: {
        ...composed.icon,
        present: composed.icon.present && icon != null,
      },
      leading: {
        ...composed.leading,
        present: composed.leading.present && icon != null,
      },
      close: { ...composed.close, present: composed.close.present && closes },
      imageClose: {
        ...composed.imageClose,
        present: composed.imageClose.present && closes,
      },
      description: {
        ...composed.description,
        present: composed.description.present && description != null,
      },
      actions: {
        ...composed.actions,
        present: composed.actions.present && actions != null,
      },
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
    const closeButton = (cls: string, style?: object) => (
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
    );
    const drawn = drawChildren('root', {
      prefix: 'SolarDialog',
      tree: solarDialogTree,
      slots: solarDialogSlots,
      parts,
      text: {
        title: <span id={titleId}>{title}</span>,
        imageTitle: <span id={titleId}>{title}</span>,
        description,
      },
      icons: { icon: <span aria-hidden>{icon}</span> },
      render: {
        // The picture fills its header, the close button over it; the caller's content follows
        // the image dialog's title and words.
        modalImage: ({ className: cls, style, children: own }) => (
          <div className={cls} style={style}>
            {image}
            {own}
          </div>
        ),
        content: ({ className: cls, style, children: own }) => (
          <div className={cls} style={style}>
            {own}
            {children}
          </div>
        ),
        close: ({ className: cls, style }) => closeButton(cls, style),
        imageClose: ({ className: cls, style }) => closeButton(cls, style),
        stepper: held(stepper),
        actions: held(actions),
      },
    });
    return (
      <Modal
        ref={ref}
        {...rest}
        open={open}
        onClose={onClose}
        inline={inline}
        aria-labelledby={titleId}
        surface={[solarDialogStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawn}
      </Modal>
    );
  },
);
