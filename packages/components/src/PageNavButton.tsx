/**
 * SOLAR PageNavButton.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarPageNavButtonTree` and `solarPageNavButtonSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarPageNavButtonStyle` and `solarPageNavButtonCompose` in
 * `@bwp-web/styles/mui`: the button's fill, edge and ring by state, and its words' and arrow's ink.
 *
 * The previous or next button of a PageNavigator: MUI's ButtonBase, its arrow before "Previous" or
 * after "Next" (its children replace the words, which SOLAR asks to keep), disabled at the ends of
 * the sequence rather than hidden. Its arrows are mirrored in a right-to-left layout. The app must
 * load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { IconArrowLeft, IconArrowRight } from '@bwp-web/assets';
import { forwardRef, type ReactNode } from 'react';
import {
  solarPageNavButtonCompose,
  solarPageNavButtonStyle,
  type SolarPageNavButtonProps,
  solarPageNavButtonSlots,
  solarPageNavButtonTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

export interface PageNavButtonProps
  extends
    SolarPageNavButtonProps,
    Omit<ButtonBaseProps, keyof SolarPageNavButtonProps | 'children' | 'ref'> {
  /** Its words, "Previous" or "Next" by its direction. */
  children?: ReactNode;
}

export const PageNavButton = forwardRef<HTMLButtonElement, PageNavButtonProps>(
  function PageNavButton(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarPageNavButton), under the caller's own.
    const {
      direction = 'prev',
      disabled = false,
      children,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarPageNavButton');
    const look = { direction, disabled };
    const parts = solarPageNavButtonCompose(look);
    return (
      <ButtonBase
        ref={ref}
        {...rest}
        disabled={disabled}
        disableRipple
        sx={[solarPageNavButtonStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarPageNavButton',
          tree: solarPageNavButtonTree,
          slots: solarPageNavButtonSlots,
          parts,
          text: {
            label: children ?? (direction === 'next' ? 'Next' : 'Previous'),
          },
          icons: {
            iconArrowLeft: <IconArrowLeft />,
            iconArrowRight: <IconArrowRight />,
          },
        })}
      </ButtonBase>
    );
  },
);
