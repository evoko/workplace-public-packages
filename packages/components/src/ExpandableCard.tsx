/**
 * SOLAR Expandable Card.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarExpandableCardTree` and `solarExpandableCardSlots` beside the recipe. What it looks like is
 * not here. That is the recipe, `solarExpandableCardStyle` and `solarExpandableCardCompose` in
 * `@bwp-web/styles/mui`: the card's edge, shadow and focus ring by state, its header and content,
 * collapsed and expanded.
 *
 * A card whose content shows on demand: its header (the `title` and a chevron) is a button that
 * shows and hides the content under it (the `description`, in Figma's words' look, then the
 * caller's children), announced expanded or collapsed. The card is hovered and focused as its
 * header is. `expanded` and `onExpandedChange` hold whether it is expanded, where the caller keeps
 * it; `defaultExpanded` where it does not. Drawn from Figma's layer tree (`internal/layers.tsx`).
 * The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useControlled } from '@mui/material/utils';
import { IconChevronDown, IconChevronUp } from '@bwp-web/assets';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarExpandableCardCompose,
  solarExpandableCardStyle,
  type SolarExpandableCardProps,
  solarExpandableCardSlots,
  solarExpandableCardTree,
} from '@bwp-web/styles/mui';
import { drawChildren, type DrawnLayer } from './internal/layers.js';

export interface ExpandableCardProps
  extends
    SolarExpandableCardProps,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<BoxProps, keyof SolarExpandableCardProps | 'title' | 'ref'> {
  /** What the card is about: its header's words, which name its button. */
  title: ReactNode;
  /** The content's words, in the look Figma draws them. */
  description?: ReactNode;
  /** The caller's content, after the description. */
  children?: ReactNode;
  /** Whether it starts expanded, where `expanded` does not say. */
  defaultExpanded?: boolean;
  /** Called with whether it is to be expanded, as its header is pressed. */
  onExpandedChange?: (expanded: boolean) => void;
}

export const ExpandableCard = forwardRef<HTMLDivElement, ExpandableCardProps>(
  function ExpandableCard(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarExpandableCard), under the caller's own.
    const {
      expanded: expandedProp,
      defaultExpanded = false,
      onExpandedChange,
      title,
      description,
      children,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarExpandableCard');
    const [expanded, setExpanded] = useControlled({
      controlled: expandedProp,
      default: defaultExpanded,
      name: 'ExpandableCard',
      state: 'expanded',
    });
    const id = useId();
    const composed = solarExpandableCardCompose({ expanded });
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      description: {
        ...composed.description,
        present: composed.description?.present !== false && description != null,
      },
    };
    const toggle = () => {
      setExpanded(!expanded);
      onExpandedChange?.(!expanded);
    };
    return (
      <Box
        ref={ref}
        {...rest}
        sx={[
          solarExpandableCardStyle({ expanded }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {drawChildren('root', {
          prefix: 'SolarExpandableCard',
          tree: solarExpandableCardTree,
          slots: solarExpandableCardSlots,
          parts,
          text: { title, description },
          icons: {
            iconChevronDown: <IconChevronDown />,
            iconChevronUp: <IconChevronUp />,
          },
          render: {
            // The header is the disclosure's button, naming the content it shows.
            header: ({ className: c, style, children: drawn }: DrawnLayer) => (
              <ButtonBase
                className={c}
                style={style}
                disableRipple
                aria-expanded={expanded}
                aria-controls={expanded ? `${id}-content` : undefined}
                onClick={toggle}
              >
                {drawn}
              </ButtonBase>
            ),
            // The content: Figma's description, then the caller's children.
            content: ({ className: c, style, children: drawn }: DrawnLayer) => (
              <div id={`${id}-content`} className={c} style={style}>
                {drawn}
                {children}
              </div>
            ),
          },
        })}
      </Box>
    );
  },
);
