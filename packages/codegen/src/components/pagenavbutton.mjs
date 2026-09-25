/**
 * SOLAR PageNavButton, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * The previous or next button of a Page Navigator: MUI's ButtonBase on the web, drawn and pressable
 * in Flutter, its arrow and words drawn by the shared layer helpers.
 */

import {
  drawnFlutter,
  drawnResets,
  iconsOf,
  reactIcon,
  treeConsts,
} from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const P = 'SolarPageNavButton';

const requireLayers = (spec) => {
  if (spec.api.direction?.values?.join() !== 'prev,next')
    throw new Error('PageNavButton: its direction is not prev or next');
  for (const layer of ['iconArrowLeft', 'label', 'iconArrowRight'])
    if (!spec.layers[layer])
      throw new Error(`PageNavButton: the IR has no ${layer} layer`);
};

export default {
  name: 'PageNavButton',
  mui: {
    // The shell draws every layer itself, inside MUI's ButtonBase, each with a class of its own.
    slots: 'drawn',
    // A 44 × 44 target around it, which takes no room; its arrows mirrored by the layout's
    // direction.
    resets: drawnResets('PageNavButton', {
      display: 'flex',
      borderStyle: 'solid',
      [`& .${P}--iconArrowLeft, & .${P}--iconArrowRight`]: { flexShrink: '0' },
      [`&:dir(rtl) .${P}--iconArrowLeft, &:dir(rtl) .${P}--iconArrowRight`]: {
        transform: 'scaleX(-1)',
      },
      ...targetArea(),
    }),
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      disabled: '&.Mui-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const icons = iconsOf(spec);
      return `/**
 * SOLAR PageNavButton.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarPageNavButtonStyle\` and \`solarPageNavButtonCompose\` in
 * \`@bwp-web/styles/mui\`: the button's fill, edge and ring by state, and its words' and arrow's ink.
 *
 * The previous or next button of a PageNavigator: MUI's ButtonBase, its arrow before "Previous" or
 * after "Next" (its children replace the words, which SOLAR asks to keep), disabled at the ends of
 * the sequence rather than hidden. Its arrows are mirrored in a right-to-left layout. The app must
 * load \`@bwp-web/styles/tokens.css\`.
 */

import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { ${[...new Set(icons.map((i) => i.react))].sort().join(', ')} } from '@bwp-web/assets';
import { forwardRef, type ReactNode } from 'react';
import {
  solarPageNavButtonCompose,
  solarPageNavButtonStyle,
  type SolarPageNavButtonProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface PageNavButtonProps
  extends SolarPageNavButtonProps,
    Omit<ButtonBaseProps, keyof SolarPageNavButtonProps | 'children' | 'ref'> {
  /** Its words, "Previous" or "Next" by its direction. */
  children?: ReactNode;
}

export const PageNavButton = forwardRef<HTMLButtonElement, PageNavButtonProps>(
  function PageNavButton({ direction = 'prev', disabled = false, children, sx, ...rest }, ref) {
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
          prefix: '${P}',
          tree: TREE, slots: SLOTS,
          parts,
          text: { label: children ?? (direction === 'next' ? 'Next' : 'Previous') },
          icons: { ${icons.map((i) => `${i.layer}: ${reactIcon(i, spec)}`).join(', ')} },
        })}
      </ButtonBase>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the button’s fill, edge and ring by state, and its words’ and arrow’s ink, read cell by cell',
        about: `Bespoke: the previous or next button of a SolarPageNavigator, drawn from Figma's layer tree with [SolarLayers], pressable and focusable: its arrow before "Previous" or after "Next" ([label] replaces the words, which SOLAR asks to keep), disabled at the ends of the sequence rather than hidden. Its arrows are mirrored in a right-to-left layout.`,
        params: `required this.onPressed,
this.label,`,
        fields: `/// Called when it is chosen; null disables it.
final VoidCallback? onPressed;

/// Its words, "Previous" or "Next" by its direction.
final String? label;`,
        control: {
          onPressed: 'disabled ? null : onPressed',
          semantics: '',
        },
        text: "{'label': label ?? (direction == SolarPageNavButtonDirection.next ? 'Next' : 'Previous')}",
        wrap: `Directionality.of(context) == TextDirection.rtl
        ? Transform.flip(flipX: true, child: mark)
        : mark`,
      });
    },
  },
};
