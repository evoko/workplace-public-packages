/**
 * SOLAR Link, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * MUI's Link on the web, its label and icons drawn inside it by the shared layer helpers; drawn and
 * pressable in Flutter, announced as a link.
 */

import { drawnFlutter, drawnResets, treeConsts } from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const slot of ['leadingIcon', 'trailingIcon'])
    if (!spec.slots[slot]) throw new Error(`Link: the IR has no ${slot} slot`);
  if (spec.layers.label?.type !== 'TEXT')
    throw new Error('Link: the IR has no label text');
};

export default {
  name: 'Link',
  mui: {
    // The shell draws every layer itself, inside MUI's <a>, each with a class of its own.
    slots: 'drawn',
    // A caller's icon fills its slot, which the recipe sizes and colours; MUI's own outline on
    // keyboard focus gives way to SOLAR's ring.
    resets: drawnResets('Link', {
      '& .SolarLink-leadingIcon > svg, & .SolarLink-trailingIcon > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      '&.Mui-focusVisible': { outline: 'none' },
      // A 44 × 44 target around the words (shells/target.mjs).
      ...targetArea(),
    }),
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      disabled: '&.SolarLink-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // Flutter disables it as its own controls: by a null onPressed.
  api: {
    flutter: { disabled: 'onPressed' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Link.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarLinkStyle\` in \`@bwp-web/styles/mui\`: each size's text style, underlined on
 * hover, its colours by state, and its icons' sizes.
 *
 * For navigation, inside the product or out of it; an action that changes something is a Button.
 * It wraps MUI's Link, an <a>, with its label and icons drawn from Figma's layer tree
 * (\`internal/layers.tsx\`). A leading icon says internal (a chevron), a trailing one outbound (an
 * external-link arrow); one of the two, not both. A disabled link is no link: it keeps its text,
 * loses its href, and says it is disabled. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import MuiLink, { type LinkProps as MuiLinkProps } from '@mui/material/Link';
import { forwardRef, type ReactNode } from 'react';
import {
  solarLinkCompose,
  solarLinkStyle,
  type SolarLinkProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface LinkProps
  extends SolarLinkProps,
    Omit<
      MuiLinkProps,
      keyof SolarLinkProps | 'children' | 'color' | 'underline' | 'variant' | 'ref'
    > {
  /** The link's words, which say where it goes ("Read the release notes", not "click here"). */
  children: ReactNode;
  /** An icon before the words: internal navigation. */
  leadingIcon?: ReactNode;
  /** An icon after the words: outbound, or a new tab. */
  trailingIcon?: ReactNode;
}

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { ${api.join(', ')}, children, leadingIcon, trailingIcon, href, className, sx, ...rest },
  ref,
) {
  const parts = solarLinkCompose({ ${api.join(', ')} });
  // A slot left empty is not drawn.
  const drawn = {
    ...parts,
    leadingIcon: { ...parts.leadingIcon, present: leadingIcon != null },
    trailingIcon: { ...parts.trailingIcon, present: trailingIcon != null },
  };
  return (
    <MuiLink
      ref={ref}
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      className={[disabled ? 'SolarLink-disabled' : null, className].filter(Boolean).join(' ') || undefined}
      {...rest}
      underline="none"
      sx={[solarLinkStyle({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'SolarLink',
        tree: TREE, slots: SLOTS,
        parts: drawn,
        text: { label: children },
        icons: {
          leadingIcon: <span>{leadingIcon}</span>,
          trailingIcon: <span>{trailingIcon}</span>,
        },
      })}
    </MuiLink>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        disabledBy: 'onPressed',
        look: 'each size’s text style, underlined on hover, its colours by state, and its icons’ sizes, read cell by cell',
        about: `Bespoke: Flutter has no link. Its words and icons are drawn from Figma's layer tree with
[SolarLayers], pressable, and announced as a link. For navigation; an action that changes
something is a SolarButton. A leading icon says internal (a chevron), a trailing one outbound;
one of the two, not both.`,
        params: `required this.label,
this.leadingIcon,
this.trailingIcon,`,
        fields: `/// The link's words, which say where it goes.
final String label;

/// An icon before the words: internal navigation.
final Widget? leadingIcon;

/// An icon after the words: outbound, or a new tab.
final Widget? trailingIcon;`,
        pressable: '!disabled',
        link: true,
        text: "{'label': label}",
        slots: "{'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon}",
        // A slot left empty is not drawn.
        present: (recipe) => `switch (l) {
          'leadingIcon' => leadingIcon != null,
          'trailingIcon' => trailingIcon != null,
          _ => ${recipe},
        }`,
      });
    },
  },
};
