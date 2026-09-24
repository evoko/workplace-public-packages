/**
 * SOLAR SplitButton.
 *
 * Scaffolded once by `npm run solar:scaffold SplitButton` from spec/components/splitbutton.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, `solarSplitButtonStyle` in `@bwp-web/styles/mui`: the control's colours, border,
 * shadow and focus ring by state, its halves' padding, and the rule between them.
 *
 * The dominant action and a chevron that opens a menu of its variants (Save, Save as, Save and
 * close): two buttons in one joined control, drawn from Figma's layer tree
 * (`internal/layers.tsx`). The chevron says it opens a menu (`aria-haspopup`, `aria-expanded`
 * from `menuOpen`); the menu itself is the caller's until Dropdown. Alt+Down on the action opens
 * it too. The app must load `@bwp-web/styles/tokens.css`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { IconChevronDown } from '@bwp-web/assets';
import {
  forwardRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import {
  solarSplitButtonCompose,
  solarSplitButtonStyle,
  type SolarSplitButtonProps,
  type SolarSpinnerSize,
  type SolarSpinnerVariant,
} from '@bwp-web/styles/mui';
import { drawChildren, type DrawnLayer } from './internal/layers.js';
import { Spinner } from './Spinner.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = {
  root: ['action', 'divider', 'trigger', 'spinner'],
  action: ['label'],
  trigger: ['iconChevronDown'],
};

export interface SplitButtonProps
  extends
    SolarSplitButtonProps,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<
      BoxProps,
      keyof SolarSplitButtonProps | 'children' | 'onClick' | 'ref'
    > {
  /** The dominant action's label. */
  children: ReactNode;
  /** The dominant action. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Opens the menu of the action's variants, from the chevron or Alt+Down on the action. */
  onMenuOpen?: () => void;
  /** Whether that menu is open, for the chevron's `aria-expanded`. */
  menuOpen?: boolean;
  /** The chevron's accessible name. */
  menuLabel?: string;
}

export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(
  function SplitButton(
    {
      variant,
      size,
      disabled,
      loading,
      children,
      onClick,
      onMenuOpen,
      menuOpen = false,
      menuLabel = 'More options',
      className,
      sx,
      ...rest
    },
    ref,
  ) {
    const busy = Boolean(loading && !disabled);
    const inactive = Boolean(disabled) || busy;
    const parts = solarSplitButtonCompose(
      { variant, size, disabled, loading },
      busy ? 'loading' : 'default',
    );
    const spinner = solarSplitButtonCompose(
      { variant, size, disabled, loading },
      'loading',
    ).spinner;
    // What the loading state hides keeps its room, so the control does not resize.
    const kept = { ...parts };
    for (const half of ['action', 'divider', 'trigger'])
      kept[half] = { ...parts[half], present: true };
    const shown = (layer: string) =>
      parts[layer]?.present === false
        ? { visibility: 'hidden' as const }
        : undefined;
    const openMenu = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'ArrowDown') {
        event.preventDefault();
        onMenuOpen?.();
      }
    };
    return (
      <Box
        component="div"
        ref={ref}
        role="group"
        aria-busy={busy || undefined}
        className={
          [
            disabled ? 'SolarSplitButton-disabled' : null,
            busy ? 'SolarSplitButton-loading' : null,
            className,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        {...rest}
        sx={[
          solarSplitButtonStyle({ variant, size, disabled, loading }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarSplitButton',
          tree: TREE,
          parts: kept,
          text: { label: children },
          icons: { iconChevronDown: <IconChevronDown /> },
          render: {
            action: ({ className: c, style, children: inner }: DrawnLayer) => (
              <ButtonBase
                className={c}
                style={{ ...style, ...shown('action') }}
                disabled={inactive}
                disableRipple
                onClick={onClick}
                onKeyDown={openMenu}
              >
                {inner}
              </ButtonBase>
            ),
            divider: ({ className: c, style }: DrawnLayer) => (
              <span
                className={c}
                style={{ ...style, ...shown('divider') }}
                aria-hidden
              />
            ),
            trigger: ({ className: c, style, children: inner }: DrawnLayer) => (
              <ButtonBase
                className={c}
                style={{ ...style, ...shown('trigger') }}
                disabled={inactive}
                disableRipple
                aria-label={menuLabel}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => onMenuOpen?.()}
              >
                {inner}
              </ButtonBase>
            ),
            spinner: ({ className: c }: DrawnLayer) =>
              busy ? (
                <span className={c}>
                  <Spinner
                    size={spinner['variant.size'] as SolarSpinnerSize}
                    variant={spinner['variant.style'] as SolarSpinnerVariant}
                  />
                </span>
              ) : null,
          },
        })}
      </Box>
    );
  },
);
