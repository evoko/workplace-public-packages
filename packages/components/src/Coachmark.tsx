/**
 * SOLAR Coachmark.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarCoachmarkTree` and `solarCoachmarkSlots` beside the recipe. What it looks like is not here.
 * That is the recipe, `solarCoachmarkStyle` and `solarCoachmarkCompose` in `@bwp-web/styles/mui`:
 * the card, its words' text styles, and its connector's line, dot and place.
 *
 * One step of a guided product tour, as the description says, drawn from Figma's layer tree
 * (`internal/layers.tsx`): its `title`, `body` and `counter` ("1 / 6 steps") on the card, the
 * caller's Back and Next (`actions`, a SOLAR Button Group) under them, and a connector from the
 * card's `side` to the element the step is about (`anchorEl`), which it sits beside, the
 * connector's length off it, while `open`. A dialog that is not modal, labelled by its title, its
 * words announced politely; the focus moves to it on each step. Escape and its close button call
 * `onClose`, which ends the tour: a tour is always skippable. Which step it is, and what Back and
 * Next do, are the caller's. Without an anchor it is the card alone, drawn in place. The app must
 * load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import Popper from '@mui/material/Popper';
import { useForkRef } from '@mui/material/utils';
import { forwardRef, useEffect, useId, useRef, type ReactNode } from 'react';
import {
  solarCoachmarkCompose,
  solarCoachmarkStyle,
  type SolarCoachmarkProps,
  solarCoachmarkSlots,
  solarCoachmarkTree,
} from '@bwp-web/styles/mui';
import { IconClose } from '@bwp-web/assets';
import { NodeEnd } from './NodeEnd.js';
import { drawChildren } from './internal/layers.js';

export interface CoachmarkProps
  extends
    SolarCoachmarkProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarCoachmarkProps | 'children' | 'title' | 'ref'> {
  /** The step's title, which names it. */
  title: ReactNode;
  /** The step's words. */
  body?: ReactNode;
  /** Which step of how many, in the caller's words ("1 / 6 steps"). */
  counter?: ReactNode;
  /** Back and Next: a SOLAR Button Group (regular, two md secondary Buttons). */
  actions?: ReactNode;
  /** Ends the tour: its close button, Escape. */
  onClose?: () => void;
  /** What its close button says to a screen reader. */
  closeLabel?: string;
  /** The element the step is about; without one, the card alone is drawn in place. */
  anchorEl?: HTMLElement | null;
  /** Whether it shows, where it has an anchor. */
  open?: boolean;
}

/** The connector leaves the card's side toward the element, so the card sits on the other side. */
const PLACEMENT = { right: 'left', left: 'right' } as const;

export const Coachmark = forwardRef<HTMLDivElement, CoachmarkProps>(
  function Coachmark(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarCoachmark), under the caller's own.
    const {
      side = 'right',
      title,
      body,
      counter,
      actions,
      onClose,
      closeLabel = 'Close',
      anchorEl,
      open = false,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarCoachmark');
    const look = { side };
    const composed = solarCoachmarkCompose(look);
    // A slot left empty is not drawn; its close button only where it can close.
    const parts = {
      ...composed,
      close: {
        ...composed.close,
        present: composed.close.present && onClose != null,
      },
      body: {
        ...composed.body,
        present: composed.body.present && body != null,
      },
      counter: {
        ...composed.counter,
        present: composed.counter.present && counter != null,
      },
      actions: {
        ...composed.actions,
        present: composed.actions.present && actions != null,
      },
    };
    const titleId = useId();
    const own = useRef<HTMLDivElement>(null);
    const forked = useForkRef(ref, own);
    const shown = anchorEl === undefined || open;
    // On each step, the focus moves to the card.
    useEffect(() => {
      if (anchorEl !== undefined && open) own.current?.focus();
    }, [anchorEl, open, title, counter]);
    // Escape ends the tour, wherever the focus is: the coachmark is not modal.
    useEffect(() => {
      if (!shown || !onClose) return;
      const key = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', key);
      return () => document.removeEventListener('keydown', key);
    }, [shown, onClose]);
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
    const card = (
      <Box
        ref={forked}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        aria-live="polite"
        tabIndex={-1}
        {...rest}
        sx={[solarCoachmarkStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarCoachmark',
          tree: solarCoachmarkTree,
          slots: solarCoachmarkSlots,
          parts,
          text: { title: <span id={titleId}>{title}</span>, body, counter },
          icons: {
            close: (
              <button type="button" aria-label={closeLabel} onClick={onClose}>
                <IconClose />
              </button>
            ),
          },
          render: {
            // The connector is decorative: the words say what the step is about.
            connector: ({ className: cls, style, children: drawn }) => (
              <div className={cls} style={style} aria-hidden>
                {drawn}
              </div>
            ),
            nodeEnd: held(<NodeEnd halo />),
            actions: held(actions),
          },
        })}
      </Box>
    );
    if (anchorEl === undefined) return card;
    // The connector's length off the element, as it is drawn, so its end meets it.
    const reach = () => [
      0,
      own.current
        ?.querySelector('.SolarCoachmark--connector')
        ?.getBoundingClientRect().width ?? 0,
    ];
    return (
      <Popper
        open={open}
        anchorEl={anchorEl}
        placement={PLACEMENT[side]}
        modifiers={[{ name: 'offset', options: { offset: reach } }]}
      >
        {card}
      </Popper>
    );
  },
);
