/**
 * SOLAR PropertyRow.
 *
 * Written by hand, and never regenerated; its layer tree and slot names are the IR's,
 * `solarPropertyRowTree` and `solarPropertyRowSlots` beside the recipe. What it looks like is not
 * here. That is the recipe, `solarPropertyRowStyle` and `solarPropertyRowCompose` in
 * `@bwp-web/styles/mui`: the row's padding and gaps, its words' text styles.
 *
 * One label–value row of a PropertyList, drawn from Figma's layer tree (`internal/layers.tsx`): an
 * optional `leading` icon, its words (`children`, and a `description`), and the control the caller
 * gives it, which carries its own states: a SOLAR `button`, `toggle`, `select`, `iconButton`,
 * `segmentedControl` or `tag`; what it is given decides its trailing, as a Column Item's content
 * does. In a PropertyList its words are a <dt> and its control a <dd>, and it takes the list's
 * in-card look. The app must load `@bwp-web/styles/tokens.css`.
 */

import { useSolarProps } from './internal/theme.js';
import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solarPropertyRowCompose,
  solarPropertyRowStyle,
  type SolarPropertyRowProps,
  solarPropertyRowSlots,
  solarPropertyRowTree,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { usePropertyList } from './PropertyList.js';

export interface PropertyRowProps
  extends
    SolarPropertyRowProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarPropertyRowProps | 'children' | 'ref'> {
  /** The property's name. */
  children: ReactNode;
  /** More about it, under its name. */
  description?: ReactNode;
  /** An icon before its words. */
  leading?: ReactNode;
  /** A SOLAR Button (md, secondary): an action row. */
  button?: ReactNode;
  /** A SOLAR Toggle: a setting row. */
  toggle?: ReactNode;
  /** A SOLAR Select (md): a choice row. */
  select?: ReactNode;
  /** A SOLAR Icon Button (md, square, secondary): an icon row. */
  iconButton?: ReactNode;
  /** A SOLAR Segmented Control (md): a mode row. */
  segmentedControl?: ReactNode;
  /** A SOLAR Tag: a status row, its value. */
  tag?: ReactNode;
}

export const PropertyRow = forwardRef<HTMLDivElement, PropertyRowProps>(
  function PropertyRow(inProps, ref) {
    // As the app's MUI theme sets them (components.SolarPropertyRow), under the caller's own.
    const {
      inCard: inCardProp = false,
      children,
      description,
      leading,
      button,
      toggle,
      select,
      iconButton,
      segmentedControl,
      tag,
      sx,
      ...rest
    } = useSolarProps(inProps, 'SolarPropertyRow');
    const list = usePropertyList();
    const inCard = list?.inCard ?? inCardProp;
    // Its trailing from the control it is given.
    const trailing =
      button != null
        ? ('action' as const)
        : toggle != null
          ? ('toggle' as const)
          : select != null
            ? ('select' as const)
            : iconButton != null
              ? ('icon-button' as const)
              : segmentedControl != null
                ? ('segmented-control' as const)
                : tag != null
                  ? ('tag' as const)
                  : ('none' as const);
    const look = { inCard, trailing };
    const composed = solarPropertyRowCompose(look);
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      leading: { ...composed.leading, present: leading != null },
      description: { ...composed.description, present: description != null },
    };
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
    // In a list its words are the term and its control the definition.
    const Term = list ? 'dt' : 'div';
    const Definition = list ? 'dd' : 'div';
    return (
      <Box
        ref={ref}
        {...rest}
        sx={[solarPropertyRowStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarPropertyRow',
          tree: solarPropertyRowTree,
          slots: solarPropertyRowSlots,
          parts,
          text: { label: children, description },
          icons: { leading: <span aria-hidden>{leading}</span> },
          render: {
            text: ({ className, style, children: words }) => (
              <Term className={className} style={style}>
                {words}
              </Term>
            ),
            trailing: ({ className, style, children: control }) => (
              <Definition className={className} style={style}>
                {control}
              </Definition>
            ),
            button: held(button),
            toggle: held(toggle),
            select: held(select),
            iconButton: held(iconButton),
            segmentedControl: held(segmentedControl),
            tag: held(tag),
          },
        })}
      </Box>
    );
  },
);
